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
    const notes = AMBIENT[GAME_ID];
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
    document.title = "轻松游乐场 · 10款儿童放松小游戏";
    document.body.dataset.page = "hub";
    appRoot.innerHTML = `
      <header class="site-header">
        <a class="brand" href="../../"><span class="brand-mark">K</span><span><strong>Kamajoy</strong><small>轻松游乐场</small></span></a>
        <a class="home-link" href="../../">返回游戏首页</a>
      </header>
      <main class="hub-main">
        <section class="hub-intro">
          <div class="intro-copy"><p class="eyebrow">7-10岁 · 10款无压力小游戏</p><h1>轻松游乐场</h1><p>画一会儿、听一会儿、看一会儿。这里没有倒计时和失败惩罚，选一个喜欢的画面，玩几分钟就好。</p></div>
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
    cleanupGame = engines[game.id](mount, game) || null;
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
