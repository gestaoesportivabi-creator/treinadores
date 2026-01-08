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
      const player = await playersService.create(req.body, req.tenantInfo!);
      return res.status(201).json({ success: true, data: player });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Erro ao criar jogador',
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

