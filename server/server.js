require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const http = require('http');
const crypto = require('crypto');
const { Server } = require('socket.io');
const { connectDB, db } = require('./db');

function randomToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function createSession(hostId) {
  const token = randomToken();
  await db().collection('sessions').insertOne({ token, hostId, createdAt: new Date() });
  return token;
}

async function authed(req, hostId) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return false;
  const session = await db().collection('sessions').findOne({ token, hostId });
  return !!session;
}

function safeHost(host) {
  if (!host) return null;
  const { password, _id, ...safe } = host;
  return safe;
}

function readBody(req, res, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      await callback(JSON.parse(body));
    } catch (e) {
      if (!res.writableEnded) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: e.message || 'Bad request' }));
      }
    }
  });
}

async function handleBnbRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // POST /api/bnb/auth
  if (req.url === '/api/bnb/auth' && req.method === 'POST') {
    readBody(req, res, async ({ username, password }) => {
      const host = await db().collection('hosts').findOne({ username });
      if (host && host.password === password) {
        const token = await createSession(host.hostId);
        res.writeHead(200);
        res.end(JSON.stringify({ token, hostId: host.hostId }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'שם משתמש או סיסמה שגויים' }));
      }
    });
    return;
  }

  // GET /api/bnb/hosts  — list all hosts (public listing)
  if (req.url === '/api/bnb/hosts' && req.method === 'GET') {
    const hosts = await db().collection('hosts').find({}).toArray();
    res.writeHead(200);
    res.end(JSON.stringify(hosts.map(safeHost)));
    return;
  }

  // POST /api/bnb/hosts  — register new host
  if (req.url === '/api/bnb/hosts' && req.method === 'POST') {
    readBody(req, res, async ({ hostId, username, name, password }) => {
      if (!hostId || !username || !name || !password) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'חסרים שדות חובה' }));
        return;
      }
      const existingId  = await db().collection('hosts').findOne({ hostId });
      const existingUser = await db().collection('hosts').findOne({ username });
      if (existingId) {
        res.writeHead(409);
        res.end(JSON.stringify({ error: 'מזהה הנכס כבר תפוס' }));
        return;
      }
      if (existingUser) {
        res.writeHead(409);
        res.end(JSON.stringify({ error: 'שם המשתמש כבר תפוס' }));
        return;
      }
      await db().collection('hosts').insertOne({
        hostId, username, name, password,
        title: { he: '', en: '' },
        about: { he: [], en: [] },
        location: { he: '', en: '' },
        locationNote: { he: '', en: '' },
        images: [],
        amenities: [],
        rules: { he: [], en: [] },
        pricePerNight: 0,
        cleaningFee: 0,
        maxGuests: 2,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        rating: 0,
        reviewCount: 0,
        hostingSince: new Date().getFullYear(),
        unavailableDates: [],
      });
      const token = await createSession(hostId);
      res.writeHead(201);
      res.end(JSON.stringify({ token, hostId }));
    });
    return;
  }

  const hostMatch = req.url.match(/^\/api\/bnb\/host\/([^/?]+)/);

  // GET /api/bnb/host/:hostId
  if (hostMatch && req.method === 'GET') {
    const host = await db().collection('hosts').findOne({ hostId: hostMatch[1] });
    if (host) {
      res.writeHead(200);
      res.end(JSON.stringify(safeHost(host)));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Host not found' }));
    }
    return;
  }

  // PUT /api/bnb/host/:hostId  (requires auth)
  if (hostMatch && req.method === 'PUT') {
    if (!await authed(req, hostMatch[1])) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    readBody(req, res, async (data) => {
      const { password, _id, hostId, ...allowed } = data;
      await db().collection('hosts').updateOne(
        { hostId: hostMatch[1] },
        { $set: allowed }
      );
      const updated = await db().collection('hosts').findOne({ hostId: hostMatch[1] });
      res.writeHead(200);
      res.end(JSON.stringify(safeHost(updated)));
    });
    return;
  }

  // POST /api/bnb/upload-sign  — generate signed Cloudinary upload params (requires auth)
  if (req.url === '/api/bnb/upload-sign' && req.method === 'POST') {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const validSession = token && await db().collection('sessions').findOne({ token });
    if (!validSession) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    const timestamp = Math.round(Date.now() / 1000);
    const signature = crypto
      .createHash('sha1')
      .update(`timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
      .digest('hex');
    res.writeHead(200);
    res.end(JSON.stringify({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}
// ───────────────────────────────────────────────────────────────────────────

const server = http.createServer();

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

server.on('request', (req, res) => {
  if (req.url?.startsWith('/api/bnb/')) {
    handleBnbRequest(req, res).catch(err => {
      console.error('BnB API error:', err);
      if (!res.writableEnded) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, playerName }, callback) => {
    if (!isNaN(playerName) && String(playerName).trim() !== '') {
      if (callback) callback({ error: 'שם שחקן לא יכול להיות מספר בלבד' });
      return;
    }

    if (rooms.has(roomId)) {
       const roomData = rooms.get(roomId);
       if (roomData.gameState && roomData.gameState.phase !== 'setup' && roomData.gameState.phase !== 'waiting') {
           if (callback) callback({ error: 'החדר כבר פעיל במשחק! לא ניתן להצטרף לחדר קיים שכבר התחיל' });
           return;
       }
       const isNameTaken = roomData.players.some(p => p.name === playerName && p.socketId !== socket.id);
       if (isNameTaken) {
           if (callback) callback({ error: 'השם הזה כבר תפוס בחדר' });
           return;
       }
    }

    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, { players: [], gameState: null });
    }

    const roomData = rooms.get(roomId);

    const existingPlayerIndex = roomData.players.findIndex(p => p.socketId === socket.id);
    if (existingPlayerIndex === -1) {
        roomData.players.push({ socketId: socket.id, name: playerName });
    } else {
        roomData.players[existingPlayerIndex].name = playerName;
    }

    io.to(roomId).emit('player-joined', {
      players: roomData.players,
      gameState: roomData.gameState
    });

    if (callback) callback({ success: true });
  });

  socket.on('sync-game', ({ roomId, G }) => {
    const roomData = rooms.get(roomId);
    if (roomData) {
      roomData.gameState = G;
      socket.to(roomId).emit('game-updated', G);
    }
  });

  socket.on('trade-request', ({ toSocketId, tradeOffer }) => {
    io.to(toSocketId).emit('trade-request', tradeOffer);
  });

  socket.on('trade-response', ({ toSocketId, accepted }) => {
    io.to(toSocketId).emit('trade-response', { accepted });
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        const roomData = rooms.get(roomId);
        if (roomData) {
          roomData.players = roomData.players.filter(p => p.socketId !== socket.id);
          io.to(roomId).emit('player-joined', {
            players: roomData.players,
            gameState: roomData.gameState
          });
          if (roomData.players.length === 0) {
              rooms.delete(roomId);
          }
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
