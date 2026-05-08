import React, { useEffect, useRef } from "react";
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
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('none');
  const queryClient = useQueryClient();
  
  // Prevent state updates after unmount
  const isMounted = useRef(true);
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
    };

    if (isOpen) {
      fetchData();
      if (contract) {
        setFormData({
          tenant_id: contract.tenant_id || '',
          property_id: contract.property_id || '',
          start_date: contract.start_date || '',
          duration_months: (contract.duration_months || 12).toString(),
          rent_value: (contract.rent_value || 0).toString(),
          status: contract.status || 'ativo'
        });
      } else {
        setFormData({
          tenant_id: '',
          property_id: '',
          start_date: '',
          duration_months: '12',
          rent_value: '',
          status: 'ativo'
        });
      }
    }
  }, [isOpen, contract]);

  // ... rest of component remains unchanged