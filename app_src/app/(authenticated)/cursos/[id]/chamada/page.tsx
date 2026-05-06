'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Users, Calendar as CalendarIcon, Check, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

type Status = 'P' | 'A' | 'J';

export default function ChamadaPage() {
  const params = useParams();
  const router = useRouter();
  const [curso, setCurso] = useState<any>(null);
  const [chamadas, setChamadas] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true);
    fetch(`/api/cursos/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setCurso(d);
        // Inicializar todas como P (Presente) por padrão
        const initial: Record<string, Status> = {};
        d.matriculas?.forEach((m: any) => {
          if (m.status === 'Ativa') {
            initial[m.alunoId] = 'P';
          }
        });
        setChamadas(initial);
      })
      .catch(() => toast.error('Erro ao carregar oficina'))
      .finally(() => setLoading(false));
  }, [params?.id]);

  const handleStatusChange = (alunoId: string, status: Status) => {
    setChamadas((prev) => ({ ...prev, [alunoId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        data: data,
        chamadas: Object.entries(chamadas).map(([alunoId, status]) => ({
          alunoId,
          status,
        })),
      };

      const res = await fetch(`/api/cursos/${params.id}/chamada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Falha ao salvar');
      
      toast.success('Chamada salva com sucesso!');
      router.push(`/cursos/${params.id}`);
    } catch (error) {
      toast.error('Erro ao salvar chamada');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>;

  const alunosAtivos = curso?.matriculas?.filter((m: any) => m.status === 'Ativa') || [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto relative">
      {/* Banner de Cabeçalho Preenchido */}
      <div className="relative -mt-6 -mx-6 px-6 pt-10 pb-8 mb-6 rounded-b-[2rem] overflow-hidden border-b shadow-sm">
        <div 
          className="absolute inset-0 opacity-[0.12] pointer-events-none z-0"
          style={{ backgroundColor: curso?.tipoCurso?.cor || 'var(--primary)' }} 
        />
        <div className="absolute top-0 left-0 right-0 h-1.5 z-0" style={{ backgroundColor: curso?.tipoCurso?.cor || 'var(--primary)' }} />

        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="bg-background/80 backdrop-blur-sm shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight text-foreground">Fazer Chamada</h1>
              <p className="text-sm font-medium text-muted-foreground">{curso?.nome}</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="hidden sm:flex shadow-md">
            <Save className="w-4 h-4 mr-2" /> Salvar Chamada
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <input 
              type="date" 
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {alunosAtivos.length} alunos inscritos
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {alunosAtivos.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Nenhum aluno ativo nesta oficina.</p>
        ) : (
          alunosAtivos.map((m: any) => (
            <Card key={m.id} className="overflow-hidden">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                    {m.aluno.nomeCompleto[0]}
                  </div>
                  <div>
                    <p className="font-medium">{m.aluno.nomeCompleto}</p>
                    <p className="text-xs text-muted-foreground">Matrícula: {m.status}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  {[
                    { val: 'P', label: 'P', color: 'bg-emerald-500', text: 'Presente' },
                    { val: 'A', label: 'A', color: 'bg-rose-500', text: 'Ausente' },
                    { val: 'J', label: 'J', color: 'bg-amber-500', text: 'Justificado' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => handleStatusChange(m.alunoId, s.val as Status)}
                      className={`
                        w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all border-2
                        ${chamadas[m.alunoId] === s.val 
                          ? `${s.color} text-white border-transparent scale-105 shadow-md` 
                          : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'}
                      `}
                    >
                      <span className="text-lg font-bold">{s.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="sm:hidden fixed bottom-6 left-4 right-4">
        <Button onClick={handleSave} disabled={saving} className="w-full shadow-lg py-6 text-lg">
          <Save className="w-5 h-5 mr-2" /> Salvar Chamada
        </Button>
      </div>
      
      <div className="h-20 sm:hidden" /> {/* Spacer for fixed button */}
    </div>
  );
}
