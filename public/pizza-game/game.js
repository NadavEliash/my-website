'use strict';

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════

const INGREDIENTS = {
  DOUGH:      { id: 'DOUGH',      name: 'בצק',       img: 'assets/dough-removebg-preview.png', basic: true },
  SAUCE:      { id: 'SAUCE',      name: 'רסק',      img: 'assets/tomato-sauce-removebg-preview.png', basic: true },
  CHEESE:     { id: 'CHEESE',     name: 'גבנצ',     img: 'assets/mozzarella-removebg-preview.png', basic: true },
  ONION:      { id: 'ONION',      name: 'בצל',       img: 'assets/onion-removebg-preview.png', basic: false },
  MUSHROOMS:  { id: 'MUSHROOMS',  name: 'פטריות',    img: 'assets/mushrooms-removebg-preview.png', basic: false },
  OLIVES:     { id: 'OLIVES',     name: 'זיתים',     img: 'assets/olives-removebg-preview.png', basic: false },
  BULGARIAN:  { id: 'BULGARIAN',  name: 'בולגרית',   img: 'assets/bulgarian-removebg-preview.png', basic: false },
  HOT_PEPPER: { id: 'HOT_PEPPER', name: 'פלפל חריף', img: 'assets/pepper-removebg-preview.png', basic: false },
};
const ALL_TYPES = Object.keys(INGREDIENTS);

const CUSTOMERS = [
  { id:'c01', name:'ישראל ישראלי',     gender:'m', quote:'פיצה פשוטה, כמוני!',                       req:['DOUGH','SAUCE','CHEESE'] },
  { id:'c02', name:'סבתא מרים',        gender:'f', quote:'כמו שאמא הכינה...',                         req:['DOUGH','SAUCE','CHEESE'] },
  { id:'c03', name:'שמוצ\'יק',         gender:'m', quote:'תן לי מה שיש, יאללה',                       req:['DOUGH','SAUCE','CHEESE'] },
  { id:'c04', name:'דנה הדיאטנית',    gender:'f', quote:'בלי תוספות! הגוף הוא מקדש!',               req:['DOUGH','SAUCE','CHEESE'] },
  { id:'c05', name:'פיטר יוט',         gender:'m', quote:'אני פשוט אוהב פטריות, בסדר?!',              req:['DOUGH','SAUCE','CHEESE','MUSHROOMS'] },
  { id:'c06', name:'שימי בן זית',      gender:'m', quote:'ללא זיתים – לא מעניין אותי.',               req:['DOUGH','SAUCE','CHEESE','OLIVES'] },
  { id:'c07', name:'ספייסי ספנסר',    gender:'m', quote:'FIRE FIRE FIRE!!! 🔥',                       req:['DOUGH','SAUCE','CHEESE','HOT_PEPPER'] },
  { id:'c08', name:'בת-שבע בולגרינה', gender:'f', quote:'בולגרית מעל הכל!',                          req:['DOUGH','SAUCE','CHEESE','BULGARIAN'] },
  { id:'c09', name:'בצלאל סגל',        gender:'m', quote:'עם בצל זה הרבה יותר טוב.',                  req:['DOUGH','SAUCE','CHEESE','ONION'] },
  { id:'c10', name:'פטריצ\'יה',        gender:'f', quote:'פשוט שימי פטריות ובצל, בבקשה.',              req:['DOUGH','SAUCE','CHEESE','MUSHROOMS','ONION'] },
  { id:'c11', name:'רוקי ירקוני',      gender:'m', quote:'ירוק זה הצבע שלי 🌿',                       req:['DOUGH','SAUCE','CHEESE','OLIVES','HOT_PEPPER'] },
  { id:'c12', name:'חיים בן בצל',      gender:'m', quote:'בצל ובולגרית? יאמי!',                       req:['DOUGH','SAUCE','CHEESE','ONION','BULGARIAN'] },
  { id:'c13', name:'מאריו הרומנטי',   gender:'m', quote:'Mamma mia! Funghi e bulgara',               req:['DOUGH','SAUCE','CHEESE','MUSHROOMS','BULGARIAN'] },
  { id:'c14', name:'בטי הקלאסית',     gender:'f', quote:'זיתים ובצל? מושלם!',                        req:['DOUGH','SAUCE','CHEESE','OLIVES','ONION'] },
  { id:'c15', name:'ג\'ון הגרגרן',     gender:'m', quote:'כל התוספות! אני חוגג ביום הולדת!',          req:['DOUGH','SAUCE','CHEESE','MUSHROOMS','OLIVES','ONION'] },
  { id:'c16', name:'נינה מנהטן',       gender:'f', quote:'I want it ALL, honey! 💅',                  req:['DOUGH','SAUCE','CHEESE','MUSHROOMS','OLIVES','HOT_PEPPER'] },
  { id:'c17', name:'גולדה גולדשטיין', gender:'f', quote:'תכין לי כמו באמריקה',                       req:['DOUGH','SAUCE','CHEESE','MUSHROOMS','ONION','OLIVES'] },
  { id:'c18', name:'שמעון חריף',       gender:'m', quote:'חריף ובולגרית – השילוב המנצח!',             req:['DOUGH','SAUCE','CHEESE','HOT_PEPPER','BULGARIAN'] },
];

const BASIC_CUSTOMER = CUSTOMERS[0];

const SURPRISE_POOL = [
  { id:'s01', name:'שוד המצרכים',  effect:'STEAL_CHOOSE',   param:null,        desc:'בחר מצרך וקח הכל מהשחקנים האחרים' },
  { id:'s02', name:'לפנק לפנק', effect:'FREE_ANY',        param:null,        desc:'קח קלף מצרך לבחירתך מהקופה' },
  { id:'s03', name:'תור נוסף!',    effect:'EXTRA_TURN',      param:null,        desc:'קבל תור נוסף' },
  { id:'s04', name:'דמי אבטלה',    effect:'GAIN_COINS',      param:3,           desc:'קבל 3 מטבעות!' },
  { id:'s05', name:'מענק עסק חדש',    effect:'GAIN_COINS',      param:6,           desc:'קבל 6 מטבעות!' },
  { id:'s06', name:'קמח מים',     effect:'FREE_SPECIFIC',   param:'DOUGH',     desc:'קבל 2 קלפי בצק מהקופה' },
  { id:'s07', name:'צהוב עולה',   effect:'FREE_SPECIFIC',   param:'CHEESE',    desc:'קבל 2 קלפי גבנצ מהקופה' },
  { id:'s08', name:'טומייטו טומאטו',    effect:'FREE_SPECIFIC',   param:'SAUCE',     desc:'קבל 2 קלפי רסק מהקופה' },
  { id:'s09', name:'גנוב על המשחק',  effect:'STEAL_ANY_ONE',   param:null,        desc:'קח קלף מצרך אחד מכל שחקן מתחרה' },
];

const PLAYER_COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12'];
const WIN_SCORE = 10;

// ═══════════════════════════════════════════════════════════
// GAME STATE
// ═══════════════════════════════════════════════════════════
let G = { sidePanelOpen: false, actionsDrawerOpen: false };
const STORAGE_KEY = 'pizza_game_state_v1';
let currentTrade = null; // { otherId, give: {}, take: {} }
let bankTradeSelection = {}; // { type: count }

// --- SOCKET MULTIPLAYER ---
let socket = null;
let roomId = null;
let myPlayerId = null; // The index in G.players
let myPlayerName = null;
let isMultiplayer = false;
let roomPlayers = [];

function initSocket() {
  // Replace with your server URL if different
  socket = io('http://localhost:3001');

  socket.on('connect', () => {
    console.log('Connected to socket server');
  });

  socket.on('game-updated', (newG) => {
    console.log('Received game update');
    G = newG;
    render(false); // Render without emitting back
  });

  socket.on('player-joined', ({ players, gameState }) => {
    console.log('Player joined', players);
    roomPlayers = players;
    if (gameState && (!G.phase || G.phase === 'waiting')) {
       G = gameState;
       findMyPlayerId();
       render(false);
    } else if (G.phase === 'waiting') {
       render(false);
    }
  });

  function findMyPlayerId() {
    if (G.players && myPlayerName) {
      const idx = G.players.findIndex(p => p.name === myPlayerName);
      if (idx !== -1) myPlayerId = idx;
    }
  }
  
  socket.on('receive-chat', ({ playerName, message }) => {
    console.log(`${playerName}: ${message}`);
    // Optional: show in UI
  });
}

function syncG() {
  if (isMultiplayer && socket && roomId) {
    socket.emit('sync-game', { roomId, G });
  }
}

function saveGame() {
  if (G && G.phase && G.phase !== 'setup') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(G));
  }
}

function loadGameFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.players) {
        G = parsed;
        return true;
      }
    } catch (e) {
      console.error("Failed to load game", e);
    }
  }
  return false;
}

function clearGameStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

function newGame(playersInput, winMode = 'score') {
  const bank = {};
  ALL_TYPES.forEach(t => bank[t] = INGREDIENTS[t].basic ? 40 : 25);

  const customers = shuffle(CUSTOMERS.filter(c => c.req.length > 3));
  const surprises = shuffle([...SURPRISE_POOL, ...SURPRISE_POOL, ...SURPRISE_POOL]);

  G = {
    players: playersInput.map((p, i) => {
      if (typeof p === 'string') return mkPlayer(p, i);
      return mkPlayer(p.name, i, p.isAuto);
    }),
    cur: 0,
    bank,
    custDeck: customers,
    srpDeck: surprises,
    phase: 'roll',
    dice: [1, 1],
    rolled: false,
    lastRoll: null,
    round: 1,
    extraTurn: false,
    winMode,   // 'score' | 'bank'
  };
  G.players.forEach(p => p.customer = { ...BASIC_CUSTOMER });
  render();
  if (isMultiplayer) syncG();
  notifyTurn();
}

function mkPlayer(name, i, isAuto = false) {
  const rand2_12 = () => { let n; do { n = rnd(2, 12); } while (n === 7); return n; };
  return {
    name, id: i, color: PLAYER_COLORS[i],
    coins: 4, score: 0,
    slots: ['DOUGH', 'SAUCE', 'CHEESE'].map(t => ({ type: t, nums: [rand2_12()] })),
    hand: {},
    customer: null,
    surprises: [],
    isAuto,
  };
}

// ═══════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const d6  = () => rnd(1, 6);
const shuffle = a => [...a].sort(() => Math.random() - .5);
const $ = id => document.getElementById(id);
const app = () => $('app');

function addHand(player, type, n = 1) {
  player.hand[type] = (player.hand[type] || 0) + n;
  if (G.bank[type] !== undefined) G.bank[type] = Math.max(0, G.bank[type] - n);
}
function removeHand(player, type, n = 1) {
  player.hand[type] = Math.max(0, (player.hand[type] || 0) - n);
  G.bank[type] = (G.bank[type] || 0) + n;
}
function drawCustomer(p) {
  if (p.isAuto) {
    p.customer = { ...BASIC_CUSTOMER };
    return;
  }
  if (!G.custDeck.length) G.custDeck = shuffle(CUSTOMERS.filter(c => c.req.length > 3));
  p.customer = { ...G.custDeck.shift() };
}

// ── Visual coin tokens ──────────────────
function coinsHTML(coins) {
  if (coins <= 0) return '<span class="no-coins">אין מטבעות</span>';
  const display = Math.min(coins, 30);
  const extra = coins - display;
  let html = '<div class="coins-display">';
  for (let i = 0; i < display; i++) html += '<span class="coin-token">🪙</span>';
  if (extra > 0) html += `<span class="coin-extra">+${extra}</span>`;
  html += '</div>';
  return html;
}

// ═══════════════════════════════════════════════════════════
// DICE FACES
// ═══════════════════════════════════════════════════════════
const DOT_MAP = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};
function dieFace(val, rolling = false) {
  const cells = Array(9).fill(false);
  DOT_MAP[val].forEach(([r, c]) => cells[r * 3 + c] = true);
  return `<div class="die-face ${rolling ? 'rolling' : ''}">
    ${cells.map(on => `<span class="dot ${on ? 'on' : ''}"></span>`).join('')}
  </div>`;
}

// ═══════════════════════════════════════════════════════════
// RENDER HELPERS
// ═══════════════════════════════════════════════════════════
function ingIcon(type, sizeClass = '') {
  const ing = INGREDIENTS[type];
  return `<img src="${ing.img}" class="ing-icon ${sizeClass}" alt="${ing.name}" title="${ing.name}">`;
}

function renderHandFanHTML(hand, selectedMap, onClickFnName) {
  const allCards = [];
  ALL_TYPES.forEach(t => {
    const countInHand = hand[t] || 0;
    const selectedSet = selectedMap[t];  // a Set of selected indices, or undefined
    for (let i = 0; i < countInHand; i++) {
      allCards.push({ type: t, idx: i, isSelected: selectedSet ? selectedSet.has(i) : false });
    }
  });

  if (allCards.length === 0) return '<div style="text-align:center;color:var(--muted);width:100%;margin-top:50px;">אין מצרכים!</div>';

  const CARDS_PER_ROW = window.innerWidth <= 768 ? 4 : 7;
  let html = '';
  
  for (let i = 0; i < allCards.length; i += CARDS_PER_ROW) {
    const rowCards = allCards.slice(i, i + CARDS_PER_ROW);
    const n = rowCards.length;
    const mid = (n - 1) / 2;
    
    html += '<div class="fan-row">';
    rowCards.forEach((card, posInRow) => {
      const offset = posInRow - mid;
      const angle = offset * 5;      // Subtle rotation for each card
      const x = offset * 48;         // Horizontal spread (overlapping)
      const y = Math.abs(offset) * 4; // Arc effect
      
      const style = `
        --fan-angle: ${angle}deg;
        --fan-x: ${x}px;
        --fan-y: ${y}px;
        z-index: ${posInRow};
      `;
      
      html += `
        <div class="selectable-card ${card.isSelected ? 'selected' : ''}"
             style="${style}"
             onclick="${onClickFnName}('${card.type}', ${card.idx})">
          <div class="card-indicator">🍕</div>
          <img src="${INGREDIENTS[card.type].img}" alt="${INGREDIENTS[card.type].name}">
          <div class="card-name">${INGREDIENTS[card.type].name}</div>
        </div>`;
    });
    html += '</div>';
  }
  
  return html;
}

function ingredientTag(type, haveIt = false) {
  const ing = INGREDIENTS[type];
  return `<span class="need-tag ${haveIt ? 'have' : ''}">${ingIcon(type, 'small')} ${ing.name}</span>`;
}

function customerCardHTML(card, hand) {
  if (!card) return '<div class="customer-card"><div class="customer-name">אין לקוח</div></div>';
  const tags = card.req.map(t => ingredientTag(t, (hand[t] || 0) >= 1)).join('');
  const price = card.req.length;
  return `
    <div class="customer-card">
    <div class="customer-name">${card.name}</div>
    <div class="customer-quote">"${card.quote}"</div>
    <div class="customer-price">${'🪙'.repeat(price)}</div>
    <div class="customer-needs">${tags}</div>
    </div>`;
}

// Stack of small cards for a slot or extra area
function stackedCardsHTML(type, count) {
  if (count <= 0) return '';
  let html = '<div class="cards-stack">';
  for (let i = 0; i < count; i++) {
    // Offset each card slightly to look stacked
    const offset = i * 4;
    html += `<div class="stacked-card" style="top:${offset}px; z-index:${i+1};">
      <div class="stacked-card-img-wrap">${ingIcon(type)}</div>
    </div>`;
  }
  html += '</div>';
  return html;
}

function slotsHTML(player) {
  const bodies = player.slots.map(s => {
    const ing = INGREDIENTS[s.type];
    const cnt = player.hand[s.type] || 0;
    return `
    <div class="ing-slot" data-type="${s.type}">
      <div class="ing-body">
        <div class="ing-name">${ing.name}</div>
        <div class="ing-img-bg">${ingIcon(s.type)}</div>
        <div class="ing-cards">
          ${s.nums.map(n => `<div class="ing-card">${n}</div>`).join('')}
        </div>
        ${stackedCardsHTML(s.type, cnt)}
      </div>
    </div>`;
  }).join('');

  return `
  <div class="ing-slots-wrap">
    <div class="ing-awning-full"></div>
    <div class="ing-slots-row">${bodies}</div>
  </div>`;
}

function extraHandHTML(player) {
  const slotTypes = player.slots.map(s => s.type);
  const extraTypes = ALL_TYPES.filter(t => (player.hand[t] || 0) > 0 && !slotTypes.includes(t));
  
  if (!extraTypes.length) return '';
  
  const stacks = extraTypes.map(t => `
    <div class="extra-hand-stack">
      ${stackedCardsHTML(t, player.hand[t])}
    </div>
  `).join('');

  return `
    <div class="extra-hand-area">
      ${stacks}
    </div>`;
}




// ═══════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════

// ── Setup ──────────────────────────────
function renderSetup() {
  app().innerHTML = `
  <div id="setup-screen">
    <div class="setup-title">🍕 פיצה בעיר</div>
    <div class="setup-card">
      <div class="setup-mode-tabs">
        <button id="tab-local" class="tab-btn active" onclick="setMultiplayer(false)">משחק מקומי</button>
        <button id="tab-online" class="tab-btn" onclick="setMultiplayer(true)">משחק אונליין</button>
      </div>

      <div id="local-setup">
        <span class="setup-label">מספר שחקנים:</span>
        <div class="player-count-buttons">
          <button id="btn3" onclick="setCount(3)" class="active">3</button>
          <button id="btn4" onclick="setCount(4)">4</button>
        </div>
        <span class="setup-label">שמות השחקנים:</span>
        <div class="name-inputs" id="name-inputs"></div>
      </div>

      <div id="online-setup" style="display:none">
        <span class="setup-label">מזהה חדר:</span>
        <input type="text" id="room-input" class="name-input" placeholder="למשל: pizza-123">
        <span class="setup-label">השם שלך:</span>
        <input type="text" id="my-name-input" class="name-input" placeholder="השם שלך">
        <div style="margin-top:10px; font-size:0.9rem; color:var(--muted)">במשחק אונליין, השחקן הראשון שמצטרף לחדר קובע את הגדרות המשחק.</div>
      </div>

      <span class="setup-label" style="margin-top:18px">🎮 תנאי סיום משחק:</span>
      <div class="win-mode-buttons" id="win-mode-buttons">
        <button id="btnWinScore" class="win-mode-btn active" onclick="setWinMode('score')">
          <span style="font-size:1.4rem">🏆</span>
          <span>${WIN_SCORE} לקוחות</span>
        </button>
        <button id="btnWinBank" class="win-mode-btn" onclick="setWinMode('bank')">
          <span style="font-size:1.4rem">🃏</span>
          <span>סיום הקלפים בקופה</span>
        </button>
      </div>
      <div id="win-mode-desc" class="setup-mode-desc">מנצח מי שמשיג ראשון ${WIN_SCORE} לקוחות</div>

      <button class="start-btn" onclick="startFromSetup()">התחל משחק</button>
    </div>
  </div>`;
  setCount(3);
}

function setMultiplayer(multi) {
  isMultiplayer = multi;
  $('tab-local').classList.toggle('active', !multi);
  $('tab-online').classList.toggle('active', multi);
  $('local-setup').style.display = multi ? 'none' : 'block';
  $('online-setup').style.display = multi ? 'block' : 'none';
  if (multi && !socket) initSocket();
}

let playerCount = 3;
let selectedWinMode = 'score';

function setWinMode(mode) {
  selectedWinMode = mode;
  ['Score','Bank'].forEach(m => {
    const btn = $('btnWin' + m);
    if (btn) btn.classList.toggle('active', mode === m.toLowerCase());
  });
  const desc = $('win-mode-desc');
  if (desc) desc.textContent = mode === 'score'
    ? `נצח מי שמשיג ראשון ${WIN_SCORE} לקוחות`
    : 'המשחק נגמר כשמצרך כלשהו נגמר בקופה — מנצח מי שלו הכי הרבה לקוחות';
}

function setCount(n) {
  playerCount = n;
  ['btn3', 'btn4'].forEach(id => $(id) && $(id).classList.remove('active'));
  $('btn' + n).classList.add('active');
  const defaults = ['שחקן א', 'שחקן ב', 'שחקן ג', 'שחקן ד'];
  $('name-inputs').innerHTML = Array.from({ length: n }, (_, i) => {
    const canBeBot = i >= n - 2;
    return `<div class="setup-player-row">
      <input class="name-input" id="pname${i}" placeholder="${defaults[i]}" value="${defaults[i]}">
      ${canBeBot ? `
        <label class="auto-toggle" title="מחשב (AI)">
          <input type="checkbox" id="pauto${i}" onchange="updatePlayerNames()"> 🤖
        </label>` : ''}
    </div>`;
  }).join('');
}

function updatePlayerNames() {
  let botCount = 0;
  const humanDefaults = ['שחקן א', 'שחקן ב', 'שחקן ג', 'שחקן ד'];
  
  for (let i = 0; i < playerCount; i++) {
    const input = $(`pname${i}`);
    const autoCheck = $(`pauto${i}`);
    const isAuto = autoCheck ? autoCheck.checked : false;
    
    if (isAuto) {
      botCount++;
      if (botCount === 1) input.value = 'בוט הבן';
      else if (botCount === 2) input.value = 'בוט הבת';
      else input.value = `בוט ${botCount}`;
      input.disabled = true;
    } else {
      input.disabled = false;
      // Revert if it was a bot name
      const val = input.value.trim();
      if (val === 'בוט הבן' || val === 'בוט הבת' || val.startsWith('בוט ')) {
         input.value = humanDefaults[i];
      }
    }
  }
}

function startFromSetup() {
  if (isMultiplayer) {
    const rid = $('room-input').value.trim();
    const myName = $('my-name-input').value.trim();
    if (!rid || !myName) {
      alert('נא להזין מזהה חדר ושם');
      return;
    }
    roomId = rid;
    myPlayerName = myName;
    G.phase = 'waiting';
    socket.emit('join-room', { roomId, playerName: myName });
    render();
  } else {
    const playersInfo = Array.from({ length: playerCount }, (_, i) => {
      const v = $(`pname${i}`).value.trim();
      const isAuto = $(`pauto${i}`).checked;
      return { name: v || `שחקן ${i + 1}`, isAuto };
    });
    newGame(playersInfo, selectedWinMode);
  }
}

function notifyTurn() {
  const p = G.players[G.cur];

  if (p.isAuto) {
    showModal(`
      <div style="text-align:center; padding: 20px;">
        <div style="font-size: 5rem; margin-bottom: 15px;">🤖</div>
        <div class="modal-title" style="color:${p.color}; font-size: 2.2rem;">תור ${p.name} (מחשב)</div>
        <div class="modal-sub" style="font-size: 1.1rem; margin-top: 10px;">המחשב חושב...</div>
      </div>
    `, 1);
    setTimeout(runAILogic, 1200);
    return;
  }

  const html = `
    <div style="text-align:center; padding: 20px;">
      <div style="font-size: 5rem; margin-bottom: 15px;">👨‍🍳</div>
      <div class="modal-title" style="color:${p.color}; font-size: 2.2rem;">תור ${p.name}</div>
      <div class="modal-sub" style="font-size: 1.1rem; margin-top: 10px; margin-bottom: 20px;">יאללה, לחמם תנורים!</div>
      <button class="start-btn" onclick="closeModal()">אני מוכן/ה!</button>
    </div>
  `;
  showModal(html, 0);
}

function runAILogic() {
  const p = G.players[G.cur];
  if (!p || !p.isAuto || G.phase === 'gameover') return;

  if (G.phase === 'roll') {
    doRoll();
  } else if (G.phase === 'action') {
    if (canFulfill(p)) {
      setTimeout(() => {
        doBake();
        setTimeout(doEndTurn, 1000);
      }, 800);
    } else {
      setTimeout(doEndTurn, 1000);
    }
  }
}


// ── Surprise Cards Display ─────────────
function surpriseCardsHTML(p) {
  if (!p.surprises || p.surprises.length === 0) return '';
  const cards = p.surprises.map((s, idx) => `
    <div class="surprise-card">
      <div class="surprise-card-icon">
        <img src="assets/gift-removebg-preview.png" alt="הפתעה">
      </div>
      <div class="surprise-card-name">${s.name}</div>
      <div class="surprise-card-desc">${s.desc}</div>
      <button class="surprise-card-btn" onclick="showSurpriseFromHand(${idx})">השתמש</button>
    </div>`);
  return `<div class="surprise-cards-row">${cards.join('')}</div>`;
}

// ── Game Screen ────────────────────────
function renderGame() {
  const p = G.players[G.cur];

  const strip = G.players.map((pl, i) => `
    <div class="player-chip ${i === G.cur ? 'active' : ''}">
      <div class="chip-name" style="color:${pl.color}">${pl.name}
        <span class="chip-score">${pl.score}${G.winMode !== 'bank' ? `/${WIN_SCORE}` : ''}</span>
      </div>
      <div class="chip-coins">${coinsHTML(pl.coins)}</div>
    </div>`).join('');

  // Roll results display (who got what)
  let rollResultsHTML = '';
  if (G.lastRoll) {
    const icon = G.lastRoll.sum === 7 ? '✨' : '🎲';
    const lines = G.lastRoll.results.length
      ? G.lastRoll.results.map(r => `<div class="roll-result-item">${ingIcon(r.type, 'tiny')} ${INGREDIENTS[r.type].name} <strong style="color:${G.players[r.playerIdx].color}; margin-right:8px">ל${G.players[r.playerIdx].name}</strong></div>`).join('')
      : `<div class="roll-result-item" style="color:#888">אף אחד לא קיבל מצרך</div>`;
    const isPick7 = G.phase === 'pick7';
    rollResultsHTML = `<div class="roll-results ${isPick7 ? 'clickable' : ''}" 
      ${isPick7 ? 'onclick="showPick7Modal()"' : ''}>
      <div class="roll-results-title">${icon} יצא ${G.lastRoll.sum}</div>
      ${lines}
      ${isPick7 ? '<div style="color:var(--gold); margin-top:4px">לחץ לבחירת מצרך</div>' : ''}
    </div>`;
  }

    const isMyTurn = !isMultiplayer || myPlayerId === G.cur;
    const diceDisabled = G.rolled || !isMyTurn;

    const diceHTML = `
    <div id="dice-area">
      <div class="dice-row" id="dice-row">${dieFace(G.dice[0])} ${dieFace(G.dice[1])}</div>
      ${rollResultsHTML}
      ${G.phase === 'roll'
        ? `<button class="roll-btn" id="roll-btn" onclick="doRoll()" ${diceDisabled ? 'disabled' : ''}>${isMyTurn ? 'הטל קוביות' : `מחכים ל-${p.name}...`}</button>`
        : G.phase === 'pick7'
          ? `<div class="dice-msg" style="color:#f5c518">יצא 7! בחר מצרך לקחת מהקופה</div>`
          : ''}
    </div>`;

  const actionBtns = G.phase === 'action' ? buildActionBtns(p) : '';

  const bankHTML = `
    <div>
      <div class="section-title">🏦 קופה</div>
      <div class="bank-grid">
        ${ALL_TYPES.map(t => `
          <div class="bank-row">
            <span>${ingIcon(t, 'tiny')} ${INGREDIENTS[t].name}</span>
            <span class="bank-count">${G.bank[t] || 0}</span>
          </div>`).join('')}
      </div>
    </div>
    <div style="margin-top:16px">
      <div class="section-title">🏆 ניקוד</div>
      ${G.players.map(pl => `
        <div class="bank-row">
          <span style="color:${pl.color}">${pl.name}</span>
          <span class="bank-count">${pl.score} 🍕</span>
        </div>`).join('')}
    </div>`;

  const basicIngs = ['DOUGH', 'SAUCE', 'CHEESE'];
  let needsHTML = '';
  if (p.customer) {
    const hasBasic = basicIngs.every(b => p.customer.req.includes(b));
    const pHasBasic = basicIngs.every(b => (p.hand[b] || 0) >= 1);
    const extras = p.customer.req.filter(r => !basicIngs.includes(r));
    
    if (hasBasic) {
      needsHTML += `
        <div class="board-cust-need-pizza ${pHasBasic ? 'have' : ''}" title="בצק, רסק וגבנצ">
          <img src="assets/pizza-removebg-preview.png">
        </div>`;
    } else {
      needsHTML += p.customer.req.filter(r => basicIngs.includes(r)).map(t => `<span class="board-cust-need ${(p.hand[t]||0)>=1?'have':''}">${ingIcon(t, 'tiny')}</span>`).join('');
    }
    
    extras.forEach(t => {
      needsHTML += `<span class="board-cust-need ${(p.hand[t]||0)>=1?'have':''}">${ingIcon(t, 'tiny')}</span>`;
    });
  }

  app().innerHTML = `
  <div id="game-screen">
    <header id="game-header">
      <div class="header-left">
        <button class="hamburger-btn" onclick="toggleSidePanel()">☰</button>
        <div class="header-title">פיצה בעיר</div>
      </div>
      <div class="header-round">סיבוב ${G.round}</div>
      <div class="header-info">
        ${isMultiplayer ? `<span id="socket-status" class="status-dot ${socket && socket.connected ? 'online' : 'offline'}"></span>` : ''}
        תור: <strong style="color:${p.color}">${p.name}</strong>
      </div>
    </header>
    <div id="players-strip">${strip}</div>
    <div id="play-area">
    <div id="play-area">
      <div id="active-area">
        <div class="board-wrapper">
          <div class="board-top-bar">
            <span class="board-player-label" style="color:${p.color}">${p.name}</span>
            <span class="board-score-badge">🏆 ${p.score}/${WIN_SCORE}</span>
          </div>
          <div class="board-body-row">
            <div class="board-cust-col">
              <div class="board-cust-body">
                ${p.customer ? `
                <div class="board-cust-header">
                  <div class="board-cust-img">
                    <img src="assets/${p.customer.gender === 'f' ? 'female' : 'male'}-customer-removebg-preview.png" alt="${p.customer.name}">
                  </div>
                  <div class="board-cust-info">
                    <div class="board-cust-name">${p.customer.name}</div>
                    <div class="board-cust-quote">"${p.customer.quote}"</div>
                  </div>
                </div>
                <div class="board-cust-needs">
                  ${needsHTML}
                </div>
                <div class="board-cust-price">${'🪙'.repeat(p.customer.req.length)} </div>
                ` : ''}
              </div>
            </div>
            <div class="board-slots-area">
              <div class="board-slots-inner-row">
                ${slotsHTML(p)}
              </div>
              <div class="board-bottom-bar">
                <div class="board-coins-row">${coinsHTML(p.coins)}</div>
                ${extraHandHTML(p)}
              </div>
            </div>
          </div>
        </div>
        <div id="controls-row" style="display:flex; gap:16px; align-items: flex-start;">
          ${diceHTML}
          ${actionBtns ? `<div id="action-buttons">${actionBtns}</div>` : ''}
          ${surpriseCardsHTML(p)}
        </div>
      </div>

      <div id="side-panel" class="${G.sidePanelOpen ? 'drawer-open' : ''}">
        <div id="side-panel-header" onclick="toggleSidePanel()">
          <div class="drawer-handle"></div>
          <div class="drawer-title right">
            <span>פיצה בעיר</span>
            <span class="drawer-arrow">✕</span>
          </div>
        </div>
        <div id="side-panel-content">
          ${bankHTML}
        </div>
        <div id="side-panel-footer">
          <button class="action-btn" style="background:#442222; color:#ffaaaa; border-color:#663333; width:100% ; text-align:center" onclick="confirmNewGame()">
            משחק חדש
          </button>
        </div>
      </div>

      <!-- Mobile: Actions Drawer & Fixed End Turn -->
      <div id="mobile-actions-wrapper" class="${G.actionsDrawerOpen ? 'open' : ''} ${G.phase === 'action' ? 'has-drawer' : ''}">
        ${G.phase === 'action' ? `
          <div id="actions-drawer-header" onclick="toggleActionsDrawer()">
              <div class="drawer-handle"></div>
              <span class="drawer-title"><span class="drawer-arrow">
              </span> פעולות ${G.actionsDrawerOpen 
                ? 
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
                </svg>`
                :
              `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
              </svg>` 
              }</span>
          </div>
          <div id="actions-drawer-content">
              ${buildActionBtns(p, true)}
          </div>
        ` : ''}
        <div id="fixed-bottom-bar">
            ${G.phase === 'action' 
              ? `<button class="action-btn end-turn" onclick="doEndTurn()" ${!isMyTurn ? 'disabled' : ''}>סיים תור</button>` 
              : G.phase === 'pick7'
                ? `<button class="action-btn" disabled style="background:rgba(245,197,24,0.12); color:var(--gold); border-color:var(--gold)">בחר מצרך (יצא 7)</button>`
                : `<button class="action-btn roll-btn" id="mobile-roll-btn" onclick="doRoll()" ${G.rolled || !isMyTurn ? 'disabled' : ''}>${isMyTurn ? 'הטל קוביות' : `מחכים ל-${p.name}...`}</button>`
            }
        </div>
      </div>
    </div>
  </div>`;
}

function toggleSidePanel() {
  G.sidePanelOpen = !G.sidePanelOpen;
  renderGame();
}

function toggleActionsDrawer() {
  G.actionsDrawerOpen = !G.actionsDrawerOpen;
  renderGame();
}

function buildActionBtns(p, mobileMode = false) {
  const isMyTurn = !isMultiplayer || myPlayerId === G.cur;
  const canBake = canFulfill(p);
  const buttons = [
    `<button class="action-btn ${canBake ? 'can-bake' : ''}" onclick="doBake()" ${canBake && isMyTurn ? '' : 'disabled'}>
      אפה פיצה ${canBake ? '' : '(חסרים מצרכים)'}
    </button>`,
    `<button class="action-btn" onclick="doPickSurprise()" ${p.coins >= 3 && isMyTurn ? '' : 'disabled'}>
      קלף הפתעה (3 מטבעות)
    </button>`,
    `<button class="action-btn" onclick="doBuySlot()" ${p.coins >= 6 && isMyTurn ? '' : 'disabled'}>
      מצרך חדש ללוח (6 מטבעות)
    </button>`,
    `<button class="action-btn" onclick="doBuyNumber()" ${p.coins >= 4 && isMyTurn ? '' : 'disabled'}>
      מספר נוסף (4 מטבעות)
    </button>`,
    `<button class="action-btn" onclick="doExchange()" ${isMyTurn ? '' : 'disabled'}>
      המרת מצרכים
    </button>`
  ];

  if (!mobileMode) {
    buttons.push(`<button class="action-btn end-turn" onclick="doEndTurn()" ${isMyTurn ? '' : 'disabled'}>
      סיים תור
    </button>`);
  }

  return buttons.join('');
}

// ═══════════════════════════════════════════════════════════
// GAME ACTIONS
// ═══════════════════════════════════════════════════════════

function doRoll() {
  if (G.phase !== 'roll') return;

  // Disable roll button immediately
  const btn = $('roll-btn');
  if (btn) btn.disabled = true;

  G.rolled = true;
  G.lastRoll = null;

  // ── Dice animation: cycle random values ──
  let cycles = 0;
  const TOTAL_CYCLES = 10;
  const INTERVAL_MS = 70;

  const anim = setInterval(() => {
    const diceRow = $('dice-row');
    if (diceRow) diceRow.innerHTML = dieFace(d6(), true) + dieFace(d6(), true);
    cycles++;

    if (cycles >= TOTAL_CYCLES) {
      clearInterval(anim);
      // Final values
      const d1 = d6(), d2 = d6();
      G.dice = [d1, d2];
      const diceRow2 = $('dice-row');
      if (diceRow2) diceRow2.innerHTML = dieFace(d1) + dieFace(d2);
      setTimeout(() => handleRollResult(d1 + d2), 300);
    }
  }, INTERVAL_MS);
}

function handleRollResult(sum) {
  G.lastRoll = { sum, results: [] };
  const p = G.players[G.cur];

  if (sum === 7) {
    if (p.isAuto) {
      // Auto player rolls again on 7
      G.lastRoll = null;
      G.rolled = false;
      G.phase = 'roll';
      render();
      setTimeout(doRoll, 1000);
      return;
    }
    G.phase = 'pick7';
    renderGame();
    showPick7Modal();
  } else {
    const got = distributeIngredients(sum);
    if (!got) {
      // No one has this number → re-roll automatically
      setTimeout(() => {
        G.lastRoll = null;
        G.rolled = false;
        G.phase = 'roll';
        renderGame();
        setTimeout(doRoll, 400);
      }, 1000);
    } else {
      G.phase = 'action';
      renderGame();
      if (p.isAuto) setTimeout(runAILogic, 1000);
    }
  }
  window.scrollTo(0, 1000);  
}

function distributeIngredients(sum) {
  let got = false;
  G.players.forEach((p, playerIdx) => {
    p.slots.forEach(s => {
      if (s.nums.includes(sum) && G.bank[s.type] > 0) {
        addHand(p, s.type);
        G.lastRoll.results.push({ playerIdx, type: s.type });
        got = true;
      }
    });
  });
  if (got) checkBankDepletion();
  return got && G.phase !== 'gameover';
}

function checkBankDepletion() {
  // Only trigger in bank mode
  if (G.winMode !== 'bank') return false;
  const depleted = ALL_TYPES.find(t => G.bank[t] === 0);
  if (!depleted) return false;
  G.phase = 'gameover';
  const maxScore = Math.max(...G.players.map(p => p.score));
  const winners = G.players.filter(p => p.score === maxScore);
  winners.sort((a, b) => b.coins - a.coins);
  const winner = winners[0];
  renderWin(winner, `נגמרו קלפי ${INGREDIENTS[depleted].name} בקופה! המשחק הסתיים לפי מספר הלקוחות`);
  return true;
}

function pickIngredientFor7(type) {
  if (G.bank[type] <= 0) {
    showModal(`<div class="modal-title">אופס!</div><div class="modal-sub">אין קלפים מסוג זה בקופה!</div>`, 3);
    return;
  }
  const p = G.players[G.cur];
  addHand(p, type);
  closeModal();
  G.phase = 'action';
  renderGame();
}

function canFulfill(p) {
  if (!p.customer) return false;
  return p.customer.req.every(t => (p.hand[t] || 0) >= 1);
}

function doBake() {
  const p = G.players[G.cur];
  if (!canFulfill(p)) return;
  p.customer.req.forEach(t => removeHand(p, t));
  const coins = p.customer.req.length;
  
  if (!p.isAuto) p.coins += coins;
  
  p.score++;
  // Win condition: score mode only
  if (G.winMode !== 'bank' && p.score >= WIN_SCORE) {
    G.phase = 'gameover';
    renderWin(p, `${p.name} הגיע/ה ל-${WIN_SCORE} לקוחות מרוצים!`);
    return;
  }
  drawCustomer(p);
  renderGame();
}

function doEndTurn() {
  G.actionsDrawerOpen = false; 
  if (G.extraTurn) {
    G.extraTurn = false;
  } else {
    G.cur = (G.cur + 1) % G.players.length;
    if (G.cur === 0) G.round++;
  }
  G.phase = 'roll';
  G.rolled = false;
  G.lastRoll = null;
  render();
  notifyTurn();
}

// ── Buying ─────────────────────────────

function doBuySlot() {
  const p = G.players[G.cur];
  if (p.coins < 6) return;
  const allToppings = ['ONION', 'MUSHROOMS', 'OLIVES', 'BULGARIAN', 'HOT_PEPPER'];
  const owned = new Set(p.slots.map(s => s.type));
  const available = allToppings.filter(t => !owned.has(t));

  if (!available.length) {
    showModal(`<div class="modal-title">אין מצרכים זמינים</div>
      <div class="modal-sub">כבר יש לך את כל התוספות האפשריות!</div>
      <button class="modal-close" onclick="closeModal()">סגור</button>`);
    return;
  }

  const items = available.map(t => `
    <div class="modal-item" onclick="confirmBuySlot('${t}')">
      <div class="modal-item-img-wrap">${ingIcon(t)}</div>
      <div class="modal-item-label">${INGREDIENTS[t].name}</div>
    </div>`).join('');
  showModal(`<div class="modal-title">מצרך חדש ללוח (6 מטבעות)</div>
    <div class="modal-sub">בחר סוג תוספת</div>
    <div class="modal-grid">${items}</div>
    <button class="modal-close" onclick="closeModal()">ביטול</button>`);
}

function confirmBuySlot(type) {
  const p = G.players[G.cur];
  if (p.coins < 6) return;
  let num; do { num = rnd(2, 12); } while (num === 7);
  p.coins -= 6;
  p.slots.push({ type, nums: [num] });
  closeModal();
  renderGame();
}

function doBuyNumber() {
  const p = G.players[G.cur];
  if (p.coins < 4) return;
  const items = p.slots.map((s, i) => `
    <div class="modal-item" onclick="confirmBuyNumber(${i})">
      <div class="modal-item-img-wrap">${ingIcon(s.type)}</div>
      <div class="modal-item-label">${INGREDIENTS[s.type].name}<br><small>${s.nums.join(', ')}</small></div>
    </div>`).join('');
  showModal(`<div class="modal-title">🔢 מספר נוסף (4🪙)</div>
    <div class="modal-sub">בחר מלבן להוסיף מספר</div>
    <div class="modal-grid">${items}</div>
    <button class="modal-close" onclick="closeModal()">ביטול</button>`);
}

function confirmBuyNumber(slotIdx) {
  const p = G.players[G.cur];
  if (p.coins < 4) return;
  const slot = p.slots[slotIdx];
  let num;
  do {
    num = rnd(2, 12);
  } while (num === 7 || slot.nums.includes(num));
  
  p.coins -= 4;
  slot.nums.push(num);
  closeModal();
  renderGame();
}

function doPickSurprise() {
  const p = G.players[G.cur];
  if (p.coins < 3 || !G.srpDeck.length) return;
  p.coins -= 3;
  const card = G.srpDeck.shift();
  p.surprises.push(card);
  // Just re-render so card appears in controls-row; player can use it when ready
  renderGame();
}

function showSurpriseFromHand(idx) {
  const p = G.players[G.cur];
  const card = p.surprises[idx];
  applySurprise(card.id, idx);
}

function doExchange() {
  const p = G.players[G.cur];
  const otherPlayers = G.players.filter((_, i) => i !== G.cur);
  
  const playerOptions = otherPlayers.map(op => {
    const hasItems = ALL_TYPES.some(t => (op.hand[t] || 0) > 0);
    return `
      <div class="trade-option-card ${hasItems ? '' : 'disabled'}" onclick="${hasItems ? `selectIngredientToGivePlayer(${op.id})` : ''}" style="${hasItems ? '' : 'opacity:0.5; cursor:not-allowed;'}">
        <div class="trade-option-icon">👤</div>
        <div class="trade-option-info">
          <div class="trade-option-title">החלפה עם ${op.name}</div>
          <div class="trade-option-desc">סחר חליפין של 1 תמורת 1 (דורש אישור)</div>
          <div class="trade-player-badge" style="background:${op.color}33; color:${op.color}">שחקן פעיל</div>
        </div>
      </div>`;
  }).join('');

  showModal(`
    <div class="modal-title">מרכז ההחלפות</div>
    <div class="modal-sub">בחר שחקן או את הקופה כדי להתחיל סחר</div>
    
    <div class="trade-selection-grid">
      <div class="trade-option-card" onclick="startExchangeBank()">
        <div class="trade-option-icon">🏦</div>
        <div class="trade-option-info">
          <div class="trade-option-title">החלפה עם הקופה</div>
          <div class="trade-option-desc">יחס של 3:1 (בסיסי) או 2:1 (תוספות)</div>
          <div class="trade-player-badge" style="background:var(--gold)33; color:var(--gold)">קופה זמינה</div>
        </div>
      </div>
      ${playerOptions}
    </div>
    
    <button class="modal-close" onclick="closeModal()">ביטול</button>
  `);
}

function startExchangeBank() {
  bankTradeSelection = {};
  updateBankExchangeModal();
}

function updateBankExchangeModal() {
  const p = G.players[G.cur];
  
  // Find if selection is valid
  let canProceed = false;
  let selectedType = null;
  const selectedEntries = Object.entries(bankTradeSelection);
  
  if (selectedEntries.length === 1) {
    const [t, set] = selectedEntries[0];
    const isBasic = INGREDIENTS[t].basic;
    if ((isBasic && set.size === 3) || (!isBasic && set.size === 2)) {
      canProceed = true;
      selectedType = t;
    }
  }

  const cardsHTML = renderHandFanHTML(p.hand, bankTradeSelection, 'toggleBankTradeItem');

  showModal(`
    <div class="modal-title">🏦 החלפה עם הקופה</div>
    <div class="modal-sub">בחר 3 קלפי בסיס זהים או 2 תוספות זהות</div>
    <div class="trade-cards-grid">${cardsHTML}</div>
    
    <div style="display:flex; gap:10px; margin-top:20px;">
      <button class="start-btn" style="flex:2" onclick="confirmGiveExchangeBank('${selectedType}')" ${canProceed ? '' : 'disabled'}>
        ${canProceed ? `קבל מוצר בתמורה ל${INGREDIENTS[selectedType].name}` : 'בחר מצרכים להחלפה...'}
      </button>
      <button class="modal-close" style="flex:1" onclick="doExchange()">חזור</button>
    </div>
  `, 0);
}

function toggleBankTradeItem(type, localIdx) {
  // Only allow one type at a time for bank exchange
  const existingType = Object.keys(bankTradeSelection)[0];
  if (existingType && existingType !== type) bankTradeSelection = {};

  if (!bankTradeSelection[type]) bankTradeSelection[type] = new Set();
  const set = bankTradeSelection[type];
  if (set.has(localIdx)) set.delete(localIdx);
  else set.add(localIdx);
  if (set.size === 0) delete bankTradeSelection[type];

  updateBankExchangeModal();
}

function selectIngredientToGivePlayer(otherPlayersId) {
  const op = G.players[otherPlayersId];
  currentTrade = { otherId: otherPlayersId, give: {}, take: {} };
  updateMultiTradeGiveModal();
}

function updateMultiTradeGiveModal() {
  const p = G.players[G.cur];
  const op = G.players[currentTrade.otherId];
  
  const cardsHTML = renderHandFanHTML(p.hand, currentTrade.give, 'toggleTradeItemGive');
  const total = Object.values(currentTrade.give).reduce((a, s) => a + s.size, 0);

  showModal(`
    <div class="modal-title">מה תרצה לתת?</div>
    <div class="modal-sub">בחר מתוך המניפה את המצרכים למסור ל${op.name}</div>
    <div class="trade-cards-grid">${cardsHTML}</div>
    
    <div style="display:flex; gap:10px; margin-top:20px;">
      <button class="start-btn" style="flex:2" onclick="selectIngredientToTakePlayer()" ${total <= 0 ? 'disabled' : ''}>מה תרצה לקחת?</button>
      <button class="modal-close" style="flex:1" onclick="closeModal()">ביטול</button>
    </div>
  `, 0);
}

function selectIngredientToTakePlayer() {
  updateMultiTradeTakeModal();
}

function updateMultiTradeTakeModal() {
  const op = G.players[currentTrade.otherId];
  
  const cardsHTML = renderHandFanHTML(op.hand, currentTrade.take, 'toggleTradeItemTake');
  const totalTake = Object.values(currentTrade.take).reduce((a, s) => a + s.size, 0);

  showModal(`
    <div class="modal-title">מה תרצה לקבל?</div>
    <div class="modal-sub">בחר מתוך המניפה את המצרכים לקחת מ${op.name}</div>
    <div class="trade-cards-grid">${cardsHTML}</div>
    
    <div style="display:flex; gap:10px; margin-top:20px;">
      <button class="start-btn" style="flex:2" onclick="showTradeApprovalModal()" ${totalTake <= 0 ? 'disabled' : ''}>שלח הצעה ל${op.name} 🤝</button>
      <button class="modal-close" style="flex:1" onclick="updateMultiTradeGiveModal()">חזור</button>
    </div>
  `, 0);
}

function toggleTradeItemGive(type, localIdx) { toggleTradeItem('give', type, localIdx); }
function toggleTradeItemTake(type, localIdx) { toggleTradeItem('take', type, localIdx); }

function toggleTradeItem(dir, type, localIdx) {
  const map = currentTrade[dir];
  if (!map[type]) map[type] = new Set();
  const set = map[type];
  if (set.has(localIdx)) set.delete(localIdx);
  else set.add(localIdx);
  if (set.size === 0) delete map[type];
  if (dir === 'give') updateMultiTradeGiveModal();
  else updateMultiTradeTakeModal();
}

function showTradeApprovalModal() {
  const p = G.players[G.cur];
  const op = G.players[currentTrade.otherId];

  const giveItems = Object.entries(currentTrade.give).map(([t, set]) => `
    <div class="trade-summary-item">${ingIcon(t, 'small')} ${INGREDIENTS[t].name} x${set.size}</div>
  `).join('');
  
  const takeItems = Object.entries(currentTrade.take).map(([t, set]) => `
    <div class="trade-summary-item">${ingIcon(t, 'small')} ${INGREDIENTS[t].name} x${set.size}</div>
  `).join('');

  showModal(`
    <div style="text-align:center; padding: 10px;">
      <div style="font-size: 4rem;">🤝</div>
      <div class="modal-title">בקשת החלפה רב-מצרכית!</div>
      <div class="modal-sub">
        <strong style="color:${p.color}">${p.name}</strong> מציע/ה לך עסקה:
      </div>
      
      <div style="background:rgba(255,140,60,0.05); border-radius:12px; padding:15px; margin:15px 0; text-align:right;">
        <div style="font-weight:bold; margin-bottom:10px; color:var(--green);">⬇️ מה שתקבל/י:</div>
        <div style="display:flex; flex-wrap:wrap; gap:5px;">${giveItems}</div>
        
        <div style="font-weight:bold; margin:20px 0 10px; color:var(--red);">⬆️ מה שתיתנ/י:</div>
        <div style="display:flex; flex-wrap:wrap; gap:5px;">${takeItems}</div>
      </div>

      <div style="font-size: 1rem; color: var(--text); margin: 25px 0 15px;">האם <span style="color:${op.color}; font-weight:900;">${op.name}</span> מאשר/ת?</div>
      
      <div style="display: flex; gap: 12px;">
        <button class="start-btn" style="flex:2;" onclick="confirmPlayerExchange()">✅ מאשר/ת!</button>
        <button class="modal-close" style="flex:1;" onclick="closeModal()">❌ מסרב/ת</button>
      </div>
    </div>
  `, 0);
}

function confirmPlayerExchange() {
  const p = G.players[G.cur];
  const op = G.players[currentTrade.otherId];

  // Validate one last time
  for (const [t, set] of Object.entries(currentTrade.give)) {
    if ((p.hand[t] || 0) < set.size) { closeModal(); return; }
  }
  for (const [t, set] of Object.entries(currentTrade.take)) {
    if ((op.hand[t] || 0) < set.size) { closeModal(); return; }
  }

  // Execute swap
  for (const [t, set] of Object.entries(currentTrade.give)) {
    removeHand(p, t, set.size);
    addHand(op, t, set.size);
  }
  for (const [t, set] of Object.entries(currentTrade.take)) {
    removeHand(op, t, set.size);
    addHand(p, t, set.size);
  }

  showModal(`
    <div style="text-align:center;">
      <div style="font-size:4rem;">🤝</div>
      <div class="modal-title">החלפה בוצעה!</div>
      <div class="modal-sub">העסקה הושלמה בהצלחה.</div>
    </div>`, 3);
  
  currentTrade = null;
  renderGame();
}

function confirmGiveExchangeBank(giveType) {
  const items = ALL_TYPES.filter(t => G.bank[t] > 0).map(t => `
    <div class="modal-item" onclick="confirmTakeExchangeBank('${giveType}', '${t}')">
      <div class="modal-item-img-wrap">${ingIcon(t)}</div>
      <div class="modal-item-label">${INGREDIENTS[t].name} (${G.bank[t]})</div>
    </div>`).join('');
  
  showModal(`<div class="modal-title">🏦 החלפה עם הקופה</div>
    <div class="modal-sub">בחר מה תרצה לקבל בתמורה ל-${INGREDIENTS[giveType].name}</div>
    <div class="modal-grid">${items}</div>
    <button class="modal-close" onclick="closeModal()">ביטול</button>`);
}

function confirmTakeExchangeBank(giveType, takeType) {
  const p = G.players[G.cur];
  const isBasic = INGREDIENTS[giveType].basic;
  const countToRemove = isBasic ? 3 : 2;
  
  if ((p.hand[giveType] || 0) < countToRemove) return;
  if (G.bank[takeType] <= 0) return;

  removeHand(p, giveType, countToRemove);
  addHand(p, takeType, 1);
  
  closeModal();
  if (checkBankDepletion()) return;
  renderGame();
}

// ═══════════════════════════════════════════════════════════
// SURPRISE EFFECTS
// ═══════════════════════════════════════════════════════════


function applySurprise(cardId, handIdx) {
  const p = G.players[G.cur];
  // Ensure the card at handIdx is indeed the one we want to apply
  if (!p.surprises[handIdx] || p.surprises[handIdx].id !== cardId) {
    closeModal();
    return;
  }
  
  const c = p.surprises[handIdx];
  // Remove from hand
  p.surprises.splice(handIdx, 1);

  switch (c.effect) {
    case 'GAIN_COINS':
      p.coins += c.param;
      closeModal(); renderGame(); break;
    case 'FREE_SPECIFIC':
      addHand(p, c.param, 2);
      closeModal(); renderGame(); break;
    case 'EXTRA_TURN':
      G.extraTurn = true;
      closeModal(); renderGame(); break;
    case 'FREE_ANY':
      closeModal();
      showPickIngredientModal(type => { addHand(p, type); closeModal(); renderGame(); });
      break;
    case 'STEAL_SPECIFIC':
      stealAll(p, c.param); closeModal(); renderGame(); break;
    case 'STEAL_CHOOSE':
      closeModal();
      showPickIngredientModal(type => { stealAll(p, type); closeModal(); renderGame(); });
      break;
    case 'STEAL_ANY_ONE':
      G.players.forEach((op, i) => {
        if (i !== G.cur) {
          const types = ALL_TYPES.filter(t => (op.hand[t] || 0) > 0);
          if (types.length) {
            const t = types[rnd(0, types.length - 1)];
            removeHand(op, t); addHand(p, t);
          }
        }
      });
      closeModal(); renderGame(); break;
  }
}

function stealAll(p, type) {
  G.players.forEach((op, i) => {
    if (i !== G.cur && (op.hand[type] || 0) > 0) {
      const n = op.hand[type];
      op.hand[type] = 0;
      addHand(p, type, n);
    }
  });
}

// ═══════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════

function showPick7Modal() {
  const items = ALL_TYPES.filter(t => G.bank[t] > 0).map(t => `
    <div class="modal-item" onclick="pickIngredientFor7('${t}')">
      <div class="modal-item-img-wrap">${ingIcon(t)}</div>
      <div class="modal-item-label">${INGREDIENTS[t].name} (${G.bank[t]})</div>
    </div>`).join('');
  showModal(`<div class="modal-title">🎲 יצא 7!</div>
    <div class="modal-sub">בחר קלף מצרך לקחת מהקופה</div>
    <div class="modal-grid">${items}</div>
    <button class="modal-close" onclick="closeModal()">צפייה בלוח</button>`);
}

function showPickIngredientModal(callback) {
  window._srpCallback = callback;
  const items = ALL_TYPES.filter(t => G.bank[t] > 0).map(t => `
    <div class="modal-item" onclick="window._srpCallback('${t}')">
      <div class="modal-item-img-wrap">${ingIcon(t)}</div>
      <div class="modal-item-label">${INGREDIENTS[t].name}</div>
    </div>`).join('');
  showModal(`<div class="modal-title">🎁 בחר מצרך</div>
    <div class="modal-grid">${items}</div>
    <button class="modal-close" onclick="closeModal()">ביטול</button>`);
}

let modalTimer = null;
function showModal(html, autoCloseSec = 0) {
  if (modalTimer) clearTimeout(modalTimer);
  $('modal-box').innerHTML = html;
  $('modal-overlay').classList.remove('hidden');

  if (autoCloseSec > 0) {
    modalTimer = setTimeout(closeModal, autoCloseSec * 1000);
  }
}
function closeModal() {
  if (modalTimer) clearTimeout(modalTimer);
  $('modal-overlay').classList.add('hidden');
}

// Add backdrop click to close modal
document.addEventListener('DOMContentLoaded', () => {
    const overlay = $('modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }
});

// ═══════════════════════════════════════════════════════════
// WIN
// ═══════════════════════════════════════════════════════════

function renderWin(p, reason = '') {
  clearGameStorage();
  const allScores = G.players
    .slice()
    .sort((a, b) => b.score - a.score || b.coins - a.coins)
    .map(pl => `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
      <span style="color:${pl.color};font-weight:800;">${pl.name}</span>
      <span style="color:var(--gold);">${pl.score} לקוחות</span>
    </div>`)
    .join('');
  
  app().innerHTML = `
  <div id="win-screen">
    <div class="win-emoji">🏆</div>
    <div class="win-title">יש לנו מנצח!</div>
    <div class="win-name" style="color:${p.color}">${p.name}</div>
    ${reason ? `<div style="color:var(--muted);font-size:0.9rem;margin:8px 0 18px;padding:8px 16px;background:rgba(255,255,255,0.05);border-radius:8px;">${reason}</div>` : ''}    
    <div style="width:100%;max-width:340px;background:rgba(255,255,255,0.05);border-radius:12px;padding:12px 16px;margin:10px auto 24px;">
      <div style="font-size:0.8rem;color:var(--muted);margin-bottom:8px;">טבלת תוצאות</div>
      ${allScores}
    </div>
    <button class="win-again" onclick="renderSetup()">משחק חדש</button>
  </div>`;
}

function doConfirmNewGame() {
  closeModal();
  clearGameStorage();
  isMultiplayer = false;
  roomId = null;
  myPlayerId = null;
  roomPlayers = [];
  renderSetup();
}

function renderWaitingRoom() {
  const isHost = roomPlayers[0] && roomPlayers[0].socketId === socket.id;
  
  app().innerHTML = `
    <div id="setup-screen">
      <div class="setup-title">⏳ חדר המתנה</div>
      <div class="setup-card">
        <div class="modal-sub" style="text-align:center; font-size:1.2rem; margin-bottom:24px;">
          חדר: <strong style="color:var(--gold)">${roomId}</strong>
        </div>
        
        <div class="waiting-list">
          ${roomPlayers.map(p => `
            <div class="player-waiting-row">
              <span class="status-dot online"></span>
              <span>${p.name} ${p.socketId === socket.id ? '(את/ה)' : ''}</span>
            </div>
          `).join('')}
        </div>

        <div style="margin-top:24px">
          ${roomPlayers.length < 2 
            ? `<div class="setup-mode-desc">מחכים לשחקנים נוספים...</div>`
            : isHost 
              ? `<button class="start-btn" onclick="startOnlineGame()">התחל משחק!</button>`
              : `<div class="setup-mode-desc">מחכים שהמארח יתחיל את המשחק...</div>`
          }
        </div>
        
        <button class="modal-close" style="margin-top:16px" onclick="location.reload()">ביטול וחזרה</button>
      </div>
    </div>
  `;
}

function startOnlineGame() {
  const names = roomPlayers.map(p => p.name);
  newGame(names, selectedWinMode);
  myPlayerId = 0; // Host is always first
  syncG();
}

// ═══════════════════════════════════════════════════════════
// MAIN RENDER
// ═══════════════════════════════════════════════════════════

function render(shouldSync = true) {
  saveGame();
  switch (G.phase) {
    case undefined:
    case 'setup':    renderSetup(); break;
    case 'waiting':  renderWaitingRoom(); break;
    case 'gameover': break;
    default:         renderGame();
  }
  if (shouldSync && isMultiplayer) syncG();
}

// Boot
if (!loadGameFromStorage()) {
  renderSetup();
} else {
  render();
}
