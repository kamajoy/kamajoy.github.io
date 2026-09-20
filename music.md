# 石川小町风格 · AI 音乐创作手册

> 用途：为 Suno / Udio / 天工 / 海绵音乐等 AI 音乐工具，以及 AI 歌声合成（SVS）流程，提供可直接复制的风格提示词。
> 说明：本手册基于「清透女声 + 气声 + 克制情绪 + 慢速老歌改编」这一风格描述整理，是**风格方向的抽象提炼**，不是对某位真人的声音克隆。各平台模型不同，请把提示词当作起点，多次生成后微调。

---

## 目录

1. 风格档案
2. 提示词积木库（可拼装）
3. 女声音色提示词
4. 怀旧老歌提示词
5. 伤感版
6. 温柔版
7. 甜美女声版
8. 空灵女声版
9. 老歌"改编而非照搬"的方法
10. 歌词结构标签与演唱指令
11. 排除项（Negative / Exclude）
12. 调参与排错
13. 一页速查表
14. 使用注意

---

## 1. 风格档案

### 1.1 一句话定位

**年轻、清透、带气声的中文女声，轻轻唱、慢慢诉说；编曲留白，把空间还给人声；擅长把 80、90 年代经典老歌降速重编。**

### 1.2 特征拆解

| 维度 | 特征                     | 创作时怎么落实                                       |
| ---- | ------------------------ | ---------------------------------------------------- |
| 音色 | 年轻感、清透、明亮但不尖 | `young`, `clear`, `pure`, `airy`                     |
| 气声 | 明显但不虚，有实音支撑   | `breathy but supported`，避免 `whisper only`         |
| 咬字 | 中文发音规整、字头清楚   | `clear Mandarin diction`, `crisp articulation`       |
| 高音 | 柔和，不靠爆发           | `soft high notes`, `no belting`, `gentle head voice` |
| 情绪 | 克制、内敛，像在诉说     | `restrained emotion`, `intimate storytelling`        |
| 编曲 | 简约，给人声留空间       | `minimal arrangement`, `sparse`, `lots of space`     |
| 曲库 | 80/90 年代华语经典       | `80s/90s Mandarin pop ballad`                        |
| 处理 | 降速、重编、换唱法       | 见第 9 节                                            |

### 1.3 风格核心公式

```
【音色】年轻清透女声 + 【气息】适度气声 + 【咬字】清晰中文
+ 【情绪】克制内敛 + 【编曲】极简留白 + 【速度】偏慢
+ 【题材】怀旧华语老歌质感
```

---

## 2. 提示词积木库（可拼装）

> 用法：从每一类里各挑 1～2 个，拼成一条完整提示词。总长度不要贪多，通常 6～12 个标签效果最稳。

### 2.1 音色类

| 中文     | English                       |
| -------- | ----------------------------- |
| 年轻女声 | young female vocal            |
| 清透     | clear, pure, transparent tone |
| 明亮柔和 | bright yet soft               |
| 温润     | warm, smooth                  |
| 少女感   | girlish, youthful             |
| 成熟知性 | mature, elegant               |

### 2.2 气息类

| 中文     | English                      |
| -------- | ---------------------------- |
| 适度气声 | breathy but supported        |
| 轻气声   | light airy breath            |
| 耳语感   | close-mic, whispery intimacy |
| 气声收尾 | breathy phrase endings       |

### 2.3 咬字 / 语言类

| 中文         | English                             |
| ------------ | ----------------------------------- |
| 中文咬字清晰 | clear Mandarin diction              |
| 字正腔圆     | precise, well-rounded pronunciation |
| 口语化叙述   | conversational delivery             |
| 尾音轻收     | soft fade-out on line endings       |

### 2.4 情绪 / 表演类

| 中文     | English                        |
| -------- | ------------------------------ |
| 克制     | restrained, understated        |
| 轻轻诉说 | gentle storytelling            |
| 内敛深情 | quiet, inward emotion          |
| 不爆发   | no belting, no vocal power-ups |
| 微微颤音 | subtle vibrato                 |
| 少量转音 | minimal ornamentation          |

### 2.5 编曲类

| 中文             | English                        |
| ---------------- | ------------------------------ |
| 极简编曲         | minimal arrangement            |
| 留白             | lots of space, sparse          |
| 钢琴伴奏         | soft piano                     |
| 木吉他           | fingerstyle acoustic guitar    |
| 弦乐铺底         | subtle string pad              |
| 电钢琴（Rhodes） | warm Rhodes                    |
| 轻打击           | brushed drums, soft percussion |
| 低音克制         | understated bass               |

### 2.6 速度 / 情境类

| 中文       | English               |
| ---------- | --------------------- |
| 慢板       | slow tempo, 60–72 BPM |
| 中慢板     | mid-slow, 72–84 BPM   |
| 深夜感     | late-night mood       |
| 复古质感   | vintage warmth        |
| 老磁带质感 | soft tape warmth      |

### 2.7 混音类

| 中文       | English                |
| ---------- | ---------------------- |
| 人声靠前   | vocal-forward mix      |
| 干净       | clean, uncluttered mix |
| 小房间混响 | short room reverb      |
| 亲密近讲   | close, intimate vocal  |

---

## 3. 女声音色提示词

### 3.1 「石川小町」基础款（核心）

**中文**

```
年轻清透的中文女声，适度气声，咬字清晰，高音柔和不爆发，情绪克制，像轻轻诉说，极简编曲，人声靠前，慢板
```

**English（Suno 风格栏推荐）**

```
young Chinese female vocal, clear and airy, breathy but supported, clear Mandarin diction, soft high notes, restrained emotion, intimate storytelling, minimal arrangement, vocal-forward mix, slow tempo
```

**精简版（字数受限时）**

```
young female, airy clear voice, clear Mandarin, restrained, minimal, slow ballad
```

### 3.2 音色微调库

| 想要的变化   | 加这些词                                            |
| ------------ | --------------------------------------------------- |
| 更清透       | `crystal clear`, `pure tone`, `no grit`             |
| 更有气声     | `airy`, `close-mic`, `soft breath`                  |
| 更有实音     | `warm chest voice`, `supported tone`                |
| 更年轻       | `girlish`, `fresh`, `youthful`                      |
| 更成熟       | `mature`, `mellow`, `elegant`                       |
| 更克制       | `understated`, `no dramatic build`, `flat dynamics` |
| 更有故事感   | `narrative delivery`, `spoken-sung phrasing`        |
| 更柔和的高音 | `soft head voice`, `gentle high notes`              |

### 3.3 音色调整对照

| 问题       | 原因                    | 解法                                                |
| ---------- | ----------------------- | --------------------------------------------------- |
| 声音太尖   | 高音区过高 / 明亮词过多 | 降调 2～3 个半音；去掉 `bright`，加 `warm, soft`    |
| 气声太虚   | `breathy` 权重过高      | 改为 `breathy but supported`，加 `clear tone`       |
| 太像播音腔 | 咬字词过强              | 去掉 `crisp`，改 `conversational`                   |
| 太情绪化   | 模型自动加戏            | 加 `restrained`, `no belting`, `no dramatic climax` |
| 太"网红甜" | 少女感过多              | 去掉 `girlish/cute`，加 `natural, sincere`          |

---

## 4. 怀旧老歌提示词

### 4.1 通用怀旧款

**中文**

```
80、90年代华语经典老歌质感，复古慢板，年轻清透女声，气声轻柔，钢琴与弦乐铺底，温暖复古混响，怀旧、克制、深情
```

**English**

```
80s/90s Mandarin pop ballad, nostalgic and vintage, young female vocal, airy and clear, soft piano with subtle strings, warm vintage reverb, restrained and heartfelt, slow tempo
```

### 4.2 按年代细分

| 年代质感            | English 提示词                                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| 80 年代港台抒情     | `1980s Cantopop/Mandopop ballad, warm analog synth pad, soft electric piano, gentle bass, dreamy chorus reverb` |
| 90 年代华语抒情     | `1990s Mandopop ballad, piano-led, lush but restrained strings, clean electric guitar, warm plate reverb`       |
| 老式民谣            | `campus folk style, fingerstyle acoustic guitar, natural room sound, simple and sincere`                        |
| 复古爵士感          | `nostalgic jazz ballad, brushed drums, upright bass, warm Rhodes, late-night lounge mood`                       |
| 老电影 / 怀旧影视感 | `vintage film soundtrack feel, soft strings, wistful piano, cinematic space`                                    |

### 4.3 怀旧质感增强词

```
vintage warmth, soft tape saturation, gentle analog haze, nostalgic atmosphere, golden-era Mandarin pop
```

### 4.4 怀旧编曲配方（可直接套）

| 配方       | 乐器                     | 适合             |
| ---------- | ------------------------ | ---------------- |
| A 钢琴款   | 钢琴 + 极轻弦乐          | 情歌、抒情       |
| B 吉他款   | 木吉他指弹 + 轻贝斯      | 民谣、校园感     |
| C 电钢款   | Rhodes + 刷鼓 + 低音     | 都市夜色、爵士感 |
| D 合成器款 | 温暖 Pad + 电钢 + 清淡鼓 | 80 年代感        |

---

## 5. 伤感版

### 5.1 提示词

**中文**

```
伤感慢板，年轻清透女声，气声明显但有支撑，情绪克制，像在深夜轻声倾诉，钢琴为主，极简弦乐，留白多，尾音轻轻收，怀旧华语老歌质感
```

**English**

```
sad slow ballad, young female vocal, clear and breathy, restrained sorrow, late-night confession, piano-led, sparse strings, lots of space, soft fading phrase endings, nostalgic Mandarin pop
```

**精简版**

```
sad, slow, airy female, restrained, solo piano, late night, nostalgic
```

### 5.2 参数建议

- **速度**：58～68 BPM
- **调式**：小调（A minor / D minor / E minor）
- **配器**：钢琴 + 单条大提琴或弦乐铺底
- **动态**：全曲平缓，最后一段副歌只是"略微打开"，不要爆发

### 5.3 演唱指令

```
[Verse 1] whispery, close-mic, spoken-sung
[Chorus] slightly opens up, still restrained
[Bridge] almost a whisper, sparse piano only
[Outro] breathy, fading out
```

### 5.4 伤感强度分级

| 强度   | 关键词                                                      |
| ------ | ----------------------------------------------------------- |
| 淡淡的 | `wistful, gentle melancholy`                                |
| 中等   | `sad, heartfelt, tender sorrow`                             |
| 深     | `heartbroken, aching, quiet despair`（仍保持 `restrained`） |

> ⚠️ 想要"伤感"而不"苦情"：始终保留 `restrained`，避免 `crying`, `sobbing`, `dramatic`。

---

## 6. 温柔版

### 6.1 提示词

**中文**

```
温柔治愈的女声，年轻清透，声音柔软温暖，气声轻，咬字清楚，像在耳边轻轻唱，木吉他或钢琴伴奏，慢板，干净温暖的混音
```

**English**

```
gentle and soothing female vocal, soft and warm, light breathiness, clear Mandarin, sung as if softly beside your ear, fingerstyle guitar or soft piano, slow tempo, warm clean mix
```

**精简版**

```
gentle, warm, soft female voice, acoustic guitar, slow, healing
```

### 6.2 参数建议

- **速度**：66～78 BPM
- **调式**：大调为主（C / G / D major），或温暖的小调
- **配器**：指弹木吉他 + 轻钢琴 + 极轻弦乐
- **人声**：中低音区为主，少用高音

### 6.3 演唱指令

```
[Verse] soft, warm, conversational
[Chorus] gently blooming, no belting
[Outro] hummed, soft "la la" fade
```

### 6.4 温柔的"三个不要"

1. 不要 `powerful`, `belting`
2. 不要过多和声堆叠
3. 不要太亮的高频（去掉 `bright`, `sparkling`）

---

## 7. 甜美女声版

### 7.1 提示词

**中文**

```
甜美清新的年轻女声，明亮但不尖，咬字清晰，带一点轻快感，气声点缀，旋律可爱，钢琴与木吉他，中慢板，干净明亮的混音
```

**English**

```
sweet and fresh young female vocal, bright but not shrill, clear Mandarin diction, light and playful, touch of airy breath, cute melody, piano and acoustic guitar, mid-slow tempo, clean bright mix
```

**精简版**

```
sweet, youthful, bright female voice, light, clear Mandarin, mid-slow pop
```

### 7.2 参数建议

- **速度**：76～92 BPM（比其他版本略快，但不要变成活泼舞曲）
- **调式**：大调
- **配器**：钢琴、木吉他、轻打击、拨弦、钟琴（glockenspiel）点缀
- **人声**：可加少量装饰音，句尾轻轻上扬

### 7.3 甜而不腻的控制

| 想要                   | 做法                                          |
| ---------------------- | --------------------------------------------- |
| 保持"石川小町"的克制感 | 保留 `restrained`，去掉 `bubbly`, `energetic` |
| 更自然                 | 加 `natural`, `sincere`，去掉 `cute anime`    |
| 更怀旧                 | 加 `90s Mandarin pop`, `vintage warmth`       |

---

## 8. 空灵女声版

### 8.1 提示词

**中文**

```
空灵飘渺的女声，清透纯净，大量气声与空间感，长混响，高音柔和悬浮，合成器铺底与钢琴点缀，极简、梦幻、缓慢，像远处传来的声音
```

**English**

```
ethereal airy female vocal, pure and transparent, breathy with floating soft high notes, long reverb, dreamy ambient pads, sparse piano, minimal, very slow, like a distant voice
```

**精简版**

```
ethereal, airy, dreamy female, long reverb, ambient pad, very slow
```

### 8.2 参数建议

- **速度**：50～64 BPM
- **调式**：调式感偏开放（Lydian、Dorian，或简单大小调均可）
- **配器**：Pad、钢琴单音、玻璃质感音色、极轻弦乐
- **混响**：长混响 + 一点延迟（delay），人声保持在前

### 8.3 空灵变体

| 变体        | 关键词                                                                   |
| ----------- | ------------------------------------------------------------------------ |
| 空灵 + 古风 | `Chinese traditional touch, guzheng, xiao flute, ethereal female, misty` |
| 空灵 + 怀旧 | `ethereal, vintage 90s ballad, soft synth pad, dreamy reverb`            |
| 空灵 + 治愈 | `ethereal, healing, soft piano, warm pad, gentle`                        |
| 空灵 + 冬夜 | `ethereal, winter night, sparse piano, cold shimmer, quiet`              |

### 8.4 空灵的常见坑

- 混响太大 → 咬字糊掉。解法：加 `clear diction`, `vocal upfront`，混响词用 `medium-long reverb` 而非 `huge cathedral`
- 气声过度 → 听不清歌词。解法：`breathy but supported`

---

## 9. 老歌"改编而非照搬"的方法

> 石川小町式作品的关键：**不是复刻原唱，而是用新的速度、编曲、唱法重新讲一遍。**

### 9.1 四个改编轴

| 改编轴   | 做法              | 提示词                                                |
| -------- | ----------------- | ----------------------------------------------------- |
| **速度** | 比原版慢 10%～25% | `slowed-down version`, `slower tempo`                 |
| **编曲** | 换成极简配器      | `stripped-down`, `piano-only`, `acoustic reimagining` |
| **唱法** | 从"唱"变成"诉说"  | `spoken-sung`, `intimate`, `understated`              |
| **动态** | 削平高潮，不爆发  | `no big climax`, `flat dynamics`, `soft chorus`       |

### 9.2 改编提示词模板

```
slowed-down reimagining of an 80s/90s Mandarin classic, stripped-down piano and soft strings, young female vocal, airy and clear, restrained delivery, no big climax, intimate and nostalgic
```

### 9.3 改编步骤（建议流程）

1. **定基调**：先选版本（伤感 / 温柔 / 甜美 / 空灵）
2. **定速度**：比原曲慢，选 BPM 区间
3. **定配器**：从第 4.4 节挑一个配方
4. **写提示词**：`音色 + 情绪 + 编曲 + 速度 + 怀旧质感`
5. **生成 4～6 版**：挑最"克制"的那一版
6. **微调**：用第 12 节表格修正
7. **后期**：轻度 EQ（削减 3～5 kHz 刺耳感）、短混响、人声靠前

### 9.4 换个"角度"重新演绎

| 角度   | 说明                           |
| ------ | ------------------------------ |
| 换视角 | 原曲是"对他说"，改成"自言自语" |
| 换时间 | 白天的歌改成深夜版             |
| 换场景 | 舞台版改成"房间里轻声唱"       |
| 换乐器 | 弦乐大编制改成单钢琴 / 单吉他  |

---

## 10. 歌词结构标签与演唱指令

> 适用于 Suno 等支持方括号标签的平台。标签写在歌词框里，不要写进风格栏。

### 10.1 常用结构标签

```
[Intro] soft piano
[Verse 1] intimate, close-mic, breathy
[Pre-Chorus] slightly rising, still restrained
[Chorus] gentle, warm, no belting
[Verse 2] softer, sparse
[Bridge] almost whispered
[Final Chorus] subtle build, tender
[Outro] fading, soft hum
```

### 10.2 演唱指令库

| 想要的效果 | 标签                              |
| ---------- | --------------------------------- |
| 轻声开场   | `[Verse 1] whispery, spoken-sung` |
| 克制副歌   | `[Chorus] soft, restrained, warm` |
| 气声收尾   | `[Outro] breathy, fade out`       |
| 哼唱       | `[Hum] soft humming`              |
| 器乐间奏   | `[Instrumental] soft piano solo`  |
| 结束       | `[End]`                           |

### 10.3 中文歌词写作建议

- **句子短**：每句 5～9 字，便于气声与咬字
- **少用生僻字**：AI 容易读错
- **多音字先确认**：必要时用同音字替换或加拼音注释
- **意象具体**：雨、路灯、旧照片、夜车、窗台，比抽象情绪更适合"轻轻诉说"
- **留白**：段落之间留一句短句或纯器乐

### 10.4 中文发音防错

| 问题         | 处理                                  |
| ------------ | ------------------------------------- |
| 多音字读错   | 换同音字，或在歌词中调整用词          |
| 吞字         | 加 `clear Mandarin diction`；降低速度 |
| 英文夹杂读怪 | 尽量全中文；必须英文时单独一句        |

---

## 11. 排除项（Negative / Exclude）

> 支持"排除风格"的平台可填入（如 Suno 的 Exclude styles）。

### 11.1 通用排除

```
belting, screaming, heavy vibrato, aggressive, rap, autotune-heavy, EDM drop, distorted guitar, heavy drums, choir, big orchestral climax
```

### 11.2 中文写法

```
爆发式高音，嘶吼，重颤音，说唱，电音，强鼓点，失真吉他，大合唱，宏大管弦高潮
```

### 11.3 按版本追加

| 版本   | 追加排除                              |
| ------ | ------------------------------------- |
| 伤感版 | `crying, sobbing, melodramatic`       |
| 温柔版 | `powerful, dramatic`                  |
| 甜美版 | `anime voice, squeaky, hyperactive`   |
| 空灵版 | `huge cathedral reverb, muddy vocals` |

---

## 12. 调参与排错

| 问题                     | 可能原因        | 解决办法                                            |
| ------------------------ | --------------- | --------------------------------------------------- |
| 人声太"唱歌"，不够"诉说" | 模型偏舞台唱法  | 加 `spoken-sung`, `conversational`, `intimate`      |
| 一到副歌就爆发           | 模型自动升情绪  | 加 `no belting`, `flat dynamics`；副歌标签写 `soft` |
| 编曲太满                 | 配器词太多      | 只保留 1～2 个乐器，加 `minimal`, `sparse`          |
| 声音不像"年轻女声"       | 音色词权重低    | 前置 `young female vocal`，并减少其他风格词         |
| 不像老歌                 | 年代词不足      | 加 `80s/90s Mandarin pop`, `vintage warmth`         |
| 咬字不清                 | 速度快 / 混响大 | 降低混响，加 `clear Mandarin diction`，放慢速度     |
| 每次结果差异很大         | 提示词太长太杂  | 精简为 6～8 个核心标签，固定不变，只改 1 个变量     |
| 气声变成含糊             | 气声过度        | 改用 `breathy but supported`                        |
| 中文变成"洋腔"           | 语言识别偏差    | 提示词里写明 `Mandarin`，歌词纯中文                 |

### 12.1 调试原则

1. **一次只改一个变量**（音色 / 速度 / 配器 / 情绪，选一个）
2. **保留一个"基准提示词"**，其他都是对比
3. **多生成几版**再判断，AI 生成有随机性
4. **标签靠前的权重通常更高**，把最重要的放最前

---

## 13. 一页速查表

### 13.1 五版本一览

| 版本         | 速度   | 核心关键词                              | 编曲               |
| ------------ | ------ | --------------------------------------- | ------------------ |
| **基础款**   | 60～75 | young, airy, clear, restrained, minimal | 钢琴 / 吉他        |
| **怀旧老歌** | 60～80 | 80s/90s Mandarin ballad, vintage warmth | 钢琴 + 弦乐 / 电钢 |
| **伤感版**   | 58～68 | sad, late-night, restrained, sparse     | 钢琴 + 大提琴      |
| **温柔版**   | 66～78 | gentle, warm, soothing, soft            | 指弹吉他 + 钢琴    |
| **甜美版**   | 76～92 | sweet, fresh, bright but not shrill     | 钢琴 + 吉他 + 钟琴 |
| **空灵版**   | 50～64 | ethereal, airy, dreamy, long reverb     | Pad + 钢琴单音     |

### 13.2 万能拼装公式

```
[版本情绪词] + young female vocal + [气息词] + clear Mandarin diction
+ restrained + [编曲词] + [年代/质感词] + [速度词] + vocal-forward mix
```

**示例：伤感 + 怀旧**

```
sad slow ballad, young female vocal, breathy but supported, clear Mandarin diction, restrained, solo piano with subtle strings, 90s Mandarin pop, vintage warmth, 62 BPM, vocal-forward mix
```

**示例：温柔 + 怀旧**

```
gentle warm ballad, young female vocal, light airy breath, clear Mandarin diction, restrained, fingerstyle guitar and soft piano, 80s Mandarin pop, vintage warmth, 70 BPM, vocal-forward mix
```

**示例：空灵 + 怀旧**

```
ethereal dreamy ballad, young female vocal, airy and pure, clear Mandarin diction, restrained, soft synth pad and sparse piano, 90s Mandarin pop, long reverb, 56 BPM, vocal-forward mix
```

### 13.3 复制即用的"最短提示词"

| 版本 | 一行版                                                                             |
| ---- | ---------------------------------------------------------------------------------- |
| 基础 | `young female, airy clear voice, clear Mandarin, restrained, minimal, slow ballad` |
| 怀旧 | `90s Mandarin ballad, young airy female, piano and strings, vintage, slow`         |
| 伤感 | `sad, slow, airy female, restrained, solo piano, late night`                       |
| 温柔 | `gentle, warm, soft female, acoustic guitar, slow, healing`                        |
| 甜美 | `sweet, bright, youthful female, light, piano and guitar, mid-slow`                |
| 空灵 | `ethereal, airy female, dreamy, long reverb, ambient pad, very slow`               |

---

## 14. 使用注意

1. **版权**：翻唱、改编他人享有版权的歌曲并公开发布（尤其是商业化或平台发布），可能涉及词曲版权与平台规则。想长期发布，建议使用**原创词曲**、已获授权的作品，或进入公有领域的作品，并了解你所用 AI 工具的商用条款。
2. **不要声称是真人**：使用 AI 合成人声发布作品时，建议按发布平台要求标注"AI 生成 / 合成"，避免误导听众。
3. **不要指名模仿真人歌手的声音**：提示词里描述"声音特征"即可（清透、气声、克制），不建议直接写具体歌手名字要求克隆。
4. **平台差异**：不同工具的字数限制、标签支持、模型版本各不相同，建议先用"精简版"跑通，再逐步加词。
5. **多次迭代**：好作品几乎都来自多次生成 + 挑选 + 后期微调，不要期待一次完美。

---

_手册版本：v1.0　｜　可按你自己的试听结果，把有效的提示词补充进对应章节。_
