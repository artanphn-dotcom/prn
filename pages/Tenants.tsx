import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { Tenant, Apartment, PaymentFrequency } from '../types';
import { Button, Card, Input, Modal, Select, Badge } from '../components/UI';
import { Plus, User, Phone, Mail, Home, Trash2, Edit2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export const Tenants = () => {
  const { t } = useAppContext();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Tenant>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTenants(DB.tenants.getAll());
    setApartments(DB.apartments.getAll());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      DB.tenants.update(editingId, formData);
    } else {
      DB.tenants.add(formData as Omit<Tenant, 'id'>);
    }
    
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
    loadData();
  };

  const handleEdit = (tenant: Tenant) => {
    setFormData(tenant);
    setEditingId(tenant.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('deleteConfirmTenant'))) {
      DB.tenants.delete(id);
      loadData();
    }
  };

  const getApartmentName = (id?: string) => {
    if (!id) return t('unassigned');
    return apartments.find(a => a.id === id)?.name || 'Unknown';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tenants')}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t('manageLeases')}</p>
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({}); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          {t('addTenant')}
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('tenant')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('contact')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('apartment')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('rent')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('lease')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {tenants.map(tenant => (
              <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{tenant.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col space-y-1">
                    <div className="flex items-center"><Mail className="w-3 h-3 mr-1" /> {tenant.email}</div>
                    <div className="flex items-center"><Phone className="w-3 h-3 mr-1" /> {tenant.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {tenant.apartmentId ? (
                     <Badge color="blue">{getApartmentName(tenant.apartmentId)}</Badge>
                  ) : (
                    <Badge color="gray">{t('unassigned')}</Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  €{tenant.rentAmount} <span className="text-gray-500 dark:text-gray-400 text-xs">/{tenant.paymentFrequency === PaymentFrequency.MONTHLY ? 'mo' : 'yr'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div>{t('since')}: {new Date(tenant.moveInDate).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(tenant)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3">Edit</button>
                  <button onClick={() => handleDelete(tenant.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {t('noTenants')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? t('editTenant') : t('addTenant')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('fullName')} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('email')} type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} required />
            <Input label={t('phone')} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          
          <Select 
            label={t('assignedApartment')}
            value={formData.apartmentId || ''}
            onChange={e => setFormData({...formData, apartmentId: e.target.value})}
            options={[
              { label: t('unassigned'), value: '' },
              ...apartments.map(a => ({ label: a.name, value: a.id }))
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input label={t('rentAmount')} type="number" value={formData.rentAmount || ''} onChange={e => setFormData({...formData, rentAmount: Number(e.target.value)})} />
            <Select 
              label={t('frequency')}
              value={formData.paymentFrequency || PaymentFrequency.MONTHLY}
              onChange={e => setFormData({...formData, paymentFrequency: e.target.value as PaymentFrequency})}
              options={[
                { label: 'Monthly', value: PaymentFrequency.MONTHLY },
                { label: 'Quarterly', value: PaymentFrequency.QUARTERLY },
                { label: 'Yearly', value: PaymentFrequency.YEARLY }
              ]}
            />
          </div>

          <Input label={t('moveInDate')} type="date" value={formData.moveInDate || ''} onChange={e => setFormData({...formData, moveInDate: e.target.value})} required />
          
          <div className="flex justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-2">{t('cancel')}</Button>
            <Button type="submit">{t('saveTenant')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};