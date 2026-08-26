(function () {
  "use strict";

  const CATALOG = window.BRAIN_CATALOG || [];
  const appRoot = document.querySelector("#app");
  const APP_ID = window.BRAIN_APP_ID || "";
  const STORAGE_KEY = "kamajoyBrainLabProgressV1";
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let activeCleanup = null;
  let toastTimer = null;

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(items) {
    return items[rand(0, items.length - 1)];
  }

  function shuffle(items) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const next = rand(0, index);
      [result[index], result[next]] = [result[next], result[index]];
    }
    return result;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"
    }[character]));
  }

  function loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return parsed && typeof parsed === "object" ? parsed : { stars: 0, activities: {}, drafts: {} };
    } catch (error) {
      return { stars: 0, activities: {}, drafts: {} };
    }
  }

  let progress = loadProgress();
  progress.stars = Number(progress.stars) || 0;
  progress.activities = progress.activities || {};
  progress.drafts = progress.drafts || {};

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      showToast("当前浏览器无法保存记录");
    }
  }

  function markComplete(app, activity, stars, detail) {
    const key = `${app.id}:${activity.id}`;
    const old = progress.activities[key] || { stars: 0, plays: 0 };
    const gained = Math.max(0, stars - old.stars);
    progress.stars += gained;
    progress.activities[key] = {
      stars: Math.max(stars, old.stars),
      plays: old.plays + 1,
      detail: detail || "",
      updatedAt: Date.now()
    };
    saveProgress();
  }

  function showToast(message) {
    let toast = document.querySelector("#brainToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "brainToast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function appById(id) {
    return CATALOG.find((entry) => entry.id === id);
  }

  function activityRecord(app, activity) {
    return progress.activities[`${app.id}:${activity.id}`] || null;
  }

  function starsMarkup(count) {
    return [1, 2, 3].map((star) => `<span class="${star <= count ? "earned" : ""}">★</span>`).join("");
  }

  function totalComplete(app) {
    return app.activities.filter((activity) => activityRecord(app, activity)).length;
  }

  function seriesHref() {
    return APP_ID ? "../" : "./";
  }

  function pageHeader(app, activity) {
    const title = activity ? activity.title : app.title;
    return `
      <header class="app-header">
        <a class="icon-button" href="${activity ? "./" : seriesHref()}" aria-label="${activity ? "返回活动列表" : "返回益智乐园"}" title="返回">‹</a>
        <div class="header-title"><span>${escapeHtml(app.order)} · ${escapeHtml(app.subtitle)}</span><strong>${escapeHtml(title)}</strong></div>
        <div class="star-counter" aria-label="总共 ${progress.stars} 颗星"><span>★</span><b>${progress.stars}</b></div>
      </header>`;
  }

  function renderHub() {
    document.title = "奇趣脑力岛 · 7-10岁益智乐园";
    document.documentElement.style.setProperty("--theme", "#ef5b3f");
    document.documentElement.style.setProperty("--theme-soft", "#ffe5dc");
    const completed = CATALOG.reduce((sum, app) => sum + totalComplete(app), 0);
    appRoot.innerHTML = `
      <header class="hub-topbar">
        <a class="wordmark" href="../../../"><span class="wordmark-mark">K</span><span><strong>Kamajoy</strong><small>网页游戏</small></span></a>
        <div class="hub-score"><span>★</span><strong>${progress.stars}</strong><small>我的星星</small></div>
      </header>
      <main class="hub-main">
        <section class="hub-hero">
          <div class="hero-copy">
            <p class="eyebrow">7-10岁 · 10个主题 · 96项活动</p>
            <h1>奇趣脑力岛</h1>
            <p>今天想去哪里探险？每次玩 10-20 分钟，发现自己的新本领。</p>
            <div class="overall-progress"><span><b>${completed}</b> / 96 项已体验</span><div><i style="width:${Math.round(completed / 96 * 100)}%"></i></div></div>
          </div>
          <img class="hero-art" src="assets/brain-lab-cover.svg" alt="由数字、迷宫、画笔和积木组成的脑力岛">
        </section>
        <section class="catalog-section" aria-labelledby="catalogTitle">
          <div class="section-heading"><div><p>探索地图</p><h2 id="catalogTitle">选择一个主题</h2></div><span>难度会在游戏中逐步提升</span></div>
          <div class="app-grid">
            ${CATALOG.map((app) => `
              <a class="app-card" href="${app.path}/" style="--card-color:${app.color};--card-soft:${app.soft}">
                <span class="app-card-number">${app.order}</span>
                <span class="app-card-icon" aria-hidden="true">${app.icon}</span>
                <span class="app-card-copy"><strong>${app.title}</strong><small>${app.subtitle} · ${app.activities.length}项</small></span>
                <span class="app-card-progress">${totalComplete(app) ? `${totalComplete(app)}/${app.activities.length}` : "开始"}</span>
              </a>`).join("")}
          </div>
        </section>
        <section class="grownup-note"><strong>给大人的小提示</strong><span>鼓励孩子讲出思考过程，比快速答对更重要。学习记录仅保存在当前设备。</span></section>
      </main>`;
  }

  function renderAppHome(app) {
    document.title = `${app.title} · 奇趣脑力岛`;
    document.documentElement.style.setProperty("--theme", app.color);
    document.documentElement.style.setProperty("--theme-soft", app.soft);
    const done = totalComplete(app);
    appRoot.innerHTML = `
      ${pageHeader(app)}
      <main class="app-main">
        <section class="app-intro">
          <div class="app-intro-icon" aria-hidden="true">${app.icon}</div>
          <div><p class="eyebrow">第 ${app.order} 站 · ${app.activities.length} 项挑战</p><h1>${app.title}</h1><p>${app.intro}</p></div>
          <div class="chapter-progress"><strong>${done}/${app.activities.length}</strong><span>已体验</span></div>
        </section>
        <section class="activity-section" aria-labelledby="activityTitle">
          <div class="section-heading"><div><p>活动目录</p><h2 id="activityTitle">选择一个小游戏</h2></div><span>可以按任意顺序体验</span></div>
          <div class="activity-grid">
            ${app.activities.map((activity, index) => {
              const record = activityRecord(app, activity);
              return `
                <a class="activity-card" href="#activity=${activity.id}">
                  <span class="activity-number">${String(index + 1).padStart(2, "0")}</span>
                  <span class="activity-copy"><strong>${activity.title}</strong><small>${activity.description}</small></span>
                  <span class="activity-stars" aria-label="${record ? record.stars : 0} 星">${starsMarkup(record ? record.stars : 0)}</span>
                </a>`;
            }).join("")}
          </div>
        </section>
      </main>`;
  }

  function uniqueNumberOptions(answer, spread, count) {
    const values = new Set([answer]);
    let guard = 0;
    while (values.size < (count || 4) && guard < 100) {
      values.add(Math.max(0, answer + rand(1, spread) * (Math.random() > 0.5 ? 1 : -1)));
      guard += 1;
    }
    return shuffle(Array.from(values).map(String));
  }

  function bankQuestion(items) {
    const item = pick(items);
    return {
      prompt: item[0],
      visual: item[1] || "",
      answer: String(item[2]),
      options: shuffle(item[3].map(String)),
      explain: item[4] || `正确答案是“${item[2]}”。`
    };
  }

  const QUESTION_BANKS = {
    shadow: [
      ["这是谁的影子？", "<span class=shadow-figure>🐘</span>", "大象", ["大象", "小猫", "长颈鹿", "小鸟"], "大耳朵和长鼻子是大象的明显轮廓。"],
      ["这是谁的影子？", "<span class=shadow-figure>🚲</span>", "自行车", ["自行车", "雨伞", "台灯", "飞机"], "两个圆形车轮是重要线索。"],
      ["这是谁的影子？", "<span class=shadow-figure>☂️</span>", "雨伞", ["蘑菇", "雨伞", "帽子", "扇子"], "弯弯的伞柄能帮助我们判断。"]
    ],
    partial: [
      ["看到黄色果皮和弯弯的形状，它最可能是什么？", "<span class=clue-card>黄色 · 弯弯 · 可以剥皮</span>", "香蕉", ["香蕉", "苹果", "葡萄", "西瓜"], "把颜色、形状和吃法三个线索合起来。"],
      ["看到圆圆的表盘和两根指针，它是什么？", "<span class=clue-card>圆形 · 指针 · 滴答声</span>", "钟表", ["钟表", "盘子", "车轮", "眼镜"], "指针和滴答声都指向钟表。"],
      ["看到条纹尾巴和尖耳朵，它最可能是谁？", "<span class=clue-card>尖耳朵 · 胡须 · 条纹尾巴</span>", "小猫", ["小猫", "小鱼", "小鸭", "兔子"], "胡须和尖耳朵是猫常见的特征。"]
    ],
    sceneError: [
      ["哪一件事不合理？", "<div class=scene-strip><span>☀️ 白天</span><span>🌙 挂在天空</span><span>🐓 公鸡打鸣</span></div>", "白天挂着月亮", ["白天挂着月亮", "公鸡打鸣", "太阳发光", "人们出门"], "这里把白天和夜晚的典型景象混在了一起。"],
      ["冬天的雪地里，哪件物品最不合适？", "<div class=scene-strip><span>🧥</span><span>🧤</span><span>🩴</span><span>🧣</span></div>", "拖鞋", ["棉衣", "手套", "拖鞋", "围巾"], "雪地里应注意保暖，拖鞋不适合。"],
      ["厨房场景里，哪种做法有危险？", "<div class=scene-strip><span>🧒 靠近炉灶</span><span>🧑 成人做饭</span><span>🥕 清洗蔬菜</span></div>", "小孩独自靠近炉灶", ["小孩独自靠近炉灶", "成人做饭", "清洗蔬菜", "把碗放桌上"], "炉灶可能很烫，孩子需要远离或请成人陪同。"]
    ],
    truth: [
      ["桌上只有一个红球。小雨说“球是红色的”，小川说“球是蓝色的”。谁说了真话？", "<div class=big-symbol>🔴</div>", "小雨", ["小雨", "小川", "两人都对", "两人都错"], "看到的球是红色，所以小雨说的是真话。"],
      ["盒子比书重，书比铅笔重。小新说“盒子最重”，小禾说“铅笔最重”。谁说了真话？", "<div class=logic-chain>盒子 ＞ 书 ＞ 铅笔</div>", "小新", ["小新", "小禾", "两人都对", "无法判断"], "根据传递关系，盒子最重。"],
      ["今天不是星期一，也不是星期二，日历显示星期三。谁说对了？", "<div class=big-symbol>星期三</div>", "朵朵：今天是星期三", ["朵朵：今天是星期三", "阿乐：今天是星期一", "两人都对", "两人都错"], "日历已经给出了直接证据。"]
    ],
    elimination: [
      ["礼物不在红盒，也不在最大的盒子里。它在哪里？", "<div class=box-row><span>红色小盒</span><span>蓝色大盒</span><span>绿色中盒</span></div>", "绿色中盒", ["红色小盒", "蓝色大盒", "绿色中盒", "无法判断"], "排除红盒和最大的蓝盒，只剩绿色中盒。"],
      ["小动物有四条腿，不会汪汪叫，也不是最大的。它是谁？", "<div class=scene-strip><span>🐶</span><span>🐈</span><span>🐘</span><span>🐦</span></div>", "小猫", ["小狗", "小猫", "大象", "小鸟"], "排除会汪叫的小狗、最大的象和两条腿的小鸟。"],
      ["密码是一个双数，比 5 大、比 9 小。密码是多少？", "<div class=big-symbol>5 ＜ ? ＜ 9</div>", "6或8", ["4", "5", "6或8", "9"], "6和8都符合全部条件。"]
    ],
    logicGrid: [
      ["小明拿的不是苹果，小红拿的是香蕉。桌上只有苹果和香蕉。小明拿什么？", "<div class=logic-table><span>小明</span><span>?</span><span>小红</span><span>🍌</span></div>", "苹果", ["苹果", "香蕉", "两样都有", "无法判断"], "小红拿走香蕉，小明又不是香蕉，因此是苹果。"],
      ["蓝杯在红杯左边，黄杯在红杯右边。中间是什么杯？", "<div class=logic-chain>蓝杯　?　黄杯</div>", "红杯", ["蓝杯", "红杯", "黄杯", "无法判断"], "红杯同时在蓝杯右边和黄杯左边。"],
      ["乐乐周一画画，周二游泳；安安不在周一游泳。谁在周二游泳？", "", "乐乐", ["乐乐", "安安", "两人都是", "无人"], "题目直接说明乐乐周二游泳。"]
    ],
    mystery: [
      ["窗台有湿脚印，雨伞还在滴水。刚进屋的人最可能做过什么？", "<div class=scene-strip><span>💧</span><span>👣</span><span>☂️</span></div>", "从雨中回来", ["从雨中回来", "刚睡醒", "正在做饭", "一直在屋里"], "湿脚印和滴水的伞是关键证据。"],
      ["饼干少了一块，小杰嘴角有饼干屑。最有用的线索是什么？", "<div class=big-symbol>🍪</div>", "嘴角的饼干屑", ["桌子是木头的", "嘴角的饼干屑", "窗帘是蓝色的", "时钟在走"], "饼干屑和少掉的饼干直接相关。"],
      ["花盆倒了，旁边有一只带泥的小球。可能发生了什么？", "<div class=scene-strip><span>🪴</span><span>⚽</span><span>泥点</span></div>", "球撞倒了花盆", ["球撞倒了花盆", "花盆自己走动", "阳光推倒花盆", "时钟撞倒花盆"], "位置和泥点支持小球撞到花盆的推断。"]
    ],
    splitShape: [
      ["沿正方形对角线剪一刀，会得到什么？", "<div class=shape-visual square diagonal></div>", "两个三角形", ["两个三角形", "两个圆形", "三个正方形", "一个长方形"], "对角线连接两个对角，会把正方形分成两个三角形。"],
      ["沿长方形中线竖直剪一刀，最可能得到什么？", "<div class=shape-visual rectangle midline></div>", "两个小长方形", ["两个小长方形", "两个圆形", "三个三角形", "一个正方形"], "中线把长方形平均分成两个更小的长方形。"],
      ["圆形从圆心横着剪一刀，会得到什么？", "<div class=shape-visual circle cutline></div>", "两个半圆", ["两个半圆", "两个正方形", "一个三角形", "四个圆"], "经过圆心的一条直线会把圆分成两个半圆。"]
    ],
    cubeNet: [
      ["哪一种展开图最可能折成立方体？", "<div class=net-visual><i></i><i></i><i></i><i></i><i></i><i></i></div>", "十字形六格", ["十字形六格", "一排六格", "田字四格", "三角形六格"], "立方体有六个正方形面，常见展开图像十字形。"],
      ["立方体有几个面？", "<div class=cube-icon>立方体</div>", "6", ["4", "5", "6", "8"], "立方体由六个正方形面组成。"],
      ["立方体相对的两个面会不会共用一条边？", "<div class=cube-icon>□</div>", "不会", ["会", "不会", "有时会", "无法判断"], "相对的面彼此平行，不会相邻。"]
    ],
    mirror: [
      ["小鱼朝右游，照镜子后会朝哪边？", "<div class=mirror-visual>🐟 <i></i> ?</div>", "左", ["左", "右", "上", "下"], "镜子会交换左右方向。"],
      ["字母 b 照镜子，圆肚子会出现在竖线哪边？", "<div class=mirror-visual>b <i></i> ?</div>", "左边", ["左边", "右边", "上边", "下边"], "镜像会把原来的右侧换到左侧。"],
      ["你举起右手，镜子里的人看起来举起哪只手？", "<div class=big-symbol>🪞</div>", "左手", ["左手", "右手", "两只手", "没有举手"], "镜像看起来会把左右交换。"]
    ],
    pictureWord: [
      ["看图选择合适的词语。", "<div class=big-symbol>🌻</div>", "向日葵", ["向日葵", "蒲公英", "荷花", "松树"], "向日葵有大大的黄色花盘。"],
      ["看图选择合适的词语。", "<div class=big-symbol>🌈</div>", "彩虹", ["彩虹", "闪电", "乌云", "雪花"], "雨后天空中的彩色弧线是彩虹。"],
      ["看图选择合适的词语。", "<div class=big-symbol>🚒</div>", "消防车", ["消防车", "救护车", "校车", "火车"], "红色车身和云梯是消防车的特点。"]
    ],
    radical: [
      ["“氵”加哪个部分可以组成“河”？", "<div class=big-symbol>氵 + ? = 河</div>", "可", ["可", "青", "也", "每"], "三点水加“可”组成“河”。"],
      ["“木”加哪个部分可以组成“林”？", "<div class=big-symbol>木 + ? = 林</div>", "木", ["木", "日", "口", "土"], "两个“木”并排组成“林”。"],
      ["“日”加哪个部分可以组成“明”？", "<div class=big-symbol>日 + ? = 明</div>", "月", ["月", "木", "云", "山"], "日和月组合成“明”。"]
    ],
    wordRelation: [
      ["“高兴”的近义词是哪一个？", "", "快乐", ["快乐", "难过", "缓慢", "安静"], "“高兴”和“快乐”意思相近。"],
      ["“寒冷”的反义词是哪一个？", "", "温暖", ["冰凉", "温暖", "潮湿", "整齐"], "寒冷与温暖表示相反的温度感受。"],
      ["“迅速”的近义词是哪一个？", "", "快速", ["快速", "迟缓", "弱小", "安静"], "迅速和快速都表示速度很快。"]
    ],
    riddle: [
      ["身穿绿衣裳，肚里水汪汪，生的籽儿多，个个黑脸膛。", "", "西瓜", ["西瓜", "苹果", "香蕉", "草莓"], "绿色外皮、水分多、黑色籽，答案是西瓜。"],
      ["弯弯一座桥，雨后最招摇，七色排得巧，一会不见了。", "", "彩虹", ["彩虹", "月亮", "雨伞", "彩带"], "雨后出现的七色弯桥就是彩虹。"],
      ["有面没有口，有脚没有手，虽有四只脚，自己不会走。", "", "桌子", ["桌子", "小狗", "机器人", "闹钟"], "桌子有桌面和四条腿，但不会走。"]
    ],
    storyClue: [
      ["小鹿出门时带了雨伞。下午乌云来了，它撑开雨伞跑回家。下午的天气怎样？", "<div class=story-card>小鹿 · 雨伞 · 乌云</div>", "下雨了", ["下雨了", "下雪了", "晴天", "刮沙尘"], "乌云和撑伞说明下雨了。"],
      ["明明把借来的书包好书皮，第二天按时还给图书馆。明明做了什么？", "<div class=story-card>借书 → 保护 → 按时归还</div>", "爱护并按时还书", ["爱护并按时还书", "把书弄丢", "忘记归还", "撕掉书页"], "包书皮和按时归还都是爱护图书的表现。"],
      ["早晨，小树影子长长地落在西边。太阳在哪边？", "<div class=story-card>影子在西边</div>", "东边", ["东边", "西边", "南边", "脚下"], "影子方向通常与光源相反。"]
    ],
    weather: [
      ["天空乌云密布，雨点落下，应该记录什么天气？", "<div class=big-symbol>🌧️</div>", "雨天", ["雨天", "晴天", "雪天", "雾天"], "雨点是判断雨天最直接的现象。"],
      ["树枝明显摇动，风筝飞得很高，说明什么？", "<div class=big-symbol>🌬️</div>", "有风", ["有风", "无风", "下雪", "结冰"], "物体被吹动说明空气正在流动。"],
      ["气温 32℃，太阳很强，外出更需要什么？", "<div class=big-symbol>32℃</div>", "遮阳帽和水", ["遮阳帽和水", "厚棉衣", "滑雪板", "毛线手套"], "高温强光下应防晒并及时补水。"]
    ],
    lightShadow: [
      ["手电筒在小球左边，影子会落在哪边？", "<div class=light-visual>🔦 → ⚽</div>", "右边", ["左边", "右边", "上面", "没有影子"], "影子出现在光源的相反方向。"],
      ["把物体移得更靠近手电筒，墙上的影子通常会怎样？", "<div class=light-visual>🔦　▲　│</div>", "变大", ["变大", "变小", "消失", "变成圆形"], "物体靠近点光源时，投在墙上的影子通常更大。"],
      ["透明玻璃和厚纸板，哪个更容易让光穿过？", "", "透明玻璃", ["透明玻璃", "厚纸板", "两者一样", "都不能"], "透明材料更容易让光穿过。"]
    ],
    sound: [
      ["拨动橡皮筋听到声音，正在振动的是什么？", "<div class=big-symbol>〰️</div>", "橡皮筋", ["橡皮筋", "桌子", "空气完全不动", "眼睛"], "被拨动的橡皮筋来回振动并发出声音。"],
      ["敲鼓时，把手轻放在鼓面上会感觉到什么？", "<div class=big-symbol>🥁</div>", "鼓面振动", ["鼓面振动", "鼓面变冷", "鼓面消失", "手被吸住"], "声音产生时鼓面在快速振动。"],
      ["哪一种做法能让铃铛停止发声？", "<div class=big-symbol>🔔</div>", "让铃铛停止振动", ["让铃铛停止振动", "给它涂颜色", "把灯打开", "离它更近"], "发声物体停止振动后，声音也会停止。"]
    ],
    body: [
      ["帮助我们呼吸的主要器官是什么？", "<div class=big-symbol>呼吸</div>", "肺", ["肺", "胃", "骨头", "牙齿"], "肺帮助身体吸入氧气、呼出二氧化碳。"],
      ["把食物磨碎的身体部位是什么？", "<div class=big-symbol>😁</div>", "牙齿", ["牙齿", "耳朵", "手指", "头发"], "牙齿负责切断和磨碎食物。"],
      ["运动后心跳加快，心脏的主要工作是什么？", "<div class=big-symbol>♥</div>", "推动血液流动", ["推动血液流动", "帮助看颜色", "储存食物", "支撑牙齿"], "心脏像泵一样推动血液循环。"]
    ],
    safeLab: [
      ["哪项活动必须请成人陪同？", "", "使用热水做实验", ["使用热水做实验", "观察一片树叶", "给石头分类", "记录天气"], "热水可能造成烫伤，需要成人操作或陪同。"],
      ["闻一种不熟悉的液体时，安全做法是什么？", "", "不要直接闻，请成人确认", ["不要直接闻，请成人确认", "凑近深吸气", "先尝一口", "倒在手上"], "未知物质不能随意触碰、品尝或直接闻。"],
      ["实验结束后首先应该做什么？", "", "整理材料并洗手", ["整理材料并洗手", "把材料留在地上", "立即吃东西", "把液体混在一起"], "良好的收尾能避免误碰和污染。"]
    ],
    shoppingList: [
      ["准备做番茄炒蛋，需要买哪组食材？", "<div class=big-symbol>🍅 + 🥚</div>", "番茄和鸡蛋", ["番茄和鸡蛋", "苹果和牛奶", "面包和果汁", "土豆和糖"], "菜名已经给出了主要食材。"],
      ["准备水果沙拉，哪一项不需要放进购物清单？", "<div class=scene-strip><span>🍎</span><span>🍌</span><span>🍇</span><span>🧂</span></div>", "盐", ["苹果", "香蕉", "葡萄", "盐"], "水果沙拉通常需要各种水果，不需要盐。"],
      ["家里还有牛奶，但没有面包。早餐清单应该增加什么？", "", "面包", ["面包", "牛奶", "重复买三盒牛奶", "玩具"], "购物前先检查存货，可以避免重复购买。"]
    ],
    healthyFood: [
      ["哪份午餐搭配更均衡？", "", "米饭、鱼、青菜和水果", ["米饭、鱼、青菜和水果", "只有薯片", "只有糖果", "蛋糕和汽水"], "主食、蛋白质、蔬菜和水果搭配更均衡。"],
      ["运动后口渴，日常最适合喝什么？", "<div class=big-symbol>💧</div>", "白开水", ["白开水", "大量汽水", "浓咖啡", "只吃糖"], "白开水是日常补水的好选择。"],
      ["早餐只吃一颗糖，怎样改进更好？", "", "增加主食、蛋奶和水果", ["增加主食、蛋奶和水果", "再吃更多糖", "不吃早餐", "只喝冰饮料"], "多种食物能提供更全面的营养。"]
    ],
    traffic: [
      ["看到红色圆形内有一条白横线，表示什么？", "<div class=sign no-entry>—</div>", "禁止驶入", ["禁止驶入", "可以停车", "人行横道", "向前直行"], "红色禁令标志中的白横线表示禁止驶入。"],
      ["过马路时应该从哪里通过？", "<div class=sign crossing>▥</div>", "人行横道", ["人行横道", "车辆中间", "绿化带", "随意穿过"], "走人行横道并观察信号灯更安全。"],
      ["信号灯变红时，行人应该怎么做？", "<div class=big-symbol>🔴</div>", "停下等待", ["停下等待", "快速冲过去", "背对车辆", "在路中玩耍"], "红灯表示停止通行。"]
    ],
    emotion: [
      ["搭了很久的积木突然倒了，小朋友可能是什么感受？", "<div class=big-symbol>😞</div>", "失望", ["失望", "得意", "轻松", "毫不在意"], "努力成果突然倒下，可能会让人失望。"],
      ["第一次上台表演前，心跳很快，可能是什么感受？", "<div class=big-symbol>😟</div>", "紧张", ["紧张", "无聊", "生气", "困倦"], "面对陌生挑战时，紧张是很正常的感受。"],
      ["朋友主动分享了玩具，你可能是什么感受？", "<div class=big-symbol>😊</div>", "开心和感谢", ["开心和感谢", "害怕", "生气", "孤单"], "被友好对待常常会让人开心并想表达感谢。"]
    ],
    problemSolving: [
      ["在商场和家人走散了，应该怎么做？", "", "留在安全醒目处，请工作人员帮助", ["留在安全醒目处，请工作人员帮助", "独自跑出商场", "跟陌生人回家", "躲起来不出声"], "留在安全地点并找有标识的工作人员更容易与家人重聚。"],
      ["不会做一道题，最有效的下一步是什么？", "", "先读题并尝试，再向老师或家长请教", ["先读题并尝试，再向老师或家长请教", "直接撕掉题目", "抄别人的答案", "假装没看见"], "先独立思考，再清楚地提出问题。"],
      ["有人让你保守一个令你害怕的秘密，应该怎么办？", "", "告诉可信任的成人", ["告诉可信任的成人", "永远不说", "独自承担", "立刻离家"], "让人害怕或不安全的秘密，应告诉可信任的成人。"]
    ],
    cooperate: [
      ["两个人都想先玩同一个玩具，怎样做更合适？", "", "商量轮流时间", ["商量轮流时间", "抢走玩具", "把玩具藏起来", "大声嘲笑对方"], "轮流能让双方都获得公平的机会。"],
      ["小组搭建时伙伴提出不同想法，可以怎么回应？", "", "先听完，再一起比较方案", ["先听完，再一起比较方案", "马上说他错了", "不让他说话", "退出小组"], "倾听并讨论能帮助团队作出更好的决定。"],
      ["接力赛中队友失误了，适合说什么？", "", "没关系，我们继续配合", ["没关系，我们继续配合", "都是你的错", "你不要参加了", "我再也不合作"], "支持队友有助于团队继续完成目标。"]
    ],
    logicCards: [
      ["隐藏角色戴帽子、不是动物、还能飞。它是谁？", "<div class=scene-strip><span>🧙</span><span>🐦</span><span>👨‍🚀</span><span>🐱</span></div>", "宇航员", ["魔法师", "小鸟", "宇航员", "小猫"], "宇航员戴头盔、不是动物，也能乘飞船飞行。"],
      ["隐藏物品是圆形、能显示时间、不能吃。它是什么？", "", "时钟", ["苹果", "时钟", "饼干", "足球"], "时钟常见为圆形，用来显示时间。"],
      ["隐藏地点有很多书、需要安静、可以借阅。它在哪里？", "", "图书馆", ["图书馆", "操场", "厨房", "游泳馆"], "图书馆满足全部三个条件。"]
    ],
    escape: [
      ["第一道锁：2、4、6、?，缺少哪个数字？", "<div class=big-symbol>2 · 4 · 6 · ?</div>", "8", ["7", "8", "9", "10"], "每次增加 2，所以接下来是 8。"],
      ["第二道锁：红钥匙不在左边，蓝钥匙在红钥匙左边。左边是什么钥匙？", "", "蓝钥匙", ["红钥匙", "蓝钥匙", "两把都是", "无法判断"], "蓝钥匙在红钥匙左边。"],
      ["最后密码：太阳代表 3，月亮代表 2。太阳 + 月亮是多少？", "<div class=big-symbol>☀ + ☾</div>", "5", ["4", "5", "6", "7"], "3 + 2 = 5，密码箱打开了。"]
    ]
  };

  function questionFor(factory, round) {
    if (factory === "escape") return bankQuestion([QUESTION_BANKS.escape[(round || 0) % QUESTION_BANKS.escape.length]]);
    if (QUESTION_BANKS[factory]) return bankQuestion(QUESTION_BANKS[factory]);

    if (factory === "oddVisual") {
      const sets = [["●", "●", "●", "◉"], ["▲", "▲", "△", "▲"], ["↗", "↗", "↖", "↗"], ["🍎", "🍎", "🍏", "🍎"]];
      const set = pick(sets);
      const answer = set.find((value) => set.filter((item) => item === value).length === 1);
      const options = shuffle(set.map((value, index) => `${value}<small>第${index + 1}个</small>`));
      const answerIndex = set.indexOf(answer) + 1;
      return { prompt: "哪一个图案和其他三个不一样？", visual: "", answer: `第${answerIndex}个`, options, optionValues: options.map((value) => value.match(/第\d+个/)[0]), explain: "比较形状、方向或颜色，就能找到唯一不同的图案。" };
    }

    if (factory === "category") {
      return bankQuestion(pick([
        [["哪一个不属于水果？", "<div class=scene-strip><span>🍎</span><span>🍌</span><span>🥕</span><span>🍇</span></div>", "胡萝卜", ["苹果", "香蕉", "胡萝卜", "葡萄"], "胡萝卜属于蔬菜。"]],
        [["哪一个不是交通工具？", "<div class=scene-strip><span>🚗</span><span>🚲</span><span>🚌</span><span>🛋️</span></div>", "沙发", ["汽车", "自行车", "公交车", "沙发"], "沙发是家具。"]],
        [["哪一个不是生活在水里的动物？", "<div class=scene-strip><span>🐟</span><span>🐙</span><span>🐬</span><span>🐓</span></div>", "公鸡", ["鱼", "章鱼", "海豚", "公鸡"], "公鸡生活在陆地上。"]]
      ]));
    }

    if (factory === "visualPattern") {
      const patterns = [
        { shown: ["●", "▲", "●", "▲", "●"], answer: "▲", options: ["▲", "●", "■", "◆"], text: "圆形和三角形轮流出现。" },
        { shown: ["🔴", "🔴", "🔵", "🔴", "🔴"], answer: "🔵", options: ["🔴", "🔵", "🟡", "🟢"], text: "两个红色后面跟一个蓝色。" },
        { shown: ["↑", "→", "↓", "←", "↑"], answer: "→", options: ["↑", "→", "↓", "←"], text: "箭头每次顺时针转动四分之一圈。" }
      ];
      const item = pick(patterns);
      return { prompt: "下一个图形是什么？", visual: `<div class=pattern-line>${item.shown.map((x) => `<span>${x}</span>`).join("")}<span>?</span></div>`, answer: item.answer, options: shuffle(item.options), explain: item.text };
    }

    if (factory === "numberFriends" || factory === "makeTen") {
      const target = factory === "makeTen" ? 10 : rand(8, 20);
      const left = rand(1, target - 1);
      const answer = target - left;
      return { prompt: `哪个数字和 ${left} 合起来正好是 ${target}？`, visual: `<div class=math-bubbles><span>${left}</span><i>＋</i><span>?</span><i>＝</i><b>${target}</b></div>`, answer: String(answer), options: uniqueNumberOptions(answer, 4), explain: `${target} − ${left} = ${answer}。` };
    }

    if (factory === "arithmetic") {
      const add = Math.random() > 0.45;
      const max = rand(0, 1) ? 20 : 50;
      let left;
      let right;
      let answer;
      if (add) {
        left = rand(2, max - 5); right = rand(1, max - left); answer = left + right;
      } else {
        left = rand(6, max); right = rand(1, left - 1); answer = left - right;
      }
      return { prompt: "算一算，选择正确答案。", visual: `<div class=big-math>${left} ${add ? "+" : "−"} ${right} = ?</div>`, answer: String(answer), options: uniqueNumberOptions(answer, max > 20 ? 8 : 4), explain: `${left} ${add ? "+" : "−"} ${right} = ${answer}。` };
    }

    if (factory === "compare") {
      const a = rand(4, 40); const b = rand(4, 40);
      const answer = a === b ? "=" : a > b ? ">" : "<";
      return { prompt: "在圆圈里填入正确的比较符号。", visual: `<div class=big-math>${a}　○　${b}</div>`, answer, options: shuffle([">", "=", "<"]), explain: `${a} ${answer} ${b}。` };
    }

    if (factory === "missingNumber") {
      const add = Math.random() > 0.35; const answer = rand(2, 12); const known = rand(2, 15);
      if (add) return { prompt: "找回藏起来的数字。", visual: `<div class=big-math>? + ${known} = ${answer + known}</div>`, answer: String(answer), options: uniqueNumberOptions(answer, 5), explain: `${answer + known} − ${known} = ${answer}。` };
      return { prompt: "找回藏起来的数字。", visual: `<div class=big-math>${answer + known} − ? = ${known}</div>`, answer: String(answer), options: uniqueNumberOptions(answer, 5), explain: `${answer + known} − ${answer} = ${known}。` };
    }

    if (factory === "sudoku") {
      const grids = [
        [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]],
        [[2, 1, 4, 3], [4, 3, 2, 1], [1, 2, 3, 4], [3, 4, 1, 2]]
      ];
      const grid = pick(grids); const row = rand(0, 3); const col = rand(0, 3); const answer = grid[row][col];
      const visual = `<div class=sudoku-grid>${grid.flatMap((values, r) => values.map((value, c) => `<span class="${r === row && c === col ? "missing" : ""}">${r === row && c === col ? "?" : value}</span>`)).join("")}</div>`;
      return { prompt: "每行、每列都有 1、2、3、4，问号处是什么？", visual, answer: String(answer), options: shuffle(["1", "2", "3", "4"]), explain: `这一行和这一列都缺少数字 ${answer}。` };
    }

    if (factory === "shapeMath") {
      const circle = rand(2, 7); const triangle = rand(1, 6); const answer = circle + triangle;
      return { prompt: "根据前两行，算出最后一行。", visual: `<div class=shape-equation><span>● + ● = ${circle * 2}</span><span>▲ + ▲ = ${triangle * 2}</span><b>● + ▲ = ?</b></div>`, answer: String(answer), options: uniqueNumberOptions(answer, 4), explain: `圆形是 ${circle}，三角形是 ${triangle}，合起来是 ${answer}。` };
    }

    if (factory === "shopping" || factory === "money") {
      const price = rand(3, 18); const paid = [10, 20, 50].find((value) => value >= price) || 50; const answer = paid - price;
      return { prompt: `商品 ${price} 元，付 ${paid} 元，应找回多少元？`, visual: `<div class=shop-visual><span>🎒</span><b>¥${price}</b><i>付款 ¥${paid}</i></div>`, answer: String(answer), options: uniqueNumberOptions(answer, 5), explain: `${paid} − ${price} = ${answer} 元。` };
    }

    if (factory === "clock") {
      const hour = rand(1, 11); const half = Math.random() > 0.5; const minute = half ? 30 : 0; const minuteAngle = minute * 6; const hourAngle = hour * 30 + minute * 0.5;
      const answer = `${hour}点${half ? "半" : ""}`;
      const options = shuffle([answer, `${hour + 1}点${half ? "半" : ""}`, `${hour}点${half ? "" : "半"}`, `${Math.max(1, hour - 1)}点${half ? "半" : ""}`]);
      return { prompt: "钟面显示几点？", visual: `<div class=clock-face><i class=hour-hand style="transform:rotate(${hourAngle}deg)"></i><i class=minute-hand style="transform:rotate(${minuteAngle}deg)"></i><b></b></div>`, answer, options: Array.from(new Set(options)), explain: `短针指向 ${hour} 附近，长针${half ? "指向 6" : "指向 12"}，是${answer}。` };
    }

    if (factory === "measure") {
      return bankQuestion(pick([
        [["测量铅笔长度，最适合用什么单位？", "<div class=big-symbol>✏️</div>", "厘米", ["厘米", "千米", "吨", "小时"], "铅笔较短，用厘米测量更合适。"]],
        [["教室门高大约是多少？", "<div class=big-symbol>🚪</div>", "2米", ["2厘米", "20厘米", "2米", "20米"], "成年人能通过的门通常约 2 米高。"]],
        [["一袋大米的重量更可能是多少？", "<div class=big-symbol>🍚</div>", "5千克", ["5克", "50克", "5千克", "500千克"], "家庭装大米通常用千克表示。"]]
      ]));
    }

    if (factory === "cipher") {
      const step = rand(2, 5); const a = rand(1, 8); const seq = [a, a + step, a + step * 2, a + step * 3]; const answer = a + step * 4;
      return { prompt: "破解数字密码，找出最后一位。", visual: `<div class=code-strip>${seq.join(" · ")} · ?</div>`, answer: String(answer), options: uniqueNumberOptions(answer, 5), explain: `每次增加 ${step}，所以最后一位是 ${answer}。` };
    }

    if (factory === "rotation") {
      const dirs = ["↑", "→", "↓", "←"]; const index = rand(0, 3); const turns = rand(1, 3); const answer = dirs[(index + turns) % 4];
      return { prompt: `箭头顺时针旋转 ${turns * 90}° 后是什么方向？`, visual: `<div class=rotation-visual>${dirs[index]}<i>顺时针 ${turns * 90}°</i></div>`, answer, options: shuffle(dirs), explain: `顺时针每转 90° 就向右移动一个方向，答案是 ${answer}。` };
    }

    if (factory === "cubeCount") {
      const bottom = rand(3, 6); const middle = rand(1, Math.min(3, bottom)); const top = rand(0, 1); const answer = bottom + middle + top;
      return { prompt: "分层数一数，一共有多少块积木？", visual: `<div class=cube-layers><span>顶层 ${top} 块</span><span>中层 ${middle} 块</span><span>底层 ${bottom} 块</span></div>`, answer: String(answer), options: uniqueNumberOptions(answer, 4), explain: `${bottom} + ${middle} + ${top} = ${answer} 块。` };
    }

    if (factory === "direction" || factory === "mapTreasure") {
      const moves = pick([[["东", 2], ["北", 1]], [["西", 1], ["南", 2]], [["北", 2], ["东", 1]]]);
      const map = { "东": [1, 0], "西": [-1, 0], "北": [0, 1], "南": [0, -1] }; let x = 0; let y = 0;
      moves.forEach(([dir, n]) => { x += map[dir][0] * n; y += map[dir][1] * n; });
      const answer = x > 0 ? "起点东北边" : x < 0 ? "起点西南边" : y > 0 ? "起点北边" : "起点南边";
      return { prompt: `从起点向${moves[0][0]}走${moves[0][1]}格，再向${moves[1][0]}走${moves[1][1]}格，终点大致在哪里？`, visual: `<div class=map-grid><span>起点</span><i>${moves.map((m) => `${m[0]}${m[1]}格`).join(" → ")}</i></div>`, answer, options: shuffle(["起点东北边", "起点西南边", "起点北边", "起点南边"]), explain: `把两次移动画在方格中，终点位于${answer}。` };
    }

    if (factory === "paperFold") {
      return bankQuestion(pick([
        [["正方形纸对折一次，在折边外侧打一个孔，展开后有几个对称的孔？", "<div class=paper-fold>• │</div>", "2个", ["1个", "2个", "3个", "4个"], "对折一层后打孔，展开会出现一对对称孔。"]],
        [["纸连续对折两次后打一个孔，完全展开最多会出现几个孔？", "<div class=paper-fold>折 × 2 → •</div>", "4个", ["1个", "2个", "3个", "4个"], "每次对折都让层数翻倍，两次后共有四层。"]],
        [["对折时，折痕相当于展开图中的什么？", "", "对称轴", ["对称轴", "颜色线", "外边框", "随机线"], "折痕两边的图案会互相对应。"]]
      ]));
    }

    return { prompt: "仔细想一想，选择最合适的答案。", visual: "<div class=big-symbol>?</div>", answer: "答案 A", options: ["答案 A", "答案 B", "答案 C", "答案 D"], explain: "你找到了正确答案。" };
  }

  function activityShell(app, activity) {
    const index = app.activities.indexOf(activity);
    appRoot.innerHTML = `
      ${pageHeader(app, activity)}
      <main class="game-main">
        <section class="game-titlebar">
          <div><p class="eyebrow">${app.order}.${String(index + 1).padStart(2, "0")} · ${app.subtitle}</p><h1>${activity.title}</h1><p>${activity.description}</p></div>
          <div class="game-best">${starsMarkup((activityRecord(app, activity) || {}).stars || 0)}<small>历史最佳</small></div>
        </section>
        <section class="game-stage" id="gameMount" aria-live="polite"></section>
      </main>`;
    return document.querySelector("#gameMount");
  }

  function renderActivity(app, activity) {
    document.title = `${activity.title} · ${app.title}`;
    document.documentElement.style.setProperty("--theme", app.color);
    document.documentElement.style.setProperty("--theme-soft", app.soft);
    if (activeCleanup) activeCleanup();
    activeCleanup = null;
    const mount = activityShell(app, activity);
    const engines = {
      quiz: renderQuiz,
      search: renderSearch,
      memory: renderMemory,
      maze: renderMaze,
      "maze-editor": renderMazeEditor,
      order: renderOrder,
      sort: renderSort,
      draw: renderDraw,
      write: renderWrite,
      checklist: renderChecklist,
      board: renderBoard,
      bingo: renderBingo
    };
    (engines[activity.kind] || renderQuiz)(mount, app, activity);
  }

  function roundHeader(current, total, label) {
    return `
      <div class="round-head">
        <span>${escapeHtml(label || "本轮挑战")}</span>
        <strong>${Math.min(current + 1, total)} / ${total}</strong>
      </div>
      <div class="round-track" aria-hidden="true"><i style="width:${Math.min(100, current / total * 100)}%"></i></div>`;
  }

  function renderResult(mount, app, activity, stars, title, detail, retry) {
    markComplete(app, activity, stars, detail);
    mount.innerHTML = `
      <div class="result-panel">
        <div class="result-burst" aria-hidden="true">${stars === 3 ? "✦" : stars === 2 ? "◆" : "●"}</div>
        <p class="eyebrow">挑战完成</p>
        <h2>${escapeHtml(title)}</h2>
        <div class="result-stars">${starsMarkup(stars)}</div>
        <p>${escapeHtml(detail)}</p>
        <div class="result-actions">
          <button class="button secondary" id="retryActivity">再玩一次</button>
          <a class="button primary" href="./">返回活动目录</a>
        </div>
      </div>`;
    document.querySelector(".star-counter b").textContent = progress.stars;
    mount.querySelector("#retryActivity").addEventListener("click", retry);
  }

  function renderQuiz(mount, app, activity) {
    const total = activity.factory === "escape" ? 3 : 5;
    let round = 0;
    let correct = 0;
    let answered = false;

    function finish() {
      const rate = correct / total;
      const stars = rate >= 0.8 ? 3 : rate >= 0.6 ? 2 : 1;
      renderResult(mount, app, activity, stars, rate >= 0.8 ? "观察得很仔细！" : "完成一次完整思考", `答对 ${correct} / ${total} 题，再玩一次会遇到新题目。`, () => renderQuiz(mount, app, activity));
    }

    function nextQuestion() {
      if (round >= total) return finish();
      answered = false;
      const question = questionFor(activity.factory, round);
      const optionValues = question.optionValues || question.options;
      mount.innerHTML = `
        <div class="challenge-panel">
          ${roundHeader(round, total, "思考挑战")}
          <div class="question-area">
            <h2>${escapeHtml(question.prompt)}</h2>
            ${question.visual ? `<div class="question-visual">${question.visual}</div>` : ""}
            <div class="answer-options ${question.options.length === 3 ? "three" : ""}">
              ${question.options.map((option, index) => `<button class="answer-button" data-value="${escapeHtml(optionValues[index])}">${option}</button>`).join("")}
            </div>
            <div class="feedback-box" id="feedbackBox" role="status"></div>
          </div>
        </div>`;

      mount.querySelectorAll(".answer-button").forEach((button) => {
        button.addEventListener("click", () => {
          if (answered) return;
          answered = true;
          const isCorrect = button.dataset.value === question.answer;
          if (isCorrect) correct += 1;
          button.classList.add(isCorrect ? "correct" : "wrong");
          mount.querySelectorAll(".answer-button").forEach((entry) => {
            entry.disabled = true;
            if (entry.dataset.value === question.answer) entry.classList.add("correct");
          });
          const feedback = mount.querySelector("#feedbackBox");
          feedback.className = `feedback-box show ${isCorrect ? "good" : "try"}`;
          feedback.innerHTML = `<strong>${isCorrect ? "答对了" : "再看一步"}</strong><span>${escapeHtml(question.explain)}</span><button class="button primary" id="nextQuestion">${round + 1 >= total ? "查看结果" : "下一题"}</button>`;
          feedback.querySelector("#nextQuestion").addEventListener("click", () => { round += 1; nextQuestion(); });
        });
      });
    }

    nextQuestion();
  }

  function renderSearch(mount, app, activity) {
    const targets = ["⭐", "🔑", "🍓"];
    const target = pick(targets);
    const distractors = ["🍀", "🌼", "🪁", "🐚", "🍎", "🔶", "🌙", "🎈", "🧩"];
    const cells = shuffle(Array(6).fill(target).concat(Array.from({ length: 30 }, () => pick(distractors))));
    let found = 0;
    let mistakes = 0;
    mount.innerHTML = `
      <div class="challenge-panel search-panel">
        ${roundHeader(0, 6, "寻找目标")}
        <div class="search-task"><span>请找出全部</span><strong>${target}</strong><b id="searchCount">0 / 6</b></div>
        <div class="search-grid">${cells.map((icon) => `<button aria-label="图案 ${icon}" data-target="${icon === target}">${icon}</button>`).join("")}</div>
        <p class="search-note" id="searchNote">找到后轻点它。</p>
      </div>`;
    const progressFill = mount.querySelector(".round-track i");
    mount.querySelectorAll(".search-grid button").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.disabled) return;
        if (button.dataset.target === "true") {
          button.disabled = true;
          button.classList.add("found");
          found += 1;
          mount.querySelector("#searchCount").textContent = `${found} / 6`;
          progressFill.style.width = `${found / 6 * 100}%`;
          if (found === 6) {
            const stars = mistakes <= 1 ? 3 : mistakes <= 4 ? 2 : 1;
            setTimeout(() => renderResult(mount, app, activity, stars, "全部找到了！", `你找齐了 6 个目标，误点 ${mistakes} 次。`, () => renderSearch(mount, app, activity)), prefersReducedMotion ? 0 : 450);
          }
        } else {
          mistakes += 1;
          button.classList.remove("shake");
          void button.offsetWidth;
          button.classList.add("shake");
          mount.querySelector("#searchNote").textContent = "这个不是目标，再仔细看看。";
        }
      });
    });
  }

  function renderMemory(mount, app, activity) {
    const symbols = shuffle(["🌞", "🚀", "🍉", "🎨", "🐳", "🎸", "🌻", "⚽"]).slice(0, 6);
    const cards = shuffle(symbols.concat(symbols)).map((symbol, id) => ({ symbol, id, open: false, matched: false }));
    let first = null;
    let lock = false;
    let moves = 0;
    let matched = 0;
    let memoryTimer = null;

    function drawCards() {
      mount.innerHTML = `
        <div class="challenge-panel memory-panel">
          ${roundHeader(matched, 6, "记忆配对")}
          <div class="memory-status"><span>已配对 <b>${matched}</b> / 6</span><span>翻牌 <b>${moves}</b> 次</span></div>
          <div class="memory-grid">${cards.map((card) => `<button class="memory-card ${card.open || card.matched ? "open" : ""} ${card.matched ? "matched" : ""}" data-id="${card.id}" aria-label="${card.open || card.matched ? card.symbol : "未翻开的卡片"}"><span class=card-back>?</span><span class=card-face>${card.symbol}</span></button>`).join("")}</div>
        </div>`;
      mount.querySelectorAll(".memory-card").forEach((button) => button.addEventListener("click", () => flip(Number(button.dataset.id))));
    }

    function flip(id) {
      const card = cards.find((item) => item.id === id);
      if (!card || lock || card.open || card.matched) return;
      card.open = true;
      if (!first) {
        first = card;
        drawCards();
        return;
      }
      moves += 1;
      if (first.symbol === card.symbol) {
        first.matched = true; card.matched = true; first = null; matched += 1; drawCards();
        if (matched === 6) {
          const stars = moves <= 9 ? 3 : moves <= 14 ? 2 : 1;
          memoryTimer = setTimeout(() => renderResult(mount, app, activity, stars, "记忆配对完成！", `你用 ${moves} 次翻牌找到了全部配对。`, () => renderMemory(mount, app, activity)), prefersReducedMotion ? 0 : 500);
        }
      } else {
        lock = true;
        drawCards();
        memoryTimer = setTimeout(() => {
          first.open = false; card.open = false; first = null; lock = false; drawCards();
        }, prefersReducedMotion ? 250 : 760);
      }
    }

    activeCleanup = () => clearTimeout(memoryTimer);
    drawCards();
  }

  function orderConfig(factory) {
    const configs = {
      seating: { prompt: "根据线索排列座位：小雨坐中间，乐乐在小雨左边。", items: ["乐乐", "小雨", "阿青"] },
      events: { prompt: "把早晨上学前的事情按顺序排好。", items: ["起床", "洗漱", "吃早餐", "背书包出门"] },
      plant: { prompt: "把植物生长过程按先后顺序排好。", items: ["播下种子", "种子发芽", "长出叶子", "开花结果"] },
      sentence: { prompt: "把词语排成通顺的句子。", items: ["小鸟", "在树枝上", "快乐地", "唱歌"] },
      schedule: { prompt: "把一个健康的上学日安排按时间排好。", items: ["起床洗漱", "上学学习", "户外运动", "按时睡觉"] }
    };
    return configs[factory] || configs.events;
  }

  function renderOrder(mount, app, activity) {
    const config = orderConfig(activity.factory);
    let items = shuffle(config.items);
    if (items.join("|") === config.items.join("|")) items = items.slice(1).concat(items[0]);
    let selected = -1;
    let attempts = 0;

    function draw() {
      mount.innerHTML = `
        <div class="challenge-panel order-panel">
          <div class="round-head"><span>顺序挑战</span><strong>轻点两个卡片交换</strong></div>
          <h2>${config.prompt}</h2>
          <div class="order-list">${items.map((item, index) => `<button class="order-item ${selected === index ? "selected" : ""}" data-index="${index}"><span>${index + 1}</span><strong>${item}</strong></button>`).join("")}</div>
          <button class="button primary wide" id="checkOrder">检查顺序</button>
          <div class="feedback-box" id="orderFeedback" role="status"></div>
        </div>`;
      mount.querySelectorAll(".order-item").forEach((button) => button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        if (selected < 0) selected = index;
        else if (selected === index) selected = -1;
        else { [items[selected], items[index]] = [items[index], items[selected]]; selected = -1; }
        draw();
      }));
      mount.querySelector("#checkOrder").addEventListener("click", check);
    }

    function check() {
      attempts += 1;
      const correct = items.every((item, index) => item === config.items[index]);
      const feedback = mount.querySelector("#orderFeedback");
      feedback.className = `feedback-box show ${correct ? "good" : "try"}`;
      if (correct) {
        feedback.innerHTML = "<strong>顺序正确</strong><span>每一步都放在了合适的位置。</span>";
        setTimeout(() => renderResult(mount, app, activity, attempts === 1 ? 3 : attempts <= 3 ? 2 : 1, "排列完成！", `你用 ${attempts} 次检查找到了正确顺序。`, () => renderOrder(mount, app, activity)), prefersReducedMotion ? 0 : 600);
      } else {
        feedback.innerHTML = "<strong>还有位置需要调整</strong><span>从第一步开始，看看下一件事应该是什么。</span>";
      }
    }

    draw();
  }

  function sortConfig(factory) {
    const configs = {
      logicSort: { prompt: "按是否有生命分类。", bins: ["有生命", "无生命"], items: [["小树", "有生命"], ["小猫", "有生命"], ["石头", "无生命"], ["铅笔", "无生命"], ["蘑菇", "有生命"], ["书包", "无生命"]] },
      animals: { prompt: "按主要生活环境分类。", bins: ["陆地", "水中"], items: [["老虎", "陆地"], ["海豚", "水中"], ["骆驼", "陆地"], ["章鱼", "水中"], ["小马", "陆地"], ["鲨鱼", "水中"]] },
      float: { prompt: "预测放进水中会浮还是沉。", bins: ["浮起来", "沉下去"], items: [["木块", "浮起来"], ["铁钉", "沉下去"], ["泡沫板", "浮起来"], ["玻璃珠", "沉下去"], ["空塑料瓶", "浮起来"], ["硬币", "沉下去"]] },
      magnet: { prompt: "判断能否被普通磁铁吸引。", bins: ["能吸引", "不能吸引"], items: [["铁钉", "能吸引"], ["塑料尺", "不能吸引"], ["铁回形针", "能吸引"], ["木筷子", "不能吸引"], ["铁螺丝", "能吸引"], ["橡皮", "不能吸引"]] },
      recycle: { prompt: "把废弃物放进合适的桶。", bins: ["可回收物", "厨余垃圾", "其他垃圾"], items: [["旧报纸", "可回收物"], ["香蕉皮", "厨余垃圾"], ["塑料瓶", "可回收物"], ["剩米饭", "厨余垃圾"], ["用过的纸巾", "其他垃圾"], ["破陶瓷", "其他垃圾"]] },
      tidy: { prompt: "把物品放回合适的位置。", bins: ["书架", "玩具箱", "衣柜"], items: [["故事书", "书架"], ["积木", "玩具箱"], ["外套", "衣柜"], ["字典", "书架"], ["玩偶", "玩具箱"], ["裤子", "衣柜"]] },
      boardCategories: { prompt: "按类别快速出牌。", bins: ["动物", "食物", "交通工具"], items: [["熊猫", "动物"], ["面包", "食物"], ["公交车", "交通工具"], ["小鱼", "动物"], ["苹果", "食物"], ["自行车", "交通工具"]] }
    };
    return configs[factory] || configs.logicSort;
  }

  function renderSort(mount, app, activity) {
    const config = sortConfig(activity.factory);
    let items = shuffle(config.items.map((item, id) => ({ label: item[0], bin: item[1], id, placed: "" })));
    let selected = null;
    let mistakes = 0;

    function draw() {
      const left = items.filter((item) => !item.placed);
      mount.innerHTML = `
        <div class="challenge-panel sort-panel">
          ${roundHeader(items.length - left.length, items.length, "分类挑战")}
          <h2>${config.prompt}</h2>
          <div class="sort-items">${left.length ? left.map((item) => `<button class="sort-item ${selected === item.id ? "selected" : ""}" data-id="${item.id}">${item.label}</button>`).join("") : "<strong class=all-sorted>全部分类完成</strong>"}</div>
          <div class="sort-bins">${config.bins.map((bin) => `<button class=sort-bin data-bin="${bin}"><strong>${bin}</strong><span>${items.filter((item) => item.placed === bin).map((item) => item.label).join("、") || "等待卡片"}</span></button>`).join("")}</div>
          <p class="sort-help" id="sortHelp">先选择一张卡片，再选择它的分类。</p>
        </div>`;
      mount.querySelectorAll(".sort-item").forEach((button) => button.addEventListener("click", () => { selected = Number(button.dataset.id); draw(); }));
      mount.querySelectorAll(".sort-bin").forEach((button) => button.addEventListener("click", () => place(button.dataset.bin)));
    }

    function place(bin) {
      if (selected === null) { showToast("请先选择一张卡片"); return; }
      const item = items.find((entry) => entry.id === selected);
      if (item.bin === bin) {
        item.placed = bin; selected = null; draw();
        if (items.every((entry) => entry.placed)) {
          const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
          setTimeout(() => renderResult(mount, app, activity, stars, "分类完成！", `全部 ${items.length} 张卡片都找到了位置。`, () => renderSort(mount, app, activity)), prefersReducedMotion ? 0 : 500);
        }
      } else {
        mistakes += 1;
        mount.querySelector("#sortHelp").textContent = `${item.label} 不属于“${bin}”，再想想它的特点。`;
      }
    }

    draw();
  }

  function generateMaze(cols, rows) {
    const cells = Array.from({ length: cols * rows }, () => ({ walls: [true, true, true, true] }));
    const visited = new Set([0]);
    const stack = [0];
    const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    while (stack.length) {
      const current = stack[stack.length - 1];
      const x = current % cols; const y = Math.floor(current / cols);
      const neighbors = shuffle(dirs.map((dir, index) => ({ dir, index, x: x + dir[0], y: y + dir[1] })))
        .filter((next) => next.x >= 0 && next.x < cols && next.y >= 0 && next.y < rows && !visited.has(next.y * cols + next.x));
      if (!neighbors.length) { stack.pop(); continue; }
      const next = neighbors[0]; const nextIndex = next.y * cols + next.x;
      cells[current].walls[next.index] = false;
      cells[nextIndex].walls[(next.index + 2) % 4] = false;
      visited.add(nextIndex); stack.push(nextIndex);
    }
    return cells;
  }

  function mazePath(cells, cols, start, goal) {
    const queue = [start]; const parent = new Map([[start, -1]]);
    const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    while (queue.length) {
      const current = queue.shift();
      if (current === goal) break;
      const x = current % cols; const y = Math.floor(current / cols);
      dirs.forEach((dir, index) => {
        if (cells[current].walls[index]) return;
        const next = (y + dir[1]) * cols + x + dir[0];
        if (!parent.has(next)) { parent.set(next, current); queue.push(next); }
      });
    }
    const path = []; let cursor = goal;
    while (cursor !== -1 && parent.has(cursor)) { path.unshift(cursor); cursor = parent.get(cursor); }
    return path;
  }

  function mazeTokenConfig(factory, path) {
    let labels = [];
    if (factory === "number") labels = ["1", "2", "3"];
    if (factory === "word") labels = ["春", "夏", "秋"];
    if (factory === "treasure") labels = ["◆", "◆", "◆"];
    return labels.map((label, index) => ({
      index: path[Math.max(1, Math.min(path.length - 2, Math.floor((index + 1) * path.length / (labels.length + 1))))],
      label,
      collected: false
    }));
  }

  function renderMaze(mount, app, activity) {
    const cols = 8; const rows = 6; const goal = cols * rows - 1;
    const cells = generateMaze(cols, rows); const path = mazePath(cells, cols, 0, goal);
    const tokens = mazeTokenConfig(activity.factory, path);
    const players = activity.factory === "coop" ? [0, 0] : [0];
    let activePlayer = 0; let collected = 0; let moves = 0;
    const maxMoves = activity.factory === "limited" ? path.length + 5 : Infinity;
    const labels = { animal: ["🐰", "🏠"], city: ["🚌", "🏫"], number: ["🚶", "🏁"], word: ["🚶", "🏁"], limited: ["🚶", "🏁"], treasure: ["🧭", "🚪"], coop: ["●", "旗"] };
    const marks = labels[activity.factory] || ["🚶", "🏁"];

    function canMove(from, to) {
      const fx = from % cols; const fy = Math.floor(from / cols); const tx = to % cols; const ty = Math.floor(to / cols);
      if (tx < 0 || tx >= cols || ty < 0 || ty >= rows) return false;
      if (tx === fx && ty === fy - 1) return !cells[from].walls[0];
      if (tx === fx + 1 && ty === fy) return !cells[from].walls[1];
      if (tx === fx && ty === fy + 1) return !cells[from].walls[2];
      if (tx === fx - 1 && ty === fy) return !cells[from].walls[3];
      return false;
    }

    function moveTo(next) {
      const current = players[activePlayer];
      if (!canMove(current, next)) { showToast("这里有墙，换一条路试试"); return; }
      players[activePlayer] = next; moves += 1;
      const token = tokens.find((entry) => entry.index === next && !entry.collected);
      if (token) { token.collected = true; collected += 1; }
      if (moves > maxMoves) { showToast("超过限定步数了，重新规划路线"); return renderMaze(mount, app, activity); }

      if (activity.factory === "coop") {
        if (players.every((position) => position === goal)) return finishMaze();
        activePlayer = activePlayer === 0 ? 1 : 0;
        if (players[activePlayer] === goal) activePlayer = activePlayer === 0 ? 1 : 0;
      } else if (next === goal) {
        if (tokens.some((entry) => !entry.collected)) showToast("还有路标或宝物没有收集");
        else return finishMaze();
      }
      draw();
    }

    function moveDirection(direction) {
      const current = players[activePlayer];
      const offsets = [-cols, 1, cols, -1];
      moveTo(current + offsets[direction]);
    }

    function finishMaze() {
      const efficient = moves <= path.length + (activity.factory === "coop" ? path.length + 4 : 5);
      const stars = efficient ? 3 : moves <= path.length * (activity.factory === "coop" ? 3 : 2) ? 2 : 1;
      renderResult(mount, app, activity, stars, "顺利到达终点！", `一共走了 ${moves} 步${tokens.length ? `，收集 ${collected} 件目标` : ""}。`, () => renderMaze(mount, app, activity));
    }

    function draw() {
      const remaining = Number.isFinite(maxMoves) ? ` · 剩余 ${Math.max(0, maxMoves - moves)} 步` : "";
      const tokenText = tokens.length ? ` · 收集 ${collected}/${tokens.length}` : "";
      mount.innerHTML = `
        <div class="challenge-panel maze-panel">
          <div class="round-head"><span>${activity.factory === "coop" ? `轮到玩家 ${activePlayer + 1}` : "路线挑战"}</span><strong>已走 ${moves} 步${remaining}${tokenText}</strong></div>
          <div class="maze-wrap">
            <div class="maze-grid" style="--maze-cols:${cols}">
              ${cells.map((cell, index) => {
                const wallStyle = `border-width:${cell.walls[0] ? 3 : 0}px ${cell.walls[1] ? 3 : 0}px ${cell.walls[2] ? 3 : 0}px ${cell.walls[3] ? 3 : 0}px`;
                const token = tokens.find((entry) => entry.index === index && !entry.collected);
                const playerHere = players.map((position, p) => position === index ? `<b class="maze-player p${p + 1}">${activity.factory === "coop" ? p + 1 : marks[0]}</b>` : "").join("");
                return `<button class="maze-cell ${index === goal ? "goal" : ""}" data-index="${index}" style="${wallStyle}" aria-label="迷宫格 ${index + 1}">${index === goal ? `<span class=maze-goal>${marks[1]}</span>` : ""}${token ? `<span class=maze-token>${token.label}</span>` : ""}${playerHere}</button>`;
              }).join("")}
            </div>
          </div>
          <div class="dpad" aria-label="方向控制">
            <button data-dir="0" aria-label="向上">↑</button>
            <button data-dir="3" aria-label="向左">←</button>
            <button data-dir="2" aria-label="向下">↓</button>
            <button data-dir="1" aria-label="向右">→</button>
          </div>
          <button class="button secondary" id="newMaze">换一个迷宫</button>
        </div>`;
      mount.querySelectorAll(".maze-cell").forEach((button) => button.addEventListener("click", () => moveTo(Number(button.dataset.index))));
      mount.querySelectorAll(".dpad button").forEach((button) => button.addEventListener("click", () => moveDirection(Number(button.dataset.dir))));
      mount.querySelector("#newMaze").addEventListener("click", () => renderMaze(mount, app, activity));
    }

    draw();
  }

  function openGridPath(blocked, cols, rows) {
    const goal = cols * rows - 1; const queue = [0]; const seen = new Set([0]);
    while (queue.length) {
      const current = queue.shift(); if (current === goal) return true;
      const x = current % cols; const y = Math.floor(current / cols);
      [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => {
        const nx = x + dx; const ny = y + dy; const next = ny * cols + nx;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !blocked.has(next) && !seen.has(next)) { seen.add(next); queue.push(next); }
      });
    }
    return false;
  }

  function renderMazeEditor(mount, app, activity) {
    const cols = 8; const rows = 6; const goal = cols * rows - 1;
    const blocked = new Set(); let testing = false; let player = 0; let moves = 0;

    function adjacent(a, b) {
      const ax = a % cols; const ay = Math.floor(a / cols); const bx = b % cols; const by = Math.floor(b / cols);
      return Math.abs(ax - bx) + Math.abs(ay - by) === 1;
    }

    function cellClick(index) {
      if (index === 0 || index === goal) return;
      if (!testing) {
        if (blocked.has(index)) blocked.delete(index); else blocked.add(index);
        draw();
      } else if (!blocked.has(index) && adjacent(player, index)) {
        player = index; moves += 1; draw();
        if (player === goal) setTimeout(() => renderResult(mount, app, activity, 3, "自制迷宫通过！", `你设计并用 ${moves} 步走完了自己的迷宫。`, () => renderMazeEditor(mount, app, activity)), prefersReducedMotion ? 0 : 350);
      }
    }

    function startTest() {
      if (!openGridPath(blocked, cols, rows)) { showToast("这个迷宫没有通路，请移开一些墙壁"); return; }
      testing = true; player = 0; moves = 0; draw(); showToast("路线可通，现在亲自试玩");
    }

    function draw() {
      mount.innerHTML = `
        <div class="challenge-panel maze-panel editor-panel">
          <div class="round-head"><span>${testing ? "试玩模式" : "设计模式"}</span><strong>${testing ? `已走 ${moves} 步` : `已放置 ${blocked.size} 面墙`}</strong></div>
          <h2>${testing ? "轻点相邻空格走到终点" : "轻点方格放置或移除墙壁"}</h2>
          <div class="open-grid" style="--maze-cols:${cols}">${Array.from({ length: cols * rows }, (_, index) => `<button class="${blocked.has(index) ? "blocked" : ""} ${player === index && testing ? "player" : ""} ${index === 0 ? "start" : ""} ${index === goal ? "goal" : ""}" data-index="${index}">${index === 0 ? (testing ? "●" : "起") : index === goal ? "终" : blocked.has(index) ? "墙" : ""}</button>`).join("")}</div>
          <div class="editor-actions">
            ${testing ? `<button class="button secondary" id="editMaze">继续编辑</button>` : `<button class="button secondary" id="clearMaze">清空墙壁</button><button class="button primary" id="testMaze">检查并试玩</button>`}
          </div>
        </div>`;
      mount.querySelectorAll(".open-grid button").forEach((button) => button.addEventListener("click", () => cellClick(Number(button.dataset.index))));
      if (testing) mount.querySelector("#editMaze").addEventListener("click", () => { testing = false; draw(); });
      else {
        mount.querySelector("#clearMaze").addEventListener("click", () => { blocked.clear(); draw(); });
        mount.querySelector("#testMaze").addEventListener("click", startTest);
      }
    }

    draw();
  }

  function drawConfig(factory) {
    const configs = {
      tangram: ["用三角形和方形拼出一只动物或交通工具。", "tangram"],
      symmetry: ["参考左半边的点和线，在右半边补出对称图案。", "symmetry"],
      pictureBook: ["完成四页小绘本：角色出场、遇到问题、想出办法、快乐结尾。", "book"],
      completeHalf: ["补全另一半，也可以让它变成意想不到的新东西。", "half"],
      shapeObject: ["选择一个基本形状，把它变成生活中的物品。", "shapes"],
      monsterRoom: ["给小怪兽设计一个舒服、有趣又安全的房间。", "room"],
      newAnimal: ["创造一种新动物，画出它最特别的身体结构。", "animal"],
      futureVehicle: ["发明一种未来交通工具，别忘了动力和乘客空间。", "vehicle"],
      secretBase: ["设计秘密基地的入口、房间、机关和逃生路线。", "base"],
      comic: ["用四格画面讲清楚一件有开头、变化和结尾的事。", "comic"],
      boardDesign: ["画一条从起点到终点的棋盘路线，加入奖励格和挑战格。", "board"],
      myBook: ["给自己的绘本画封面和四个关键画面。", "book"]
    };
    return configs[factory] || configs.shapeObject;
  }

  function paintGuide(context, width, height, guide) {
    context.save();
    context.strokeStyle = "#b8c1c5"; context.fillStyle = "#edf0f1"; context.lineWidth = 2; context.setLineDash([8, 8]);
    if (["symmetry", "half"].includes(guide)) {
      context.beginPath(); context.moveTo(width / 2, 24); context.lineTo(width / 2, height - 24); context.stroke();
      context.setLineDash([]); context.strokeStyle = "#a7b1b6";
      context.beginPath(); context.arc(width * 0.32, height * 0.42, 46, 0, Math.PI * 2); context.moveTo(width * 0.26, height * 0.34); context.lineTo(width * 0.2, height * 0.24); context.stroke();
    } else if (["comic", "book"].includes(guide)) {
      context.setLineDash([]); context.strokeStyle = "#c3cbce"; context.strokeRect(20, 20, width / 2 - 30, height / 2 - 30); context.strokeRect(width / 2 + 10, 20, width / 2 - 30, height / 2 - 30); context.strokeRect(20, height / 2 + 10, width / 2 - 30, height / 2 - 30); context.strokeRect(width / 2 + 10, height / 2 + 10, width / 2 - 30, height / 2 - 30);
    } else if (guide === "board") {
      context.setLineDash([]); for (let i = 0; i < 14; i += 1) { const x = 34 + (i % 7) * ((width - 68) / 7); const y = height * 0.3 + Math.floor(i / 7) * 80; context.strokeRect(x, y, 52, 52); }
    } else if (guide === "room" || guide === "base") {
      context.setLineDash([]); context.strokeRect(width * 0.14, height * 0.18, width * 0.72, height * 0.65); context.beginPath(); context.moveTo(width * 0.14, height * 0.58); context.lineTo(width * 0.86, height * 0.58); context.stroke();
    } else {
      context.beginPath(); context.arc(width * 0.27, height * 0.45, 58, 0, Math.PI * 2); context.stroke();
      context.beginPath(); context.moveTo(width * 0.53, height * 0.58); context.lineTo(width * 0.68, height * 0.3); context.lineTo(width * 0.82, height * 0.58); context.closePath(); context.stroke();
      context.strokeRect(width * 0.58, height * 0.66, 105, 70);
    }
    context.restore();
  }

  function renderDraw(mount, app, activity) {
    const config = drawConfig(activity.factory); const colors = ["#182127", "#ef5b3f", "#087e8b", "#f0ba34", "#2867c7", "#7b50b5", "#ffffff"];
    let currentColor = colors[0]; let size = 7; let strokes = []; let drawing = null; let context; let canvas; let width; let height;
    mount.innerHTML = `
      <div class="creative-panel">
        <div class="creative-prompt"><span>创作任务</span><h2>${config[0]}</h2></div>
        <div class="draw-toolbar">
          <div class="color-swatches" aria-label="画笔颜色">${colors.map((color, index) => `<button class="swatch ${index === 0 ? "active" : ""}" data-color="${color}" style="background:${color}" aria-label="选择颜色 ${index + 1}"></button>`).join("")}</div>
          <label class="brush-size">画笔 <input type="range" min="3" max="18" value="7" aria-label="画笔粗细"></label>
          <div class="draw-actions"><button class="tool-button" id="undoDraw" title="撤销" aria-label="撤销">↶</button><button class="tool-button" id="clearDraw" title="清空" aria-label="清空">×</button><button class="tool-button" id="saveDraw" title="下载作品" aria-label="下载作品">↓</button></div>
        </div>
        <div class="canvas-wrap"><canvas id="drawingCanvas" aria-label="创作画布"></canvas></div>
        <button class="button primary wide" id="finishDraw" disabled>完成作品</button>
      </div>`;
    canvas = mount.querySelector("#drawingCanvas"); context = canvas.getContext("2d", { alpha: false });
    const rect = canvas.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1); width = Math.round(rect.width); height = Math.round(rect.height);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); context.scale(dpr, dpr);

    function redraw() {
      context.fillStyle = "#ffffff"; context.fillRect(0, 0, width, height); paintGuide(context, width, height, config[1]);
      context.lineCap = "round"; context.lineJoin = "round";
      strokes.forEach((stroke) => {
        if (!stroke.points.length) return;
        context.strokeStyle = stroke.color; context.lineWidth = stroke.size; context.beginPath(); context.moveTo(stroke.points[0][0], stroke.points[0][1]);
        stroke.points.slice(1).forEach((point) => context.lineTo(point[0], point[1])); context.stroke();
      });
      mount.querySelector("#finishDraw").disabled = strokes.length < 2;
    }

    function point(event) {
      const bounds = canvas.getBoundingClientRect(); return [(event.clientX - bounds.left) * width / bounds.width, (event.clientY - bounds.top) * height / bounds.height];
    }

    canvas.addEventListener("pointerdown", (event) => {
      event.preventDefault(); canvas.setPointerCapture(event.pointerId);
      const start = point(event); drawing = { color: currentColor, size, points: [start] }; strokes.push(drawing);
      context.fillStyle = currentColor; context.beginPath(); context.arc(start[0], start[1], size / 2, 0, Math.PI * 2); context.fill();
      mount.querySelector("#finishDraw").disabled = strokes.length < 2;
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!drawing) return;
      event.preventDefault();
      const next = point(event); const previous = drawing.points[drawing.points.length - 1]; drawing.points.push(next);
      context.strokeStyle = drawing.color; context.lineWidth = drawing.size; context.lineCap = "round"; context.lineJoin = "round";
      context.beginPath(); context.moveTo(previous[0], previous[1]); context.lineTo(next[0], next[1]); context.stroke();
    });
    const stop = () => { drawing = null; };
    canvas.addEventListener("pointerup", stop); canvas.addEventListener("pointercancel", stop);
    mount.querySelectorAll(".swatch").forEach((button) => button.addEventListener("click", () => { currentColor = button.dataset.color; mount.querySelectorAll(".swatch").forEach((entry) => entry.classList.toggle("active", entry === button)); }));
    mount.querySelector(".brush-size input").addEventListener("input", (event) => { size = Number(event.target.value); });
    mount.querySelector("#undoDraw").addEventListener("click", () => { strokes.pop(); redraw(); });
    mount.querySelector("#clearDraw").addEventListener("click", () => { if (strokes.length && window.confirm("清空当前画布吗？")) { strokes = []; redraw(); } });
    mount.querySelector("#saveDraw").addEventListener("click", () => { const link = document.createElement("a"); link.download = `${activity.title}.png`; link.href = canvas.toDataURL("image/png"); link.click(); showToast("作品已保存为图片"); });
    mount.querySelector("#finishDraw").addEventListener("click", () => renderResult(mount, app, activity, strokes.length >= 8 ? 3 : strokes.length >= 4 ? 2 : 1, "作品完成！", "你把自己的想法变成了一幅独一无二的作品。", () => renderDraw(mount, app, activity)));
    redraw();
  }

  function writeConfig(factory) {
    const configs = {
      puzzle: ["设计一个只有一个答案的谜题。", "我的答案是……\n线索一：……\n线索二：……\n线索三：……", ["颜色", "位置", "数量"]],
      wordChain: ["从“天空”开始接龙，至少写出 4 个词。", "天空 → 空气 → ……", ["气球", "球场", "场地"]],
      ending: ["小船漂到一座从没见过的岛上，岛上的树会唱歌……请补出结尾。", "后来，……", ["发现", "帮助", "回家"]],
      pictureStory: ["角色是小猫和机器人，地点在雨后的公园。讲一个完整故事。", "有一天，……", ["谁", "在哪里", "发生什么", "结果"]],
      alternateEnding: ["小熊终于找到了丢失的钥匙，但门后传来奇怪的音乐……", "结局一：……\n结局二：……", ["温暖", "意外", "幽默"]],
      gameRules: ["设计一个能让 2-4 人玩的新游戏。", "游戏目标：……\n准备材料：……\n轮到你时：……\n获胜条件：……", ["轮流", "奖励", "合作", "获胜"]]
    };
    return configs[factory] || configs.ending;
  }

  function renderWrite(mount, app, activity) {
    const config = writeConfig(activity.factory); const key = `${app.id}:${activity.id}`; const saved = progress.drafts[key] || "";
    mount.innerHTML = `
      <div class="creative-panel write-panel">
        <div class="creative-prompt"><span>表达任务</span><h2>${config[0]}</h2></div>
        <div class="idea-chips">${config[2].map((idea) => `<span>${idea}</span>`).join("")}</div>
        <label class="writing-area"><span>我的创作</span><textarea id="writingText" placeholder="${escapeHtml(config[1])}" maxlength="600">${escapeHtml(saved)}</textarea><small><b id="charCount">${saved.length}</b> / 600</small></label>
        <button class="button primary wide" id="finishWrite" ${saved.trim().length < 6 ? "disabled" : ""}>完成创作</button>
      </div>`;
    const textarea = mount.querySelector("#writingText"); const finish = mount.querySelector("#finishWrite");
    textarea.addEventListener("input", () => {
      progress.drafts[key] = textarea.value; saveProgress();
      mount.querySelector("#charCount").textContent = textarea.value.length;
      finish.disabled = textarea.value.trim().length < 6;
    });
    finish.addEventListener("click", () => {
      const length = textarea.value.trim().length; const stars = length >= 80 ? 3 : length >= 30 ? 2 : 1;
      renderResult(mount, app, activity, stars, "创作完成！", `你写下了 ${length} 个字符，想法已经保存在本设备。`, () => renderWrite(mount, app, activity));
    });
  }

  function renderChecklist(mount, app, activity) {
    const tasks = ["整理自己的书桌", "给植物浇水", "收好玩具", "摆放餐具", "整理第二天书包", "把脏衣服放进洗衣篮", "擦干净自己的水杯", "帮助家人分类垃圾"];
    const checked = new Set();
    function draw() {
      mount.innerHTML = `
        <div class="challenge-panel checklist-panel">
          ${roundHeader(checked.size, 3, "家庭任务打卡")}
          <h2>选择并完成至少 3 项任务</h2>
          <div class="checklist">${tasks.map((task, index) => `<label><input type="checkbox" data-index="${index}" ${checked.has(index) ? "checked" : ""}><span>${task}</span></label>`).join("")}</div>
          <button class="button primary wide" id="finishChecklist" ${checked.size < 3 ? "disabled" : ""}>完成今日挑战</button>
        </div>`;
      mount.querySelectorAll(".checklist input").forEach((input) => input.addEventListener("change", () => { const index = Number(input.dataset.index); if (input.checked) checked.add(index); else checked.delete(index); draw(); }));
      mount.querySelector("#finishChecklist").addEventListener("click", () => renderResult(mount, app, activity, checked.size >= 6 ? 3 : checked.size >= 4 ? 2 : 1, "谢谢你的参与！", `今天完成了 ${checked.size} 项家庭任务。`, () => renderChecklist(mount, app, activity)));
    }
    draw();
  }

  const FAMILY_QUESTIONS = [
    ["饭前应该先做什么？", "洗手", ["洗手", "奔跑", "吃糖", "关灯"]],
    ["一年有几个季节？", "4", ["2", "3", "4", "5"]],
    ["哪种动物被称为森林医生？", "啄木鸟", ["啄木鸟", "金鱼", "绵羊", "海豚"]],
    ["红灯亮起时应该怎样？", "停下等待", ["停下等待", "快速通过", "闭眼走", "追逐打闹"]],
    ["15 减 7 等于多少？", "8", ["6", "7", "8", "9"]],
    ["地球围绕什么运行？", "太阳", ["太阳", "月亮", "云朵", "高山"]]
  ];

  function renderBoard(mount, app, activity) {
    const total = 20; let position = 0; let turns = 0; let gems = 0; let pending = null;
    const gemCells = new Set([4, 9, 15]); const trapCells = new Set([7, 13]);

    function finishBoard() {
      const stars = turns <= 4 ? 3 : turns <= 7 ? 2 : 1;
      renderResult(mount, app, activity, stars, "到达终点！", `用了 ${turns} 个回合${activity.factory === "treasure" ? `，收集 ${gems} 颗宝石` : ""}。`, () => renderBoard(mount, app, activity));
    }

    function applyMove(steps) {
      position = Math.min(total - 1, position + steps);
      if (activity.factory === "treasure") {
        if (gemCells.has(position)) { gems += 1; gemCells.delete(position); showToast("找到一颗宝石"); }
        if (trapCells.has(position)) { position = Math.max(0, position - 2); showToast("遇到陷阱，后退两格"); }
      }
      pending = null;
      if (position >= total - 1) setTimeout(finishBoard, prefersReducedMotion ? 0 : 400); else draw();
    }

    function roll() {
      if (pending) return;
      turns += 1;
      if (activity.factory === "diceMath") {
        const a = rand(1, 6); const b = rand(1, 6); const sum = a + b;
        pending = { prompt: `${a} + ${b} = ?`, visual: `${a} ⚄ ${b}`, answer: String(sum), options: uniqueNumberOptions(sum, 3), steps: sum };
      } else if (activity.factory === "familyQuiz") {
        const q = pick(FAMILY_QUESTIONS); const die = rand(2, 6);
        pending = { prompt: q[0], visual: `答对前进 ${die} 格`, answer: q[1], options: shuffle(q[2]), steps: die };
      } else {
        const die = rand(1, 6); pending = { prompt: `骰子点数：${die}`, visual: "找到宝物再到终点", answer: "前进", options: ["前进"], steps: die };
      }
      draw();
    }

    function answer(value) {
      if (!pending) return;
      if (value === pending.answer) { showToast("回答正确，开始前进"); applyMove(pending.steps); }
      else {
        showToast(`这次没有答对，正确答案是 ${pending.answer}`);
        pending = null; draw();
      }
    }

    function draw() {
      mount.innerHTML = `
        <div class="challenge-panel board-panel">
          <div class="round-head"><span>第 ${turns + 1} 回合</span><strong>位置 ${position + 1} / ${total}${activity.factory === "treasure" ? ` · 宝石 ${gems}` : ""}</strong></div>
          <div class="game-board">${Array.from({ length: total }, (_, index) => `<div class="board-cell ${position === index ? "current" : ""} ${gemCells.has(index) ? "gem" : ""} ${trapCells.has(index) ? "trap" : ""}"><small>${index + 1}</small>${index === 0 ? "起" : index === total - 1 ? "终" : gemCells.has(index) ? "◆" : trapCells.has(index) ? "!" : ""}${position === index ? "<b>●</b>" : ""}</div>`).join("")}</div>
          ${pending ? `<div class="board-question"><span>${pending.visual}</span><h2>${pending.prompt}</h2><div>${pending.options.map((option) => `<button class="answer-button" data-value="${escapeHtml(option)}">${option}</button>`).join("")}</div></div>` : `<button class="dice-button" id="rollDice"><span aria-hidden="true">⚄</span><strong>掷骰子</strong></button>`}
        </div>`;
      if (pending) mount.querySelectorAll(".board-question button").forEach((button) => button.addEventListener("click", () => answer(button.dataset.value)));
      else mount.querySelector("#rollDice").addEventListener("click", roll);
    }

    draw();
  }

  function renderBingo(mount, app, activity) {
    const numbers = shuffle(Array.from({ length: 30 }, (_, index) => index + 1)).slice(0, 16);
    const drawn = new Set(); const marked = new Set(); let current = null; let draws = 0;

    function hasLine() {
      const lines = [];
      for (let row = 0; row < 4; row += 1) lines.push([0, 1, 2, 3].map((col) => row * 4 + col));
      for (let col = 0; col < 4; col += 1) lines.push([0, 1, 2, 3].map((row) => row * 4 + col));
      lines.push([0, 5, 10, 15], [3, 6, 9, 12]);
      return lines.some((line) => line.every((index) => marked.has(index)));
    }

    function drawNumber() {
      const remaining = Array.from({ length: 30 }, (_, index) => index + 1).filter((number) => !drawn.has(number));
      if (!remaining.length) return;
      current = pick(remaining); drawn.add(current); draws += 1; draw();
    }

    function mark(index) {
      const number = numbers[index];
      if (!drawn.has(number)) { showToast("这个数字还没有抽到"); return; }
      marked.add(index); draw();
      if (hasLine()) {
        const stars = draws <= 12 ? 3 : draws <= 20 ? 2 : 1;
        setTimeout(() => renderResult(mount, app, activity, stars, "BINGO！", `用 ${draws} 次抽取连成了一条线。`, () => renderBingo(mount, app, activity)), prefersReducedMotion ? 0 : 450);
      }
    }

    function draw() {
      mount.innerHTML = `
        <div class="challenge-panel bingo-panel">
          <div class="round-head"><span>数字宾果</span><strong>已抽 ${draws} 个数字</strong></div>
          <div class="bingo-call"><span>${current === null ? "准备" : "本轮数字"}</span><strong>${current === null ? "?" : current}</strong></div>
          <div class="bingo-grid">${numbers.map((number, index) => `<button class="${marked.has(index) ? "marked" : ""}" data-index="${index}">${number}</button>`).join("")}</div>
          <button class="button primary wide" id="drawNumber">${current === null ? "抽第一个数字" : "抽下一个数字"}</button>
        </div>`;
      mount.querySelectorAll(".bingo-grid button").forEach((button) => button.addEventListener("click", () => mark(Number(button.dataset.index))));
      mount.querySelector("#drawNumber").addEventListener("click", drawNumber);
    }

    draw();
  }

  function renderCurrent() {
    window.scrollTo(0, 0);
    if (!APP_ID) { document.body.dataset.page = "hub"; renderHub(); return; }
    const app = appById(APP_ID);
    if (!app) { appRoot.innerHTML = "<main class=error-page><h1>没有找到这个主题</h1><a href=../>返回益智乐园</a></main>"; return; }
    document.body.dataset.page = "app";
    const match = window.location.hash.match(/^#activity=([a-z0-9-]+)$/);
    const activity = match ? app.activities.find((item) => item.id === match[1]) : null;
    if (activity) renderActivity(app, activity); else { if (activeCleanup) activeCleanup(); activeCleanup = null; renderAppHome(app); }
  }

  window.addEventListener("hashchange", renderCurrent);
  renderCurrent();
}());
