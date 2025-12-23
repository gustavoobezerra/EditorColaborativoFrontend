import { io } from 'socket.io-client';

// URL do Socket - usa variável de ambiente ou fallback para produção/desenvolvimento
const getSocketUrl = () => {
  // Primeiro tenta variável de ambiente
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  
  // Em produção (Render), usa URL do backend
  if (import.meta.env.PROD) {
    // Substitua pela URL real do seu backend no Render após o deploy
    return 'https://smarteditor-backend.onrender.com';
  }
  
  // Desenvolvimento local
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

console.log('🔌 Socket URL:', SOCKET_URL);

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        autoConnect: true,
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('✅ Conectado ao Socket.IO');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Desconectado do Socket.IO:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinDocument(documentId, user) {
    if (this.socket) {
      this.socket.emit('join-document', { documentId, user });
    }
  }

  leaveDocument(documentId) {
    if (this.socket) {
      this.socket.emit('leave-document', documentId);
    }
  }

  sendChanges(documentId, delta) {
    if (this.socket) {
      this.socket.emit('send-changes', { documentId, delta });
    }
  }

  saveDocument(documentId, content) {
    if (this.socket) {
      this.socket.emit('save-document', { documentId, content });
    }
  }

  sendCursorChange(documentId, range, user) {
    if (this.socket) {
      this.socket.emit('cursor-change', { documentId, range, user });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();
