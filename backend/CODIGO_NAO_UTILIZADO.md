# Código e Funcionalidades Não Utilizadas

## 🔍 Análise Completa

### Backend - Sistema EAV (Entity-Attribute-Value)

**Status:** Implementado no schema, mas não usado pelo frontend

**Tabelas:**
- `categorias`
- `subcategorias`
- `campos`
- `registros`
- `registros_valores`

**Motivo:** Sistema dinâmico para criar categorias e campos customizados, preparado para uso futuro.

**Recomendação:** 
- Manter no schema para uso futuro
- Não implementar endpoints agora (economia de recursos)
- Documentar como funcionalidade futura

### Backend - Campos Opcionais Não Usados

**Tabela `avaliacoes_fisicas`:**
- Todos os campos estão sendo usados (incluindo skinfolds)

**Tabela `jogos`:**
- Campo `video_url` - pode não estar sendo usado no frontend
- Campo `local` - pode não estar sendo usado

**Tabela `jogadores`:**
- Todos os campos principais estão sendo usados

### Frontend - Campos Derivados

**PlayerTimeControl:**
- `playerName`, `position`, `jerseyNumber`, `date`, `totalTime` - são calculados no frontend, não vêm do backend
- Backend retorna apenas: `id`, `matchId`, `playerId`, `entries`, `totalMinutes`

**Status:** ✅ Correto - Frontend calcula campos derivados

## 📋 Resumo de Funcionalidades

### ✅ Funcionalidades Implementadas e Usadas

1. **Autenticação** - Login/Registro
2. **Jogadores** - CRUD completo
3. **Jogos** - CRUD completo com estatísticas
4. **Avaliações Físicas** - CRUD completo com skinfolds
5. **Programações** - CRUD completo
6. **Competições** - Listar e criar
7. **Metas de Estatísticas** - Get e Update
8. **Jogos de Campeonato** - CRUD completo
9. **Controle de Tempo** - Get e Save por jogo

### ⚠️ Funcionalidades Preparadas mas Não Usadas

1. **Sistema EAV** - Preparado para categorias dinâmicas futuras
2. **Tabela `jogos_eventos`** - Usada apenas para TimeControl (ENTRADA/SAIDA)

### 🗑️ Código Removido/Arquivado

1. **Google Sheets Integration** - Arquivado em `_archived/google-sheets/`
2. **Scripts de setup do Google Drive** - Arquivados
3. **Dados locais antigos** - Arquivados

## ✅ Integração Frontend-Backend

### Endpoints Alinhados

- ✅ `/api/players` - Funcionando
- ✅ `/api/matches` - Funcionando
- ✅ `/api/assessments` - Funcionando
- ✅ `/api/schedules` - Funcionando
- ✅ `/api/competitions` - Funcionando (retorna array de strings)
- ✅ `/api/stat-targets` - Funcionando (retorna array, update sem ID)
- ✅ `/api/championship-matches` - Funcionando
- ✅ `/api/time-controls` - Funcionando (novo)

### Adapters Criados

- ✅ `match.adapter.ts` - MatchRecord
- ✅ `player.adapter.ts` - Player com injuryHistory
- ✅ `schedule.adapter.ts` - WeeklySchedule
- ✅ `statTargets.adapter.ts` - StatTargets (novo)

## 📊 Estatísticas

- **Endpoints implementados:** 8 principais + auth
- **Adapters criados:** 4
- **Repositories criados:** 9
- **Services criados:** 8
- **Controllers criados:** 8
- **Código arquivado:** ~10 arquivos

---

**Data:** 2025-01-06
**Status:** ✅ Revisão completa - Integração alinhada

