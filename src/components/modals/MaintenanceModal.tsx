"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Wrench } from 'lucide-react';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenance?: any;
}

export const MaintenanceModal = ({ isOpen, onClose, maintenance }: MaintenanceModalProps) => {
  const isEdit = !!maintenance;
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [fetchingProps, setFetchingProps] = useState(false);

  const [formData, setFormData] = useState({
    property_id: '',
    category: 'hidraulica',
    priority: 'media',
    description: '',
    cost: '0',
    status: 'pendente'
  });

  useEffect(() => {
    const fetchProperties = async () => {
      setFetchingProps(true);
      const { data } = await supabase.from('properties').select('id, name');
      setProperties(data || []);
      setFetchingProps(false);
      
      if (data && data.length > 0 && !maintenance) {
        setFormData(prev => ({ ...prev, property_id: data[0].id }));
      }
    };

    if (isOpen) {
      fetchProperties();
      if (maintenance) {
        setFormData({
          property_id: maintenance.property_id || '',
          category: maintenance.category || 'hidraulica',
          priority: maintenance.priority || 'media',
          description: maintenance.description || '',
          cost: (maintenance.cost || 0).toString(),
          status: maintenance.status || 'pendente'
        });
      }
    }
  }, [isOpen, maintenance]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const payload = {
        user_id: user.id,
        property_id: formData.property_id,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        cost: parseFloat(formData.cost) || 0,
        // Adicionando categoria se você tiver essa coluna, caso contrário ignorar
      };

      if (isEdit) {
        const { error } = await supabase.from('maintenances').update(payload).eq('id', maintenance.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('maintenances').insert([payload]);
        if (error) throw error;
      }

      showSuccess(isEdit ? 'Manutenção atualizada!' : 'Chamado de manutenção registrado!');
      onClose();
    } catch (err: any) {
      showError('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">
            {isEdit ? 'Editar Manutenção' : 'Novo Chamado'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Imóvel</Label>
            <Select 
              value={formData.property_id} 
              onValueChange={v => setFormData({...formData, property_id: v})}
            >
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                <SelectValue placeholder={fetchingProps ? "Carregando..." : "Selecione o imóvel"} />
              </SelectTrigger>
              <SelectContent>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
                {properties.length === 0 && !fetchingProps && (
                  <SelectItem value="none" disabled>Nenhum imóvel cadastrado</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prioridade</Label>
              <Select 
                value={formData.priority} 
                onValueChange={v => setFormData({...formData, priority: v})}
              >
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={v => setFormData({...formData, status: v})}
              >
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Problema</Label>
            <Textarea 
              placeholder="Descreva o que precisa ser consertado..." 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              required 
              className="rounded-2xl bg-slate-50 border-none font-medium min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Custo Estimado (R$)</Label>
            <Input 
              type="number" 
              placeholder="0,00" 
              value={formData.cost}
              onChange={e => setFormData({...formData, cost: e.target.value})}
              className="h-12 rounded-xl bg-slate-50 border-none font-bold"
            />
          </div>

          <DialogFooter className="pt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-400">Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 font-black h-12 shadow-lg shadow-blue-100">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Chamado'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};