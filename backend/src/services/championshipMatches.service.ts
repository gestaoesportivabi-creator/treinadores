/**
 * Service para Jogos de Campeonato
 */

import { TenantInfo } from '../utils/tenant.helper';
import { championshipMatchesRepository } from '../repositories/championshipMatches.repository';
import { NotFoundError } from '../utils/errors';

// Transformar jogo de campeonato do banco para frontend
function transformChampionshipMatchToFrontend(jogo: any) {
  return {
    id: jogo.id,
    date: jogo.data instanceof Date ? jogo.data.toISOString().split('T')[0] : jogo.data,
    time: jogo.horario || '',
    team: jogo.equipe,
    opponent: jogo.adversario,
    competition: jogo.competicao || '',
    matchId: jogo.jogoId,
  };
}

export const championshipMatchesService = {
  /**
   * Buscar todos os jogos de campeonato do tenant
   */
  async getAll(tenantInfo: TenantInfo) {
    const jogos = await championshipMatchesRepository.findAll(tenantInfo);
    return jogos.map(transformChampionshipMatchToFrontend);
  },

  /**
   * Buscar jogo por ID
   */
  async getById(id: string, tenantInfo: TenantInfo) {
    const jogo = await championshipMatchesRepository.findById(id, tenantInfo);
    
    if (!jogo) {
      throw new NotFoundError('Jogo de campeonato', id);
    }

    return transformChampionshipMatchToFrontend(jogo);
  },

  /**
   * Criar jogo de campeonato
   */
  async create(data: any, _tenantInfo: TenantInfo) {
    const jogo = await championshipMatchesRepository.create(data);
    return transformChampionshipMatchToFrontend(jogo);
  },

  /**
   * Atualizar jogo de campeonato
   */
  async update(id: string, data: Partial<any>, tenantInfo: TenantInfo) {
    const existing = await championshipMatchesRepository.findById(id, tenantInfo);
    if (!existing) {
      throw new NotFoundError('Jogo de campeonato', id);
    }

    const jogo = await championshipMatchesRepository.update(id, data);
    return transformChampionshipMatchToFrontend(jogo);
  },

  /**
   * Deletar jogo de campeonato
   */
  async delete(id: string, tenantInfo: TenantInfo): Promise<boolean> {
    const existing = await championshipMatchesRepository.findById(id, tenantInfo);
    if (!existing) {
      throw new NotFoundError('Jogo de campeonato', id);
    }

    await championshipMatchesRepository.delete(id);
    return true;
  },
};

