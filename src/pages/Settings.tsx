import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Bell, Shield, Globe, Save } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const Settings = () => {
  const handleSave = () => {
    showSuccess('Configurações salvas com sucesso!');
  };

  return (
    <DashboardLayout title="Configurações">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white p-1 shadow-sm border-none h-12">
            <TabsTrigger value="profile" className="gap-2 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <User className="w-4 h-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Bell className="w-4 h-4" /> Notificações
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
              <Globe className="w-4 h-4" /> Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>Gerencie suas informações pessoais e de contato.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" defaultValue="Admin User" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" defaultValue="admin@jonaspay.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" defaultValue="(11) 99999-9999" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Cargo</Label>
                    <Input id="role" defaultValue="Gestor Imobiliário" disabled />
                  </div>
                </div>
                <div className="pt-4 border-t flex justify-end">
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Save className="w-4 h-4" /> Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>Escolha como você deseja ser avisado sobre eventos importantes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Pagamentos Recebidos</p>
                      <p className="text-sm text-gray-500">Receba um alerta quando um inquilino confirmar o pagamento.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Alertas de Atraso</p>
                      <p className="text-sm text-gray-500">Notificar quando um aluguel ultrapassar a data de vencimento.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Novos Chamados de Manutenção</p>
                      <p className="text-sm text-gray-500">Avisar quando um novo problema for relatado.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <div className="pt-4 border-t flex justify-end">
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Save className="w-4 h-4" /> Salvar Preferências
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>Ajuste as configurações regionais e de exibição.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Moeda Padrão</Label>
                    <Select defaultValue="brl">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brl">Real (R$)</SelectItem>
                        <SelectItem value="usd">Dólar (US$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fuso Horário</Label>
                    <Select defaultValue="sp">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sp">Brasília (GMT-3)</SelectItem>
                        <SelectItem value="ny">New York (GMT-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="pt-4 border-t flex justify-end">
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Save className="w-4 h-4" /> Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;