import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        autoConnect: true
      });

      this.socket.on('connect', () => {
        console.log('✅ Conectado ao Socket.IO');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Desconectado do Socket.IO');
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
