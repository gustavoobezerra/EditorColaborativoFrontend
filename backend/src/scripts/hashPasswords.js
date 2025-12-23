import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function hashExistingPasswords() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    console.log('📍 URI:', MONGODB_URI ? 'Configurada' : '❌ NÃO ENCONTRADA');

    if (!MONGODB_URI) {
      console.error('❌ ERRO: Variável MONGODB_URI não está configurada no arquivo .env');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Buscar todos os usuários
    const users = await usersCollection.find({}).toArray();
    console.log(`\n📊 Encontrados ${users.length} usuário(s) no banco de dados`);

    let updatedCount = 0;

    for (const user of users) {
      try {
        // Verificar se a senha já está hasheada (bcrypt hash tem 60 caracteres)
        const isAlreadyHashed = user.password && user.password.startsWith('$2a$') && user.password.length === 60;

        if (isAlreadyHashed) {
          console.log(`⏭️  Usuário ${user.email} já tem senha criptografada. Pulando...`);
          continue;
        }

        // Criptografar a senha
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Atualizar o usuário
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );

        updatedCount++;
        console.log(`✅ Senha criptografada para: ${user.email}`);
      } catch (error) {
        console.error(`❌ Erro ao processar usuário ${user.email}:`, error.message);
      }
    }

    console.log(`\n🎉 Processo concluído! ${updatedCount} senha(s) criptografada(s) com sucesso.`);

    if (updatedCount === 0) {
      console.log('ℹ️  Todas as senhas já estavam criptografadas.');
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);

    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('\n🔑 PROBLEMA DE AUTENTICAÇÃO:');
      console.error('   → Verifique se o usuário e senha do MongoDB estão corretos');
      console.error('   → Verifique o arquivo .env na pasta backend/');
      console.error('   → Certifique-se de que o IP está liberado no MongoDB Atlas');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n🌐 PROBLEMA DE CONEXÃO:');
      console.error('   → Verifique sua conexão com a internet');
      console.error('   → Verifique se a URI do MongoDB está correta');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

hashExistingPasswords();
