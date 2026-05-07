"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
}

export const EventModal = ({ isOpen, onClose, selectedDate }: EventModalProps) => {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess('Evento agendado no calendário!');
    onClose();
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
            <Input placeholder="Ex: Vistoria de Entrada" required className="rounded-xl h-12" />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select defaultValue="visit">
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
                defaultValue={selectedDate?.toISOString().split('T')[0]} 
                required 
                className="rounded-xl h-12" 
              />
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input type="time" required className="rounded-xl h-12" />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancelar</Button>
            <Button type="submit" className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-xl px-8 font-bold h-12">
              Salvar Evento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};