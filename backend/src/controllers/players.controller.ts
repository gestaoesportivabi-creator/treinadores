/**
 * Controller para Jogadores
 * Seguindo convenções: apenas recebe requisições e chama services
 */

import { Request, Response } from 'express';
import { playersService } from '../services/players.service';
import { AppError } from '../utils/errors';

export const playersController = {
  /**
   * GET /api/players
   */
  getAll: async (req: Request, res: Response) => {
    try {
      const players = await playersService.getAll(req.tenantInfo!);
      return res.json({ success: true, data: players });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar jogadores',
      });
    }
  },

  /**
   * GET /api/players/:id
   */
  getById: async (req: Request, res: Response) => {
    try {
      const player = await playersService.getById(req.params.id, req.tenantInfo!);
      return res.json({ success: true, data: player });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar jogador',
      });
    }
  },

  /**
   * POST /api/players
   */
  create: async (req: Request, res: Response) => {
    try {
      // DEBUG: Log do tenantInfo e body recebido
      console.log('[PLAYERS_CONTROLLER] create - Dados recebidos:', {
        tenant_tecnico_id: req.tenantInfo?.tecnico_id,
        tenant_clube_id: req.tenantInfo?.clube_id,
        tenant_equipe_ids: req.tenantInfo?.equipe_ids,
        user_email: req.user?.email,
        user_id: req.user?.id,
        body: {
          nome: req.body.nome,
          equipeId: req.body.equipeId,
          numeroCamisa: req.body.numeroCamisa,
          position: req.body.position,
        },
      });

      if (!req.tenantInfo) {
        console.error('[PLAYERS_CONTROLLER] create - ERRO: tenantInfo não está disponível');
        return res.status(500).json({
          success: false,
          error: 'Tenant info não disponível',
        });
      }

      const player = await playersService.create(req.body, req.tenantInfo);
      
      console.log('[PLAYERS_CONTROLLER] create - Jogador criado com sucesso:', {
        id: player.id,
        nome: player.name,
      });

      return res.status(201).json({ success: true, data: player });
    } catch (error: any) {
      console.error('[PLAYERS_CONTROLLER] create - ERRO ao criar jogador:', {
        error: error?.message,
        stack: error?.stack,
        code: error?.code,
        meta: error?.meta,
      });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }
      // Retornar mensagem de erro mais detalhada em desenvolvimento
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? error?.message || 'Erro ao criar jogador'
        : 'Erro ao criar jogador';
      return res.status(500).json({
        success: false,
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { details: error?.stack }),
      });
    }
  },

  /**
   * PUT /api/players/:id
   */
  update: async (req: Request, res: Response) => {
    try {
      const player = await playersService.update(req.params.id, req.body, req.tenantInfo!);
      return res.json({ success: true, data: player });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar jogador',
      });
    }
  },

  /**
   * DELETE /api/players/:id
   */
  delete: async (req: Request, res: Response) => {
    try {
      await playersService.delete(req.params.id, req.tenantInfo!);
      return res.json({ success: true });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Erro ao deletar jogador',
      });
    }
  },
};

