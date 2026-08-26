(function () {
  "use strict";

  const make = (id, title, description, kind, factory) => ({ id, title, description, kind, factory });

  window.BRAIN_CATALOG = [
    {
      id: "observation",
      order: "01",
      path: "01-observation",
      icon: "◉",
      title: "火眼金睛",
      subtitle: "观察力训练",
      color: "#ef5b3f",
      soft: "#ffe5dc",
      intro: "慢一点看，线索常常藏在最不起眼的地方。",
      activities: [
        make("spot-difference", "找不同", "从一组图案中找出唯一不同的那个。", "quiz", "oddVisual"),
        make("shadow-match", "影子配对", "观察轮廓，为物品找到正确的影子。", "quiz", "shadow"),
        make("partial-whole", "局部猜整体", "只看局部特征，推断完整物品。", "quiz", "partial"),
        make("odd-category", "谁不属于这里", "根据共同特征找出不同类别。", "quiz", "category"),
        make("hidden-search", "隐藏物品大搜索", "在热闹场景中找到指定目标。", "search", "hidden"),
        make("visual-pattern", "图形变化规律", "发现颜色、形状和顺序的变化。", "quiz", "visualPattern"),
        make("scene-detective", "错误场景侦探", "用生活常识发现画面里的不合理之处。", "quiz", "sceneError"),
        make("memory", "记忆力大挑战", "翻开卡片，记住位置并完成配对。", "memory", "icons")
      ]
    },
    {
      id: "mazes",
      order: "02",
      path: "02-mazes",
      icon: "⌘",
      title: "迷宫大冒险",
      subtitle: "专注力训练",
      color: "#087e8b",
      soft: "#d9f1f2",
      intro: "先观察路线，再迈出第一步；走错也可以重新来。",
      activities: [
        make("animal-home", "动物回家迷宫", "带小动物穿过树林安全回家。", "maze", "animal"),
        make("city-road", "城市道路迷宫", "沿着道路把校车开到学校。", "maze", "city"),
        make("number-path", "数字顺序迷宫", "按数字从小到大收集路标。", "maze", "number"),
        make("word-path", "字母与汉字迷宫", "按正确顺序经过文字路标。", "maze", "word"),
        make("limited-turns", "限定路线迷宫", "避开水面，并在限定步数内到达终点。", "maze", "limited"),
        make("treasure-hunt", "收集宝物迷宫", "先收集三件宝物，再前往出口。", "maze", "treasure"),
        make("co-op", "双人合作迷宫", "两名玩家轮流行动，让伙伴都到达终点。", "maze", "coop"),
        make("maze-maker", "自己设计迷宫", "摆放墙壁、起点与终点，再亲自试玩。", "maze-editor", "editor")
      ]
    },
    {
      id: "math",
      order: "03",
      path: "03-math",
      icon: "＋",
      title: "小小数学家",
      subtitle: "数感训练",
      color: "#2867c7",
      soft: "#dfebff",
      intro: "数字不只在练习册里，它们也藏在时间、购物和每一次估算中。",
      activities: [
        make("number-friends", "数字找朋友", "找出合起来正好等于目标数的一对数字。", "quiz", "numberFriends"),
        make("make-ten", "凑十小游戏", "用最快的方法找到可以凑成十的数字。", "quiz", "makeTen"),
        make("arithmetic", "加减法闯关", "挑战适合当前年龄的加减法。", "quiz", "arithmetic"),
        make("compare", "数字大小比较", "比较数字与算式的大小。", "quiz", "compare"),
        make("missing-number", "缺失的数字", "根据等式找回藏起来的数字。", "quiz", "missingNumber"),
        make("mini-sudoku", "简单数独", "在四宫格中找出缺少的数字。", "quiz", "sudoku"),
        make("shape-equation", "图形算式", "先算出图形代表的数字，再解答问题。", "quiz", "shapeMath"),
        make("shopping", "钱币购物游戏", "在预算内买东西并计算找零。", "quiz", "shopping"),
        make("clock", "时间与钟表", "认识整点、半点和经过的时间。", "quiz", "clock"),
        make("estimate", "测量和估算", "选择合适的单位并进行合理估算。", "quiz", "measure")
      ]
    },
    {
      id: "logic",
      order: "04",
      path: "04-logic",
      icon: "◇",
      title: "规律王国",
      subtitle: "逻辑推理",
      color: "#7b50b5",
      soft: "#eee3fa",
      intro: "把条件一条条放好，答案会自己浮出来。",
      activities: [
        make("next-shape", "找出下一个图形", "观察重复与递进规律。", "quiz", "visualPattern"),
        make("classify", "按条件分类", "根据两个条件判断物品属于哪里。", "sort", "logicSort"),
        make("truth", "谁说了真话", "根据已知事实判断谁的说法可信。", "quiz", "truth"),
        make("seating", "座位排列", "利用左右、相邻等线索找到座位。", "order", "seating"),
        make("event-order", "事件先后顺序", "把生活事件排成合理顺序。", "order", "events"),
        make("elimination", "条件排除题", "逐条排除不符合条件的答案。", "quiz", "elimination"),
        make("cipher", "密码破译", "用符号和数字规律解开密码。", "quiz", "cipher"),
        make("logic-grid", "简单逻辑表格", "交叉使用人物、物品与位置线索。", "quiz", "logicGrid"),
        make("mystery", "推理故事", "阅读短故事，找到关键证据。", "quiz", "mystery"),
        make("puzzle-maker", "自己设计谜题", "写下线索、答案并邀请家人挑战。", "write", "puzzle")
      ]
    },
    {
      id: "spatial",
      order: "05",
      path: "05-spatial",
      icon: "△",
      title: "图形魔法师",
      subtitle: "空间思维",
      color: "#16875b",
      soft: "#dcf4e9",
      intro: "旋转、翻转、拆开再组合，用眼睛在脑海里搭积木。",
      activities: [
        make("tangram", "七巧板拼图", "在画布上用基本图形设计一个新造型。", "draw", "tangram"),
        make("split", "图形分割", "判断一刀之后会得到哪些形状。", "quiz", "splitShape"),
        make("rotate", "图形旋转", "想象图形旋转后的方向。", "quiz", "rotation"),
        make("symmetry", "对称画", "沿对称轴补全另一半图案。", "draw", "symmetry"),
        make("mirror", "镜子里的图案", "判断镜像中的左右关系。", "quiz", "mirror"),
        make("cube-net", "方块展开图", "判断哪些展开图可以折成立方体。", "quiz", "cubeNet"),
        make("cube-count", "立体积木计数", "根据分层图数出积木总数。", "quiz", "cubeCount"),
        make("direction", "路线与方向", "按照东南西北判断移动后的位置。", "quiz", "direction"),
        make("map", "平面地图寻宝", "阅读坐标与方向线索找到宝藏。", "quiz", "mapTreasure"),
        make("paper-fold", "剪纸与折纸挑战", "想象纸张展开后的孔洞位置。", "quiz", "paperFold")
      ]
    },
    {
      id: "language",
      order: "06",
      path: "06-language",
      icon: "文",
      title: "语言侦探",
      subtitle: "阅读与表达",
      color: "#c4493d",
      soft: "#fbe2df",
      intro: "词语是线索，句子是地图，好故事从认真表达开始。",
      activities: [
        make("picture-word", "看图猜词", "根据图形和提示选择合适的词语。", "quiz", "pictureWord"),
        make("radical", "偏旁部首配对", "为偏旁找到能组成汉字的伙伴。", "quiz", "radical"),
        make("word-chain", "词语接龙", "以前一个词的末字开始新词。", "write", "wordChain"),
        make("opposites", "反义词与近义词", "辨别词语之间相近或相反的关系。", "quiz", "wordRelation"),
        make("sentence-order", "句子重新排序", "把打乱的词语排成通顺句子。", "order", "sentence"),
        make("riddle", "猜谜语", "抓住描述里的特征猜出谜底。", "quiz", "riddle"),
        make("story-clue", "阅读短故事找线索", "阅读小故事并回答细节问题。", "quiz", "storyClue"),
        make("story-ending", "给故事补结尾", "选择一个开头，写出合理又有趣的结局。", "write", "ending"),
        make("picture-story", "看图讲故事", "根据图形角色创作一段完整故事。", "write", "pictureStory"),
        make("mini-book", "制作自己的小绘本", "为四页小书写标题、画面和台词。", "draw", "pictureBook")
      ]
    },
    {
      id: "science",
      order: "07",
      path: "07-science",
      icon: "⚗",
      title: "科学探索营",
      subtitle: "发现与实验",
      color: "#177a75",
      soft: "#d9f0ec",
      intro: "先猜一猜，再观察结果；科学从一个好问题开始。",
      activities: [
        make("animals", "动物分类", "按栖息地和身体特征给动物分类。", "sort", "animals"),
        make("plant", "植物生长排序", "把种子发芽到结果的过程排好。", "order", "plant"),
        make("weather", "天气观察", "根据天空、温度和风选择天气记录。", "quiz", "weather"),
        make("float", "浮与沉", "预测物品放入水中会浮起还是沉下。", "sort", "float"),
        make("light", "光与影", "判断光源变化后影子的方向。", "quiz", "lightShadow"),
        make("magnet", "磁铁实验", "判断哪些常见材料能被磁铁吸引。", "sort", "magnet"),
        make("sound", "声音从哪里来", "把声音与振动物体正确配对。", "quiz", "sound"),
        make("body", "人体小知识", "认识主要器官和它们的工作。", "quiz", "body"),
        make("recycle", "环保分类游戏", "把废弃物投入正确的分类桶。", "sort", "recycle"),
        make("safe-lab", "家庭安全实验", "判断哪些实验步骤需要成人帮助。", "quiz", "safeLab")
      ]
    },
    {
      id: "life",
      order: "08",
      path: "08-life",
      icon: "⌂",
      title: "生活小达人",
      subtitle: "独立与合作",
      color: "#b96016",
      soft: "#fbe9d6",
      intro: "会安排、会选择、会求助，把聪明用在真实生活里。",
      activities: [
        make("schedule", "一天时间规划", "把学习、运动和休息安排得更合理。", "order", "schedule"),
        make("shopping-list", "超市购物清单", "根据菜单选出需要购买的食材。", "quiz", "shoppingList"),
        make("money", "钱币计算", "组合钱币并判断是否足够付款。", "quiz", "money"),
        make("tidy", "整理房间分类赛", "把房间物品放回合适的位置。", "sort", "tidy"),
        make("healthy-food", "健康饮食搭配", "为一顿饭选择均衡的食物。", "quiz", "healthyFood"),
        make("traffic", "交通标志识别", "认识常见道路与安全标志。", "quiz", "traffic"),
        make("emotion", "情绪表情配对", "观察表情和情境，理解他人感受。", "quiz", "emotion"),
        make("problem", "遇到困难怎么办", "在生活情境中选择安全有效的做法。", "quiz", "problemSolving"),
        make("cooperate", "合作与轮流", "判断怎样表达和行动更适合团队。", "quiz", "cooperate"),
        make("family-task", "家庭任务挑战", "选择任务、完成打卡，参与家庭生活。", "checklist", "chores")
      ]
    },
    {
      id: "creative",
      order: "09",
      path: "09-creative",
      icon: "✦",
      title: "创意画本",
      subtitle: "想象力工坊",
      color: "#d33f69",
      soft: "#fbe0e9",
      intro: "这里没有唯一答案，大胆把脑海里的世界画出来。",
      activities: [
        make("complete-half", "补全另一半", "沿虚线补全图案，也可以画成完全不同的东西。", "draw", "completeHalf"),
        make("shape-object", "把形状变成物品", "从圆形、三角形或方形开始自由创作。", "draw", "shapeObject"),
        make("monster-room", "为怪兽设计房间", "为特别的住客安排床、窗户和秘密机关。", "draw", "monsterRoom"),
        make("new-animal", "创造一种新动物", "组合不同动物的特点并为它命名。", "draw", "newAnimal"),
        make("future-vehicle", "发明未来交通工具", "设计动力、乘客空间和特殊功能。", "draw", "futureVehicle"),
        make("secret-base", "设计秘密基地", "画出入口、房间、机关和逃生路线。", "draw", "secretBase"),
        make("wordless-comic", "无字漫画", "用四格画面讲清楚一件事。", "draw", "comic"),
        make("new-ending", "同一故事的不同结局", "为同一个故事写出温暖或意外的结局。", "write", "alternateEnding"),
        make("board-design", "自制棋盘游戏", "画出棋盘路线、奖励格与挑战格。", "draw", "boardDesign"),
        make("my-book", "我的第一本绘本", "用封面和四个画面完成一本迷你绘本。", "draw", "myBook")
      ]
    },
    {
      id: "board",
      order: "10",
      path: "10-board",
      icon: "▦",
      title: "桌面游戏工坊",
      subtitle: "亲子互动",
      color: "#345968",
      soft: "#dfeaec",
      intro: "轮流、观察、商量策略，一台平板就能全家一起玩。",
      activities: [
        make("dice-math", "骰子加法赛", "掷两枚骰子，算对点数才能前进。", "board", "diceMath"),
        make("bingo", "数字宾果", "听到数字后在卡片上找到并标记。", "bingo", "number"),
        make("memory-cards", "图形记忆翻翻乐", "轮流翻牌，找到最多配对。", "memory", "icons"),
        make("category-cards", "分类卡牌", "快速把卡片放到正确类别。", "sort", "boardCategories"),
        make("treasure-board", "路线寻宝棋", "掷骰子前进，避开陷阱并收集宝石。", "board", "treasure"),
        make("chain-cards", "词语接龙牌", "用上一张牌的末字接出新词。", "write", "wordChain"),
        make("logic-cards", "逻辑排除卡", "根据三条线索猜出隐藏角色。", "quiz", "logicCards"),
        make("escape", "合作逃脱游戏", "一起完成三个谜题，打开最后的密码箱。", "quiz", "escape"),
        make("family-quiz", "亲子问答棋", "轮流回答生活常识和趣味问题。", "board", "familyQuiz"),
        make("game-maker", "自己设计游戏规则", "写下目标、玩法和获胜条件。", "write", "gameRules")
      ]
    }
  ];
}());
