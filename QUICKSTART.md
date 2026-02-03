# 🚀 GUIA RÁPIDO - Começar Agora!

## ⚡ Início Rápido (3 minutos)

### 1️⃣ Instalar e Executar

```bash
# Instalar dependências
npm install

# Executar localmente
npm run dev
```

Acesse: **http://localhost:3000** ✅

---

## 📤 Colocar no Ar (GitHub + Netlify)

### 1️⃣ GitHub (5 minutos)

```bash
# Na pasta do projeto, execute:
git init
git add .
git commit -m "Primeiro commit - App de Finanças"

# Substitua SEU-USUARIO pelo seu usuário do GitHub
git remote add origin https://github.com/SEU-USUARIO/finance-app.git
git push -u origin main
```

**Antes de executar**, crie o repositório em: https://github.com/new

### 2️⃣ Netlify (2 minutos)

1. Acesse: https://app.netlify.com
2. **Add new site** → **Import an existing project**
3. Escolha **GitHub**
4. Selecione seu repositório
5. **Deploy!**

✅ **Pronto!** App no ar em: `https://seu-app.netlify.app`

---

## 💾 Banco de Dados (Supabase - Opcional)

### Você precisa de banco de dados?

❌ **NÃO** → O app funciona 100% offline com LocalStorage  
✅ **SIM** → Para sincronização na nuvem e múltiplos dispositivos

### Como adicionar Supabase (10 minutos):

1. **Criar projeto**: https://supabase.com/dashboard/new
2. **Executar SQL** (copie do README.md, seção Supabase)
3. **Pegar credenciais**: Settings → API
4. **Adicionar no Netlify**: Site settings → Environment variables
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 📋 Checklist de Deploy

- [ ] Código enviado para o GitHub
- [ ] Deploy feito no Netlify
- [ ] App funcionando online
- [ ] (Opcional) Supabase configurado
- [ ] (Opcional) Variáveis de ambiente no Netlify

---

## 🆘 Problemas Comuns

### Erro ao executar `npm install`
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Deploy falhou no Netlify
- Build command: `npm run build`
- Publish directory: `out`

### App não aparece online
- Aguarde 2-3 minutos após deploy
- Verifique logs no Netlify: **Deploys** → último deploy → **Deploy log**

---

## 📚 Documentação Completa

Veja **README.md** para instruções detalhadas sobre:
- Configuração avançada
- Integração com Supabase
- Personalização
- Troubleshooting

---

**Boa sorte! 🎉**
