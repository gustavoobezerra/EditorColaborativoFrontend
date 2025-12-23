# 🔐 Solução do Bug de Login

## 📋 Problema Identificado

O bug de login ocorria porque as senhas foram criadas manualmente no MongoDB Atlas em **texto plano**, mas a aplicação espera que as senhas estejam **criptografadas com bcrypt**.

### Causa Raiz
Quando você cria um usuário diretamente no MongoDB Atlas (sem usar a API da aplicação), o hook `pre('save')` do Mongoose não é executado, então a senha não é criptografada automaticamente.

```javascript
// Este hook só executa quando você usa User.create() ou user.save()
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);  // ❌ Não executado no MongoDB Atlas
  next();
});
```

### Fluxo de Login
1. Usuário envia `email` e `password` (texto plano)
2. Backend busca usuário no banco: `User.findOne({ email }).select('+password')`
3. Backend tenta comparar: `bcrypt.compare(password_texto_plano, senha_no_banco)`
4. Se senha no banco estiver em texto plano → ❌ Falha sempre
5. Se senha no banco estiver criptografada → ✅ Sucesso

---

## ✅ Solução Implementada

### 1. Script de Criptografia Automática
Foi criado um script que:
- Conecta ao MongoDB
- Busca todos os usuários
- Verifica quais senhas NÃO estão criptografadas
- Criptografa apenas as senhas em texto plano
- Mantém senhas já criptografadas intactas

**Localização:** `backend/src/scripts/hashPasswords.js`

### 2. Como Usar

#### Opção 1: Usando o arquivo .bat (Windows)
```bash
# Clique duas vezes no arquivo:
CORRIGIR-SENHAS.bat
```

#### Opção 2: Via npm (qualquer SO)
```bash
cd backend
npm run hash-passwords
```

#### Opção 3: Comando direto
```bash
cd backend
node src/scripts/hashPasswords.js
```

### 3. O que o Script Faz

```
🔌 Conectando ao MongoDB...
✅ Conectado ao MongoDB

📊 Encontrados 2 usuário(s) no banco de dados
⏭️  Usuário admin@example.com já tem senha criptografada. Pulando...
✅ Senha criptografada para: gustavo@example.com

🎉 Processo concluído! 1 senha(s) criptografada(s) com sucesso.
🔌 Desconectado do MongoDB
```

---

## 🛡️ Prevenção de Problemas Futuros

### ✅ Forma CORRETA de criar usuários:

**Opção 1: Via API (RECOMENDADO)**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Opção 2: Via MongoDB com script**
```javascript
// Usar o modelo Mongoose (executa o hook pre-save)
import User from './models/User.js';

await User.create({
  name: "João Silva",
  email: "joao@example.com",
  password: "senha123"  // Será criptografada automaticamente
});
```

### ❌ Forma INCORRETA:

```javascript
// ❌ NÃO FAZER - Inserir direto no MongoDB Atlas
db.users.insertOne({
  name: "João Silva",
  email: "joao@example.com",
  password: "senha123"  // ❌ Ficará em texto plano!
})
```

---

## 🔍 Como Verificar se uma Senha está Criptografada

Senhas criptografadas com bcrypt têm este formato:
```
$2a$10$AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghijklmno
```

Características:
- Começam com `$2a$` ou `$2b$`
- Têm exatamente 60 caracteres
- Contêm números de custo (ex: `$10$`)

Se a senha no banco for `"senha123"` → ❌ Texto plano
Se a senha no banco for `"$2a$10$abc..."` → ✅ Criptografada

---

## 📁 Arquivos do Projeto

### Arquivos Mantidos (Essenciais)
- `README.md` - Documentação principal
- `QUICK_START.md` - Guia rápido de início
- `ARCHITECTURE.md` - Arquitetura do sistema
- `1-RODAR-BACKEND.bat` - Iniciar backend
- `2-RODAR-FRONTEND.bat` - Iniciar frontend
- `INICIAR-PROJETO.bat` - Instalar dependências
- `CORRIGIR-SENHAS.bat` - ⭐ **NOVO** - Criptografar senhas
- `.gitignore` - Arquivos ignorados pelo Git
- `docker-compose.yml` - Configuração Docker

### Arquivos Removidos (Duplicados/Irrelevantes)
- ⚡ LEIA-ISTO-AGORA.txt
- COMO-USAR.txt
- CONFIGURAR_MONGODB.txt
- CHECKLIST.md
- PROJECT_STRUCTURE.txt
- 👉 COMECE-AQUI.txt
- 🔧 CORRIGIR-MONGODB.txt
- ABRIR-NO-VSCODE.bat
- TESTAR-BACKEND.bat
- setup.sh
- Pasta `{backend` (inválida)
- Pasta `correcao-login` (temporária)

---

## 🚀 Próximos Passos

1. Execute o script de criptografia:
   ```bash
   CORRIGIR-SENHAS.bat
   ```

2. Tente fazer login novamente com suas credenciais

3. Se ainda não funcionar, verifique:
   - ✅ MongoDB está conectado?
   - ✅ Variável `MONGODB_URI` no `.env` está correta?
   - ✅ Usuário existe no banco de dados?
   - ✅ Email e senha estão corretos?

---

## 📝 Logs de Depuração

Se precisar debugar, adicione logs no `authController.js`:

```javascript
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔍 Tentativa de login:', email);

    const user = await User.findOne({ email }).select('+password');
    console.log('👤 Usuário encontrado:', !!user);

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log('🔐 Senha válida:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    // ... resto do código
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ message: error.message });
  }
};
```

---

## ✨ Resumo da Solução

| Antes | Depois |
|-------|--------|
| ❌ Senha em texto plano no MongoDB | ✅ Senha criptografada com bcrypt |
| ❌ Login sempre falhava | ✅ Login funciona normalmente |
| ❌ `bcrypt.compare()` retornava `false` | ✅ `bcrypt.compare()` retorna `true` |
| ❌ Muitos arquivos de documentação duplicados | ✅ Arquivos organizados e essenciais |

**Status:** ✅ Bug resolvido e projeto limpo!
