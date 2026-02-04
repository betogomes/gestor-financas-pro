import React, { useState, useEffect, useRef } from 'react';
import { Calendar, DollarSign, Camera, Download, Upload, Printer, Share2, Trash2, Edit2, Eye, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const FinanceApp = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [formData, setFormData] = useState({
    category: 'Mercado',
    amount: '',
    description: '',
    driveLink: '',
    receiptPhoto: null
  });

  const categories = [
    'Farmácias',
    'Material Hospitalar',
    'Hortifruti',
    'Mercado',
    'Limpeza',
    'Vestuário',
    'Consultas',
    'Cuidadoras',
    'Outros'
  ];

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Load expenses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('financeExpenses');
    if (saved) {
      setExpenses(JSON.parse(saved));
    }
  }, []);

  // Save expenses to localStorage
  useEffect(() => {
    localStorage.setItem('financeExpenses', JSON.stringify(expenses));
  }, [expenses]);

  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar
  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // Check if day has expenses
  const getDayExpenses = (day) => {
    if (!day) return [];
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getDate() === day &&
             expDate.getMonth() === selectedMonth &&
             expDate.getFullYear() === selectedYear;
    });
  };

  // Handle day click
  const handleDayClick = (day) => {
    if (!day) return;
    setSelectedDay(day);
    setShowForm(true);
    setEditingExpense(null);
    setFormData({
      category: 'Mercado',
      amount: '',
      description: '',
      driveLink: '',
      receiptPhoto: null
    });
    setPhotoPreview(null);
  };

  // Handle camera capture
  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData({ ...formData, receiptPhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      alert('Por favor, preencha valor e descrição!');
      return;
    }

    const expenseData = {
      id: editingExpense ? editingExpense.id : Date.now(),
      date: new Date(selectedYear, selectedMonth, selectedDay).toISOString(),
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      driveLink: formData.driveLink,
      receiptPhoto: formData.receiptPhoto
    };

    if (editingExpense) {
      setExpenses(expenses.map(exp => exp.id === editingExpense.id ? expenseData : exp));
    } else {
      setExpenses([...expenses, expenseData]);
    }

    setShowForm(false);
    setSelectedDay(null);
    setPhotoPreview(null);
  };

  // Handle edit
  const handleEdit = (expense) => {
    const expDate = new Date(expense.date);
    setSelectedDay(expDate.getDate());
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description,
      driveLink: expense.driveLink || '',
      receiptPhoto: expense.receiptPhoto || null
    });
    setPhotoPreview(expense.receiptPhoto || null);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (confirm('Deseja realmente excluir este gasto?')) {
      setExpenses(expenses.filter(exp => exp.id !== id));
    }
  };

  // Get filtered expenses for selected month/year
  const getFilteredExpenses = () => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === selectedMonth &&
             expDate.getFullYear() === selectedYear;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Calculate totals by category
  const getCategoryTotals = () => {
    const totals = {};
    categories.forEach(cat => totals[cat] = 0);
    
    getFilteredExpenses().forEach(exp => {
      totals[exp.category] += exp.amount;
    });

    return totals;
  };

  // Export backup
  const exportBackup = () => {
    const dataStr = JSON.stringify(expenses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-financas-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Import backup
  const importBackup = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (confirm('Deseja importar este backup? Os dados atuais serão substituídos.')) {
            setExpenses(data);
          }
        } catch (error) {
          alert('Erro ao importar backup. Arquivo inválido.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

// Gerar link de compartilhamento (simplificado - salva JSON localmente)
const generateShareLink = () => {
  const shareData = {
    month: selectedMonth,
    year: selectedYear,
    expenses: getFilteredExpenses()
  };
  
  // Criar arquivo JSON para compartilhar
  const dataStr = JSON.stringify(shareData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `compartilhar-${months[selectedMonth]}-${selectedYear}.json`;
  link.click();
  
  alert('Arquivo JSON baixado! Envie este arquivo para quem você deseja compartilhar.');
};

  const calendarDays = generateCalendar();
  const filteredExpenses = getFilteredExpenses();
  const categoryTotals = getCategoryTotals();
  const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6 print:shadow-none">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            💰 Gestor de Finanças Pessoais
          </h1>
          <p className="text-gray-600">Controle mensal profissional</p>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6 print:shadow-none">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={24} />
            Selecionar Período
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mês</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {months.map((month, idx) => (
                  <option key={idx} value={idx}>{month}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ano</label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                min="2020"
                max="2099"
              />
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6 print:shadow-none">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📅 {months[selectedMonth]} {selectedYear}
          </h2>
          
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center font-bold text-gray-600 text-sm py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const dayExpenses = getDayExpenses(day);
              const hasExpenses = dayExpenses.length > 0;
              const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`
                    aspect-square p-2 rounded-lg border-2 transition-all
                    ${day ? 'cursor-pointer hover:border-blue-500 hover:shadow-md' : 'bg-gray-50'}
                    ${hasExpenses ? 'bg-green-50 border-green-300' : 'border-gray-200'}
                    ${selectedDay === day ? 'ring-4 ring-blue-300' : ''}
                  `}
                >
                  {day && (
                    <div className="h-full flex flex-col">
                      <div className="font-semibold text-gray-700">{day}</div>
                      {hasExpenses && (
                        <div className="mt-auto">
                          <div className="text-xs text-green-700 font-semibold">
                            R$ {dayTotal.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {dayExpenses.length} {dayExpenses.length === 1 ? 'gasto' : 'gastos'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingExpense ? 'Editar Gasto' : 'Novo Gasto'} - Dia {selectedDay}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setSelectedDay(null);
                      setPhotoPreview(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Categoria *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valor (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descrição *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      rows="3"
                      placeholder="Descrição detalhada da despesa..."
                      required
                    />
                  </div>

                  {/* Drive Link */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Link do Google Drive
                    </label>
                    <input
                      type="url"
                      value={formData.driveLink}
                      onChange={(e) => setFormData({ ...formData, driveLink: e.target.value })}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>

                  {/* Camera Capture */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Comprovante (Foto)
                    </label>
                    <input
                      type="file"
                      ref={cameraInputRef}
                      accept="image/*"
                      capture="environment"
                      onChange={handleCameraCapture}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current.click()}
                      className="w-full p-3 bg-gray-100 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Camera size={20} />
                      {photoPreview ? 'Alterar Foto' : 'Capturar Foto'}
                    </button>
                    
                    {photoPreview && (
                      <div className="mt-3 relative">
                        <img src={photoPreview} alt="Preview" className="w-full rounded-lg border-2 border-gray-300" />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview(null);
                            setFormData({ ...formData, receiptPhoto: null });
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    {editingExpense ? 'Atualizar Gasto' : 'Salvar Gasto'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Viewer Modal */}
        {viewingReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="max-w-4xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-xl font-semibold">Comprovante</h3>
                <button
                  onClick={() => setViewingReceipt(null)}
                  className="text-white hover:text-gray-300"
                >
                  <X size={32} />
                </button>
              </div>
              <img src={viewingReceipt} alt="Comprovante" className="w-full rounded-lg" />
            </div>
          </div>
        )}

        {/* Expense List */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6 print:shadow-none">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📋 Histórico de Gastos - {months[selectedMonth]} {selectedYear}
          </h2>

          {filteredExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum gasto registrado neste mês.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">Dia</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Categoria</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Descrição</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Valor</th>
                    <th className="text-center p-3 font-semibold text-gray-700 print:hidden">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map(expense => {
                    const expDate = new Date(expense.date);
                    return (
                      <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                        <td className="p-3 print:hidden">
                          <div className="flex items-center justify-center gap-2">
                            {expense.receiptPhoto && (
                              <button
                                onClick={() => setViewingReceipt(expense.receiptPhoto)}
                                className="text-blue-500 hover:text-blue-700"
                                title="Ver Comprovante"
                              >
                                <Eye size={18} />
                              </button>
                            )}
                            {expense.driveLink && (
                              <a
                                href={expense.driveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-500 hover:text-purple-700"
                                title="Abrir Drive"
                              >
                                <Share2 size={18} />
                              </a>
                            )}
                            <button
                              onClick={() => handleEdit(expense)}
                              className="text-yellow-500 hover:text-yellow-700"
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Summary */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6 print:shadow-none">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 Resumo por Categoria
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => {
              const total = categoryTotals[category];
              const percentage = totalExpenses > 0 ? (total / totalExpenses * 100) : 0;
              
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
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold">TOTAL GERAL:</span>
              <span className="text-3xl font-bold">R$ {totalExpenses.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-xl p-6 print:hidden">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🛠️ Ferramentas</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handlePrint}
              className="p-4 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              <Printer size={20} />
              Imprimir Relatório
            </button>

            <button
              onClick={exportBackup}
              className="p-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Exportar Backup
            </button>

            <label className="p-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={20} />
              Importar Backup
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={importBackup}
                className="hidden"
              />
            </label>


          </div>

          <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>💡 Dica:</strong> Para funcionalidade completa com sincronização na nuvem, 
              configure o Supabase seguindo as instruções no README.
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FinanceApp;