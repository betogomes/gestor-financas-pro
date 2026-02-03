'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Eye, Calendar } from 'lucide-react'

// ADICIONADO: generateStaticParams para export estático
export function generateStaticParams() {
  // Retorna array vazio - a página será gerada dinamicamente no client
  return []
}

export default function SharedView() {
  const params = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      const decoded = JSON.parse(atob(params.id))
      setData(decoded)
    } catch (e) {
      setError(true)
    }
  }, [params.id])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Link Inválido</h1>
          <p className="text-gray-600">Este link de compartilhamento não é válido ou está corrompido.</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const categories = [...new Set(data.expenses.map(e => e.category))]
  const categoryTotals = {}
  
  categories.forEach(cat => {
    categoryTotals[cat] = data.expenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0)
  })

  const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye size={32} className="text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Visualização Compartilhada
              </h1>
              <p className="text-gray-600">Modo somente leitura</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-lg font-semibold text-blue-600">
            <Calendar size={24} />
            {months[data.month]} {data.year}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Histórico de Gastos</h2>
          
          {data.expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum gasto registrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">Dia</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Categoria</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Descrição</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.expenses.map((expense, idx) => {
                    const expDate = new Date(expense.date)
                    return (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">{expDate.getDate()}</td>
                        <td className="p-3">
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {expense.category}
                          </span>
                        </td>
                        <td className="p-3">{expense.description}</td>
                        <td className="p-3 text-right font-semibold text-green-600">
                          R$ {expense.amount.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Resumo por Categoria</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryTotals).map(([category, total]) => {
              const percentage = totalExpenses > 0 ? (total / totalExpenses * 100) : 0
              
              return (
                <div key={category} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">{category}</span>
                    <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {total.toFixed(2)}
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 rounded-full h-2 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold">TOTAL GERAL:</span>
              <span className="text-3xl font-bold">R$ {totalExpenses.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}