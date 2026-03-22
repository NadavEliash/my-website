'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import './pizza-game.css';
import { Heebo } from 'next/font/google';
import { 
  INGREDIENTS, 
  CUSTOMERS, 
  SURPRISE_POOL, 
  PLAYER_COLORS, 
  WIN_SCORE, 
  ALL_TYPES,
  BASIC_CUSTOMER,
  IngredientType
} from './constants';
import { GameState, Player, RoomPlayer } from './types';

const heebo = Heebo({ subsets: ['hebrew', 'latin'] });

const DieFace = ({ value, rolling }: { value: number; rolling: boolean }) => {
  const DOT_MAP: Record<number, number[][]> = {
    1: [[1, 1]],
    2: [[0, 2], [2, 0]],
    3: [[0, 2], [1, 1], [2, 0]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  };

  const cells = Array(9).fill(false);
  DOT_MAP[value]?.forEach(([r, c]) => cells[r * 3 + c] = true);

  return (
    <div className={`die-face ${rolling ? 'rolling' : ''}`}>
      {cells.map((on, i) => (
        <span key={i} className={`dot ${on ? 'on' : ''}`}></span>
      ))}
    </div>
  );
};

const CoinsHTML = ({ coins }: { coins: number }) => {
  if (coins <= 0) return <span className="no-coins">אין מטבעות</span>;
  const display = Math.min(coins, 30);
  const extra = coins - display;
  const tokens = [];
  for (let i = 0; i < display; i++) tokens.push(<span key={i} className="coin-token">🪙</span>);
  return (
    <div className="coins-display">
      {tokens}
      {extra > 0 && <span className="coin-extra">+{extra}</span>}
    </div>
  );
};

const HandFan = ({ hand, selectedMap, onToggle }: { hand: Partial<Record<IngredientType, number>>, selectedMap: Partial<Record<IngredientType, number[]>>, onToggle: (type: IngredientType, idx: number) => void }) => {
  const allCards: { type: IngredientType, idx: number, isSelected: boolean }[] = [];
  ALL_TYPES.forEach(t => {
    const countInHand = hand[t] || 0;
    const selectedArr = selectedMap[t] || [];
    for (let i = 0; i < countInHand; i++) {
      allCards.push({ type: t, idx: i, isSelected: selectedArr.includes(i) });
    }
  });

  if (allCards.length === 0) return <div style={{ textAlign: 'center', color: 'var(--muted)', width: '100%', marginTop: '50px' }}>אין מצרכים!</div>;

  const CARDS_PER_ROW = typeof window !== 'undefined' && window.innerWidth <= 768 ? 4 : 7;
  const rows = [];
  
  for (let i = 0; i < allCards.length; i += CARDS_PER_ROW) {
    const rowCards = allCards.slice(i, i + CARDS_PER_ROW);
    const mid = (rowCards.length - 1) / 2;
    
    rows.push(
      <div key={i} className="fan-row">
        {rowCards.map((card, posInRow) => {
          const offset = posInRow - mid;
          const angle = offset * 5;
          const x = offset * 48;
          const y = Math.abs(offset) * 4;
          
          return (
            <div 
              key={`${card.type}-${card.idx}`}
              className={`selectable-card ${card.isSelected ? 'selected' : ''}`}
              style={{
                '--fan-angle': `${angle}deg`,
                '--fan-x': `${x}px`,
                '--fan-y': `${y}px`,
                zIndex: posInRow
              } as React.CSSProperties}
              onClick={() => onToggle(card.type, card.idx)}
            >
              <div className="card-indicator">🍕</div>
              <img src={INGREDIENTS[card.type].img} alt={INGREDIENTS[card.type].name} />
              <div className="card-name">{INGREDIENTS[card.type].name}</div>
            </div>
          );
        })}
      </div>
    );
  }
  
  return <>{rows}</>;
};

export default function PizzaGame() {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    cur: 0,
    bank: {},
    custDeck: [],
    srpDeck: [],
    phase: 'setup',
    dice: [1, 1],
    rolled: false,
    lastRoll: null,
    round: 1,
    extraTurn: false,
    winMode: 'score',
    sidePanelOpen: false,
    actionsDrawerOpen: false,
  });

  const [tradeState, setTradeState] = useState<{
    modal: 'tradeCenter' | 'bankTrade' | 'multiTradeGive' | 'multiTradeTake' | 'tradeApproval' | 'stealPlayerSelect' | 'stealTake' | null,
    otherId: number,
    give: Partial<Record<IngredientType, number[]>>,
    take: Partial<Record<IngredientType, number[]>>,
    actionSource: 'srp' | 'trade'
  }>({ modal: null, otherId: -1, give: {}, take: {}, actionSource: 'trade' });

  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([]);
  const [pendingTradeOffer, setPendingTradeOffer] = useState<any>(null);
  const [playerCount, setPlayerCount] = useState(3);
  const [setupPlayerInfos, setSetupPlayerInfos] = useState<{name: string, isAuto: boolean}[]>(
    Array.from({ length: 4 }, (_, i) => ({ name: `שחקן ${String.fromCharCode(1488 + i)}`, isAuto: false }))
  );
  const [modal, setModal] = useState<{ html: React.ReactNode; autoClose?: number } | null>(null);
  const modalTimer = useRef<NodeJS.Timeout | null>(null);
  const pendingOutgoingOffer = useRef<any>(null);

  const STORAGE_KEY = 'pizza_game_state_v1';
  const [hasSavedGame, setHasSavedGame] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasSavedGame(!!localStorage.getItem(STORAGE_KEY));
    }
  }, [gameState.phase]);

  const myPlayerIndex = isMultiplayer
    ? gameState.players.findIndex(pl => pl.name === playerName)
    : -1;
  const isMyTurn = !isMultiplayer || (myPlayerIndex !== -1 && myPlayerIndex === gameState.cur);
  const prevIsMyTurn = useRef(isMyTurn);

  useEffect(() => {
    if (!prevIsMyTurn.current && isMyTurn && gameState.phase !== 'setup' && gameState.phase !== 'waiting' && gameState.phase !== 'gameover') {
      showModal(
        <div className="my-turn-modal">
          <div className="my-turn-icon">🍕</div>
          <div className="my-turn-title">{gameState.players[gameState.cur].name} עכשיו התור שלך!</div>
          <div className="my-turn-sub">כל העיר מחכה לפיצות המעלפות שלך...</div>
          <button className="start-btn" style={{ fontSize: '1.2rem', padding: '12px 24px' }} onClick={closeModal}>קדימה, לחמם תנורים!</button>
        </div>
      );
    }
    prevIsMyTurn.current = isMyTurn;
  }, [isMyTurn, gameState.phase]);



  const loadGameFromStorage = () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.players) {
          setGameState(parsed);
          setIsMultiplayer(false);         
            const p = parsed.players[parsed.cur];
            if (p) {
               setModal({ html: (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🍕</div>
                    <div className="modal-title" style={{ color: p.color }}>חזרנו למשחק של {p.name}</div>
                    <div className="modal-sub">התנור כבר חם</div>
                    <button className="start-btn" onClick={() => setModal(null)}>קדימה!</button>
                  </div>
               )});
            }
        }
      } catch (e) {
        console.error("Failed to load game", e);
      }
    }
  };

  const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
  const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

  const showModal = (html: React.ReactNode, autoCloseSec = 0) => {
    if (modalTimer.current) clearTimeout(modalTimer.current);
    setModal({ html });
    if (autoCloseSec > 0) {
      modalTimer.current = setTimeout(() => setModal(null), autoCloseSec * 1000);
    }
  };

  useEffect(() => {
    // We only automate actions for local games or for the current player in multiplayer.
    if (gameState.phase === 'gameover') return;
    const p = gameState.players[gameState.cur];
    if (!p) return;

    // Only the person whose turn it is should trigger automation
    if (!isMyTurn) return;

    // Automation logic
    const isReRoll = gameState.autoRoll;
    const isAiTurn = p.isAuto;

    if (!isReRoll && !isAiTurn) return;

    // Use a longer delay for re-rolls so the user can see what happened.
    const delay = 800;

    const timer = setTimeout(() => {
      if (isReRoll) {
        // If it's a re-roll, trigger the roll.
        console.log("Triggering auto re-roll for irrelevant result");
        doRoll();
      } else if (isAiTurn) {
        // Standard AI turn logic
        if (gameState.phase === 'roll' && !gameState.rolled) {
          doRoll();
        } else if (gameState.phase === 'action') {
          const canBake = (p.customer.req as IngredientType[]).every(t => (p.hand[t] || 0) >= 1);
          if (canBake) {
            doBake();
            setTimeout(doEndTurn, 1000);
          } else {
            doEndTurn();
          }
        } else if (gameState.phase === 'pick7') {
          doEndTurn();
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [gameState.cur, gameState.phase, gameState.rolled, gameState.autoRoll, isMultiplayer, isMyTurn]);

  const closeModal = () => {
    if (modalTimer.current) clearTimeout(modalTimer.current);
    setModal(null);
  };

  const syncGame = useCallback((newState: GameState) => {
    if (socket && roomId) {
      socket.emit('sync-game', { roomId, G: newState });
    }
  }, [socket, roomId]);

  const updateGameState = useCallback((updater: (prev: GameState) => GameState, saveToStorage: boolean = false) => {
    setGameState(prev => {
      const clonedPrev = JSON.parse(JSON.stringify(prev)) as GameState;
      const next = updater(clonedPrev);
      if (isMultiplayer) syncGame(next);
      
      if (saveToStorage && typeof window !== 'undefined' && !isMultiplayer && next.phase !== 'setup' && next.phase !== 'waiting') {
        setTimeout(() => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            setHasSavedGame(true);
          } catch (e) {
            console.error("Failed to save game", e);
          }
        }, 500);
      }
      return next;
    });
  }, [isMultiplayer, syncGame]);

  const initSocket = useCallback(() => {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const socketUrl = isLocal ? 'http://localhost:3001' : 'https://pizza-game-server.onrender.com';
    const newSocket = io(socketUrl);
    
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });

    newSocket.on('game-updated', (newG: GameState) => {
      setGameState(newG);
    });

    newSocket.on('player-joined', ({ players, gameState: remoteG }: { players: RoomPlayer[], gameState: GameState | null }) => {
      setRoomPlayers(players);
      if (remoteG) {
        setGameState(remoteG);
      }
    });

    newSocket.on('trade-request', (offer: any) => {
      setPendingTradeOffer(offer);
    });

    newSocket.on('trade-response', ({ accepted }: { accepted: boolean }) => {
      const offer = pendingOutgoingOffer.current;
      pendingOutgoingOffer.current = null;
      if (accepted && offer) {
        setGameState(prev => {
          const next = JSON.parse(JSON.stringify(prev)) as GameState;
          const p = next.players[next.cur];
          const opIdx = next.players.findIndex((_p: any) => _p.name === offer.opName);
          const op = next.players[opIdx];
          if (!op) return prev;
          Object.entries(offer.give || {}).forEach(([t, arr]: any) => {
            p.hand[t as IngredientType] = (p.hand[t as IngredientType] || 0) - (arr?.length || 0);
            op.hand[t as IngredientType] = (op.hand[t as IngredientType] || 0) + (arr?.length || 0);
          });
          Object.entries(offer.take || {}).forEach(([t, arr]: any) => {
            op.hand[t as IngredientType] = (op.hand[t as IngredientType] || 0) - (arr?.length || 0);
            p.hand[t as IngredientType] = (p.hand[t as IngredientType] || 0) + (arr?.length || 0);
          });
          return next;
        });
        closeModal();
      } else {
        showModal(
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem' }}>❌</div>
            <div className="modal-title">חבל</div>
            <div className="modal-sub">ההצעה שלך נדחתה</div>
            <button className="start-btn" onClick={closeModal}>סגור</button>
          </div>
        );
      }
    });

    setSocket(newSocket);
    return newSocket;
  }, []);

  const notifyTurn = (player: Player) => {
    if (isMultiplayer) return;
    showModal(
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🍕</div>
        <div className="modal-title" style={{ color: player.color, fontSize: '2.5rem' }}>התור של {player.name}</div>
        <div className="modal-sub">הכן את הפיצות הטובות ביותר בעיר!</div>
        <button className="start-btn" onClick={closeModal}>קדימה!</button>
      </div>
    );
    if (player.isAuto) {
      setTimeout(() => {
        closeModal();
      }, 1500);
    }
  };

  const doRoll = () => {
    if (gameState.phase !== 'roll' || gameState.rolled) return;
    window.scrollTo(0, document.body.scrollHeight);
    updateGameState(prev => ({ ...prev, rolled: true, lastRoll: null, autoRoll: false }));

    let cycles = 0;
    const TOTAL_CYCLES = 10;
    const anim = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        dice: [rnd(1, 6), rnd(1, 6)]
      }));
      cycles++;
      if (cycles >= TOTAL_CYCLES) {
        clearInterval(anim);
        const d1 = rnd(1, 6);
        const d2 = rnd(1, 6);
        handleRollResult(d1, d2);
      }
    }, 70);
  };

  const showPick7Modal = (state?: GameState) => {
    const currentState = state || gameState;
    const availableInBank = ALL_TYPES.filter(t => (currentState.bank[t] || 0) > 0);
    
    showModal(
      <div>
        <div className="modal-title">🎲 יצא 7!</div>
        <div className="modal-sub">בחר קלף מצרך לקחת מהקופה</div>
        <div className="modal-grid">
          {availableInBank.map(t => (
            <div key={t} className="modal-item" onClick={() => {
              updateGameState(prev => {
                const next = { ...prev };
                const curP = next.players[next.cur];
                if ((next.bank[t] || 0) > 0) {
                   curP.hand[t] = (curP.hand[t] || 0) + 1;
                   next.bank[t] = (next.bank[t] || 0) - 1;
                }
                next.phase = 'action';
                return next;
              });
              closeModal();
            }}>
              <div className="modal-item-img-wrap"><img src={INGREDIENTS[t].img} alt={t} /></div>
              <div className="modal-item-label">{INGREDIENTS[t].name} ({currentState.bank[t]})</div>
            </div>
          ))}
        </div>
        <button className="modal-close" onClick={closeModal}>צפייה בלוח (סגור)</button>
      </div>
    );
  };

  const handleRollResult = (d1: number, d2: number) => {
    const sum = d1 + d2;
    updateGameState(prev => {
      let next: GameState = { 
        ...prev, 
        dice: [d1, d2] as [number, number], 
        lastRoll: { sum, results: [] as { playerIdx: number; type: IngredientType }[] } 
      };
      
      if (sum === 7) {
        const p = next.players[next.cur];
        if (p.isAuto) {
          // AI automatically re-rolls on 7 since it can't pick yet.
          next.rolled = false; 
          next.phase = 'roll';
          next.autoRoll = true;
          return next;
        }
        next.phase = 'pick7';
        setTimeout(() => {
          showPick7Modal(next);
          const activeArea = document.getElementById('active-area');
          if (activeArea) activeArea.scrollTo({ top: activeArea.scrollHeight, behavior: 'smooth' });
        }, 100);
      } else {
        const gotResult = distributeIngredients(next, sum);
        if (!gotResult) {
          // Nobody got anything, we set up for an automatic re-roll.
          next.rolled = false;
          next.phase = 'roll';
          next.autoRoll = true;
        } else {
          next.phase = 'action';
          setTimeout(() => {
            const activeArea = document.getElementById('active-area');
            if (activeArea) activeArea.scrollTo({ top: activeArea.scrollHeight, behavior: 'smooth' });
          }, 100);
        }
      }
      return next;
    });
  };

  const distributeIngredients = (state: GameState, sum: number) => {
    let got = false;
    state.players.forEach((p, playerIdx) => {
      p.slots.forEach(s => {
        const bankCount = state.bank[s.type] || 0;
        if (s.nums.includes(sum) && bankCount > 0) {
          p.hand[s.type] = (p.hand[s.type] || 0) + 1;
          state.bank[s.type] = bankCount - 1;
          state.lastRoll?.results.push({ playerIdx, type: s.type });
          got = true;
        }
      });
    });
    return got;
  };

  const doEndTurn = () => {
    updateGameState(prev => {
      const next = { ...prev };
      next.actionsDrawerOpen = false;
      if (next.extraTurn) {
        next.extraTurn = false;
      } else {
        next.cur = (next.cur + 1) % next.players.length;
        if (next.cur === 0) next.round++;
      }
      next.phase = 'roll';
      next.rolled = false;
      next.lastRoll = null;
      
      setTimeout(() => {
        notifyTurn(next.players[next.cur]);
      }, 10);

      return next;
    }, true);
  };

  const doBake = () => {
    updateGameState(prev => {
      const next = { ...prev };
      const p = next.players[next.cur];
      if (!p.customer) return prev;
      
      const canFulfill = (p.customer.req as IngredientType[]).every(t => (p.hand[t] || 0) >= 1);
      if (!canFulfill) return prev;

      (p.customer.req as IngredientType[]).forEach(t => {
        p.hand[t] = Math.max(0, (p.hand[t] || 0) - 1);
        next.bank[t] = (next.bank[t] || 0) + 1;
      });

      if (!p.isAuto) p.coins += p.customer.req.length;
      p.score += p.customer.req.length;

      if (next.winMode === 'score' && p.score >= WIN_SCORE) {
        next.phase = 'gameover';
      } else {
        if (!next.custDeck.length) {
          next.custDeck = shuffle(CUSTOMERS.filter(c => c.id !== 'c01'));
        }

        if (p.isAuto) {
          // AI players only get basic customers (no toppings) so they don't get stuck
          const basicIdx = next.custDeck.findIndex(c => 
            c.req.every((r: any) => INGREDIENTS[r as IngredientType].basic)
          );
          if (basicIdx !== -1) {
            p.customer = { ...next.custDeck.splice(basicIdx, 1)[0] };
          } else {
            p.customer = { ...BASIC_CUSTOMER };
          }
        } else {
          p.customer = { ...next.custDeck.shift() };
        }
      }
      return next;
    });
  };

  const doBuySlot = () => {
    const p = gameState.players[gameState.cur];
    if (p.coins < 6) return;
    const allToppings: IngredientType[] = ['ONION', 'MUSHROOMS', 'OLIVES', 'BULGARIAN', 'HOT_PEPPER'];
    const owned = new Set(p.slots.map(s => s.type));
    const available = allToppings.filter(t => !owned.has(t));

    if (!available.length) {
      showModal(
        <div style={{ textAlign: 'center' }}>
          <div className="modal-title">אין מצרכים זמינים</div>
          <div className="modal-sub">כבר יש לך את כל התוספות האפשריות!</div>
          <button className="modal-close" onClick={closeModal}>סגור</button>
        </div>
      );
      return;
    }

    const items = available.map(t => (
      <div key={t} className="modal-item" onClick={() => {
        updateGameState(prev => {
          const next = { ...prev };
          const curP = next.players[next.cur];
          const allNums = new Set(curP.slots.flatMap(s => s.nums));
          let availableNums = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12].filter(n => !allNums.has(n));
          if (availableNums.length === 0) availableNums = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
          const num = availableNums[Math.floor(Math.random() * availableNums.length)];
          curP.coins -= 6;
          curP.slots.push({ type: t, nums: [num] });
          return next;
        });
        closeModal();
      }}>
        <div className="modal-item-img-wrap"><img src={INGREDIENTS[t].img} alt={t} /></div>
        <div className="modal-item-label">{INGREDIENTS[t].name}</div>
      </div>
    ));

    showModal(
      <div>
        <div className="modal-title">מצרך חדש ללוח (6 מטבעות)</div>
        <div className="modal-sub">בחר סוג תוספת</div>
        <div className="modal-grid">{items}</div>
        <button className="modal-close" onClick={closeModal}>ביטול</button>
      </div>
    );
  };

  const doBuyNumber = () => {
    const p = gameState.players[gameState.cur];
    if (p.coins < 4) return;
    const items = p.slots.map((s, i) => (
      <div key={i} className="modal-item" onClick={() => {
        updateGameState(prev => {
          const next = { ...prev };
          const curP = next.players[next.cur];
          const slot = curP.slots[i];
          const allNums = new Set(curP.slots.flatMap(s => s.nums));
          let availableNums = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12].filter(n => !allNums.has(n));
          if (availableNums.length === 0) availableNums = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12].filter(n => !slot.nums.includes(n));
          const num = availableNums.length > 0 ? availableNums[Math.floor(Math.random() * availableNums.length)] : rnd(2, 12);
          curP.coins -= 4;
          slot.nums.push(num);
          return next;
        });
        closeModal();
      }}>
        <div className="modal-item-img-wrap"><img src={INGREDIENTS[s.type].img} alt={s.type} /></div>
        <div className="modal-item-label">{INGREDIENTS[s.type].name}<br/><small>{s.nums.join(', ')}</small></div>
      </div>
    ));

    showModal(
      <div>
        <div className="modal-title">🔢 מספר נוסף (4🪙)</div>
        <div className="modal-sub">בחר מלבן להוסיף מספר</div>
        <div className="modal-grid">{items}</div>
        <button className="modal-close" onClick={closeModal}>ביטול</button>
      </div>
    );
  };

  const doPickSurprise = () => {
    if (gameState.players[gameState.cur].coins < 3 || !gameState.srpDeck.length) return;
    updateGameState(prev => {
      const next = { ...prev };
      const curP = next.players[next.cur];
      curP.coins -= 3;
      const card = next.srpDeck.shift();
      curP.surprises.push(card);
      return next;
    });
  };

  const doExchange = () => {
    setTradeState({ ...tradeState, modal: 'tradeCenter', actionSource: 'trade' });
  };

  const renderTradeModal = () => {
    if (!tradeState.modal) return null;
    
    const startExchangeBank = () => setTradeState(prev => ({ ...prev, modal: 'bankTrade', give: {} }));
    
    const selectIngredientToGivePlayer = (id: number) => {
      setTradeState(prev => ({ ...prev, modal: 'multiTradeGive', otherId: id, give: {}, take: {} }));
    };

    const toggleTradeItemGive = (type: IngredientType, idx: number) => {
      setTradeState(prev => {
        const nextGive = { ...prev.give };
        const arr = nextGive[type] ? [...nextGive[type]!] : [];
        if (arr.includes(idx)) {
          const filtered = arr.filter(i => i !== idx);
          if (filtered.length === 0) delete nextGive[type];
          else nextGive[type] = filtered;
        } else {
          arr.push(idx);
          nextGive[type] = arr;
        }
        return { ...prev, give: nextGive };
      });
    };

    const toggleTradeItemTake = (type: IngredientType, idx: number) => {
      setTradeState(prev => {
        const nextTake = { ...prev.take };
        const arr = nextTake[type] ? [...nextTake[type]!] : [];
        if (arr.includes(idx)) {
          const filtered = arr.filter(i => i !== idx);
          if (filtered.length === 0) delete nextTake[type];
          else nextTake[type] = filtered;
        } else {
          arr.push(idx);
          nextTake[type] = arr;
        }
        return { ...prev, take: nextTake };
      });
    };

    const confirmPlayerExchange = () => {
      updateGameState(prev => {
        const next = { ...prev };
        const p = next.players[next.cur];
        const op = next.players[tradeState.otherId];
        Object.entries(tradeState.give).forEach(([t, arr]) => {
          if (!arr) return;
          p.hand[t as IngredientType] = (p.hand[t as IngredientType] || 0) - arr.length;
          op.hand[t as IngredientType] = (op.hand[t as IngredientType] || 0) + arr.length;
        });
        Object.entries(tradeState.take).forEach(([t, arr]) => {
          if (!arr) return;
          op.hand[t as IngredientType] = (op.hand[t as IngredientType] || 0) - arr.length;
          p.hand[t as IngredientType] = (p.hand[t as IngredientType] || 0) + arr.length;
        });
        return next;
      });
      showModal(
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem' }}>🤝</div>
          <div className="modal-title">החלפה בוצעה!</div>
          <div className="modal-sub">העסקה הושלמה בהצלחה</div>
          <br/><button className="start-btn" onClick={closeModal}>המשך</button>
        </div>
      );
      closeTradeModal();
    };

    const sendTradeRequestOnline = () => {
      const op = gameState.players[tradeState.otherId];
      const opRoomPlayer = roomPlayers.find(rp => rp.name === op.name);
      if (!opRoomPlayer || !socket) return;
      const offer = {
        fromName: gameState.players[gameState.cur].name,
        opName: op.name,
        give: tradeState.give,
        take: tradeState.take,
        fromSocketId: socket.id,
        gameStateCur: gameState.cur,
        otherId: tradeState.otherId,
      };
      pendingOutgoingOffer.current = offer;
      socket.emit('trade-request', { toSocketId: opRoomPlayer.socketId, tradeOffer: offer });
      closeTradeModal();
      showModal(
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>⏳</div>
          <div className="modal-title">ממתין לתגובה...</div>
          <div className="modal-sub">הבקשה נשלחה ל{op.name}</div>
          <button className="modal-close" onClick={() => {
            pendingOutgoingOffer.current = null;
            closeModal();
          }}>ביטול</button>
        </div>
      );
    };


    const toggleBankTradeItem = (type: IngredientType, idx: number) => {
      setTradeState(prev => {
        let nextGive = { ...prev.give };
        const existingType = Object.keys(nextGive)[0];
        if (existingType && existingType !== type) nextGive = {};
        
        const arr = nextGive[type] ? [...nextGive[type]!] : [];
        if (arr.includes(idx)) {
          const filtered = arr.filter(i => i !== idx);
          if (filtered.length === 0) delete nextGive[type];
          else nextGive[type] = filtered;
        } else {
          arr.push(idx);
          nextGive[type] = arr;
        }
        return { ...prev, give: nextGive };
      });
    };

    const closeTradeModal = () => setTradeState({ modal: null, otherId: -1, give: {}, take: {}, actionSource: 'trade' });
    
    const p = gameState.players[gameState.cur];

    if (tradeState.modal === 'tradeCenter') {
      const otherPlayers = gameState.players.filter((_, i) => i !== gameState.cur);
      return (
        <div id="modal-overlay" onClick={closeTradeModal}>
          <div id="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">מרכז ההחלפות</div>
            <div className="modal-sub">בחר שחקן או את הקופה כדי להתחיל סחר</div>
            
            <div className="trade-selection-grid">
              <div className="trade-option-card" onClick={startExchangeBank}>
                <div className="trade-option-icon">🏦</div>
                <div className="trade-option-info">
                  <div className="trade-option-title">החלפה עם הקופה</div>
                  <div className="trade-option-desc">יחס של 3:1 (בסיסי) או 2:1 (תוספות)</div>
                  <div className="trade-player-badge" style={{ background: 'var(--gold)33', color: 'var(--gold)' }}>קופה זמינה</div>
                </div>
              </div>
              {otherPlayers.map(op => {
                return (
                  <div key={op.id} className="trade-option-card" onClick={() => selectIngredientToGivePlayer(op.id)}>
                    <div className="trade-option-icon">👤</div>
                    <div className="trade-option-info">
                      <div className="trade-option-title">החלפה עם {op.name}</div>
                      <div className="trade-option-desc">סחר חליפין (דורש אישור)</div>
                      <div className="trade-player-badge" style={{ background: `${op.color}33`, color: op.color }}>שחקן פעיל</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button className="modal-close" onClick={closeTradeModal}>ביטול</button>
          </div>
        </div>
      );
    }

    if (tradeState.modal === 'bankTrade') {
      const selectedEntries = Object.entries(tradeState.give);
      let canProceed = false;
      let selectedType: string | null = null;
      if (selectedEntries.length === 1) {
        const t = selectedEntries[0][0] as IngredientType;
        const arr = selectedEntries[0][1] as number[];
        const isBasic = INGREDIENTS[t].basic;
        if ((isBasic && arr.length === 3) || (!isBasic && arr.length === 2)) {
          canProceed = true;
          selectedType = t;
        }
      }

      const confirmGiveExchangeBank = (giveType: string) => {
         const items = ALL_TYPES.filter(t => (gameState.bank[t] || 0) > 0).map(t => (
            <div key={t} className="modal-item" onClick={() => {
               updateGameState(prev => {
                 const next = { ...prev };
                 const curP = next.players[next.cur];
                 const isBasic = INGREDIENTS[giveType as IngredientType].basic;
                 const countToRemove = isBasic ? 3 : 2;
                 curP.hand[giveType as IngredientType] = (curP.hand[giveType as IngredientType] || 0) - countToRemove;
                 next.bank[giveType as IngredientType] = (next.bank[giveType as IngredientType] || 0) + countToRemove;
                 curP.hand[t] = (curP.hand[t] || 0) + 1;
                 next.bank[t] = (next.bank[t] || 0) - 1;
                 return next;
               });
               closeModal();
               closeTradeModal();
            }}>
              <div className="modal-item-img-wrap"><img src={INGREDIENTS[t].img} alt={t}/></div>
              <div className="modal-item-label">{INGREDIENTS[t].name} ({(gameState.bank[t] || 0)})</div>
            </div>
         ));
         
         const html = (
           <div>
             <div className="modal-title">🏦 החלפה עם הקופה</div>
             <div className="modal-sub">בחר מה תרצה לקבל בתמורה ל-{INGREDIENTS[giveType as IngredientType].name}</div>
             <div className="modal-grid">{items}</div>
             <button className="modal-close" onClick={closeModal}>ביטול</button>
           </div>
         );
         showModal(html, 0);
      };

      return (
        <div id="modal-overlay" onClick={closeTradeModal}>
          <div id="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🏦 החלפה עם הקופה</div>
            <div className="modal-sub">בחר 3 קלפי בסיס זהים או 2 תוספות זהות</div>
            <div className="trade-cards-grid">
              <HandFan hand={p.hand} selectedMap={tradeState.give} onToggle={toggleBankTradeItem} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="start-btn" style={{ flex: 2 }} onClick={() => selectedType && confirmGiveExchangeBank(selectedType)} disabled={!canProceed}>
                {canProceed ? `קבל מוצר בתמורה ל${INGREDIENTS[selectedType as IngredientType].name}` : 'בחר מצרכים להחלפה...'}
              </button>
              <button className="modal-close" style={{ flex: 1 }} onClick={() => setTradeState(prev => ({...prev, modal: 'tradeCenter'}))}>חזור</button>
            </div>
          </div>
        </div>
      );
    }

    if (tradeState.modal === 'multiTradeGive') {
      const op = gameState.players[tradeState.otherId];
      const totalGive = Object.values(tradeState.give).reduce((a, s) => a + (s?.length || 0), 0);
      return (
        <div id="modal-overlay" onClick={closeTradeModal}>
          <div id="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">מה תרצה לתת?</div>
            <div className="modal-sub">בחר מתוך המניפה את המצרכים למסור ל{op.name}</div>
            <div className="trade-cards-grid"><HandFan hand={p.hand} selectedMap={tradeState.give} onToggle={toggleTradeItemGive} /></div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="start-btn" style={{ flex: 2 }} onClick={() => setTradeState(prev => ({...prev, modal: 'multiTradeTake'}))}>מה תרצה לקחת?</button>
              <button className="modal-close" style={{ flex: 1 }} onClick={closeTradeModal}>ביטול</button>
            </div>
          </div>
        </div>
      );
    }

    if (tradeState.modal === 'multiTradeTake') {
      const op = gameState.players[tradeState.otherId];
      const totalTake = Object.values(tradeState.take).reduce((a, s) => a + (s?.length || 0), 0);
      const totalGive = Object.values(tradeState.give).reduce((a, s) => a + (s?.length || 0), 0);
      return (
        <div id="modal-overlay" onClick={closeTradeModal}>
          <div id="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">מה תרצה לקבל?</div>
            <div className="modal-sub">בחר מתוך המניפה את המצרכים לקחת מ{op.name}</div>
            <div className="trade-cards-grid"><HandFan hand={op.hand} selectedMap={tradeState.take} onToggle={toggleTradeItemTake} /></div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="start-btn" style={{ flex: 2 }} onClick={() => setTradeState(prev => ({...prev, modal: 'tradeApproval'}))} disabled={totalGive === 0 && totalTake === 0}>שלח הצעה ל{op.name} 🤝</button>
              <button className="modal-close" style={{ flex: 1 }} onClick={() => setTradeState(prev => ({...prev, modal: 'multiTradeGive'}))}>חזור</button>
            </div>
          </div>
        </div>
      );
    }

    if (tradeState.modal === 'tradeApproval') {
      const op = gameState.players[tradeState.otherId];
      const renderSummary = (map: Partial<Record<IngredientType, number[]>>) => 
        Object.entries(map).map(([t, arr]) => arr && arr.length > 0 ? (
          <div key={t} className="trade-summary-item"><img src={INGREDIENTS[t as IngredientType].img} className="ing-icon small" alt=""/> {INGREDIENTS[t as IngredientType].name} x{arr.length}</div>
        ) : null);

      if (isMultiplayer) {
        return (
          <div id="modal-overlay" onClick={closeTradeModal}>
            <div id="modal-box" onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ fontSize: '4rem' }}>🤝</div>
                <div className="modal-title">שליחת הצעת החלפה</div>
                <div className="modal-sub">שלח את ההצעה הבאה ל<strong style={{ color: op.color }}>{op.name}</strong>:</div>
                <div style={{ background: 'rgba(255,140,60,0.05)', borderRadius: '12px', padding: '15px', margin: '15px 0', textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'var(--gold)' }}>אתה נותן:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>{renderSummary(tradeState.give)}</div>
                  <div style={{ fontWeight: 'bold', margin: '20px 0 10px', color: 'var(--gold)' }}>אתה מקבל:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>{renderSummary(tradeState.take)}</div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="start-btn" style={{ flex: 2 }} onClick={sendTradeRequestOnline}>שלח הצעה</button>
                  <button className="modal-close" style={{ flex: 1 }} onClick={closeTradeModal}>ביטול</button>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div id="modal-overlay" onClick={closeTradeModal}>
          <div id="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '10px' }}>
              <div style={{ fontSize: '4rem' }}>🤝</div>
              <div className="modal-title">בקשת החלפה רב-מצרכית!</div>
              <div className="modal-sub"><strong style={{ color: p.color }}>{p.name}</strong> מציע לך עסקה:</div>
              
              <div style={{ background: 'rgba(255,140,60,0.05)', borderRadius: '12px', padding: '15px', margin: '15px 0', textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'var(--green)' }}>מה שתקבל.י:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>{renderSummary(tradeState.give)}</div>
                <div style={{ fontWeight: 'bold', margin: '20px 0 10px', color: 'var(--red)' }}>מה שתיתנ.י:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>{renderSummary(tradeState.take)}</div>
              </div>
              <div style={{ fontSize: '1rem', color: 'var(--text)', margin: '25px 0 15px' }}>האם <span style={{ color: op.color, fontWeight: 900 }}>{op.name}</span> מאשר/ת?</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="start-btn" style={{ flex: 2 }} onClick={confirmPlayerExchange}>מאשר.ת!</button>
                <button className="modal-close" style={{ flex: 1 }} onClick={closeTradeModal}>מסרב.ת</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (tradeState.modal === 'stealPlayerSelect') {
       const otherPlayers = gameState.players.filter((_, i) => i !== gameState.cur && Object.values(_.hand).some(c => (c || 0) > 0));
       if (otherPlayers.length === 0) {
          return (
             <div id="modal-overlay" onClick={closeTradeModal}>
                <div id="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
                   <div className="modal-title">אין ממי לגנוב!</div>
                   <div className="modal-sub">לאף שחקן אחר אין מצרכים.</div>
                   <button className="modal-close" onClick={closeTradeModal}>חזור</button>
                </div>
             </div>
          );
       }
       return (
        <div id="modal-overlay" onClick={closeTradeModal}>
          <div id="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">גנבת קלף!</div>
            <div className="modal-sub">בחר שחקן לגנוב ממנו חומר קלף אחד:</div>
            <div className="trade-selection-grid">
              {otherPlayers.map(op => (
                <div key={op.id} className="trade-option-card" onClick={() => setTradeState(prev => ({...prev, modal: 'stealTake', otherId: op.id}))}>
                  <div className="trade-option-icon">🦹</div>
                  <div className="trade-option-info">
                    <div className="trade-option-title">מעניין מה יש ל{op.name}...</div>
                    <div className="trade-player-badge" style={{ background: `${op.color}33`, color: op.color }}>הצג מניפה</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="modal-close" onClick={closeTradeModal}>ביטול</button>
          </div>
        </div>
       );
    }

    if (tradeState.modal === 'stealTake') {
       const op = gameState.players[tradeState.otherId];
       const totalTake = Object.values(tradeState.take).reduce((a, s) => a + (s?.length || 0), 0);
       const confirmSteal = () => {
          updateGameState(prev => {
             const next = { ...prev };
             const curP = next.players[next.cur];
             const vict = next.players[tradeState.otherId];
             Object.entries(tradeState.take).forEach(([t, arr]) => {
                if (arr && arr.length > 0) {
                   vict.hand[t as IngredientType] = (vict.hand[t as IngredientType] || 0) - arr.length;
                   curP.hand[t as IngredientType] = (curP.hand[t as IngredientType] || 0) + arr.length;
                }
             });
             const cardIdx = curP.surprises.findIndex(s => s.effect === 'STEAL_ANY_ONE');
             if (cardIdx !== -1) curP.surprises.splice(cardIdx, 1);
             return next;
          });
          closeTradeModal();
       };
       return (
        <div id="modal-overlay" onClick={closeTradeModal}>
          <div id="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">איזה קלף תגנוב?</div>
            <div className="modal-sub">בחר קלף מהמניפה של {op.name}</div>
            <div className="trade-cards-grid"><HandFan hand={op.hand} selectedMap={tradeState.take} onToggle={(type, idx) => {
               setTradeState(prev => {
                  const arr = prev.take[type] || [];
                  if (arr.includes(idx)) return { ...prev, take: {} };
                  const newTake: Partial<Record<IngredientType, number[]>> = {};
                  newTake[type] = [idx];
                  return { ...prev, take: newTake };
               })
            }} /></div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="start-btn" style={{ flex: 2 }} onClick={confirmSteal} disabled={totalTake !== 1}>גנוב!</button>
              <button className="modal-close" style={{ flex: 1 }} onClick={() => setTradeState(prev => ({...prev, modal: 'stealPlayerSelect', take: {}}))}>חזור</button>
            </div>
          </div>
        </div>
       )
    }

    return null;
  };

  const startNewGame = (playersInput: {name: string, isAuto: boolean}[], winMode: 'score' | 'bank') => {
    const bank: Partial<Record<IngredientType, number>> = {};
    ALL_TYPES.forEach(t => bank[t] = INGREDIENTS[t].basic ? 40 : 25);

    const customers = shuffle(CUSTOMERS.filter(c => c.id !== 'c01'));
    const surprises = shuffle([...SURPRISE_POOL, ...SURPRISE_POOL, ...SURPRISE_POOL]);

    const rand2_12 = () => { let n; do { n = rnd(2, 12); } while (n === 7); return n; };
    
    const players: Player[] = playersInput.slice(0, playerCount).map((p, i) => {
      const initialNums: number[] = [];
      const getUniqueNum = () => {
         let available = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12].filter(n => !initialNums.includes(n));
         const n = available[Math.floor(Math.random() * available.length)];
         initialNums.push(n);
         return n;
      };
      
      return {
        id: i,
        name: p.name,
        color: PLAYER_COLORS[i],
        coins: 4,
        score: 0,
        slots: ['DOUGH', 'SAUCE', 'CHEESE'].map(t => ({ 
          type: t as IngredientType, 
          nums: [getUniqueNum()] 
        })),
        hand: {},
        customer: { ...BASIC_CUSTOMER },
        surprises: [],
        isAuto: p.isAuto,
      };
    });

    const newState: GameState = {
      ...gameState,
      players,
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
      winMode,
    };

    setGameState(newState);
    if (isMultiplayer) {
      syncGame(newState);
    } else if (typeof window !== 'undefined') {
      setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
          setHasSavedGame(true);
        } catch (e) {
          console.error("Failed to save game", e);
        }
      }, 500);
    }
    
    setTimeout(() => {
      notifyTurn(newState.players[newState.cur]);
    }, 10);
  };

  const handleStartFromSetup = () => {
    if (isMultiplayer) {
      if (!roomId || !playerName) {
        showModal(
          <div style={{ textAlign: 'center' }}>
            <div className="modal-title">חסרים פרטים</div>
            <div className="modal-sub">נא להזין מזהה חדר ואת השם שלך</div>
            <button className="modal-close" onClick={closeModal} style={{ marginTop: '20px' }}>סגור</button>
          </div>
        );
        return;
      }
      setGameState(prev => ({ ...prev, phase: 'waiting' }));
      let currentSocket = socket;
      if (!currentSocket) currentSocket = initSocket();
      currentSocket.emit('join-room', { roomId, playerName }, (response: any) => {
        if (response && response.error) {
          showModal(
            <div style={{ textAlign: 'center' }}>
              <div className="modal-title">שגיאה בפתיחת החדר</div>
              <div className="modal-sub">{response.error}</div>
              <button className="modal-close" onClick={() => {
                closeModal();
                setGameState(prev => ({ ...prev, phase: 'setup' }));
              }} style={{ marginTop: '20px' }}>חזור</button>
            </div>
          );
        }
      });
    } else {
      startNewGame(setupPlayerInfos, gameState.winMode);
    }
  };

  const renderSetup = () => {
    return (
      <div className="setup-screen">
        <div className="setup-title">🍕 פיצה בעיר</div>
        <div className="setup-card">
          <div className="setup-mode-tabs">
            <button 
              className={`tab-btn ${!isMultiplayer ? 'active' : ''}`}
              onClick={() => setIsMultiplayer(false)}
            >
              משחק מקומי
            </button>
            <button 
              className={`tab-btn ${isMultiplayer ? 'active' : ''}`}
              onClick={() => {
                setIsMultiplayer(true);
                if (!socket) initSocket();
              }}
            >
              משחק אונליין
            </button>
          </div>

          {!isMultiplayer ? (
            <div className="local-setup">
              <span className="setup-label">מספר שחקנים:</span>
              <div className="player-count-buttons">
                {[3, 4].map(n => (
                  <button 
                    key={n}
                    onClick={() => setPlayerCount(n)}
                    className={playerCount === n ? 'active' : ''}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <span className="setup-label">שמות השחקנים:</span>
              <div className="name-inputs">
                {Array.from({ length: playerCount }).map((_, i) => (
                  <div key={i} className="setup-player-row">
                    <input 
                      className="name-input"
                      value={setupPlayerInfos[i].name}
                      onChange={(e) => {
                        const newInfos = [...setupPlayerInfos];
                        newInfos[i].name = e.target.value;
                        setSetupPlayerInfos(newInfos);
                      }}
                      disabled={setupPlayerInfos[i].isAuto}
                    />
                    {i >= playerCount - 2 && (
                      <label className="auto-toggle" title="מחשב (AI)">
                        <input 
                          type="checkbox" 
                          checked={setupPlayerInfos[i].isAuto}
                          onChange={(e) => {
                            const newInfos = [...setupPlayerInfos];
                            newInfos[i].isAuto = e.target.checked;
                            if (e.target.checked) {
                              newInfos[i].name = i === playerCount - 1 ? 'בוט הבת' : 'בוט הבן';
                            } else {
                              newInfos[i].name = `שחקן ${String.fromCharCode(1488 + i)}`;
                            }
                            setSetupPlayerInfos(newInfos);
                          }}
                        /> 🤖
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="online-setup">
              <span className="setup-label">מזהה חדר:</span>
              <input 
                type="text" 
                className="name-input" 
                placeholder="למשל: pizza-123"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <span className="setup-label">השם שלך:</span>
              <input 
                type="text" 
                className="name-input" 
                placeholder="השם שלך"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
          )}

          <span className="setup-label" style={{ marginTop: '18px' }}>🎮 תנאי סיום משחק:</span>
          <div className="win-mode-buttons">
            <button 
              className={`win-mode-btn ${gameState.winMode === 'score' ? 'active' : ''}`}
              onClick={() => updateGameState(prev => ({ ...prev, winMode: 'score' }))}
            >
              <span style={{ fontSize: '1.4rem' }}>🏆</span>
              <span>{WIN_SCORE} נקודות</span>
            </button>
            <button 
              className={`win-mode-btn ${gameState.winMode === 'bank' ? 'active' : ''}`}
              onClick={() => updateGameState(prev => ({ ...prev, winMode: 'bank' }))}
            >
              <span style={{ fontSize: '1.4rem' }}>🃏</span>
              <span>סיום הקלפים בקופה</span>
            </button>
          </div>
          <button className="start-btn" onClick={handleStartFromSetup}>התחל משחק</button>
          {!isMultiplayer && hasSavedGame && (
            <button 
              className="start-btn" 
              style={{ marginTop: '12px', background: 'var(--bg3)', border: '2px solid var(--gold)', color: 'var(--gold)', boxShadow: 'none' }} 
              onClick={loadGameFromStorage}
            >
              המשך משחק קודם
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderWaitingRoom = () => {
    const isHost = roomPlayers[0] && roomPlayers[0].socketId === socket?.id;
    return (
      <div className="setup-screen">
        <div className="setup-title">⏳ חדר המתנה</div>
        <div className="setup-card">
          <div className="modal-sub" style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '24px' }}>
            חדר: <strong style={{ color: 'var(--gold)' }}>{roomId}</strong>
          </div>
          <div className="waiting-list">
            {roomPlayers.map((p, idx) => (
              <div key={idx} className="player-waiting-row">
                <span className="status-dot online"></span>
                <span>{p.name} {p.socketId === socket?.id ? '(את/ה)' : ''}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '24px' }}>
            {roomPlayers.length < 2 ? (
              <div className="setup-mode-desc">מחכים לשחקנים נוספים...</div>
            ) : isHost ? (
              <button className="start-btn" onClick={() => startNewGame(roomPlayers.map(p => ({ name: p.name, isAuto: false })), gameState.winMode)}>התחל משחק!</button>
            ) : (
              <div className="setup-mode-desc">מחכים שהמארח יתחיל את המשחק...</div>
            )}
          </div>
          <button className="modal-close" style={{ marginTop: '16px' }} onClick={() => updateGameState(prev => ({ ...prev, phase: 'setup' }))}>ביטול וחזרה</button>
        </div>
      </div>
    );
  };

  const renderWin = () => {
    const winners = [...gameState.players].sort((a, b) => b.score - a.score || b.coins - a.coins);
    const p = winners[0];
    return (
      <div className="setup-screen">
        <div className="win-emoji" style={{ fontSize: '6rem' }}>🏆</div>
        <div className="win-title" style={{ color: 'var(--gold)', fontSize: '3rem', fontWeight: 900 }}>יש לנו מנצח!</div>
        <div className="win-name" style={{ color: p.color, fontSize: '2rem' }}>{p.name}</div>
        <div style={{ width: '100%', maxWidth: '340px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px 16px', margin: '10px auto 24px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '8px' }}>טבלת תוצאות</div>
          {winners.map((pl, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ color: pl.color, fontWeight: 800 }}>{pl.name}</span>
              <span style={{ color: 'var(--gold)' }}>{pl.score} נקודות</span>
            </div>
          ))}
        </div>
        <button className="start-btn" onClick={() => updateGameState(prev => ({ ...prev, phase: 'setup' }))}>משחק חדש</button>
      </div>
    );
  };

  const toggleSidePanel = () => {
    updateGameState(prev => ({ ...prev, sidePanelOpen: !prev.sidePanelOpen }));
  };

  const toggleActionsDrawer = () => {
    updateGameState(prev => ({ ...prev, actionsDrawerOpen: !prev.actionsDrawerOpen }));
  };

  const renderGame = () => {
    const turnP = gameState.players[gameState.cur];
    const myP = isMultiplayer && myPlayerIndex !== -1 ? gameState.players[myPlayerIndex] : turnP;
    const p = myP; // Render the local player's board (or the current turn player's if local)
    if (!p) return null;

    const basicIngs: IngredientType[] = ['DOUGH', 'SAUCE', 'CHEESE'];
    const hasBasicReq = p.customer?.req.every((r: IngredientType) => basicIngs.includes(r));
    const pHasBasic = basicIngs.every((b) => (p.hand[b] || 0) >= 1);

    const canBake = !!(p.customer && (p.customer.req as IngredientType[]).every(t => (p.hand[t] || 0) >= 1));
    const canExchange = Object.values(p.hand).reduce((sum, count) => (sum as number) + ((count as number) || 0), 0) >= 1;
    const canPickSurprise = p.coins >= 3 && gameState.srpDeck.length > 0;
    const allToppings: IngredientType[] = ['ONION', 'MUSHROOMS', 'OLIVES', 'BULGARIAN', 'HOT_PEPPER'];
    const canBuySlot = p.coins >= 6 && allToppings.filter(t => !p.slots.find(s => s.type === t)).length > 0;

    return (
      <div className={`game-screen ${heebo.className}`}>
        <header id="game-header">
          <div className="header-left">
            <button className="hamburger-btn" onClick={toggleSidePanel}>☰</button>
            <div className="header-title">פיצה בעיר</div>
          </div>
          <div className="header-round">סיבוב {gameState.round}</div>
          <div className="header-info">
            תור: <strong style={{ color: turnP.color }}>{turnP.name}</strong>
          </div>
        </header>

        <div id="players-strip">
          {gameState.players.map((pl, i) => (
            <div key={i} className={`player-chip ${i === gameState.cur ? 'active' : ''}`}>
              <div className="chip-name" style={{ color: pl.color }}>
                {pl.name}
                <span className="chip-score">{pl.score}{gameState.winMode !== 'bank' ? `/${WIN_SCORE}` : ''}</span>
              </div>
              <div className="chip-coins">
                <CoinsHTML coins={pl.coins} />
              </div>
            </div>
          ))}
        </div>

        <div id="play-area">
          <div id="active-area">
            <div className="board-wrapper">
              <div className="board-top-bar">
                <span className="board-player-label" style={{ color: p.color }}>{p.name}</span>
                <span className="board-score-badge">🏆 {p.score}/{WIN_SCORE}</span>
              </div>
              <div className="board-body-row">
                <div className="board-cust-col">
                  {p.customer && (
                    <div className="board-cust-body">
                      <div className="board-cust-header">
                        <div className="board-cust-img">
                          <img src={`/pizza-game/assets/${p.customer.gender === 'f' ? 'female' : 'male'}-customer-removebg-preview.png`} alt={p.customer.name} />
                        </div>
                        <div className="board-cust-name">{p.customer.name}</div>
                        <div className="board-cust-quote">{`"${p.customer.quote}"`}</div>
                      </div>
                      <div className="board-cust-needs">
                        <div className={`board-cust-need-pizza ${pHasBasic ? 'have' : ''}`} title="פיצה בסיסית">
                          <img src="/pizza-game/assets/pizza-removebg-preview.png" alt="פיצה" />
                        </div>
                        {(p.customer.req as IngredientType[]).filter(r => !basicIngs.includes(r)).map((t, idx) => (
                           <span key={idx} className={`board-cust-need${(p.hand[t] || 0) >= 1 ? ' have' : ''}`}>
                             <img src={INGREDIENTS[t].img} className="ing-icon tiny" alt={t} />
                           </span>
                        ))}
                      </div>
                      <div className="board-cust-price">{'🪙'.repeat(p.customer.req.length)}</div>
                    </div>
                  )}
                </div>
                
                <div className="board-slots-area">
                  <div className="board-slots-inner-row">
                    <div className="ing-slots-wrap">
                      <div className="ing-awning-full"></div>
                      <div className="ing-slots-row">
                        {p.slots.map((s, idx) => (
                          <div key={idx} className="ing-slot" data-type={s.type}>
                            <div className="ing-body">
                              <div className="ing-name">{INGREDIENTS[s.type].name}</div>
                              <div className="ing-img-bg"><img src={INGREDIENTS[s.type].img} alt={String(s.type)} /></div>
                              <div className="ing-cards">
                                {s.nums.map((n, i) => <div key={i} className="ing-card">{n}</div>)}
                              </div>
                              <div className="cards-stack">
                                {Array.from({ length: p.hand[s.type] || 0 }).map((_, i) => (
                                  <div key={i} className="stacked-card" style={{ top: `${i * 4}px`, zIndex: i + 1 }}>
                                    <div className="stacked-card-img-wrap">
                                      <img src={INGREDIENTS[s.type].img} alt={s.type} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="board-bottom-bar">
                    <div className="board-coins-row">
                      <CoinsHTML coins={p.coins} />
                    </div>
                    <div className="extra-hand-area">
                      {ALL_TYPES.filter(t => (p.hand[t] || 0) > 0 && !p.slots.map(s => s.type).includes(t)).map(t => (
                        <div key={t} className="extra-hand-stack">
                           <div className="cards-stack">
                            {Array.from({ length: p.hand[t] || 0 }).map((_, i) => (
                              <div key={i} className="stacked-card" style={{ top: `${i * 4}px`, zIndex: i + 1 }}>
                                <div className="stacked-card-img-wrap">
                                  <img src={INGREDIENTS[t].img} alt={t} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>



            <div id="controls-row" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
               <div id="dice-area">
                 <div className="dice-row">
                   <DieFace value={gameState.dice[0]} rolling={gameState.rolled && !gameState.lastRoll} />
                   <DieFace value={gameState.dice[1]} rolling={gameState.rolled && !gameState.lastRoll} />
                 </div>
                 {gameState.lastRoll && (
                   <div className="roll-results">
                     <div className="roll-results-title"> יצא {gameState.lastRoll.sum}</div>
                     {gameState.lastRoll.sum === 7 ? (
                       <div className="roll-result-item">
                         <strong>{gameState.players[gameState.cur].isAuto ? 'מטיל שוב...' : 'בחר מצרך!'}</strong>
                       </div>
                     ) : gameState.lastRoll.results.length === 0 ? (
                       <div className="roll-result-item">
                         <strong>מטילים שוב...</strong>
                       </div>
                     ) : (
                       gameState.lastRoll.results.map((r, i) => (
                         <div key={i} className="roll-result-item">
                           <img src={INGREDIENTS[r.type].img} className="ing-icon small" alt={r.type} />
                           <strong>{INGREDIENTS[r.type].name} ל{gameState.players[r.playerIdx].name}</strong>
                         </div>
                       ))
                     )}
                   </div>
                 )}
                 {gameState.phase === 'roll' && (
                   <button className="roll-btn" onClick={doRoll} disabled={gameState.rolled || !isMyTurn}>הטל קוביות</button>
                 )}
                 {gameState.phase === 'pick7' && (
                   <button className="action-btn" style={{ background: 'var(--red)', color: 'white' }} onClick={() => showPick7Modal()} disabled={!isMyTurn}>
                     בחר מצרך (יצא 7)
                   </button>
                 )}
               </div>

               <div id="action-buttons" style={{ display: gameState.phase === 'action' ? 'flex' : 'none', flexDirection: 'column', gap: '8px' }}>
                 <button 
                   className={`action-btn ${canBake ? 'can-bake' : ''}`} 
                   onClick={doBake}
                   disabled={!canBake || !isMyTurn}
                 >
                   אפה פיצה
                 </button>
                 <button className="action-btn" onClick={doPickSurprise} disabled={!canPickSurprise || !isMyTurn}>קלף הפתעה (3 מטבעות)</button>
                 <button className="action-btn" onClick={doBuySlot} disabled={!canBuySlot || !isMyTurn}>מצרך חדש ללוח (6 מטבעות)</button>
                 <button className="action-btn" onClick={doBuyNumber} disabled={p.coins < 4 || !isMyTurn}>מספר נוסף (4 מטבעות)</button>
                 <button className="action-btn" onClick={doExchange} disabled={!canExchange || !isMyTurn}>המרת מצרכים</button>
                 <button className="action-btn end-turn" onClick={doEndTurn} disabled={!isMyTurn}>סיים תור</button>
               </div>

               {p.surprises.length > 0 && (
                 <div className="surprise-cards-row">
                    {p.surprises.map((s, idx) => (
                      <div key={idx} className="surprise-card">
                        <div className="surprise-card-icon">
                          <img src="/pizza-game/assets/gift-removebg-preview.png" alt="הפתעה" />
                        </div>
                        <div className="surprise-card-name">{s.name}</div>
                        <div className="surprise-card-desc">{s.desc}</div>
                        <button className="surprise-card-btn" onClick={() => {
                          if (s.effect === 'GAIN_COINS') {
                            updateGameState(next => {
                              const p2 = next.players[next.cur];
                              p2.coins += s.param;
                              p2.surprises.splice(idx, 1);
                              return next;
                            });
                          } else if (s.effect === 'EXTRA_TURN') {
                            updateGameState(next => {
                              next.extraTurn = true;
                              next.players[next.cur].surprises.splice(idx, 1);
                              return next;
                            });
                          } else if (s.effect === 'FREE_SPECIFIC') {
                            updateGameState(next => {
                              const p2 = next.players[next.cur];
                              const t = s.param as IngredientType;
                              const amount = Math.min(2, next.bank[t] || 0);
                              p2.hand[t] = (p2.hand[t] || 0) + amount;
                              next.bank[t] = (next.bank[t] || 0) - amount;
                              p2.surprises.splice(idx, 1);
                              return next;
                            });
                          } else if (s.effect === 'STEAL_ANY_ONE') {
                            setTradeState({ modal: 'stealPlayerSelect', actionSource: 'srp', otherId: -1, give: {}, take: {} });
                          } else if (s.effect === 'FREE_NUMBER') {
                            const items = p.slots.map((sl, index) => (
                              <div key={index} className="modal-item" onClick={() => {
                                updateGameState(next => {
                                  const curP = next.players[next.cur];
                                  const slot = curP.slots[index];
                                  const allNums = new Set(curP.slots.flatMap(s2 => s2.nums));
                                  let availableNums = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12].filter(n => !allNums.has(n));
                                  if (availableNums.length === 0) availableNums = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12].filter(n => !slot.nums.includes(n));
                                  const num = availableNums.length > 0 ? availableNums[Math.floor(Math.random() * availableNums.length)] : rnd(2, 12);
                                  slot.nums.push(num);
                                  curP.surprises.splice(idx, 1);
                                  return next;
                                });
                                closeModal();
                              }}>
                                <div className="modal-item-img-wrap"><img src={INGREDIENTS[sl.type].img} alt={sl.type} /></div>
                                <div className="modal-item-label">{INGREDIENTS[sl.type].name}<br/><small>{sl.nums.join(', ')}</small></div>
                              </div>
                            ));

                            showModal(
                              <div>
                                <div className="modal-title">{s.name}</div>
                                <div className="modal-sub">בחר מצרך להוספת מספר במתנה!</div>
                                <div className="modal-grid">{items}</div>
                                <button className="modal-close" onClick={closeModal}>ביטול</button>
                              </div>
                            );
                          } else if (s.effect === 'FREE_ANY') {
                            const availableInBank = ALL_TYPES.filter(t => (gameState.bank[t] || 0) > 0);
                            if (availableInBank.length === 0) {
                              showModal(
                                <div style={{ textAlign: 'center' }}>
                                  <div className="modal-title">אין מצרכים בקופה</div>
                                  <button className="modal-close" onClick={closeModal}>סגור</button>
                                </div>
                              );
                              return;
                            }
                            showModal(
                              <div>
                                <div className="modal-title">{s.name}</div>
                                <div className="modal-sub">בחר איזה מצרך לקחת מהקופה חינם</div>
                                <div className="modal-grid">
                                  {availableInBank.map(t => (
                                    <div key={t} className="modal-item" onClick={() => {
                                      updateGameState(prev => {
                                        const next = { ...prev };
                                        const curP = next.players[next.cur];
                                        curP.hand[t] = (curP.hand[t] || 0) + 1;
                                        next.bank[t] = (next.bank[t] || 0) - 1;
                                        curP.surprises.splice(idx, 1);
                                        return next;
                                      });
                                      closeModal();
                                    }}>
                                      <div className="modal-item-img-wrap"><img src={INGREDIENTS[t].img} alt={t} /></div>
                                      <div className="modal-item-label">{INGREDIENTS[t].name}</div>
                                    </div>
                                  ))}
                                </div>
                                <button className="modal-close" onClick={closeModal}>ביטול</button>
                              </div>
                            );
                          } else if (s.effect === 'STEAL_CHOOSE') {
                            showModal(
                              <div>
                                <div className="modal-title">{s.name}</div>
                                <div className="modal-sub">בחר מצרך שברצונך לקחת מכל השחקנים האחרים</div>
                                <div className="modal-grid">
                                  {ALL_TYPES.map(t => (
                                    <div key={t} className="modal-item" onClick={() => {
                                      updateGameState(prev => {
                                        const next = { ...prev };
                                        const p2 = next.players[next.cur];
                                        next.players.forEach((opp, i) => {
                                          if (i !== next.cur) {
                                            const count = opp.hand[t] || 0;
                                            if (count > 0) {
                                              opp.hand[t] = 0;
                                              p2.hand[t] = (p2.hand[t] || 0) + count;
                                            }
                                          }
                                        });
                                        p2.surprises.splice(idx, 1);
                                        return next;
                                      });
                                      closeModal();
                                    }}>
                                      <div className="modal-item-img-wrap"><img src={INGREDIENTS[t].img} alt={t} /></div>
                                      <div className="modal-item-label">{INGREDIENTS[t].name}</div>
                                    </div>
                                  ))}
                                </div>
                                <button className="modal-close" onClick={closeModal}>ביטול</button>
                              </div>
                            );
                          } else {
                            showModal(
                              <div>
                                <div className="modal-title">{s.name}</div>
                                <div className="modal-sub">{s.desc}</div>
                                <div style={{ color: 'var(--gold)', marginTop: '10px' }}>תכונה לא נתמכת</div>
                                <button className="modal-close" onClick={closeModal} style={{ marginTop: '20px' }}>סגור</button>
                              </div>
                            );
                          }
                        }}>השתמש</button>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          </div>
          
          <div id="side-panel" className={gameState.sidePanelOpen ? 'drawer-open' : ''}>
            <div id="side-panel-header" onClick={toggleSidePanel}>
              <div className="drawer-title right">
                <span style={{ color: 'var(--orange)' }}>פיצה בעיר</span>
                <span className="drawer-arrow">✕</span>
              </div>
            </div>
          <div id="side-panel-content">
             <div className="section-title">🏦 קופה</div>
             <div className="bank-grid">
               {ALL_TYPES.map(t => (
                 <div key={t} className="bank-row">
                   <div style={{ display: 'flex', alignItems: 'center' }}><img src={INGREDIENTS[t].img} className="ing-icon small" alt={t} style={{ marginLeft: '8px' }} /> {INGREDIENTS[t].name}</div>
                   <span className="bank-count">{gameState.bank[t] || 0}</span>
                 </div>
               ))}
             </div>
             <div style={{ marginTop: '24px' }}>
               <div className="section-title">🏆 ניקוד</div>
               {gameState.players.map(pl => (
                 <div key={pl.id} className="bank-row">
                   <span style={{ color: pl.color, fontWeight: 800 }}>{pl.name}</span>
                   <span className="bank-count">{pl.score} נקודות</span>
                 </div>
               ))}
             </div>
          </div>
          <div id="side-panel-footer">
            <button className="action-btn" style={{ background: '#442222', color: '#ffaaaa', borderColor: '#663333', width: '100%' }} onClick={() => updateGameState(prev => ({ ...prev, phase: 'setup' }))}>
              משחק חדש
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Actions Drawer */}
        <div id="mobile-actions-wrapper" className={`${gameState.actionsDrawerOpen ? 'open' : ''} ${gameState.phase === 'action' ? 'has-drawer' : ''}`}>
          {gameState.phase === 'action' && (
            <>
              <div id="actions-drawer-header" onClick={toggleActionsDrawer}>
                <div className="drawer-handle"></div>
                <span className="drawer-title">פעולות</span>
              </div>
              <div id="actions-drawer-content">
                <button className={`action-btn ${canBake ? 'can-bake' : ''}`} onClick={doBake} disabled={!canBake}>אפה פיצה</button>
                <button className="action-btn" onClick={doPickSurprise} disabled={!canPickSurprise}>קלף הפתעה</button>
                <button className="action-btn" onClick={doBuySlot} disabled={!canBuySlot}>מצרך חדש</button>
                <button className="action-btn" onClick={doBuyNumber} disabled={p.coins < 4}>מספר נוסף</button>
                <button className="action-btn" onClick={doExchange} disabled={!canExchange}>המרת מצרכים</button>
              </div>
            </>
          )}
          <div id="fixed-bottom-bar">
             {gameState.phase === 'action' ? (
               <button className="action-btn end-turn" onClick={doEndTurn} disabled={!isMyTurn}>סיים תור</button>
             ) : gameState.phase === 'pick7' ? (
               <button className="action-btn" style={{ background: 'var(--red)', color: 'white' }} onClick={() => showPick7Modal()} disabled={!isMyTurn}>בחר מצרך (יצא 7)</button>
             ) : (
               <button className="action-btn roll-btn" onClick={doRoll} disabled={gameState.rolled || !isMyTurn}>הטל קוביות</button>
             )}
          </div>
        </div>

        {renderTradeModal()}

        {pendingTradeOffer && (
          <div id="modal-overlay">
            <div id="modal-box" onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ fontSize: '4rem' }}>🤝</div>
                <div className="modal-title">בקשת החלפה!</div>
                <div className="modal-sub"><strong>{pendingTradeOffer.fromName}</strong> מציע לך עסקה:</div>
                <div style={{ background: 'rgba(255,140,60,0.05)', borderRadius: '12px', padding: '15px', margin: '15px 0', textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'var(--green)' }}>⬇️ מה שתקבל/י:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {Object.entries(pendingTradeOffer.give || {}).map(([t, arr]: any) => arr?.length > 0 ? (
                      <div key={t} className="trade-summary-item"><img src={INGREDIENTS[t as IngredientType].img} className="ing-icon small" alt=""/> {INGREDIENTS[t as IngredientType].name} x{arr.length}</div>
                    ) : null)}
                  </div>
                  <div style={{ fontWeight: 'bold', margin: '20px 0 10px', color: 'var(--red)' }}>⬆️ מה שתיתנ/י:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {Object.entries(pendingTradeOffer.take || {}).map(([t, arr]: any) => arr?.length > 0 ? (
                      <div key={t} className="trade-summary-item"><img src={INGREDIENTS[t as IngredientType].img} className="ing-icon small" alt=""/> {INGREDIENTS[t as IngredientType].name} x{arr.length}</div>
                    ) : null)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="start-btn" style={{ flex: 2 }} onClick={() => {
                    if (socket) socket.emit('trade-response', { toSocketId: pendingTradeOffer.fromSocketId, accepted: true });
                    updateGameState(prev => {
                      const next = JSON.parse(JSON.stringify(prev)) as GameState;
                      const initiator = next.players[pendingTradeOffer.gameStateCur];
                      const me = next.players[myPlayerIndex];
                      Object.entries(pendingTradeOffer.give || {}).forEach(([t, arr]: any) => {
                        initiator.hand[t as IngredientType] = (initiator.hand[t as IngredientType] || 0) - (arr?.length || 0);
                        me.hand[t as IngredientType] = (me.hand[t as IngredientType] || 0) + (arr?.length || 0);
                      });
                      Object.entries(pendingTradeOffer.take || {}).forEach(([t, arr]: any) => {
                        me.hand[t as IngredientType] = (me.hand[t as IngredientType] || 0) - (arr?.length || 0);
                        initiator.hand[t as IngredientType] = (initiator.hand[t as IngredientType] || 0) + (arr?.length || 0);
                      });
                      return next;
                    });
                    setPendingTradeOffer(null);
                  }}>מאשר/ת!</button>
                  <button className="modal-close" style={{ flex: 1 }} onClick={() => {
                    if (socket) socket.emit('trade-response', { toSocketId: pendingTradeOffer.fromSocketId, accepted: false });
                    setPendingTradeOffer(null);
                  }}>מסרב/ת</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isMultiplayer && !isMyTurn && !pendingTradeOffer && (
          <div id="modal-overlay">
            <div style={{
              background: 'var(--bg2)', borderRadius: '18px', padding: '28px 36px',
              textAlign: 'center', border: '2px solid var(--orange)',
              pointerEvents: 'none',
              boxShadow: '0 0 50px rgba(0,0,0,0.8)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⏳</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--orange)' }}>{turnP.name} משחק.ת</div>
              <div style={{ color: 'var(--muted)', marginTop: '6px' }}>ממתין לתורך...</div>
            </div>
          </div>
        )}

        {modal && (
          <div id="modal-overlay" onClick={closeModal}>
            <div id="modal-box" onClick={e => e.stopPropagation()}>
              {modal.html}
            </div>
          </div>
        )}
      </div>
    );
  };

  switch (gameState.phase) {
    case 'setup':
      return <div className="pizza-game-root">{renderSetup()}</div>;
    case 'waiting':
      return <div className="pizza-game-root">{renderWaitingRoom()}</div>;
    case 'gameover':
      return <div className="pizza-game-root">{renderWin()}</div>;
    default:
      return <div className="pizza-game-root">{renderGame()}</div>;
  }
}
