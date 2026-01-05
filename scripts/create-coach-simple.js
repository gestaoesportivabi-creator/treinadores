#!/usr/bin/env node

/**
 * Script SIMPLIFICADO para criar treinador
 * SEM OAuth, SEM complicação
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data', 'coaches');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Pegar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.length < 4) {
  console.log('\n🏆 SCOUT 21 PRO - Criar Treinador Rápido\n');
  console.log('Uso: node scripts/create-coach-simple.js <nome> <email> <senha> <time> [esporte]');
  console.log('\nExemplo:');
  console.log('  node scripts/create-coach-simple.js "João Silva" joao@email.com senha123 "AFC Lions" futsal');
  console.log('\nOu com espaços nos nomes:');
  console.log('  node scripts/create-coach-simple.js "João Silva" joao@email.com senha123 "AFC Lions"');
  process.exit(1);
}

const [name, email, password, teamName, sport = 'futsal'] = args;

console.log('\n🏆 SCOUT 21 PRO - Criar Treinador\n');
console.log('═'.repeat(60));

// Validações
if (!name || name.length < 3) {
  console.error('❌ Nome deve ter pelo menos 3 caracteres');
  process.exit(1);
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Email inválido');
  process.exit(1);
}

const coachDir = path.join(DATA_DIR, email.toLowerCase());
if (fs.existsSync(coachDir)) {
  console.error(`❌ Treinador com email ${email} já existe!`);
  process.exit(1);
}

if (password.length < 4) {
  console.error('❌ Senha deve ter pelo menos 4 caracteres');
  process.exit(1);
}

if (!teamName || teamName.length < 3) {
  console.error('❌ Nome do time deve ter pelo menos 3 caracteres');
  process.exit(1);
}

// Criar estrutura
console.log('🔨 Criando treinador...\n');

ensureDir(DATA_DIR);
ensureDir(coachDir);

const coachId = crypto.randomUUID();

const coachData = {
  id: coachId,
  name: name.trim(),
  email: email.toLowerCase().trim(),
  passwordHash: hashPassword(password),
  teamName: teamName.trim(),
  sport: sport.toLowerCase(),
  photoUrl: '',
  role: 'Treinador',
  createdAt: new Date().toISOString(),
  spreadsheetId: '',
  active: true
};

// Salvar config
const configPath = path.join(coachDir, 'config.json');
fs.writeFileSync(configPath, JSON.stringify(coachData, null, 2));

// Salvar spreadsheet placeholder
const spreadsheetPath = path.join(coachDir, 'spreadsheet-id.txt');
fs.writeFileSync(spreadsheetPath, 
`# Cole aqui o ID da planilha do Google Sheets
# Exemplo: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms

`);

// Criar README
const readmePath = path.join(coachDir, 'README.md');
const readmeContent = `# Treinador: ${name}

## 📋 Informações

- **Email:** ${email}
- **Time:** ${teamName}
- **Esporte:** ${sport}
- **Criado em:** ${new Date().toLocaleDateString('pt-BR')}

## 🚀 Próximos Passos

### Opção 1: Usar Localmente (Rápido) ⚡

Você já pode fazer login no sistema:

\`\`\`bash
npm run dev
\`\`\`

Acesse: http://localhost:5173
- Email: ${email}
- Senha: (a que você definiu)

⚠️ **Nota:** Os dados serão salvos localmente (localStorage).

---

### Opção 2: Configurar Google Sheets (Completo)

Para sincronizar com Google Sheets:

#### 1. Criar Planilha

1. Acesse: https://sheets.google.com
2. Crie nova planilha: **"${teamName} - Scout 21 Pro"**

#### 2. Criar Abas

Crie estas 11 abas (exatamente com estes nomes):

1. players
2. matches
3. match_player_stats
4. injuries
5. assessments
6. schedules
7. schedule_days
8. competitions
9. stat_targets
10. time_controls
11. championship_matches

#### 3. Adicionar Headers

Veja os headers em: \`GOOGLE_SHEETS_SETUP.md\`

#### 4. Configurar Apps Script

1. Na planilha: Extensões > Apps Script
2. Cole o código de: \`google-apps-script-COMPLETO.js\`
3. Atualize o SPREADSHEET_ID
4. Implante como Web App

#### 5. Configurar no Sistema

Edite: \`src/config.ts\`

\`\`\`typescript
export const API_URL = 'SUA_URL_DO_APPS_SCRIPT';
\`\`\`

---

## ✅ Status

- [x] Treinador criado
- [ ] Planilha configurada (opcional)
- [ ] Apps Script implantado (opcional)

---

**🏆 Pronto para começar!**
`;

fs.writeFileSync(readmePath, readmeContent);

// Resultado
console.log('✅ TREINADOR CRIADO COM SUCESSO!\n');
console.log('📋 Informações:\n');
console.log(`   Nome: ${name}`);
console.log(`   Email: ${email}`);
console.log(`   Time: ${teamName}`);
console.log(`   Esporte: ${sport}`);
console.log(`\n📁 Pasta: ${coachDir}`);
console.log('\n🚀 Próximos passos:\n');
console.log('1. Rodar o sistema:');
console.log('   npm run dev\n');
console.log('2. Fazer login:');
console.log(`   Email: ${email}`);
console.log(`   Senha: (a que você definiu)\n`);
console.log('3. Opcional: Configure Google Sheets (veja README.md na pasta)\n');
console.log('═'.repeat(60) + '\n');

