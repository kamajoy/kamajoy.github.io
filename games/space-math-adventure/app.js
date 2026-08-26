"use strict";

const STORAGE_KEY = "spaceMathAdventureProgressV1";

const WORLDS = [
  { id: "moon", name: "月球基地", subtitle: "数字启航站", levels: [1, 2, 3, 4], unlockAt: 1, unlockText: "默认开放" },
  { id: "mars", name: "火星峡谷", subtitle: "规律探测区", levels: [5, 6, 7, 8], unlockAt: 5, unlockText: "完成第4关解锁" },
  { id: "saturn", name: "土星环城", subtitle: "终极智慧港", levels: [9, 10, 11, 12], unlockAt: 9, unlockText: "完成第8关解锁" }
];

const LEVELS = [
  { id: 1, world: "moon", title: "起飞热身", skill: "10以内加法", mode: "add10", icon: "＋" },
  { id: 2, world: "moon", title: "陨石减法", skill: "10以内减法", mode: "sub10", icon: "－" },
  { id: 3, world: "moon", title: "数字脚印", skill: "简单数字规律", mode: "sequenceEasy", icon: "↗" },
  { id: 4, world: "moon", title: "月面巡航", skill: "20以内加减法", mode: "mix20", icon: "±" },
  { id: 5, world: "mars", title: "能量比一比", skill: "算式大小比较", mode: "compare20", icon: "≷" },
  { id: 6, world: "mars", title: "晶石规律", skill: "图形排列规律", mode: "pattern", icon: "◆" },
  { id: 7, world: "mars", title: "火星补给", skill: "50以内进位加法", mode: "add50", icon: "＋" },
  { id: 8, world: "mars", title: "峡谷穿越", skill: "50以内退位减法", mode: "sub50", icon: "－" },
  { id: 9, world: "saturn", title: "信号解码", skill: "进阶数字规律", mode: "sequenceHard", icon: "⌁" },
  { id: 10, world: "saturn", title: "光环计算", skill: "100以内加减法", mode: "mix100", icon: "±" },
  { id: 11, world: "saturn", title: "找出异类", skill: "分类与逻辑", mode: "oddOne", icon: "◎" },
  { id: 12, world: "saturn", title: "银河总挑战", skill: "综合数学思维", mode: "final", icon: "★" }
];

const PLANET_COLORS = {
  moon: "#b8d2df",
  mars: "#ff8067",
  saturn: "#8ed88c"
};

const DEFAULT_STATE = {
  totalScore: 0,
  totalStars: 0,
  unlockedLevel: 1,
  results: {},
  history: [],
  sound: true
};

let state = loadState();
let session = null;
let transitionTimer = null;
let audioContext = null;
let toastTimer = null;

const els = {
  mapScreen: document.querySelector("#mapScreen"),
  gameScreen: document.querySelector("#gameScreen"),
  resultScreen: document.querySelector("#resultScreen"),
  planetMap: document.querySelector("#planetMap"),
  scoreValue: document.querySelector("#scoreValue"),
  starValue: document.querySelector("#starValue"),
  progressText: document.querySelector("#progressText"),
  progressFill: document.querySelector("#progressFill"),
  missionTip: document.querySelector("#missionTip"),
  coachBubble: document.querySelector("#coachBubble"),
  homeButton: document.querySelector("#homeButton"),
  backToMap: document.querySelector("#backToMap"),
  soundButton: document.querySelector("#soundButton"),
  soundIcon: document.querySelector("#soundIcon"),
  recordButton: document.querySelector("#recordButton"),
  drawerBackdrop: document.querySelector("#drawerBackdrop"),
  recordDrawer: document.querySelector("#recordDrawer"),
  closeDrawer: document.querySelector("#closeDrawer"),
  recordSummary: document.querySelector("#recordSummary"),
  badgeList: document.querySelector("#badgeList"),
  historyList: document.querySelector("#historyList"),
  historyCount: document.querySelector("#historyCount"),
  resetProgress: document.querySelector("#resetProgress"),
  levelWorld: document.querySelector("#levelWorld"),
  levelTitle: document.querySelector("#levelTitle"),
  questionNumber: document.querySelector("#questionNumber"),
  skillLabel: document.querySelector("#skillLabel"),
  miniPlanet: document.querySelector("#miniPlanet"),
  roundScore: document.querySelector("#roundScore"),
  streakValue: document.querySelector("#streakValue"),
  questionIcon: document.querySelector("#questionIcon"),
  questionType: document.querySelector("#questionType"),
  questionText: document.querySelector("#questionText"),
  questionPrompt: document.querySelector("#questionPrompt"),
  answerGrid: document.querySelector("#answerGrid"),
  feedback: document.querySelector("#feedback"),
  resultEyebrow: document.querySelector("#resultEyebrow"),
  resultTitle: document.querySelector("#resultTitle"),
  resultMessage: document.querySelector("#resultMessage"),
  resultPlanet: document.querySelector("#resultPlanet"),
  resultStars: document.querySelector("#resultStars"),
  resultScore: document.querySelector("#resultScore"),
  resultAccuracy: document.querySelector("#resultAccuracy"),
  resultStreak: document.querySelector("#resultStreak"),
  retryButton: document.querySelector("#retryButton"),
  nextButton: document.querySelector("#nextButton"),
  toast: document.querySelector("#toast")
};

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored || typeof stored !== "object") return { ...DEFAULT_STATE };
    return {
      ...DEFAULT_STATE,
      ...stored,
      unlockedLevel: Math.min(12, Math.max(1, Number(stored.unlockedLevel) || 1)),
      results: stored.results && typeof stored.results === "object" ? stored.results : {},
      history: Array.isArray(stored.history) ? stored.history.slice(0, 30) : []
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    showToast("学习记录暂时无法保存，但仍可继续游戏");
  }
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = rand(0, index);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function numberOptions(answer, spread = 5) {
  const values = new Set([answer]);
  let guard = 0;
  while (values.size < 4 && guard < 80) {
    const delta = rand(1, spread) * (Math.random() > .5 ? 1 : -1);
    values.add(Math.max(0, answer + delta));
    guard += 1;
  }
  for (let fallback = 0; values.size < 4; fallback += 1) values.add(answer + fallback + spread + 1);
  return shuffle([...values].map(String));
}

function arithmeticQuestion(kind, max, requireRegroup = false) {
  let left = 0;
  let right = 0;
  let answer = 0;
  let tries = 0;

  do {
    if (kind === "add") {
      left = rand(max > 20 ? 11 : 1, max - 2);
      right = rand(1, max - left);
      answer = left + right;
    } else {
      left = rand(max > 20 ? 21 : 3, max);
      right = rand(1, left - 1);
      answer = left - right;
    }
    tries += 1;
  } while (
    requireRegroup &&
    tries < 100 &&
    (kind === "add" ? (left % 10) + (right % 10) < 10 : (left % 10) >= (right % 10))
  );

  const symbol = kind === "add" ? "+" : "−";
  return {
    type: "算一算",
    icon: symbol,
    text: `${left} ${symbol} ${right} = ?`,
    prompt: "选择正确答案",
    answer: String(answer),
    options: numberOptions(answer, max <= 20 ? 4 : 9),
    hint: kind === "add" ? "可以从较大的数开始，继续往后数。" : `想一想：${left}拿走${right}，还剩多少？`
  };
}

function sequenceQuestion(hard = false) {
  if (!hard || Math.random() < .45) {
    const start = rand(1, hard ? 25 : 12);
    const step = rand(hard ? 3 : 1, hard ? 8 : 5);
    const sequence = Array.from({ length: 5 }, (_, index) => start + index * step);
    const answer = sequence[4];
    return {
      type: "找规律",
      icon: "↗",
      text: `${sequence.slice(0, 4).join("，")}，?`,
      prompt: "下一个数字是什么？",
      answer: String(answer),
      options: numberOptions(answer, hard ? 8 : 4),
      hint: `每次都增加${step}，看看最后一个数再加${step}。`
    };
  }

  const start = rand(2, 15);
  const stepA = rand(2, 5);
  const stepB = rand(stepA + 1, stepA + 5);
  const sequence = [start];
  for (let index = 1; index < 6; index += 1) {
    sequence.push(sequence[index - 1] + (index % 2 === 1 ? stepA : stepB));
  }
  const answer = sequence[5];
  return {
    type: "信号解码",
    icon: "⌁",
    text: `${sequence.slice(0, 5).join("，")}，?`,
    prompt: "两个不同的步子轮流出现，接下来是多少？",
    answer: String(answer),
    options: numberOptions(answer, 8),
    hint: `增加${stepA}、增加${stepB}，两个规律轮流出现。`
  };
}

function patternQuestion() {
  const symbolSets = [
    ["🚀", "⭐", "🪐"],
    ["◆", "●", "▲"],
    ["🌙", "☀️", "🌍"],
    ["🔴", "🟡", "🟢"]
  ];
  const symbols = shuffle(symbolSets[rand(0, symbolSets.length - 1)]);
  const patterns = [
    [0, 1, 0, 1, 0, 1],
    [0, 0, 1, 0, 0, 1],
    [0, 1, 2, 0, 1, 2],
    [0, 1, 1, 0, 1, 1]
  ];
  const pattern = patterns[rand(0, patterns.length - 1)];
  const answer = symbols[pattern[5]];
  return {
    type: "图形规律",
    icon: "◆",
    text: `${pattern.slice(0, 5).map((index) => symbols[index]).join("  ")}  ?`,
    prompt: "观察重复规律，选择下一个图形",
    answer,
    options: shuffle([...new Set(symbols)]).slice(0, 3),
    hint: "从开头找一组会重复出现的图形。",
    pattern: true
  };
}

function expression(max = 20) {
  const add = Math.random() > .45;
  if (add) {
    const left = rand(1, max - 2);
    const right = rand(1, max - left);
    return { text: `${left} + ${right}`, value: left + right };
  }
  const left = rand(3, max);
  const right = rand(1, left - 1);
  return { text: `${left} − ${right}`, value: left - right };
}

function compareQuestion(max = 20) {
  let left = expression(max);
  let right = expression(max);
  if (Math.random() < .25) {
    right = { text: `${left.value}`, value: left.value };
  }
  const answer = left.value === right.value ? "=" : left.value > right.value ? ">" : "<";
  return {
    type: "比一比",
    icon: "≷",
    text: `${left.text}  ○  ${right.text}`,
    prompt: "先算两边，再选择 >、< 或 =",
    answer,
    options: shuffle([">", "=", "<"]),
    hint: `左边等于${left.value}，右边等于${right.value}。`
  };
}

function oddOneQuestion() {
  const uniqueOdd = Math.random() > .5;
  const baseParity = uniqueOdd ? 0 : 1;
  const regulars = new Set();
  while (regulars.size < 3) {
    const number = rand(2, 24);
    if (number % 2 === baseParity) regulars.add(number);
  }
  let oddOne = rand(2, 24);
  while (oddOne % 2 === baseParity || regulars.has(oddOne)) oddOne = rand(2, 24);
  const options = shuffle([...regulars, oddOne].map(String));
  return {
    type: "逻辑分类",
    icon: "◎",
    text: options.join("　　"),
    prompt: "哪一个数字和其他三个不一样？",
    answer: String(oddOne),
    options,
    hint: uniqueOdd ? "其中三个是双数，只有一个是单数。" : "其中三个是单数，只有一个是双数。",
    pattern: true
  };
}

function makeQuestion(mode, questionIndex) {
  switch (mode) {
    case "add10": return arithmeticQuestion("add", 10);
    case "sub10": return arithmeticQuestion("sub", 10);
    case "sequenceEasy": return sequenceQuestion(false);
    case "mix20": return arithmeticQuestion(Math.random() > .5 ? "add" : "sub", 20);
    case "compare20": return compareQuestion(20);
    case "pattern": return patternQuestion();
    case "add50": return arithmeticQuestion("add", 50, true);
    case "sub50": return arithmeticQuestion("sub", 50, true);
    case "sequenceHard": return sequenceQuestion(true);
    case "mix100": return arithmeticQuestion(Math.random() > .5 ? "add" : "sub", 100, Math.random() > .35);
    case "oddOne": return oddOneQuestion();
    case "final": {
      const modes = ["mix100", "compare20", "sequenceHard", "pattern", "oddOne"];
      return makeQuestion(modes[questionIndex % modes.length], questionIndex);
    }
    default: return arithmeticQuestion("add", 10);
  }
}

function getWorld(worldId) {
  return WORLDS.find((world) => world.id === worldId);
}

function completedCount() {
  return LEVELS.filter((level) => state.results[level.id]).length;
}

function recalculateStars() {
  state.totalStars = Object.values(state.results).reduce((sum, result) => sum + (Number(result.stars) || 0), 0);
}

function updateHeader() {
  recalculateStars();
  els.scoreValue.textContent = Number(state.totalScore || 0).toLocaleString("zh-CN");
  els.starValue.textContent = state.totalStars;
  els.soundIcon.textContent = state.sound ? "♪" : "×";
  els.soundButton.setAttribute("aria-label", state.sound ? "关闭声音" : "打开声音");
}

function renderMap() {
  const count = completedCount();
  els.progressText.textContent = `${count} / 12 关`;
  els.progressFill.style.width = `${(count / 12) * 100}%`;
  els.missionTip.textContent = count === 12
    ? "所有星球都已点亮！继续挑战，让每一关都获得三颗星吧。"
    : "完成每个任务，收集星星，让整片银河亮起来！";
  els.coachBubble.textContent = count === 0
    ? "从月球基地出发吧！"
    : count === 12
      ? "银河队长，欢迎归航！"
      : `已经点亮${count}个信号站！`;

  els.planetMap.replaceChildren();
  WORLDS.forEach((world) => {
    const worldUnlocked = state.unlockedLevel >= world.unlockAt;
    const section = document.createElement("section");
    section.className = `world-section${worldUnlocked ? "" : " locked-world"}`;
    section.setAttribute("aria-labelledby", `world-${world.id}`);

    const info = document.createElement("div");
    info.className = "planet-info";
    info.innerHTML = `
      <div class="planet-visual world-${world.id}" aria-hidden="true"><span class="flag"></span></div>
      <h2 id="world-${world.id}">${world.name}</h2>
      <p>${world.subtitle}</p>
      ${worldUnlocked ? "" : `<span class="world-lock-note">⌁ ${world.unlockText}</span>`}
    `;

    const path = document.createElement("div");
    path.className = "level-path";
    world.levels.forEach((levelId) => {
      const level = LEVELS[levelId - 1];
      const result = state.results[levelId];
      const unlocked = levelId <= state.unlockedLevel;
      const current = unlocked && !result && levelId === state.unlockedLevel;
      const button = document.createElement("button");
      button.className = `level-button${result ? " complete" : ""}${current ? " current" : ""}${unlocked ? "" : " locked"}`;
      button.disabled = !unlocked;
      button.setAttribute("aria-label", unlocked
        ? `第${levelId}关，${level.title}${result ? `，已获得${result.stars}颗星` : ""}`
        : `第${levelId}关，尚未解锁`);

      const starMarkup = [1, 2, 3].map((star) => `<span class="${result && result.stars >= star ? "earned" : ""}">★</span>`).join("");
      button.innerHTML = `
        <span class="level-node">
          <span class="node-icon" aria-hidden="true">${unlocked ? levelId : "⌁"}</span>
          ${current ? "<span class=\"new-label\">出发</span>" : ""}
        </span>
        <span class="level-title">${level.title}</span>
        <span class="level-stars" aria-hidden="true">${starMarkup}</span>
      `;
      if (unlocked) button.addEventListener("click", () => startLevel(levelId));
      path.append(button);
    });

    section.append(info, path);
    els.planetMap.append(section);
  });

  updateHeader();
}

function showScreen(screen) {
  [els.mapScreen, els.gameScreen, els.resultScreen].forEach((item) => item.classList.toggle("active", item === screen));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showMap() {
  clearTimeout(transitionTimer);
  session = null;
  renderMap();
  showScreen(els.mapScreen);
}

function startLevel(levelId) {
  if (levelId > state.unlockedLevel) {
    showToast("先完成前面的任务，才能飞到这里哦");
    return;
  }
  clearTimeout(transitionTimer);
  const level = LEVELS[levelId - 1];
  session = {
    level,
    questions: Array.from({ length: 5 }, (_, index) => makeQuestion(level.mode, index)),
    index: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    firstCorrect: 0,
    attemptsCurrent: 0,
    locked: false
  };

  const world = getWorld(level.world);
  els.levelWorld.textContent = `${world.name} · 第${level.id}关`;
  els.levelTitle.textContent = level.title;
  els.skillLabel.textContent = level.skill;
  els.miniPlanet.style.setProperty("--mini-color", PLANET_COLORS[level.world]);
  els.roundScore.textContent = "0";
  els.streakValue.textContent = "0";
  renderQuestion();
  showScreen(els.gameScreen);
  playSound("launch");
}

function renderQuestion() {
  const question = session.questions[session.index];
  els.questionNumber.textContent = session.index + 1;
  els.questionIcon.textContent = question.icon;
  els.questionType.textContent = question.type;
  els.questionText.textContent = question.text;
  els.questionText.classList.toggle("pattern-text", Boolean(question.pattern));
  els.questionPrompt.textContent = question.prompt;
  els.answerGrid.replaceChildren();
  els.feedback.className = "feedback";
  els.feedback.querySelector(".feedback-icon").textContent = "";
  els.feedback.querySelector(".feedback-text").textContent = "认真观察，再选择答案";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.textContent = option;
    button.dataset.answer = option;
    button.setAttribute("aria-label", `选项${index + 1}：${option}`);
    button.addEventListener("click", () => answerQuestion(button, option));
    els.answerGrid.append(button);
  });

  document.querySelectorAll(".question-dot").forEach((dot, index) => {
    dot.classList.toggle("done", index < session.index);
    dot.classList.toggle("active", index === session.index);
  });
}

function answerQuestion(button, selected) {
  if (!session || session.locked) return;
  const question = session.questions[session.index];
  session.attemptsCurrent += 1;

  if (selected === question.answer) {
    session.locked = true;
    const firstTry = session.attemptsCurrent === 1;
    if (firstTry) {
      session.firstCorrect += 1;
      session.streak += 1;
    }
    session.maxStreak = Math.max(session.maxStreak, session.streak);
    const earned = firstTry ? 100 + session.streak * 10 : 60;
    session.score += earned;
    button.classList.add("correct");
    els.answerGrid.querySelectorAll("button").forEach((answerButton) => { answerButton.disabled = true; });
    setFeedback("success", "✓", firstTry ? `正确！连续答对奖励，+${earned}分` : `找到了！记住这个方法，+${earned}分`);
    els.roundScore.textContent = session.score;
    els.streakValue.textContent = session.streak;
    playSound("correct");
    transitionTimer = setTimeout(advanceQuestion, 1050);
  } else {
    session.streak = 0;
    els.streakValue.textContent = "0";
    button.classList.add("wrong");
    button.disabled = true;
    setFeedback("try-again", "↻", `再想一想：${question.hint}`);
    playSound("wrong");
  }
}

function setFeedback(className, icon, text) {
  els.feedback.className = `feedback ${className}`;
  els.feedback.querySelector(".feedback-icon").textContent = icon;
  els.feedback.querySelector(".feedback-text").textContent = text;
}

function advanceQuestion() {
  if (!session) return;
  if (session.index < session.questions.length - 1) {
    session.index += 1;
    session.attemptsCurrent = 0;
    session.locked = false;
    renderQuestion();
    return;
  }
  finishLevel();
}

function finishLevel() {
  const level = session.level;
  const accuracy = Math.round((session.firstCorrect / 5) * 100);
  const stars = session.firstCorrect === 5 ? 3 : session.firstCorrect >= 3 ? 2 : 1;
  const previous = state.results[level.id];
  state.results[level.id] = {
    stars: Math.max(stars, previous ? Number(previous.stars) || 0 : 0),
    bestScore: Math.max(session.score, previous ? Number(previous.bestScore) || 0 : 0),
    bestAccuracy: Math.max(accuracy, previous ? Number(previous.bestAccuracy) || 0 : 0),
    completedAt: new Date().toISOString()
  };
  state.totalScore = Number(state.totalScore || 0) + session.score;
  state.unlockedLevel = Math.max(state.unlockedLevel, Math.min(12, level.id + 1));
  state.history.unshift({
    date: new Date().toISOString(),
    level: level.id,
    title: level.title,
    world: level.world,
    skill: level.skill,
    score: session.score,
    stars,
    accuracy
  });
  state.history = state.history.slice(0, 30);
  recalculateStars();
  saveState();
  updateHeader();

  const threeStar = stars === 3;
  els.resultEyebrow.textContent = level.id === 12 ? "银河任务完成" : `${getWorld(level.world).name} · 任务完成`;
  els.resultTitle.textContent = threeStar ? "完美着陆！" : stars === 2 ? "漂亮着陆！" : "任务完成！";
  els.resultMessage.textContent = threeStar ? `你已经熟练掌握了${level.skill}` : `你完成了${level.skill}训练，再练一次可以获得更多星星`;
  els.resultPlanet.style.setProperty("--result-color", PLANET_COLORS[level.world]);
  els.resultStars.innerHTML = [1, 2, 3].map((star) => `<span class="${star <= stars ? "earned" : ""}">★</span>`).join("");
  els.resultScore.textContent = session.score;
  els.resultAccuracy.textContent = `${accuracy}%`;
  els.resultStreak.textContent = session.maxStreak;
  els.nextButton.innerHTML = level.id === 12 ? "返回星图<span aria-hidden=\"true\">›</span>" : "下一关<span aria-hidden=\"true\">›</span>";
  showScreen(els.resultScreen);
  playSound("complete");
}

function openRecords() {
  renderRecords();
  els.drawerBackdrop.hidden = false;
  els.recordDrawer.removeAttribute("inert");
  els.recordDrawer.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => els.recordDrawer.classList.add("open"));
  document.body.style.overflow = "hidden";
  setTimeout(() => els.closeDrawer.focus(), 150);
}

function closeRecords() {
  els.recordDrawer.classList.remove("open");
  els.recordDrawer.setAttribute("aria-hidden", "true");
  els.recordDrawer.setAttribute("inert", "");
  document.body.style.overflow = "";
  setTimeout(() => { els.drawerBackdrop.hidden = true; }, 280);
}

function renderRecords() {
  const completed = completedCount();
  const average = state.history.length
    ? Math.round(state.history.reduce((sum, item) => sum + Number(item.accuracy || 0), 0) / state.history.length)
    : 0;
  els.recordSummary.innerHTML = `
    <div class="summary-tile"><strong>${completed}</strong><small>已通关</small></div>
    <div class="summary-tile"><strong>${state.totalStars}</strong><small>星星总数</small></div>
    <div class="summary-tile"><strong>${average}%</strong><small>平均首答率</small></div>
  `;

  const badges = [
    { icon: "🚀", name: "首次升空", unlocked: completed >= 1 },
    { icon: "🌙", name: "月球先锋", unlocked: completed >= 4 },
    { icon: "🔎", name: "规律侦探", unlocked: Boolean(state.results[6]) },
    { icon: "🏅", name: "银河队长", unlocked: completed >= 12 }
  ];
  els.badgeList.innerHTML = badges.map((badge) => `
    <div class="badge${badge.unlocked ? " unlocked" : ""}">
      <span aria-hidden="true">${badge.unlocked ? badge.icon : "⌁"}</span>
      <small>${badge.name}</small>
    </div>
  `).join("");

  els.historyCount.textContent = state.history.length ? `共练习 ${state.history.length} 次` : "尚无记录";
  if (!state.history.length) {
    els.historyList.innerHTML = "<div class=\"empty-history\">完成第一关后，学习成果会出现在这里。</div>";
    return;
  }

  els.historyList.innerHTML = state.history.slice(0, 8).map((item) => {
    const date = new Date(item.date);
    const dateText = Number.isNaN(date.getTime()) ? "刚刚" : new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
    return `
      <div class="history-item">
        <div class="history-icon" aria-hidden="true">${item.world === "moon" ? "🌙" : item.world === "mars" ? "🔴" : "🪐"}</div>
        <div class="history-copy"><strong>第${item.level}关 · ${item.title}</strong><small>${dateText} · 首答率 ${item.accuracy}%</small></div>
        <div class="history-result">${"★".repeat(item.stars)}</div>
      </div>
    `;
  }).join("");
}

function resetProgress() {
  const confirmed = window.confirm("确定清空本机上的所有积分、星星和练习记录吗？此操作无法撤销。");
  if (!confirmed) return;
  state = { ...DEFAULT_STATE, results: {}, history: [] };
  saveState();
  closeRecords();
  showMap();
  showToast("学习记录已清空，可以重新出发啦");
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2300);
}

function playSound(type) {
  if (!state.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const sounds = {
      launch: [[350, 0], [520, .08]],
      correct: [[660, 0], [880, .1]],
      wrong: [[220, 0], [165, .12]],
      complete: [[523, 0], [659, .12], [784, .24], [1047, .38]]
    };
    const notes = sounds[type] || sounds.correct;
    notes.forEach(([frequency, delay], index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = type === "wrong" ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, audioContext.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(.11, audioContext.currentTime + delay + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + delay + (index === notes.length - 1 ? .28 : .18));
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(audioContext.currentTime + delay);
      oscillator.stop(audioContext.currentTime + delay + .3);
    });
  } catch {
    // Some browsers block audio until a user gesture. The game remains fully usable.
  }
}

els.homeButton.addEventListener("click", showMap);
els.backToMap.addEventListener("click", showMap);
els.recordButton.addEventListener("click", openRecords);
els.closeDrawer.addEventListener("click", closeRecords);
els.drawerBackdrop.addEventListener("click", closeRecords);
els.resetProgress.addEventListener("click", resetProgress);
els.soundButton.addEventListener("click", () => {
  state.sound = !state.sound;
  saveState();
  updateHeader();
  if (state.sound) playSound("correct");
  showToast(state.sound ? "声音已打开" : "声音已关闭");
});
els.retryButton.addEventListener("click", () => startLevel(session.level.id));
els.nextButton.addEventListener("click", () => {
  if (session.level.id >= 12) showMap();
  else startLevel(session.level.id + 1);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && els.recordDrawer.classList.contains("open")) closeRecords();
  if (!session || !els.gameScreen.classList.contains("active")) return;
  const optionIndex = Number(event.key) - 1;
  const buttons = [...els.answerGrid.querySelectorAll("button")];
  if (optionIndex >= 0 && optionIndex < buttons.length && !buttons[optionIndex].disabled) buttons[optionIndex].click();
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}

renderMap();
showScreen(els.mapScreen);
