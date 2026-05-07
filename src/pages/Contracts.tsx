"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Search, Filter, Plus, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';

const contracts = [
  { id: '1', tenant: 'João Silva', property: 'Apto 101', start: '10/01/2024', end: '10/01/2025', value: 1200, status: 'vigente' },
  { id: '2', tenant: 'Maria Oliveira', property: 'Casa 02', start: '15/03/2024', end: '15/03/2025', value: 2500, status: 'vigente' },
  { id: '3', tenant: 'Pedro Santos', property: 'Kitnet A', start: '05/05/2023', end: '05/05/2024', value: 850, status: 'vencido' },
  { id: '4', tenant: 'Ana Costa', property: 'Apto 202', start: '01/06/2024', end: '01/06/2025', value: 1350, status: 'aguardando_assinatura' },
];

const Contracts = () => {
  return (
    <DashboardLayout title="Contratos">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar por inquilino ou imóvel..." className="pl-10 bg-white border-none shadow-sm" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="bg-white border-none shadow-sm gap-2">
            <Filter className="w-4 h-4" /> Filtros
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2 flex-1 md:flex-none">
            <Plus className="w-4 h-4" /> Novo Contrato
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-semibold">Inquilino / Imóvel</TableHead>
                <TableHead className="font-semibold">Vigência</TableHead>
                <TableHead className="font-semibold">Valor Mensal</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((c) => (
                <TableRow key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{c.tenant}</p>
                        <p className="text-xs text-gray-500">{c.property}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {c.start} - {c.end}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-gray-900">
                    R$ {c.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "border-none",
                      c.status === 'vigente' ? "bg-green-50 text-green-700" :
                      c.status === 'vencido' ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"
                    )}>
                      {c.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

import { cn } from '@/lib/utils';
export default Contracts;