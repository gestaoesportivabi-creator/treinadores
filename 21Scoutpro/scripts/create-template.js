#!/usr/bin/env node

/**
 * Script para criar o TEMPLATE MESTRE (Planilha Molde)
 * Usado pelo sistema SaaS para clonar para novos clientes.
 */

const {
    authorize,
    createSpreadsheet,
    setupSpreadsheetStructure
} = require('./google-drive-setup');

const readline = require('readline');

async function createTemplate() {
    console.log('\n🏗️  SCOUT 21 PRO - Gerador de Template Master\n');
    console.log('Este script criará uma Planilha Molde limpa com todas as abas e headers atuais.');
    console.log('Use o ID gerado para configurar seu sistema de Registro Automático.\n');

    try {
        // 1. Autorizar
        console.log('🔐 Autorizando...');
        const auth = await authorize();
        console.log('✅ Autorizado.');

        // 2. Criar Planilha
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const title = `TEMPLATE_MASTER_V${timestamp}`;

        console.log(`\n📊 Criando planilha: ${title}...`);
        // Nota: Passamos 'root' ou null como folderId para criar na raiz, ou você pode especificar uma pasta
        // Para simplificar, vou criar na raiz do Drive. O usuário pode mover depois.
        const spreadsheet = await createSpreadsheet(auth, title, null);

        // 3. Configurar Estrutura
        console.log('\n⚙️  Configurando abas e colunas...');
        await setupSpreadsheetStructure(auth, spreadsheet.spreadsheetId);

        // 4. Resultado
        console.log('\n' + '═'.repeat(60));
        console.log('✅ TEMPLATE CRIADO COM SUCESSO!');
        console.log('═'.repeat(60));
        console.log(`\n📄 Nome: ${title}`);
        console.log(`🔗 Link: ${spreadsheet.spreadsheetUrl}`);
        console.log(`🔑 ID:   ${spreadsheet.spreadsheetId}`);
        console.log('\n🚀 PRÓXIMO PASSO:');
        console.log('1. Copie o ID acima.');
        console.log('2. Vá no script da sua planilha "Scout 21 Pro - Admin".');
        console.log('3. Atualize a const TEMPLATE_SPREADSHEET_ID com este ID.');
        console.log('4. Implante Nova Versão.');
        console.log('\n');

    } catch (error) {
        console.error('❌ Erro ao criar template:', error);
    }
}

createTemplate();
