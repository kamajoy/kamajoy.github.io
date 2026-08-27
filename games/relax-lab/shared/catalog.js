(function () {
  "use strict";

  const mini = (id, order, path, icon, title, subtitle, description, prompt, color, soft, mode, config) => ({
    id, order, path, icon, title, subtitle, description, prompt, color, soft,
    preview: "arcade", engine: "mini-arcade", mode, config: config || {}
  });

  const special = (id, order, path, icon, title, subtitle, description, prompt, color, soft, engine, mode, config) => ({
    id, order, path, icon, title, subtitle, description, prompt, color, soft,
    preview: "arcade", engine, mode, config: config || {}
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
    mini("mini-detective", "40", "40-mini-detective", "⌕", "迷你侦探社", "在房间里找出会发光的线索", "观察热闹场景，发现短暂亮起的脚印、钥匙和秘密符号。", "轻点带光圈的线索，收集十二条证据。普通物品也能互动，不会扣分。", "#6b566d", "#ece5ed", "tap", { target: "🔎", decoy: "◆", goal: 12, scene: "room" }),

    special("minecraft-creative", "41", "41-minecraft-creative", "▦", "Minecraft 创造模式", "搭建房屋、城市和机关", "用原创离线积木网格自由搭建基地、街道和自动机关。", "选择方块后轻点网格放置，也可以擦除和旋转视角。本站不连接公共服务器。", "#4b7f45", "#e4f0df", "block-world", "creative", { palette: ["草地", "砖墙", "玻璃", "木门", "水渠", "红石"], icons: ["🌱", "🧱", "▣", "🚪", "💧", "⚡"], goal: 18 }),
    special("minecraft-education", "42", "42-minecraft-education", "⚗", "Minecraft Education", "用积木做科学和历史实验", "在安全的离线创作场里搭一座火山实验室与古代城门。", "先搭好指定的科学或历史场景，再自由添加细节；不需要教育账号。", "#6a6c37", "#f0f0d9", "block-world", "lesson", { palette: ["实验台", "火山", "水", "石柱", "古门", "旗帜"], icons: ["⚗", "🌋", "💧", "🪨", "🏛️", "🚩"], goal: 20, task: "先放一座火山、一条水渠和两根石柱" }),
    special("luanti-world", "43", "43-luanti-world", "⬡", "Luanti 方块世界", "探索免费的开源方块世界", "在轻量网格里采集木头、石头和水晶，规划自己的小营地。", "切换方块并点按网格收集资源，完成营地后继续探索；不加载外部模组。", "#2f7663", "#dff0e8", "block-world", "resources", { palette: ["草方块", "木头", "石头", "水晶", "火把", "小屋"], icons: ["🌿", "🪵", "🪨", "💎", "🔥", "🏠"], goal: 22 }),
    special("classicube", "44", "44-classicube", "◫", "ClassiCube", "浏览器里的轻量建造", "用低多边形积木拼出一座会变色的彩虹广场。", "点击网格放置方块，完成广场四角和中央喷泉；本站为离线单人体验。", "#366e9a", "#e1edf5", "block-world", "town", { palette: ["草地", "红砖", "黄砖", "蓝砖", "喷泉", "树"], icons: ["🌱", "🟥", "🟨", "🟦", "⛲", "🌳"], goal: 16, task: "给四个角各放一块彩砖，再在中心放喷泉" }),
    special("mine-blocks", "45", "45-mine-blocks", "▤", "Mine Blocks", "采集、合成和建造小屋", "在二维方块地图里收集材料，合成工具并盖一间避风小屋。", "先收集木头和石头，再把工具与小屋放进地图；没有怪物追赶。", "#8a633c", "#f3e8dc", "block-world", "craft", { palette: ["泥土", "木头", "石头", "工作台", "火把", "小屋"], icons: ["🟫", "🪵", "🪨", "🛠️", "🔥", "🏠"], goal: 18 }),
    special("paper-minecraft", "46", "46-paper-minecraft", "▧", "Paper Minecraft", "Scratch 风格的二维方块世界", "探索地下、搭桥和种下第一棵像素树。", "沿着二维网格放置方块，集齐树、桥、矿石和小屋即可完成小世界。", "#5a7844", "#e6f0df", "block-world", "2d", { palette: ["草", "泥土", "木桥", "矿石", "树", "小屋"], icons: ["🌿", "🟫", "🌉", "⛏️", "🌳", "🏠"], goal: 20 }),
    special("dragon-builders", "47", "47-dragon-builders", "🐉", "Dragon Quest Builders 2", "完成任务再建造", "跟着友好的小龙任务卡修复一座方块港口。", "按任务顺序放灯塔、码头、花园和旗帜；这是无战斗的原创建造练习。", "#ad5b38", "#f7e5dc", "block-world", "quest", { palette: ["灯塔", "码头", "花园", "桥", "龙蛋", "旗帜"], icons: ["🗼", "⚓", "🌳", "🌉", "🥚", "🚩"], goal: 18, task: "先放灯塔和码头，再装饰花园" }),
    special("portal-knights", "48", "48-portal-knights", "✧", "Portal Knights", "搭建漂浮岛屿", "在三座小岛之间搭桥，安排传送门、树屋和宝箱。", "选择部件放到岛屿网格，连通三座岛后再自由装饰；不含战斗。", "#6654a0", "#ece8f7", "block-world", "islands", { palette: ["岛屿", "桥", "传送门", "树屋", "宝箱", "星灯"], icons: ["🏝️", "🌉", "🌀", "🏡", "🧰", "✦"], goal: 18 }),
    special("townscaper", "49", "49-townscaper", "⌂", "Townscaper", "点击生成漂亮的小镇", "每一次点按都会长出一栋彩色房子，慢慢铺成海边小镇。", "选择屋顶、墙面或小树，再轻点网格；没有输赢，只看自己的城市。", "#367b7b", "#ddf0ef", "block-world", "townscape", { palette: ["房屋", "屋顶", "拱桥", "花窗", "小树", "码头"], icons: ["🏠", "🔺", "🌉", "🪟", "🌳", "⚓"], goal: 20 }),
    special("toca-blocks", "50", "50-toca-blocks", "▦", "Toca Blocks", "用方块创造小世界", "把彩色方块变成滑梯、树屋和秘密通道。", "点击方块改变形状和颜色，找到三种有趣的因果变化。", "#d06b3d", "#fae6da", "block-world", "cause", { palette: ["彩块", "滑梯", "树屋", "通道", "花朵", "小动物"], icons: ["🟧", "🛝", "🏡", "🚪", "🌼", "🐿️"], goal: 15 }),
    special("block-craft-3d", "51", "51-block-craft-3d", "▥", "Block Craft 3D", "规划一座会生长的村庄", "给村庄安排住宅、道路、农田和广场，观察布局变化。", "按类别选择建筑并点按网格，至少放好一条路、两间房和一座广场。", "#a36535", "#f5e6d8", "block-world", "village", { palette: ["住宅", "道路", "农田", "广场", "商店", "风车"], icons: ["🏠", "🛣️", "🌾", "⛲", "🏪", "🌬️"], goal: 20 }),
    special("lego-fortnite", "52", "52-lego-fortnite", "⬢", "LEGO Fortnite Odyssey", "乐高风格的探险营地", "用积木管理木材、石头和食物，搭一座团队营地。", "按资源卡放置采集点、营火、帐篷和旗帜；本站不连接好友或语音。", "#d05b36", "#fae4d9", "block-world", "camp", { palette: ["木材", "石头", "食物", "营火", "帐篷", "旗帜"], icons: ["🪵", "🪨", "🍎", "🔥", "⛺", "🚩"], goal: 18 }),
    special("terraria", "53", "53-terraria", "▥", "Terraria", "二维探索与资源规划", "挖矿、搭平台、种树，在安全的像素山谷里安排资源。", "在地图上放置矿石、平台和基地，完成资源链；这里没有怪物战斗。", "#7b6442", "#f0e8dc", "block-world", "explore", { palette: ["泥土", "矿石", "平台", "树苗", "水池", "基地"], icons: ["🟫", "💎", "🪜", "🌱", "💧", "🏠"], goal: 20 }),
    special("survivalcraft", "54", "54-survivalcraft-2", "⌂", "Survivalcraft 2", "规划自己的生存住所", "为一座小岛安排水源、食物、工具台和避风住所。", "点击网格放置四类生存设施，思考资源之间的距离；不包含危险追逐。", "#4e7558", "#e2efe5", "block-world", "survival", { palette: ["水源", "食物", "工具台", "住所", "篱笆", "火堆"], icons: ["💧", "🥕", "🛠️", "🏠", "🪵", "🔥"], goal: 18 }),
    special("pixark", "55", "55-pixark", "🦕", "PixARK", "恐龙岛上的方块冒险", "搭建恐龙观察站、桥和果园，认识岛屿上的资源分布。", "先放观察站与桥，再添加水池和果树；为避免惊吓，本站没有战斗。", "#4f7d63", "#e3f1e4", "block-world", "dino", { palette: ["观察站", "木桥", "水池", "果树", "恐龙蛋", "旗帜"], icons: ["🔭", "🌉", "💧", "🌴", "🥚", "🚩"], goal: 18 }),

    special("star-doodle", "56", "56-star-doodle", "✦", "星空涂鸦板", "在夜空画出自己的星座", "用彩色光笔连接星星，画出动物、飞船或秘密符号。", "选择颜色后在画布上拖动，完成一幅星座涂鸦；可以撤销、清空和保存。", "#5b559b", "#e9e7f6", "creative-canvas", "doodle", { colors: ["#f1ca51", "#ef795d", "#68c5c0", "#9e8ad1", "#ffffff"] }),
    special("pixel-coloring", "57", "57-pixel-coloring", "▦", "像素填色", "一格一格填出像素图", "给隐藏的像素图案填上颜色，完成后会出现一只小动物。", "选择颜色，再点网格填色；填满 36 格就完成一张像素画。", "#c45b43", "#f8e3dc", "creative-canvas", "pixel", { colors: ["#ef795d", "#f1ca51", "#67c3bd", "#7397d8", "#b96d9d"], size: 6 }),
    special("watercolor", "58", "58-watercolor", "◌", "水彩晕染", "让颜色在纸上慢慢相遇", "半透明的水彩圆点会叠出柔和的新颜色。", "选颜色并在画布上轻点或拖动，试试两种颜色相遇的效果。", "#3981a0", "#e0eff4", "creative-canvas", "watercolor", { colors: ["#e8796b", "#e7b84e", "#5bb5a5", "#6889c4", "#b878a8"] }),
    special("symmetry-drawing", "59", "59-symmetry-drawing", "✣", "对称画画", "一半线条变成完整图案", "画布会自动镜像你的线条，画出蝴蝶、花朵和徽章。", "选择镜面数量后拖动画笔，每一笔都会在另一边出现。", "#a34e76", "#f5e2eb", "creative-canvas", "symmetry", { colors: ["#ef795d", "#f1ca51", "#67c3bd", "#7397d8", "#d47caf"], symmetry: 2 }),
    special("clay-workshop", "60", "60-clay-workshop", "●", "彩泥工坊", "捏一个软乎乎的小角色", "选择不同颜色的彩泥，在画布上叠出小动物、食物和小房子。", "先选颜色，再点按或拖动做泥团；多种颜色叠在一起会变成作品。", "#c46b50", "#f7e4dc", "creative-canvas", "clay", { colors: ["#ef795d", "#f1ca51", "#67c3bd", "#7397d8", "#b96d9d", "#8d634c"] }),
    special("mosaic-art", "61", "61-mosaic-art", "▧", "马赛克拼画", "用彩色小砖拼出图案", "点按方格铺上彩砖，完成一幅闪亮的马赛克作品。", "选择颜色后点方格填砖，填满 64 格即可看到彩色图案。", "#3e7d83", "#dff0ee", "creative-canvas", "mosaic", { colors: ["#ef795d", "#f1ca51", "#67c3bd", "#7397d8", "#9f78a5"], size: 8 }),
    special("sticker-house", "62", "62-sticker-house", "▣", "创意贴纸屋", "给房间贴上自己的故事", "把家具、植物、宠物和星星贴到房间里，布置一个温馨角落。", "选择贴纸后点按画布放置，可以清空再重新设计。", "#b45d3c", "#f8e6dc", "creative-canvas", "stickers", { stickers: ["🛋️", "🌿", "🐱", "🖼️", "⭐", "🪴", "🧸"] }),

    special("rain-drop-box", "63", "64-rain-drop-box", "♩", "雨滴音乐盒", "点一滴雨，听一声清脆的音符", "在窗边点下雨滴，雨声会组成一段放松旋律。", "轻点不同位置的雨滴按钮，组合自己的雨天音乐。", "#4e7895", "#e3eef5", "sound-board", "rain", { pads: ["小雨", "大雨", "滴答", "雷声"], notes: [392, 494, 587, 196], colors: ["#73a9c8", "#4d8bad", "#9fc8dc", "#536779"] }),
    special("forest-rhythm", "64", "65-forest-rhythm", "♫", "森林节奏", "和树叶、溪流一起打节拍", "每个自然声音都有自己的节奏，点按按钮就能组成森林乐队。", "依次点树叶、溪流、木鱼和鸟鸣，听听不同组合。", "#3f7455", "#e2f0e6", "sound-board", "forest", { pads: ["树叶", "溪流", "木鱼", "鸟鸣"], notes: [330, 247, 196, 660], colors: ["#75a96a", "#5bb5a5", "#9b6b49", "#e5b94e"] }),
    special("rainbow-piano", "65", "66-rainbow-piano", "▣", "彩虹钢琴", "按颜色弹出一串旋律", "七色琴键对应七个音，怎么排列都能弹出好听的片段。", "轻点彩色琴键，试着弹出上行、下行或自己的旋律。", "#a45377", "#f5e3eb", "sound-board", "piano", { pads: ["红", "橙", "黄", "绿", "蓝", "靛", "紫"], notes: [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88], colors: ["#ef795d", "#ee9b52", "#f1ca51", "#67a96a", "#67aeb8", "#6f83bd", "#a56aa0"] }),
    special("sea-white-noise", "66", "67-sea-white-noise", "≈", "海浪白噪音", "调一段舒服的海边声音", "把海浪、贝壳和海鸥混在一起，做一段自己的休息音景。", "轻点声音开关，慢慢调出喜欢的海边组合；再次点击即可静音。", "#287487", "#dbf0f2", "sound-board", "ocean", { pads: ["海浪", "贝壳", "海鸥", "远风"], notes: [220, 277, 370, 185], colors: ["#58a9b8", "#d7b56d", "#f3e0a2", "#9ec6d5"] }),
    special("wind-chime-garden", "67", "68-wind-chime-garden", "⌁", "风铃花园", "让风吹过不同的风铃", "点按花园里的风铃，组合出清亮的回声。", "轻点不同风铃，声音会在花园里回荡；可以随时重新开始。", "#5b7891", "#e5eef4", "sound-board", "chime", { pads: ["银铃", "木铃", "玻璃", "竹片", "小钟"], notes: [523.25, 659.25, 783.99, 392, 587.33], colors: ["#c4d9e3", "#b58b63", "#dceef0", "#87b49b", "#efc75c"] }),
    special("rhythm-train", "68", "69-rhythm-train", "▸", "节奏小火车", "让车轮按节拍出发", "四节小车各有一个节奏，按顺序点亮就能开过彩虹桥。", "点按车厢组成四拍节奏，列车会按照你的组合播放。", "#a15c3d", "#f5e5dc", "sound-board", "train", { pads: ["车轮", "汽笛", "铃铛", "桥下"], notes: [196, 261.63, 392, 523.25], colors: ["#d9583b", "#e7ac4c", "#67a7a5", "#6b7fb0"] }),
    special("nature-mixer", "69", "70-nature-mixer", "♬", "自然声音混音器", "自己配一段户外声音", "雨、风、鸟和溪流可以自由叠加，做成一段自然电台。", "点按声音轨道开关，调出你喜欢的自然组合。", "#4e785e", "#e3f0e6", "sound-board", "mixer", { pads: ["雨声", "风声", "鸟声", "溪流", "蛙鸣"], notes: [220, 330, 440, 277, 185], colors: ["#6e9db6", "#a9c4d1", "#efc75c", "#5a9c83", "#80a763"] }),
    special("planet-musician", "70", "71-planet-musician", "◉", "星球音乐家", "让不同星球唱和声", "每颗星球有一种音色，点亮它们就能组成太空和弦。", "点按星球开关，听听低音、中音和高音怎样配在一起。", "#62558f", "#e9e5f7", "sound-board", "planet", { pads: ["月球", "蓝星", "红星", "环星"], notes: [196, 293.66, 392, 587.33], colors: ["#a9a7ca", "#64a9c2", "#d97863", "#d1ae5b"] }),

    special("bubble-wrap", "71", "72-bubble-wrap", "○", "泡泡纸模拟器", "啪的一声，戳破一颗泡泡", "每颗泡泡都能被点破，重新铺一张就能继续玩。", "轻点泡泡纸上的圆点，全部戳完后换一张新的。", "#4d8a9c", "#e0f1f4", "physics", "bubbles", { icon: "○", goal: 36, colors: ["#78c8d5", "#d59fc2", "#f1ca51"] }),
    special("jelly-squeeze", "72", "73-jelly-squeeze", "●", "果冻挤压", "按住果冻，看它软软变形", "拖动手指挤压彩色果冻，松开后它会慢慢弹回来。", "按住果冻并拖动，改变它的形状；没有失败，尽情试试手感。", "#b34e78", "#f6e1ec", "physics", "jelly", { icon: "🍮", colors: ["#e8799d", "#e9ba58", "#6bc1b0"] }),
    special("fluid-paint", "73", "74-fluid-paint", "◌", "流体颜料", "看颜色像水一样流动", "在画布上拖动不同颜色，颜料会扩散、相遇和混合。", "选择颜色并拖动画笔，试着让三种颜色相遇；可以清空重来。", "#4f78a2", "#e2edf5", "physics", "fluid", { colors: ["#ef795d", "#f1ca51", "#67c3bd", "#7397d8", "#b878a8"] }),
    special("domino-chain", "74", "75-domino-chain", "▥", "多米诺骨牌", "排好一条会倒下的骨牌", "在画布上点按放置骨牌，再按下第一块观察连锁反应。", "点按画布放骨牌，排好后按“推倒”看看它们依次倒下。", "#8b633f", "#f2e7dc", "physics", "domino", { icon: "▮", colors: ["#d9583b", "#67aeb8", "#f1ca51"] }),
    special("sand-world", "75", "76-sand-world", "·", "沙粒世界", "让沙子落下堆成小山", "点按画布撒下不同颜色的沙粒，观察它们滚落和堆叠。", "选择沙粒颜色，按住画布撒沙；重力会帮你造出沙丘。", "#a9764a", "#f3e7d7", "physics", "sand", { colors: ["#e5b763", "#d9583b", "#67aeb8", "#f1ca51"] }),
    special("water-ripples", "76", "77-water-ripples", "≈", "水波涟漪", "一点触摸，荡开一圈水波", "在池塘里点下水滴，观察一圈圈涟漪相遇。", "轻点或拖动水面，水波会从每个触点扩散出去。", "#367c8d", "#dceff1", "physics", "ripple", { colors: ["#8ed0d7", "#f1ca51", "#e8799d"] }),
    special("slime-lab", "77", "78-slime-lab", "✦", "软泥实验室", "混合软泥做出新颜色", "把彩色软泥团拖到一起，观察拉伸和混色。", "选择软泥颜色后拖动画布，叠加三种颜色就会出现新软泥。", "#637c5a", "#e6f0df", "physics", "slime", { colors: ["#8bc49b", "#e99d83", "#9f9bd1", "#e3c064"] }),
    special("leaf-sweep", "78", "79-leaf-sweep", "❧", "落叶清扫", "把落叶扫成一堆小山", "拖动扫帚把落叶聚到一起，看看秋天的颜色。", "按住画布移动扫帚，附近的落叶会被推到一起；也可以重新撒叶子。", "#9a6940", "#f4e5d6", "physics", "leaves", { icon: "🍂", colors: ["#d9583b", "#e7ac4c", "#9b6b49", "#7e9b5b"] }),
    special("snowball-roll", "79", "80-snowball-roll", "❄", "雪球滚滚", "把小雪球滚成大雪球", "拖动雪球穿过雪地，它会越滚越大，还会留下雪印。", "按住并拖动雪球移动，绕过小旗子收集雪花；滚得越远雪球越大。", "#557fa2", "#e2edf5", "physics", "snow", { icon: "❄", colors: ["#ffffff", "#b9d9e8", "#f1ca51"] }),

    special("toy-organizer", "80", "81-toy-organizer", "▣", "玩具收纳师", "把玩具放回正确的盒子", "把积木、毛绒玩具、球和画笔分别送回收纳箱。", "先点一个玩具，再点对应的盒子；全部整理好就完成房间。", "#b45c3e", "#f6e5dc", "sorting-board", "bins", { items: ["积木", "小熊", "皮球", "画笔", "积木", "小熊", "皮球", "画笔"], bins: ["积木盒", "玩偶篮", "球筐", "文具盒"], icons: ["🧱", "🧸", "⚽", "🖍️"] }),
    special("pencil-line", "81", "82-pencil-line", "✎", "彩笔排排队", "按颜色顺序排好彩笔", "把散乱的彩笔按彩虹顺序排成一队。", "先点一支彩笔，再点它应该去的位置；顺序完成后会出现彩虹。", "#c05b44", "#f8e3dd", "sorting-board", "sequence", { items: ["蓝", "红", "紫", "黄", "绿", "橙"], target: ["红", "橙", "黄", "绿", "蓝", "紫"], colors: ["#7397d8", "#ef795d", "#b878a8", "#f1ca51", "#67a96a", "#ee9b52"] }),
    special("desk-tidy", "82", "83-desk-tidy", "⌂", "整理小书桌", "让每样东西都有自己的位置", "把书、尺子、水杯和台灯放回桌面格子。", "点物品，再点带轮廓的位置；全部归位后桌面会变得清爽。", "#557b69", "#e2eee6", "sorting-board", "desk", { items: ["书", "尺子", "水杯", "台灯", "橡皮", "便签"], bins: ["书架", "文具区", "杯垫", "灯座", "抽屉", "墙面"], icons: ["📚", "📏", "🥤", "💡", "◼", "📝"] }),
    special("fridge-organizer", "83", "84-fridge-organizer", "▤", "冰箱收纳", "把食物放到合适的层", "水果、牛奶、蔬菜和零食各有适合的冰箱位置。", "先点食物，再点对应的冰箱层；看看怎样摆放更整齐。", "#4e7d91", "#e1eff3", "sorting-board", "bins", { items: ["苹果", "牛奶", "胡萝卜", "酸奶", "饼干", "青菜", "香蕉", "果汁"], bins: ["水果层", "奶制品层", "蔬菜层", "零食层"], icons: ["🍎", "🥛", "🥕", "🍪"] }),
    special("librarian", "84", "85-librarian", "▥", "图书管理员", "按主题给书排架", "把故事书、科学书、艺术书和地图放进对应书架。", "先点一本书，再点对应书架；整理完可以继续换一批。", "#6d5a4c", "#f0e7de", "sorting-board", "bins", { items: ["故事", "科学", "艺术", "地图", "故事", "科学", "艺术", "地图"], bins: ["故事架", "科学架", "艺术架", "地图架"], icons: ["📖", "🔬", "🎨", "🗺️"] }),
    special("room-designer", "85", "86-room-designer", "⌂", "房间布置", "把家具摆成舒服的房间", "选择家具放到地板网格，试试阅读角、游戏角和植物角。", "选择家具后点网格放置，至少布置五件家具；可以清空重摆。", "#8a644b", "#f4e8de", "sorting-board", "layout", { items: ["床", "书桌", "沙发", "植物", "地毯", "灯", "书架"], bins: ["窗边", "墙边", "中央", "角落"], icons: ["🛏️", "🪑", "🛋️", "🪴", "▰", "💡", "📚"] }),
    special("suitcase-pack", "86", "87-suitcase-pack", "▣", "行李箱整理", "把旅行物品装得刚刚好", "衣服、牙刷、书和水壶要放进不同大小的格子。", "点物品，再点行李箱里的空格；试着让每一格都用起来。", "#5f7891", "#e4edf4", "sorting-board", "bins", { items: ["衣服", "牙刷", "绘本", "水壶", "帽子", "袜子", "相机", "雨伞"], bins: ["衣物格", "洗漱袋", "阅读袋", "侧袋"], icons: ["👕", "🪥", "📘", "🧴"] }),
    special("candy-sort", "87", "88-candy-sort", "●", "糖果分类", "按颜色和形状分糖果", "把糖果放进相同颜色的糖果罐，完成后可以设计新配方。", "先点糖果，再点颜色相同的罐子；每一颗都会发出轻快提示音。", "#b34e78", "#f6e2eb", "sorting-board", "bins", { items: ["红糖", "黄糖", "蓝糖", "绿糖", "红糖", "黄糖", "蓝糖", "绿糖"], bins: ["红罐", "黄罐", "蓝罐", "绿罐"], icons: ["🍓", "🍋", "🫐", "🍏"] }),
    special("sock-pairs", "88", "89-sock-pairs", "◌", "袜子配对", "找到每一双相同的袜子", "翻开袜子卡片，记住图案，把相同的两只配成一双。", "一次点两张袜子卡片；配对成功会留在收纳篮里。", "#6e6592", "#ebe8f6", "sorting-board", "memory", { items: ["🌈", "⭐", "🍓", "🚀", "🌈", "⭐", "🍓", "🚀"] }),
    special("puzzle-repair", "89", "90-puzzle-repair", "▧", "拼图修复师", "把碎片放回完整图案", "旋转和交换拼图碎片，让小船、太阳和房子重新出现。", "点击两个碎片交换位置，完成三张越来越难的小拼图。", "#3f7282", "#e0eff1", "sorting-board", "puzzle", { icons: ["🌊", "☀️", "🏠", "🌳", "⛵", "🌈"], size: 3 }),

    special("mini-garden", "90", "91-mini-garden", "✿", "我的迷你花园", "种下种子，看花朵开放", "点按土地播种、浇水和收集花朵，设计一块小花园。", "按播种、浇水、开花的顺序轻点土地，集齐五种花就完成。", "#4f805d", "#e1f0e4", "nature", "garden", { icons: ["🌱", "💧", "🌷", "🌻", "🌼", "🌹"] }),
    special("four-season-tree", "91", "92-four-season-tree", "♧", "四季小树", "看一棵树走过四季", "点按春、夏、秋、冬按钮，观察树叶、花朵和雪的变化。", "按顺序点亮四季，小树会完成一年循环；也可以自由切换。", "#5d8057", "#e6f0df", "nature", "seasons", { icons: ["🌱", "🌳", "🍂", "❄️"] }),
    special("undersea-roam", "92", "93-undersea-roam", "≈", "海底漫游", "和鱼群一起探索珊瑚海", "拖动小潜艇经过珊瑚、海草和沉船，收集海底明信片。", "按住并拖动潜艇，靠近发光的海底物件就能发现它。", "#267887", "#dceff2", "nature", "undersea", { icons: ["🐠", "🪸", "🐚", "⚓", "🌿", "✦"] }),
    special("seed-diary", "93", "94-seed-diary", "⌁", "种子成长日记", "记录一颗种子的成长", "每天点一次阳光、雨水和土壤，观察种子从芽到果实。", "按阳光、浇水、施肥三个步骤照顾种子，完成五个成长阶段。", "#6a8151", "#e9f0dc", "nature", "seed", { icons: ["🌰", "☀️", "💧", "🌱", "🌿", "🍎"] }),
    special("butterfly-garden", "94", "95-butterfly-garden", "🦋", "蝴蝶花园", "种花吸引蝴蝶来访", "选择花朵颜色，吸引不同花纹的蝴蝶。", "点击花朵位置种花，再轻点飞来的蝴蝶；集齐六种花纹就完成。", "#a45678", "#f5e2ec", "nature", "butterfly", { icons: ["🌸", "🌼", "🌺", "🦋", "🐝", "✦"] }),
    special("island-builder", "95", "96-island-builder", "🏝️", "小岛建造师", "把海面小岛变成度假岛", "安排沙滩、树林、灯塔和小船，设计一座舒服的小岛。", "选择岛屿部件后点海面放置，至少完成六个位置。", "#3e7c77", "#dff0ec", "nature", "island", { icons: ["🏖️", "🌴", "🗼", "⛵", "🏡", "🌊"] }),
    special("aurora-observatory", "96", "97-aurora-observatory", "✧", "极光观赏台", "调出自己的极光颜色", "拖动色带和星星，生成一片会呼吸的极光天空。", "选择三种颜色并点亮观测台，极光会随着你的触摸流动。", "#536b9b", "#e4e9f7", "nature", "aurora", { colors: ["#67c3bd", "#7397d8", "#d47caf", "#f1ca51"], icons: ["✦", "☾", "◎", "✧"] }),

    special("pipe-connect", "97", "98-pipe-connect", "╋", "水管连接", "转动水管让水流到花园", "点击管道旋转方向，把水源和花园连成一条路。", "轻点管道旋转，连通起点和终点后会看到水流通过。", "#317b86", "#dceff0", "puzzle", "pipes", { size: 5, icon: "╋" }),
    special("one-line", "98", "99-one-line", "⌁", "一笔画", "不抬笔走完所有点", "把发光的点连起来，每条线只能经过一次。", "从起点开始依次点击相邻的点，试着一笔走完整张图。", "#a04f72", "#f3e1ea", "puzzle", "oneline", { size: 5 }),
    special("gradient-order", "99", "100-gradient-order", "▤", "色彩渐变排序", "把颜色排成平滑的彩虹", "交换色块位置，让颜色从浅到深自然过渡。", "点击两个色块交换位置，完成三组由易到难的渐变。", "#b45c3d", "#f6e4da", "puzzle", "gradient", { size: 6 }),
    special("block-merge", "100", "101-block-merge", "▦", "方块合成", "合并相同方块升级", "把相同数字的方块合成更大的数字，规划下一步。", "点击相邻的相同方块进行合成，达到目标数字即可。", "#536f9a", "#e1ebf5", "puzzle", "merge", { size: 4 }),
    special("path-link", "101", "102-path-link", "╱", "路径连线", "把小动物送回家", "拖动或点击道路格，连通动物和它的家。", "点击相邻格铺路，避开石头并让每只动物都找到家。", "#4f7e60", "#e2f0e4", "puzzle", "path", { size: 5 }),
    special("gear-turn", "102", "103-gear-turn", "⚙", "齿轮转动", "让所有齿轮一起转起来", "点击齿轮改变方向，让动力从起点传到终点。", "点击齿轮切换方向，连接三张越来越复杂的齿轮图。", "#967047", "#f3e8db", "puzzle", "gears", { size: 5 }),
    special("ball-hole", "103", "104-ball-hole", "●", "小球进洞", "规划一条滚动路线", "调整挡板方向，让小球沿着安全路线滚进洞里。", "点击挡板切换方向，再点开始，看小球能否到达终点。", "#3f7783", "#dfeff1", "puzzle", "ball", { size: 5 })
  ];
}());
