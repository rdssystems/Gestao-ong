'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';

interface AlunoFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function AlunoForm({ initialData, isEdit }: AlunoFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [tiposCurso, setTiposCurso] = useState<any[]>([]);
  const [form, setForm] = useState({
    nomeCompleto: '',
    dataNascimento: '',
    sexo: '',
    tipoDocumento: '',
    numeroDocumento: '',
    numeroCertidao: '',
    nomeMae: '',
    telefone: '',
    whatsapp: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    cep: '',
    interesses: [] as string[],
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
        nomeCompleto: initialData?.nomeCompleto ?? '',
        dataNascimento: initialData?.dataNascimento ? new Date(initialData.dataNascimento).toISOString().split('T')[0] : '',
        sexo: initialData?.sexo ?? '',
        tipoDocumento: initialData?.tipoDocumento ?? '',
        numeroDocumento: initialData?.numeroDocumento ?? '',
        numeroCertidao: initialData?.numeroCertidao ?? '',
        nomeMae: initialData?.nomeMae ?? '',
        telefone: initialData?.telefone ?? '',
        whatsapp: initialData?.whatsapp ?? '',
        endereco: initialData?.endereco ?? '',
        numero: initialData?.numero ?? '',
        complemento: initialData?.complemento ?? '',
        bairro: initialData?.bairro ?? '',
        cidade: initialData?.cidade ?? '',
        cep: initialData?.cep ?? '',
        interesses: initialData?.interesses?.map?.((i: any) => i?.tipoCursoId ?? i?.tipoCurso?.id) ?? [],
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...(prev ?? {}), [field]: value }));
  };

  const toggleInteresse = (tipoCursoId: string) => {
    setForm((prev: any) => {
      const current = prev?.interesses ?? [];
      return {
        ...(prev ?? {}),
        interesses: current.includes(tipoCursoId)
          ? current.filter((id: string) => id !== tipoCursoId)
          : [...current, tipoCursoId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form?.nomeCompleto?.trim?.()) { toast.error('Nome completo é obrigatório'); return; }
    setSaving(true);
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit ? `/api/alunos/${initialData?.id}` : '/api/alunos';
      const payload = { ...form, dataNascimento: form?.dataNascimento || null };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res?.json?.();
      if (!res?.ok) { toast.error(data?.error ?? 'Erro ao salvar'); return; }
      toast.success(isEdit ? 'Aluno atualizado!' : 'Aluno cadastrado!');
      router.replace(`/alunos/${data?.id ?? initialData?.id}`);
    } catch { toast.error('Erro ao salvar'); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. DADOS DO PARTICIPANTE */}
      <Card>
        <CardHeader><CardTitle>1. Dados do Participante</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Nome Completo *</Label>
            <Input value={form?.nomeCompleto ?? ''} onChange={(e: any) => handleChange('nomeCompleto', e?.target?.value ?? '')} placeholder="Nome completo do participante" />
          </div>
          <div className="space-y-2">
            <Label>Data de Nascimento</Label>
            <Input type="date" value={form?.dataNascimento ?? ''} onChange={(e: any) => handleChange('dataNascimento', e?.target?.value ?? '')} />
          </div>
          <div className="space-y-2">
            <Label>Sexo</Label>
            <RadioGroup
              value={form?.sexo ?? ''}
              onValueChange={(v: string) => handleChange('sexo', v)}
              className="flex items-center gap-6 pt-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Feminino" id="sexo-f" />
                <Label htmlFor="sexo-f" className="font-normal cursor-pointer">Feminino</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Masculino" id="sexo-m" />
                <Label htmlFor="sexo-m" className="font-normal cursor-pointer">Masculino</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* 2. DOCUMENTAÇÃO DO PARTICIPANTE */}
      <Card>
        <CardHeader><CardTitle>2. Documentação do Participante</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de Documento</Label>
            <Select value={form?.tipoDocumento ?? ''} onValueChange={(v: string) => handleChange('tipoDocumento', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Certidão de Nascimento">Certidão de Nascimento</SelectItem>
                <SelectItem value="RG">RG</SelectItem>
                <SelectItem value="CPF">CPF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Número do Documento</Label>
            <Input value={form?.numeroDocumento ?? ''} onChange={(e: any) => handleChange('numeroDocumento', e?.target?.value ?? '')} placeholder="Número do documento" />
          </div>
          {form?.tipoDocumento === 'Certidão de Nascimento' && (
            <div className="space-y-2 md:col-span-2">
              <Label>Número da Certidão</Label>
              <Input value={form?.numeroCertidao ?? ''} onChange={(e: any) => handleChange('numeroCertidao', e?.target?.value ?? '')} placeholder="Número da certidão de nascimento" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. DADOS DO RESPONSÁVEL */}
      <Card>
        <CardHeader><CardTitle>3. Dados do Responsável</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label>Nome Completo do Responsável</Label>
            <Input value={form?.nomeMae ?? ''} onChange={(e: any) => handleChange('nomeMae', e?.target?.value ?? '')} placeholder="Nome completo do responsável" />
          </div>
          <div className="space-y-2">
            <Label>Telefone do Responsável</Label>
            <Input value={form?.telefone ?? ''} onChange={(e: any) => handleChange('telefone', e?.target?.value ?? '')} placeholder="(00) 00000-0000" />
          </div>
          <div className="space-y-2">
            <Label>Outro Telefone (opcional)</Label>
            <Input value={form?.whatsapp ?? ''} onChange={(e: any) => handleChange('whatsapp', e?.target?.value ?? '')} placeholder="(00) 00000-0000" />
          </div>
        </CardContent>
      </Card>

      {/* 4. ENDEREÇO COMPLETO */}
      <Card>
        <CardHeader><CardTitle>4. Endereço Completo</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>CEP</Label>
            <div className="relative">
              <Input
                value={form?.cep ?? ''}
                onChange={(e: any) => {
                  const raw = (e?.target?.value ?? '').replace(/\D/g, '');
                  const formatted = raw.length > 5 ? raw.slice(0, 5) + '-' + raw.slice(5, 8) : raw;
                  handleChange('cep', formatted);
                  if (raw.length === 8) {
                    setBuscandoCep(true);
                    fetch(`https://viacep.com.br/ws/${raw}/json/`)
                      .then((r: any) => r?.json?.())
                      .then((data: any) => {
                        if (data && !data.erro) {
                          setForm((prev: any) => ({
                            ...(prev ?? {}),
                            cep: formatted,
                            endereco: data.logradouro || prev?.endereco || '',
                            bairro: data.bairro || prev?.bairro || '',
                            cidade: data.localidade || prev?.cidade || '',
                          }));
                        }
                      })
                      .catch(() => {})
                      .finally(() => setBuscandoCep(false));
                  }
                }}
                placeholder="00000-000"
                maxLength={9}
              />
              {buscandoCep && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Rua / Avenida</Label>
            <Input value={form?.endereco ?? ''} onChange={(e: any) => handleChange('endereco', e?.target?.value ?? '')} placeholder="Rua ou avenida" />
          </div>
          <div className="space-y-2">
            <Label>Número</Label>
            <Input value={form?.numero ?? ''} onChange={(e: any) => handleChange('numero', e?.target?.value ?? '')} placeholder="Nº" />
          </div>
          <div className="space-y-2">
            <Label>Complemento</Label>
            <Input value={form?.complemento ?? ''} onChange={(e: any) => handleChange('complemento', e?.target?.value ?? '')} placeholder="Apto, bloco, etc." />
          </div>
          <div className="space-y-2">
            <Label>Bairro</Label>
            <Input value={form?.bairro ?? ''} onChange={(e: any) => handleChange('bairro', e?.target?.value ?? '')} />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input value={form?.cidade ?? ''} onChange={(e: any) => handleChange('cidade', e?.target?.value ?? '')} />
          </div>
        </CardContent>
      </Card>

      {/* INTERESSES */}
      <Card>
        <CardHeader><CardTitle>Interesses (Tipos de Oficina)</CardTitle></CardHeader>
        <CardContent>
          {(tiposCurso?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum tipo de oficina cadastrado</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tiposCurso?.map?.((t: any) => (
                <label key={t?.id} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={form?.interesses?.includes?.(t?.id) ?? false}
                    onCheckedChange={() => toggleInteresse(t?.id)}
                  />
                  <span className="text-sm">{t?.nome ?? ''}</span>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button type="submit" disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Cadastrar Aluno')}
        </Button>
      </div>
    </form>
  );
}