(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const canvas = $("#boardCanvas");
  const workspace = $("#workspace");
  const ctx = canvas.getContext("2d");
  const STORAGE_KEY = "nomi-whiteboard-v1";
  const SHAPE_TOOLS = new Set(["line", "arrow", "rectangle", "ellipse"]);
  const DRAW_TOOLS = new Set(["pen", "highlighter", "line", "arrow", "rectangle", "ellipse", "text", "sticky", "stamp"]);
  const PAPER_STYLES = Object.freeze({
    dots: { color: "#f7f7f5" },
    blank: { color: "#ffffff" },
    ruled: { color: "#fffdf8" },
    grid: { color: "#f4faff" },
    story: { color: "#fff6e8" }
  });
  const MIN_SCALE = 0.2;
  const MAX_SCALE = 4;

  let elements = [];
  let pages = [];
  let currentPageIndex = 0;
  let currentPaper = "dots";
  let activeStamp = "⭐";
  let tool = "select";
  let selectedId = null;
  let interaction = null;
  let pinch = null;
  let spacePressed = false;
  let gridVisible = true;
  let toastTimer = 0;
  let saveTimer = 0;
  let history = [];
  let historyIndex = -1;
  let internalClipboard = null;
  const imageCache = new Map();
  const activePointers = new Map();
  const viewport = { x: 0, y: 0, scale: 1 };
  const style = { color: "#20221f", width: 3, fill: false };

  const controls = {
    boardTitle: $("#boardTitle"),
    saveLabel: $("#saveLabel"),
    saveState: $(".save-state"),
    undo: $("#undoButton"),
    redo: $("#redoButton"),
    exportButton: $("#exportButton"),
    exportMenu: $("#exportMenu"),
    importButton: $("#importButton"),
    clearButton: $("#clearButton"),
    clearDialog: $("#clearDialog"),
    deletePageDialog: $("#deletePageDialog"),
    imageInput: $("#imageInput"),
    jsonInput: $("#jsonInput"),
    textEditor: $("#textEditor"),
    strokeWidth: $("#strokeWidth"),
    strokePreview: $("#strokePreview"),
    fillButton: $("#fillButton"),
    selectionActions: $("#selectionActions"),
    deleteButton: $("#deleteButton"),
    duplicateButton: $("#duplicateButton"),
    gridButton: $("#gridButton"),
    zoomLabel: $("#zoomResetButton"),
    stampMenu: $("#stampMenu"),
    paperMenu: $("#paperMenu"),
    paperButton: $("#paperButton"),
    prevPage: $("#prevPageButton"),
    nextPage: $("#nextPageButton"),
    addPage: $("#addPageButton"),
    deletePage: $("#deletePageButton"),
    pageLabel: $("#pageLabel b"),
    toast: $("#toast")
  };

  function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function toRgba(hex, alpha) {
    const raw = hex.replace("#", "");
    const value = parseInt(raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw, 16);
    return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
  }

  function screenPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function worldPoint(point) {
    return {
      x: (point.x - viewport.x) / viewport.scale,
      y: (point.y - viewport.y) / viewport.scale
    };
  }

  function pointerWorld(event) {
    return worldPoint(screenPoint(event));
  }

  function resizeCanvas() {
    const rect = workspace.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  }

  function drawPaper(context, width, height, paper = currentPaper, view = viewport) {
    const theme = PAPER_STYLES[paper] || PAPER_STYLES.dots;
    context.save();
    context.fillStyle = theme.color;
    context.fillRect(0, 0, width, height);
    if (!gridVisible || paper === "blank") {
      context.restore();
      return;
    }
    const base = paper === "ruled" ? 32 : paper === "story" ? 54 : 24;
    const spacing = base * view.scale;
    if (spacing < 8) {
      context.restore();
      return;
    }
    const startX = ((view.x % spacing) + spacing) % spacing;
    const startY = ((view.y % spacing) + spacing) % spacing;
    if (paper === "dots") {
      context.fillStyle = view.scale > 0.55 ? "rgba(118, 123, 116, 0.22)" : "rgba(118, 123, 116, 0.14)";
      for (let x = startX; x < width; x += spacing) for (let y = startY; y < height; y += spacing) {
        context.beginPath();
        context.arc(x, y, view.scale > 1.7 ? 1.05 : 0.8, 0, Math.PI * 2);
        context.fill();
      }
    } else if (paper === "ruled") {
      context.strokeStyle = "rgba(95, 150, 190, 0.24)";
      context.lineWidth = 1;
      for (let y = startY; y < height; y += spacing) {
        context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
      }
    } else if (paper === "grid") {
      context.strokeStyle = "rgba(75, 142, 181, 0.18)";
      context.lineWidth = 1;
      for (let x = startX; x < width; x += spacing) {
        context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke();
      }
      for (let y = startY; y < height; y += spacing) {
        context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
      }
    } else if (paper === "story") {
      for (let x = startX; x < width; x += spacing) for (let y = startY; y < height; y += spacing) {
        const alternate = Math.round((x - startX) / spacing + (y - startY) / spacing) % 2;
        context.fillStyle = alternate ? "rgba(232, 93, 63, 0.16)" : "rgba(242, 184, 75, 0.22)";
        context.beginPath();
        context.arc(x, y, Math.max(1.5, 2.4 * view.scale), 0, Math.PI * 2);
        context.fill();
      }
    }
    context.restore();
  }

  function roundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function tracePath(context, points) {
    if (!points.length) return;
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    if (points.length === 1) {
      context.lineTo(points[0].x + 0.01, points[0].y + 0.01);
      return;
    }
    if (points.length === 2) {
      context.lineTo(points[1].x, points[1].y);
      return;
    }
    for (let i = 1; i < points.length - 1; i += 1) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      context.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    const last = points[points.length - 1];
    context.lineTo(last.x, last.y);
  }

  function drawArrowHead(context, x1, y1, x2, y2, width, color) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const length = Math.max(12, width * 4.2);
    context.save();
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(x2 - length * Math.cos(angle - Math.PI / 6), y2 - length * Math.sin(angle - Math.PI / 6));
    context.lineTo(x2, y2);
    context.lineTo(x2 - length * Math.cos(angle + Math.PI / 6), y2 - length * Math.sin(angle + Math.PI / 6));
    context.stroke();
    context.restore();
  }

  function drawMultilineText(context, element) {
    const lines = String(element.text || "").split("\n");
    const lineHeight = element.fontSize * 1.35;
    context.save();
    context.fillStyle = element.color;
    context.font = `${element.fontWeight || 500} ${element.fontSize}px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    context.textBaseline = "top";
    lines.forEach((line, index) => context.fillText(line, element.x, element.y + index * lineHeight));
    context.restore();
  }

  function getImage(src) {
    if (imageCache.has(src)) return imageCache.get(src);
    const image = new Image();
    image.decoding = "async";
    image.onload = render;
    image.src = src;
    imageCache.set(src, image);
    return image;
  }

  function drawElement(context, element) {
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";

    if (element.type === "pen" || element.type === "highlighter") {
      context.strokeStyle = element.color;
      context.lineWidth = element.width;
      context.globalAlpha = element.opacity ?? (element.type === "highlighter" ? 0.3 : 1);
      if (element.type === "highlighter") context.globalCompositeOperation = "multiply";
      tracePath(context, element.points);
      context.stroke();
    } else if (element.type === "line" || element.type === "arrow") {
      context.strokeStyle = element.color;
      context.lineWidth = element.width;
      context.beginPath();
      context.moveTo(element.x1, element.y1);
      context.lineTo(element.x2, element.y2);
      context.stroke();
      if (element.type === "arrow") drawArrowHead(context, element.x1, element.y1, element.x2, element.y2, element.width, element.color);
    } else if (element.type === "rectangle" || element.type === "ellipse") {
      const x = Math.min(element.x1, element.x2);
      const y = Math.min(element.y1, element.y2);
      const width = Math.abs(element.x2 - element.x1);
      const height = Math.abs(element.y2 - element.y1);
      context.strokeStyle = element.color;
      context.fillStyle = element.fill || "transparent";
      context.lineWidth = element.width;
      context.beginPath();
      if (element.type === "rectangle") {
        const radius = Math.min(10, width / 5, height / 5);
        roundedRect(context, x, y, width, height, radius);
      } else {
        context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
      }
      if (element.fill && element.fill !== "transparent") context.fill();
      context.stroke();
    } else if (element.type === "text") {
      drawMultilineText(context, element);
    } else if (element.type === "sticky") {
      context.save();
      context.shadowColor = "rgba(55, 47, 16, 0.12)";
      context.shadowBlur = 16;
      context.shadowOffsetY = 6;
      context.fillStyle = element.fill || "#fff1a8";
      roundedRect(context, element.x, element.y, element.w, element.h, 7);
      context.fill();
      context.restore();
      context.fillStyle = "rgba(120, 98, 23, 0.16)";
      context.fillRect(element.x, element.y, element.w, 5);
      drawMultilineText(context, { ...element, x: element.x + 18, y: element.y + 18 });
    } else if (element.type === "stamp") {
      context.font = `${element.size}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(element.emoji, element.x, element.y);
    } else if (element.type === "image") {
      const image = getImage(element.src);
      if (image.complete && image.naturalWidth) {
        context.drawImage(image, element.x, element.y, element.w, element.h);
      } else {
        context.fillStyle = "#e7e9e5";
        roundedRect(context, element.x, element.y, element.w, element.h, 6);
        context.fill();
      }
    }
    context.restore();
  }

  function boundsOf(element) {
    if (!element) return null;
    if (element.points) {
      const xs = element.points.map((point) => point.x);
      const ys = element.points.map((point) => point.y);
      const pad = element.width / 2;
      return { x: Math.min(...xs) - pad, y: Math.min(...ys) - pad, w: Math.max(1, Math.max(...xs) - Math.min(...xs) + pad * 2), h: Math.max(1, Math.max(...ys) - Math.min(...ys) + pad * 2) };
    }
    if (["line", "arrow", "rectangle", "ellipse"].includes(element.type)) {
      const pad = Math.max(2, element.width / 2);
      return { x: Math.min(element.x1, element.x2) - pad, y: Math.min(element.y1, element.y2) - pad, w: Math.abs(element.x2 - element.x1) + pad * 2, h: Math.abs(element.y2 - element.y1) + pad * 2 };
    }
    if (element.type === "text") {
      const lines = String(element.text || "").split("\n");
      const width = Math.max(24, ...lines.map((line) => line.length * element.fontSize * 0.61));
      return { x: element.x, y: element.y, w: width, h: Math.max(element.fontSize, lines.length * element.fontSize * 1.35) };
    }
    if (element.type === "stamp") {
      return { x: element.x - element.size / 2, y: element.y - element.size / 2, w: element.size, h: element.size };
    }
    return { x: element.x, y: element.y, w: element.w, h: element.h };
  }

  function drawSelection(context, element) {
    const bounds = boundsOf(element);
    if (!bounds) return;
    const padding = 7 / viewport.scale;
    context.save();
    context.strokeStyle = "#167d5a";
    context.fillStyle = "#ffffff";
    context.lineWidth = 1.5 / viewport.scale;
    context.setLineDash([5 / viewport.scale, 4 / viewport.scale]);
    context.strokeRect(bounds.x - padding, bounds.y - padding, bounds.w + padding * 2, bounds.h + padding * 2);
    context.setLineDash([]);
    const radius = 4 / viewport.scale;
    const corners = [
      [bounds.x - padding, bounds.y - padding],
      [bounds.x + bounds.w + padding, bounds.y - padding],
      [bounds.x + bounds.w + padding, bounds.y + bounds.h + padding],
      [bounds.x - padding, bounds.y + bounds.h + padding]
    ];
    corners.forEach(([x, y]) => {
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    });
    context.restore();
  }

  function render() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    drawPaper(ctx, width, height);
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.scale, viewport.scale);
    elements.forEach((element) => drawElement(ctx, element));
    if (selectedId) drawSelection(ctx, elements.find((element) => element.id === selectedId));
    ctx.restore();
  }

  function setTool(nextTool) {
    if (nextTool === tool) return;
    commitTextEditor();
    tool = nextTool;
    if (tool !== "stamp") controls.stampMenu.hidden = true;
    if (tool !== "select") setSelected(null);
    $$("[data-tool]").forEach((button) => button.classList.toggle("active", button.dataset.tool === tool));
    updateCursor();
  }

  function updateCursor() {
    const cursors = {
      select: "default",
      hand: interaction?.kind === "pan" ? "grabbing" : "grab",
      pen: "crosshair",
      highlighter: "crosshair",
      eraser: "cell",
      line: "crosshair",
      arrow: "crosshair",
      rectangle: "crosshair",
      ellipse: "crosshair",
      text: "text",
      sticky: "crosshair",
      stamp: "copy"
    };
    canvas.style.cursor = spacePressed ? "grab" : (cursors[tool] || "default");
  }

  function setSelected(id) {
    selectedId = id;
    controls.selectionActions.hidden = !id;
    const selected = elements.find((element) => element.id === id);
    if (selected?.color) {
      style.color = selected.color;
      style.width = selected.type === "highlighter" ? Math.max(1, selected.width / 4) : (selected.width || style.width);
      style.fill = Boolean(selected.fill && selected.fill !== "transparent");
      syncStyleControls();
    }
    render();
  }

  function syncStyleControls() {
    $$(".color-swatch").forEach((button) => button.classList.toggle("selected", button.dataset.color === style.color));
    controls.strokeWidth.value = style.width;
    controls.strokePreview.style.height = `${clamp(style.width, 2, 10)}px`;
    controls.strokePreview.style.background = style.color;
    controls.fillButton.setAttribute("aria-pressed", String(style.fill));
  }

  function pointSegmentDistance(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx === 0 && dy === 0) return Math.hypot(point.x - a.x, point.y - a.y);
    const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy), 0, 1);
    return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
  }

  function hitElement(element, point) {
    const tolerance = Math.max(8 / viewport.scale, (element.width || 1) / 2 + 3 / viewport.scale);
    if (element.points) {
      if (element.points.length === 1) return Math.hypot(point.x - element.points[0].x, point.y - element.points[0].y) <= tolerance;
      return element.points.some((current, index) => index > 0 && pointSegmentDistance(point, element.points[index - 1], current) <= tolerance);
    }
    if (element.type === "line" || element.type === "arrow") {
      return pointSegmentDistance(point, { x: element.x1, y: element.y1 }, { x: element.x2, y: element.y2 }) <= tolerance;
    }
    const bounds = boundsOf(element);
    return point.x >= bounds.x - tolerance && point.x <= bounds.x + bounds.w + tolerance && point.y >= bounds.y - tolerance && point.y <= bounds.y + bounds.h + tolerance;
  }

  function findHit(point) {
    for (let index = elements.length - 1; index >= 0; index -= 1) {
      if (hitElement(elements[index], point)) return elements[index];
    }
    return null;
  }

  function translateElement(element, dx, dy) {
    if (element.points) {
      element.points.forEach((point) => { point.x += dx; point.y += dy; });
    } else if (["line", "arrow", "rectangle", "ellipse"].includes(element.type)) {
      element.x1 += dx; element.y1 += dy; element.x2 += dx; element.y2 += dy;
    } else {
      element.x += dx; element.y += dy;
    }
  }

  function addPath(point, event, type) {
    const element = {
      id: uid(),
      type,
      points: [{ ...point, p: event.pressure || 0.5 }],
      color: style.color,
      width: type === "highlighter" ? Math.max(12, style.width * 4) : style.width,
      opacity: type === "highlighter" ? 0.3 : 1
    };
    elements.push(element);
    interaction = { kind: "draw", id: element.id };
    render();
  }

  function addShape(point, type) {
    const element = {
      id: uid(), type,
      x1: point.x, y1: point.y, x2: point.x, y2: point.y,
      color: style.color, width: style.width,
      fill: style.fill && (type === "rectangle" || type === "ellipse") ? toRgba(style.color, 0.13) : "transparent"
    };
    elements.push(element);
    interaction = { kind: "shape", id: element.id };
    render();
  }

  function addStamp(point) {
    const element = {
      id: uid(),
      type: "stamp",
      emoji: activeStamp,
      x: point.x,
      y: point.y,
      size: 54 + style.width * 3
    };
    elements.push(element);
    commitHistory();
  }

  function eraseAt(point) {
    const before = elements.length;
    const selectedWasRemoved = elements.some((element) => element.id === selectedId && hitElement(element, point));
    elements = elements.filter((element) => !hitElement(element, point));
    if (elements.length !== before) {
      interaction.erased = true;
      if (selectedWasRemoved) setSelected(null);
      render();
    }
  }

  function beginPinch() {
    const points = [...activePointers.values()];
    if (points.length < 2) return;
    const center = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
    const distance = Math.max(1, Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y));
    if (interaction?.id && (interaction.kind === "draw" || interaction.kind === "shape")) {
      elements = elements.filter((element) => element.id !== interaction.id);
    }
    interaction = null;
    pinch = { distance, center, scale: viewport.scale, x: viewport.x, y: viewport.y };
  }

  function updatePinch() {
    const points = [...activePointers.values()];
    if (points.length < 2 || !pinch) return;
    const center = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
    const distance = Math.max(1, Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y));
    const newScale = clamp(pinch.scale * (distance / pinch.distance), MIN_SCALE, MAX_SCALE);
    const anchorWorld = { x: (pinch.center.x - pinch.x) / pinch.scale, y: (pinch.center.y - pinch.y) / pinch.scale };
    viewport.scale = newScale;
    viewport.x = center.x - anchorWorld.x * newScale;
    viewport.y = center.y - anchorWorld.y * newScale;
    updateZoomLabel();
    render();
  }

  function onPointerDown(event) {
    if (event.button !== 0 && event.button !== 1) return;
    event.preventDefault();
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (error) {
      // Some older touch browsers expose Pointer Events without pointer capture.
    }
    const screen = screenPoint(event);
    activePointers.set(event.pointerId, screen);
    if (activePointers.size === 2) {
      beginPinch();
      return;
    }
    if (activePointers.size > 1) return;
    commitTextEditor();
    const point = worldPoint(screen);

    if (tool === "hand" || event.button === 1 || spacePressed) {
      interaction = { kind: "pan", screen, origin: { x: viewport.x, y: viewport.y } };
      updateCursor();
      return;
    }
    if (tool === "select") {
      const hit = findHit(point);
      setSelected(hit?.id || null);
      if (hit) interaction = { kind: "drag", start: point, original: deepClone(hit), moved: false };
      return;
    }
    if (tool === "eraser") {
      interaction = { kind: "erase", erased: false };
      eraseAt(point);
      return;
    }
    if (tool === "pen" || tool === "highlighter") {
      addPath(point, event, tool);
      return;
    }
    if (SHAPE_TOOLS.has(tool)) {
      addShape(point, tool);
      return;
    }
    if (tool === "stamp") {
      addStamp(point);
      return;
    }
    if (tool === "text" || tool === "sticky") openTextEditor(point, tool === "sticky");
  }

  function onPointerMove(event) {
    const screen = screenPoint(event);
    if (activePointers.has(event.pointerId)) activePointers.set(event.pointerId, screen);
    if (activePointers.size >= 2) {
      updatePinch();
      return;
    }
    if (!interaction) return;
    event.preventDefault();
    const point = worldPoint(screen);
    if (interaction.kind === "pan") {
      viewport.x = interaction.origin.x + screen.x - interaction.screen.x;
      viewport.y = interaction.origin.y + screen.y - interaction.screen.y;
      render();
    } else if (interaction.kind === "drag") {
      const element = elements.find((item) => item.id === selectedId);
      if (!element) return;
      Object.assign(element, deepClone(interaction.original));
      const dx = point.x - interaction.start.x;
      const dy = point.y - interaction.start.y;
      translateElement(element, dx, dy);
      interaction.moved = interaction.moved || Math.hypot(dx, dy) > 0.5;
      render();
    } else if (interaction.kind === "draw") {
      const element = elements.find((item) => item.id === interaction.id);
      if (!element) return;
      const events = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [event];
      events.forEach((sample) => {
        const next = pointerWorld(sample);
        const previous = element.points[element.points.length - 1];
        if (Math.hypot(next.x - previous.x, next.y - previous.y) > 0.45 / viewport.scale) {
          element.points.push({ ...next, p: sample.pressure || 0.5 });
        }
      });
      render();
    } else if (interaction.kind === "shape") {
      const element = elements.find((item) => item.id === interaction.id);
      if (!element) return;
      element.x2 = point.x;
      element.y2 = point.y;
      render();
    } else if (interaction.kind === "erase") {
      eraseAt(point);
    }
  }

  function onPointerUp(event) {
    activePointers.delete(event.pointerId);
    if (pinch) {
      if (activePointers.size < 2) {
        pinch = null;
        interaction = null;
        scheduleSave();
      }
      return;
    }
    if (!interaction) return;
    const completed = interaction;
    interaction = null;
    updateCursor();
    if (["draw", "shape"].includes(completed.kind) || (completed.kind === "drag" && completed.moved) || (completed.kind === "erase" && completed.erased)) {
      commitHistory();
    } else if (completed.kind === "pan") {
      scheduleSave();
    }
  }

  function onWheel(event) {
    event.preventDefault();
    const point = screenPoint(event);
    if (event.ctrlKey || event.metaKey) {
      const factor = Math.exp(-event.deltaY * 0.006);
      zoomAt(point, viewport.scale * factor);
    } else {
      viewport.x -= event.deltaX;
      viewport.y -= event.deltaY;
      render();
      scheduleSave();
    }
  }

  function zoomAt(screen, nextScale) {
    const world = worldPoint(screen);
    viewport.scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
    viewport.x = screen.x - world.x * viewport.scale;
    viewport.y = screen.y - world.y * viewport.scale;
    updateZoomLabel();
    render();
    scheduleSave();
  }

  function updateZoomLabel() {
    controls.zoomLabel.textContent = `${Math.round(viewport.scale * 100)}%`;
  }

  function zoomBy(factor) {
    zoomAt({ x: workspace.clientWidth / 2, y: workspace.clientHeight / 2 }, viewport.scale * factor);
  }

  function fitContent() {
    if (!elements.length) {
      viewport.x = 0; viewport.y = 0; viewport.scale = 1;
    } else {
      const bounds = contentBounds();
      const padding = Math.min(workspace.clientWidth, workspace.clientHeight) * 0.12;
      const scaleX = (workspace.clientWidth - padding * 2) / Math.max(bounds.w, 1);
      const scaleY = (workspace.clientHeight - padding * 2) / Math.max(bounds.h, 1);
      viewport.scale = clamp(Math.min(scaleX, scaleY, 1.35), MIN_SCALE, MAX_SCALE);
      viewport.x = (workspace.clientWidth - bounds.w * viewport.scale) / 2 - bounds.x * viewport.scale;
      viewport.y = (workspace.clientHeight - bounds.h * viewport.scale) / 2 - bounds.y * viewport.scale;
    }
    updateZoomLabel();
    render();
    scheduleSave();
  }

  function contentBounds() {
    const bounds = elements.map(boundsOf).filter(Boolean);
    if (!bounds.length) return { x: 0, y: 0, w: 1, h: 1 };
    const left = Math.min(...bounds.map((item) => item.x));
    const top = Math.min(...bounds.map((item) => item.y));
    const right = Math.max(...bounds.map((item) => item.x + item.w));
    const bottom = Math.max(...bounds.map((item) => item.y + item.h));
    return { x: left, y: top, w: right - left, h: bottom - top };
  }

  function openTextEditor(point, sticky = false, existing = null) {
    const editor = controls.textEditor;
    const isSticky = sticky || existing?.type === "sticky";
    const x = existing?.x ?? point.x;
    const y = existing?.y ?? point.y;
    const screen = { x: x * viewport.scale + viewport.x, y: y * viewport.scale + viewport.y };
    editor.hidden = false;
    editor.classList.toggle("sticky", isSticky);
    editor.value = existing?.text || "";
    editor.dataset.type = isSticky ? "sticky" : "text";
    editor.dataset.x = x;
    editor.dataset.y = y;
    editor.dataset.editingId = existing?.id || "";
    editor.style.left = `${screen.x}px`;
    editor.style.top = `${screen.y}px`;
    editor.style.width = `${(existing?.w || (isSticky ? 220 : 180)) * viewport.scale}px`;
    editor.style.height = `${(existing?.h || (isSticky ? 160 : 52)) * viewport.scale}px`;
    editor.style.fontSize = `${(existing?.fontSize || (isSticky ? 17 : 22)) * viewport.scale}px`;
    editor.style.color = existing?.color || style.color;
    if (existing) elements = elements.filter((element) => element.id !== existing.id);
    setSelected(null);
    editor.focus();
  }

  function commitTextEditor() {
    const editor = controls.textEditor;
    if (editor.hidden) return;
    const text = editor.value.trim();
    const editingId = editor.dataset.editingId;
    if (text) {
      const isSticky = editor.dataset.type === "sticky";
      const element = isSticky ? {
        id: editingId || uid(), type: "sticky", text,
        x: Number(editor.dataset.x), y: Number(editor.dataset.y),
        w: Math.max(180, editor.offsetWidth / viewport.scale), h: Math.max(120, editor.offsetHeight / viewport.scale),
        color: style.color, fill: "#fff1a8", fontSize: 17, fontWeight: 500
      } : {
        id: editingId || uid(), type: "text", text,
        x: Number(editor.dataset.x), y: Number(editor.dataset.y),
        color: style.color, fontSize: 22, fontWeight: 500
      };
      elements.push(element);
      commitHistory();
    } else if (editingId) {
      commitHistory();
    }
    editor.hidden = true;
    editor.value = "";
    delete editor.dataset.editingId;
    render();
  }

  function deleteSelected() {
    if (!selectedId) return;
    elements = elements.filter((element) => element.id !== selectedId);
    setSelected(null);
    commitHistory();
  }

  function createPage(items = [], paper = currentPaper) {
    return {
      id: uid(),
      elements: Array.isArray(items) ? items : [],
      paper: PAPER_STYLES[paper] ? paper : "dots"
    };
  }

  function syncCurrentPage() {
    if (!pages.length) pages = [createPage(elements, currentPaper)];
    pages[currentPageIndex].elements = elements;
    pages[currentPageIndex].paper = currentPaper;
  }

  function updatePageControls() {
    controls.pageLabel.textContent = `${currentPageIndex + 1} / ${pages.length}`;
    controls.prevPage.disabled = currentPageIndex <= 0;
    controls.nextPage.disabled = currentPageIndex >= pages.length - 1;
    controls.deletePage.disabled = pages.length <= 1;
  }

  function updatePaperControls() {
    $$('[data-paper]').forEach((button) => button.classList.toggle("selected", button.dataset.paper === currentPaper));
  }

  function resetPageHistory() {
    history = [snapshot()];
    historyIndex = 0;
    updateHistoryButtons();
  }

  function switchPage(index) {
    const nextIndex = clamp(index, 0, pages.length - 1);
    if (nextIndex === currentPageIndex) return;
    commitTextEditor();
    syncCurrentPage();
    currentPageIndex = nextIndex;
    elements = pages[currentPageIndex].elements;
    currentPaper = pages[currentPageIndex].paper || "dots";
    setSelected(null);
    resetPageHistory();
    updatePageControls();
    updatePaperControls();
    render();
    scheduleSave();
  }

  function addPage() {
    if (pages.length >= 24) {
      showToast("一本画本最多 24 页");
      return;
    }
    commitTextEditor();
    syncCurrentPage();
    const newIndex = currentPageIndex + 1;
    pages.splice(newIndex, 0, createPage([], currentPaper));
    currentPageIndex = newIndex;
    elements = pages[currentPageIndex].elements;
    setSelected(null);
    resetPageHistory();
    updatePageControls();
    updatePaperControls();
    render();
    scheduleSave();
    showToast(`已新增第 ${currentPageIndex + 1} 页`);
  }

  function deleteCurrentPage() {
    if (pages.length <= 1) return;
    commitTextEditor();
    pages.splice(currentPageIndex, 1);
    currentPageIndex = Math.min(currentPageIndex, pages.length - 1);
    elements = pages[currentPageIndex].elements;
    currentPaper = pages[currentPageIndex].paper || "dots";
    setSelected(null);
    resetPageHistory();
    updatePageControls();
    updatePaperControls();
    render();
    scheduleSave();
    showToast("画页已删除");
  }

  function snapshot() {
    return JSON.stringify(elements);
  }

  function commitHistory() {
    const next = snapshot();
    if (history[historyIndex] === next) {
      scheduleSave();
      return;
    }
    history = history.slice(0, historyIndex + 1);
    history.push(next);
    if (history.length > 80) history.shift();
    historyIndex = history.length - 1;
    syncCurrentPage();
    updateHistoryButtons();
    scheduleSave();
    render();
  }

  function restoreHistory(index) {
    if (index < 0 || index >= history.length) return;
    historyIndex = index;
    elements = JSON.parse(history[historyIndex]);
    syncCurrentPage();
    setSelected(null);
    updateHistoryButtons();
    scheduleSave();
    render();
  }

  function updateHistoryButtons() {
    controls.undo.disabled = historyIndex <= 0;
    controls.redo.disabled = historyIndex >= history.length - 1;
  }

  function scheduleSave() {
    controls.saveState.classList.add("saving");
    controls.saveLabel.textContent = "保存中";
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveBoard, 280);
  }

  function saveBoard() {
    syncCurrentPage();
    const payload = {
      version: 2,
      title: controls.boardTitle.value.trim() || "未命名白板",
      pages,
      currentPageIndex,
      viewport,
      gridVisible
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      controls.saveLabel.textContent = "已保存";
      controls.saveState.classList.remove("saving");
    } catch (error) {
      controls.saveLabel.textContent = "存储已满";
      controls.saveState.classList.remove("saving");
      showToast("图片过大，建议先导出白板文件");
    }
  }

  function loadBoard() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) {
        pages = [createPage()];
      } else if (Array.isArray(saved.pages) && saved.pages.length) {
        pages = saved.pages.map((page) => ({
          id: page.id || uid(),
          elements: Array.isArray(page.elements) ? page.elements : [],
          paper: PAPER_STYLES[page.paper] ? page.paper : "dots"
        }));
        currentPageIndex = clamp(Number(saved.currentPageIndex) || 0, 0, pages.length - 1);
      } else if (Array.isArray(saved.elements)) {
        pages = [createPage(saved.elements, "dots")];
      } else {
        pages = [createPage()];
      }
      elements = pages[currentPageIndex].elements;
      currentPaper = pages[currentPageIndex].paper || "dots";
      controls.boardTitle.value = saved?.title || "未命名白板";
      if (saved?.viewport) Object.assign(viewport, saved.viewport);
      gridVisible = saved?.gridVisible !== false;
      controls.gridButton.setAttribute("aria-pressed", String(gridVisible));
      updateZoomLabel();
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
      pages = [createPage()];
      currentPageIndex = 0;
      elements = pages[0].elements;
      currentPaper = "dots";
    }
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    $("span", controls.toast).textContent = message;
    controls.toast.hidden = false;
    toastTimer = window.setTimeout(() => { controls.toast.hidden = true; }, 2200);
  }

  function safeFilename(extension) {
    const base = (controls.boardTitle.value.trim() || "Nomi白板").replace(/[\\/:*?\"<>|]/g, "-");
    return `${base}.${extension}`;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function exportPNG() {
    const bounds = contentBounds();
    const margin = 64;
    const naturalWidth = Math.max(640, Math.ceil(bounds.w + margin * 2));
    const naturalHeight = Math.max(420, Math.ceil(bounds.h + margin * 2));
    const exportScale = clamp(2400 / Math.max(naturalWidth, naturalHeight), 1, 2);
    const output = document.createElement("canvas");
    output.width = Math.round(naturalWidth * exportScale);
    output.height = Math.round(naturalHeight * exportScale);
    const outputCtx = output.getContext("2d");
    outputCtx.scale(exportScale, exportScale);
    drawPaper(outputCtx, naturalWidth, naturalHeight, currentPaper, { x: margin - bounds.x, y: margin - bounds.y, scale: 1 });
    const images = elements.filter((element) => element.type === "image").map((element) => new Promise((resolve) => {
      const image = getImage(element.src);
      if (image.complete) resolve(); else image.addEventListener("load", resolve, { once: true });
    }));
    await Promise.all(images);
    outputCtx.translate(margin - bounds.x, margin - bounds.y);
    elements.forEach((element) => drawElement(outputCtx, element));
    output.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, safeFilename("png"));
      showToast("PNG 已导出");
    }, "image/png");
  }

  function esc(value) {
    return String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
  }

  function paperToSVG(width, height) {
    const color = (PAPER_STYLES[currentPaper] || PAPER_STYLES.dots).color;
    const base = `<rect width="${width}" height="${height}" fill="${color}"/>`;
    if (!gridVisible || currentPaper === "blank") return base;
    if (currentPaper === "dots") {
      return `<defs><pattern id="paper" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.8" fill="#9fa49e" opacity=".35"/></pattern></defs>${base}<rect width="${width}" height="${height}" fill="url(#paper)"/>`;
    }
    if (currentPaper === "ruled") {
      return `<defs><pattern id="paper" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M0 31.5h32" stroke="#78a9ca" stroke-opacity=".28"/></pattern></defs>${base}<rect width="${width}" height="${height}" fill="url(#paper)"/>`;
    }
    if (currentPaper === "grid") {
      return `<defs><pattern id="paper" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" fill="none" stroke="#6eabc8" stroke-opacity=".22"/></pattern></defs>${base}<rect width="${width}" height="${height}" fill="url(#paper)"/>`;
    }
    return `<defs><pattern id="paper" width="54" height="54" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2.4" fill="#f2b84b" opacity=".28"/><circle cx="31" cy="31" r="1.8" fill="#e85d3f" opacity=".2"/></pattern></defs>${base}<rect width="${width}" height="${height}" fill="url(#paper)"/>`;
  }

  function elementToSVG(element, offsetX, offsetY) {
    const moveX = (value) => value + offsetX;
    const moveY = (value) => value + offsetY;
    if (element.type === "pen" || element.type === "highlighter") {
      if (!element.points.length) return "";
      const points = element.points.map((point) => `${moveX(point.x)},${moveY(point.y)}`).join(" ");
      return `<polyline points="${points}" fill="none" stroke="${esc(element.color)}" stroke-width="${element.width}" stroke-linecap="round" stroke-linejoin="round" opacity="${element.opacity ?? 1}"/>`;
    }
    if (element.type === "line" || element.type === "arrow") {
      let value = `<line x1="${moveX(element.x1)}" y1="${moveY(element.y1)}" x2="${moveX(element.x2)}" y2="${moveY(element.y2)}" stroke="${esc(element.color)}" stroke-width="${element.width}" stroke-linecap="round"/>`;
      if (element.type === "arrow") {
        const angle = Math.atan2(element.y2 - element.y1, element.x2 - element.x1);
        const length = Math.max(12, element.width * 4.2);
        const ax = moveX(element.x2 - length * Math.cos(angle - Math.PI / 6));
        const ay = moveY(element.y2 - length * Math.sin(angle - Math.PI / 6));
        const bx = moveX(element.x2 - length * Math.cos(angle + Math.PI / 6));
        const by = moveY(element.y2 - length * Math.sin(angle + Math.PI / 6));
        value += `<polyline points="${ax},${ay} ${moveX(element.x2)},${moveY(element.y2)} ${bx},${by}" fill="none" stroke="${esc(element.color)}" stroke-width="${element.width}" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
      return value;
    }
    if (element.type === "rectangle") {
      return `<rect x="${moveX(Math.min(element.x1, element.x2))}" y="${moveY(Math.min(element.y1, element.y2))}" width="${Math.abs(element.x2 - element.x1)}" height="${Math.abs(element.y2 - element.y1)}" rx="8" fill="${esc(element.fill || "none")}" stroke="${esc(element.color)}" stroke-width="${element.width}"/>`;
    }
    if (element.type === "ellipse") {
      const x = Math.min(element.x1, element.x2), y = Math.min(element.y1, element.y2), w = Math.abs(element.x2 - element.x1), h = Math.abs(element.y2 - element.y1);
      return `<ellipse cx="${moveX(x + w / 2)}" cy="${moveY(y + h / 2)}" rx="${w / 2}" ry="${h / 2}" fill="${esc(element.fill || "none")}" stroke="${esc(element.color)}" stroke-width="${element.width}"/>`;
    }
    if (element.type === "text" || element.type === "sticky") {
      const x = element.type === "sticky" ? element.x + 18 : element.x;
      const y = element.type === "sticky" ? element.y + 18 : element.y;
      const fontSize = element.fontSize;
      const background = element.type === "sticky" ? `<rect x="${moveX(element.x)}" y="${moveY(element.y)}" width="${element.w}" height="${element.h}" rx="7" fill="${esc(element.fill || "#fff1a8")}"/>` : "";
      const lines = String(element.text).split("\n").map((line, index) => `<tspan x="${moveX(x)}" y="${moveY(y + fontSize + index * fontSize * 1.35)}">${esc(line)}</tspan>`).join("");
      return `${background}<text fill="${esc(element.color)}" font-family="Inter, sans-serif" font-size="${fontSize}" font-weight="${element.fontWeight || 500}">${lines}</text>`;
    }
    if (element.type === "stamp") {
      return `<text x="${moveX(element.x)}" y="${moveY(element.y)}" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif" font-size="${element.size}" text-anchor="middle" dominant-baseline="central">${esc(element.emoji)}</text>`;
    }
    if (element.type === "image") {
      return `<image href="${esc(element.src)}" x="${moveX(element.x)}" y="${moveY(element.y)}" width="${element.w}" height="${element.h}" preserveAspectRatio="none"/>`;
    }
    return "";
  }

  function exportSVG() {
    const bounds = contentBounds();
    const margin = 48;
    const width = Math.max(640, Math.ceil(bounds.w + margin * 2));
    const height = Math.max(420, Math.ceil(bounds.h + margin * 2));
    const offsetX = margin - bounds.x + Math.max(0, (640 - (bounds.w + margin * 2)) / 2);
    const offsetY = margin - bounds.y + Math.max(0, (420 - (bounds.h + margin * 2)) / 2);
    const body = elements.map((element) => elementToSVG(element, offsetX, offsetY)).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${paperToSVG(width, height)}${body}</svg>`;
    downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), safeFilename("svg"));
    showToast("SVG 已导出");
  }

  function exportJSON() {
    syncCurrentPage();
    const payload = JSON.stringify({ version: 2, title: controls.boardTitle.value.trim() || "未命名白板", pages, currentPageIndex }, null, 2);
    downloadBlob(new Blob([payload], { type: "application/json" }), safeFilename("json"));
    showToast("白板文件已导出");
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        if (!payload || (!Array.isArray(payload.elements) && !Array.isArray(payload.pages))) throw new Error("invalid");
        pages = Array.isArray(payload.pages) && payload.pages.length ? payload.pages.map((page) => ({
          id: page.id || uid(),
          elements: Array.isArray(page.elements) ? page.elements : [],
          paper: PAPER_STYLES[page.paper] ? page.paper : "dots"
        })) : [createPage(payload.elements, "dots")];
        currentPageIndex = clamp(Number(payload.currentPageIndex) || 0, 0, pages.length - 1);
        elements = pages[currentPageIndex].elements;
        currentPaper = pages[currentPageIndex].paper || "dots";
        controls.boardTitle.value = payload.title || file.name.replace(/\.json$/i, "");
        setSelected(null);
        resetPageHistory();
        updatePageControls();
        updatePaperControls();
        fitContent();
        showToast("白板已导入");
      } catch (error) {
        showToast("无法读取这个白板文件");
      }
    };
    reader.readAsText(file);
  }

  function insertImageFile(file, at = null) {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxW = Math.min(520, workspace.clientWidth * 0.62 / viewport.scale);
        const maxH = Math.min(380, workspace.clientHeight * 0.62 / viewport.scale);
        const ratio = Math.min(1, maxW / image.naturalWidth, maxH / image.naturalHeight);
        const w = image.naturalWidth * ratio;
        const h = image.naturalHeight * ratio;
        const center = at || worldPoint({ x: workspace.clientWidth / 2, y: workspace.clientHeight / 2 });
        const element = { id: uid(), type: "image", src: reader.result, x: center.x - w / 2, y: center.y - h / 2, w, h };
        elements.push(element);
        setTool("select");
        setSelected(element.id);
        commitHistory();
        showToast("图片已插入");
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function updateSelectedStyle() {
    const selected = elements.find((element) => element.id === selectedId);
    if (!selected) return;
    if (selected.color) selected.color = style.color;
    if (selected.width) selected.width = selected.type === "highlighter" ? Math.max(12, style.width * 4) : style.width;
    if (["rectangle", "ellipse"].includes(selected.type)) selected.fill = style.fill ? toRgba(style.color, 0.13) : "transparent";
    render();
  }

  function copySelected(cut = false) {
    const selected = elements.find((element) => element.id === selectedId);
    if (!selected) return;
    internalClipboard = deepClone(selected);
    if (cut) deleteSelected();
  }

  function pasteSelected() {
    if (!internalClipboard) return;
    const copy = deepClone(internalClipboard);
    copy.id = uid();
    translateElement(copy, 24 / viewport.scale, 24 / viewport.scale);
    elements.push(copy);
    internalClipboard = deepClone(copy);
    setTool("select");
    setSelected(copy.id);
    commitHistory();
  }

  function bindEvents() {
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    canvas.addEventListener("dblclick", (event) => {
      const hit = findHit(pointerWorld(event));
      if (hit && (hit.type === "text" || hit.type === "sticky")) openTextEditor({ x: hit.x, y: hit.y }, hit.type === "sticky", hit);
    });

    $$("[data-tool]").forEach((button) => button.addEventListener("click", () => setTool(button.dataset.tool)));
    $("#stampButton").addEventListener("click", (event) => {
      event.stopPropagation();
      controls.paperMenu.hidden = true;
      controls.stampMenu.hidden = !controls.stampMenu.hidden;
    });
    $$("[data-stamp]").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      activeStamp = button.dataset.stamp;
      $$("[data-stamp]").forEach((item) => item.classList.toggle("selected", item === button));
      controls.stampMenu.hidden = true;
      setTool("stamp");
    }));
    $("#imageButton").addEventListener("click", () => controls.imageInput.click());
    controls.imageInput.addEventListener("change", () => {
      insertImageFile(controls.imageInput.files[0]);
      controls.imageInput.value = "";
    });

    $$(".color-swatch").forEach((button) => button.addEventListener("click", () => {
      style.color = button.dataset.color;
      syncStyleControls();
      updateSelectedStyle();
      if (selectedId) commitHistory();
    }));
    controls.strokeWidth.addEventListener("input", () => {
      style.width = Number(controls.strokeWidth.value);
      syncStyleControls();
      updateSelectedStyle();
    });
    controls.strokeWidth.addEventListener("change", () => { if (selectedId) commitHistory(); });
    controls.fillButton.addEventListener("click", () => {
      style.fill = !style.fill;
      syncStyleControls();
      updateSelectedStyle();
      if (selectedId) commitHistory();
    });

    controls.undo.addEventListener("click", () => restoreHistory(historyIndex - 1));
    controls.redo.addEventListener("click", () => restoreHistory(historyIndex + 1));
    controls.deleteButton.addEventListener("click", deleteSelected);
    controls.duplicateButton.addEventListener("click", () => {
      copySelected();
      pasteSelected();
    });
    controls.gridButton.addEventListener("click", () => {
      gridVisible = !gridVisible;
      controls.gridButton.setAttribute("aria-pressed", String(gridVisible));
      render();
      scheduleSave();
    });
    $("#zoomOutButton").addEventListener("click", () => zoomBy(0.8));
    $("#zoomInButton").addEventListener("click", () => zoomBy(1.25));
    controls.zoomLabel.addEventListener("click", () => zoomAt({ x: workspace.clientWidth / 2, y: workspace.clientHeight / 2 }, 1));
    $("#fitButton").addEventListener("click", fitContent);

    controls.paperButton.addEventListener("click", (event) => {
      event.stopPropagation();
      controls.stampMenu.hidden = true;
      controls.paperMenu.hidden = !controls.paperMenu.hidden;
    });
    $$("[data-paper]").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      currentPaper = button.dataset.paper;
      syncCurrentPage();
      updatePaperControls();
      controls.paperMenu.hidden = true;
      render();
      scheduleSave();
      showToast(`已换成${$("b", button).textContent}`);
    }));
    controls.prevPage.addEventListener("click", () => switchPage(currentPageIndex - 1));
    controls.nextPage.addEventListener("click", () => switchPage(currentPageIndex + 1));
    controls.addPage.addEventListener("click", addPage);
    controls.deletePage.addEventListener("click", () => controls.deletePageDialog.showModal());

    controls.exportButton.addEventListener("click", (event) => {
      event.stopPropagation();
      controls.exportMenu.hidden = !controls.exportMenu.hidden;
      controls.exportButton.setAttribute("aria-expanded", String(!controls.exportMenu.hidden));
    });
    $$("[data-export]").forEach((button) => button.addEventListener("click", () => {
      controls.exportMenu.hidden = true;
      controls.exportButton.setAttribute("aria-expanded", "false");
      if (button.dataset.export === "png") exportPNG();
      if (button.dataset.export === "svg") exportSVG();
      if (button.dataset.export === "json") exportJSON();
    }));
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".export-wrap")) {
        controls.exportMenu.hidden = true;
        controls.exportButton.setAttribute("aria-expanded", "false");
      }
      if (!event.target.closest("#stampMenu") && !event.target.closest("#stampButton")) controls.stampMenu.hidden = true;
      if (!event.target.closest("#paperMenu") && !event.target.closest("#paperButton")) controls.paperMenu.hidden = true;
    });

    controls.importButton.addEventListener("click", () => controls.jsonInput.click());
    controls.jsonInput.addEventListener("change", () => {
      if (controls.jsonInput.files[0]) importJSON(controls.jsonInput.files[0]);
      controls.jsonInput.value = "";
    });

    controls.clearButton.addEventListener("click", () => controls.clearDialog.showModal());
    $(".dialog-close", controls.clearDialog).addEventListener("click", () => controls.clearDialog.close());
    $("[data-dialog='cancel']", controls.clearDialog).addEventListener("click", () => controls.clearDialog.close());
    $("[data-dialog='confirm']", controls.clearDialog).addEventListener("click", () => {
      controls.clearDialog.close();
      elements = [];
      setSelected(null);
      commitHistory();
      showToast("当前画页已清空");
    });
    controls.clearDialog.addEventListener("click", (event) => {
      if (event.target === controls.clearDialog) controls.clearDialog.close();
    });

    $(".dialog-close", controls.deletePageDialog).addEventListener("click", () => controls.deletePageDialog.close());
    $("[data-page-dialog='cancel']", controls.deletePageDialog).addEventListener("click", () => controls.deletePageDialog.close());
    $("[data-page-dialog='confirm']", controls.deletePageDialog).addEventListener("click", () => {
      controls.deletePageDialog.close();
      deleteCurrentPage();
    });
    controls.deletePageDialog.addEventListener("click", (event) => {
      if (event.target === controls.deletePageDialog) controls.deletePageDialog.close();
    });

    controls.boardTitle.addEventListener("input", scheduleSave);
    controls.textEditor.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        commitTextEditor();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        controls.textEditor.value = "";
        commitTextEditor();
      }
    });
    controls.textEditor.addEventListener("blur", () => setTimeout(commitTextEditor, 0));

    document.addEventListener("keydown", (event) => {
      const editing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName);
      if (editing) return;
      const modifier = event.metaKey || event.ctrlKey;
      if (event.code === "Space") {
        event.preventDefault();
        spacePressed = true;
        updateCursor();
      }
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        event.preventDefault();
        deleteSelected();
      }
      if (modifier && event.key.toLowerCase() === "z") {
        event.preventDefault();
        restoreHistory(historyIndex + (event.shiftKey ? 1 : -1));
      }
      if (modifier && event.key.toLowerCase() === "c") copySelected();
      if (modifier && event.key.toLowerCase() === "x") copySelected(true);
      if (modifier && event.key.toLowerCase() === "v") pasteSelected();
      if (!modifier && !event.altKey) {
        const keyTools = { v: "select", h: "hand", p: "pen", e: "eraser", l: "line", a: "arrow", r: "rectangle", o: "ellipse", t: "text", n: "sticky", s: "stamp" };
        if (keyTools[event.key.toLowerCase()]) setTool(keyTools[event.key.toLowerCase()]);
      }
      if (event.key === "Escape") {
        setSelected(null);
        controls.stampMenu.hidden = true;
        controls.paperMenu.hidden = true;
      }
    });
    document.addEventListener("keyup", (event) => {
      if (event.code === "Space") { spacePressed = false; updateCursor(); }
    });

    workspace.addEventListener("dragover", (event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; });
    workspace.addEventListener("drop", (event) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (!file) return;
      if (file.type === "application/json" || file.name.endsWith(".json")) importJSON(file);
      else insertImageFile(file, worldPoint(screenPoint(event)));
    });
    document.addEventListener("paste", (event) => {
      const image = [...(event.clipboardData?.items || [])].find((item) => item.type.startsWith("image/"));
      if (image) insertImageFile(image.getAsFile());
    });

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("beforeunload", saveBoard);
  }

  function init() {
    loadBoard();
    history = [snapshot()];
    historyIndex = 0;
    updateHistoryButtons();
    updatePageControls();
    updatePaperControls();
    $$("[data-stamp]").forEach((button) => button.classList.toggle("selected", button.dataset.stamp === activeStamp));
    syncStyleControls();
    bindEvents();
    resizeCanvas();
    updateCursor();
  }

  init();
})();
