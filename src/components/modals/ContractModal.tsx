import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { DollarSign, Calendar, Building2, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: any;
}

export const ContractModal = ({ isOpen, onClose, contract }: ContractModalProps) => {
  const isEdit = !!contract;
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("none");
  const [formData, setFormData] = useState({
    tenant_id: "",
    property_id: "",
    start_date: "",
    duration_months: "12",
    rent_value: "",
    status: "ativo"
  });
  const queryClient = useQueryClient();

  // Prevent state updates after unmount  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Early return if component unmounted during fetch
      if (!isMounted.current) return;

      const [propsRes, tenantsRes] = await Promise.all([
        supabase.from('properties').select('id, name'),
        supabase.from('tenants').select('id, name, property_id')
      ]);
      setProperties(propsRes.data || []);
      setTenants(tenantsRes.data || []);

      if (contract) {
        setFormData({
          tenant_id: contract.tenant_id || "",
          property_id: contract.property_id || "",
          start_date: contract.start_date || "",
          duration_months: (contract.duration_months || 12).toString(),
          rent_value: (contract.rent_value || 0).toString(),
          status: contract.status || "ativo"
        });
      } else {
        setFormData({
          tenant_id: "",
          property_id: "",
          start_date: "",
          duration_months: "12",
          rent_value: "",
          status: "ativo"
        });
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, contract]);

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    if (tenantId !== "none") {
      const tenant = tenants.find((t: any) => t.id === tenantId);
      if (tenant) {
        setSelectedPropertyId(tenant.property_id || "");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const payload = {
        user_id: user.id,
        tenant_id: selectedTenantId,
        property_id: selectedPropertyId,
        start_date: formData.start_date,
        duration_months: parseInt(formData.duration_months) || 12,
        rent_value: parseFloat(formData.rent_value) || 0,
        status: formData.status
      };

      if (isEdit) {
        const { error } = await supabase
          .from('contracts')
          .update(payload)
          .eq('id', contract!.id);
        if (error) throw error;
        showSuccess('Contrato atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('contracts')
          .insert(payload);
        if (error) throw error;
        showSuccess('Contrato cadastrado com sucesso!');
      }

      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      onClose();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProperty = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
  };

  const propertiesOptions = properties.map((p: any) => ({
    label: p.name,
    value: p.id
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] rounded-[2.5rem] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">
            {isEdit ? "Editar Contrato" : "Novo Contrato"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquilino</Label>
            <Select value={selectedTenantId} onValueChange={handleTenantChange}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                <SelectValue placeholder="Selecione o inquilino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {tenants.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Imóvel</Label>
            <Select value={selectedPropertyId} onValueChange={handleSelectProperty} required>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                <SelectValue placeholder="Selecione o imóvel" />
              </SelectTrigger>
              <SelectContent>
                {propertiesOptions.map((opt: any) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Início</Label>
              <Input 
                type="date" 
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duração (meses)</Label>
              <Input 
                type="number" 
                min="1" 
                value={formData.duration_months}
                onChange={(e) => setFormData({...formData, duration_months: e.target.value})}
                className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor do Aluguel (R$)</Label>
              <Input 
                type="number" 
                step="0.01" 
                value={formData.rent_value}
                onChange={(e) => setFormData({...formData, rent_value: e.target.value})}
                className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</Label>
              <Select value={formData.status} required>
                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="encerrado">Encerrado</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-400">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 font-black h-12 shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isEdit ? "Salvar Alterações" : "Criar Contrato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};