/**
 * Middleware de Multi-tenancy
 * Aplicar ajuste recomendado da Seção 11.2.B (item 12)
 * 
 * OBRIGATÓRIO: Todas as rotas que acessam dados devem usar este middleware
 * para garantir isolamento completo entre tenants (técnicos/clubes)
 */

import { Request, Response, NextFunction } from 'express';
import { getTenantInfo, TenantInfo } from '../utils/tenant.helper';

// Estender Request para incluir tenantInfo
declare global {
  namespace Express {
    interface Request {
      tenantInfo?: TenantInfo;
      user?: {
        id: string;
        role_id: string;
        email: string;
        name: string;
      };
    }
  }
}

/**
 * Middleware que adiciona tenantInfo ao request
 * Deve ser usado após autenticação (auth.middleware)
 */
import prisma from '../config/database';

export function tenantMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verificar se usuário está autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuário não autenticado',
        });
      }

      // Obter informações do tenant usando Prisma
      const tenantInfo = await getTenantInfo(
        req.user,
        async (userId: string) => {
          const tecnico = await prisma.tecnico.findUnique({ where: { userId } });
          if (!tecnico) return null;
          return {
            id: tecnico.id,
            user_id: tecnico.userId,
            nome: tecnico.nome,
          };
        },
        async (userId: string) => {
          const clube = await prisma.clube.findUnique({ where: { userId } });
          if (!clube) return null;
          return {
            id: clube.id,
            user_id: clube.userId,
            razao_social: clube.razaoSocial,
          };
        },
        async (tecnicoId: string) => {
          const equipes = await prisma.equipe.findMany({
            where: { tecnicoId },
            select: { id: true },
          });
          return equipes;
        },
        async (clubeId: string) => {
          const equipes = await prisma.equipe.findMany({
            where: { clubeId },
            select: { id: true },
          });
          return equipes;
        }
      );

      // Verificar se usuário tem tenant associado
      if (!tenantInfo.tecnico_id && !tenantInfo.clube_id) {
        // Usuários ADMIN podem não ter tenant (acesso total)
        // Outros roles devem ter tenant
        const isAdmin = req.user.role_id === 'ADMIN'; // Ajustar conforme sua lógica de roles
        
        if (!isAdmin) {
          return res.status(403).json({
            success: false,
            error: 'Usuário não possui técnico ou clube associado',
          });
        }
      }

      // Adicionar tenantInfo ao request
      req.tenantInfo = tenantInfo;

      next();
      return;
    } catch (error) {
      console.error('Erro no middleware de tenant:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar tenant',
      });
    }
  };
}

/**
 * Helper para validar acesso a uma equipe específica
 */
export function requireEquipeAccess(equipeId: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenantInfo) {
      return res.status(500).json({
        success: false,
        error: 'Tenant info não disponível',
      });
    }

    const hasAccess = req.tenantInfo.equipe_ids?.includes(equipeId) || false;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado a esta equipe',
      });
    }

    next();
    return;
  };
}

/**
 * Helper para validar acesso a um jogo específico (via equipe)
 */
export function requireJogoAccess(
  getEquipeIdByJogoId: (jogoId: string) => Promise<string | null>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jogoId = req.params.id || req.body.jogo_id;

      if (!jogoId) {
        return res.status(400).json({
          success: false,
          error: 'ID do jogo não fornecido',
        });
      }

      if (!req.tenantInfo) {
        return res.status(500).json({
          success: false,
          error: 'Tenant info não disponível',
        });
      }

      const equipeId = await getEquipeIdByJogoId(jogoId);
      if (!equipeId) {
        return res.status(404).json({
          success: false,
          error: 'Jogo não encontrado',
        });
      }

      const hasAccess = req.tenantInfo.equipe_ids?.includes(equipeId) || false;

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado a este jogo',
        });
      }

      next();
      return;
    } catch (error) {
      console.error('Erro ao validar acesso ao jogo:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar acesso',
      });
    }
  };
}

/**
 * Documentação: Rotas que NÃO podem ser filtradas por tenant
 * 
 * Estas rotas devem ser explicitamente documentadas e protegidas por role ADMIN:
 * - GET /api/roles (lista de roles do sistema)
 * - GET /api/competicoes (competições globais - se aplicável)
 * - Rotas de administração do sistema
 * 
 * IMPORTANTE: Qualquer rota que não use tenantMiddleware deve ser documentada
 * e ter validação de role ADMIN.
 */

