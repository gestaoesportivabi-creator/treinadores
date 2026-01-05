#!/usr/bin/env node

/**
 * Script para deletar um treinador
 * Uso: node scripts/delete-coach.js [email]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATA_DIR = path.join(__dirname, '..', 'data', 'coaches');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function deleteCoach() {
  const email = process.argv[2];

  console.log('\n🏆 SCOUT 21 PRO - Deletar Treinador\n');
  console.log('═'.repeat(60));

  if (!email) {
    console.error('❌ Uso: node scripts/delete-coach.js [email]');
    console.log('\n💡 Exemplo: node scripts/delete-coach.js joao@email.com');
    console.log('\n📋 Para ver lista de treinadores: node scripts/list-coaches.js');
    console.log('═'.repeat(60) + '\n');
    rl.close();
    return;
  }

  const coachDir = path.join(DATA_DIR, email);

  if (!fs.existsSync(coachDir)) {
    console.error(`❌ Treinador com email ${email} não encontrado!`);
    console.log('\n📋 Para ver lista de treinadores: node scripts/list-coaches.js');
    console.log('═'.repeat(60) + '\n');
    rl.close();
    return;
  }

  const configPath = path.join(coachDir, 'config.json');
  let coachData = null;

  if (fs.existsSync(configPath)) {
    try {
      coachData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('⚠️  Erro ao ler config.json:', error.message);
    }
  }

  console.log('\n⚠️  ATENÇÃO: Esta ação é IRREVERSÍVEL!\n');
  
  if (coachData) {
    console.log('📋 Dados do treinador:\n');
    console.log(`   Nome: ${coachData.name}`);
    console.log(`   Email: ${coachData.email}`);
    console.log(`   Time: ${coachData.teamName}`);
    console.log(`   Esporte: ${coachData.sport}`);
  } else {
    console.log(`   Email: ${email}`);
  }

  const confirm1 = await question('\n❓ Tem certeza que deseja DELETAR este treinador? (s/n): ');
  
  if (confirm1.toLowerCase() !== 's') {
    console.log('✅ Operação cancelada.');
    console.log('═'.repeat(60) + '\n');
    rl.close();
    return;
  }

  const confirm2 = await question('\n⚠️  Digite o email do treinador para confirmar: ');
  
  if (confirm2.trim().toLowerCase() !== email.toLowerCase()) {
    console.log('❌ Email não confere. Operação cancelada.');
    console.log('═'.repeat(60) + '\n');
    rl.close();
    return;
  }

  try {
    // Deletar pasta recursivamente
    fs.rmSync(coachDir, { recursive: true, force: true });
    
    console.log('\n✅ TREINADOR DELETADO COM SUCESSO!');
    console.log(`📁 Pasta removida: ${coachDir}`);
    console.log('═'.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Erro ao deletar treinador:', error.message);
    console.log('═'.repeat(60) + '\n');
  } finally {
    rl.close();
  }
}

deleteCoach();

