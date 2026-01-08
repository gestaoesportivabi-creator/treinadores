/**
 * Service para Programações
 */

import { TenantInfo } from '../utils/tenant.helper';
import { schedulesRepository } from '../repositories/schedules.repository';
import { transformScheduleToFrontend } from '../adapters/schedule.adapter';
import { WeeklySchedule } from '../types/frontend';
import { NotFoundError } from '../utils/errors';

export const schedulesService = {
  /**
   * Buscar todas as programações do tenant
   */
  async getAll(tenantInfo: TenantInfo): Promise<WeeklySchedule[]> {
    const programacoes = await schedulesRepository.findAll(tenantInfo);
    
    if (programacoes.length === 0) {
      return [];
    }

    // Buscar dias para cada programação
    const schedules: WeeklySchedule[] = [];
    
    for (const programacao of programacoes) {
      const dias = await schedulesRepository.findDias(programacao.id);
      schedules.push(
        transformScheduleToFrontend(
          programacao as any,
          dias as any
        )
      );
    }

    return schedules;
  },

  /**
   * Buscar programação por ID
   */
  async getById(id: string, tenantInfo: TenantInfo): Promise<WeeklySchedule> {
    const programacao = await schedulesRepository.findById(id, tenantInfo);
    
    if (!programacao) {
      throw new NotFoundError('Programação', id);
    }

    const dias = await schedulesRepository.findDias(id);

    return transformScheduleToFrontend(
      programacao as any,
      dias as any
    );
  },

  /**
   * Criar programação
   */
  async create(data: {
    equipeId: string;
    titulo: string;
    dataInicio: Date;
    dataFim: Date;
    isAtivo?: boolean;
  }, tenantInfo: TenantInfo): Promise<WeeklySchedule> {
    // Validar que equipe pertence ao tenant
    if (!tenantInfo.equipe_ids?.includes(data.equipeId)) {
      throw new NotFoundError('Equipe', data.equipeId);
    }

    const programacao = await schedulesRepository.create(data);

    return transformScheduleToFrontend(
      programacao as any,
      []
    );
  },

  /**
   * Atualizar programação
   */
  async update(id: string, data: Partial<any>, tenantInfo: TenantInfo): Promise<WeeklySchedule> {
    const existing = await schedulesRepository.findById(id, tenantInfo);
    if (!existing) {
      throw new NotFoundError('Programação', id);
    }

    const programacao = await schedulesRepository.update(id, data);
    const dias = await schedulesRepository.findDias(id);

    return transformScheduleToFrontend(
      programacao as any,
      dias as any
    );
  },

  /**
   * Deletar programação
   */
  async delete(id: string, tenantInfo: TenantInfo): Promise<boolean> {
    const existing = await schedulesRepository.findById(id, tenantInfo);
    if (!existing) {
      throw new NotFoundError('Programação', id);
    }

    await schedulesRepository.delete(id);
    return true;
  },
};

