import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar .env do diretório backend
dotenv.config({ path: join(__dirname, '../../.env') });

import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function diagnosticarLogin() {
  console.log('\n========================================');
  console.log('   DIAGNÓSTICO DE LOGIN');
  console.log('========================================\n');

  try {
    // 1. Verificar variáveis de ambiente
    console.log('1️⃣  VERIFICANDO VARIÁVEIS DE AMBIENTE...');
    console.log('   MONGODB_URI:', MONGODB_URI ? '✅ Configurada' : '❌ NÃO CONFIGURADA');
    console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurada' : '❌ NÃO CONFIGURADA');

    if (!MONGODB_URI) {
      console.error('\n❌ ERRO CRÍTICO: MONGODB_URI não está configurada!');
      process.exit(1);
    }

    // 2. Conectar ao MongoDB
    console.log('\n2️⃣  CONECTANDO AO MONGODB...');
    await mongoose.connect(MONGODB_URI);
    console.log('   ✅ Conectado ao MongoDB com sucesso!');

    // 3. Verificar se existem usuários
    console.log('\n3️⃣  BUSCANDO USUÁRIOS NO BANCO...');
    const totalUsers = await User.countDocuments();
    console.log('   Total de usuários:', totalUsers);

    if (totalUsers === 0) {
      console.log('\n   ❌ PROBLEMA: Nenhum usuário cadastrado!');
      console.log('   💡 SOLUÇÃO: Execute "npm run create-user" para criar um usuário de teste');
      await mongoose.disconnect();
      process.exit(1);
    }

    // 4. Listar todos os usuários
    console.log('\n4️⃣  LISTANDO USUÁRIOS:');
    const users = await User.find({}).select('+password');

    for (const user of users) {
      console.log('\n   ─────────────────────────────');
      console.log('   ID:', user._id);
      console.log('   Nome:', user.name);
      console.log('   Email:', user.email);
      console.log('   Senha (hash):', user.password ? user.password.substring(0, 20) + '...' : '❌ SEM SENHA');
      console.log('   Senha é bcrypt?:', user.password?.startsWith('$2') ? '✅ SIM' : '❌ NÃO (texto plano!)');
    }

    // 5. Testar login com credenciais de teste
    console.log('\n5️⃣  TESTANDO LOGIN COM: gustavo@teste.com / senha123');
    const testUser = await User.findOne({ email: 'gustavo@teste.com' }).select('+password');

    if (!testUser) {
      console.log('   ❌ Usuário gustavo@teste.com NÃO ENCONTRADO!');
      console.log('   💡 Execute "npm run create-user" para criar o usuário');
    } else {
      console.log('   ✅ Usuário encontrado:', testUser.email);
      console.log('   Senha armazenada:', testUser.password?.substring(0, 30) + '...');

      // Testar comparação de senha
      try {
        const senhaCorreta = await testUser.comparePassword('senha123');
        console.log('   Senha "senha123" válida?:', senhaCorreta ? '✅ SIM' : '❌ NÃO');

        if (!senhaCorreta) {
          console.log('\n   ⚠️  A SENHA NÃO ESTÁ BATENDO!');
          console.log('   Isso pode significar que:');
          console.log('   - A senha foi inserida em texto plano (não criptografada)');
          console.log('   - O usuário foi criado com outra senha');
          console.log('\n   💡 SOLUÇÃO: Vou deletar e recriar o usuário...');

          await User.deleteOne({ email: 'gustavo@teste.com' });
          console.log('   ✅ Usuário antigo deletado');

          const novoUser = await User.create({
            name: 'Gustavo Bezerra',
            email: 'gustavo@teste.com',
            password: 'senha123'
          });
          console.log('   ✅ Novo usuário criado com ID:', novoUser._id);

          // Verificar novamente
          const userRecriado = await User.findOne({ email: 'gustavo@teste.com' }).select('+password');
          const senhaOk = await userRecriado.comparePassword('senha123');
          console.log('   Verificação final - senha OK?:', senhaOk ? '✅ SIM' : '❌ NÃO');
        }
      } catch (err) {
        console.log('   ❌ Erro ao comparar senha:', err.message);
      }
    }

    console.log('\n========================================');
    console.log('   DIAGNÓSTICO COMPLETO');
    console.log('========================================');
    console.log('\n📋 CREDENCIAIS PARA LOGIN:');
    console.log('   Email: gustavo@teste.com');
    console.log('   Senha: senha123');
    console.log('\n🌐 URL: http://localhost:5173\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB\n');
  }
}

diagnosticarLogin();
