import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import { setupSocket } from './socket/documentSocket.js';

// Configurações
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configuração de CORS flexível para múltiplas origens
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ];
  
  // Adiciona CORS_ORIGIN do ambiente (pode ser múltiplas URLs separadas por vírgula)
  const envOrigin = process.env.CORS_ORIGIN;
  if (envOrigin) {
    envOrigin.split(',').forEach(origin => {
      const trimmed = origin.trim();
      if (trimmed && !origins.includes(trimmed)) {
        origins.push(trimmed);
      }
    });
  }
  
  return origins.filter(Boolean);
};

const allowedOrigins = getAllowedOrigins();

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  },
  transports: ['websocket', 'polling']
});

// Conectar ao MongoDB
connectDB();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: function(origin, callback) {
    // Permite requisições sem origin (como apps mobile ou curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas
app.get('/', (req, res) => {
  res.json({ 
    message: 'API do Editor Colaborativo',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      documents: '/api/documents'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Configurar Socket.IO
setupSocket(io);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado!' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Socket.IO configurado`);
  console.log(`🌐 CORS permitido para: ${allowedOrigins.join(', ')}`);
});
