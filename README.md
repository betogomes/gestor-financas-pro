# 💰 Gestor de Finanças Pessoais Mensal Pro

Aplicativo completo de gestão de finanças pessoais com controle mensal, backup, compartilhamento e sincronização na nuvem.

## 📋 Funcionalidades

✅ **Calendário Interativo** - Selecione o dia diretamente no calendário com indicação dos dias da semana  
✅ **Categorias Personalizadas** - 9 categorias predefinidas (Farmácias, Material Hospitalar, Hortifruti, etc.)  
✅ **Captura de Comprovantes** - Tire fotos dos recibos diretamente pelo app  
✅ **Links do Google Drive** - Armazene links de documentos externos  
✅ **Histórico Completo** - Visualize todos os gastos com filtros por mês/ano  
✅ **Resumo por Categoria** - Gráficos e totalizações automáticas  
✅ **Modo Impressão** - Gere relatórios profissionais em PDF  
✅ **Backup JSON** - Exporte e importe seus dados facilmente  
✅ **Compartilhamento** - Gere links para visualização em modo leitura  
✅ **Responsivo** - Funciona perfeitamente em desktop e mobile  

---

## 🚀 Instalação Local

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Passo 1: Instalar dependências
```bash
npm install
# ou
yarn install
```

### Passo 2: Executar em desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

Acesse: http://localhost:3000

### Passo 3: Build para produção
```bash
npm run build
# ou
yarn build
```

---

## 📦 Deploy no Netlify

### Método 1: Via GitHub (Recomendado)

#### Passo 1: Criar Repositório no GitHub

1. Acesse https://github.com e faça login
2. Clique no botão **"+"** no canto superior direito → **New repository**
3. Preencha:
   - **Repository name**: `gestor-financas-pro`
   - **Description**: "Aplicativo de gestão de finanças pessoais"
   - **Visibility**: Public ou Private (sua escolha)
4. Clique em **Create repository**

#### Passo 2: Subir Código para o GitHub

No terminal, na pasta do projeto:

```bash
# Inicializar Git (se ainda não foi)
git init

# Adicionar todos os arquivos
git add .

# Fazer o primeiro commit
git commit -m "Initial commit - Finance App"

# Adicionar o repositório remoto (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/gestor-financas-pro.git

# Enviar para o GitHub
git branch -M main
git push -u origin main
```

#### Passo 3: Deploy no Netlify

1. Acesse https://netlify.com e faça login
2. Clique em **Add new site** → **Import an existing project**
3. Escolha **GitHub** e autorize o Netlify
4. Selecione o repositório `gestor-financas-pro`
5. Configure as build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
6. Clique em **Deploy site**

✅ **Pronto!** Seu app estará online em poucos minutos em um domínio tipo: `https://seu-app.netlify.app`

### Método 2: Deploy Manual (Arraste e Solte)

1. Execute o build:
   ```bash
   npm run build
   ```
2. Acesse https://app.netlify.com/drop
3. Arraste a pasta `out` para a área de upload
4. ✅ Site publicado instantaneamente!

---

## 🗄️ Configuração do Supabase (Banco de Dados)

### Passo 1: Criar Projeto no Supabase

1. Acesse https://supabase.com e crie uma conta
2. Clique em **New Project**
3. Preencha:
   - **Name**: Gestor Finanças Pro
   - **Database Password**: (crie uma senha forte)
   - **Region**: South America (mais próximo do Brasil)
4. Clique em **Create new project**
5. Aguarde alguns minutos enquanto o banco é criado

### Passo 2: Criar as Tabelas

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Cole o seguinte SQL:

```sql
-- Criar tabela de usuários (opcional, se não usar Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT
);

-- Inserir categorias padrão
INSERT INTO categories (name, icon, color) VALUES
  ('Farmácias', '💊', '#EF4444'),
  ('Material Hospitalar', '🏥', '#F59E0B'),
  ('Hortifruti', '🥬', '#10B981'),
  ('Mercado', '🛒', '#3B82F6'),
  ('Limpeza', '🧹', '#8B5CF6'),
  ('Vestuário', '👔', '#EC4899'),
  ('Consultas', '👨‍⚕️', '#06B6D4'),
  ('Cuidadoras', '👩‍⚕️', '#F97316'),
  ('Outros', '📌', '#6B7280');

-- Criar tabela de despesas
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  receipt_url TEXT,
  drive_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);

-- Criar tabela de links compartilhados
CREATE TABLE IF NOT EXISTS shared_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança: usuários só veem seus próprios gastos
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

4. Clique em **Run** (ou F5)
5. ✅ Tabelas criadas com sucesso!

### Passo 3: Configurar Storage (para fotos)

1. No painel do Supabase, vá em **Storage**
2. Clique em **New bucket**
3. Preencha:
   - **Name**: `receipts`
   - **Public bucket**: ✅ Marque (para permitir visualização)
4. Clique em **Create bucket**

### Passo 4: Obter Credenciais

1. No painel do Supabase, vá em **Settings** → **API**
2. Copie:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon/public key** (chave pública)

### Passo 5: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

### Passo 6: Instalar Cliente Supabase

Se ainda não instalou:
```bash
npm install @supabase/supabase-js
```

### Passo 7: Configurar no Netlify (variáveis de ambiente)

1. No painel do Netlify, vá em **Site settings** → **Environment variables**
2. Adicione as mesmas variáveis do `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Faça um novo deploy

---

## 🔧 Integração com Supabase (Código)

Crie o arquivo `lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Exemplo de Uso - Salvar Despesa:

```javascript
import { supabase } from '../lib/supabase'

// Salvar despesa no Supabase
const saveExpense = async (expenseData) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([
      {
        user_id: (await supabase.auth.getUser()).data.user.id,
        date: expenseData.date,
        category: expenseData.category,
        amount: expenseData.amount,
        description: expenseData.description,
        drive_link: expenseData.driveLink
      }
    ])
    .select()

  if (error) {
    console.error('Erro ao salvar:', error)
    return null
  }
  
  return data[0]
}
```

### Exemplo de Uso - Upload de Foto:

```javascript
// Upload de comprovante
const uploadReceipt = async (file, expenseId) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${expenseId}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(filePath, file)

  if (error) {
    console.error('Erro ao fazer upload:', error)
    return null
  }

  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}
```

---

## 🔐 Autenticação (Opcional)

Para adicionar login/registro:

1. No Supabase, vá em **Authentication** → **Providers**
2. Habilite **Email** (ou Google, GitHub, etc.)
3. Use o código:

```javascript
// Registro
const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  return { data, error }
}

// Login
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// Logout
const signOut = async () => {
  await supabase.auth.signOut()
}

// Verificar usuário logado
const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

---

## 📱 Funcionalidades Offline/Online

O app funciona de duas formas:

### Modo Offline (LocalStorage)
- Dados salvos no navegador
- Funciona sem internet
- Backup manual via JSON
- Ideal para uso pessoal

### Modo Online (Supabase)
- Dados na nuvem
- Sincronização automática
- Acesso de qualquer dispositivo
- Compartilhamento real

---

## 🎨 Personalização

### Adicionar Nova Categoria:

No arquivo `components/FinanceApp.jsx`:

```javascript
const categories = [
  'Farmácias',
  'Material Hospitalar',
  // ... outras categorias
  'Sua Nova Categoria' // Adicione aqui
];
```

### Alterar Cores:

Em `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#3B82F6', // Azul - altere conforme preferir
      secondary: '#8B5CF6', // Roxo
    },
  },
}
```

---

## 📊 Estrutura do Projeto

```
finance-app/
├── app/
│   ├── page.js              # Página principal
│   ├── layout.js            # Layout raiz
│   ├── globals.css          # Estilos globais
│   └── share/[id]/
│       └── page.js          # Página de visualização compartilhada
├── components/
│   └── FinanceApp.jsx       # Componente principal do app
├── lib/
│   └── supabase.js          # Cliente Supabase (criar este arquivo)
├── public/                  # Arquivos estáticos
├── .env.local              # Variáveis de ambiente (criar este arquivo)
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

---

## 🐛 Troubleshooting

### Erro: "Module not found"
```bash
npm install
```

### Erro ao fazer deploy no Netlify
- Verifique se o build command é `npm run build`
- Verifique se o publish directory é `out`

### Imagens não aparecem no Supabase
- Certifique-se de que o bucket `receipts` é público
- Verifique as políticas RLS do Storage

### Dados não sincronizam
- Verifique as variáveis de ambiente no Netlify
- Confirme que as tabelas foram criadas no Supabase
- Verifique o console do navegador para erros

---

## 📄 Licença

MIT License - Livre para uso pessoal e comercial

---

## 🤝 Contribuindo

Sinta-se à vontade para fazer fork, abrir issues ou enviar pull requests!

---

## 📞 Suporte

- **GitHub Issues**: Para bugs e sugestões
- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs

---

## 🚀 Próximos Passos

1. ✅ Instalar localmente
2. ✅ Testar todas as funcionalidades
3. ✅ Criar repositório no GitHub
4. ✅ Fazer deploy no Netlify
5. ✅ Configurar Supabase
6. ✅ Adicionar autenticação (opcional)
7. ✅ Personalizar conforme sua necessidade

**Bom controle financeiro! 💰📊**
