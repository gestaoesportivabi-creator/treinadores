#!/usr/bin/env node

/**
 * Script para listar todos os treinadores
 * Uso: node scripts/list-coaches.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'coaches');

function listCoaches() {
  console.log('\n🏆 SCOUT 21 PRO - Lista de Treinadores\n');
  console.log('═'.repeat(80));
  
  if (!fs.existsSync(DATA_DIR)) {
    console.log('❌ Nenhum treinador cadastrado ainda.');
    console.log('\n💡 Use: node scripts/create-coach.js para criar o primeiro treinador.');
    console.log('═'.repeat(80) + '\n');
    return;
  }

  const coaches = fs.readdirSync(DATA_DIR);
  
  if (coaches.length === 0) {
    console.log('❌ Nenhum treinador cadastrado ainda.');
    console.log('\n💡 Use: node scripts/create-coach.js para criar o primeiro treinador.');
    console.log('═'.repeat(80) + '\n');
    return;
  }

  console.log(`\n📊 Total de treinadores: ${coaches.length}\n`);

  coaches.forEach((email, index) => {
    const configPath = path.join(DATA_DIR, email, 'config.json');
    
    if (!fs.existsSync(configPath)) {
      console.log(`⚠️  ${index + 1}. ${email} - (config.json não encontrado)`);
      return;
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const spreadsheetPath = path.join(DATA_DIR, email, 'spreadsheet-id.txt');
      const hasSpreadsheet = fs.existsSync(spreadsheetPath);
      const spreadsheetContent = hasSpreadsheet ? fs.readFileSync(spreadsheetPath, 'utf8').trim() : '';
      const spreadsheetConfigured = spreadsheetContent && !spreadsheetContent.startsWith('#') && spreadsheetContent.length > 10;

      const status = config.active ? '✅ Ativo' : '❌ Inativo';
      const sheetStatus = spreadsheetConfigured ? '✅ Configurada' : '⚠️  Pendente';
      
      console.log(`\n${index + 1}. ${status} | ${config.name}`);
      console.log(`   📧 Email: ${config.email}`);
      console.log(`   ⚽ Time: ${config.teamName}`);
      console.log(`   🏃 Esporte: ${config.sport}`);
      console.log(`   📅 Criado: ${new Date(config.createdAt).toLocaleDateString('pt-BR')}`);
      console.log(`   📊 Planilha: ${sheetStatus}`);
      console.log(`   📁 Pasta: data/coaches/${email}/`);
    } catch (error) {
      console.log(`⚠️  ${index + 1}. ${email} - Erro ao ler configuração: ${error.message}`);
    }
  });

  console.log('\n' + '═'.repeat(80));
  console.log('\n💡 Comandos disponíveis:');
  console.log('   - Criar novo: node scripts/create-coach.js');
  console.log('   - Deletar: node scripts/delete-coach.js [email]');
  console.log('   - Detalhes: cat data/coaches/[email]/config.json');
  console.log('═'.repeat(80) + '\n');
}

listCoaches();

