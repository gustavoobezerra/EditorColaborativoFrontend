import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function createTestUser() {
  try {
    console.log('🔌 Conectando ao MongoDB...');

    if (!MONGODB_URI) {
      console.error('❌ ERRO: Variável MONGODB_URI não está configurada no arquivo .env');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    // Dados do usuário de teste
    const testUserData = {
      name: 'Gustavo Bezerra',
      email: 'gustavo@teste.com',
      password: 'senha123'
    };

    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email: testUserData.email });

    if (existingUser) {
      console.log('⚠️  Usuário já existe!');
      console.log('📧 Email:', testUserData.email);
      console.log('\n✅ Use estas credenciais para fazer login:');
      console.log('   Email:', testUserData.email);
      console.log('   Senha:', testUserData.password);
    } else {
      // Criar novo usuário (a senha será criptografada automaticamente pelo hook pre-save)
      const user = await User.create(testUserData);

      console.log('✅ Usuário criado com sucesso!\n');
      console.log('📋 DADOS DO USUÁRIO:');
      console.log('   Nome:', user.name);
      console.log('   Email:', user.email);
      console.log('   ID:', user._id);
      console.log('\n🔐 CREDENCIAIS PARA LOGIN:');
      console.log('   Email:', testUserData.email);
      console.log('   Senha:', testUserData.password);
      console.log('\n✨ A senha foi criptografada automaticamente com bcrypt!');
    }

    console.log('\n🚀 Acesse: http://localhost:5173');
    console.log('   e faça login com as credenciais acima.\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);

    if (error.code === 11000) {
      console.error('\n⚠️  Este email já está cadastrado no banco de dados.');
      console.error('   Use as credenciais existentes para fazer login.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

createTestUser();
