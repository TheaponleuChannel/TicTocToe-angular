/* ═══════════════════════════════════════════════════════════
   NEON GOMOKU  |  server.js
   Node.js + Socket.IO — cross-device multiplayer backend
   ═══════════════════════════════════════════════════════════ */
'use strict';
const http = require('http');
const path = require('path');
const fs   = require('fs');
const { Server } = require('socket.io');

const PORT       = process.env.PORT || 3000;
const WIN_LENGTH = 5;
const GRID_START = 12;
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN ||
  'https://tictoctoe-angular.vercel.app,http://localhost:4200')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

/* ── Room store ────────────────────────────────────────── */
const rooms = new Map();

/* ── Helpers ───────────────────────────────────────────── */
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do { code = Array.from({length:6},()=>chars[~~(Math.random()*chars.length)]).join(''); }
  while (rooms.has(code));
  return code;
}

function checkResult(board, size) {
  const DIRS = [[0,1],[1,0],[1,1],[1,-1]];
  for (let idx = 0; idx < board.length; idx++) {
    const mark = board[idx]; if (!mark) continue;
    const r = Math.floor(idx/size), c = idx%size;
    for (const [dr,dc] of DIRS) {
      const combo = [idx];
      for (let k=1; k<WIN_LENGTH; k++) {
        const nr=r+dr*k, nc=c+dc*k;
        if (nr<0||nr>=size||nc<0||nc>=size) break;
        const ni = nr*size+nc;
        if (board[ni]!==mark) break;
        combo.push(ni);
      }
      if (combo.length===WIN_LENGTH) return {winner:mark,combo};
    }
  }
  if (board.every(c=>c!==null)) return {winner:'draw',combo:null};
  return null;
}

function view(room) {
  return {
    code:    room.code,
    players: room.players.map(p=>({nickname:p.nickname,mark:p.mark})),
    board:   room.board, turn: room.turn, status: room.status,
    scores:  room.scores, gridSize: room.gridSize,
  };
}

function findRoom(socketId) {
  for (const room of rooms.values()) {
    const player = room.players.find(p=>p.id===socketId);
    if (player) return {room,player};
  }
  return null;
}

/* ── Static file server (serves Angular dist/browser) ─── */
const DIST = path.join(__dirname, 'dist', 'neon-gomoku', 'browser');
const MIME = {'.html':'text/html','.css':'text/css','.js':'text/javascript',
              '.ico':'image/x-icon','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};

const httpServer = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/health') {
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ok:true}));
    return;
  }
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(DIST, urlPath);
  if (!filePath.startsWith(DIST)) { res.writeHead(403); res.end(); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback
      fs.readFile(path.join(DIST,'index.html'), (e2,d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200,{'Content-Type':'text/html'});
        res.end(d2);
      });
      return;
    }
    const mime = MIME[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, {'Content-Type':mime,'Cache-Control':'public,max-age=31536000'});
    res.end(data);
  });
});

/* ── Socket.IO ─────────────────────────────────────────── */
const io = new Server(httpServer, { 
  cors: {
    origin: CLIENT_ORIGINS,
    methods: ["GET", "POST"]
  } 
});

io.on('connection', socket => {
  console.log(`[+] ${socket.id}`);

  socket.on('room:create', ({nickname}) => {
    if (!nickname) return;
    const code = generateCode();
    rooms.set(code, {
      code, players:[{id:socket.id,nickname:nickname.trim().slice(0,16),mark:'X'}],
      board:Array(GRID_START*GRID_START).fill(null), turn:'X',
      status:'waiting', scores:{X:0,O:0,draw:0}, gridSize:GRID_START, rematch:new Set()
    });
    socket.join(code);
    socket.emit('room:created',{room:view(rooms.get(code))});
    console.log(`[Room ${code}] created by ${nickname}`);
  });

  socket.on('room:join', ({nickname,code}) => {
    const room = rooms.get(code);
    if (!room)                   { socket.emit('room:error',{message:'Room not found'}); return; }
    if (room.status!=='waiting') { socket.emit('room:error',{message:'Room not available'}); return; }
    room.players.push({id:socket.id,nickname:nickname.trim().slice(0,16),mark:'O'});
    room.status='playing';
    socket.join(code);
    socket.emit('room:joined',{room:view(room)});
    io.to(code).emit('game:start',{room:view(room)});
    console.log(`[Room ${code}] ${nickname} joined`);
  });

  socket.on('game:move', ({code,index}) => {
    const room = rooms.get(code); if(!room||room.status!=='playing') return;
    const player = room.players.find(p=>p.id===socket.id); if(!player) return;
    if (player.mark!==room.turn) { socket.emit('room:error',{message:"Not your turn"}); return; }
    if (index<0||index>=room.board.length||room.board[index]!==null) { socket.emit('room:error',{message:'Invalid move'}); return; }

    room.board[index]=player.mark;
    const result = checkResult(room.board,room.gridSize);

    if (result) {
      room.status='done';
      if (result.winner==='draw') room.scores.draw++;
      else room.scores[result.winner]++;
      io.to(code).emit('game:move',{board:room.board,turn:room.turn,result,scores:room.scores});
      console.log(`[Room ${code}] winner:${result.winner}`);
    } else {
      // Check board full → expand grid
      if (room.board.every(c=>c!==null)) {
        const oldSize=room.gridSize, newSize=oldSize*2;
        const offset=Math.floor((newSize-oldSize)/2);
        const newBoard=Array(newSize*newSize).fill(null);
        room.board.forEach((m,i)=>{
          if(m){ const r=Math.floor(i/oldSize),c=i%oldSize; newBoard[(r+offset)*newSize+(c+offset)]=m; }
        });
        room.board=newBoard; room.gridSize=newSize;
        room.turn=room.turn==='X'?'O':'X';
        io.to(code).emit('game:expand',{gridSize:newSize,board:newBoard,turn:room.turn});
        console.log(`[Room ${code}] grid expanded to ${newSize}x${newSize}`);
      } else {
        room.turn=room.turn==='X'?'O':'X';
        io.to(code).emit('game:move',{board:room.board,turn:room.turn,result:null,scores:room.scores});
      }
    }
  });

  socket.on('game:rematch', ({code}) => {
    const room=rooms.get(code); if(!room) return;
    room.rematch.add(socket.id);
    if (room.rematch.size===2) {
      room.board=Array(GRID_START*GRID_START).fill(null);
      room.turn='X'; room.status='playing'; room.gridSize=GRID_START; room.rematch.clear();
      io.to(code).emit('game:rematch',{room:view(room)});
    } else {
      socket.emit('game:rematch-waiting',{message:'Waiting for opponent...'});
      socket.to(code).emit('game:rematch-requested',{message:'Opponent wants a rematch!'});
    }
  });

  socket.on('room:leave', ({code}) => {
    const room=rooms.get(code); if(!room) return;
    const player=room.players.find(p=>p.id===socket.id); if(!player) return;
    room.players=room.players.filter(p=>p.id!==socket.id);
    socket.leave(code);
    socket.to(code).emit('room:opponent-left',{message:`${player.nickname} left the game`});
    if(room.players.length===0) rooms.delete(code);
    else { room.status='waiting'; room.rematch.clear(); }
  });

  socket.on('disconnect', () => {
    const found=findRoom(socket.id); if(!found) return;
    const {room,player}=found;
    room.players=room.players.filter(p=>p.id!==socket.id);
    socket.to(room.code).emit('room:opponent-left',{message:`${player.nickname} disconnected`});
    if(room.players.length===0) rooms.delete(room.code);
    else { room.status='waiting'; room.rematch.clear(); }
    console.log(`[-] ${socket.id} (${player.nickname})`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`\n  🟢 NEON GOMOKU SERVER`);
  console.log(`  Running at  http://localhost:${PORT}`);
  console.log(`  Build Angular first: npm run build`);
  console.log(`  Then share your IP for LAN play\n`);
});
