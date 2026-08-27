(function () {
  "use strict";

  const CATALOG = window.RELAX_CATALOG || [];
  const GAME_ID = window.RELAX_GAME_ID || "";
  const appRoot = document.querySelector("#app");
  const STORAGE_KEY = "kamajoyRelaxLabV1";
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TAU = Math.PI * 2;
  let cleanupGame = null;
  let toastTimer = null;
  let audioContext = null;
  let ambientTimer = null;
  let ambientStep = 0;
  let activeSpeechButton = null;
  let sessionPlayed = false;

  function loadProgress() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return value && typeof value === "object" ? value : { sound: true, plays: {}, best: {} };
    } catch (error) {
      return { sound: true, plays: {}, best: {} };
    }
  }

  const progress = loadProgress();
  progress.sound = progress.sound !== false;
  progress.plays = progress.plays || {};
  progress.best = progress.best || {};

  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (error) {}
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function pick(items) { return items[Math.floor(Math.random() * items.length)]; }
  function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" }[character]));
  }

  function normalizeSpeech(value) {
    return String(value || "")
      .replace(/＋|\+/g, " 加 ")
      .replace(/−|-/g, " 减 ")
      .replace(/×/g, " 乘 ")
      .replace(/÷/g, " 除以 ")
      .replace(/=/g, " 等于 ")
      .replace(/→/g, " 然后 ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function speechButton(text, label) {
    return `<button class="speak-button speech-button" type="button" data-speech="${escapeHtml(normalizeSpeech(text))}" aria-label="${escapeHtml(label || "朗读玩法")}" title="${escapeHtml(label || "朗读玩法")}"><span aria-hidden="true">🔊</span></button>`;
  }

  function speak(text, button) {
    if (!("speechSynthesis" in window) || typeof window.SpeechSynthesisUtterance === "undefined") {
      showToast("当前浏览器暂不支持语音朗读");
      return;
    }
    window.speechSynthesis.cancel();
    if (activeSpeechButton) activeSpeechButton.classList.remove("speaking");
    const utterance = new window.SpeechSynthesisUtterance(normalizeSpeech(text));
    utterance.lang = "zh-CN";
    utterance.rate = 0.84;
    utterance.pitch = 1.06;
    activeSpeechButton = button;
    button.classList.add("speaking");
    const finish = () => {
      button.classList.remove("speaking");
      if (activeSpeechButton === button) activeSpeechButton = null;
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
  }

  function AudioClass() { return window.AudioContext || window.webkitAudioContext; }
  function ensureAudio() {
    if (!progress.sound || !GAME_ID) return;
    const Context = AudioClass();
    if (!Context) return;
    if (!audioContext || audioContext.state === "closed") audioContext = new Context();
    const ready = audioContext.state === "suspended" ? audioContext.resume() : Promise.resolve();
    ready.then(() => { if (!ambientTimer) startAmbient(); }).catch(() => {});
  }

  function tone(frequency, delay, duration, wave, volume) {
    if (!progress.sound) return;
    ensureAudio();
    if (!audioContext || audioContext.state === "closed") return;
    const start = audioContext.currentTime + (delay || 0);
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = wave || "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume || 0.018, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  function playSound(name) {
    const sounds = {
      tap: [[620, 0, .07, "sine", .012]],
      grain: [[220, 0, .045, "triangle", .008]],
      pop: [[523, 0, .08, "sine", .018], [784, .06, .12, "sine", .014]],
      glow: [[440, 0, .12, "sine", .015], [660, .1, .18, "sine", .014]],
      catch: [[392, 0, .08, "triangle", .015], [587, .08, .13, "sine", .016]],
      splash: [[294, 0, .1, "sine", .012], [392, .06, .13, "sine", .01]],
      success: [[523, 0, .11, "sine", .018], [659, .1, .13, "sine", .018], [784, .21, .2, "sine", .019]],
      soft: [[330, 0, .12, "triangle", .01]]
    };
    (sounds[name] || sounds.tap).forEach((item) => tone(...item));
  }

  const AMBIENT = {
    "sand-art": [261.63, 329.63, 392, 329.63],
    "space-station": [220, 293.66, 349.23, 293.66],
    "bubble-melody": [392, 523.25, 659.25, 523.25],
    "cloud-studio": [349.23, 440, 523.25, 440],
    "firefly-garden": [261.63, 392, 329.63, 440],
    kaleidoscope: [329.63, 493.88, 659.25, 493.88],
    "rainbow-catcher": [392, 493.88, 587.33, 659.25],
    "ocean-aquarium": [293.66, 369.99, 440, 369.99],
    "rhythm-drums": [261.63, 329.63, 392, 523.25],
    "paper-plane": [329.63, 415.3, 493.88, 415.3]
  };

  function stopAmbient() {
    if (ambientTimer) window.clearInterval(ambientTimer);
    ambientTimer = null;
  }

  function startAmbient() {
    const game = CATALOG.find((item) => item.id === GAME_ID);
    const modeNotes = {
      collect: [261.63, 329.63, 392, 523.25], route: [293.66, 369.99, 440, 369.99],
      builder: [329.63, 415.3, 493.88, 659.25], trail: [220, 329.63, 440, 554.37],
      memory: [261.63, 392, 523.25, 659.25], toggle: [246.94, 329.63, 415.3, 493.88],
      recipe: [349.23, 440, 523.25, 587.33], tap: [392, 493.88, 659.25, 783.99],
      keyboard: [261.63, 392, 523.25, 392],
      balance: [293.66, 392, 493.88, 392]
    };
    const notes = AMBIENT[GAME_ID] || (game && modeNotes[game.mode]);
    if (!progress.sound || !notes || !audioContext || audioContext.state !== "running") return;
    stopAmbient();
    ambientStep = 0;
    const play = () => {
      if (!progress.sound || activeSpeechButton) return;
      tone(notes[ambientStep % notes.length], 0, .42, "sine", .0065);
      ambientStep += 1;
    };
    play();
    ambientTimer = window.setInterval(play, 1500);
  }

  function updateSoundButton() {
    const button = document.querySelector("[data-sound-toggle]");
    if (!button) return;
    const label = progress.sound ? "关闭背景音乐和音效" : "开启背景音乐和音效";
    button.classList.toggle("off", !progress.sound);
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("aria-pressed", String(progress.sound));
    button.querySelector("span").textContent = progress.sound ? "♫" : "♩";
  }

  function showToast(message) {
    let toast = document.querySelector("#relaxToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "relaxToast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1700);
  }

  function markPlayed(game) {
    if (sessionPlayed) return;
    sessionPlayed = true;
    progress.plays[game.id] = (Number(progress.plays[game.id]) || 0) + 1;
    saveProgress();
    const value = document.querySelector(".play-count b");
    if (value) value.textContent = progress.plays[game.id];
  }

  function setBest(game, value) {
    if (value > (Number(progress.best[game.id]) || 0)) {
      progress.best[game.id] = value;
      saveProgress();
    }
  }

  function previewMarkup(game) {
    return `<span class="card-preview preview-${game.preview}"><b aria-hidden="true">${escapeHtml(game.icon)}</b></span>`;
  }

  function renderHub() {
    const count = CATALOG.length;
    document.title = `轻松游乐场 · ${count}款儿童趣味小游戏`;
    document.body.dataset.page = "hub";
    appRoot.innerHTML = `
      <header class="site-header">
        <a class="brand" href="../../"><span class="brand-mark">K</span><span><strong>Kamajoy</strong><small>轻松游乐场</small></span></a>
        <a class="home-link" href="../../">返回游戏首页</a>
      </header>
      <main class="hub-main">
        <section class="hub-intro">
          <div class="intro-copy"><p class="eyebrow">8-10岁 · ${count}款无压力小游戏</p><h1>轻松游乐场</h1><p>从自由创作到路线规划、节奏记忆、方块建造和小小策略挑战。没有失败惩罚，选一个喜欢的世界，玩几分钟就好。</p></div>
          <div class="intro-scene" aria-hidden="true"><i class="scene-sun"></i><i class="scene-cloud one"></i><i class="scene-cloud two"></i><b class="scene-plane">➤</b><i class="scene-hill"></i><i class="scene-dots"></i></div>
        </section>
        <section class="catalog-section" aria-labelledby="relaxTitle">
          <div class="section-head"><div><p>今天想怎么玩</p><h2 id="relaxTitle">选择一个小游戏</h2></div><span>支持平板横屏与竖屏</span></div>
          <div class="game-grid">
            ${CATALOG.map((game) => `<a class="relax-card" href="${game.path}/" style="--card-color:${game.color};--card-soft:${game.soft}">${previewMarkup(game)}<span class="card-copy"><small>${game.order} · ${escapeHtml(game.subtitle)}</small><strong>${escapeHtml(game.title)}</strong><span>${escapeHtml(game.description)}</span></span><span class="card-go" aria-hidden="true">›</span></a>`).join("")}
          </div>
        </section>
        <p class="grownup-note"><strong>给大人的小提示：</strong>这些游戏适合学习间隙短暂放松。声音默认开启，可在每个游戏右上角关闭；记录只保存在当前设备。</p>
      </main>`;
  }

  function instructionMarkup(game) {
    return `<div class="instruction">${speechButton(game.prompt, "朗读玩法")}<p>${escapeHtml(game.prompt)}</p></div>`;
  }

  function renderGame(game) {
    document.title = `${game.title} · 轻松游乐场`;
    document.body.dataset.page = "game";
    document.body.dataset.game = game.id;
    document.documentElement.style.setProperty("--game-color", game.color);
    document.documentElement.style.setProperty("--game-soft", game.soft);
    sessionPlayed = false;
    const plays = Number(progress.plays[game.id]) || 0;
    appRoot.innerHTML = `
      <header class="game-header">
        <a class="icon-button" href="../" aria-label="返回轻松游乐场" title="返回">←</a>
        <div class="header-title"><small>${game.order} · ${escapeHtml(game.subtitle)}</small><strong>${escapeHtml(game.title)}</strong></div>
        <div class="header-actions"><button class="sound-toggle ${progress.sound ? "" : "off"}" type="button" data-sound-toggle aria-label="${progress.sound ? "关闭背景音乐和音效" : "开启背景音乐和音效"}" title="${progress.sound ? "关闭背景音乐和音效" : "开启背景音乐和音效"}" aria-pressed="${progress.sound}"><span aria-hidden="true">${progress.sound ? "♫" : "♩"}</span></button><div class="play-count" aria-label="已玩 ${plays} 次"><span>✦</span><b>${plays}</b></div></div>
      </header>
      <main class="game-main">
        <section class="game-heading"><div><p class="eyebrow">轻松游乐场 · ${game.order}</p><div class="spoken-title"><h1>${escapeHtml(game.title)}</h1>${speechButton(game.title, "朗读游戏标题")}</div><p>${escapeHtml(game.description)}</p></div><span class="game-number">${game.order}</span></section>
        <section class="game-stage" id="gameMount"></section>
      </main>`;
    const mount = document.querySelector("#gameMount");
    const engines = {
      "sand-art": renderSandArt,
      "space-station": renderSpaceStation,
      "bubble-melody": renderBubbleMelody,
      "cloud-studio": renderCloudStudio,
      "firefly-garden": renderFireflyGarden,
      kaleidoscope: renderKaleidoscope,
      "rainbow-catcher": renderRainbowCatcher,
      "ocean-aquarium": renderAquarium,
      "rhythm-drums": renderRhythm,
      "paper-plane": renderPaperPlane
    };
    const specialEngines = {
      "block-world": renderBlockWorld,
      "creative-canvas": renderCreativeCanvas,
      "sound-board": renderSoundBoard,
      physics: renderPhysics,
      "sorting-board": renderSortingBoard,
      nature: renderNature,
      puzzle: renderPuzzle
    };
    const engine = engines[game.id] || specialEngines[game.engine] || (game.engine === "mini-arcade" ? renderMiniArcade : null);
    if (!engine) throw new Error(`Missing game engine: ${game.id}`);
    cleanupGame = engine(mount, game) || null;
  }

  function canvasPanel(mount, game, score, toolbar) {
    mount.innerHTML = `<div class="game-panel"><div class="panel-top">${instructionMarkup(game)}<span class="score-pill" id="gameScore">${escapeHtml(score)}</span></div><div class="canvas-wrap"><canvas id="gameCanvas" aria-label="${escapeHtml(game.title)}游戏画面"></canvas><div class="canvas-message" id="canvasMessage" role="status"></div></div>${toolbar ? `<div class="toolbar">${toolbar}</div>` : ""}</div>`;
    return mount.querySelector("#gameCanvas");
  }

  function setScore(text) {
    const score = document.querySelector("#gameScore");
    if (score) score.textContent = text;
  }

  function canvasMessage(text) {
    const message = document.querySelector("#canvasMessage");
    if (!message) return;
    message.textContent = text;
    message.classList.add("show");
    window.setTimeout(() => message.classList.remove("show"), 1800);
  }

  function configureCanvas(canvas, onResize) {
    const context = canvas.getContext("2d");
    let width = 1;
    let height = 1;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (onResize) onResize(width, height);
    };
    resize();
    window.addEventListener("resize", resize);
    return {
      canvas,
      context,
      size: () => ({ width, height }),
      point: (event) => {
        const rect = canvas.getBoundingClientRect();
        return { x: (event.clientX - rect.left) * width / rect.width, y: (event.clientY - rect.top) * height / rect.height };
      },
      cleanup: () => window.removeEventListener("resize", resize)
    };
  }

  function downloadCanvas(canvas, name) {
    const link = document.createElement("a");
    link.download = `${name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("作品已保存为图片");
  }

  function loopFrame(draw) {
    let frame = 0;
    let alive = true;
    const tick = (time) => {
      if (!alive) return;
      draw(time);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => { alive = false; window.cancelAnimationFrame(frame); };
  }

  function renderSandArt(mount, game) {
    const colors = ["#f6d37a", "#ed795d", "#67c3bd", "#7397d8", "#d47caf", "#f6f1df"];
    let color = colors[0];
    let brush = 22;
    const strokes = [];
    let current = null;
    const toolbar = `<div class="palette" aria-label="沙子颜色">${colors.map((value, index) => `<button class="swatch ${index === 0 ? "active" : ""}" data-color="${value}" style="background:${value}" aria-label="选择第 ${index + 1} 种沙色"></button>`).join("")}</div><div class="segments" aria-label="沙笔大小"><button data-brush="12">细</button><button class="active" data-brush="22">中</button><button data-brush="34">粗</button></div><div class="tool-group"><button class="tool-icon" id="undoSand" aria-label="撤销" title="撤销">↶</button><button class="tool-icon" id="clearSand" aria-label="清空" title="清空">×</button><button class="tool-icon" id="saveSand" aria-label="保存图片" title="保存图片">↓</button></div>`;
    const canvas = canvasPanel(mount, game, "自由创作", toolbar);
    let surface;
    surface = configureCanvas(canvas, () => { if (surface) draw(); });

    function draw() {
      const { width, height } = surface.size();
      const ctx = surface.context;
      ctx.fillStyle = "#17242b";
      ctx.fillRect(0, 0, width, height);
      const glow = ctx.createRadialGradient(width * .75, height * .18, 5, width * .75, height * .18, width * .6);
      glow.addColorStop(0, "rgba(39,100,173,.22)");
      glow.addColorStop(1, "rgba(23,36,43,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
      strokes.forEach((stroke) => stroke.forEach((grain) => {
        ctx.globalAlpha = grain.alpha;
        ctx.fillStyle = grain.color;
        ctx.beginPath();
        ctx.arc(grain.x, grain.y, grain.radius, 0, TAU);
        ctx.fill();
      }));
      ctx.globalAlpha = 1;
    }

    function addGrains(point) {
      if (!current) return;
      for (let index = 0; index < 18; index += 1) {
        const angle = Math.random() * TAU;
        const radius = Math.random() * brush;
        current.push({ x: point.x + Math.cos(angle) * radius, y: point.y + Math.sin(angle) * radius + Math.random() * 5, color, radius: rand(.6, 2.1), alpha: rand(.58, .96) });
      }
      draw();
    }

    canvas.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      markPlayed(game);
      playSound("grain");
      current = [];
      strokes.push(current);
      addGrains(surface.point(event));
    });
    canvas.addEventListener("pointermove", (event) => { if (current) { event.preventDefault(); addGrains(surface.point(event)); } });
    const stop = () => { current = null; setBest(game, strokes.length); };
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
    mount.querySelectorAll("[data-color]").forEach((button) => button.addEventListener("click", () => {
      color = button.dataset.color;
      mount.querySelectorAll("[data-color]").forEach((item) => item.classList.toggle("active", item === button));
    }));
    mount.querySelectorAll("[data-brush]").forEach((button) => button.addEventListener("click", () => {
      brush = Number(button.dataset.brush);
      mount.querySelectorAll("[data-brush]").forEach((item) => item.classList.toggle("active", item === button));
    }));
    mount.querySelector("#undoSand").addEventListener("click", () => { strokes.pop(); draw(); });
    mount.querySelector("#clearSand").addEventListener("click", () => { strokes.length = 0; draw(); });
    mount.querySelector("#saveSand").addEventListener("click", () => downloadCanvas(canvas, "我的指尖沙画"));
    draw();
    return surface.cleanup;
  }

  function renderSpaceStation(mount, game) {
    const canvas = canvasPanel(mount, game, "能量 0 / 12", `<span class="game-hint">轻点发光能量球</span><button class="action-button secondary" id="resetSpace">重新点亮</button>`);
    let width = 1;
    let height = 1;
    let energy = 0;
    let stars = [];
    let orbs = [];
    let pulses = [];
    const surface = configureCanvas(canvas, (w, h) => {
      width = w; height = h;
      stars = Array.from({ length: 75 }, () => ({ x: Math.random() * w, y: Math.random() * h, r: rand(.4, 1.8), a: rand(.28, .9) }));
      if (!orbs.length) orbs = Array.from({ length: 5 }, (_, index) => makeOrb(index));
    });

    function makeOrb(index) {
      return { x: rand(45, Math.max(46, width - 45)), y: rand(55, Math.max(56, height - 55)), r: rand(17, 25), phase: rand(0, TAU), speed: rand(.0006, .0012), hue: [48, 185, 215, 305][index % 4] };
    }

    function resetOrb(orb) { Object.assign(orb, makeOrb(randInt(0, 3))); }

    function draw(time) {
      const ctx = surface.context;
      ctx.fillStyle = "#0d1d31";
      ctx.fillRect(0, 0, width, height);
      stars.forEach((star) => { ctx.globalAlpha = star.a * (.72 + Math.sin(time * .002 + star.x) * .28); ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(star.x, star.y, star.r, 0, TAU); ctx.fill(); });
      ctx.globalAlpha = 1;
      const cx = width * .5;
      const cy = height * .52;
      ctx.strokeStyle = "rgba(138,188,220,.35)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, cy, Math.min(width * .28, 205), Math.min(height * .19, 125), 0, 0, TAU); ctx.stroke();
      for (let index = 0; index < 12; index += 1) {
        const angle = index / 12 * TAU - Math.PI / 2;
        const radiusX = Math.min(width * .28, 205);
        const radiusY = Math.min(height * .19, 125);
        const x = cx + Math.cos(angle) * radiusX;
        const y = cy + Math.sin(angle) * radiusY;
        ctx.fillStyle = index < energy ? "#f1ca51" : "#35506a";
        ctx.strokeStyle = "#eaf4fb";
        ctx.lineWidth = 2;
        ctx.fillRect(x - 13, y - 9, 26, 18);
        ctx.strokeRect(x - 13, y - 9, 26, 18);
      }
      ctx.fillStyle = energy >= 12 ? "#f1ca51" : "#2764ad";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, 50, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#0d1d31"; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, TAU); ctx.fill();
      ctx.strokeStyle = "white"; ctx.beginPath(); ctx.moveTo(cx - 70, cy); ctx.lineTo(cx + 70, cy); ctx.stroke();
      orbs.forEach((orb) => {
        orb.y += Math.sin(time * orb.speed + orb.phase) * (reducedMotion ? .03 : .16);
        const glow = ctx.createRadialGradient(orb.x, orb.y, 2, orb.x, orb.y, orb.r * 2.2);
        glow.addColorStop(0, `hsla(${orb.hue},95%,72%,1)`);
        glow.addColorStop(.35, `hsla(${orb.hue},90%,62%,.72)`);
        glow.addColorStop(1, `hsla(${orb.hue},90%,62%,0)`);
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.r * 2.2, 0, TAU); ctx.fill();
        ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(orb.x, orb.y, orb.r * .34, 0, TAU); ctx.fill();
      });
      pulses = pulses.filter((pulse) => pulse.life > 0);
      pulses.forEach((pulse) => { pulse.life -= .025; pulse.r += 1.4; ctx.globalAlpha = pulse.life; ctx.strokeStyle = "#f1ca51"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(pulse.x, pulse.y, pulse.r, 0, TAU); ctx.stroke(); });
      ctx.globalAlpha = 1;
    }

    canvas.addEventListener("pointerdown", (event) => {
      const point = surface.point(event);
      const orb = orbs.find((item) => distance(point, item) < item.r + 24);
      if (!orb) return;
      markPlayed(game);
      playSound("glow");
      pulses.push({ x: orb.x, y: orb.y, r: 8, life: 1 });
      resetOrb(orb);
      energy = Math.min(12, energy + 1);
      setScore(`能量 ${energy} / 12`);
      setBest(game, energy);
      if (energy === 12) { playSound("success"); canvasMessage("太空站全部点亮，欢迎登站！"); }
    });
    mount.querySelector("#resetSpace").addEventListener("click", () => { energy = 0; setScore("能量 0 / 12"); });
    const stopLoop = loopFrame(draw);
    return () => { stopLoop(); surface.cleanup(); };
  }

  function renderBubbleMelody(mount, game) {
    const canvas = canvasPanel(mount, game, "泡泡 0 / 20", `<span class="game-hint">每种颜色都是一个音符</span><button class="action-button secondary" id="newBubbles">换一池泡泡</button>`);
    const colors = ["#ed795d", "#f1ca51", "#67c3bd", "#7397d8", "#d47caf", "#8bc47c"];
    const notes = [261.63, 329.63, 392, 493.88, 587.33, 659.25];
    let width = 1;
    let height = 1;
    let popped = 0;
    let lastSpawn = 0;
    let bubbles = [];
    let sparkles = [];
    const surface = configureCanvas(canvas, (w, h) => { width = w; height = h; if (!bubbles.length) bubbles = Array.from({ length: 10 }, () => makeBubble(true)); });

    function makeBubble(anywhere) {
      const note = randInt(0, colors.length - 1);
      return { x: rand(30, Math.max(31, width - 30)), y: anywhere ? rand(40, height - 20) : height + 35, r: rand(20, 38), speed: rand(.18, .42), sway: rand(0, TAU), note };
    }

    function draw(time) {
      const ctx = surface.context;
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#dff3f4"); sky.addColorStop(1, "#f7e7ef");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
      if (time - lastSpawn > 950 && bubbles.length < 15) { bubbles.push(makeBubble(false)); lastSpawn = time; }
      bubbles.forEach((bubble) => {
        bubble.y -= reducedMotion ? .08 : bubble.speed;
        bubble.x += Math.sin(time * .0012 + bubble.sway) * .12;
        if (bubble.y < -bubble.r - 5) Object.assign(bubble, makeBubble(false));
        const glow = ctx.createRadialGradient(bubble.x - bubble.r * .3, bubble.y - bubble.r * .35, 2, bubble.x, bubble.y, bubble.r);
        glow.addColorStop(0, "rgba(255,255,255,.92)");
        glow.addColorStop(.3, `${colors[bubble.note]}aa`);
        glow.addColorStop(1, `${colors[bubble.note]}28`);
        ctx.fillStyle = glow; ctx.strokeStyle = colors[bubble.note]; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(bubble.x, bubble.y, bubble.r, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.78)"; ctx.beginPath(); ctx.arc(bubble.x - bubble.r * .34, bubble.y - bubble.r * .34, bubble.r * .15, 0, TAU); ctx.fill();
      });
      sparkles = sparkles.filter((sparkle) => sparkle.life > 0);
      sparkles.forEach((sparkle) => { sparkle.x += sparkle.vx; sparkle.y += sparkle.vy; sparkle.life -= .025; ctx.globalAlpha = sparkle.life; ctx.fillStyle = sparkle.color; ctx.fillRect(sparkle.x, sparkle.y, 4, 4); });
      ctx.globalAlpha = 1;
    }

    canvas.addEventListener("pointerdown", (event) => {
      const point = surface.point(event);
      let chosen = -1;
      for (let index = bubbles.length - 1; index >= 0; index -= 1) if (distance(point, bubbles[index]) < bubbles[index].r + 15) { chosen = index; break; }
      if (chosen < 0) return;
      markPlayed(game);
      const bubble = bubbles.splice(chosen, 1)[0];
      tone(notes[bubble.note], 0, .3, "sine", .024);
      for (let index = 0; index < 12; index += 1) { const angle = index / 12 * TAU; sparkles.push({ x: bubble.x, y: bubble.y, vx: Math.cos(angle) * rand(1, 3), vy: Math.sin(angle) * rand(1, 3), life: 1, color: colors[bubble.note] }); }
      popped += 1;
      setScore(`泡泡 ${Math.min(popped, 20)} / 20`);
      setBest(game, popped);
      if (popped === 20) { playSound("success"); canvasMessage("你戳出了一首泡泡小曲！"); }
    });
    mount.querySelector("#newBubbles").addEventListener("click", () => { bubbles = Array.from({ length: 10 }, () => makeBubble(true)); });
    const stopLoop = loopFrame(draw);
    return () => { stopLoop(); surface.cleanup(); };
  }

  function renderCloudStudio(mount, game) {
    const canvas = canvasPanel(mount, game, "形状 0 / 8", `<span class="game-hint">轻点任意云朵让它变形</span><button class="action-button secondary" id="resetClouds">云朵归位</button>`);
    const names = ["云朵", "小鱼", "爱心", "飞船", "小兔", "小熊", "皇冠", "小船"];
    let width = 1;
    let height = 1;
    let clouds = [];
    const found = new Set();
    const surface = configureCanvas(canvas, (w, h) => {
      width = w; height = h;
      if (!clouds.length) clouds = Array.from({ length: 5 }, (_, index) => ({ x: (.13 + index * .19) * w, y: (.25 + (index % 2) * .28) * h, scale: rand(.78, 1.12), shape: 0, speed: rand(.025, .07) }));
    });

    function cloudPuffs(ctx, x, y, scale) {
      [[-27, 4, 25], [-8, -10, 31], [20, -4, 27], [37, 8, 20], [3, 10, 35]].forEach((puff) => { ctx.beginPath(); ctx.arc(x + puff[0] * scale, y + puff[1] * scale, puff[2] * scale, 0, TAU); ctx.fill(); });
    }

    function drawShape(ctx, cloud) {
      const x = cloud.x; const y = cloud.y; const s = cloud.scale;
      ctx.save(); ctx.fillStyle = "rgba(255,255,255,.96)"; ctx.strokeStyle = "#56798d"; ctx.lineWidth = 2;
      if (cloud.shape === 0) cloudPuffs(ctx, x, y, s);
      if (cloud.shape === 1) { ctx.beginPath(); ctx.ellipse(x, y, 43*s, 25*s, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(x-35*s,y);ctx.lineTo(x-61*s,y-22*s);ctx.lineTo(x-58*s,y+22*s);ctx.closePath();ctx.fill(); ctx.fillStyle="#56798d";ctx.beginPath();ctx.arc(x+20*s,y-6*s,3*s,0,TAU);ctx.fill(); }
      if (cloud.shape === 2) { ctx.beginPath(); ctx.moveTo(x,y+34*s); ctx.bezierCurveTo(x-62*s,y-4*s,x-34*s,y-46*s,x,y-18*s); ctx.bezierCurveTo(x+34*s,y-46*s,x+62*s,y-4*s,x,y+34*s); ctx.fill(); }
      if (cloud.shape === 3) { ctx.beginPath();ctx.ellipse(x,y,43*s,18*s,0,0,TAU);ctx.fill();ctx.fillRect(x-9*s,y-45*s,18*s,30*s);ctx.fillRect(x-59*s,y-5*s,24*s,10*s);ctx.fillRect(x+35*s,y-5*s,24*s,10*s); }
      if (cloud.shape === 4 || cloud.shape === 5) { ctx.beginPath();ctx.arc(x,y,35*s,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(x-27*s,y-28*s,(cloud.shape===4?13:16)*s,0,TAU);ctx.arc(x+27*s,y-28*s,(cloud.shape===4?13:16)*s,0,TAU);ctx.fill(); if(cloud.shape===4){ctx.fillRect(x-30*s,y-62*s,16*s,38*s);ctx.fillRect(x+14*s,y-62*s,16*s,38*s);} }
      if (cloud.shape === 6) { ctx.beginPath();ctx.moveTo(x-50*s,y+25*s);ctx.lineTo(x-42*s,y-30*s);ctx.lineTo(x-14*s,y);ctx.lineTo(x,y-38*s);ctx.lineTo(x+16*s,y);ctx.lineTo(x+45*s,y-30*s);ctx.lineTo(x+50*s,y+25*s);ctx.closePath();ctx.fill(); }
      if (cloud.shape === 7) { ctx.beginPath();ctx.moveTo(x-55*s,y);ctx.lineTo(x+52*s,y);ctx.lineTo(x+33*s,y+28*s);ctx.lineTo(x-37*s,y+28*s);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(x-5*s,y);ctx.lineTo(x-5*s,y-48*s);ctx.lineTo(x+36*s,y-8*s);ctx.closePath();ctx.fill(); }
      ctx.restore();
    }

    function draw() {
      const ctx = surface.context;
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#8fd0eb"); sky.addColorStop(1, "#eaf7ef"); ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#f1ca51"; ctx.beginPath(); ctx.arc(width - 55, 55, 28, 0, TAU); ctx.fill();
      clouds.forEach((cloud) => { cloud.x += reducedMotion ? 0 : cloud.speed; if (cloud.x > width + 70) cloud.x = -70; drawShape(ctx, cloud); });
      ctx.fillStyle = "rgba(57,118,90,.42)"; ctx.beginPath();ctx.moveTo(0,height);ctx.quadraticCurveTo(width*.3,height-75,width*.55,height-22);ctx.quadraticCurveTo(width*.78,height-80,width,height-28);ctx.lineTo(width,height);ctx.closePath();ctx.fill();
    }

    canvas.addEventListener("pointerdown", (event) => {
      const point = surface.point(event);
      const cloud = clouds.find((item) => distance(point, item) < 70 * item.scale);
      if (!cloud) return;
      markPlayed(game);
      cloud.shape = (cloud.shape + 1) % names.length;
      found.add(names[cloud.shape]);
      playSound("soft");
      setScore(`形状 ${found.size} / 8`);
      setBest(game, found.size);
      canvasMessage(`发现：${names[cloud.shape]}`);
      if (found.size === 8) playSound("success");
    });
    mount.querySelector("#resetClouds").addEventListener("click", () => { clouds.forEach((cloud) => { cloud.shape = 0; }); found.clear(); setScore("形状 0 / 8"); });
    const stopLoop = loopFrame(draw);
    return () => { stopLoop(); surface.cleanup(); };
  }

  function renderFireflyGarden(mount, game) {
    const canvas = canvasPanel(mount, game, "花朵 0 / 6", `<span class="game-hint">手指就是萤火虫的小灯笼</span><button class="action-button secondary" id="resetGarden">让花朵休息</button>`);
    let width = 1;
    let height = 1;
    let target = { x: 300, y: 220 };
    let fireflies = [];
    let flowers = [];
    const lit = new Set();
    const surface = configureCanvas(canvas, (w, h) => {
      width = w; height = h; target = { x: w * .5, y: h * .45 };
      fireflies = Array.from({ length: 14 }, (_, index) => ({ x: w * .5 + rand(-80,80), y: h * .45 + rand(-70,70), angle: index / 14 * TAU, phase: rand(0,TAU) }));
      flowers = Array.from({ length: 6 }, (_, index) => ({ x: w * (.1 + index * .16), y: h * (.72 + (index%2)*.12), color: ["#ed795d","#f1ca51","#d47caf","#67c3bd","#7397d8","#f09a5b"][index] }));
    });

    function draw(time) {
      const ctx = surface.context;
      const night = ctx.createLinearGradient(0,0,0,height); night.addColorStop(0,"#102c39");night.addColorStop(1,"#17372e");ctx.fillStyle=night;ctx.fillRect(0,0,width,height);
      ctx.fillStyle="#dfeefa";ctx.beginPath();ctx.arc(width-55,55,25,0,TAU);ctx.fill();ctx.fillStyle="#102c39";ctx.beginPath();ctx.arc(width-45,48,24,0,TAU);ctx.fill();
      ctx.fillStyle="#285d43";ctx.fillRect(0,height*.72,width,height*.28);
      flowers.forEach((flower,index) => {
        const on=lit.has(index);ctx.strokeStyle="#7fb07d";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(flower.x,flower.y+18);ctx.lineTo(flower.x,height);ctx.stroke();
        for(let petal=0;petal<6;petal+=1){const a=petal/6*TAU;ctx.fillStyle=on?flower.color:"#49685b";ctx.beginPath();ctx.ellipse(flower.x+Math.cos(a)*15,flower.y+Math.sin(a)*15,9,14,a,0,TAU);ctx.fill();}
        if(on){const glow=ctx.createRadialGradient(flower.x,flower.y,2,flower.x,flower.y,42);glow.addColorStop(0,"rgba(241,202,81,.75)");glow.addColorStop(1,"rgba(241,202,81,0)");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(flower.x,flower.y,42,0,TAU);ctx.fill();}
        ctx.fillStyle=on?"#f1ca51":"#2f4a3e";ctx.beginPath();ctx.arc(flower.x,flower.y,7,0,TAU);ctx.fill();
      });
      fireflies.forEach((fly,index) => {
        const desired={x:target.x+Math.cos(fly.angle+time*.0006)*rand(15,62),y:target.y+Math.sin(fly.angle+time*.0007)*rand(15,50)};
        fly.x+=(desired.x-fly.x)*(reducedMotion?.015:.035);fly.y+=(desired.y-fly.y)*(reducedMotion?.015:.035);
        const glow=ctx.createRadialGradient(fly.x,fly.y,1,fly.x,fly.y,13);glow.addColorStop(0,"rgba(255,244,160,1)");glow.addColorStop(1,"rgba(241,202,81,0)");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(fly.x,fly.y,13,0,TAU);ctx.fill();ctx.fillStyle="#fff4a0";ctx.beginPath();ctx.arc(fly.x,fly.y,2.5,0,TAU);ctx.fill();
        if(index===0) flowers.forEach((flower,flowerIndex)=>{if(!lit.has(flowerIndex)&&distance(fly,flower)<48){lit.add(flowerIndex);playSound("glow");setScore(`花朵 ${lit.size} / 6`);setBest(game,lit.size);if(lit.size===6){playSound("success");canvasMessage("整座花园都醒来了！");}}});
      });
    }

    const guide = (event) => { event.preventDefault(); target=surface.point(event); markPlayed(game); };
    canvas.addEventListener("pointerdown",guide);canvas.addEventListener("pointermove",guide);
    mount.querySelector("#resetGarden").addEventListener("click",()=>{lit.clear();setScore("花朵 0 / 6");});
    const stopLoop=loopFrame(draw);return()=>{stopLoop();surface.cleanup();};
  }

  function renderKaleidoscope(mount, game) {
    const colors=["#f1ca51","#ed795d","#67c3bd","#7397d8","#d47caf","#f6f1df"];
    let color=colors[0];let mirrors=8;let current=null;const strokes=[];
    const toolbar=`<div class="palette" aria-label="画笔颜色">${colors.map((value,index)=>`<button class="swatch ${index===0?"active":""}" data-color="${value}" style="background:${value}" aria-label="选择第 ${index+1} 种颜色"></button>`).join("")}</div><div class="segments" aria-label="镜面数量"><button data-mirrors="6">6面</button><button class="active" data-mirrors="8">8面</button><button data-mirrors="12">12面</button></div><div class="tool-group"><button class="tool-icon" id="undoKaleido" aria-label="撤销" title="撤销">↶</button><button class="tool-icon" id="clearKaleido" aria-label="清空" title="清空">×</button><button class="tool-icon" id="saveKaleido" aria-label="保存图片" title="保存图片">↓</button></div>`;
    const canvas=canvasPanel(mount,game,"镜面 8",toolbar);let surface;surface=configureCanvas(canvas,()=>{if(surface)draw();});
    function draw(){const{width,height}=surface.size();const ctx=surface.context;const cx=width/2,cy=height/2,scale=Math.min(width,height)*.44;ctx.fillStyle="#222039";ctx.fillRect(0,0,width,height);ctx.strokeStyle="rgba(255,255,255,.08)";ctx.lineWidth=1;for(let i=0;i<mirrors;i+=1){const a=i/mirrors*TAU;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*scale,cy+Math.sin(a)*scale);ctx.stroke();}ctx.strokeStyle="rgba(241,202,81,.2)";for(let ring=1;ring<=3;ring+=1){ctx.beginPath();ctx.arc(cx,cy,scale*ring*.18,0,TAU);ctx.stroke();}ctx.fillStyle="rgba(241,202,81,.42)";ctx.beginPath();ctx.arc(cx,cy,5,0,TAU);ctx.fill();strokes.forEach(stroke=>{for(let i=0;i<mirrors;i+=1){const angle=i/mirrors*TAU;for(const flip of [1,-1]){ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);ctx.scale(1,flip);ctx.strokeStyle=stroke.color;ctx.lineWidth=3;ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();stroke.points.forEach((point,index)=>{const x=point.x*scale,y=point.y*scale;if(index===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();ctx.restore();}}});}
    function normalized(event){const p=surface.point(event);const{width,height}=surface.size();const scale=Math.min(width,height)*.44;return{x:(p.x-width/2)/scale,y:(p.y-height/2)/scale};}
    canvas.addEventListener("pointerdown",event=>{event.preventDefault();canvas.setPointerCapture(event.pointerId);markPlayed(game);current={color,points:[normalized(event)]};strokes.push(current);playSound("soft");});
    canvas.addEventListener("pointermove",event=>{if(!current)return;event.preventDefault();current.points.push(normalized(event));draw();});
    const stop=()=>{current=null;setBest(game,strokes.length);};canvas.addEventListener("pointerup",stop);canvas.addEventListener("pointercancel",stop);
    mount.querySelectorAll("[data-color]").forEach(button=>button.addEventListener("click",()=>{color=button.dataset.color;mount.querySelectorAll("[data-color]").forEach(item=>item.classList.toggle("active",item===button));}));
    mount.querySelectorAll("[data-mirrors]").forEach(button=>button.addEventListener("click",()=>{mirrors=Number(button.dataset.mirrors);setScore(`镜面 ${mirrors}`);mount.querySelectorAll("[data-mirrors]").forEach(item=>item.classList.toggle("active",item===button));draw();}));
    mount.querySelector("#undoKaleido").addEventListener("click",()=>{strokes.pop();draw();});mount.querySelector("#clearKaleido").addEventListener("click",()=>{strokes.length=0;draw();});mount.querySelector("#saveKaleido").addEventListener("click",()=>downloadCanvas(canvas,"我的魔法万花筒"));draw();return surface.cleanup;
  }

  function renderRainbowCatcher(mount, game) {
    const canvas=canvasPanel(mount,game,"彩虹 0 / 7",`<span class="game-hint">左右移动手指控制篮子</span><button class="action-button secondary" id="resetRainbow">重新搭彩虹</button>`);
    const colors=["#db5144","#ed8b42","#f1ca51","#5da968","#3b82c4","#5d5eb7","#b34d91"];let width=1,height=1,basketX=300,caught=0,lastSpawn=0;let drops=[];const rainbow=new Set();
    const surface=configureCanvas(canvas,(w,h)=>{width=w;height=h;basketX=w/2;if(!drops.length)drops=Array.from({length:7},(_,i)=>makeDrop(true,i));});
    function makeDrop(anywhere,index){return{x:rand(25,Math.max(26,width-25)),y:anywhere?rand(20,height*.65):rand(-100,-20),speed:rand(.55,1.05),color:index===undefined?randInt(0,6):index,wobble:rand(0,TAU)};}
    function draw(time){const ctx=surface.context;const sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,"#cceaf3");sky.addColorStop(1,"#f8f3dc");ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
      for(let i=0;i<rainbow.size;i+=1){ctx.strokeStyle=colors[i];ctx.lineWidth=10;ctx.beginPath();ctx.arc(width*.5,height*.18,55+i*11,Math.PI,TAU);ctx.stroke();}
      if(time-lastSpawn>720&&drops.length<12){drops.push(makeDrop(false));lastSpawn=time;}
      drops.forEach(drop=>{drop.y+=reducedMotion?.2:drop.speed;drop.x+=Math.sin(time*.001+drop.wobble)*.08;ctx.fillStyle=colors[drop.color];ctx.beginPath();ctx.moveTo(drop.x,drop.y-15);ctx.bezierCurveTo(drop.x-15,drop.y+2,drop.x-10,drop.y+17,drop.x,drop.y+18);ctx.bezierCurveTo(drop.x+10,drop.y+17,drop.x+15,drop.y+2,drop.x,drop.y-15);ctx.fill();if(drop.y>height-55&&drop.y<height-20&&Math.abs(drop.x-basketX)<62){caught+=1;rainbow.add(drop.color);playSound("catch");Object.assign(drop,makeDrop(false));setScore(`彩虹 ${rainbow.size} / 7`);setBest(game,caught);if(rainbow.size===7){playSound("success");canvasMessage("七种颜色都到齐了！");}}else if(drop.y>height+25)Object.assign(drop,makeDrop(false));});
      ctx.fillStyle="#6c4935";ctx.beginPath();ctx.moveTo(basketX-64,height-45);ctx.lineTo(basketX+64,height-45);ctx.lineTo(basketX+45,height-12);ctx.lineTo(basketX-45,height-12);ctx.closePath();ctx.fill();ctx.strokeStyle="#f1ca51";ctx.lineWidth=5;ctx.beginPath();ctx.arc(basketX,height-44,48,Math.PI,TAU);ctx.stroke();}
    const move=event=>{event.preventDefault();basketX=clamp(surface.point(event).x,65,width-65);markPlayed(game);};canvas.addEventListener("pointerdown",move);canvas.addEventListener("pointermove",move);
    mount.querySelector("#resetRainbow").addEventListener("click",()=>{rainbow.clear();caught=0;setScore("彩虹 0 / 7");});const stopLoop=loopFrame(draw);return()=>{stopLoop();surface.cleanup();};
  }

  function renderAquarium(mount, game) {
    const canvas=canvasPanel(mount,game,"投喂 0",`<span class="game-hint">轻点水中任意位置投食</span><button class="action-button secondary" id="resetOcean">清理食物</button>`);
    const fishColors=["#f1ca51","#ed795d","#67c3bd","#7397d8","#d47caf"];let width=1,height=1,fed=0;let fish=[];let food=[];let bubbles=[];
    const surface=configureCanvas(canvas,(w,h)=>{width=w;height=h;if(!fish.length)fish=Array.from({length:7},(_,i)=>({x:rand(50,w-50),y:rand(80,h-90),vx:rand(.25,.65)*(Math.random()>.5?1:-1),color:fishColors[i%fishColors.length],size:rand(.78,1.18)}));});
    function drawFish(ctx,item){ctx.save();ctx.translate(item.x,item.y);ctx.scale(item.vx<0?-1:1,1);ctx.fillStyle=item.color;ctx.strokeStyle="#173f4c";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,31*item.size,18*item.size,0,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-25*item.size,0);ctx.lineTo(-49*item.size,-20*item.size);ctx.lineTo(-49*item.size,20*item.size);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle="#173f4c";ctx.beginPath();ctx.arc(14*item.size,-4*item.size,3,0,TAU);ctx.fill();ctx.restore();}
    function draw(time){const ctx=surface.context;const sea=ctx.createLinearGradient(0,0,0,height);sea.addColorStop(0,"#9edfe7");sea.addColorStop(1,"#126777");ctx.fillStyle=sea;ctx.fillRect(0,0,width,height);ctx.fillStyle="#d9c58c";ctx.fillRect(0,height-45,width,45);
      for(let x=25;x<width;x+=80){ctx.strokeStyle=x%160?"#39765a":"#8b4d75";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x,height);ctx.quadraticCurveTo(x+20,height-65,x-5,height-115);ctx.stroke();}
      food.forEach(item=>{item.y=Math.min(height-55,item.y+.35);ctx.fillStyle="#8b5a2b";ctx.beginPath();ctx.arc(item.x,item.y,5,0,TAU);ctx.fill();});
      fish.forEach(item=>{let target=null;if(food.length)target=food.reduce((best,next)=>distance(item,next)<distance(item,best)?next:best,food[0]);if(target){const dx=target.x-item.x,dy=target.y-item.y;item.vx+=Math.sign(dx)*.012;item.vx=clamp(item.vx,-1.1,1.1);item.y+=clamp(dy,-1,1)*.42;if(distance(item,target)<23){food.splice(food.indexOf(target),1);fed+=1;playSound("splash");setScore(`投喂 ${fed}`);setBest(game,fed);for(let i=0;i<6;i+=1)bubbles.push({x:item.x+rand(-10,10),y:item.y-10,r:rand(2,6),life:1});if(fed===8){playSound("success");canvasMessage("小鱼们送来一串谢谢泡泡！");}}}else item.y+=Math.sin(time*.001+item.x)*.08;item.x+=item.vx;if(item.x<-60){item.x=width+60;item.vx=Math.abs(item.vx);}if(item.x>width+60){item.x=-60;item.vx=-Math.abs(item.vx);}drawFish(ctx,item);});
      bubbles=bubbles.filter(item=>item.life>0);bubbles.forEach(item=>{item.y-=.55;item.life-=.004;ctx.globalAlpha=item.life;ctx.strokeStyle="white";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(item.x,item.y,item.r,0,TAU);ctx.stroke();});ctx.globalAlpha=1;}
    canvas.addEventListener("pointerdown",event=>{event.preventDefault();markPlayed(game);const point=surface.point(event);food.push({x:point.x,y:point.y});playSound("soft");});mount.querySelector("#resetOcean").addEventListener("click",()=>{food=[];});const stopLoop=loopFrame(draw);return()=>{stopLoop();surface.cleanup();};
  }

  function renderRhythm(mount, game) {
    let level=1;let pattern=[];let inputIndex=0;let listening=false;let timers=[];
    mount.innerHTML=`<div class="game-panel"><div class="panel-top">${instructionMarkup(game)}<span class="score-pill" id="gameScore">第 1 轮</span></div><div class="rhythm-stage"><div class="rhythm-visual" id="rhythmStatus">点“播放节奏”，先听一听</div><div class="drum-grid">${["咚","嗒","铃","啪"].map((name,index)=>`<button class="drum-pad" data-drum="${index}" style="--pad:${["#d9583b","#087e8b","#2764ad","#b64378"][index]}" aria-label="${name}鼓">${name}</button>`).join("")}</div><div class="beat-lights" id="beatLights" aria-hidden="true"></div><div class="rhythm-actions"><button class="action-button" id="playRhythm">▶ 播放节奏</button><button class="action-button secondary" id="newRhythm">换一个节奏</button></div></div></div>`;
    const pads=Array.from(mount.querySelectorAll(".drum-pad"));const status=mount.querySelector("#rhythmStatus");const lights=mount.querySelector("#beatLights");const frequencies=[196,261.63,329.63,440];
    function clearTimers(){timers.forEach(timer=>window.clearTimeout(timer));timers=[];}
    function makePattern(){pattern=Array.from({length:Math.min(3+level,7)},()=>randInt(0,3));inputIndex=0;lights.innerHTML=pattern.map(()=>"<i></i>").join("");status.textContent="点“播放节奏”，先听一听";}
    function flash(index){pads[index].classList.add("active");tone(frequencies[index],0,.22,index===1?"triangle":"sine",.03);const timer=window.setTimeout(()=>pads[index].classList.remove("active"),230);timers.push(timer);}
    function playPattern(){markPlayed(game);ensureAudio();clearTimers();listening=true;inputIndex=0;status.textContent="仔细听……";lights.querySelectorAll("i").forEach(item=>item.classList.remove("done"));pattern.forEach((value,index)=>{const timer=window.setTimeout(()=>{flash(value);const light=lights.children[index];if(light)light.classList.add("done");},350+index*520);timers.push(timer);});const end=window.setTimeout(()=>{listening=false;status.textContent="轮到你敲鼓啦";lights.querySelectorAll("i").forEach(item=>item.classList.remove("done"));},450+pattern.length*520);timers.push(end);}
    function hit(index){if(listening)return;markPlayed(game);flash(index);if(index===pattern[inputIndex]){const light=lights.children[inputIndex];if(light)light.classList.add("done");inputIndex+=1;if(inputIndex===pattern.length){status.textContent="节奏完全一样！";playSound("success");setBest(game,level);level+=1;setScore(`第 ${level} 轮`);const timer=window.setTimeout(()=>{makePattern();playPattern();},850);timers.push(timer);}}else{status.textContent="没关系，再听一次";playSound("soft");inputIndex=0;const timer=window.setTimeout(playPattern,650);timers.push(timer);}}
    pads.forEach(button=>button.addEventListener("click",()=>hit(Number(button.dataset.drum))));mount.querySelector("#playRhythm").addEventListener("click",playPattern);mount.querySelector("#newRhythm").addEventListener("click",()=>{clearTimers();makePattern();});makePattern();return clearTimers;
  }

  function renderPaperPlane(mount, game) {
    const canvas=canvasPanel(mount,game,"印章 0 / 8",`<span class="game-hint">上下移动手指控制纸飞机</span><button class="action-button secondary" id="resetPlane">新的旅行</button>`);
    let width=1,height=1,targetY=220,planeY=220,stamps=0;let rings=[];let clouds=[];
    const surface=configureCanvas(canvas,(w,h)=>{width=w;height=h;targetY=h*.5;planeY=h*.5;if(!rings.length)rings=Array.from({length:4},(_,i)=>({x:w+120+i*w*.34,y:rand(80,h-80),r:rand(28,42),hit:false}));if(!clouds.length)clouds=Array.from({length:7},()=>({x:rand(0,w),y:rand(40,h-40),s:rand(.55,1.25),speed:rand(.12,.35)}));});
    function drawCloud(ctx,cloud){ctx.fillStyle="rgba(255,255,255,.8)";ctx.beginPath();ctx.arc(cloud.x,cloud.y,24*cloud.s,0,TAU);ctx.arc(cloud.x+25*cloud.s,cloud.y+4*cloud.s,18*cloud.s,0,TAU);ctx.arc(cloud.x-23*cloud.s,cloud.y+7*cloud.s,17*cloud.s,0,TAU);ctx.fill();}
    function draw(){const ctx=surface.context;const sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,"#91d0e7");sky.addColorStop(1,"#f4f0cf");ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);clouds.forEach(cloud=>{cloud.x-=reducedMotion?.04:cloud.speed;if(cloud.x<-80)cloud.x=width+80;drawCloud(ctx,cloud);});planeY+=(targetY-planeY)*(reducedMotion?.035:.09);
      rings.forEach(ring=>{ring.x-=reducedMotion?.35:1.05;if(!ring.hit&&ring.x<155&&ring.x>85&&Math.abs(ring.y-planeY)<ring.r){ring.hit=true;stamps+=1;playSound("catch");setScore(`印章 ${Math.min(stamps,8)} / 8`);setBest(game,stamps);if(stamps===8){playSound("success");canvasMessage("纸飞机完成了一次彩云旅行！");}}if(ring.x<-70){const far=Math.max(...rings.map(item=>item.x));ring.x=Math.max(width+100,far+width*.3);ring.y=rand(70,height-70);ring.r=rand(28,42);ring.hit=false;}ctx.strokeStyle=ring.hit?"rgba(255,255,255,.25)":"#f1ca51";ctx.lineWidth=8;ctx.beginPath();ctx.arc(ring.x,ring.y,ring.r,0,TAU);ctx.stroke();ctx.strokeStyle="rgba(24,33,39,.45)";ctx.lineWidth=2;ctx.stroke();});
      ctx.save();ctx.translate(120,planeY);ctx.rotate((targetY-planeY)*.0015);ctx.fillStyle="#fffef9";ctx.strokeStyle="#182127";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-45,-21);ctx.lineTo(48,0);ctx.lineTo(-45,22);ctx.lineTo(-18,2);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-18,2);ctx.lineTo(48,0);ctx.lineTo(-8,13);ctx.stroke();ctx.restore();}
    const guide=event=>{event.preventDefault();targetY=clamp(surface.point(event).y,38,height-38);markPlayed(game);};canvas.addEventListener("pointerdown",guide);canvas.addEventListener("pointermove",guide);mount.querySelector("#resetPlane").addEventListener("click",()=>{stamps=0;setScore("印章 0 / 8");rings.forEach((ring,index)=>{ring.x=width+120+index*width*.34;ring.hit=false;});});const stopLoop=loopFrame(draw);return()=>{stopLoop();surface.cleanup();};
  }

  function miniPanel(mount, game, score, body, actions) {
    mount.innerHTML = `<div class="game-panel mini-panel"><div class="panel-top">${instructionMarkup(game)}<span class="score-pill" id="gameScore">${escapeHtml(score)}</span></div><div class="mini-stage">${body}</div>${actions ? `<div class="toolbar mini-toolbar">${actions}</div>` : ""}</div>`;
  }

  function paintMiniBackground(ctx, width, height, scene, time) {
    const dark = ["space", "planet", "neon", "cave", "theater"].includes(scene);
    const ocean = scene === "ocean";
    const forest = ["forest", "garden"].includes(scene);
    const kitchen = scene === "kitchen";
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, dark ? "#17233f" : ocean ? "#8bd3de" : forest ? "#bfe0bd" : kitchen ? "#fff0ce" : "#dcecf1");
    gradient.addColorStop(1, dark ? "#2c2242" : ocean ? "#176f7c" : forest ? "#4f8257" : kitchen ? "#e4a778" : "#9cc4cf");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    if (dark) {
      ctx.fillStyle = "rgba(255,255,255,.55)";
      for (let index = 0; index < 38; index += 1) {
        const x = (index * 83 + 31) % width;
        const y = (index * 47 + 19) % Math.max(1, height - 60);
        const pulse = 1 + Math.sin((time || 0) * .001 + index) * .7;
        ctx.beginPath(); ctx.arc(x, y, pulse, 0, TAU); ctx.fill();
      }
    } else if (ocean) {
      ctx.strokeStyle = "rgba(255,255,255,.24)"; ctx.lineWidth = 3;
      for (let y = 35; y < height; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.quadraticCurveTo(width * .25, y - 12, width * .5, y); ctx.quadraticCurveTo(width * .75, y + 12, width, y); ctx.stroke(); }
    } else {
      ctx.fillStyle = "rgba(255,255,255,.22)";
      for (let index = 0; index < 10; index += 1) { ctx.beginPath(); ctx.arc((index * 97 + 40) % width, height - 28 - (index % 3) * 9, 22 + (index % 4) * 7, Math.PI, TAU); ctx.fill(); }
    }
  }

  function renderMiniArcade(mount, game) {
    const engines = {
      collect: renderMiniCollect, route: renderMiniRoute, builder: renderMiniBuilder,
      trail: renderMiniTrail, memory: renderMiniMemory, toggle: renderMiniToggle,
      recipe: renderMiniRecipe, tap: renderMiniTap, balance: renderMiniBalance
    };
    return (engines[game.mode] || renderMiniTap)(mount, game);
  }

  function renderMiniCollect(mount, game) {
    const config = game.config || {}; const goal = config.goal || 12;
    const canvas = canvasPanel(mount, game, `收集 0 / ${goal}`, `<span class="game-hint">按住并拖动主角</span><button class="action-button secondary" id="miniReset">重新开始</button>`);
    let width = 1; let height = 1; let score = 0; let player = { x: 100, y: 200 }; let targets = []; let obstacles = [];
    const surface = configureCanvas(canvas, (w, h) => {
      width = w; height = h; player = { x: w * .22, y: h * .5 };
      if (!targets.length) targets = Array.from({ length: 8 }, () => makeItem(false));
      if (!obstacles.length) obstacles = Array.from({ length: 5 }, () => makeItem(true));
    });
    function makeItem(obstacle) { return { x: rand(45, Math.max(46, width - 45)), y: rand(55, Math.max(56, height - 55)), vx: rand(-.28, .28), vy: rand(-.2, .2), r: obstacle ? 23 : 18, obstacle }; }
    function relocate(item) { Object.assign(item, makeItem(item.obstacle)); }
    function draw(time) {
      const ctx = surface.context; paintMiniBackground(ctx, width, height, config.scene, time);
      targets.forEach((item, index) => {
        item.x += item.vx; item.y += item.vy;
        if (item.x < 25 || item.x > width - 25) item.vx *= -1;
        if (item.y < 35 || item.y > height - 35) item.vy *= -1;
        const glow = ctx.createRadialGradient(item.x, item.y, 2, item.x, item.y, 28);
        glow.addColorStop(0, "rgba(255,226,111,.75)"); glow.addColorStop(1, "rgba(255,226,111,0)");
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(item.x, item.y, 28, 0, TAU); ctx.fill();
        ctx.fillStyle = index % 2 ? "#fff2a8" : "#ffffff"; ctx.font = "28px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(config.target || "✦", item.x, item.y);
        if (distance(player, item) < 38) {
          score += 1; relocate(item); playSound("catch"); setScore(`收集 ${Math.min(score, goal)} / ${goal}`); setBest(game, score);
          if (score === goal) { playSound("success"); canvasMessage("全部收集完成，还可以继续探索！"); }
        }
      });
      obstacles.forEach((item) => {
        item.x += item.vx; item.y += item.vy;
        if (item.x < 30 || item.x > width - 30) item.vx *= -1;
        if (item.y < 35 || item.y > height - 35) item.vy *= -1;
        ctx.globalAlpha = .7; ctx.font = "31px sans-serif"; ctx.fillText(config.obstacle || "●", item.x, item.y); ctx.globalAlpha = 1;
        if (distance(player, item) < 42) { player.x = clamp(player.x + (player.x - item.x) * .45, 30, width - 30); player.y = clamp(player.y + (player.y - item.y) * .45, 35, height - 35); }
      });
      ctx.save(); ctx.translate(player.x, player.y); ctx.font = "42px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(config.player || "🚀", 0, 0); ctx.restore();
    }
    const move = (event) => { event.preventDefault(); markPlayed(game); player = surface.point(event); player.x = clamp(player.x, 30, width - 30); player.y = clamp(player.y, 35, height - 35); };
    canvas.addEventListener("pointerdown", move); canvas.addEventListener("pointermove", (event) => { if (event.buttons || event.pressure) move(event); });
    mount.querySelector("#miniReset").addEventListener("click", () => { score = 0; targets = Array.from({ length: 8 }, () => makeItem(false)); setScore(`收集 0 / ${goal}`); });
    const stop = loopFrame(draw); return () => { stop(); surface.cleanup(); };
  }

  function makeGridRoute(size, length) {
    for (let restart = 0; restart < 80; restart += 1) {
      const path = [randInt(0, size * size - 1)];
      while (path.length < length) {
        const current = path[path.length - 1]; const x = current % size; const y = Math.floor(current / size);
        const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([nx, ny]) => nx >= 0 && nx < size && ny >= 0 && ny < size).map(([nx, ny]) => ny * size + nx).filter((cell) => !path.includes(cell));
        if (!neighbors.length) break;
        path.push(pick(neighbors));
      }
      if (path.length === length) return path;
    }
    return Array.from({ length }, (_, index) => index);
  }

  function renderMiniRoute(mount, game) {
    const config = game.config || {}; let stage = 1; let route = []; let step = 0;
    function newStage() { route = makeGridRoute(5, 5 + stage * 2); step = 0; draw(); }
    function draw() {
      miniPanel(mount, game, `路线 ${stage} / 3`, `<div class="route-scene scene-${escapeHtml(config.scene || "map")}"><div class="mini-route-grid">${Array.from({ length: 25 }, (_, cell) => {
        const routeIndex = route.indexOf(cell); const reached = routeIndex >= 0 && routeIndex < step; const current = routeIndex === Math.max(0, step - 1); const next = routeIndex === step; const finish = routeIndex === route.length - 1;
        return `<button type="button" data-cell="${cell}" class="${routeIndex >= 0 ? "track" : ""} ${reached ? "reached" : ""} ${current ? "current" : ""} ${next ? "next" : ""}" aria-label="${routeIndex >= 0 ? `路线第${routeIndex + 1}格` : "空地"}">${current ? escapeHtml(config.player || "●") : finish ? escapeHtml(config.target || "★") : routeIndex >= 0 ? "·" : ((cell * 7) % 11 === 0 ? "◆" : "")}</button>`;
      }).join("")}</div><p class="mini-status" id="miniStatus">${step ? `已走 ${step} 格，继续找相邻道路` : "轻点发光起点开始"}</p></div>`, `<button class="action-button secondary" id="newRoute">换一条路线</button>`);
      mount.querySelectorAll("[data-cell]").forEach((button) => button.addEventListener("click", () => {
        markPlayed(game); const cell = Number(button.dataset.cell);
        if (cell !== route[step]) { playSound("soft"); button.classList.add("route-wrong"); window.setTimeout(() => button.classList.remove("route-wrong"), 280); return; }
        step += 1; playSound("catch");
        if (step >= route.length) {
          setBest(game, stage); playSound("success");
          if (stage >= 3) { canvasMessage("三张路线全部接通！"); draw(); }
          else { stage += 1; window.setTimeout(newStage, 450); }
        } else draw();
      }));
      mount.querySelector("#newRoute").addEventListener("click", newStage);
    }
    newStage(); return null;
  }

  function renderMiniBuilder(mount, game) {
    const config = game.config || {}; const pieces = config.pieces || ["✦", "●", "▲", "■", "◆", "○"];
    let selected = pieces[0]; const placements = []; const used = new Set();
    const toolbar = `<div class="piece-palette">${pieces.map((piece, index) => `<button class="piece-button ${index === 0 ? "active" : ""}" data-piece="${escapeHtml(piece)}" aria-label="选择 ${escapeHtml(piece)}">${escapeHtml(piece)}</button>`).join("")}</div><div class="tool-group"><button class="tool-icon" id="clearBuild" aria-label="清空" title="清空">×</button><button class="tool-icon" id="saveBuild" aria-label="保存图片" title="保存图片">↓</button></div>`;
    const canvas = canvasPanel(mount, game, `部件 0 / ${pieces.length}`, toolbar); let surface;
    surface = configureCanvas(canvas, () => { if (surface) draw(); });
    function draw(time) {
      const { width, height } = surface.size(); const ctx = surface.context; paintMiniBackground(ctx, width, height, config.scene, time);
      if (["planet", "kitchen"].includes(config.scene)) { ctx.fillStyle = config.scene === "planet" ? "rgba(87,116,181,.8)" : "#e7ba75"; ctx.beginPath(); ctx.arc(width * .5, height * .55, Math.min(width, height) * .3, 0, TAU); ctx.fill(); }
      placements.forEach((item) => { ctx.save(); ctx.translate(item.x, item.y); ctx.rotate(item.rotation); ctx.font = `${item.size}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(item.piece, 0, 0); ctx.restore(); });
    }
    canvas.addEventListener("pointerdown", (event) => {
      event.preventDefault(); markPlayed(game); const point = surface.point(event);
      placements.push({ x: point.x, y: point.y, piece: selected, size: randInt(36, 62), rotation: rand(-.2, .2) }); used.add(selected); playSound("glow"); setScore(`部件 ${used.size} / ${pieces.length}`); setBest(game, used.size); draw();
      if (used.size === pieces.length) { playSound("success"); canvasMessage("六种部件都到齐，作品完成！"); }
    });
    mount.querySelectorAll("[data-piece]").forEach((button) => button.addEventListener("click", () => { selected = button.dataset.piece; mount.querySelectorAll("[data-piece]").forEach((item) => item.classList.toggle("active", item === button)); }));
    mount.querySelector("#clearBuild").addEventListener("click", () => { placements.length = 0; used.clear(); setScore(`部件 0 / ${pieces.length}`); draw(); });
    mount.querySelector("#saveBuild").addEventListener("click", () => downloadCanvas(canvas, game.title)); draw(); return surface.cleanup;
  }

  function renderMiniTrail(mount, game) {
    const config = game.config || {}; const colors = config.colors || ["#f1ca51", "#68c5d2", "#ef7aa1"];
    const canvas = canvasPanel(mount, game, "星环 0 / 5", `<span class="game-hint">按住画面自由绘光</span><button class="action-button secondary" id="clearTrail">清空光迹</button>`);
    let surface; let width = 1; let height = 1; let current = null; let targetIndex = 0; const strokes = []; let targets = [];
    surface = configureCanvas(canvas, (w, h) => { width = w; height = h; targets = [[.18,.28],[.42,.63],[.62,.3],[.78,.68],[.9,.38]].map(([x,y]) => ({ x:x*w, y:y*h })); if (surface) draw(); });
    function draw(time) {
      const ctx = surface.context; paintMiniBackground(ctx, width, height, config.scene, time);
      targets.forEach((target, index) => { ctx.strokeStyle = index < targetIndex ? "rgba(255,255,255,.25)" : index === targetIndex ? "#f1ca51" : "rgba(255,255,255,.45)"; ctx.lineWidth = index === targetIndex ? 7 : 3; ctx.beginPath(); ctx.arc(target.x,target.y,index===targetIndex?25:18,0,TAU);ctx.stroke(); ctx.fillStyle="#fff";ctx.font="18px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(config.target||"✧",target.x,target.y); });
      strokes.forEach((stroke, strokeIndex) => { ctx.strokeStyle = colors[strokeIndex % colors.length]; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 14; ctx.beginPath(); stroke.forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y)); ctx.stroke(); ctx.shadowBlur=0; });
    }
    function add(event) { if (!current) return; const point=surface.point(event); current.push(point); if(targetIndex<targets.length&&distance(point,targets[targetIndex])<34){targetIndex+=1;playSound("glow");setScore(`星环 ${targetIndex} / 5`);setBest(game,targetIndex);if(targetIndex===5){playSound("success");canvasMessage("光迹穿过了全部星环！");}} draw(); }
    canvas.addEventListener("pointerdown",event=>{event.preventDefault();canvas.setPointerCapture(event.pointerId);markPlayed(game);current=[];strokes.push(current);add(event);});
    canvas.addEventListener("pointermove",event=>{if(current){event.preventDefault();add(event);}}); const stop=()=>{current=null;};canvas.addEventListener("pointerup",stop);canvas.addEventListener("pointercancel",stop);
    mount.querySelector("#clearTrail").addEventListener("click",()=>{strokes.length=0;targetIndex=0;setScore("星环 0 / 5");draw();});draw();return surface.cleanup;
  }

  function renderMiniMemory(mount, game) {
    const config=game.config||{};const labels=config.pads||["1","2","3","4"];let level=1;let sequence=[];let input=0;let playing=false;let timers=[];
    function clearTimers(){timers.forEach((timer)=>window.clearTimeout(timer));timers=[];}
    miniPanel(mount,game,"第 1 轮",`<div class="mini-memory"><p id="memoryStatus">点播放，先观察和听</p><div class="mini-pad-grid">${labels.map((label,index)=>`<button type="button" class="mini-pad pad-${index}" data-pad="${index}">${escapeHtml(label)}</button>`).join("")}</div><div class="memory-lights" id="memoryLights"></div></div>`,`<button class="action-button" id="playMemory">▶ 播放</button><button class="action-button secondary" id="newMemory">换一个</button>`);
    const pads=Array.from(mount.querySelectorAll("[data-pad]"));const status=mount.querySelector("#memoryStatus");const lights=mount.querySelector("#memoryLights");const frequencies=[261.63,329.63,392,523.25];
    function makeSequence(){sequence=Array.from({length:Math.min(2+level,8)},()=>randInt(0,3));input=0;lights.innerHTML=sequence.map(()=>"<i></i>").join("");status.textContent="点播放，先观察和听";}
    function flash(index){pads[index].classList.add("active");tone(frequencies[index],0,.2,"sine",.026);timers.push(window.setTimeout(()=>pads[index].classList.remove("active"),220));}
    function play(){markPlayed(game);ensureAudio();clearTimers();playing=true;input=0;status.textContent="记住顺序……";lights.querySelectorAll("i").forEach((item)=>item.classList.remove("done"));sequence.forEach((value,index)=>timers.push(window.setTimeout(()=>{flash(value);lights.children[index]?.classList.add("done");},300+index*480)));timers.push(window.setTimeout(()=>{playing=false;status.textContent="轮到你啦";lights.querySelectorAll("i").forEach((item)=>item.classList.remove("done"));},400+sequence.length*480));}
    function hit(index){if(playing)return;markPlayed(game);flash(index);if(index===sequence[input]){lights.children[input]?.classList.add("done");input+=1;if(input===sequence.length){playSound("success");status.textContent="密码完全正确！";setBest(game,level);level=Math.min(6,level+1);setScore(`第 ${level} 轮`);timers.push(window.setTimeout(()=>{makeSequence();play();},800));}}else{playSound("soft");status.textContent="没关系，再看一次";input=0;timers.push(window.setTimeout(play,600));}}
    pads.forEach((button)=>button.addEventListener("click",()=>hit(Number(button.dataset.pad))));mount.querySelector("#playMemory").addEventListener("click",play);mount.querySelector("#newMemory").addEventListener("click",()=>{clearTimers();makeSequence();});makeSequence();return clearTimers;
  }

  function renderMiniToggle(mount, game) {
    const config=game.config||{};let stage=1;let size=3;let cells=[];
    function flip(index){const x=index%size;const y=Math.floor(index/size);[[x,y],[x+1,y],[x-1,y],[x,y+1],[x,y-1]].forEach(([nx,ny])=>{if(nx>=0&&nx<size&&ny>=0&&ny<size){const i=ny*size+nx;cells[i]=!cells[i];}});}
    function newPuzzle(){size=stage+2;cells=Array(size*size).fill(true);for(let i=0;i<stage+3;i+=1)flip(randInt(0,cells.length-1));if(cells.every(Boolean))flip(0);draw();}
    function draw(){miniPanel(mount,game,`灯阵 ${stage} / 3`,`<div class="toggle-wrap scene-${escapeHtml(config.scene||"lab")}"><div class="toggle-grid" style="--toggle-size:${size}">${cells.map((on,index)=>`<button type="button" data-toggle="${index}" class="${on?"on":""}" aria-label="${on?"已点亮":"未点亮"}">${on?escapeHtml(config.on||"◆"):escapeHtml(config.off||"◇")}</button>`).join("")}</div><p class="mini-status">目标：点亮全部方格</p></div>`,`<button class="action-button secondary" id="resetToggle">重置灯阵</button>`);mount.querySelectorAll("[data-toggle]").forEach((button)=>button.addEventListener("click",()=>{markPlayed(game);flip(Number(button.dataset.toggle));playSound("glow");if(cells.every(Boolean)){playSound("success");setBest(game,stage);if(stage<3){stage+=1;window.setTimeout(newPuzzle,450);}else{showToast("三块灯阵全部点亮！");draw();}}else draw();}));mount.querySelector("#resetToggle").addEventListener("click",newPuzzle);}
    newPuzzle();return null;
  }

  function renderMiniRecipe(mount, game) {
    const config=game.config||{};const ingredients=config.ingredients||["A","B","C","D"];const recipes=config.recipes||[[0,1,2],[2,3,1],[1,0,3]];let order=0;let recipe=[];let input=[];let hiding=false;let timer=0;
    function newRecipe(){recipe=pick(recipes).slice();input=[];hiding=false;draw();}
    function draw(){miniPanel(mount,game,`订单 ${Math.min(order+1,5)} / 5`,`<div class="recipe-stage"><p>${hiding?"按记住的顺序选择":"记住这张三步配方"}</p><div class="recipe-card ${hiding?"hidden":""}">${recipe.map((value,index)=>`<span class="${index<input.length?"done":""}">${hiding?"?":escapeHtml(ingredients[value])}</span>`).join("<i>→</i>")}</div><div class="ingredient-grid">${ingredients.map((item,index)=>`<button type="button" data-ingredient="${index}" ${hiding?"":"disabled"}>${escapeHtml(item)}</button>`).join("")}</div><p class="mini-status" id="recipeStatus">${hiding?`已选 ${input.length} / 3`:"看清顺序后开始"}</p></div>`,`<button class="action-button" id="startRecipe">${hiding?"再看配方":"开始调配"}</button><button class="action-button secondary" id="newRecipe">换一张</button>`);mount.querySelector("#startRecipe").addEventListener("click",()=>{hiding=!hiding;draw();});mount.querySelector("#newRecipe").addEventListener("click",newRecipe);mount.querySelectorAll("[data-ingredient]").forEach((button)=>button.addEventListener("click",()=>choose(Number(button.dataset.ingredient))));}
    function choose(value){markPlayed(game);if(value!==recipe[input.length]){playSound("soft");hiding=false;input=[];showToast("差一点，再看一遍配方");draw();return;}input.push(value);playSound("glow");if(input.length===recipe.length){order+=1;setBest(game,order);playSound("success");if(order>=5){showToast("五份订单全部完成！");order=0;}timer=window.setTimeout(newRecipe,650);}else draw();}
    newRecipe();return()=>window.clearTimeout(timer);
  }

  function renderMiniTap(mount, game) {
    const config=game.config||{};const goal=config.goal||12;const canvas=canvasPanel(mount,game,`发现 0 / ${goal}`,`<span class="game-hint">轻点带光圈的目标</span><button class="action-button secondary" id="resetTap">重新开始</button>`);let width=1,height=1,score=0;let target={x:200,y:180,vx:.4,vy:.3};let decoys=[];
    const surface=configureCanvas(canvas,(w,h)=>{width=w;height=h;target={x:rand(50,w-50),y:rand(60,h-60),vx:rand(-.6,.6),vy:rand(-.45,.45)};decoys=Array.from({length:11},()=>({x:rand(35,w-35),y:rand(45,h-45),phase:rand(0,TAU)}));});
    function relocate(){target.x=rand(55,width-55);target.y=rand(65,height-65);target.vx=rand(-.8,.8);target.vy=rand(-.6,.6);}
    function draw(time){const ctx=surface.context;paintMiniBackground(ctx,width,height,config.scene,time);decoys.forEach((item,index)=>{ctx.globalAlpha=.55;ctx.font=`${24+(index%3)*4}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(config.decoy||"◆",item.x,item.y+Math.sin(time*.001+item.phase)*5);});ctx.globalAlpha=1;target.x+=target.vx;target.y+=target.vy;if(target.x<45||target.x>width-45)target.vx*=-1;if(target.y<55||target.y>height-55)target.vy*=-1;const pulse=34+Math.sin(time*.005)*7;ctx.strokeStyle="#f1ca51";ctx.lineWidth=6;ctx.beginPath();ctx.arc(target.x,target.y,pulse,0,TAU);ctx.stroke();ctx.font="38px sans-serif";ctx.fillText(config.target||"✦",target.x,target.y);}
    canvas.addEventListener("pointerdown",event=>{event.preventDefault();markPlayed(game);const point=surface.point(event);if(distance(point,target)<48){score+=1;playSound("catch");setScore(`发现 ${Math.min(score,goal)} / ${goal}`);setBest(game,score);relocate();if(score===goal){playSound("success");canvasMessage("十二个目标全部发现！");}}else playSound("soft");});mount.querySelector("#resetTap").addEventListener("click",()=>{score=0;setScore(`发现 0 / ${goal}`);relocate();});const stop=loopFrame(draw);return()=>{stop();surface.cleanup();};
  }

  function renderMiniBalance(mount, game) {
    const config=game.config||{};const goal=config.goal||8;const canvas=canvasPanel(mount,game,`成功 0 / ${goal}`,`<span class="game-hint">光点进入绿色区域时行动</span><button class="action-button" id="balanceAction">${escapeHtml(config.action||"现在")}</button>`);let width=1,height=1,score=0,phase=0,speed=.0017;const surface=configureCanvas(canvas,(w,h)=>{width=w;height=h;});
    function position(time){return .5+Math.sin(time*speed+phase)*.43;}
    function draw(time){const ctx=surface.context;paintMiniBackground(ctx,width,height,config.scene,time);const y=height*.68;ctx.fillStyle="rgba(255,255,255,.75)";ctx.fillRect(width*.1,y-13,width*.8,26);ctx.fillStyle="#59a56d";ctx.fillRect(width*.42,y-13,width*.16,26);ctx.strokeStyle="#182127";ctx.lineWidth=3;ctx.strokeRect(width*.1,y-13,width*.8,26);const x=width*(.1+position(time)*.8);ctx.fillStyle="#f1ca51";ctx.strokeStyle="#182127";ctx.beginPath();ctx.arc(x,y,14,0,TAU);ctx.fill();ctx.stroke();ctx.font=`${54+score*2}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(config.object||"◆",width*.5,height*.38);for(let i=0;i<score;i+=1){ctx.fillStyle=["#ef795d","#67c3bd","#7397d8","#d47caf"][i%4];ctx.beginPath();ctx.arc(width*.5+(i%2?8:-8),height*.5-i*9,8,0,TAU);ctx.fill();}}
    function act(){markPlayed(game);const now=performance.now();const value=position(now);if(Math.abs(value-.5)<=.1){score+=1;phase+=.7;speed+=.00008;playSound("success");setScore(`成功 ${Math.min(score,goal)} / ${goal}`);setBest(game,score);if(score===goal)canvasMessage("完美完成，还可以继续挑战手感！");}else{playSound("soft");canvasMessage(value<.5?"稍微早了一点":"稍微晚了一点");}}
    mount.querySelector("#balanceAction").addEventListener("click",act);canvas.addEventListener("pointerdown",event=>{event.preventDefault();act();});const stop=loopFrame(draw);return()=>{stop();surface.cleanup();};
  }

  function renderBlockWorld(mount, game) {
    const config = game.config || {};
    const palette = config.palette || ["草地", "木头", "石头", "玻璃", "灯", "小屋"];
    const icons = config.icons || ["🌱", "🪵", "🪨", "▣", "✦", "🏠"];
    const columns = 10;
    const rows = 7;
    const cells = Array(columns * rows).fill(null);
    let selected = 0;
    let erase = false;
    let rotation = 0;
    const task = config.task ? `<p class="block-task"><strong>任务卡</strong>${escapeHtml(config.task)}</p>` : "";
    mount.innerHTML = `<div class="game-panel block-panel"><div class="panel-top">${instructionMarkup(game)}<span class="score-pill" id="gameScore">已建 0 / ${config.goal || 18}</span></div><div class="block-stage"><div class="block-world-grid" style="--block-columns:${columns};--block-rows:${rows}">${cells.map((_, index) => `<button type="button" class="block-cell" data-block-cell="${index}" aria-label="空白方块"></button>`).join("")}</div>${task}<p class="mini-status" id="blockStatus">选择方块，轻点网格开始建造</p></div><div class="toolbar block-toolbar"><div class="piece-palette">${palette.map((label, index) => `<button type="button" class="piece-button block-piece ${index === 0 ? "active" : ""}" data-block-piece="${index}" aria-label="选择${escapeHtml(label)}"><span>${escapeHtml(icons[index] || "■")}</span><small>${escapeHtml(label)}</small></button>`).join("")}</div><div class="tool-group"><button type="button" class="tool-icon ${erase ? "active" : ""}" id="blockErase" aria-label="擦除方块" title="擦除方块">⌫</button><button type="button" class="tool-icon" id="blockRotate" aria-label="旋转建筑视角" title="旋转建筑视角">↻</button><button type="button" class="tool-icon" id="blockClear" aria-label="清空建造" title="清空建造">×</button></div></div></div>`;
    const grid = mount.querySelector(".block-world-grid");
    const status = mount.querySelector("#blockStatus");
    const update = () => {
      grid.querySelectorAll("[data-block-cell]").forEach((button, index) => {
        const value = cells[index];
        button.textContent = value === null ? "" : icons[value.type] || "■";
        button.dataset.type = value === null ? "" : String(value.type);
        button.classList.toggle("filled", value !== null);
        button.style.setProperty("--block-rotation", `${value ? value.rotation : 0}deg`);
        button.setAttribute("aria-label", value === null ? "空白方块" : `已放置${palette[value.type] || "方块"}`);
      });
      const built = cells.filter(Boolean).length;
      setScore(`已建 ${built} / ${config.goal || 18}`);
      if (built >= (config.goal || 18)) {
        status.textContent = "任务完成！还可以继续添加细节。";
        canvasMessage("建造完成，欢迎继续设计！");
      }
    };
    grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-block-cell]");
      if (!button) return;
      markPlayed(game);
      const index = Number(button.dataset.blockCell);
      if (erase) cells[index] = null;
      else cells[index] = { type: selected, rotation };
      playSound(erase ? "soft" : "glow");
      update();
    });
    mount.querySelectorAll("[data-block-piece]").forEach((button) => button.addEventListener("click", () => {
      selected = Number(button.dataset.blockPiece); erase = false;
      mount.querySelectorAll("[data-block-piece]").forEach((item) => item.classList.toggle("active", item === button));
      mount.querySelector("#blockErase").classList.remove("active");
    }));
    mount.querySelector("#blockErase").addEventListener("click", () => {
      erase = !erase;
      mount.querySelector("#blockErase").classList.toggle("active", erase);
    });
    mount.querySelector("#blockRotate").addEventListener("click", () => { rotation = (rotation + 90) % 360; grid.classList.toggle("rotated"); playSound("tap"); });
    mount.querySelector("#blockClear").addEventListener("click", () => { cells.fill(null); update(); status.textContent = "网格清空了，重新设计吧"; });
    update();
    return null;
  }

  function renderCreativeCanvas(mount, game) {
    const config = game.config || {};
    const kind = config.kind || game.mode || "doodle";
    const colors = config.colors || ["#ef795d", "#f1ca51", "#67c3bd", "#7397d8", "#b878a8"];
    let color = colors[0];
    let surface;
    let current = null;
    const strokes = [];
    const cells = kind === "pixel" || kind === "mosaic" ? Array((config.size || 6) ** 2).fill(null) : null;
    const placements = [];
    const stickers = config.stickers || ["✦", "●", "☁", "🌿", "🐱"];
    const paletteMarkup = kind === "stickers"
      ? `<div class="piece-palette">${stickers.map((item, index) => `<button type="button" class="piece-button ${index === 0 ? "active" : ""}" data-sticker="${index}" aria-label="选择贴纸${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}</div>`
      : `<div class="palette" aria-label="选择颜色">${colors.map((value, index) => `<button type="button" class="swatch ${index === 0 ? "active" : ""}" data-creative-color="${value}" style="background:${value}" aria-label="选择第${index + 1}种颜色"></button>`).join("")}</div>`;
    const gridHint = cells ? `<span class="game-hint">点方格填色</span>` : `<span class="game-hint">按住画布自由创作</span>`;
    const toolbar = `${paletteMarkup}${gridHint}<div class="tool-group"><button type="button" class="tool-icon" id="creativeUndo" aria-label="撤销" title="撤销">↶</button><button type="button" class="tool-icon" id="creativeClear" aria-label="清空" title="清空">×</button><button type="button" class="tool-icon" id="creativeSave" aria-label="保存图片" title="保存图片">↓</button></div>`;
    const canvas = canvasPanel(mount, game, cells ? `完成 0 / ${cells.length}` : "自由创作", toolbar);
    let selectedSticker = stickers[0];
    surface = configureCanvas(canvas, () => { if (surface) draw(); });
    function draw() {
      const { width, height } = surface.size();
      const ctx = surface.context;
      ctx.clearRect(0, 0, width, height);
      if (kind === "cloud") {
        const sky = ctx.createLinearGradient(0, 0, 0, height); sky.addColorStop(0, "#8ec8e0"); sky.addColorStop(1, "#eaf6f7"); ctx.fillStyle = sky;
      } else if (kind === "doodle") { ctx.fillStyle = "#171f3d"; }
      else { ctx.fillStyle = "#fffdf5"; }
      ctx.fillRect(0, 0, width, height);
      if (kind === "doodle") {
        ctx.fillStyle = "rgba(255,255,255,.7)"; for (let i = 0; i < 54; i += 1) { ctx.beginPath(); ctx.arc((i * 71 + 24) % width, (i * 43 + 18) % height, i % 3 ? 1.5 : 2.5, 0, TAU); ctx.fill(); }
      }
      if (cells) {
        const size = config.size || 6; const cell = Math.min(width, height) * .82 / size; const ox = (width - cell * size) / 2; const oy = (height - cell * size) / 2;
        for (let i = 0; i < size * size; i += 1) { const x = i % size; const y = Math.floor(i / size); ctx.fillStyle = cells[i] || "#f4f0e8"; ctx.fillRect(ox + x * cell, oy + y * cell, cell - 2, cell - 2); ctx.strokeStyle = "rgba(24,33,39,.25)"; ctx.strokeRect(ox + x * cell, oy + y * cell, cell - 2, cell - 2); }
      }
      if (kind === "symmetry") { ctx.strokeStyle = "rgba(24,33,39,.18)"; ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height); ctx.stroke(); ctx.setLineDash([]); }
      strokes.forEach((stroke) => {
        if (!stroke.length) return;
        ctx.save(); ctx.lineWidth = kind === "clay" ? 28 : kind === "watercolor" ? 24 : 7; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = stroke[0].color; ctx.globalAlpha = kind === "watercolor" ? .2 : .9;
        ctx.beginPath(); stroke.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.stroke();
        if (kind === "symmetry") { ctx.translate(width, 0); ctx.scale(-1, 1); ctx.beginPath(); stroke.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.stroke(); }
        if (kind === "watercolor") { stroke.forEach((point) => { ctx.fillStyle = stroke[0].color; ctx.beginPath(); ctx.arc(point.x, point.y, 20, 0, TAU); ctx.fill(); }); }
        ctx.restore();
      });
      placements.forEach((item) => { ctx.font = `${item.size}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(item.sticker, item.x, item.y); });
    }
    function point(event) { return surface.point(event); }
    function setGrid(event) {
      const size = config.size || 6; const { width, height } = surface.size(); const cell = Math.min(width, height) * .82 / size; const p = point(event); const ox = (width - cell * size) / 2; const oy = (height - cell * size) / 2; const x = Math.floor((p.x - ox) / cell); const y = Math.floor((p.y - oy) / cell); if (x < 0 || x >= size || y < 0 || y >= size) return; cells[y * size + x] = color; markPlayed(game); playSound("glow"); setScore(`完成 ${cells.filter(Boolean).length} / ${cells.length}`); if (cells.every(Boolean)) canvasMessage("填色完成，作品亮起来了！"); draw();
    }
    canvas.addEventListener("pointerdown", (event) => { event.preventDefault(); canvas.setPointerCapture(event.pointerId); if (cells) { setGrid(event); return; } markPlayed(game); const p = point(event); if (kind === "stickers") { placements.push({ x: p.x, y: p.y, sticker: selectedSticker, size: randInt(34, 66) }); playSound("glow"); draw(); return; } current = [{ x: p.x, y: p.y, color }]; strokes.push(current); draw(); });
    canvas.addEventListener("pointermove", (event) => { if (!current || cells) return; event.preventDefault(); const p = point(event); current.push({ x: p.x, y: p.y, color }); draw(); });
    const stop = () => { current = null; setBest(game, strokes.length + placements.length); };
    canvas.addEventListener("pointerup", stop); canvas.addEventListener("pointercancel", stop);
    mount.querySelectorAll("[data-creative-color]").forEach((button) => button.addEventListener("click", () => { color = button.dataset.creativeColor; mount.querySelectorAll("[data-creative-color]").forEach((item) => item.classList.toggle("active", item === button)); }));
    mount.querySelectorAll("[data-sticker]").forEach((button) => button.addEventListener("click", () => { selectedSticker = stickers[Number(button.dataset.sticker)]; mount.querySelectorAll("[data-sticker]").forEach((item) => item.classList.toggle("active", item === button)); }));
    mount.querySelector("#creativeUndo").addEventListener("click", () => { strokes.pop(); placements.pop(); draw(); });
    mount.querySelector("#creativeClear").addEventListener("click", () => { strokes.length = 0; placements.length = 0; if (cells) cells.fill(null); setScore(cells ? `完成 0 / ${cells.length}` : "自由创作"); draw(); });
    mount.querySelector("#creativeSave").addEventListener("click", () => downloadCanvas(canvas, game.title));
    draw(); return surface.cleanup;
  }

  function renderElectronicKeyboard(mount, game) {
    const config = game.config || {};
    const pads = config.pads || ["Do", "Re", "Mi", "Fa", "Sol", "La", "Ti", "Do高"];
    const notes = config.notes || [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];
    const colors = config.colors || ["#e96b5c", "#e99150", "#e8bd4f", "#63a66a", "#54a6a5", "#668bc2", "#7e70b2", "#9b65a5"];
    const keyMap = config.keys || [];
    const timbres = ["sine", "triangle", "square"];
    const timbreNames = ["清亮", "木琴", "电子"];
    let timbre = 0;
    let recording = false;
    let playing = false;
    let song = [];
    let demoIndex = 0;
    let startedAt = 0;
    let timers = [];
    mount.innerHTML = `<div class="game-panel keyboard-panel"><div class="panel-top">${instructionMarkup(game)}<span class="score-pill" id="gameScore">音符 0</span></div><div class="keyboard-stage"><div class="keyboard-scene" id="keyboardScene"><div class="keyboard-sparkles" aria-hidden="true"></div><p id="keyboardStatus">轻点琴键，开始演奏</p></div><div class="keyboard-keys" role="group" aria-label="电子琴琴键">${pads.map((label, index) => `<button type="button" class="keyboard-key" data-key-index="${index}" style="--key-color:${colors[index % colors.length]}" aria-label="弹奏${escapeHtml(label)}" title="弹奏${escapeHtml(label)}${keyMap[index] ? `（${escapeHtml(keyMap[index])}键）` : ""}"><span>${escapeHtml(label)}</span><small>${escapeHtml(String(index + 1).padStart(2, "0"))}</small></button>`).join("")}</div><p class="keyboard-tip">弹奏时会自动记录音符；电脑上也可以用 ${escapeHtml(keyMap.slice(0, 8).join(" ") || "数字键")} 键演奏</p></div><div class="toolbar keyboard-toolbar"><div class="keyboard-actions"><button type="button" class="action-button" id="keyboardDemo">▶ 听示范</button><button type="button" class="action-button secondary" id="keyboardRecord" aria-pressed="false">● 录音</button><button type="button" class="action-button secondary" id="keyboardPlay" disabled>▷ 回放</button><button type="button" class="action-button secondary" id="keyboardTone">音色：清亮</button><button type="button" class="tool-icon" id="keyboardClear" aria-label="清空录音" title="清空录音">×</button></div></div></div>`;
    const keys = Array.from(mount.querySelectorAll("[data-key-index]"));
    const scene = mount.querySelector("#keyboardScene");
    const status = mount.querySelector("#keyboardStatus");
    const recordButton = mount.querySelector("#keyboardRecord");
    const playButton = mount.querySelector("#keyboardPlay");
    const clearButton = mount.querySelector("#keyboardClear");
    const toneButton = mount.querySelector("#keyboardTone");
    function clearTimers() { timers.forEach((timer) => window.clearTimeout(timer)); timers = []; playing = false; }
    function syncControls() {
      recordButton.textContent = recording ? "■ 停止录音" : "● 录音";
      recordButton.setAttribute("aria-pressed", String(recording));
      recordButton.classList.toggle("recording", recording);
      playButton.disabled = recording || playing || song.length === 0;
      clearButton.disabled = recording || playing || song.length === 0;
      toneButton.textContent = `音色：${timbreNames[timbre]}`;
    }
    function flash(index) {
      const key = keys[index];
      if (!key) return;
      key.classList.add("active");
      window.setTimeout(() => key.classList.remove("active"), 260);
      scene.classList.remove("keyboard-pulse");
      void scene.offsetWidth;
      scene.classList.add("keyboard-pulse");
    }
    function playNote(index, shouldRecord) {
      if (playing && shouldRecord !== false) return;
      const value = Number(index);
      if (!Number.isInteger(value) || value < 0 || value >= notes.length) return;
      ensureAudio();
      tone(notes[value], 0, .62, timbres[timbre], .038);
      flash(value);
      markPlayed(game);
      status.textContent = `${pads[value]} 响起了`;
      if (shouldRecord !== false && recording) {
        if (!startedAt) startedAt = performance.now();
        song.push(value);
        setScore(`音符 ${song.length}`);
        setBest(game, song.length);
        syncControls();
      }
    }
    function playSequence(sequence, label) {
      if (!sequence.length) return;
      clearTimers();
      playing = true;
      status.textContent = label;
      syncControls();
      sequence.forEach((index, step) => {
        timers.push(window.setTimeout(() => playNote(index, false), step * 350));
      });
      timers.push(window.setTimeout(() => { playing = false; status.textContent = "轮到你啦，试着弹一段吧"; syncControls(); }, sequence.length * 350 + 180));
    }
    function stopRecording() {
      recording = false;
      startedAt = 0;
      status.textContent = song.length ? `已录下 ${song.length} 个音符` : "还没有音符，试试轻点琴键";
      syncControls();
    }
    keys.forEach((key) => key.addEventListener("click", () => playNote(key.dataset.keyIndex, true)));
    mount.querySelector("#keyboardDemo").addEventListener("click", () => {
      const melodies = [[0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0], [0, 1, 2, 3, 4, 5, 6, 7], [0, 2, 4, 7, 4, 2, 0]];
      playSequence(melodies[demoIndex % melodies.length].filter((value) => value < pads.length), ["小星星示范", "上行阶梯示范", "彩虹问候示范"][demoIndex % 3]);
      demoIndex += 1;
    });
    recordButton.addEventListener("click", () => {
      if (playing) return;
      if (recording) { stopRecording(); return; }
      song = [];
      startedAt = 0;
      recording = true;
      status.textContent = "录音中，弹一段自己的旋律";
      setScore("音符 0");
      syncControls();
    });
    playButton.addEventListener("click", () => playSequence(song, "回放你的旋律"));
    clearButton.addEventListener("click", () => { song = []; startedAt = 0; status.textContent = "录音已清空，随时可以重新开始"; setScore("音符 0"); syncControls(); });
    toneButton.addEventListener("click", () => { timbre = (timbre + 1) % timbres.length; syncControls(); playSound("glow"); });
    function onKeydown(event) {
      const key = String(event.key || "").toLowerCase();
      const index = keyMap.findIndex((value) => String(value).toLowerCase() === key);
      if (index < 0) return;
      event.preventDefault();
      playNote(index, true);
    }
    window.addEventListener("keydown", onKeydown);
    syncControls();
    return () => { clearTimers(); window.removeEventListener("keydown", onKeydown); };
  }

  function renderSoundBoard(mount, game) {
    if (game.mode === "keyboard") return renderElectronicKeyboard(mount, game);
    const config = game.config || {};
    const pads = config.pads || ["低音", "中音", "高音", "回声"];
    const notes = config.notes || [261.63, 329.63, 392, 523.25];
    const colors = config.colors || ["#d9583b", "#087e8b", "#2764ad", "#b64378"];
    let count = 0;
    mount.innerHTML = `<div class="game-panel sound-panel"><div class="panel-top">${instructionMarkup(game)}<span class="score-pill" id="gameScore">声音 0</span></div><div class="sound-stage"><div class="sound-scene" id="soundScene"><div class="sound-orbits" aria-hidden="true"></div><p id="soundStatus">轻点一个声音开始</p></div><div class="sound-pad-grid">${pads.map((label, index) => `<button type="button" class="sound-pad" data-sound-pad="${index}" style="--sound-color:${colors[index % colors.length]}" aria-label="播放${escapeHtml(label)}"><span>${escapeHtml(label)}</span><i aria-hidden="true"></i></button>`).join("")}</div></div><div class="toolbar mini-toolbar"><button type="button" class="action-button secondary" id="soundClear">重新开始</button></div></div>`;
    const scene = mount.querySelector("#soundScene");
    mount.querySelectorAll("[data-sound-pad]").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.soundPad); markPlayed(game); ensureAudio(); tone(notes[index % notes.length], 0, .34, index % 2 ? "sine" : "triangle", .035); playSound("glow"); count += 1; setScore(`声音 ${count}`); button.classList.add("active"); window.setTimeout(() => button.classList.remove("active"), 420); scene.classList.remove("sound-pulse"); void scene.offsetWidth; scene.classList.add("sound-pulse"); scene.querySelector("p").textContent = `${pads[index]}响起了`; setBest(game, count);
    }));
    mount.querySelector("#soundClear").addEventListener("click", () => { count = 0; setScore("声音 0"); scene.querySelector("p").textContent = "轻点一个声音开始"; });
    return null;
  }

  function renderPhysics(mount, game) {
    const config = game.config || {};
    const kind = config.kind || game.mode || "bubbles";
    const colors = config.colors || ["#ef795d", "#f1ca51", "#67c3bd", "#7397d8"];
    const canvas = canvasPanel(mount, game, "互动 0", `<span class="game-hint">触摸画面试试看</span><button type="button" class="action-button secondary" id="physicsClear">重新开始</button>`);
    let surface; let width = 1; let height = 1; let count = 0; let pointer = null; let objects = [];
    const reset = () => {
      objects = [];
      if (kind === "bubbles") objects = Array.from({ length: 36 }, (_, index) => ({ x: 35 + (index % 9) * 55, y: 38 + Math.floor(index / 9) * 55, r: 21, color: colors[index % colors.length], popped: false }));
      if (kind === "leaves") objects = Array.from({ length: 28 }, (_, index) => ({ x: rand(35, width - 35), y: rand(55, height - 35), r: rand(11, 18), color: colors[index % colors.length], vx: 0, vy: 0 }));
      if (kind === "ripple") objects = [];
      count = 0; setScore("互动 0"); draw();
    };
    surface = configureCanvas(canvas, (w, h) => { width = w; height = h; });
    function draw(time) {
      const ctx = surface.context; ctx.fillStyle = kind === "bubbles" || kind === "ripple" ? "#cfeef0" : kind === "sand" ? "#f0dfbf" : kind === "snow" ? "#eaf4fb" : "#f7eade"; ctx.fillRect(0, 0, width, height);
      if (kind === "bubbles") objects.forEach((o) => { if (o.popped) return; ctx.fillStyle = o.color; ctx.globalAlpha = .32; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = o.color; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.beginPath(); ctx.arc(o.x - 6, o.y - 7, 4, 0, TAU); ctx.fill(); });
      if (kind === "leaves") objects.forEach((o) => { o.x += o.vx; o.y += o.vy; ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(Math.sin((time || 0) * .001 + o.x) * .3); ctx.fillStyle = o.color; ctx.beginPath(); ctx.ellipse(0, 0, o.r, o.r * .55, 0, 0, TAU); ctx.fill(); ctx.restore(); });
      if (kind === "ripple") { objects.forEach((o) => { o.radius += 1.8; o.alpha -= .009; ctx.strokeStyle = `rgba(39,119,139,${Math.max(0, o.alpha)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(o.x, o.y, o.radius, 0, TAU); ctx.stroke(); }); objects = objects.filter((o) => o.alpha > 0); }
      if (kind === "domino") { objects.forEach((o) => { ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rotation || 0); ctx.fillStyle = o.color; ctx.fillRect(-6, -25, 12, 50); ctx.restore(); }); }
      if (kind === "sand") { objects.forEach((o) => { o.vy = Math.min(4, o.vy + .08); o.y += o.vy; if (o.y > height - 10) { o.y = height - 10; o.vy *= -.18; } ctx.fillStyle = o.color; ctx.fillRect(o.x, o.y, 4, 4); }); }
      if (kind === "fluid" || kind === "slime") { objects.forEach((o) => { o.x += (o.tx - o.x) * .025; o.y += (o.ty - o.y) * .025; ctx.fillStyle = o.color; ctx.globalAlpha = kind === "fluid" ? .35 : .75; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }); }
      if (kind === "jelly") { const p = pointer || { x: width / 2, y: height / 2 }; ctx.fillStyle = colors[0]; ctx.globalAlpha = .76; ctx.beginPath(); ctx.ellipse(p.x, p.y, 90 + Math.sin((time || 0) * .004) * 8, 68 - Math.sin((time || 0) * .004) * 7, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = colors[1] || "#182127"; ctx.lineWidth = 4; ctx.stroke(); }
      if (kind === "snow") { const p = pointer || { x: width / 2, y: height / 2 }; ctx.fillStyle = "#fff"; ctx.strokeStyle = "#557fa2"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 28 + Math.min(55, count * 2), 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#557fa2"; ctx.font = "18px sans-serif"; ctx.textAlign = "center"; ctx.fillText("❄", p.x, p.y + 6); }
      if (pointer && kind !== "jelly" && kind !== "snow") { ctx.fillStyle = "rgba(255,255,255,.65)"; ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 9, 0, TAU); ctx.fill(); }
    }
    function interact(event) {
      event.preventDefault(); pointer = surface.point(event); markPlayed(game);
      if (kind === "bubbles") { const hit = objects.find((o) => !o.popped && distance(o, pointer) < o.r + 8); if (hit) { hit.popped = true; count += 1; playSound("pop"); } }
      else if (kind === "ripple") { objects.push({ x: pointer.x, y: pointer.y, radius: 2, alpha: 1 }); count += 1; playSound("splash"); }
      else if (kind === "domino") { objects.push({ x: pointer.x, y: pointer.y, color: colors[objects.length % colors.length], rotation: rand(-.12, .12) }); count += 1; playSound("tap"); }
      else if (kind === "sand") { for (let i = 0; i < 16; i += 1) objects.push({ x: pointer.x + rand(-12, 12), y: pointer.y + rand(-9, 9), vy: 0, color: colors[randInt(0, colors.length - 1)] }); count += 1; playSound("grain"); }
      else if (kind === "fluid" || kind === "slime") { objects.push({ x: pointer.x, y: pointer.y, tx: pointer.x + rand(-100, 100), ty: pointer.y + rand(-80, 80), r: rand(12, 28), color: colors[count % colors.length] }); count += 1; playSound("glow"); }
      else if (kind === "leaves") { objects.forEach((o) => { const d = distance(o, pointer); if (d < 70) { o.vx += (o.x - pointer.x) * .012; o.vy += (o.y - pointer.y) * .012; } }); count += 1; playSound("soft"); }
      else if (kind === "jelly" || kind === "snow") { count += 1; playSound("soft"); }
      setScore(`互动 ${count}`); setBest(game, count);
    }
    canvas.addEventListener("pointerdown", interact); canvas.addEventListener("pointermove", (event) => { if (pointer) interact(event); }); canvas.addEventListener("pointerup", () => { pointer = null; }); canvas.addEventListener("pointercancel", () => { pointer = null; });
    mount.querySelector("#physicsClear").addEventListener("click", reset);
    const stop = loopFrame(draw); reset(); return () => { stop(); surface.cleanup(); };
  }

  function renderSortingBoard(mount, game) {
    const config = game.config || {};
    const kind = config.kind || game.mode || "bins";
    const icons = config.icons || ["✦", "●", "▲", "■"];
    let score = 0;
    let selected = null;
    let first = null;
    const initialItems = kind === "puzzle" ? Array.from({ length: (config.size || 3) ** 2 }, (_, index) => icons[index % icons.length]) : (config.items || icons);
    let cards = initialItems.map((label, index) => ({ label, index, icon: icons[index % icons.length], matched: false }));
    if (kind === "memory") cards = cards.sort(() => Math.random() - .5);
    if (kind === "sequence" || kind === "puzzle") cards = cards.sort(() => Math.random() - .5);
    function shell(body, toolbar) {
      mount.innerHTML = `<div class="game-panel sorting-panel"><div class="panel-top">${instructionMarkup(game)}<span class="score-pill" id="gameScore">完成 0</span></div><div class="sorting-stage">${body}</div><div class="toolbar mini-toolbar">${toolbar || `<button type="button" class="action-button secondary" id="sortReset">重新开始</button>`}</div></div>`;
      mount.querySelector("#sortReset")?.addEventListener("click", reset);
    }
    function reset() {
      score = 0; selected = null; first = null; cards = initialItems.map((label, index) => ({ label, index, icon: icons[index % icons.length], matched: false })); if (kind === "memory" || kind === "sequence" || kind === "puzzle") cards.sort(() => Math.random() - .5); draw();
    }
    function updateScore() { setScore(`完成 ${score}`); setBest(game, score); }
    function draw() {
      if (kind === "memory") {
        shell(`<div class="sort-memory-grid">${cards.map((card, index) => `<button type="button" class="sort-memory-card ${card.matched || card.open ? "open" : ""}" data-sort-card="${index}">${card.open || card.matched ? escapeHtml(card.icon) : "?"}</button>`).join("")}</div><p class="mini-status" id="sortStatus">一次翻开两张卡片，找到相同图案</p>`);
        mount.querySelectorAll("[data-sort-card]").forEach((button) => button.addEventListener("click", () => memoryPick(Number(button.dataset.sortCard))));
      } else if (kind === "sequence") {
        shell(`<p class="sort-lead">把彩笔排成彩虹顺序</p><div class="sort-sequence">${cards.map((card, index) => `<button type="button" class="sort-sequence-card" data-sort-card="${index}" style="--sort-color:${config.colors?.[card.index] || "#d9e5e5"}">${escapeHtml(card.label)}</button>`).join("")}</div><p class="mini-status">先点一支，再点另一支交换位置</p>`);
        mount.querySelectorAll("[data-sort-card]").forEach((button) => button.addEventListener("click", () => sequencePick(Number(button.dataset.sortCard))));
      } else if (kind === "puzzle") {
        const size = config.size || 3;
        shell(`<p class="sort-lead">交换碎片，拼回完整图案</p><div class="sort-puzzle-grid" style="--sort-size:${size}">${cards.map((card, index) => `<button type="button" data-sort-card="${index}">${escapeHtml(card.icon)}</button>`).join("")}</div><p class="mini-status">点击两个碎片交换位置</p>`);
        mount.querySelectorAll("[data-sort-card]").forEach((button) => button.addEventListener("click", () => sequencePick(Number(button.dataset.sortCard))));
      } else {
        const bins = config.bins || ["盒子一", "盒子二", "盒子三", "盒子四"];
        shell(`<p class="sort-lead">先选物品，再选它的归属位置</p><div class="sort-items">${cards.map((card, index) => `<button type="button" class="sort-item ${card.matched ? "done" : ""}" data-sort-item="${index}" ${card.matched ? "disabled" : ""}>${escapeHtml(card.icon)}<small>${escapeHtml(card.label)}</small></button>`).join("")}</div><div class="sort-bins">${bins.map((bin, index) => `<button type="button" class="sort-bin" data-sort-bin="${index}">${escapeHtml(icons[index] || "▣")}<small>${escapeHtml(bin)}</small></button>`).join("")}</div><p class="mini-status" id="sortStatus">轻点物品开始整理</p>`);
        mount.querySelectorAll("[data-sort-item]").forEach((button) => button.addEventListener("click", () => { selected = Number(button.dataset.sortItem); mount.querySelectorAll("[data-sort-item]").forEach((item) => item.classList.toggle("selected", item === button)); mount.querySelector("#sortStatus").textContent = "现在选择它应该去的盒子"; }));
        mount.querySelectorAll("[data-sort-bin]").forEach((button) => button.addEventListener("click", () => binPick(Number(button.dataset.sortBin))));
      }
      updateScore();
    }
    function binPick(bin) {
      if (selected === null) return;
      const card = cards[selected]; const expected = card.index % (config.bins || icons).length;
      if (bin === expected) { card.matched = true; score += 1; playSound("catch"); if (cards.every((item) => item.matched)) canvasMessage("全部整理完成，真是收纳高手！"); }
      else { playSound("soft"); mount.querySelector("#sortStatus").textContent = "这个位置不太合适，再想一想"; }
      selected = null; draw();
    }
    function memoryPick(index) {
      const card = cards[index]; if (card.matched || card.open || first === index) return;
      card.open = true; playSound("tap");
      if (first === null) { first = index; draw(); return; }
      const other = cards[first];
      if (other.icon === card.icon) { card.matched = true; other.matched = true; score += 1; playSound("success"); first = null; draw(); }
      else { const old = first; first = null; draw(); window.setTimeout(() => { cards[old].open = false; card.open = false; draw(); }, 650); }
    }
    function sequencePick(index) {
      if (first === null) { first = index; mount.querySelectorAll("[data-sort-card]")[index]?.classList.add("selected"); return; }
      if (first === index) return;
      [cards[first], cards[index]] = [cards[index], cards[first]]; first = null; score = cards.reduce((total, card, position) => total + ((kind === "sequence" ? (config.target || ["红", "橙", "黄", "绿", "蓝", "紫"])[position] === card.label : card.index === position) ? 1 : 0), 0); playSound("glow"); draw(); if (score === cards.length) { playSound("success"); canvasMessage("拼图完成，顺序漂亮！"); }
    }
    draw(); return null;
  }

  function renderNature(mount, game) {
    const config = game.config || {};
    const kind = config.kind || game.mode || "garden";
    const icons = config.icons || ["🌱", "🌼", "✦", "🐠"];
    const colors = config.colors || ["#67c3bd", "#7397d8", "#d47caf", "#f1ca51"];
    const canvas = canvasPanel(mount, game, "发现 0", `<span class="game-hint">轻点或拖动画面探索</span><button type="button" class="action-button secondary" id="natureReset">重新开始</button>`);
    let surface; let width = 1; let height = 1; let count = 0; let season = 0; let stage = 0; const items = []; let pointerPosition = null;
    surface = configureCanvas(canvas, (w, h) => { width = w; height = h; });
    function draw(time) {
      const ctx = surface.context;
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      if (kind === "aurora") { gradient.addColorStop(0, "#142544"); gradient.addColorStop(1, "#3f6d7a"); }
      else if (kind === "undersea") { gradient.addColorStop(0, "#8ad7dc"); gradient.addColorStop(1, "#176b7a"); }
      else if (kind === "island") { gradient.addColorStop(0, "#9ed9e0"); gradient.addColorStop(1, "#2c8990"); }
      else { gradient.addColorStop(0, "#e9f6e7"); gradient.addColorStop(1, "#9ac28b"); }
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
      if (kind === "seasons") { const seasonIcons = icons; ctx.fillStyle = "#6b4a35"; ctx.fillRect(width * .46, height * .4, 26, height * .38); ctx.strokeStyle = ["#e87d87", "#55a969", "#d27b48", "#b9d4e8"][season]; ctx.lineWidth = 24; ctx.lineCap = "round"; [[.35,.36],[.62,.34],[.28,.48],[.72,.5]].forEach(([x,y]) => { ctx.beginPath(); ctx.moveTo(width * .48, height * .48); ctx.lineTo(width * x, height * y); ctx.stroke(); }); ctx.font = "72px sans-serif"; ctx.textAlign = "center"; ctx.fillText(seasonIcons[season], width * .5, height * .28); }
      if (kind === "aurora") { for (let i = 0; i < 4; i += 1) { ctx.strokeStyle = colors[i % colors.length]; ctx.globalAlpha = .55; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(-20, height * (.28 + i * .1)); ctx.bezierCurveTo(width * .25, height * (.12 + i * .1), width * .68, height * (.46 - i * .04), width + 20, height * (.25 + i * .12)); ctx.stroke(); } ctx.globalAlpha = 1; ctx.fillStyle = "#f1ca51"; for (let i = 0; i < 35; i += 1) { ctx.beginPath(); ctx.arc((i * 71 + 20) % width, (i * 43 + 18) % (height * .6), i % 3 ? 1.5 : 2.5, 0, TAU); ctx.fill(); } }
      if (kind === "garden" || kind === "seed") { ctx.fillStyle = "#7b5a3c"; ctx.fillRect(width * .1, height * .7, width * .8, height * .2); ctx.font = "46px sans-serif"; ctx.textAlign = "center"; ctx.fillText(icons[Math.min(stage, icons.length - 1)], width * .5, height * .62); items.forEach((item) => { ctx.font = `${item.size}px sans-serif`; ctx.fillText(item.icon, item.x, item.y); }); }
      if (kind === "undersea") { ctx.font = "42px sans-serif"; items.forEach((item) => { item.x += Math.sin((time || 0) * .001 + item.phase) * .4; ctx.fillText(item.icon, item.x, item.y); }); }
      if (kind === "island") { ctx.fillStyle = "#e6c174"; ctx.beginPath(); ctx.ellipse(width * .5, height * .62, width * .36, height * .2, 0, 0, TAU); ctx.fill(); ctx.font = "40px sans-serif"; items.forEach((item) => ctx.fillText(item.icon, item.x, item.y)); }
      if (kind === "butterfly") { ctx.font = "42px sans-serif"; items.forEach((item) => { item.x += Math.sin((time || 0) * .002 + item.phase) * .6; item.y += Math.cos((time || 0) * .001 + item.phase) * .3; ctx.fillText(item.icon, item.x, item.y); }); }
      if (pointerPosition) { ctx.fillStyle = "rgba(255,255,255,.65)"; ctx.beginPath(); ctx.arc(pointerPosition.x, pointerPosition.y, 10, 0, TAU); ctx.fill(); }
    }
    function interact(event) { event.preventDefault(); pointerPosition = surface.point(event); markPlayed(game); if (kind === "seasons") { season = (season + 1) % 4; playSound("glow"); } else if (kind === "seed") { stage = Math.min(5, stage + 1); playSound("catch"); } else { const icon = kind === "undersea" ? pick(icons) : kind === "butterfly" ? pick(icons.slice(0, 3)) : pick(icons); items.push({ x: pointerPosition.x, y: pointerPosition.y, icon, size: randInt(30, 56), phase: rand(0, TAU) }); count += 1; playSound("glow"); } setScore(`发现 ${count}`); setBest(game, count + stage); if ((kind === "seed" && stage === 5) || (kind !== "seed" && count >= 8)) canvasMessage("这片自然角落被你照顾得很好！"); draw(); }
    canvas.addEventListener("pointerdown", interact); canvas.addEventListener("pointermove", (event) => { if (kind === "undersea" || kind === "butterfly") interact(event); }); canvas.addEventListener("pointerup", () => { pointerPosition = null; }); canvas.addEventListener("pointercancel", () => { pointerPosition = null; });
    mount.querySelector("#natureReset").addEventListener("click", () => { count = 0; stage = 0; season = 0; items.length = 0; setScore("发现 0"); draw(); });
    const stop = loopFrame(draw); draw(); return () => { stop(); surface.cleanup(); };
  }

  function renderPuzzle(mount, game) {
    const config = game.config || {};
    const kind = config.kind || game.mode || "pipes";
    const size = config.size || 5;
    let board = [];
    let score = 0;
    let first = null;
    let targetPath = [];
    const symbols = kind === "pipes" ? ["╋", "┳", "┫", "┻"] : kind === "gears" ? ["⚙", "◉", "✦", "◌"] : ["·", "·", "·", "·"];
    function reset() {
      score = 0; first = null; board = Array.from({ length: size * size }, (_, index) => ({ value: randInt(0, symbols.length - 1), fixed: false }));
      if (kind === "gradient") board = Array.from({ length: size }, (_, index) => ({ value: size - index - 1 }));
      if (kind === "merge") board = Array.from({ length: size * size }, () => ({ value: Math.random() > .7 ? 2 : 0 }));
      targetPath = makeGridRoute(size, Math.max(5, size + 2));
      draw();
    }
    function draw() {
      const extra = kind === "ball" ? `<button type="button" class="action-button" id="puzzleStart">开始滚动</button>` : `<button type="button" class="action-button secondary" id="puzzleReset">重新开始</button>`;
      mount.innerHTML = `<div class="game-panel puzzle-panel"><div class="panel-top">${instructionMarkup(game)}<span class="score-pill" id="gameScore">进度 0</span></div><div class="puzzle-stage"><div class="puzzle-grid puzzle-${escapeHtml(kind)}" style="--puzzle-size:${size}">${board.map((cell, index) => `<button type="button" data-puzzle-cell="${index}" class="${cell.value ? "active" : ""}">${renderPuzzleCell(cell, index)}</button>`).join("")}</div><p class="mini-status" id="puzzleStatus">${puzzleHint()}</p></div><div class="toolbar mini-toolbar">${extra}</div></div>`;
      mount.querySelectorAll("[data-puzzle-cell]").forEach((button) => button.addEventListener("click", () => puzzlePick(Number(button.dataset.puzzleCell))));
      mount.querySelector("#puzzleReset")?.addEventListener("click", reset); mount.querySelector("#puzzleStart")?.addEventListener("click", () => { score += 1; setScore(`进度 ${score}`); playSound("success"); canvasMessage("小球沿着路线滚进洞里了！"); });
      setScore(`进度 ${score}`);
    }
    function puzzleHint() { return ({ pipes: "轻点管道旋转，连通水源和花园", oneline: "从起点开始依次点亮路线", gradient: "点击两个色块交换位置", merge: "点击相同数字方块进行合成", path: "点相邻格铺出一条路", gears: "点齿轮切换方向，接通动力", ball: "调整挡板后点击开始滚动" })[kind] || "轻点方格开始"; }
    function renderPuzzleCell(cell, index) {
      if (kind === "oneline") return targetPath.includes(index) ? (targetPath.indexOf(index) === 0 ? "起" : targetPath.indexOf(index) === targetPath.length - 1 ? "终" : "·") : "";
      if (kind === "gradient") { const hue = 12 + cell.value * 28; return `<span class="gradient-chip" style="--gradient-h:${hue}"></span>`; }
      if (kind === "merge") return cell.value ? String(cell.value) : "";
      if (kind === "path") return targetPath.includes(index) ? "·" : "";
      if (kind === "ball") return index === 0 ? "●" : index === size * size - 1 ? "◎" : cell.value ? "╱" : "";
      return symbols[cell.value % symbols.length];
    }
    function puzzlePick(index) {
      markPlayed(game); const cell = board[index];
      if (kind === "pipes" || kind === "gears" || kind === "ball") { cell.value = (cell.value + 1) % symbols.length; score += 1; playSound("tap"); }
      else if (kind === "oneline" || kind === "path") { const expected = targetPath[score % targetPath.length]; if (index === expected) { score += 1; playSound("catch"); } else playSound("soft"); }
      else if (kind === "gradient") { if (first === null) first = index; else { [board[first], board[index]] = [board[index], board[first]]; first = null; score += 1; playSound("glow"); } }
      else if (kind === "merge") { const neighbor = [index - 1, index + 1, index - size, index + size].find((other) => other >= 0 && other < board.length && board[other].value && board[other].value === cell.value); if (neighbor !== undefined) { board[index].value *= 2; board[neighbor].value = 0; score += board[index].value; playSound("success"); } }
      setScore(`进度 ${score}`); draw(); if (score >= (kind === "oneline" || kind === "path" ? targetPath.length : kind === "gradient" ? size : 8)) canvasMessage("挑战完成，还可以继续探索！");
    }
    reset(); return null;
  }

  function renderCurrent() {
    stopAmbient();
    if (cleanupGame) cleanupGame();
    cleanupGame = null;
    if (!GAME_ID) { renderHub(); return; }
    const game = CATALOG.find((item) => item.id === GAME_ID);
    if (!game) { appRoot.innerHTML = "<main class=error-page><div><h1>没有找到这个小游戏</h1><a href=../>返回轻松游乐场</a></div></main>"; return; }
    renderGame(game);
  }

  appRoot.addEventListener("pointerdown", (event) => {
    if (!(event.target instanceof Element) || !GAME_ID) return;
    const control = event.target.closest("button, a, canvas, input");
    if (!control) return;
    ensureAudio();
    if (control.matches("button, a")) playSound("tap");
  });

  appRoot.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const speechControl = event.target.closest(".speech-button");
    if (speechControl) { speak(speechControl.dataset.speech || "", speechControl); return; }
    const soundControl = event.target.closest("[data-sound-toggle]");
    if (soundControl) {
      progress.sound = !progress.sound;
      saveProgress();
      if (progress.sound) { ensureAudio(); playSound("success"); } else stopAmbient();
      updateSoundButton();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAmbient();
    else if (progress.sound && GAME_ID) ensureAudio();
  });
  window.addEventListener("beforeunload", () => { if (cleanupGame) cleanupGame(); stopAmbient(); });
  renderCurrent();
}());
