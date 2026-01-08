/**
 * Service para Jogos/Matches
 * Lógica de negócio e orquestração
 */

import { TenantInfo } from '../utils/tenant.helper';
import { matchesRepository } from '../repositories/matches.repository';
import { transformMatchToFrontend } from '../adapters/match.adapter';
import { MatchRecord } from '../types/frontend';
import { NotFoundError } from '../utils/errors';

export const matchesService = {
  /**
   * Buscar todos os jogos do tenant
   */
  async getAll(tenantInfo: TenantInfo): Promise<MatchRecord[]> {
    // Buscar jogos do banco
    const jogos = await matchesRepository.findAll(tenantInfo);
    
    if (jogos.length === 0) {
      return [];
    }

    // Buscar estatísticas para cada jogo
    const matches: MatchRecord[] = [];
    
    for (const jogo of jogos) {
      const [estatisticasEquipe, estatisticasJogadores] = await Promise.all([
        matchesRepository.findEstatisticasEquipe(jogo.id),
        matchesRepository.findEstatisticasJogadores(jogo.id),
      ]);

      if (estatisticasEquipe) {
        matches.push(
          transformMatchToFrontend(
            jogo as any,
            estatisticasJogadores as any,
            estatisticasEquipe as any
          )
        );
      }
    }

    return matches;
  },

  /**
   * Buscar jogo por ID
   */
  async getById(id: string, tenantInfo: TenantInfo): Promise<MatchRecord> {
    const jogo = await matchesRepository.findById(id, tenantInfo);
    
    if (!jogo) {
      throw new NotFoundError('Jogo', id);
    }

    // Buscar estatísticas
    const [estatisticasEquipe, estatisticasJogadores] = await Promise.all([
      matchesRepository.findEstatisticasEquipe(id),
      matchesRepository.findEstatisticasJogadores(id),
    ]);

    if (!estatisticasEquipe) {
      throw new NotFoundError('Estatísticas do jogo', id);
    }

    return transformMatchToFrontend(
      jogo as any,
      estatisticasJogadores as any,
      estatisticasEquipe as any
    );
  },

  /**
   * Criar novo jogo
   */
  async create(data: {
    equipeId: string;
    adversario: string;
    data: Date;
    campeonato?: string;
    competicaoId?: string;
    local?: string;
    resultado?: string;
    golsPro?: number;
    golsContra?: number;
    videoUrl?: string;
  }, tenantInfo: TenantInfo): Promise<MatchRecord> {
    // Validar que equipe pertence ao tenant
    if (!tenantInfo.equipe_ids?.includes(data.equipeId)) {
      throw new NotFoundError('Equipe', data.equipeId);
    }

    // Criar jogo
    const jogo = await matchesRepository.create(data);

    // Criar estatísticas vazias da equipe
    await matchesRepository.upsertEstatisticasEquipe(jogo.id, {
      minutosJogados: 0,
      gols: data.golsPro || 0,
      golsSofridos: data.golsContra || 0,
      assistencias: 0,
      cartoesAmarelos: 0,
      cartoesVermelhos: 0,
      passesCorretos: 0,
      passesErrados: 0,
      passesErradosTransicao: 0,
      desarmesComBola: 0,
      desarmesContraAtaque: 0,
      desarmesSemBola: 0,
      chutesNoGol: 0,
      chutesFora: 0,
      rpePartida: null,
      golsMarcadosJogoAberto: 0,
      golsMarcadosBolaParada: 0,
      golsSofridosJogoAberto: 0,
      golsSofridosBolaParada: 0,
    });

    // Buscar estatísticas criadas
    const estatisticasEquipe = await matchesRepository.findEstatisticasEquipe(jogo.id);

    // Buscar estatísticas de jogadores
    const estatisticasJogadores = await matchesRepository.findEstatisticasJogadores(jogo.id);
    
    return transformMatchToFrontend(
      jogo as any,
      estatisticasJogadores as any,
      estatisticasEquipe || undefined
    );
  },

  /**
   * Atualizar jogo
   */
  async update(id: string, data: Partial<any>, tenantInfo: TenantInfo): Promise<MatchRecord> {
    // Verificar se jogo existe e pertence ao tenant
    const existing = await matchesRepository.findById(id, tenantInfo);
    if (!existing) {
      throw new NotFoundError('Jogo', id);
    }

    // Atualizar
    const jogo = await matchesRepository.update(id, data);

    // Buscar estatísticas
    const [estatisticasEquipe, estatisticasJogadores] = await Promise.all([
      matchesRepository.findEstatisticasEquipe(id),
      matchesRepository.findEstatisticasJogadores(id),
    ]);

    if (!estatisticasEquipe) {
      throw new NotFoundError('Estatísticas do jogo', id);
    }

    return transformMatchToFrontend(
      jogo as any,
      estatisticasJogadores as any,
      estatisticasEquipe as any
    );
  },

  /**
   * Deletar jogo
   */
  async delete(id: string, tenantInfo: TenantInfo): Promise<boolean> {
    // Verificar se jogo existe e pertence ao tenant
    const existing = await matchesRepository.findById(id, tenantInfo);
    if (!existing) {
      throw new NotFoundError('Jogo', id);
    }

    await matchesRepository.delete(id);
    return true;
  },
};

