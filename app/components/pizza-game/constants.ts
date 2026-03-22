export const INGREDIENTS = {
  DOUGH:      { id: 'DOUGH' as const,      name: 'בצק',       img: '/pizza-game/assets/dough-removebg-preview.png', basic: true },
  SAUCE:      { id: 'SAUCE' as const,      name: 'רסק',      img: '/pizza-game/assets/tomato-sauce-removebg-preview.png', basic: true },
  CHEESE:     { id: 'CHEESE' as const,     name: 'גבנצ',     img: '/pizza-game/assets/mozzarella-removebg-preview.png', basic: true },
  ONION:      { id: 'ONION' as const,      name: 'בצל',       img: '/pizza-game/assets/onion-removebg-preview.png', basic: false },
  MUSHROOMS:  { id: 'MUSHROOMS' as const,  name: 'פטריות',    img: '/pizza-game/assets/mushrooms-removebg-preview.png', basic: false },
  OLIVES:     { id: 'OLIVES' as const,     name: 'זיתים',     img: '/pizza-game/assets/olives-removebg-preview.png', basic: false },
  BULGARIAN:  { id: 'BULGARIAN' as const,  name: 'בולגרית',   img: '/pizza-game/assets/bulgarian-removebg-preview.png', basic: false },
  HOT_PEPPER: { id: 'HOT_PEPPER' as const, name: 'פלפל חריף', img: '/pizza-game/assets/pepper-removebg-preview.png', basic: false },
};

export type IngredientType = keyof typeof INGREDIENTS;
export const ALL_TYPES = Object.keys(INGREDIENTS) as IngredientType[];

export const CUSTOMERS = [
  { id:'c01', name:'ישראל ישראלי',     gender:'m', quote:'פיצה פשוטה, כמוני!',                       req:['DOUGH','SAUCE','CHEESE'] },
  { id:'c02', name:'סבתא מרים',        gender:'f', quote:'כמו שאמא הכינה...',                         req:['DOUGH','SAUCE','CHEESE'] },
  { id:'c03', name:'שמוצ\'יק',         gender:'m', quote:'תן לי מה שיש, יאללה',                       req:['DOUGH','SAUCE','CHEESE'] },
  { id:'c04', name:'דנה הדיאטנית',    gender:'f', quote:'בלי תוספות! הגוף הוא מקדש!',               req:['DOUGH','SAUCE','CHEESE'] },
  { id:'c05', name:'פורטה בלו',         gender:'m', quote:'אני פשוט אוהב פטריות, בסדר?!',              req:['DOUGH','SAUCE','CHEESE','MUSHROOMS'] },
  { id:'c06', name:'שימי זיתוני',      gender:'m', quote:'בלי זיתים – לא מעניין אותי.',               req:['DOUGH','SAUCE','CHEESE','OLIVES'] },
  { id:'c07', name:'ספייסי ספנסר',    gender:'m', quote:'FIRE FIRE FIRE!!! 🔥',                       req:['DOUGH','SAUCE','CHEESE','HOT_PEPPER'] },
  { id:'c08', name:'בת-שבע בולגרינה', gender:'f', quote:'בולגרית מעל הכל!',                          req:['DOUGH','SAUCE','CHEESE','BULGARIAN'] },
  { id:'c09', name:'בצלאל סגל',        gender:'m', quote:'עם בצל זה הרבה יותר טוב.',                  req:['DOUGH','SAUCE','CHEESE','ONION'] },
  { id:'c10', name:'פטריצ\'יה',        gender:'f', quote:'פשוט שימי פטריות ובצל, בבקשה.',              req:['DOUGH','SAUCE','CHEESE','MUSHROOMS','ONION'] },
  { id:'c11', name:'רוקי ירקוני',      gender:'m', quote:'ירוק זה הצבע שלי 🌿',                       req:['DOUGH','SAUCE','CHEESE','OLIVES','HOT_PEPPER'] },
  { id:'c12', name:'חיים בן בסל',      gender:'m', quote:'בצל ובולגרית? יאמי!',                       req:['DOUGH','SAUCE','CHEESE','ONION','BULGARIAN'] },
  { id:'c13', name:'מאריו הרומנטי',   gender:'m', quote:'Mamma mia! Funghi e bulgara',               req:['DOUGH','SAUCE','CHEESE','MUSHROOMS','BULGARIAN'] },
  { id:'c14', name:'בטי הקלאסית',     gender:'f', quote:'זיתים ובצל? מושלם!',                        req:['DOUGH','SAUCE','CHEESE','OLIVES','ONION'] },
  { id:'c15', name:'ג\'ון הגרגרן',     gender:'m', quote:'כל התוספות! אני חוגג ביום הולדת!',          req:['DOUGH','SAUCE','CHEESE','MUSHROOMS','OLIVES','ONION'] },
  { id:'c16', name:'נינה מנהטן',       gender:'f', quote:'I want it ALL, honey! 💅',                  req:['DOUGH','SAUCE','CHEESE','MUSHROOMS','OLIVES','HOT_PEPPER'] },
  { id:'c17', name:'גולדה גולדשטיין', gender:'f', quote:'תכין לי כמו באמריקה',                       req:['DOUGH','SAUCE','CHEESE','MUSHROOMS','ONION','OLIVES'] },
  { id:'c18', name:'שמעון חריף',       gender:'m', quote:'חריף ובולגרית – השילוב המנצח!',             req:['DOUGH','SAUCE','CHEESE','HOT_PEPPER','BULGARIAN'] },
  { id:'c19', name:'דן הקטן',       gender:'m', quote:'רק גבינה! בלי כלום!',                       req:['DOUGH','SAUCE','CHEESE'] },
  { id:'c20', name:'חן הסטודנטית',     gender:'f', quote:'אין לי כסף לתוספות...',                     req:['DOUGH','SAUCE','CHEESE'] },
  { id:'c21', name:'יוסי הקמצן',       gender:'m', quote:'שקל לתוספת?! אני אוותר.',                   req:['DOUGH','SAUCE','CHEESE'] },
  { id:'c22', name:'ליאור המבולבל',    gender:'m', quote:'רק פיצה, בלי הפתעות.',                      req:['DOUGH','SAUCE','CHEESE'] },
  { id:'c23', name:'קרן הצמחונית',     gender:'f', quote:'קצת תירס... רגע, אין לכם? אז פטריות.',       req:['DOUGH','SAUCE','CHEESE','MUSHROOMS'] },
  { id:'c24', name:'רון פלפלון',       gender:'m', quote:'חריף ובצל לחזקים בלבד!',                    req:['DOUGH','SAUCE','CHEESE','HOT_PEPPER','ONION'] },
  { id:'c25', name:'מלי המפונקת',      gender:'f', quote:'קצת מזה, קצת מזה, וקצת מזה.',               req:['DOUGH','SAUCE','CHEESE','OLIVES','BULGARIAN','MUSHROOMS'] },
] as const;

export const BASIC_CUSTOMER = CUSTOMERS[0];

export const SURPRISE_POOL = [
  { id:'s01', name:'שוד המצרכים',  effect:'STEAL_CHOOSE',   param:null,        desc:'בחר מצרך וקח הכל מהשחקנים האחרים' },
  { id:'s02', name:'לפנק לפנק', effect:'FREE_ANY',        param:null,        desc:'קח קלף מצרך לבחירתך מהקופה' },
  { id:'s03', name:'תור נוסף!',    effect:'EXTRA_TURN',      param:null,        desc:'קבל תור נוסף' },
  { id:'s04', name:'דמי אבטלה',    effect:'GAIN_COINS',      param:3,           desc:'קבל 3 מטבעות!' },
  { id:'s05', name:'מענק עסק חדש',    effect:'GAIN_COINS',      param:6,           desc:'קבל 6 מטבעות!' },
  { id:'s06', name:'קמח מים',     effect:'FREE_SPECIFIC',   param:'DOUGH',     desc:'קבל 2 קלפי בצק מהקופה' },
  { id:'s07', name:'צהוב עולה',   effect:'FREE_SPECIFIC',   param:'CHEESE',    desc:'קבל 2 קלפי גבנצ מהקופה' },
  { id:'s08', name:'טומייטו טומאטו',    effect:'FREE_SPECIFIC',   param:'SAUCE',     desc:'קבל 2 קלפי רסק מהקופה' },
  { id:'s09', name:'גנוב על המשחק',  effect:'STEAL_ANY_ONE',   param:null,        desc:'קח קלף מצרך אחד מכל שחקן מתחרה' },
  { id:'s10', name:'מספר מזל', effect:'FREE_NUMBER', param:null, desc:'הוסף מספר נוסף בחינם לאחד המצרכים או התוספות שלך' },
] as const;

export const PLAYER_COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12'];
export const WIN_SCORE = 45;
export const STORAGE_KEY = 'pizza_game_state_v1';
