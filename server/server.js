const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store room states
const rooms = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-room', ({ roomId, playerName }) => {
    socket.join(roomId);
    console.log(`User ${playerName} (${socket.id}) joined room: ${roomId}`);
    
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        gameState: null
      };
    }
    
    // Add player to room list if not already there
    const existingPlayer = rooms[roomId].players.find(p => p.socketId === socket.id);
    if (!existingPlayer) {
      rooms[roomId].players.push({
        socketId: socket.id,
        name: playerName
      });
    }

    // Notify others in the room
    io.to(roomId).emit('player-joined', {
      players: rooms[roomId].players,
      gameState: rooms[roomId].gameState
    });
  });

  socket.on('sync-game', ({ roomId, G }) => {
    if (rooms[roomId]) {
      rooms[roomId].gameState = G;
      // Broadcast updated state to everyone in the room
      socket.to(roomId).emit('game-updated', G);
    }
  });

  socket.on('send-chat', ({ roomId, playerName, message }) => {
    io.to(roomId).emit('receive-chat', { playerName, message });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Cleanup room info if needed (optional)
    for (const roomId in rooms) {
      const index = rooms[roomId].players.findIndex(p => p.socketId === socket.id);
      if (index !== -1) {
        const playerName = rooms[roomId].players[index].name;
        rooms[roomId].players.splice(index, 1);
        io.to(roomId).emit('player-left', {
          playerName,
          players: rooms[roomId].players
        });
        if (rooms[roomId].players.length === 0) {
          delete rooms[roomId];
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
