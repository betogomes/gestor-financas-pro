import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions para integração com o app

// Buscar despesas do mês
export const getMonthExpenses = async (userId, month, year) => {
  const startDate = new Date(year, month, 1).toISOString().split('T')[0]
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) {
    console.error('Erro ao buscar despesas:', error)
    return []
  }
  
  return data
}

// Salvar nova despesa
export const saveExpense = async (expenseData) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert([
      {
        user_id: user.id,
        date: expenseData.date,
        category: expenseData.category,
        amount: expenseData.amount,
        description: expenseData.description,
        drive_link: expenseData.driveLink,
        receipt_url: expenseData.receiptUrl
      }
    ])
    .select()

  if (error) {
    console.error('Erro ao salvar despesa:', error)
    throw error
  }
  
  return data[0]
}

// Atualizar despesa
export const updateExpense = async (expenseId, expenseData) => {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      date: expenseData.date,
      category: expenseData.category,
      amount: expenseData.amount,
      description: expenseData.description,
      drive_link: expenseData.driveLink,
      receipt_url: expenseData.receiptUrl
    })
    .eq('id', expenseId)
    .select()

  if (error) {
    console.error('Erro ao atualizar despesa:', error)
    throw error
  }
  
  return data[0]
}

// Deletar despesa
export const deleteExpense = async (expenseId) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)

  if (error) {
    console.error('Erro ao deletar despesa:', error)
    throw error
  }
}

// Upload de comprovante
export const uploadReceipt = async (file, expenseId) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${expenseId}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(filePath, file, {
      upsert: true
    })

  if (error) {
    console.error('Erro ao fazer upload:', error)
    throw error
  }

  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from('receipts')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

// Autenticação
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Gerar link de compartilhamento
export const createShareLink = async (userId, month, year) => {
  const token = Math.random().toString(36).substring(2, 15)
  
  const { data, error } = await supabase
    .from('shared_links')
    .insert([
      {
        user_id: userId,
        token: token,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
      }
    ])
    .select()

  if (error) {
    console.error('Erro ao criar link:', error)
    throw error
  }
  
  return token
}
