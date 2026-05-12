"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
}

export const EventModal = ({ isOpen, onClose, selectedDate }: EventModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'visit',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: '09:00',
    description: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const { error } = await supabase.from('events').insert([{
        user_id: user.id,
        title: formData.title,
        type: formData.type,
        date: formData.date,
        time: formData.time,
        description: formData.description
      }]);

      if (error) throw error;

      showSuccess('Evento agendado no calendário!');
      onClose();
    } catch (err: any) {
      showError('Erro ao salvar evento: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Novo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título do Evento</Label>
            <Input 
              placeholder="Ex: Vistoria de Entrada" 
              required 
              className="rounded-xl h-12" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select 
              value={formData.type} 
              onValueChange={v => setFormData({...formData, type: v})}
            >
              <SelectTrigger className="rounded-xl h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment">Pagamento</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="contract">Contrato</SelectItem>
                <SelectItem value="visit">Vistoria / Visita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input 
                type="date" 
                required 
                className="rounded-xl h-12" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input 
                type="time" 
                required 
                className="rounded-xl h-12" 
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição (Opcional)</Label>
            <Input 
              placeholder="Detalhes adicionais..." 
              className="rounded-xl h-12" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-xl px-8 font-bold h-12">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Evento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};