#!/usr/bin/env node

/**
 * Script CLI para criar treinadores no sistema
 * Uso: node scripts/create-coach.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const DATA_DIR = path.join(__dirname, '..', 'data', 'coaches');

// Função para fazer perguntas
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Função para hash de senha (simples para demo)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Função para validar email
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Função para criar diretório se não existir
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Função principal
async function createCoach() {
  console.log('\n🏆 SCOUT 21 PRO - Criar Novo Treinador\n');
  console.log('═'.repeat(50));
  
  try {
    // Coletar dados
    const name = await question('👤 Nome completo: ');
    if (!name.trim()) {
      console.error('❌ Nome é obrigatório!');
      rl.close();
      return;
    }

    let email = await question('📧 Email (será o login): ');
    email = email.trim().toLowerCase();
    
    if (!isValidEmail(email)) {
      console.error('❌ Email inválido!');
      rl.close();
      return;
    }

    // Verificar se já existe
    const coachDir = path.join(DATA_DIR, email);
    if (fs.existsSync(coachDir)) {
      console.error(`❌ Treinador com email ${email} já existe!`);
      rl.close();
      return;
    }

    const password = await question('🔒 Senha: ');
    if (password.length < 4) {
      console.error('❌ Senha deve ter no mínimo 4 caracteres!');
      rl.close();
      return;
    }

    const teamName = await question('⚽ Nome do time: ');
    if (!teamName.trim()) {
      console.error('❌ Nome do time é obrigatório!');
      rl.close();
      return;
    }

    const sport = await question('🏃 Esporte (futsal/futebol/handebol/basquete) [futsal]: ') || 'futsal';
    const photoUrl = await question('📷 URL da foto (opcional, Enter para pular): ') || '';

    console.log('\n📋 Resumo dos Dados:\n');
    console.log(`Nome: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Time: ${teamName}`);
    console.log(`Esporte: ${sport}`);
    console.log(`Foto: ${photoUrl || 'Nenhuma'}`);

    const confirm = await question('\n✅ Confirmar criação? (s/n): ');
    
    if (confirm.toLowerCase() !== 's') {
      console.log('❌ Criação cancelada.');
      rl.close();
      return;
    }

    // Criar estrutura
    console.log('\n🔨 Criando estrutura...');
    
    ensureDir(DATA_DIR);
    ensureDir(coachDir);

    const coachData = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email,
      passwordHash: hashPassword(password),
      teamName: teamName.trim(),
      sport: sport.toLowerCase(),
      photoUrl: photoUrl.trim(),
      role: 'Treinador',
      createdAt: new Date().toISOString(),
      spreadsheetId: '', // Será preenchido depois
      active: true
    };

    // Salvar config.json
    const configPath = path.join(coachDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(coachData, null, 2));
    console.log(`✅ Arquivo de configuração criado: ${configPath}`);

    // Criar arquivo para spreadsheet ID
    const spreadsheetPath = path.join(coachDir, 'spreadsheet-id.txt');
    fs.writeFileSync(spreadsheetPath, '# Cole aqui o ID da planilha do Google Sheets\n# Exemplo: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms\n\n');
    console.log(`✅ Arquivo spreadsheet-id.txt criado: ${spreadsheetPath}`);

    // Criar README
    const readmePath = path.join(coachDir, 'README.md');
    const readmeContent = `# Treinador: ${name}

## 📋 Informações

- **Email:** ${email}
- **Time:** ${teamName}
- **Esporte:** ${sport}
- **Criado em:** ${new Date().toLocaleDateString('pt-BR')}

## 🗂️ Próximos Passos

### 1. Criar Planilha no Google Sheets

Acesse: https://sheets.google.com

Crie uma nova planilha chamada: **${teamName} - Scout 21 Pro**

### 2. Configurar Abas

Crie as seguintes abas (exatamente com estes nomes):

1. **players** - Jogadores
2. **matches** - Partidas
3. **match_player_stats** - Estatísticas por jogo
4. **injuries** - Lesões
5. **assessments** - Avaliações físicas
6. **schedules** - Programações
7. **schedule_days** - Dias das programações
8. **competitions** - Competições
9. **stat_targets** - Metas
10. **time_controls** - Controle de tempo
11. **championship_matches** - Tabela de campeonato

### 3. Headers das Abas

Consulte o arquivo: \`GOOGLE_SHEETS_SETUP.md\` na raiz do projeto para os headers de cada aba.

### 4. Configurar Google Apps Script

1. Na planilha, vá em **Extensões > Apps Script**
2. Cole o código do arquivo: \`google-apps-script-COMPLETO.js\`
3. Substitua o \`SPREADSHEET_ID\` pelo ID da sua planilha
4. Salve e publique como Web App

### 5. Obter ID da Planilha

Na URL da planilha, copie o ID:
\`\`\`
https://docs.google.com/spreadsheets/d/[ESTE_É_O_ID]/edit
\`\`\`

Cole o ID no arquivo: \`spreadsheet-id.txt\`

### 6. Configurar no Sistema

Edite o arquivo \`config.ts\` e atualize com a URL do seu Google Apps Script.

## 🔐 Credenciais de Login

- **Email:** ${email}
- **Senha:** *(não armazenada aqui por segurança)*

---

**📚 Para mais detalhes, consulte a documentação na raiz do projeto.**
`;
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✅ README.md criado com instruções`);

    console.log('\n' + '═'.repeat(50));
    console.log('✅ TREINADOR CRIADO COM SUCESSO!\n');
    console.log('📁 Pasta criada em:', coachDir);
    console.log('\n📝 Próximos passos:');
    console.log('1. Criar planilha no Google Sheets');
    console.log('2. Configurar Google Apps Script');
    console.log('3. Adicionar ID da planilha em: spreadsheet-id.txt');
    console.log('4. Fazer login no sistema com:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: (a que você definiu)`);
    console.log('\n📖 Leia o README.md na pasta do treinador para instruções detalhadas.');
    console.log('═'.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Erro ao criar treinador:', error.message);
  } finally {
    rl.close();
  }
}

// Executar
createCoach();

