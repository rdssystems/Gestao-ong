'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, ArrowLeft, Pencil, Clock, Users, Calendar, MapPin, ClipboardList, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CursoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [curso, setCurso] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/cursos/${params.id}`)
      .then((r: any) => r?.json?.())
      .then((d: any) => setCurso(d ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) return <div className="space-y-4">{[1,2].map((i: number) => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}</div>;
  if (!curso) return <div className="text-center py-16 text-muted-foreground">Oficina não encontrada</div>;

  const vagasDisponiveis = Math.max(0, (curso?.vagas ?? 0) - (curso?.vagasOcupadas ?? 0));

  return (
    <div className="space-y-6 relative">
      {/* Banner de Cabeçalho Preenchido */}
      <div className="relative -mt-6 -mx-6 px-6 pt-10 pb-8 mb-6 rounded-b-[2rem] overflow-hidden border-b shadow-sm">
        <div 
          className="absolute inset-0 opacity-[0.12] pointer-events-none z-0"
          style={{ backgroundColor: curso?.tipoCurso?.cor || 'var(--primary)' }} 
        />
        <div className="absolute top-0 left-0 right-0 h-1.5 z-0" style={{ backgroundColor: curso?.tipoCurso?.cor || 'var(--primary)' }} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex-shrink-0 shadow-sm border border-black/5" style={{ backgroundColor: (curso?.tipoCurso?.cor ?? '#14b8a6') + '15' }}>
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: curso?.tipoCurso?.cor ?? '#14b8a6' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-foreground">{curso?.nome ?? ''}</h1>
                <Badge className="text-[10px] uppercase tracking-wider font-bold shadow-sm border-none" style={{ backgroundColor: curso?.tipoCurso?.cor ?? '#14b8a6', color: '#fff' }}>
                  {curso?.tipoCurso?.nome ?? ''}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Status: {curso?.status ?? ''}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="bg-background/80 backdrop-blur-sm" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
            <div className="flex flex-wrap gap-2">
              <Link href={`/cursos/${curso?.id}/chamada`}><Button variant="secondary" className="shadow-sm border border-black/5"><ClipboardList className="w-4 h-4 mr-2" /> Chamada</Button></Link>
              <Link href={`/cursos/${curso?.id}/chamada/historico`}><Button variant="outline" className="bg-background/80 backdrop-blur-sm"><Eye className="w-4 h-4 mr-2" /> Visualizar</Button></Link>
              <Link href={`/cursos/${curso?.id}/editar`}><Button className="shadow-md"><Pencil className="w-4 h-4 mr-2" /> Editar</Button></Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Vagas', value: `${curso?.vagasOcupadas ?? 0}/${curso?.vagas ?? 0}`, icon: Users, sub: `${vagasDisponiveis} disponíveis` },
          { label: 'Turno', value: curso?.turno ?? '-', icon: MapPin },
          { label: 'Horário', value: curso?.horarioInicio ? `${curso.horarioInicio} - ${curso.horarioFim}` : '-', icon: Clock },
          { label: 'Dias', value: curso?.diasSemana ?? '-', icon: Calendar },
        ].map((item: any, i: number) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4 text-center">
                <item.icon className="w-5 h-5 mx-auto text-primary mb-2" />
                <p className="font-mono font-bold">{item?.value ?? '-'}</p>
                <p className="text-xs text-muted-foreground">{item?.label ?? ''}</p>
                {item?.sub ? <p className="text-xs text-muted-foreground">{item.sub}</p> : null}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {curso?.professor && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm"><span className="text-muted-foreground">Professor:</span> <span className="font-medium">{curso.professor}</span></p>
          </CardContent>
        </Card>
      )}

      {(curso?.dataInicio || curso?.dataFim) && (
        <Card>
          <CardContent className="p-4 flex gap-6">
            {curso?.dataInicio && <div><p className="text-xs text-muted-foreground">Início</p><p className="text-sm font-medium">{format(new Date(curso.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}</p></div>}
            {curso?.dataFim && <div><p className="text-xs text-muted-foreground">Fim</p><p className="text-sm font-medium">{format(new Date(curso.dataFim), 'dd/MM/yyyy', { locale: ptBR })}</p></div>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Alunos Matriculados ({curso?.matriculas?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {(curso?.matriculas?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum aluno matriculado</p>
          ) : (
            <div className="space-y-2">
              {curso?.matriculas?.map?.((m: any) => (
                <Link key={m?.id} href={`/alunos/${m?.aluno?.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                      {(m?.aluno?.nomeCompleto ?? '?')?.[0]?.toUpperCase?.() ?? '?'}
                    </div>
                    <p className="text-sm font-medium">{m?.aluno?.nomeCompleto ?? ''}</p>
                  </div>
                  <Badge variant={m?.status === 'Ativa' ? 'default' : 'secondary'}>{m?.status ?? ''}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
