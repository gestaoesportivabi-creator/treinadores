/**
 * ============================================
 * SCOUT 21 PRO - Google Apps Script API (VERSÃO CORRIGIDA)
 * ============================================
 * 
 * INSTRUÇÕES:
 * 1. Se o script foi criado DENTRO da planilha (Extensões > Apps Script):
 *    - Use a versão com getActiveSpreadsheet() (linha 52)
 *    - COMENTE a linha 53 e DESCOMENTE a linha 54
 * 
 * 2. Se o script foi criado SEPARADO da planilha:
 *    - Use a versão com openById() (linha 53)
 *    - COMENTE a linha 54
 *    - Configure o SPREADSHEET_ID na linha 25
 * 
 * ============================================
 */

// ⚙️ CONFIGURAÇÃO - SUBSTITUA PELO ID DA SUA PLANILHA (se script separado)
const SPREADSHEET_ID = '1h1EeCezkEfFZ-ox0brs3G8f0f4DODEsTXv10WYduL2w';

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

// Obter planilha - VERSÃO CORRIGIDA
function getSpreadsheet() {
  try {
    // OPÇÃO 1: Se o script está vinculado à planilha (recomendado)
    // Se você criou o script através de: Extensões > Apps Script
    // Use esta linha:
    return SpreadsheetApp.getActiveSpreadsheet();
    
    // OPÇÃO 2: Se o script está separado da planilha
    // Descomente esta linha e comente a linha acima:
    // return SpreadsheetApp.openById(SPREADSHEET_ID);
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
      // Se a aba não existir, criar
      sheet = ss.insertSheet(sheetName);
      // Criar headers básicos se necessário (opcional)
      // sheet.appendRow(['id', 'name', ...]);
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
    // Suportar CORS
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Google Apps Script só suporta GET e POST diretamente
    // Para PUT/DELETE, usamos parâmetro method via POST ou GET
    let method = 'GET';
    let path = '';
    let requestData = {};
    
    // Detectar método HTTP
    if (e.parameter.method) {
      method = e.parameter.method.toUpperCase();
    } else if (e.postData && e.postData.type === 'application/json') {
      try {
        const parsed = JSON.parse(e.postData.contents);
        method = parsed.method || 'POST';
        path = parsed.path || e.parameter.path || '';
        requestData = parsed.data || parsed;
      } catch (err) {
        method = 'POST';
      }
    } else if (e.postData) {
      method = 'POST';
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
          const requestData = e.parameter.data ? JSON.parse(e.parameter.data) : (e.postData ? JSON.parse(e.postData.contents) : {});
          result = updateData(sheetName, id, requestData);
        } else if (e.parameter.action === 'delete') {
          result = deleteData(sheetName, id);
        } else {
          // POST /resource (criar)
          const requestData = e.parameter.data ? JSON.parse(e.parameter.data) : (e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {});
          result = insertData(sheetName, requestData);
        }
      } else {
        // POST /resource (criar)
        const requestData = e.parameter.data ? JSON.parse(e.parameter.data) : (e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {});
        result = insertData(sheetName, requestData);
      }
    } else if (method === 'PUT' || method === 'PATCH') {
      // PUT /resource/:id (atualizar via parâmetro)
      if (!id) {
        result = { success: false, error: 'ID required for update' };
      } else {
        const requestData = e.parameter.data ? JSON.parse(e.parameter.data) : (e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {});
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
    Logger.log('Testando conexão com planilha...');
    
    // Teste básico
    const ss = getSpreadsheet();
    Logger.log('✅ Planilha obtida com sucesso!');
    Logger.log('Nome da planilha: ' + ss.getName());
    
    // Teste obter aba
    const sheet = getSheet('players');
    Logger.log('✅ Aba obtida/criada com sucesso!');
    
    // Teste obter dados
    const data = getAllData('players');
    Logger.log('✅ Dados obtidos: ' + data.length + ' registros');
    
    Logger.log('✅ Todos os testes passaram!');
  } catch (error) {
    Logger.log('❌ Erro no teste: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
  }
}









