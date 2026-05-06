'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';

const turnos = ['Manhã', 'Tarde', 'Noite', 'Integral'];
const statusOptions = ['Inscrições Abertas', 'Em Andamento', 'Concluído'];
const DIAS_SEMANA_OPCOES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

interface CursoFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function CursoForm({ initialData, isEdit }: CursoFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tiposCurso, setTiposCurso] = useState<any[]>([]);
  const [form, setForm] = useState({
    nome: '',
    tipoCursoId: '',
    cargaHoraria: '',
    vagas: '',
    dataInicio: '',
    dataFim: '',
    turno: '',
    horarioInicio: '',
    horarioFim: '',
    diasSemana: '',
    professor: '',
    status: 'Inscrições Abertas',
  });

  useEffect(() => {
    fetch('/api/tipos-curso?all=true')
      .then((r: any) => r?.json?.())
      .then((d: any) => setTiposCurso(d ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        nome: initialData?.nome ?? '',
        tipoCursoId: initialData?.tipoCursoId ?? '',
        cargaHoraria: String(initialData?.cargaHoraria ?? ''),
        vagas: String(initialData?.vagas ?? ''),
        dataInicio: initialData?.dataInicio ? new Date(initialData.dataInicio).toISOString().split('T')[0] : '',
        dataFim: initialData?.dataFim ? new Date(initialData.dataFim).toISOString().split('T')[0] : '',
        turno: initialData?.turno ?? '',
        horarioInicio: initialData?.horarioInicio ?? '',
        horarioFim: initialData?.horarioFim ?? '',
        diasSemana: initialData?.diasSemana ?? '',
        professor: initialData?.professor ?? '',
        status: initialData?.status ?? 'Inscrições Abertas',
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...(prev ?? {}), [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.nome?.trim?.()) { toast.error('Nome é obrigatório'); return; }
    if (!form?.tipoCursoId) { toast.error('Tipo de oficina é obrigatório'); return; }
    setSaving(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/cursos/${initialData?.id}` : '/api/cursos';
      const payload = {
        ...form,
        cargaHoraria: parseInt(form?.cargaHoraria || '0'),
        vagas: parseInt(form?.vagas || '0'),
        dataInicio: form?.dataInicio || null,
        dataFim: form?.dataFim || null,
        turno: form?.turno || null,
        horarioInicio: form?.horarioInicio || null,
        horarioFim: form?.horarioFim || null,
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res?.json?.();
      if (!res?.ok) { toast.error(data?.error ?? 'Erro ao salvar'); return; }
      toast.success(isEdit ? 'Oficina atualizada!' : 'Oficina criada!');
      router.replace(`/cursos/${data?.id ?? initialData?.id}`);
    } catch { toast.error('Erro ao salvar'); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Informações da Oficina</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Nome da Oficina *</Label>
            <Input value={form?.nome ?? ''} onChange={(e: any) => handleChange('nome', e?.target?.value ?? '')} placeholder="Ex: Informática Básica" />
          </div>
          <div className="space-y-2">
            <Label>Tipo de Oficina *</Label>
            <Select value={form?.tipoCursoId ?? ''} onValueChange={(v: string) => handleChange('tipoCursoId', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>
                {tiposCurso?.map?.((t: any) => <SelectItem key={t?.id} value={t?.id}>{t?.nome ?? ''}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form?.status ?? 'Inscrições Abertas'} onValueChange={(v: string) => handleChange('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions?.map?.((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Número de Vagas</Label>
            <Input type="number" value={form?.vagas ?? ''} onChange={(e: any) => handleChange('vagas', e?.target?.value ?? '')} placeholder="30" />
          </div>
          <div className="space-y-2">
            <Label>Turno</Label>
            <Select value={form?.turno ?? ''} onValueChange={(v: string) => handleChange('turno', v === 'nenhum' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Nenhum</SelectItem>
                {turnos?.map?.((t: string) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Horário de Início</Label>
            <Input type="time" value={form?.horarioInicio ?? ''} onChange={(e: any) => handleChange('horarioInicio', e?.target?.value ?? '')} />
          </div>
          <div className="space-y-2">
            <Label>Horário de Término</Label>
            <Input type="time" value={form?.horarioFim ?? ''} onChange={(e: any) => handleChange('horarioFim', e?.target?.value ?? '')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Dias da Semana</Label>
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
              {DIAS_SEMANA_OPCOES.map((dia) => {
                const isSelected = form?.diasSemana?.includes(dia);
                return (
                  <label key={dia} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={isSelected}
                      onChange={(e) => {
                        let currentDays = form.diasSemana ? form.diasSemana.split(', ').filter(Boolean) : [];
                        if (e.target.checked) {
                          currentDays.push(dia);
                        } else {
                          currentDays = currentDays.filter(d => d !== dia);
                        }
                        currentDays.sort((a, b) => DIAS_SEMANA_OPCOES.indexOf(a) - DIAS_SEMANA_OPCOES.indexOf(b));
                        handleChange('diasSemana', currentDays.join(', '));
                      }}
                    />
                    <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{dia}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Professor</Label>
            <Input value={form?.professor ?? ''} onChange={(e: any) => handleChange('professor', e?.target?.value ?? '')} placeholder="Nome do professor" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button type="submit" disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Criar Oficina')}
        </Button>
      </div>
    </form>
  );
}
