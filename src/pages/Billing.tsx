import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, Zap, Droplets, FileText, Plus } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const Billing = () => {
  const [billingType, setBillingType] = useState<'energy' | 'water'>('energy');
  const [method, setMethod] = useState<string>('per_person');
  
  // Form states
  const [totalValue, setTotalValue] = useState<string>('');
  const [residents, setResidents] = useState<string>('1');
  const [prevReading, setPrevReading] = useState<string>('');
  const [currReading, setCurrReading] = useState<string>('');
  const [kwhPrice, setKwhPrice] = useState<string>('0.95');
  const [calculated, setCalculated] = useState<number>(0);

  useEffect(() => {
    if (method === 'per_person' && totalValue && residents) {
      setCalculated(parseFloat(totalValue) / parseInt(residents));
    } else if (method === 'individual_meter' && prevReading && currReading && kwhPrice) {
      const consumption = parseFloat(currReading) - parseFloat(prevReading);
      setCalculated(consumption * parseFloat(kwhPrice));
    } else if (method === 'fixed') {
      setCalculated(parseFloat(totalValue) || 0);
    }
  }, [totalValue, residents, prevReading, currReading, kwhPrice, method]);

  const handleSave = () => {
    showSuccess('Conta registrada com sucesso!');
  };

  return (
    <DashboardLayout title="Gestão de Contas e Utilidades">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Lançar Nova Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Utilidade</Label>
                  <Select value={billingType} onValueChange={(v: any) => setBillingType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="energy">Energia Elétrica</SelectItem>
                      <SelectItem value="water">Água</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Imóvel</Label>
                  <Select defaultValue="1">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o imóvel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Apto 101 - Ed. Central</SelectItem>
                      <SelectItem value="2">Casa 02 - Cond. Flores</SelectItem>
                      <SelectItem value="3">Kitnet A - Rua 10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Forma de Cobrança</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={method === 'fixed' ? 'default' : 'outline'} 
                    onClick={() => setMethod('fixed')}
                    className="text-xs"
                  >Valor Fixo</Button>
                  <Button 
                    variant={method === 'per_person' ? 'default' : 'outline'} 
                    onClick={() => setMethod('per_person')}
                    className="text-xs"
                  >Por Pessoa</Button>
                  <Button 
                    variant={method === 'individual_meter' ? 'default' : 'outline'} 
                    onClick={() => setMethod('individual_meter')}
                    className="text-xs"
                  >Medidor Individual</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                {method === 'per_person' && (
                  <>
                    <div className="space-y-2">
                      <Label>Valor Total da Fatura (R$)</Label>
                      <Input type="number" value={totalValue} onChange={(e) => setTotalValue(e.target.value)} placeholder="0,00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Número de Moradores</Label>
                      <Input type="number" value={residents} onChange={(e) => setResidents(e.target.value)} />
                    </div>
                  </>
                )}

                {method === 'individual_meter' && (
                  <>
                    <div className="space-y-2">
                      <Label>Leitura Anterior</Label>
                      <Input type="number" value={prevReading} onChange={(e) => setPrevReading(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Leitura Atual</Label>
                      <Input type="number" value={currReading} onChange={(e) => setCurrReading(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor por kWh (R$)</Label>
                      <Input type="number" value={kwhPrice} onChange={(e) => setKwhPrice(e.target.value)} />
                    </div>
                  </>
                )}

                {method === 'fixed' && (
                  <div className="space-y-2">
                    <Label>Valor Fixo (R$)</Label>
                    <Input type="number" value={totalValue} onChange={(e) => setTotalValue(e.target.value)} placeholder="0,00" />
                  </div>
                )}
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
                Registrar Conta
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-blue-600 text-white">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Resumo do Cálculo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-blue-100 text-sm">Valor Calculado</span>
                <span className="text-3xl font-bold">R$ {calculated.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-blue-500/30 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-100">Tipo:</span>
                  <span className="font-medium">{billingType === 'energy' ? 'Energia' : 'Água'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-100">Método:</span>
                  <span className="font-medium">
                    {method === 'fixed' ? 'Fixo' : method === 'per_person' ? 'Divisão' : 'Medidor'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Últimos Lançamentos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50">
                {[
                  { type: 'energy', val: 145.20, status: 'pendente' },
                  { type: 'water', val: 50.00, status: 'pago' },
                  { type: 'energy', val: 189.90, status: 'pago' },
                ].map((item, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${item.type === 'energy' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                        {item.type === 'energy' ? <Zap className="w-4 h-4" /> : <Droplets className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Apto 101</p>
                        <p className="text-xs text-gray-500">Maio 2024</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">R$ {item.val.toFixed(2)}</p>
                      <Badge variant={item.status === 'pago' ? 'secondary' : 'outline'} className="text-[10px] h-4">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Billing;