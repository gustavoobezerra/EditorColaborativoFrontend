import Document from '../models/Document.js';

// Armazena usuários conectados por documento
const documentUsers = new Map();

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ Cliente conectado: ${socket.id}`);

    // Entrar em um documento
    socket.on('join-document', async ({ documentId, user }) => {
      try {
        socket.join(documentId);
        
        // Adiciona usuário à lista de usuários ativos
        if (!documentUsers.has(documentId)) {
          documentUsers.set(documentId, new Map());
        }
        
        documentUsers.get(documentId).set(socket.id, {
          id: user.id,
          name: user.name,
          color: user.color,
          avatar: user.avatar,
          cursor: null
        });

        // Carrega documento do banco
        const document = await Document.findById(documentId);
        
        if (document) {
          socket.emit('load-document', document.content);
        }

        // Notifica outros usuários
        const activeUsers = Array.from(documentUsers.get(documentId).values());
        io.to(documentId).emit('users-update', activeUsers);

        console.log(`📄 ${user.name} entrou no documento ${documentId}`);
      } catch (error) {
        console.error('Erro ao entrar no documento:', error);
        socket.emit('error', { message: 'Erro ao carregar documento' });
      }
    });

    // Receber mudanças de texto
    socket.on('send-changes', ({ documentId, delta }) => {
      socket.to(documentId).emit('receive-changes', delta);
    });

    // Salvar documento
    socket.on('save-document', async ({ documentId, content }) => {
      try {
        await Document.findByIdAndUpdate(documentId, { content });
      } catch (error) {
        console.error('Erro ao salvar:', error);
      }
    });

    // Atualizar cursor
    socket.on('cursor-change', ({ documentId, range, user }) => {
      if (documentUsers.has(documentId)) {
        const userMap = documentUsers.get(documentId);
        const userData = userMap.get(socket.id);
        if (userData) {
          userData.cursor = range;
        }
      }
      
      socket.to(documentId).emit('cursor-update', {
        userId: socket.id,
        range,
        user
      });
    });

    // Sair do documento
    socket.on('leave-document', (documentId) => {
      handleUserLeave(socket, documentId, io);
    });

    // Desconexão
    socket.on('disconnect', () => {
      // Remove usuário de todos os documentos
      for (const [docId, users] of documentUsers.entries()) {
        if (users.has(socket.id)) {
          handleUserLeave(socket, docId, io);
        }
      }
      console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
  });
};

function handleUserLeave(socket, documentId, io) {
  if (documentUsers.has(documentId)) {
    documentUsers.get(documentId).delete(socket.id);
    
    const activeUsers = Array.from(documentUsers.get(documentId).values());
    io.to(documentId).emit('users-update', activeUsers);
    
    if (documentUsers.get(documentId).size === 0) {
      documentUsers.delete(documentId);
    }
  }
  socket.leave(documentId);
}
