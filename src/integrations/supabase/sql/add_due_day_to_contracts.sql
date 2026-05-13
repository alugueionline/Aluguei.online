-- Adiciona a coluna na tabela de contratos
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS due_day INTEGER DEFAULT 5;

-- Migra os dados existentes dos inquilinos para os contratos
UPDATE public.contracts c
SET due_day = t.due_day
FROM public.tenants t
WHERE c.tenant_id = t.id;