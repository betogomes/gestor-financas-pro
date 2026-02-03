-- ============================================
-- SCHEMA DO BANCO DE DADOS - SUPABASE
-- Gestor de Finanças Pessoais Mensal Pro
-- ============================================

-- Execute este script no SQL Editor do Supabase
-- (https://app.supabase.com → SQL Editor → New query)

-- ============================================
-- 1. CRIAR TABELAS
-- ============================================

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de despesas
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  description TEXT NOT NULL,
  receipt_url TEXT,
  drive_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de links compartilhados
CREATE TABLE IF NOT EXISTS shared_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 0 AND month <= 11),
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. INSERIR CATEGORIAS PADRÃO
-- ============================================

INSERT INTO categories (name, icon, color) VALUES
  ('Farmácias', '💊', '#EF4444'),
  ('Material Hospitalar', '🏥', '#F59E0B'),
  ('Hortifruti', '🥬', '#10B981'),
  ('Mercado', '🛒', '#3B82F6'),
  ('Limpeza', '🧹', '#8B5CF6'),
  ('Vestuário', '👔', '#EC4899'),
  ('Consultas', '👨‍⚕️', '#06B6D4'),
  ('Cuidadoras', '👩‍⚕️', '#F97316'),
  ('Outros', '📌', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_expenses_user_date 
  ON expenses(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_category 
  ON expenses(category);

CREATE INDEX IF NOT EXISTS idx_expenses_user_month 
  ON expenses(user_id, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date));

CREATE INDEX IF NOT EXISTS idx_shared_links_token 
  ON shared_links(token);

-- ============================================
-- 4. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. POLÍTICAS DE SEGURANÇA
-- ============================================

-- Políticas para EXPENSES (usuários só veem seus próprios gastos)
CREATE POLICY "Usuários podem ver suas próprias despesas"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias despesas"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias despesas"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias despesas"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para SHARED_LINKS
CREATE POLICY "Usuários podem ver seus próprios links"
  ON shared_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar links"
  ON shared_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios links"
  ON shared_links FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para CATEGORIES (leitura pública)
CREATE POLICY "Todos podem ver categorias"
  ON categories FOR SELECT
  USING (true);

-- ============================================
-- 6. FUNCTIONS E TRIGGERS
-- ============================================

-- Function para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em expenses
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. VIEWS ÚTEIS (OPCIONAL)
-- ============================================

-- View para resumo mensal por categoria
CREATE OR REPLACE VIEW monthly_summary AS
SELECT 
  user_id,
  EXTRACT(YEAR FROM date) as year,
  EXTRACT(MONTH FROM date) as month,
  category,
  SUM(amount) as total_amount,
  COUNT(*) as expense_count
FROM expenses
GROUP BY user_id, year, month, category;

-- View para total mensal geral
CREATE OR REPLACE VIEW monthly_totals AS
SELECT 
  user_id,
  EXTRACT(YEAR FROM date) as year,
  EXTRACT(MONTH FROM date) as month,
  SUM(amount) as total_amount,
  COUNT(*) as expense_count
FROM expenses
GROUP BY user_id, year, month;

-- ============================================
-- 8. STORAGE BUCKET PARA COMPROVANTES
-- ============================================

-- IMPORTANTE: Execute isso separadamente no painel Storage
-- 1. Vá em Storage → New Bucket
-- 2. Nome: receipts
-- 3. Marque "Public bucket"
-- 4. Create

-- Depois, configure as políticas de Storage:
-- Storage → Policies → New Policy

-- Política: Usuários podem fazer upload de seus arquivos
-- Policy definition:
-- bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]

-- Política: Leitura pública de arquivos
-- bucket_id = 'receipts'

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Para verificar se tudo foi criado corretamente:
SELECT 
  'Tabelas criadas' as status,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('categories', 'expenses', 'shared_links');

-- Deve retornar: count = 3
