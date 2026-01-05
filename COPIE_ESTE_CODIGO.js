/**
 * ============================================
 * SCOUT 21 PRO - Google Apps Script API
 * CÓDIGO CORRETO - COPIE ESTE ARQUIVO COMPLETO
 * ============================================
 * 
 * INSTRUÇÕES:
 * 1. Abra sua planilha no Google Sheets
 * 2. Vá em: Extensões > Apps Script
 * 3. DELETE todo o código existente
 * 4. COLE este código completo
 * 5. Salve o projeto (Ctrl+S)
 * 6. Execute a função "test" uma vez para autorizar
 * 7. Publique como aplicativo web:
 *    - Publicar > Implantar como aplicativo da web
 *    - Executar como: Eu
 *    - Quem tem acesso: Qualquer pessoa, mesmo sem login
 *    - Versão: Nova versão (IMPORTANTE!)
 *    - Copie a URL gerada
 * 
 * ============================================
 */

// ⚙️ CONFIGURAÇÃO - ID da Planilha (já configurado)
const SPREADSHEET_ID = '1h1EeCezkEfFZ-oxObrs3G8f0f4DODEsTXv10WYduL2w';

// Nomes das abas (deve corresponder exatamente aos nomes na planilha)
const SHEETS = {
  players: 'players',
  matches: 'matches',
  matchPlayerStats: 'match_player_stats',
  injuries: 'injuries',
  assessments: 'assessments',
  schedules: 'schedules',
  scheduleDays: 'schedule_days',
  budgetEntries: 'budget_entries',
  budgetExpenses: 'budget_expenses',
  competitions: 'competitions',
  statTargets: 'stat_targets',
  users: 'users'
};

/**
 * ============================================
 * FUNÇÕES AUXILIARES
 * ============================================
 */

// Obter planilha ativa - CORRIGIDO (USAR getActiveSpreadsheet)
function getSpreadsheet() {
  try {
    // IMPORTANTE: Use getActiveSpreadsheet() quando o script está DENTRO da planilha
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (error) {
    Logger.log('Erro ao obter planilha: ' + error.toString());
    throw error;
  }
}

// Obter aba específica
function getSheet(sheetName) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      // Se a aba não existir, criar automaticamente
      sheet = ss.insertSheet(sheetName);
    }
    return sheet;
  } catch (error) {
    Logger.log('Erro ao obter aba ' + sheetName + ': ' + error.toString());
    throw error;
  }
}

// Converter linha para objeto (baseado nos headers)
function rowToObject(sheet, row) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const obj = {};
  headers.forEach((header, index) => {
    if (header) {
      obj[header] = row[index] || null;
    }
  });
  return obj;
}

// Converter objeto para linha (baseado nos headers)
function objectToRow(sheet, obj) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return headers.map(header => obj[header] !== undefined ? obj[header] : '');
}

// Obter todos os dados de uma aba
function getAllData(sheetName) {
  try {
    const sheet = getSheet(sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (!headers || headers.length === 0) return [];
    
    const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    
    return data.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        if (header) {
          let value = row[index];
          // Converter valores vazios para null
          if (value === '' || value === null || value === undefined) {
            value = null;
          }
          obj[header] = value;
        }
      });
      return obj;
    });
  } catch (error) {
    Logger.log('Erro ao obter todos os dados de ' + sheetName + ': ' + error.toString());
    return [];
  }
}

// Obter registro por ID
function getDataById(sheetName, id) {
  try {
    const sheet = getSheet(sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return null;
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idColumn = headers.indexOf('id');
    if (idColumn === -1) return null;
    
    const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][idColumn] === id) {
        const obj = {};
        headers.forEach((header, index) => {
          if (header) {
            let value = data[i][index];
            if (value === '' || value === null || value === undefined) {
              value = null;
            }
            obj[header] = value;
          }
        });
        return obj;
      }
    }
    return null;
  } catch (error) {
    Logger.log('Erro ao obter dados por ID de ' + sheetName + ': ' + error.toString());
    return null;
  }
}

// Inserir novo registro
function insertData(sheetName, data) {
  try {
    const sheet = getSheet(sheetName);
    
    // Se a aba estiver vazia, criar headers se necessário
    if (sheet.getLastRow() === 0) {
      const headers = Object.keys(data);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = objectToRow(sheet, data);
    sheet.appendRow(row);
    
    return { success: true, data: data };
  } catch (error) {
    Logger.log('Erro ao inserir dados em ' + sheetName + ': ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// Atualizar registro
function updateData(sheetName, id, data) {
  try {
    const sheet = getSheet(sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, error: 'No data found' };
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idColumn = headers.indexOf('id');
    if (idColumn === -1) return { success: false, error: 'ID column not found' };
    
    const dataRange = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (let i = 0; i < dataRange.length; i++) {
      if (dataRange[i][idColumn] === id) {
        const rowIndex = i + 2; // +2 porque começa na linha 2 (pula header)
        headers.forEach((header, colIndex) => {
          if (data.hasOwnProperty(header)) {
            sheet.getRange(rowIndex, colIndex + 1).setValue(data[header]);
          }
        });
        return { success: true, data: { ...getDataById(sheetName, id), ...data } };
      }
    }
    return { success: false, error: 'Record not found' };
  } catch (error) {
    Logger.log('Erro ao atualizar dados em ' + sheetName + ': ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// Deletar registro
function deleteData(sheetName, id) {
  try {
    const sheet = getSheet(sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: false, error: 'No data found' };
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idColumn = headers.indexOf('id');
    if (idColumn === -1) return { success: false, error: 'ID column not found' };
    
    const dataRange = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    for (let i = 0; i < dataRange.length; i++) {
      if (dataRange[i][idColumn] === id) {
        const rowIndex = i + 2;
        sheet.deleteRow(rowIndex);
        return { success: true };
      }
    }
    return { success: false, error: 'Record not found' };
  } catch (error) {
    Logger.log('Erro ao deletar dados de ' + sheetName + ': ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * ============================================
 * HANDLERS HTTP (GET, POST, PUT, DELETE)
 * ============================================
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    // Suportar CORS - IMPORTANTE para requisições do frontend
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Google Apps Script só suporta GET e POST diretamente
    // Para PUT/DELETE, usamos parâmetro method via POST ou GET
    let method = 'GET';
    let path = '';
    let requestData = {};
    
    // Detectar método HTTP e obter dados
    if (e.parameter.method) {
      method = e.parameter.method.toUpperCase();
    } else if (e.postData) {
      method = 'POST';
      
      // Tentar parsear JSON primeiro
      if (e.postData.type === 'application/json') {
        try {
          const parsed = JSON.parse(e.postData.contents);
          method = parsed.method || 'POST';
          path = parsed.path || e.parameter.path || '';
          requestData = parsed.data || parsed;
        } catch (err) {
          // Se falhar, tratar como POST normal
        }
      }
      // Se for form-urlencoded, obter dados do parâmetro
      else if (e.postData.type === 'application/x-www-form-urlencoded' || e.parameter.data) {
        try {
          requestData = e.parameter.data ? JSON.parse(e.parameter.data) : {};
        } catch (err) {
          // Se falhar, usar parâmetros diretamente
          requestData = e.parameter;
        }
      }
    }
    
    // Obter path
    if (!path) {
      path = e.parameter.path || '';
    }
    
    // Roteamento
    const pathParts = path.split('/').filter(p => p);
    const resource = pathParts[0];
    const id = pathParts[1];
    
    // Mapear nomes de recursos para abas
    const resourceMap = {
      'players': SHEETS.players,
      'matches': SHEETS.matches,
      'match-player-stats': SHEETS.matchPlayerStats,
      'injuries': SHEETS.injuries,
      'assessments': SHEETS.assessments,
      'schedules': SHEETS.schedules,
      'schedule-days': SHEETS.scheduleDays,
      'budget-entries': SHEETS.budgetEntries,
      'budget-expenses': SHEETS.budgetExpenses,
      'competitions': SHEETS.competitions,
      'stat-targets': SHEETS.statTargets,
      'users': SHEETS.users
    };
    
    const sheetName = resourceMap[resource];
    
    if (!sheetName) {
      output.setContent(JSON.stringify({ 
        success: false, 
        error: 'Resource not found',
        available: Object.keys(resourceMap),
        path: path,
        resource: resource
      }));
      return output;
    }
    
    let result;
    
    // Processar requisição
    if (method === 'GET') {
      if (id) {
        // GET /resource/:id
        const data = getDataById(sheetName, id);
        result = data ? { success: true, data: data } : { success: false, error: 'Not found' };
      } else {
        // GET /resource
        const data = getAllData(sheetName);
        result = { success: true, data: data };
      }
    } else if (method === 'POST') {
      // POST pode ser CREATE ou UPDATE/DELETE dependendo do path
      if (path.includes('/')) {
        // Se tem ID no path, pode ser UPDATE
        if (e.parameter.action === 'update' || e.parameter.action === 'put') {
          // Obter dados do requestData já processado ou tentar parsear novamente
          if (Object.keys(requestData).length === 0) {
            if (e.parameter.data) {
              try {
                requestData = JSON.parse(e.parameter.data);
              } catch (err) {
                requestData = {};
              }
            } else if (e.postData && e.postData.contents) {
              try {
                requestData = JSON.parse(e.postData.contents);
              } catch (err) {
                requestData = {};
              }
            }
          }
          result = updateData(sheetName, id, requestData);
        } else if (e.parameter.action === 'delete') {
          result = deleteData(sheetName, id);
        } else {
          // POST /resource (criar)
          // Obter dados do requestData já processado ou tentar parsear novamente
          if (Object.keys(requestData).length === 0) {
            if (e.parameter.data) {
              try {
                requestData = JSON.parse(e.parameter.data);
              } catch (err) {
                requestData = {};
              }
            } else if (e.postData && e.postData.contents) {
              try {
                requestData = JSON.parse(e.postData.contents);
              } catch (err) {
                requestData = {};
              }
            }
          }
          result = insertData(sheetName, requestData);
        }
      } else {
        // POST /resource (criar)
        // Obter dados do requestData já processado ou tentar parsear novamente
        if (Object.keys(requestData).length === 0) {
          if (e.parameter.data) {
            try {
              requestData = JSON.parse(e.parameter.data);
            } catch (err) {
              requestData = {};
            }
          } else if (e.postData && e.postData.contents) {
            try {
              requestData = JSON.parse(e.postData.contents);
            } catch (err) {
              requestData = {};
            }
          }
        }
        result = insertData(sheetName, requestData);
      }
    } else if (method === 'PUT' || method === 'PATCH') {
      // PUT /resource/:id (atualizar via parâmetro)
      if (!id) {
        result = { success: false, error: 'ID required for update' };
      } else {
        // Obter dados do requestData já processado ou tentar parsear novamente
        if (Object.keys(requestData).length === 0) {
          if (e.parameter.data) {
            try {
              requestData = JSON.parse(e.parameter.data);
            } catch (err) {
              requestData = {};
            }
          } else if (e.postData && e.postData.contents) {
            try {
              requestData = JSON.parse(e.postData.contents);
            } catch (err) {
              requestData = {};
            }
          }
        }
        result = updateData(sheetName, id, requestData);
      }
    } else if (method === 'DELETE') {
      // DELETE /resource/:id (deletar via parâmetro)
      if (!id) {
        result = { success: false, error: 'ID required for delete' };
      } else {
        result = deleteData(sheetName, id);
      }
    } else {
      result = { success: false, error: 'Method not allowed: ' + method };
    }
    
    output.setContent(JSON.stringify(result));
    return output;
    
  } catch (error) {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(JSON.stringify({ 
      success: false, 
      error: error.toString(),
      message: error.message,
      stack: error.stack
    }));
    return output;
  }
}

/**
 * ============================================
 * FUNÇÃO DE TESTE
 * ============================================
 */

function test() {
  try {
    Logger.log('🧪 Testando conexão com planilha...');
    
    // Teste básico
    const ss = getSpreadsheet();
    Logger.log('✅ Planilha obtida com sucesso!');
    Logger.log('📋 Nome da planilha: ' + ss.getName());
    
    // Teste obter aba
    const sheet = getSheet('players');
    Logger.log('✅ Aba obtida/criada com sucesso!');
    
    // Teste obter dados
    const data = getAllData('players');
    Logger.log('✅ Dados obtidos: ' + data.length + ' registros');
    
    Logger.log('✅✅✅ Todos os testes passaram! ✅✅✅');
    return 'Teste concluído com sucesso! Veja os logs acima.';
  } catch (error) {
    Logger.log('❌ Erro no teste: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    return 'Erro no teste. Veja os logs.';
  }
}








