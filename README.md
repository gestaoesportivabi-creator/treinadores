<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🏆 SCOUT 21 PRO - Sistema de Gestão Esportiva

Sistema completo de scout, análise e gestão para equipes esportivas.

## 🚀 Deploy Online

**Para colocar o sistema online, consulte o guia completo:** [docs/setup/DEPLOY.md](./docs/setup/DEPLOY.md)

### Opções Rápidas:
- **Vercel** (Recomendado - Mais fácil): https://vercel.com
- **Netlify**: https://netlify.com
- **GitHub Pages**: Veja instruções em docs/setup/DEPLOY.md

## 💻 Executar Localmente

**Pré-requisitos:** Node.js instalado

1. Instalar dependências:
   ```bash
   npm install
   ```

2. Iniciar servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   
   Ou simplesmente execute o arquivo `iniciar.bat` (Windows)

3. Acessar no navegador:
   ```
   http://localhost:5173
   ```

4. Fazer login:
   - **E-mail:** treinador@clube.com (ou qualquer e-mail)
   - **Senha:** afc25

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## 📚 Documentação

A documentação está organizada na pasta `docs/`:

### Setup e Configuração
- **Deploy:** [docs/setup/DEPLOY.md](./docs/setup/DEPLOY.md)
- **Vercel Config:** [docs/setup/VERCEL_CONFIG.md](./docs/setup/VERCEL_CONFIG.md)
- **Google Apps Script:** [docs/setup/GOOGLE_APPS_SCRIPT_SETUP.md](./docs/setup/GOOGLE_APPS_SCRIPT_SETUP.md)
- **Database Options:** [docs/setup/DATABASE_OPTIONS.md](./docs/setup/DATABASE_OPTIONS.md)

### Database Schema
- **Entidades Conceituais:** [docs/database/ENTIDADES_CONCEITUAIS_LANDING_PAGE.md](./docs/database/ENTIDADES_CONCEITUAIS_LANDING_PAGE.md)
- **Schema Final:** [docs/database/PROMPT_9_SCHEMA_FINAL.md](./docs/database/PROMPT_9_SCHEMA_FINAL.md)
- **Validação:** [docs/database/VALIDACAO_FINAL.md](./docs/database/VALIDACAO_FINAL.md)

### Arquivos Arquivados
Documentos temporários e de debug estão em `docs/archive/` para referência histórica.

## ⚠️ Importante

Este sistema usa **localStorage** para salvar dados. Cada navegador/dispositivo terá seus próprios dados salvos. Para múltiplos usuários compartilharem dados, seria necessário um backend + banco de dados.
