'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, ClipboardList, TrendingUp, UserPlus, Trophy, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

interface DashData {
  totalAlunos: number;
  totalCursos: number;
  totalMatriculas: number;
  recentAlunos: any[];
  topCursos: any[];
}

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const inc = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span className="font-mono text-3xl font-bold">{count}</span>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r: any) => r?.json?.())
      .then((d: any) => setData(d ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader icon={LayoutDashboard} title="Dashboard" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i: number) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Alunos Ativos', value: data?.totalAlunos ?? 0, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Oficinas Ativas', value: data?.totalCursos ?? 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Matrículas Ativas', value: data?.totalMatriculas ?? 0, icon: ClipboardList, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader icon={LayoutDashboard} title="Dashboard" subtitle="Visão geral do sistema" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats?.map((s: any, i: number) => {
          const Icon = s?.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{s?.label}</p>
                      <AnimatedCounter value={s?.value ?? 0} />
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${s?.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${s?.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-amber-500" />
                Oficinas Mais Procuradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(data?.topCursos?.length ?? 0) === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma oficina cadastrada</p>
              ) : (
                <div className="space-y-3">
                  {data?.topCursos?.map?.((c: any, i: number) => (
                    <Link key={c?.id ?? i} href={`/cursos/${c?.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{c?.nome ?? ''}</p>
                          <p className="text-xs text-muted-foreground">{c?.tipoCurso?.nome ?? ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-bold">{c?._count?.matriculas ?? c?.vagasOcupadas ?? 0}</p>
                        <p className="text-xs text-muted-foreground">matrículas</p>
                      </div>
                    </Link>
                  )) ?? null}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="w-5 h-5 text-teal-500" />
                Alunos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(data?.recentAlunos?.length ?? 0) === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum aluno cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {data?.recentAlunos?.map?.((a: any) => (
                    <Link key={a?.id} href={`/alunos/${a?.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                          {(a?.nomeCompleto ?? '?')?.[0]?.toUpperCase?.() ?? '?'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{a?.nomeCompleto ?? ''}</p>
                          <p className="text-xs text-muted-foreground">{a?.email ?? 'Sem email'}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {a?.createdAt ? format(new Date(a.createdAt), "dd/MM/yyyy", { locale: ptBR }) : ''}
                      </p>
                    </Link>
                  )) ?? null}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
