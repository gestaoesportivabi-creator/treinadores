/**
 * Service para Jogadores
 * Lógica de negócio e orquestração
 */

import { TenantInfo } from '../utils/tenant.helper';
import { playersRepository } from '../repositories/players.repository';
import { lesoesRepository } from '../repositories/lesoes.repository';
import { assessmentsRepository } from '../repositories/assessments.repository';
import { transformPlayerToFrontend } from '../adapters/player.adapter';
import { Player } from '../types/frontend';
import { NotFoundError } from '../utils/errors';

export const playersService = {
  /**
   * Buscar todos os jogadores do tenant
   */
  async getAll(tenantInfo: TenantInfo): Promise<Player[]> {
    // Buscar jogadores do banco
    const jogadores = await playersRepository.findAll(tenantInfo);
    
    if (jogadores.length === 0) {
      return [];
    }

    // Buscar lesões e avaliações relacionadas
    const jogadorIds = jogadores.map(j => j.id);
    const [lesoes, avaliacoes] = await Promise.all([
      lesoesRepository.findByJogadores(jogadorIds, tenantInfo),
      assessmentsRepository.findAll(tenantInfo),
    ]);

    // Agrupar lesões e avaliações por jogador
    const lesoesMap = new Map<string, typeof lesoes>();
    lesoes.forEach(lesao => {
      const key = lesao.jogadorId;
      if (!lesoesMap.has(key)) {
        lesoesMap.set(key, []);
      }
      lesoesMap.get(key)!.push(lesao);
    });

    const avaliacoesMap = new Map<string, typeof avaliacoes>();
    avaliacoes.forEach(av => {
      const key = av.jogadorId;
      if (!avaliacoesMap.has(key)) {
        avaliacoesMap.set(key, []);
      }
      avaliacoesMap.get(key)!.push(av);
    });

    // Transformar para formato frontend usando adapter
    return jogadores.map(jogador => {
      const lesoesJogador = lesoesMap.get(jogador.id) || [];
      const avaliacoesJogador = avaliacoesMap.get(jogador.id) || [];
      
      return transformPlayerToFrontend(
        jogador as any,
        lesoesJogador as any,
        avaliacoesJogador as any
      );
    });
  },

  /**
   * Buscar jogador por ID
   */
  async getById(id: string, tenantInfo: TenantInfo): Promise<Player> {
    const jogador = await playersRepository.findById(id, tenantInfo);
    
    if (!jogador) {
      throw new NotFoundError('Jogador', id);
    }

    // Buscar lesões e avaliações
    const [lesoes, avaliacoes] = await Promise.all([
      lesoesRepository.findByJogador(id, tenantInfo),
      assessmentsRepository.findByJogador(id, tenantInfo),
    ]);

    return transformPlayerToFrontend(
      jogador as any,
      lesoes as any,
      avaliacoes as any
    );
  },

  /**
   * Criar novo jogador
   */
  async create(data: {
    nome: string;
    apelido?: string;
    dataNascimento?: Date;
    idade?: number;
    funcaoEmQuadra?: string;
    numeroCamisa?: number;
    peDominante?: string;
    altura?: number;
    peso?: number;
    ultimoClube?: string;
    fotoUrl?: string;
    isTransferido?: boolean;
    dataTransferencia?: Date;
    isAtivo?: boolean;
  }, _tenantInfo: TenantInfo): Promise<Player> {
    // Criar jogador
    const jogador = await playersRepository.create(data);

    // Retornar transformado (sem lesões/avaliações ainda)
    return transformPlayerToFrontend(
      jogador as any,
      [],
      []
    );
  },

  /**
   * Atualizar jogador
   */
  async update(id: string, data: Partial<any>, tenantInfo: TenantInfo): Promise<Player> {
    // Verificar se jogador existe e pertence ao tenant
    const existing = await playersRepository.findById(id, tenantInfo);
    if (!existing) {
      throw new NotFoundError('Jogador', id);
    }

    // Atualizar
    const jogador = await playersRepository.update(id, data);

    // Buscar lesões e avaliações
    const [lesoes, avaliacoes] = await Promise.all([
      lesoesRepository.findByJogador(id, tenantInfo),
      assessmentsRepository.findByJogador(id, tenantInfo),
    ]);

    return transformPlayerToFrontend(
      jogador as any,
      lesoes as any,
      avaliacoes as any
    );
  },

  /**
   * Deletar jogador
   */
  async delete(id: string, tenantInfo: TenantInfo): Promise<boolean> {
    // Verificar se jogador existe e pertence ao tenant
    const existing = await playersRepository.findById(id, tenantInfo);
    if (!existing) {
      throw new NotFoundError('Jogador', id);
    }

    await playersRepository.delete(id);
    return true;
  },
};

