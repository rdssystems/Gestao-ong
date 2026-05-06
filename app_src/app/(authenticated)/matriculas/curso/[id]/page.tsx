'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ClipboardList, ArrowLeft, UserPlus, Users, GraduationCap,
  Calendar, Clock, Star, XCircle, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  'Ativa': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Cancelada': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Concluída': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  'Trancada': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function MatriculaCursoPage() {
  const params = useParams();
  const router = useRouter();
  const cursoId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matriculando, setMatriculando] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/cursos/${cursoId}/interessados`);
      const json = await res?.json?.();
      if (!res?.ok) { toast.error(json?.error ?? 'Erro ao carregar dados'); return; }
      setData(json);
    } catch { toast.error('Erro ao carregar dados'); }
    finally { setLoading(false); }
  }, [cursoId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMatricular = async (alunoId: string, nomeAluno: string) => {
    setMatriculando(alunoId);
    try {
      const res = await fetch('/api/matriculas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alunoId, cursoId }),
      });
      const json = await res?.json?.();
      if (!res?.ok) {
        toast.error(json?.error ?? 'Erro ao matricular');
        return;
      }
      toast.success(`${nomeAluno} matriculado(a) com sucesso!`);
      fetchData();
    } catch {
      toast.error('Erro ao matricular');
    } finally {
      setMatriculando(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Oficina não encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const curso = data?.curso;
  const matriculados = data?.matriculados ?? [];
  const interessados = data?.interessados ?? [];
  const vagasDisp = Math.max(0, (curso?.vagas ?? 0) - (curso?.vagasOcupadas ?? 0));
  const percentOcupado = (curso?.vagas ?? 0) > 0
    ? Math.min(100, ((curso?.vagasOcupadas ?? 0) / (curso?.vagas ?? 1)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => router.push('/matriculas')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Matrículas
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight">{curso?.nome ?? ''}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: (curso?.tipoCurso?.cor ?? '#14b8a6') + '20',
                color: curso?.tipoCurso?.cor ?? '#14b8a6',
              }}
            >
              {curso?.tipoCurso?.nome ?? ''}
            </span>
            {curso?.professor && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {curso.professor}
              </span>
            )}
            {curso?.turno && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {curso.turno}
              </span>
            )}
            {curso?.dataInicio && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(curso.dataInicio), 'dd/MM/yyyy')}
                {curso?.dataFim ? ` a ${format(new Date(curso.dataFim), 'dd/MM/yyyy')}` : ''}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={vagasDisp > 0 ? 'default' : 'destructive'} className="text-sm px-3 py-1">
            {vagasDisp} vaga(s) disponível(is)
          </Badge>
        </div>
      </div>

      {/* Barra de vagas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{curso?.vagasOcupadas ?? 0} matriculado(s)</span>
            <span>{curso?.vagas ?? 0} vaga(s) total</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percentOcupado >= 90 ? 'bg-red-500' : percentOcupado >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${percentOcupado}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Matriculados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            Alunos Matriculados ({matriculados?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(matriculados?.length ?? 0) === 0 ? (
            <p className="text-muted-foreground text-center py-6">Nenhum aluno matriculado ainda</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Aluno</th>
                    <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">CPF</th>
                    <th className="pb-3 font-medium text-muted-foreground hidden md:table-cell">Contato</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {matriculados?.map?.((m: any) => (
                    <tr key={m?.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3">
                        <Link href={`/alunos/${m?.aluno?.id}`} className="font-medium hover:text-primary hover:underline">
                          {m?.aluno?.nomeCompleto ?? ''}
                        </Link>
                      </td>
                      <td className="py-3 hidden sm:table-cell text-muted-foreground">
                        {m?.aluno?.cpf ?? '-'}
                      </td>
                      <td className="py-3 hidden md:table-cell text-muted-foreground">
                        {m?.aluno?.telefone || m?.aluno?.whatsapp || m?.aluno?.email || '-'}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors?.[m?.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {m?.status ?? ''}
                        </span>
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {m?.dataMatricula ? format(new Date(m.dataMatricula), 'dd/MM/yyyy') : '-'}
                      </td>
                    </tr>
                  )) ?? null}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Alunos Interessados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5 text-amber-500" />
            Alunos Interessados ({interessados?.length ?? 0})
            <span className="text-sm font-normal text-muted-foreground ml-1">
              &mdash; interessados em &ldquo;{curso?.tipoCurso?.nome ?? ''}&rdquo;
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(interessados?.length ?? 0) === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              Nenhum aluno interessado neste tipo de oficina ainda não matriculado
            </p>
          ) : vagasDisp <= 0 ? (
            <div className="text-center py-6">
              <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
              <p className="text-muted-foreground">
                A oficina está lotada. Não é possível realizar novas matrículas.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {interessados.length} aluno(s) interessado(s) aguardando vaga.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {interessados?.map?.((a: any, i: number) => (
                <motion.div
                  key={a?.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {(a?.nomeCompleto ?? '?')?.[0]?.toUpperCase?.() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/alunos/${a?.id}`} className="font-medium text-sm hover:text-primary hover:underline truncate block">
                        {a?.nomeCompleto ?? ''}
                      </Link>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {a?.cpf && <span>{a.cpf}</span>}
                        {a?.email && <span>{a.email}</span>}
                        {a?.telefone && <span>{a.telefone}</span>}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="flex-shrink-0"
                    disabled={matriculando === a?.id || vagasDisp <= 0}
                    onClick={() => handleMatricular(a?.id, a?.nomeCompleto ?? 'Aluno')}
                  >
                    {matriculando === a?.id ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-1" />
                    )}
                    Matricular
                  </Button>
                </motion.div>
              )) ?? null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
