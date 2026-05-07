"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContractModal = ({ isOpen, onClose }: ContractModalProps) => {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess('Contrato gerado com sucesso!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">Novo Contrato de Locação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Inquilino</Label>
              <Select required>
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">João Silva</SelectItem>
                  <SelectItem value="2">Maria Oliveira</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Imóvel</Label>
              <Select required>
                <SelectTrigger className="rounded-xl h-12">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Apto 101</SelectItem>
                  <SelectItem value="2">Casa 02</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Input type="date" required className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label>Duração (Meses)</Label>
              <Input type="number" defaultValue="12" required className="rounded-xl h-12" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Valor do Aluguel (R$)</Label>
            <Input type="number" placeholder="0,00" required className="rounded-xl h-12" />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancelar</Button>
            <Button type="submit" className="bg-[#2563FF] hover:bg-blue-700 text-white rounded-xl px-8 font-bold h-12">
              Gerar Contrato
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};