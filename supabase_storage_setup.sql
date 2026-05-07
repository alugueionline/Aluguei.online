-- Execute estes comandos no SQL Editor do seu painel do Supabase

-- 1. Criar o bucket 'properties'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir acesso público para visualizar as imagens
CREATE POLICY "Acesso Público" ON storage.objects
  FOR SELECT USING (bucket_id = 'properties');

-- 3. Permitir que qualquer pessoa faça upload (para desenvolvimento)
-- Nota: Em produção, você pode querer restringir isso apenas a usuários autenticados
CREATE POLICY "Upload Público" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'properties');

-- 4. Permitir que os usuários atualizem ou excluam seus próprios uploads
CREATE POLICY "Atualização/Exclusão Pública" ON storage.objects
  FOR ALL USING (bucket_id = 'properties');