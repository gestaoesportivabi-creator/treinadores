# Debug - Tela Preta

## Problemas Comuns e Soluções

### 1. Verificar Console do Navegador
Abra o DevTools (F12) e verifique:
- Erros no Console (vermelho)
- Erros de rede (aba Network)
- Erros de JavaScript

### 2. Verificar se o React está renderizando
No console, digite:
```javascript
document.getElementById('root').innerHTML
```
Se retornar vazio, o React não está renderizando.

### 3. Verificar se há erros de importação
Verifique se todos os componentes importados existem:
- `components/ErrorBoundary.tsx` ✅ Criado
- `components/LandingPage.tsx` ✅ Existe
- `components/Login.tsx` ✅ Existe

### 4. Verificar API
O frontend tenta carregar dados da API. Se a API não estiver respondendo:
- Backend deve estar em `http://localhost:3000`
- Verifique: `curl http://localhost:3000/health`

### 5. Limpar Cache
```bash
cd 21Scoutpro
rm -rf node_modules/.vite
npm run dev
```

### 6. Verificar se o servidor está rodando
```bash
# Verificar processos
ps aux | grep vite
ps aux | grep node

# Verificar porta
lsof -i :5173
```

### 7. Testar Build
```bash
cd 21Scoutpro
npm run build
npm run preview
```

## Status Atual
- ✅ ErrorBoundary criado
- ✅ Tratamento de erros melhorado no useEffect
- ✅ Servidor Vite rodando
- ⚠️ Verificar console do navegador para erros específicos

## Próximos Passos
1. Abrir `http://localhost:5173` no navegador
2. Abrir DevTools (F12)
3. Verificar erros no Console
4. Compartilhar erros encontrados

