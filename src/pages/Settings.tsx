"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Bell, Globe, Save, Camera, Loader2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const DEFAULT_ICON = "https://i.ibb.co/cKz69Xd3/ICONE-CLARO.png";

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name || '');
        setAvatarUrl(user.user_metadata?.avatar_url || DEFAULT_ICON);
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          avatar_url: avatarUrl
        }
      });

      if (error) throw error;
      showSuccess('Perfil atualizado com sucesso!');
      
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    } catch (error: any) {
      showError(error.message || 'Erro ao salvar perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Configurações">
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Configurações">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white p-1 shadow-sm border-none h-12 rounded-2xl">
            <TabsTrigger value="profile" className="gap-2 px-6 rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <User className="w-4 h-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 px-6 rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Bell className="w-4 h-4" /> Notificações
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2 px-6 rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Globe className="w-4 h-4" /> Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
                <CardTitle className="text-2xl font-black tracking-tight">Informações do Perfil</CardTitle>
                <CardDescription className="font-medium">Gerencie como você aparece no sistema.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSaveProfile} className="space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-50">
                    <div className="relative group">
                      <Avatar className="w-32 h-32 rounded-[2rem] border-4 border-white shadow-xl bg-slate-50">
                        <AvatarImage src={avatarUrl} className="object-cover" />
                        <AvatarFallback className="bg-blue-50 text-blue-600 text-2xl font-black">
                          {fullName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera className="text-white w-8 h-8" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL da Foto de Perfil</Label>
                        <Input 
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://link-da-sua-foto.com/imagem.jpg"
                          className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                        />
                        <p className="text-[10px] text-slate-400 font-medium italic">Dica: Cole o link de uma imagem ou deixe em branco para usar o ícone padrão.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</Label>
                      <Input 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail (Apenas Leitura)</Label>
                      <Input 
                        value={user?.email || ''} 
                        disabled 
                        className="h-12 rounded-xl bg-slate-100 border-none font-bold text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-10 font-black shadow-lg shadow-blue-100 transition-all active:scale-95 gap-2"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-none shadow-sm rounded-[2.5rem]">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black tracking-tight">Notificações</CardTitle>
                <CardDescription className="font-medium">Escolha como deseja ser avisado.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <NotificationToggle title="Pagamentos Recebidos" desc="Receba um alerta quando um inquilino confirmar o pagamento." defaultChecked />
                  <NotificationToggle title="Alertas de Atraso" desc="Notificar quando um aluguel ultrapassar a data de vencimento." defaultChecked />
                  <NotificationToggle title="Novos Chamados" desc="Avisar quando um novo problema for relatado." defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card className="border-none shadow-sm rounded-[2.5rem]">
              <CardHeader className="p-8">
                <CardTitle className="text-2xl font-black tracking-tight">Sistema</CardTitle>
                <CardDescription className="font-medium">Ajustes regionais e de exibição.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Moeda Padrão</Label>
                    <Select defaultValue="brl">
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brl">Real (R$)</SelectItem>
                        <SelectItem value="usd">Dólar (US$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fuso Horário</Label>
                    <Select defaultValue="sp">
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sp">Brasília (GMT-3)</SelectItem>
                        <SelectItem value="ny">New York (GMT-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

const NotificationToggle = ({ title, desc, defaultChecked }: any) => (
  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
    <div>
      <p className="font-black text-slate-900 tracking-tight">{title}</p>
      <p className="text-xs text-slate-500 font-medium mt-1">{desc}</p>
    </div>
    <Switch defaultChecked={defaultChecked} />
  </div>
);

export default Settings;