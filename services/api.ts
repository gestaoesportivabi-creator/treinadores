/**
 * Serviço de API para comunicação com Google Apps Script
 * 
 * IMPORTANTE - Método Override Pattern:
 * - Google Apps Script só suporta GET e POST nativamente
 * - PUT/DELETE são simulados via parâmetro 'method' em POST/GET
 * - Isso evita requisições preflight OPTIONS (que causam erro CORS)
 * - Content-Type: text/plain evita preflight (application/json requer preflight)
 */

import { API_URL, API_RESOURCES } from '../config';
import { Player, MatchRecord, PhysicalAssessment, WeeklySchedule, StatTargets, PlayerTimeControl } from '../types';

// Tipos de resposta da API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Função genérica para fazer requisições GET
 */
async function get<T>(resource: string, id?: string): Promise<T[]> {
  try {
    const path = id ? `${resource}/${id}` : resource;
    const params = new URLSearchParams();
    params.append('path', path);
    params.append('method', 'GET');
    
    const url = `${API_URL}?${params.toString()}`;
    console.log(`📡 GET ${resource}:`, url);
    
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error('Response text:', text);
      return [];
    }

    let result: ApiResponse<T[]>;
    try {
      const responseText = await response.text();
      console.log(`📥 GET ${resource} response text (primeiros 500 chars):`, responseText.substring(0, 500));
      
      try {
        result = JSON.parse(responseText);
        console.log(`📥 GET ${resource} response parsed:`, result);
      } catch (parseError) {
        console.error(`❌ Erro ao parsear JSON de ${resource}:`, parseError);
        console.error('Response text completo:', responseText);
        return [];
      }
    } catch (jsonError) {
      console.error(`❌ Erro ao ler response de ${resource}:`, jsonError);
      return [];
    }

    if (!result.success) {
      console.error(`❌ API Error para ${resource}:`, result.error);
      console.error(`📋 Dados retornados mesmo com erro:`, result.data);
      // Mesmo com erro, tentar retornar os dados se existirem
      if (result.data && Array.isArray(result.data)) {
        console.log('⚠️ Retornando dados mesmo com success=false');
        return result.data;
      }
      return [];
    }

    const data = result.data || [];
    console.log(`✅ GET ${resource} - ${data.length} itens retornados`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching ${resource}:`, error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return [];
  }
}

/**
 * Função genérica para fazer requisições POST
 * 
 * Usa Content-Type: text/plain para evitar requisições preflight OPTIONS
 * O Google Apps Script parseia o JSON do body automaticamente
 */
async function post<T>(resource: string, data: T): Promise<T | null> {
  try {
    const params = new URLSearchParams();
    params.append('path', resource);
    params.append('method', 'POST');
    
    const url = `${API_URL}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Evita preflight OPTIONS
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      console.error('API Error:', result.error);
      return null;
    }

    return result.data || null;
  } catch (error) {
    console.error(`Error posting ${resource}:`, error);
    return null;
  }
}

/**
 * Função genérica para fazer requisições PUT
 * 
 * SIMULA PUT via POST com parâmetro method=PUT
 * Usa Content-Type: text/plain para evitar preflight OPTIONS
 */
async function put<T>(resource: string, id: string, data: Partial<T>): Promise<T | null> {
  try {
    const params = new URLSearchParams();
    params.append('path', `${resource}/${id}`);
    params.append('method', 'PUT'); // Method override: PUT simulado via POST
    
    const url = `${API_URL}?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'POST', // SEMPRE usar POST (não PUT real)
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Evita preflight OPTIONS
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      console.error('API Error:', result.error);
      return null;
    }

    return result.data || null;
  } catch (error) {
    console.error(`Error updating ${resource}:`, error);
    return null;
  }
}

/**
 * Função genérica para fazer requisições DELETE
 * 
 * SIMULA DELETE via GET com parâmetro method=DELETE
 * GET não requer preflight OPTIONS, então funciona perfeitamente
 */
async function del(resource: string, id: string): Promise<boolean> {
  try {
    console.log(`🗑️ Tentando deletar ${resource} com ID: ${id}`);
    
    const params = new URLSearchParams();
    params.append('path', `${resource}/${id}`);
    params.append('method', 'DELETE'); // Method override: DELETE simulado via GET
    
    const url = `${API_URL}?${params.toString()}`;
    console.log(`📡 URL da requisição DELETE: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET', // SEMPRE usar GET (não DELETE real) - evita preflight OPTIONS
    });

    const result: ApiResponse<any> = await response.json();
    console.log(`📥 Resposta DELETE:`, result);

    if (!result.success) {
      console.error('❌ API Error:', result.error);
      console.error('📋 Detalhes:', { resource, id, result });
      return false;
    }

    console.log(`✅ ${resource} deletado com sucesso!`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting ${resource}:`, error);
    if (error instanceof Error) {
      console.error('Erro detalhado:', error.message, error.stack);
    }
    return false;
  }
}

/**
 * API específica para Players
 */
export const playersApi = {
  getAll: () => get<Player>(API_RESOURCES.players),
  getById: (id: string) => get<Player>(API_RESOURCES.players, id).then(arr => arr[0] || null),
  create: (player: Player) => post<Player>(API_RESOURCES.players, player),
  update: (id: string, player: Partial<Player>) => put<Player>(API_RESOURCES.players, id, player),
  delete: (id: string) => del(API_RESOURCES.players, id),
};

/**
 * API específica para Matches
 */
export const matchesApi = {
  getAll: () => get<MatchRecord>(API_RESOURCES.matches),
  getById: (id: string) => get<MatchRecord>(API_RESOURCES.matches, id).then(arr => arr[0] || null),
  create: (match: MatchRecord) => post<MatchRecord>(API_RESOURCES.matches, match),
  update: (id: string, match: Partial<MatchRecord>) => put<MatchRecord>(API_RESOURCES.matches, id, match),
  delete: (id: string) => del(API_RESOURCES.matches, id),
};

/**
 * API específica para Assessments
 */
export const assessmentsApi = {
  getAll: () => get<PhysicalAssessment>(API_RESOURCES.assessments),
  getById: (id: string) => get<PhysicalAssessment>(API_RESOURCES.assessments, id).then(arr => arr[0] || null),
  create: (assessment: PhysicalAssessment) => post<PhysicalAssessment>(API_RESOURCES.assessments, assessment),
  update: (id: string, assessment: Partial<PhysicalAssessment>) => put<PhysicalAssessment>(API_RESOURCES.assessments, id, assessment),
  delete: (id: string) => del(API_RESOURCES.assessments, id),
};

/**
 * API específica para Schedules
 */
export const schedulesApi = {
  getAll: () => get<WeeklySchedule>(API_RESOURCES.schedules),
  getById: (id: string) => get<WeeklySchedule>(API_RESOURCES.schedules, id).then(arr => arr[0] || null),
  create: (schedule: WeeklySchedule) => post<WeeklySchedule>(API_RESOURCES.schedules, schedule),
  update: (id: string, schedule: Partial<WeeklySchedule>) => put<WeeklySchedule>(API_RESOURCES.schedules, id, schedule),
  delete: (id: string) => del(API_RESOURCES.schedules, id),
};

/**
 * API específica para Competitions (array simples de strings)
 */
export const competitionsApi = {
  getAll: async (): Promise<string[]> => {
    const data = await get<{ name: string }>(API_RESOURCES.competitions);
    return data.map(item => item.name || '').filter(name => name);
  },
  create: async (name: string): Promise<boolean> => {
    const result = await post(API_RESOURCES.competitions, { name });
    return result !== null;
  },
};

/**
 * API específica para Stat Targets
 */
export const statTargetsApi = {
  getAll: () => get<StatTargets>(API_RESOURCES.statTargets),
  getById: (id: string) => get<StatTargets>(API_RESOURCES.statTargets, id).then(arr => arr[0] || null),
  update: (id: string, targets: Partial<StatTargets>) => put<StatTargets>(API_RESOURCES.statTargets, id, targets),
};

/**
 * API específica para Controle de Tempo Jogado
 */
export const timeControlsApi = {
  getAll: () => get<PlayerTimeControl>(API_RESOURCES.timeControls),
  getById: (id: string) => get<PlayerTimeControl>(API_RESOURCES.timeControls, id).then(arr => arr[0] || null),
  create: (timeControl: PlayerTimeControl) => post<PlayerTimeControl>(API_RESOURCES.timeControls, timeControl),
  update: (id: string, timeControl: Partial<PlayerTimeControl>) => put<PlayerTimeControl>(API_RESOURCES.timeControls, id, timeControl),
  delete: (id: string) => del(API_RESOURCES.timeControls, id),
  getByMatchId: async (matchId: string): Promise<PlayerTimeControl[]> => {
    const all = await get<PlayerTimeControl>(API_RESOURCES.timeControls);
    return all.filter(tc => tc.matchId === matchId);
  },
};

/**
 * API específica para Tabela de Campeonato
 */
export const championshipMatchesApi = {
  getAll: async () => {
    console.log('🔍 championshipMatchesApi.getAll chamado');
    const result = await get<any>(API_RESOURCES.championshipMatches);
    console.log('📥 championshipMatchesApi.getAll resultado:', result);
    console.log('📊 Tipo do resultado:', typeof result, Array.isArray(result));
    console.log('📊 Quantidade de itens:', result?.length || 0);
    if (result && result.length > 0) {
      console.log('📋 Primeiro item:', result[0]);
    }
    return result;
  },
  getById: (id: string) => get<any>(API_RESOURCES.championshipMatches, id).then(arr => arr[0] || null),
  create: (match: any) => post<any>(API_RESOURCES.championshipMatches, match),
  update: (id: string, match: Partial<any>) => put<any>(API_RESOURCES.championshipMatches, id, match),
  delete: (id: string) => del(API_RESOURCES.championshipMatches, id),
};

