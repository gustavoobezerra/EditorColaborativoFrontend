# 🏗️ Arquitetura do Sistema

## Visão Geral

O Editor Colaborativo utiliza uma arquitetura cliente-servidor moderna com comunicação em tempo real através de WebSockets.

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│  React Client   │◄───────►│   Node.js API    │◄───────►│   MongoDB    │
│  (Frontend)     │ HTTP    │   + Socket.IO    │  Mongoose│   (Database) │
│                 │◄───────►│   (Backend)      │         │              │
│  - UI/UX        │WebSocket│  - REST API      │         │  - Documents │
│  - Quill Editor │         │  - Real-time     │         │  - Users     │
│  - State Mgmt   │         │  - Auth          │         │              │
└─────────────────┘         └──────────────────┘         └──────────────┘
```

## Camadas da Aplicação

### 1. Frontend (React)

#### Estrutura de Componentes
```
App
├── PublicRoute (Login, Register)
└── PrivateRoute
    ├── Dashboard
    │   └── DocumentList
    └── Editor
        ├── Toolbar
        ├── QuillEditor
        └── ActiveUsers
```

#### Fluxo de Dados

```
User Action → Component → Store (Zustand) → API/Socket → Backend
                                    ↓
                            Update UI ← Socket Events
```

#### Gerenciamento de Estado (Zustand)

**useAuthStore:**
- user: { id, name, email, avatar, color }
- token: JWT string
- isAuthenticated: boolean
- setAuth(), logout()

**useDocumentStore:**
- documents: Array<Document>
- currentDocument: Document | null
- activeUsers: Array<User>
- setDocuments(), setCurrentDocument(), setActiveUsers()

### 2. Backend (Node.js + Express)

#### Arquitetura em Camadas

```
Routes → Controllers → Services → Models → Database
```

**Routes:** Define endpoints HTTP  
**Controllers:** Lógica de negócio  
**Models:** Schema e validação  
**Middleware:** Auth, Error handling

#### API RESTful

| Método | Endpoint | Autenticação | Função |
|--------|----------|--------------|--------|
| POST | /api/auth/register | Não | Criar usuário |
| POST | /api/auth/login | Não | Autenticar |
| GET | /api/auth/me | Sim | Dados do usuário |
| GET | /api/documents | Sim | Listar documentos |
| POST | /api/documents | Sim | Criar documento |
| GET | /api/documents/:id | Sim | Detalhes |
| PUT | /api/documents/:id | Sim | Atualizar |
| DELETE | /api/documents/:id | Sim | Deletar |

### 3. Comunicação em Tempo Real (Socket.IO)

#### Eventos do Cliente

```javascript
// Conexão
socket.connect()

// Entrar em documento
socket.emit('join-document', { documentId, user })

// Enviar mudanças de texto
socket.emit('send-changes', { documentId, delta })

// Auto-save
socket.emit('save-document', { documentId, content })

// Sair
socket.emit('leave-document', documentId)
```

#### Eventos do Servidor

```javascript
// Carregar documento inicial
socket.on('load-document', content => {
  quill.setContents(content)
})

// Receber mudanças de outros
socket.on('receive-changes', delta => {
  quill.updateContents(delta)
})

// Atualizar lista de usuários online
socket.on('users-update', users => {
  setActiveUsers(users)
})
```

#### Arquitetura de Rooms

Cada documento é uma "room" no Socket.IO:

```
Document Room "doc_123"
├── User A (socket_abc)
├── User B (socket_def)
└── User C (socket_ghi)
```

Quando User A edita:
1. Cliente A envia delta para servidor
2. Servidor faz broadcast para room (exceto A)
3. Users B e C recebem e aplicam delta

### 4. Banco de Dados (MongoDB)

#### Modelo de Dados

**User Collection:**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String (URL),
  color: String (hex),
  createdAt: Date,
  updatedAt: Date
}
```

**Document Collection:**
```javascript
{
  _id: ObjectId,
  title: String,
  content: {
    ops: [
      { insert: "texto", attributes: {...} },
      { insert: "\n" }
    ]
  },
  owner: ObjectId (ref: User),
  collaborators: [
    {
      user: ObjectId (ref: User),
      permission: 'view' | 'edit'
    }
  ],
  isPublic: Boolean,
  version: Number,
  lastEditedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

#### Índices para Performance

```javascript
// Buscar documentos do usuário rapidamente
db.documents.createIndex({ owner: 1, createdAt: -1 })
db.documents.createIndex({ 'collaborators.user': 1 })
```

## Fluxos Principais

### Fluxo de Autenticação

```
1. User → POST /api/auth/register { name, email, password }
2. Backend → Hash password com bcrypt
3. Backend → Criar user no MongoDB
4. Backend → Gerar JWT token
5. Backend → Return { user, token }
6. Frontend → Store token em localStorage
7. Frontend → Add token em headers de requisições futuras
```

### Fluxo de Edição Colaborativa

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│ User A   │                    │  Server  │                    │ User B   │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                               │                               │
     │ 1. join-document              │                               │
     ├──────────────────────────────►│                               │
     │                               │                               │
     │ 2. load-document (content)    │                               │
     │◄──────────────────────────────┤                               │
     │                               │                               │
     │                               │ 3. join-document              │
     │                               │◄──────────────────────────────┤
     │                               │                               │
     │ 4. users-update [A, B]        │ 5. users-update [A, B]        │
     │◄──────────────────────────────┼──────────────────────────────►│
     │                               │                               │
     │ 6. Digite "Olá"               │                               │
     │ send-changes (delta)          │                               │
     ├──────────────────────────────►│                               │
     │                               │ 7. receive-changes (delta)    │
     │                               ├──────────────────────────────►│
     │                               │                               │
     │                               │ 8. Aplica mudança             │
     │                               │                               │
```

### Fluxo de Auto-Save

```javascript
// Cliente
useEffect(() => {
  const interval = setInterval(() => {
    const content = quill.getContents()
    socket.emit('save-document', { documentId, content })
  }, 2000)
  
  return () => clearInterval(interval)
}, [quill])

// Servidor
socket.on('save-document', async ({ documentId, content }) => {
  await Document.findByIdAndUpdate(documentId, { content })
})
```

## Segurança

### 1. Autenticação JWT

```javascript
// Gerar token
const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })

// Verificar token
const decoded = jwt.verify(token, JWT_SECRET)
```

### 2. Hash de Senhas

```javascript
// Registro
const salt = await bcrypt.genSalt(10)
const hashedPassword = await bcrypt.hash(password, salt)

// Login
const isMatch = await bcrypt.compare(candidatePassword, user.password)
```

### 3. Middleware de Autenticação

```javascript
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Não autorizado' })
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = await User.findById(decoded.id)
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' })
  }
}
```

### 4. CORS

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))
```

### 5. Helmet (Security Headers)

```javascript
app.use(helmet())
```

## Otimizações

### 1. Debouncing de Socket Events

```javascript
// Evitar enviar cada keystroke
let timeout
quill.on('text-change', (delta) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    socket.emit('send-changes', { documentId, delta })
  }, 300)
})
```

### 2. Compressão de Respostas HTTP

```javascript
import compression from 'compression'
app.use(compression())
```

### 3. Índices no MongoDB

```javascript
documentSchema.index({ owner: 1, createdAt: -1 })
```

### 4. Connection Pooling

```javascript
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 5
})
```

## Escalabilidade

### Desafios ao Escalar

1. **Socket.IO com múltiplos servidores:**
   - Usar Redis adapter para sincronizar rooms
   
2. **MongoDB Sharding:**
   - Particionar por userId ou documentId

3. **Load Balancing:**
   - Nginx para distribuir requisições HTTP
   - Sticky sessions para WebSockets

4. **Caching:**
   - Redis para documentos frequentemente acessados

### Solução com Redis

```javascript
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'

const pubClient = createClient({ url: 'redis://localhost:6379' })
const subClient = pubClient.duplicate()

await Promise.all([pubClient.connect(), subClient.connect()])

io.adapter(createAdapter(pubClient, subClient))
```

## Monitoramento

### Logs Importantes

```javascript
// Conexões
console.log(`✅ Cliente conectado: ${socket.id}`)
console.log(`❌ Cliente desconectado: ${socket.id}`)

// Documentos
console.log(`📄 ${user.name} entrou no documento ${documentId}`)

// Erros
console.error('Erro ao salvar:', error)
```

### Métricas para Acompanhar

- Número de conexões ativas
- Latência de sincronização (tempo entre envio e recebimento)
- Taxa de erros
- Uso de memória
- Queries lentas no MongoDB

---

**Autor:** Gustavo Bezerra  
**Data:** Dezembro 2025
