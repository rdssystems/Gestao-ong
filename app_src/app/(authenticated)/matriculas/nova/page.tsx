'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipboardList, ArrowLeft, Save, Users, Star } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function NovaMatriculaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [cursos, setCursos] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [interessados, setInteressados] = useState<any[]>([]);
  const [selectedCurso, setSelectedCurso] = useState(searchParams?.get?.('cursoId') ?? '');
  const [selectedAluno, setSelectedAluno] = useState(searchParams?.get?.('alunoId') ?? '');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    fetch('/api/cursos?all=true')
      .then((r: any) => r?.json?.())
      .then((d: any) => setCursos(d ?? []))
      .catch(() => {});
    fetch('/api/alunos?all=true')
      .then((r: any) => r?.json?.())
      .then((d: any) => setAlunos(d ?? []))
      .catch(() => {});
  }, []);

  // Load interested students when course changes
  useEffect(() => {
    if (!selectedCurso) { setInteressados([]); return; }
    const curso = cursos?.find?.((c: any) => c?.id === selectedCurso);
    if (!curso?.tipoCursoId) { setInteressados([]); return; }
    fetch(`/api/alunos?tipoCursoId=${curso.tipoCursoId}&all=true`)
      .then((r: any) => r?.json?.())
      .then((d: any) => setInteressados(d ?? []))
      .catch(() => setInteressados([]));
  }, [selectedCurso, cursos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAluno || !selectedCurso) { toast.error('Selecione aluno e oficina'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/matriculas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alunoId: selectedAluno, cursoId: selectedCurso, observacoes: observacoes || null }),
      });
      const data = await res?.json?.();
      if (!res?.ok) { toast.error(data?.error ?? 'Erro ao matricular'); return; }
      toast.success('Matrícula realizada com sucesso!');
      router.replace('/matriculas');
    } catch { toast.error('Erro ao matricular'); } finally { setSaving(false); }
  };

  const cursoSelecionado = cursos?.find?.((c: any) => c?.id === selectedCurso);
  const vagasDisp = cursoSelecionado ? Math.max(0, (cursoSelecionado?.vagas ?? 0) - (cursoSelecionado?.vagasOcupadas ?? 0)) : null;

  return (
    <div className="space-y-6">
      <PageHeader icon={ClipboardList} title="Nova Matrícula" subtitle="Vincule um aluno a uma oficina" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Dados da Matrícula</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Oficina *</Label>
              <Select value={selectedCurso} onValueChange={(v: string) => setSelectedCurso(v)}>
                <SelectTrigger><SelectValue placeholder="Selecione uma oficina" /></SelectTrigger>
                <SelectContent>
                  {cursos?.map?.((c: any) => (
                    <SelectItem key={c?.id} value={c?.id}>
                      {c?.nome ?? ''} ({c?.tipoCurso?.nome ?? ''})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {vagasDisp !== null && (
                <p className="text-xs text-muted-foreground">
                  {vagasDisp > 0 ? `${vagasDisp} vaga(s) disponível(is)` : <span className="text-destructive font-medium">Sem vagas disponíveis</span>}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Aluno *</Label>
              <Select value={selectedAluno} onValueChange={(v: string) => setSelectedAluno(v)}>
                <SelectTrigger><SelectValue placeholder="Selecione um aluno" /></SelectTrigger>
                <SelectContent>
                  {alunos?.map?.((a: any) => (
                    <SelectItem key={a?.id} value={a?.id}>
                      {a?.nomeCompleto ?? ''} {a?.cpf ? `(${a.cpf})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <textarea
                className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={observacoes}
                onChange={(e: any) => setObservacoes(e?.target?.value ?? '')}
                placeholder="Observações sobre a matrícula..."
              />
            </div>
          </CardContent>
        </Card>

        {selectedCurso && (interessados?.length ?? 0) > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Alunos Interessados neste Tipo de Oficina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {interessados?.map?.((a: any) => (
                  <div
                    key={a?.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedAluno === a?.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedAluno(a?.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                        {(a?.nomeCompleto ?? '?')?.[0]?.toUpperCase?.() ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{a?.nomeCompleto ?? ''}</p>
                        <p className="text-xs text-muted-foreground">{a?.email ?? ''}</p>
                      </div>
                    </div>
                    {selectedAluno === a?.id && <Badge>Selecionado</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Salvando...' : 'Realizar Matrícula'}
          </Button>
        </div>
      </form>
    </div>
  );
}
