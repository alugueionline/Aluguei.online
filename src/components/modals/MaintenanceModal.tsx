import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenance?: any;
}

export const MaintenanceModal = ({ isOpen, onClose, maintenance }: MaintenanceModalProps) => {
  const isEdit = !!maintenance;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess(isEdit ? 'Manutenção atualizada!' : 'Chamado de manutenção registrado!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Manutenção' : 'Novo Chamado de Manutenção'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Imóvel</Label>
            <Select defaultValue={maintenance?.propertyId || "1"}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o imóvel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Apto 101</SelectItem>
                <SelectItem value="2">Casa 02</SelectItem>
                <SelectItem value="3">Kitnet A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select defaultValue={maintenance?.category || "hidraulica"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hidraulica">Hidráulica</SelectItem>
                  <SelectItem value="eletrica">Elétrica</SelectItem>
                  <SelectItem value="pintura">Pintura</SelectItem>
                  <SelectItem value="estrutura">Estrutura</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select defaultValue={maintenance?.priority || "media"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição do Problema</Label>
            <Textarea 
              placeholder="Descreva o que precisa ser consertado..." 
              defaultValue={maintenance?.description}
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Custo Estimado (R$)</Label>
              <Input type="number" placeholder="0,00" defaultValue={maintenance?.cost} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select defaultValue={maintenance?.status || "pendente"}>
                <SelectTrigger>
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

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};