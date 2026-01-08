# 🎯 Como Criar Sua Conta no SCOUT 21 PRO

## ✅ Sistema Pronto!

O sistema está **100% configurado** e funcionando:
- ✅ Backend conectado ao Supabase
- ✅ Banco de dados configurado
- ✅ Registro e Login funcionando
- ✅ Frontend rodando

## 🚀 Passos para Criar sua Conta

### 1. Acesse o Frontend

Abra seu navegador e acesse:
- **http://localhost:5173** ou
- **http://localhost:5174** 
(depende de qual porta o Vite está usando)

### 2. Na Landing Page

Você verá a página inicial do SCOUT 21 PRO com:
- Botão "Começar Agora - É Grátis" (canto superior direito ou no hero)
- Botão "Login" (canto superior direito)

### 3. Criar Conta

**Opção A - Via botão "Começar Agora":**
1. Clique em "Começar Agora - É Grátis"
2. Você será redirecionado para a página de registro

**Opção B - Via botão "Login":**
1. Clique em "Login" (canto superior direito)
2. Na página de login, clique em "Novo no clube? Criar Conta"

### 4. Preencher Dados

Na página de registro, preencha:

- **Nome**: Seu nome completo (mínimo 3 caracteres)
- **Usuário/Email**: Seu email (será usado para login)
- **Senha**: Mínimo 4 caracteres
- **Função**: Escolha entre:
  - Treinador
  - Preparador Físico
  - Supervisor
  - Diretor
  - Atleta

### 5. Criar Conta

1. Clique em "Criar Conta Grátis"
2. Aguarde alguns segundos (a conta está sendo criada no Supabase)
3. Você será logado automaticamente!

### 6. Pronto! 🎉

Após criar a conta:
- Você será redirecionado para o dashboard
- Sua conta estará salva no Supabase
- Você poderá fazer login novamente usando email e senha

## 🔍 Verificar se Funcionou

### Via Dashboard Supabase:
1. Acesse: https://supabase.com/dashboard/project/jhjrqnggsfeztgkpqcjm/editor
2. Vá na tabela `users`
3. Você verá sua conta criada!

### Via Prisma Studio:
```bash
cd backend
npx prisma studio
```
Acesse: http://localhost:5555
Vá na tabela `users`

## ⚠️ Problemas Comuns

### Erro: "Email já cadastrado"
- Use outro email
- Ou faça login se já tiver conta

### Erro: "Erro ao criar conta"
- Verifique se o backend está rodando
- Verifique se o Supabase está acessível
- Veja os logs do backend no terminal

### Tela preta ou erro de CORS
- Recarregue a página (F5)
- Verifique se ambos os servidores estão rodando
- Verifique o console do navegador (F12)

## 📝 Dados de Teste

Se quiser testar rapidamente:
- **Email**: teste@teste.com
- **Senha**: teste123
- **Nome**: Teste User

(Esta conta já foi criada como teste)

## 🎯 Próximos Passos Após Criar Conta

1. ✅ Explore o dashboard
2. ✅ Adicione jogadores na aba "Gestão de Equipe"
3. ✅ Crie partidas na aba "Input de Dados"
4. ✅ Configure programações na aba "Programação"
5. ✅ Veja estatísticas na aba "Performance"

---

**Sistema pronto para uso! 🚀**

