import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DB } from '../services/db';
import { Transaction, TransactionType, ExpenseCategory, Apartment } from '../types';
import { Button, Card, Input, Modal, Select, Badge } from '../components/UI';
import { Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export const Finance = () => {
  const { t } = useAppContext();
  const location = useLocation();
  
  // State for data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    isPaid: true
  });

  // Determine current view mode based on path
  const getPageContext = () => {
    switch(location.pathname) {
      case '/rent-payments': 
        return { 
          title: t('rentPayments'), 
          filter: (t: Transaction) => t.type === TransactionType.INCOME && t.category === ExpenseCategory.RENT,
          defaultType: TransactionType.INCOME,
          defaultCat: ExpenseCategory.RENT
        };
      case '/family-support': 
        return { 
          title: t('familySupport'), 
          filter: (t: Transaction) => t.type === TransactionType.EXPENSE && t.category === ExpenseCategory.FAMILY_SUPPORT,
          defaultType: TransactionType.EXPENSE,
          defaultCat: ExpenseCategory.FAMILY_SUPPORT
        };
      case '/apartment-expenses':
        return { 
          title: t('aptExpenses'), 
          filter: (t: Transaction) => t.type === TransactionType.EXPENSE && t.category !== ExpenseCategory.FAMILY_SUPPORT && t.category !== ExpenseCategory.PERSONAL,
          defaultType: TransactionType.EXPENSE,
          defaultCat: ExpenseCategory.MAINTENANCE
        };
      case '/personal-expenses':
        return { 
          title: t('personalExpenses'), 
          filter: (t: Transaction) => t.type === TransactionType.EXPENSE && t.category === ExpenseCategory.PERSONAL,
          defaultType: TransactionType.EXPENSE,
          defaultCat: ExpenseCategory.PERSONAL
        };
      default:
        // Default View (fallback)
        return {
          title: t('trackFinance'),
          filter: () => true,
          defaultType: TransactionType.EXPENSE,
          defaultCat: ExpenseCategory.OTHER
        };
    }
  };

  const pageContext = getPageContext();

  useEffect(() => {
    loadData();
    // Reset form defaults when page changes
    setFormData({
      type: pageContext.defaultType,
      category: pageContext.defaultCat,
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      isPaid: true
    });
  }, [location.pathname]);

  const loadData = () => {
    setTransactions(DB.transactions.getAll());
    setApartments(DB.apartments.getAll());
  };

  const filteredTransactions = transactions
    .filter(pageContext.filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    DB.transactions.add(formData as Omit<Transaction, 'id'>);
    setIsModalOpen(false);
    // Reset form to context defaults
    setFormData({ 
      type: pageContext.defaultType, 
      category: pageContext.defaultCat, 
      date: new Date().toISOString().split('T')[0], 
      isRecurring: false, 
      isPaid: true 
    });
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm(t('deleteConfirmTrans'))) {
      DB.transactions.delete(id);
      loadData();
    }
  };

  const getApartmentName = (id?: string) => apartments.find(a => a.id === id)?.name || '-';

  const formatCategoryLabel = (cat: string) => {
     switch(cat) {
       case ExpenseCategory.RENT: return t('catRent');
       case ExpenseCategory.MAINTENANCE: return t('catMaintenance');
       case ExpenseCategory.FAMILY_SUPPORT: return t('catFamilySupport');
       case ExpenseCategory.ELECTRICITY: return t('catElectricity');
       case ExpenseCategory.WATER: return t('catWater');
       case ExpenseCategory.TRASH: return t('catTrash');
       case ExpenseCategory.TAX: return t('catTax');
       case ExpenseCategory.PERSONAL: return t('catPersonal');
       default: return t('catOther');
     }
  };

  return (
    <div>
       <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{pageContext.title}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t('trackFinance')}</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('addEntry')}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('date')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('type')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('description')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('apartment')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('amount')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {filteredTransactions.map(transaction => (
              <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.type === TransactionType.INCOME ? (
                    <Badge color="green">{t('income')}</Badge>
                  ) : (
                    <Badge color="red">{t('expense')}</Badge>
                  )}
                  <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{formatCategoryLabel(transaction.category)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {transaction.description}
                  {transaction.isRecurring && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-1.5 py-0.5 rounded">{t('recurring')}</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {getApartmentName(transaction.apartmentId)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${transaction.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {transaction.type === TransactionType.INCOME ? '+' : '-'}€{transaction.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                   <button onClick={() => handleDelete(transaction.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </td>
              </tr>
            ))}
             {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {t('noTrans')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('newTransaction')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* View Specific Hidden Inputs or Readonly displays */}
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Adding to: <span className="text-indigo-600 dark:text-indigo-400">{pageContext.title}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t('date')} type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            <Input label={`${t('amount')} (€)`} type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} required />
          </div>

          <Select 
            label={t('category')}
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value as ExpenseCategory})}
            options={
              pageContext.defaultType === TransactionType.INCOME
              ? [{ label: t('catRent'), value: ExpenseCategory.RENT }]
              : Object.values(ExpenseCategory)
                  .filter(c => c !== ExpenseCategory.RENT)
                  // Specific filters for the add modal based on view
                  .filter(c => {
                    if (location.pathname === '/family-support') return c === ExpenseCategory.FAMILY_SUPPORT;
                    if (location.pathname === '/personal-expenses') return c === ExpenseCategory.PERSONAL;
                    if (location.pathname === '/apartment-expenses') return c !== ExpenseCategory.FAMILY_SUPPORT && c !== ExpenseCategory.PERSONAL;
                    return true;
                  })
                  .map(c => ({ label: formatCategoryLabel(c), value: c }))
            }
          />

          <Select 
            label={`${t('apartment')} (Optional)`}
            value={formData.apartmentId || ''}
            onChange={e => setFormData({...formData, apartmentId: e.target.value})}
            options={[
              { label: t('generalGlobal'), value: '' },
              ...apartments.map(a => ({ label: a.name, value: a.id }))
            ]}
          />

          <Input label={t('description')} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} required />

          <div className="flex items-center space-x-2 pt-2">
             <input type="checkbox" id="recurring" checked={formData.isRecurring} onChange={e => setFormData({...formData, isRecurring: e.target.checked})} className="rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500" />
             <label htmlFor="recurring" className="text-sm text-gray-700 dark:text-gray-300">{t('recurringTrans')}</label>
          </div>

           <div className="flex justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-2">{t('cancel')}</Button>
            <Button type="submit">{t('saveEntry')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};