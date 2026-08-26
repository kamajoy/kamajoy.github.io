(() => {
  "use strict";

  const wrap = (viewBox, content, background = "") => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
      ${background}${content}
    </svg>`;

  const illustrations = [
    {
      id: "robot",
      label: "机械伙伴",
      svg: wrap("0 0 180 140", `
        <g stroke="#25332f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M90 22v-9"/><circle cx="90" cy="10" r="5" fill="#f2b84b"/>
          <rect x="47" y="27" width="86" height="67" rx="20" fill="#dff1e9"/>
          <circle cx="72" cy="57" r="9" fill="#fff"/><circle cx="108" cy="57" r="9" fill="#fff"/>
          <circle cx="72" cy="57" r="3" fill="#25332f"/><circle cx="108" cy="57" r="3" fill="#25332f"/>
          <path d="M69 76q21 16 42 0" fill="none"/>
          <rect x="61" y="93" width="58" height="34" rx="11" fill="#66b9c9"/>
          <path d="M61 104 42 96M119 104l19-8M77 127v8M103 127v8"/>
          <circle cx="90" cy="108" r="7" fill="#e85d3f"/>
        </g>`)
    },
    {
      id: "monster",
      label: "泡泡怪兽",
      svg: wrap("0 0 180 140", `
        <g stroke="#29352f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M48 116c-11-14-13-33-5-53 8-21 27-35 50-34 28 1 48 20 51 48 2 18-4 32-15 42-22 5-59 5-81-3Z" fill="#84d39c"/>
          <path d="M60 40 48 24l25 8M117 36l16-14-2 25" fill="#84d39c"/>
          <circle cx="75" cy="70" r="11" fill="#fff"/><circle cx="113" cy="70" r="11" fill="#fff"/>
          <circle cx="77" cy="72" r="4" fill="#29352f"/><circle cx="111" cy="72" r="4" fill="#29352f"/>
          <path d="M70 94q22 18 45-1" fill="#fff"/><path d="m83 99 4 10 7-9 7 9 5-11" fill="#fff"/>
          <path d="M45 88 27 81M142 86l17-9"/>
        </g>
        <circle cx="30" cy="38" r="8" fill="#f2b84b"/><circle cx="150" cy="39" r="6" fill="#e85d3f"/>`)
    },
    {
      id: "rocket",
      label: "彩虹火箭",
      svg: wrap("0 0 180 140", `
        <g transform="rotate(12 90 70)" stroke="#27342f" stroke-width="4" stroke-linejoin="round">
          <path d="M73 101C57 75 61 42 95 16c20 23 25 54 9 81Z" fill="#f8faf7"/>
          <path d="M82 34c7-7 13-12 13-12s7 8 11 18Z" fill="#e85d3f"/>
          <circle cx="88" cy="60" r="12" fill="#6ec5da"/>
          <path d="m69 72-19 17 25 3M107 69l16 8-18 16" fill="#f2b84b"/>
          <path d="m80 101-7 24 17-13 7 15 7-29" fill="#e85d3f"/>
        </g>
        <path d="M29 111c18 3 30 0 39-8" fill="none" stroke="#6ec5da" stroke-width="7" stroke-linecap="round"/>
        <path d="M24 98c17 3 28 1 38-7" fill="none" stroke="#f2b84b" stroke-width="6" stroke-linecap="round"/>
        <path d="M21 86c17 3 28 1 37-6" fill="none" stroke="#e85d3f" stroke-width="5" stroke-linecap="round"/>`)
    },
    {
      id: "dinosaur",
      label: "探险恐龙",
      svg: wrap("0 0 180 140", `
        <g stroke="#29342f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M37 104c18-3 18-21 35-34 8-7 14-14 18-25 4-12 16-20 31-18 20 3 28 20 22 35-5 13-17 17-32 14l-5 18c15 2 26 8 32 19-28 10-74 11-101-9Z" fill="#7acb87"/>
          <path d="M46 101 24 91c7 13 18 23 35 28" fill="#7acb87"/>
          <circle cx="122" cy="47" r="4" fill="#29342f"/>
          <path d="M133 61q-11 7-23 0M75 77l-14-12M88 64 75 50M102 48 94 32" fill="none"/>
          <path d="M66 113v17M112 113v17M57 130h18M103 130h18"/>
          <path d="m108 27 14-13 10 17" fill="#f2b84b"/>
        </g>`)
    },
    {
      id: "unicorn",
      label: "云朵独角兽",
      svg: wrap("0 0 180 140", `
        <g stroke="#303530" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M54 104c-10-23-4-55 24-68 27-13 58-2 65 25 5 19-2 40-20 52-19 12-51 10-69-9Z" fill="#fff"/>
          <path d="m93 35 11-27 9 31" fill="#f2b84b"/>
          <path d="M78 38c-5-15-20-17-27-6 9 0 14 6 17 15" fill="#f39aaf"/>
          <path d="M59 56c-17 7-23 22-19 38" fill="none" stroke="#e85d3f" stroke-width="7"/>
          <path d="M53 48c-18 1-28 12-30 25" fill="none" stroke="#f2b84b" stroke-width="7"/>
          <path d="M50 69c-16 11-20 27-12 41" fill="none" stroke="#6ebbd0" stroke-width="7"/>
          <circle cx="113" cy="61" r="4" fill="#303530"/>
          <path d="M121 76q9 6 17-1M70 112l-4 19M111 114l7 17" fill="none"/>
        </g>
        <circle cx="146" cy="33" r="6" fill="#f2b84b" opacity=".8"/>`)
    },
    {
      id: "submarine",
      label: "深海潜艇",
      svg: wrap("0 0 180 140", `
        <g stroke="#27332f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M36 86c0-25 23-43 58-43s55 14 59 39c-10 24-36 35-65 33-27-1-45-10-52-29Z" fill="#f2b84b"/>
          <path d="M75 43V26h31v19M86 26V15h22" fill="none"/>
          <circle cx="76" cy="78" r="13" fill="#9adbe8"/><circle cx="113" cy="78" r="13" fill="#9adbe8"/>
          <path d="M36 78 18 64v34l19-12M149 74l16-8v28l-13-6" fill="#e85d3f"/>
          <path d="M65 115v10h56v-12" fill="none"/>
        </g>
        <circle cx="143" cy="31" r="7" fill="none" stroke="#6ebbd0" stroke-width="3"/><circle cx="158" cy="17" r="4" fill="none" stroke="#6ebbd0" stroke-width="3"/>`)
    },
    {
      id: "treehouse",
      label: "秘密树屋",
      svg: wrap("0 0 180 140", `
        <g stroke="#2e392f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M80 72c-28 1-47-13-42-34 5-20 27-24 43-15 11-18 39-16 48 3 19-3 34 10 31 28-3 17-22 24-44 19Z" fill="#7fc58b"/>
          <path d="M83 62c-2 23-6 44-16 69h50c-10-25-12-47-10-69" fill="#a96f42"/>
          <path d="M61 58h61v45H61Z" fill="#f2b84b"/>
          <path d="m54 59 37-27 39 27" fill="#e85d3f"/>
          <rect x="82" y="73" width="20" height="30" fill="#fff4d5"/>
          <path d="M70 104 47 132M114 104l20 28M52 122h78" fill="none"/>
        </g>`)
    },
    {
      id: "castle",
      label: "云端城堡",
      svg: wrap("0 0 180 140", `
        <path d="M22 119c1-16 14-27 31-26 5-18 30-21 40-7 12-13 35-7 37 10 15-2 27 8 28 23Z" fill="#dff1f4"/>
        <g stroke="#303632" stroke-width="4" stroke-linejoin="round">
          <path d="M51 107V54h25v16h28V43h25v64Z" fill="#f0c6df"/>
          <path d="m47 54 17-25 16 25M100 43l16-27 17 27" fill="#6f82d8"/>
          <path d="M84 107V82h14v25" fill="#fff"/>
          <path d="M58 68h10v12H58ZM112 59h10v14h-10Z" fill="#9adbe8"/>
          <path d="M116 16V6l14 6-14 4" fill="#e85d3f"/>
        </g>
        <circle cx="31" cy="40" r="7" fill="#f2b84b"/>`)
    },
    {
      id: "dragon",
      label: "迷你飞龙",
      svg: wrap("0 0 180 140", `
        <g stroke="#29352f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M58 102c-8-23 2-46 24-57 20-10 43-5 53 13 10 18 3 42-13 54-20 14-47 11-64-10Z" fill="#7fc9a0"/>
          <path d="M72 57C47 36 31 40 27 61c17-5 28 3 37 19M118 51c19-20 36-15 38 6-15-6-26 2-34 17" fill="#b59ad8"/>
          <path d="m92 43 2-16 10 13 8-14 4 19" fill="#f2b84b"/>
          <circle cx="104" cy="68" r="4" fill="#29352f"/>
          <path d="M112 84q11 6 18-4M61 101c-18 6-24 19-12 29 8 6 21 2 28-6" fill="none"/>
          <path d="m132 85 17 3-11 8" fill="#e85d3f"/>
        </g>`)
    },
    {
      id: "astrocat",
      label: "宇航小猫",
      svg: wrap("0 0 180 140", `
        <g stroke="#28332f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="91" cy="68" r="48" fill="#dfeafb"/>
          <path d="M66 62 57 43l20 8M111 51l19-8-10 20" fill="#f3a46f"/>
          <path d="M60 64c6-22 53-25 62 0 6 17-6 34-30 35-24 0-38-17-32-35Z" fill="#fff3df"/>
          <circle cx="78" cy="72" r="4" fill="#28332f"/><circle cx="106" cy="72" r="4" fill="#28332f"/>
          <path d="m91 79 5 4-5 4-5-4ZM78 90l-12 4M106 90l13 4" fill="none"/>
          <path d="M65 105 55 128M117 104l13 23M76 112h31" fill="none"/>
          <path d="M46 30 34 17M137 31l13-15"/>
        </g>
        <circle cx="34" cy="105" r="7" fill="#f2b84b"/>`)
    },
    {
      id: "iceplanet",
      label: "甜筒星球",
      svg: wrap("0 0 180 140", `
        <g stroke="#303631" stroke-width="4" stroke-linejoin="round">
          <circle cx="90" cy="66" r="40" fill="#f0a8bf"/>
          <path d="M53 65c18 13 55 14 74-2" fill="none" stroke="#fff" stroke-width="9"/>
          <path d="M76 103h29l-15 31Z" fill="#e6b56a"/>
          <path d="m81 111 18 15M100 109l-18 16" fill="none" stroke="#a96f42" stroke-width="2"/>
          <ellipse cx="90" cy="66" rx="64" ry="17" fill="none" stroke="#6ebbd0" stroke-width="7"/>
        </g>
        <circle cx="40" cy="28" r="7" fill="#f2b84b"/><circle cx="139" cy="32" r="5" fill="#7fc9a0"/>
        <path d="m145 101 4 9 10 3-10 4-4 9-4-9-10-4 10-3Z" fill="#f2b84b"/>`)
    },
    {
      id: "treasure",
      label: "宝藏箱",
      svg: wrap("0 0 180 140", `
        <g stroke="#2d342f" stroke-width="4" stroke-linejoin="round">
          <path d="M39 63c1-25 19-39 51-39s51 14 52 39Z" fill="#b97943"/>
          <rect x="34" y="62" width="112" height="61" rx="8" fill="#d9914e"/>
          <path d="M34 80h112M58 63v60M122 63v60" fill="none"/>
          <rect x="78" y="75" width="24" height="31" rx="5" fill="#f2b84b"/>
          <circle cx="90" cy="87" r="4" fill="#2d342f"/><path d="M90 91v8"/>
        </g>
        <path d="m36 30 4 9 10 4-10 4-4 9-4-9-10-4 10-4ZM144 19l3 7 8 3-8 3-3 7-3-7-8-3 8-3Z" fill="#f2b84b"/>
        <circle cx="60" cy="17" r="6" fill="#6ebbd0"/>`)
    }
  ];

  const scenes = [
    {
      id: "space",
      label: "太空远征",
      svg: wrap("0 0 900 560", `
        <defs><linearGradient id="sky" x2="1" y2="1"><stop stop-color="#252b51"/><stop offset="1" stop-color="#4f3d78"/></linearGradient></defs>
        <rect width="900" height="560" fill="url(#sky)"/>
        <g fill="#fff7cb"><circle cx="95" cy="85" r="5"/><circle cx="215" cy="155" r="3"/><circle cx="473" cy="74" r="4"/><circle cx="693" cy="135" r="5"/><circle cx="818" cy="72" r="3"/><circle cx="570" cy="232" r="3"/></g>
        <circle cx="760" cy="96" r="58" fill="#f2b84b"/><path d="M690 95c37 17 104 20 147-2" fill="none" stroke="#fff2b8" stroke-width="12" opacity=".7"/>
        <path d="M0 470c176-96 348-59 458 10 123 76 282 31 442-8v88H0Z" fill="#8169a7"/>
        <path d="M0 509c181-71 336-30 450 12 143 52 302 19 450-12v51H0Z" fill="#5e4c85"/>
        <g transform="translate(104 338)" stroke="#dfe9ff" stroke-width="5" stroke-linejoin="round"><path d="M0 126C36 41 87 6 144 0c61 52 79 110 57 164Z" fill="#f7f8f4"/><circle cx="111" cy="63" r="24" fill="#79cce0"/><path d="m51 92-46 35 57 8m123-47 47 23-47 30" fill="#e85d3f"/></g>
        <path d="m405 140 8 20 21 8-21 8-8 20-8-20-21-8 21-8Z" fill="#f2b84b"/>`)
    },
    {
      id: "ocean",
      label: "海底派对",
      svg: wrap("0 0 900 560", `
        <defs><linearGradient id="sea" y2="1"><stop stop-color="#b8edf0"/><stop offset="1" stop-color="#2b91aa"/></linearGradient></defs>
        <rect width="900" height="560" fill="url(#sea)"/>
        <path d="M0 82c137 45 242-26 383 9 149 38 276-34 517 3" fill="none" stroke="#fff" stroke-width="16" opacity=".55"/>
        <g fill="none" stroke="#e8ffff" stroke-width="5" opacity=".75"><circle cx="126" cy="174" r="15"/><circle cx="156" cy="136" r="8"/><circle cx="735" cy="197" r="18"/><circle cx="767" cy="153" r="10"/></g>
        <path d="M0 486c170-51 323 33 479-5 167-41 271-6 421 6v73H0Z" fill="#f2d38a"/>
        <g transform="translate(570 304)" stroke="#263a38" stroke-width="5" stroke-linejoin="round"><path d="M0 82c0-54 49-89 122-83 69 5 104 35 112 82-26 44-81 67-139 61-50-5-82-25-95-60Z" fill="#f2b84b"/><circle cx="83" cy="67" r="24" fill="#a7e4ec"/><circle cx="147" cy="67" r="24" fill="#a7e4ec"/><path d="m4 64-39-28v63L4 80m226-22 33-18v65l-30-18" fill="#e85d3f"/></g>
        <g stroke="#2e705f" stroke-width="8" stroke-linecap="round"><path d="M88 507q-34-74 2-131M121 515q42-72 14-135M812 517q-37-68 0-126"/></g>
        <g fill="#ef7e67"><circle cx="88" cy="371" r="13"/><circle cx="139" cy="379" r="12"/><circle cx="812" cy="387" r="14"/></g>`)
    },
    {
      id: "dinoisland",
      label: "恐龙岛",
      svg: wrap("0 0 900 560", `
        <defs><linearGradient id="dsky" y2="1"><stop stop-color="#bceaf0"/><stop offset="1" stop-color="#f6e8a7"/></linearGradient></defs><rect width="900" height="560" fill="url(#dsky)"/>
        <circle cx="760" cy="96" r="58" fill="#f2b84b" opacity=".9"/>
        <path d="M0 340 184 168l127 147L441 110l179 220 91-94 189 129v195H0Z" fill="#709a77"/>
        <path d="M0 404 184 250l117 102 140-177 145 180 125-76 189 126v155H0Z" fill="#85b982"/>
        <path d="M0 467c172-67 331-28 452 26 127 57 270 10 448-32v99H0Z" fill="#5e9b64"/>
        <g transform="translate(118 320)" stroke="#29372f" stroke-width="5" stroke-linejoin="round"><path d="M0 134c64-17 66-87 137-110 65-22 119 8 122 63-4 54-59 74-120 60l-5 59H66l5-56C38 151 17 145 0 134Z" fill="#7acb87"/><circle cx="211" cy="67" r="5" fill="#29372f"/><path d="m111 34-19-25M145 24 139 0M180 25l7-24"/></g>
        <path d="M676 461c-8-71 22-131 72-165M751 463c37-69 42-119 15-166" fill="none" stroke="#426f4e" stroke-width="18" stroke-linecap="round"/>`)
    },
    {
      id: "forest",
      label: "魔法森林",
      svg: wrap("0 0 900 560", `
        <defs><linearGradient id="forest" y2="1"><stop stop-color="#d8eff0"/><stop offset="1" stop-color="#f6e6c0"/></linearGradient></defs><rect width="900" height="560" fill="url(#forest)"/>
        <circle cx="454" cy="110" r="60" fill="#fff9cf" opacity=".9"/>
        <g fill="#739e74"><circle cx="95" cy="238" r="105"/><circle cx="214" cy="198" r="91"/><circle cx="700" cy="201" r="105"/><circle cx="825" cy="242" r="95"/></g>
        <g fill="#9d6c45"><path d="M73 187h43l19 373H44Z"/><path d="M188 170h43l25 390h-91Z"/><path d="M683 169h45l33 391h-105Z"/><path d="M800 205h43l38 355h-109Z"/></g>
        <path d="M0 478c168-45 304-2 453 20 150 22 292-8 447-26v88H0Z" fill="#6f9e67"/>
        <g transform="translate(357 325)" stroke="#34352f" stroke-width="5" stroke-linejoin="round"><path d="M0 151c18-85 58-132 96-132 41 0 80 47 97 132Z" fill="#ef8b77"/><circle cx="96" cy="19" r="57" fill="#f6d76e"/><circle cx="75" cy="16" r="6" fill="#34352f"/><circle cx="116" cy="16" r="6" fill="#34352f"/><path d="M75 39q21 16 43 0" fill="none"/></g>
        <g fill="#f2b84b"><circle cx="305" cy="175" r="8"/><circle cx="588" cy="134" r="7"/><circle cx="633" cy="284" r="6"/></g>`)
    },
    {
      id: "candy",
      label: "甜品星球",
      svg: wrap("0 0 900 560", `
        <defs><linearGradient id="candy" y2="1"><stop stop-color="#ccebf2"/><stop offset="1" stop-color="#ffe1d5"/></linearGradient></defs><rect width="900" height="560" fill="url(#candy)"/>
        <g fill="#fff"><circle cx="115" cy="109" r="40"/><circle cx="157" cy="107" r="54"/><circle cx="208" cy="113" r="36"/><circle cx="675" cy="140" r="40"/><circle cx="719" cy="129" r="57"/><circle cx="774" cy="143" r="36"/></g>
        <path d="M0 427c139-73 292-39 417 16 165 74 316 31 483-34v151H0Z" fill="#efb6c7"/>
        <path d="M0 490c154-53 289-20 427 22 152 47 310 21 473-24v72H0Z" fill="#d692ae"/>
        <g transform="translate(120 250)" stroke="#313631" stroke-width="5" stroke-linejoin="round"><path d="M0 159h156L78 0Z" fill="#e7b56d"/><path d="m30 100 96 50M126 98l-93 55" fill="none"/><circle cx="78" cy="2" r="62" fill="#f2a4bc"/><path d="M40 5c29 22 52 20 79-2" fill="none" stroke="#fff" stroke-width="12"/></g>
        <g transform="translate(585 278)" stroke="#313631" stroke-width="5"><rect x="0" y="47" width="173" height="109" rx="28" fill="#f4d06f"/><path d="M30 47c0-56 112-62 116 0" fill="#7dc8a2"/><circle cx="51" cy="105" r="7" fill="#313631"/><circle cx="118" cy="105" r="7" fill="#313631"/><path d="M64 128q21 15 42 0" fill="none"/></g>
        <g fill="#f2b84b"><circle cx="420" cy="108" r="8"/><circle cx="496" cy="188" r="6"/></g>`)
    },
    {
      id: "skycity",
      label: "天空之城",
      svg: wrap("0 0 900 560", `
        <defs><linearGradient id="air" y2="1"><stop stop-color="#aee1ee"/><stop offset="1" stop-color="#f7edd5"/></linearGradient></defs><rect width="900" height="560" fill="url(#air)"/>
        <g fill="#fff" opacity=".95"><ellipse cx="165" cy="173" rx="136" ry="54"/><ellipse cx="698" cy="218" rx="158" ry="60"/><ellipse cx="472" cy="411" rx="218" ry="76"/></g>
        <g transform="translate(301 166)" stroke="#313632" stroke-width="5" stroke-linejoin="round"><path d="M0 232 63 81l58 59 64-120 98 212Z" fill="#f0c2dc"/><path d="M31 233V139h61v35h67V101h76v132Z" fill="#f5d676"/><path d="m24 139 38-55 39 55m52-38 45-72 45 72" fill="#6f82d8"/><path d="M112 233v-45h35v45" fill="#fff"/><path d="M198 29V6l28 11-28 12" fill="#e85d3f"/></g>
        <g fill="#fff"><circle cx="89" cy="353" r="34"/><circle cx="125" cy="347" r="48"/><circle cx="160" cy="358" r="29"/></g>
        <path d="M103 413c48-71 89-101 142-96" fill="none" stroke="#f2b84b" stroke-width="14" stroke-linecap="round"/><path d="M97 395c48-71 89-101 142-96" fill="none" stroke="#e85d3f" stroke-width="10" stroke-linecap="round"/>`)
    }
  ];

  function dataUrl(item) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(item.svg.replace(/\s{2,}/g, " ").trim())}`;
  }

  window.NOMI_ART = { illustrations, scenes, dataUrl };
})();
