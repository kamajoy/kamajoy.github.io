(function () {
  "use strict";

  const mini = (id, order, path, icon, title, subtitle, description, prompt, color, soft, mode, config) => ({
    id, order, path, icon, title, subtitle, description, prompt, color, soft,
    preview: "arcade", engine: "mini-arcade", mode, config: config || {}
  });

  window.RELAX_CATALOG = [
    {
      id: "sand-art", order: "01", path: "01-sand-art", icon: "✦",
      title: "指尖沙画", subtitle: "轻轻画出流动的彩沙",
      description: "用手指撒下细沙，叠出山丘、星空和秘密花园。",
      prompt: "选一种沙子，用手指在画面上慢慢移动。可以撤销、清空或保存作品。",
      color: "#d9583b", soft: "#fde5dc", preview: "sand"
    },
    {
      id: "space-station", order: "02", path: "02-space-station", icon: "◎",
      title: "小小太空站", subtitle: "点亮自己的宇宙基地",
      description: "轻点漂来的能量球，让太空站一节一节亮起来。",
      prompt: "轻点发光的能量球，为太空站充能。收集十二颗能量球就能点亮整座基地。",
      color: "#2764ad", soft: "#e0ebfb", preview: "space"
    },
    {
      id: "bubble-melody", order: "03", path: "03-bubble-melody", icon: "○",
      title: "泡泡旋律", subtitle: "戳出一首彩色小曲",
      description: "每个泡泡都有自己的音符，轻轻点破就会唱歌。",
      prompt: "轻点向上飘的彩色泡泡。不同颜色会发出不同音符，没有时间限制。",
      color: "#087e8b", soft: "#d9f1f2", preview: "bubble"
    },
    {
      id: "cloud-studio", order: "04", path: "04-cloud-studio", icon: "☁",
      title: "云朵变形屋", subtitle: "发现天空里的想象",
      description: "轻点云朵，看它变成小鱼、爱心、飞船和更多形状。",
      prompt: "轻点天空中的云朵，让它变成新的形状。找到八种不同形状就完成一次云朵旅行。",
      color: "#3d79b9", soft: "#e2effb", preview: "cloud"
    },
    {
      id: "firefly-garden", order: "05", path: "05-firefly-garden", icon: "✧",
      title: "萤火虫花园", subtitle: "用微光叫醒夜晚的花",
      description: "移动手指带领萤火虫，让沉睡的小花一朵朵发亮。",
      prompt: "在画面上移动手指，引导萤火虫靠近花朵。点亮全部六朵花后，还可以继续散步。",
      color: "#39765a", soft: "#e0f0e7", preview: "firefly"
    },
    {
      id: "kaleidoscope", order: "06", path: "06-kaleidoscope", icon: "✣",
      title: "魔法万花筒", subtitle: "一笔开出对称花朵",
      description: "只画一条线，镜子会把它变成整圈闪亮花纹。",
      prompt: "选择颜色和镜面数量，再用手指在画面上画线。每一笔都会变成对称图案。",
      color: "#b64378", soft: "#f8e1ed", preview: "kaleido"
    },
    {
      id: "rainbow-catcher", order: "07", path: "07-rainbow-catcher", icon: "⌒",
      title: "彩虹接接乐", subtitle: "接住颜色搭一座彩虹",
      description: "左右移动小篮子，接住慢慢落下来的彩色雨滴。",
      prompt: "左右移动手指控制篮子，接住彩色雨滴。每接住一种颜色，天空就多一段彩虹。",
      color: "#c94b43", soft: "#fae4df", preview: "rainbow"
    },
    {
      id: "ocean-aquarium", order: "08", path: "08-ocean-aquarium", icon: "≈",
      title: "海底水族箱", subtitle: "喂鱼、看泡泡、慢慢发呆",
      description: "在水中轻点投下食物，看小鱼游来聚餐。",
      prompt: "轻点水中任意位置投下食物。小鱼会游过来，吃饱后还会送你一串泡泡。",
      color: "#167785", soft: "#d9eff1", preview: "ocean"
    },
    {
      id: "rhythm-drums", order: "09", path: "09-rhythm-drums", icon: "♪",
      title: "四彩小鼓手", subtitle: "听一听，再敲回去",
      description: "记住短短的节奏，用四面彩鼓把它轻松敲回来。",
      prompt: "先点播放节奏，听完后按照亮起的顺序敲鼓。敲错也没关系，节奏会再播放一次。",
      color: "#9a5526", soft: "#f7e7d8", preview: "drum"
    },
    {
      id: "paper-plane", order: "10", path: "10-paper-plane", icon: "➤",
      title: "纸飞机旅行", subtitle: "穿过云朵和闪亮圆环",
      description: "上下移动纸飞机，在柔软的天空里收集旅行印章。",
      prompt: "在画面上上下移动手指控制纸飞机。穿过闪亮圆环即可收集旅行印章，不会坠落。",
      color: "#466b4f", soft: "#e2eee4", preview: "plane"
    },
    mini("star-pilot", "11", "11-star-pilot", "✦", "星河引航", "带小飞船收集星尘", "拖动飞船穿过星河，让一颗颗星尘点亮尾焰。", "按住并拖动飞船，收集十二颗星尘。碰到陨石只会轻轻弹开，没有失败。", "#3268b2", "#e2ecfb", "collect", { player: "🚀", target: "✦", obstacle: "●", goal: 12, scene: "space" }),
    mini("moon-courier", "12", "12-moon-courier", "☾", "月球快递", "按顺序送达月面包裹", "在月面基地之间规划路线，把包裹依次送到编号站点。", "从发光的起点开始，按相邻顺序点击月面站点。完成三条逐渐变长的路线。", "#4d5f91", "#e7eafa", "route", { player: "📦", target: "☾", scene: "moon" }),
    mini("planet-dreamer", "13", "13-planet-dreamer", "◉", "行星造梦机", "亲手搭建一颗奇妙行星", "添加山脉、环带、卫星和小基地，做出自己的行星明信片。", "选择一种行星部件，再轻点画面放置。放入六种部件即可完成一颗新行星。", "#9a4f70", "#f5e5ed", "builder", { pieces: ["🪐", "☾", "⛰️", "🌋", "🛰️", "🏠"], scene: "planet" }),
    mini("comet-tail", "14", "14-comet-tail", "↝", "彗星尾巴", "画出会发光的宇宙线条", "用手指拖出彗星轨迹，穿过星环就会绽放彩色光点。", "按住画面自由绘光。依次穿过五个星环，完成一条闪亮彗星尾巴。", "#7b4eae", "#eee5f8", "trail", { target: "✧", scene: "space", colors: ["#f1ca51", "#69c5d2", "#ef7aa1"] }),
    mini("robot-charge", "15", "15-robot-charge", "▣", "机器人充电站", "记住闪烁的能量插口", "观察机器人胸前亮起的插口，再按同样顺序为它充电。", "点播放观察闪光顺序，再按顺序点击四个插口。每成功一次，序列会变长。", "#35745f", "#e1f0e8", "memory", { pads: ["⚡", "◆", "●", "▲"], scene: "robot" }),
    mini("deep-sea-diver", "16", "16-deep-sea-diver", "≈", "深海潜航员", "驾驶潜艇寻找发光珍珠", "拖动小潜艇穿过深海，收集珍珠并发现海底遗迹。", "按住并拖动潜艇，收集十二颗珍珠。水母会让潜艇慢一小会儿，但不会失败。", "#087b87", "#dceff1", "collect", { player: "🛥️", target: "○", obstacle: "♨", goal: 12, scene: "ocean" }),
    mini("coral-colorist", "17", "17-coral-colorist", "♒", "珊瑚调色师", "给海底花园配一套颜色", "轻点珊瑚换颜色，让海底花园拥有六种不同色彩。", "选择颜色后轻点画面种下珊瑚。集齐六种颜色，鱼群会来参观。", "#c44f60", "#f8e3e6", "builder", { pieces: ["🪸", "🌿", "🐚", "✿", "♒", "🐠"], scene: "ocean" }),
    mini("whale-radio", "18", "18-whale-radio", "♪", "鲸歌电台", "听懂深海里的四个音符", "大鲸鱼发来短短的声音密码，听一遍，再把旋律回送给它。", "播放鲸歌后，按亮起顺序点击四枚声波。成功后旋律会从三音增长到八音。", "#27698a", "#dfeef5", "memory", { pads: ["低", "中", "高", "回"], scene: "ocean" }),
    mini("current-maze", "19", "19-current-maze", "〰", "海流迷宫", "沿着安全海流找到出口", "观察水流方向，在珊瑚之间为小鱼选出连续路线。", "从小鱼所在格开始，只点击相邻的发光格。完成三张越来越长的海流图。", "#187669", "#ddf0ea", "route", { player: "🐟", target: "🐚", scene: "ocean" }),
    mini("shell-code", "20", "20-shell-code", "◇", "贝壳密码", "翻转贝壳点亮潮汐图案", "每次轻点会同时改变周围贝壳，想办法让整片沙滩亮起来。", "轻点贝壳会翻转它和相邻贝壳。完成三张由易到难的灯阵。", "#a65d3c", "#f5e7de", "toggle", { on: "◆", off: "◇", scene: "beach" }),
    mini("potion-house", "21", "21-potion-house", "⚗", "魔法药水屋", "按配方调出会冒泡的药水", "查看配方卡，依次加入三种材料，调出不同颜色的魔法药水。", "记住配方，从四种材料中按顺序选择。连续完成五杯药水。", "#7b4fa2", "#eee4f5", "recipe", { ingredients: ["🌿", "🍄", "💧", "✦"], recipes: [[0,2,3],[1,0,2],[3,1,0],[2,3,1]] }),
    mini("starlight-post", "22", "22-starlight-post", "✉", "星光邮局", "把彩色信件送进星门", "辨认信封上的星星，把它投进颜色相同的星门。", "看清顶部配方卡，按顺序选择对应星门。连续送达五封星光邮件。", "#b14b68", "#f7e2e8", "recipe", { ingredients: ["红门", "蓝门", "金门", "绿门"], recipes: [[0,2,1],[3,1,0],[2,3,1],[1,0,2]] }),
    mini("shadow-theater", "23", "23-shadow-theater", "◒", "影子剧场", "用光画出会动的故事", "移动手指控制聚光灯，穿过舞台标记，让影子角色登场。", "按住画面移动光点，依次照亮五个舞台标记。完成后可以继续自由画光。", "#79523f", "#f1e7df", "trail", { target: "★", scene: "theater", colors: ["#ffd96a", "#ff9b6a", "#8dd3c7"] }),
    mini("dragon-egg", "24", "24-dragon-egg", "◍", "龙蛋孵化器", "在发光时刻送出能量", "等待能量圈靠近绿色区域，轻点为龙蛋注入刚刚好的温度。", "观察移动的能量点，在它进入绿色区域时轻点画面。累计八次就能孵化龙蛋。", "#b2493e", "#f7e2df", "balance", { object: "🥚", action: "注入能量", goal: 8, scene: "cave" }),
    mini("cloud-castle", "25", "25-cloud-castle", "♜", "云端城堡", "把漂浮房间拼成天空城", "放置塔楼、桥梁、花园和飞艇码头，搭一座不会掉下来的城堡。", "选择建筑部件，再轻点云层放置。集齐六类部件即可举行开城仪式。", "#607bb2", "#e5eaf7", "builder", { pieces: ["🏰", "🌉", "🌳", "☁️", "🎈", "🚩"], scene: "sky" }),
    mini("forest-train", "26", "26-forest-train", "▥", "森林小火车", "为动物车站接通轨道", "沿着相邻方格铺路，让小火车依次到达森林里的三座车站。", "从火车格开始点击相邻轨道。完成三条路线，最后一条会穿过更多车站。", "#477242", "#e5f0e2", "route", { player: "🚂", target: "🚉", scene: "forest" }),
    mini("mushroom-bounce", "27", "27-mushroom-bounce", "♩", "蘑菇弹跳台", "轻点会发光的弹跳蘑菇", "小精灵在蘑菇之间弹跳，找准下一朵亮起的蘑菇。", "轻点画面中发光的蘑菇，连续找到十二朵。点错只会冒出一颗小星星。", "#a34d65", "#f5e3e9", "tap", { target: "🍄", decoy: "🌿", goal: 12, scene: "forest" }),
    mini("pinecone-balance", "28", "28-pinecone-balance", "△", "松果平衡术", "让松果塔稳稳站在树桩上", "观察来回移动的平衡点，找准时机把松果放上树桩。", "当移动光点进入绿色区域时轻点放上松果。连续成功八次，松鼠会为塔顶插旗。", "#8a5a2f", "#f2e7db", "balance", { object: "🌰", action: "放上松果", goal: 8, scene: "forest" }),
    mini("wind-whisper", "29", "29-wind-whisper", "⌁", "风语捕手", "带着风筝收集会唱歌的风", "拖动风筝追上十二缕彩色风，让天空响起轻快和弦。", "按住并拖动风筝，收集彩色风旋。云朵会把风筝轻轻推开。", "#477da6", "#e2eef5", "collect", { player: "🪁", target: "⌁", obstacle: "☁", goal: 12, scene: "sky" }),
    mini("bug-camera", "30", "30-bug-camera", "⌾", "昆虫摄影师", "抓拍一闪而过的花园访客", "在花丛中找到发光昆虫，轻点快门收集自然相册。", "轻点出现光圈的昆虫，拍下十二张照片。其他花叶也可以点着玩。", "#39795c", "#dff0e7", "tap", { target: "🦋", decoy: "🌼", goal: 12, scene: "garden" }),
    mini("neon-circuit", "31", "31-neon-circuit", "⌁", "霓虹电路板", "接通芯片之间的能量线路", "观察芯片位置，用连续方格把起点和终端连接起来。", "从发光芯片开始点击相邻方格，接通三块难度递增的电路板。", "#266d74", "#deeff0", "route", { player: "⚡", target: "▣", scene: "neon" }),
    mini("pixel-garden", "32", "32-pixel-garden", "▦", "像素花园", "一格一格种出会生长的图案", "选择种子颜色，在像素土地上种花、铺水面、搭小路。", "选择一种像素种子，再轻点画面种下它。集齐六类像素，花园会进入夜景。", "#3f7954", "#e2f0e6", "builder", { pieces: ["🌱", "🌷", "💧", "🪨", "🍄", "✦"], scene: "pixel" }),
    mini("beat-password", "33", "33-beat-password", "♬", "密码节拍器", "用节奏打开霓虹保险箱", "观察四枚按键的闪光顺序，再准确敲回越来越长的节奏。", "点播放密码，按亮起顺序点击四枚节拍键。序列会从三拍增长到八拍。", "#8e4677", "#f2e3ed", "memory", { pads: ["咚", "哒", "叮", "啪"], scene: "neon" }),
    mini("magnet-lab", "34", "34-magnet-lab", "⊕", "磁力实验室", "用磁力小球吸起金属星", "拖动磁力球靠近金属星片，观察它们被吸过来的轨迹。", "按住并拖动磁力球，收集十二枚金属星。木块不会被吸住，只会轻轻挡路。", "#3d6e91", "#e2edf5", "collect", { player: "🧲", target: "✦", obstacle: "▰", goal: 12, scene: "lab" }),
    mini("light-mirrors", "35", "35-light-mirrors", "◩", "光束反射镜", "翻转镜片点亮整块光网", "轻点镜片会改变自己和相邻镜片的方向，把暗格全部点亮。", "轻点任意镜片翻转周围状态。完成三块从小到大的光学灯阵。", "#b46b2b", "#f5e9dc", "toggle", { on: "◩", off: "◪", scene: "lab" }),
    mini("sushi-belt", "36", "36-sushi-belt", "▰", "寿司传送带", "按订单摆出三件寿司", "读懂客人的图案订单，按正确顺序从传送带挑出三件寿司。", "记住订单卡，从四种寿司中按顺序选择。连续完成五张订单。", "#b64d45", "#f7e2df", "recipe", { ingredients: ["🍣", "🍙", "🥒", "🍤"], recipes: [[0,3,1],[2,0,3],[1,2,0],[3,1,2]] }),
    mini("pizza-designer", "37", "37-pizza-designer", "◉", "披萨设计师", "在圆圆面饼上自由搭配", "放上番茄、蘑菇、玉米和奶酪，设计一张独一无二的披萨。", "选择配料，再轻点面饼放置。集齐六种配料，就能把作品送进烤箱。", "#b75832", "#f5e5dc", "builder", { pieces: ["🍅", "🍄", "🌽", "🧀", "🫑", "🫒"], scene: "kitchen" }),
    mini("icecream-tower", "38", "38-icecream-tower", "♢", "冰淇淋塔", "找准平衡叠起彩色冰球", "观察摆动的小冰球，在它靠近甜筒中心时轻点落下。", "当移动点进入绿色区域时轻点放下冰球。成功叠八层即可完成彩虹甜筒。", "#c14f78", "#f7e2ed", "balance", { object: "🍨", action: "放下冰球", goal: 8, scene: "kitchen" }),
    mini("traffic-chief", "39", "39-traffic-chief", "╬", "城市交通官", "给救援车规划畅通路线", "沿相邻街区安排路线，让救援车依次经过补给站并抵达终点。", "从救援车格开始点击相邻道路，完成三张越来越复杂的城市路线图。", "#446d75", "#e2edef", "route", { player: "🚑", target: "🏥", scene: "city" }),
    mini("mini-detective", "40", "40-mini-detective", "⌕", "迷你侦探社", "在房间里找出会发光的线索", "观察热闹场景，发现短暂亮起的脚印、钥匙和秘密符号。", "轻点带光圈的线索，收集十二条证据。普通物品也能互动，不会扣分。", "#6b566d", "#ece5ed", "tap", { target: "🔎", decoy: "◆", goal: 12, scene: "room" })
  ];
}());
