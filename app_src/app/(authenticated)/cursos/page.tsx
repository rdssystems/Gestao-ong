'use client';

import { useEffect, useState, useCallback } from 'react';
import { BookOpen, Plus, Search, Eye, Pencil, Trash2, Power, CheckCircle2, Zap, Archive, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';

const statusOptions = ['Inscrições Abertas', 'Em Andamento', 'Concluído'];

type TabKey = 'ativas' | 'concluidas' | 'arquivadas';

export default function CursosPage() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabKey>('ativas');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [countAtivas, setCountAtivas] = useState(0);
  const [countConcluidas, setCountConcluidas] = useState(0);
  const [countArquivadas, setCountArquivadas] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'ativas') {
        const p1 = new URLSearchParams({ search, status: 'Inscrições Abertas', page: '1', limit: '100' });
        const p2 = new URLSearchParams({ search, status: 'Em Andamento', page: '1', limit: '100' });
        const [r1, r2] = await Promise.all([
          fetch(`/api/cursos?${p1}`),
          fetch(`/api/cursos?${p2}`),
        ]);
        const [d1, d2] = await Promise.all([r1?.json?.(), r2?.json?.()]);
        const all = [...(d1?.data ?? []), ...(d2?.data ?? [])];
        const totalAll = all.length;
        const start = (page - 1) * 10;
        setCursos(all.slice(start, start + 10));
        setTotalPages(Math.ceil(totalAll / 10));
        setTotal(totalAll);
        setCountAtivas(totalAll);
      } else if (tab === 'concluidas') {
        const params = new URLSearchParams({ search, status: 'Concluído', page: String(page), limit: '10' });
        const res = await fetch(`/api/cursos?${params}`);
        const data = await res?.json?.();
        setCursos(data?.data ?? []);
        setTotalPages(data?.totalPages ?? 1);
        setTotal(data?.total ?? 0);
        setCountConcluidas(data?.total ?? 0);
      } else {
        // Arquivadas: ativo=false
        const params = new URLSearchParams({ search, ativo: 'false', page: String(page), limit: '10' });
        const res = await fetch(`/api/cursos?${params}`);
        const data = await res?.json?.();
        setCursos(data?.data ?? []);
        setTotalPages(data?.totalPages ?? 1);
        setTotal(data?.total ?? 0);
        setCountArquivadas(data?.total ?? 0);
      }

      // Fetch counts for other tabs
      if (tab === 'ativas') {
        const [cRes, aRes] = await Promise.all([
          fetch(`/api/cursos?${new URLSearchParams({ search, status: 'Concluído', page: '1', limit: '1' })}`),
          fetch(`/api/cursos?${new URLSearchParams({ search, ativo: 'false', page: '1', limit: '1' })}`),
        ]);
        const [cData, aData] = await Promise.all([cRes?.json?.(), aRes?.json?.()]);
        setCountConcluidas(cData?.total ?? 0);
        setCountArquivadas(aData?.total ?? 0);
      } else if (tab === 'concluidas') {
        const [p1, p2, aRes] = await Promise.all([
          fetch(`/api/cursos?${new URLSearchParams({ search, status: 'Inscrições Abertas', page: '1', limit: '1' })}`),
          fetch(`/api/cursos?${new URLSearchParams({ search, status: 'Em Andamento', page: '1', limit: '1' })}`),
          fetch(`/api/cursos?${new URLSearchParams({ search, ativo: 'false', page: '1', limit: '1' })}`),
        ]);
        const [d1, d2, aData] = await Promise.all([p1?.json?.(), p2?.json?.(), aRes?.json?.()]);
        setCountAtivas((d1?.total ?? 0) + (d2?.total ?? 0));
        setCountArquivadas(aData?.total ?? 0);
      } else {
        const [p1, p2, cRes] = await Promise.all([
          fetch(`/api/cursos?${new URLSearchParams({ search, status: 'Inscrições Abertas', page: '1', limit: '1' })}`),
          fetch(`/api/cursos?${new URLSearchParams({ search, status: 'Em Andamento', page: '1', limit: '1' })}`),
          fetch(`/api/cursos?${new URLSearchParams({ search, status: 'Concluído', page: '1', limit: '1' })}`),
        ]);
        const [d1, d2, cData] = await Promise.all([p1?.json?.(), p2?.json?.(), cRes?.json?.()]);
        setCountAtivas((d1?.total ?? 0) + (d2?.total ?? 0));
        setCountConcluidas(cData?.total ?? 0);
      }
    } catch {} finally { setLoading(false); }
  }, [search, tab, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const arquivarOficina = async (curso: any) => {
    try {
      await fetch(`/api/cursos/${curso?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: false }),
      });
      toast.success('Oficina arquivada!');
      fetchData();
    } catch { toast.error('Erro ao arquivar'); }
  };

  const restaurarOficina = async (curso: any) => {
    try {
      await fetch(`/api/cursos/${curso?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: true }),
      });
      toast.success('Oficina restaurada!');
      fetchData();
    } catch { toast.error('Erro ao restaurar'); }
  };

  const excluirOficina = async (curso: any) => {
    if (!confirm(`Tem certeza que deseja EXCLUIR permanentemente a oficina "${curso?.nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/cursos/${curso?.id}`, { method: 'DELETE' });
      const data = await res?.json?.();
      if (!res?.ok) { toast.error(data?.error ?? 'Erro ao excluir'); return; }
      toast.success('Oficina excluída permanentemente!');
      fetchData();
    } catch { toast.error('Erro ao excluir'); }
  };

  const updateStatus = async (cursoId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/cursos/${cursoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res?.ok) { toast.error('Erro ao alterar status'); return; }
      toast.success(`Status alterado para ${newStatus}`);
      fetchData();
    } catch { toast.error('Erro ao alterar status'); }
  };

  const tabs: { key: TabKey; label: string; icon: any; count: number }[] = [
    { key: 'ativas', label: 'Ativas', icon: Zap, count: countAtivas },
    { key: 'concluidas', label: 'Concluídas', icon: CheckCircle2, count: countConcluidas },
    { key: 'arquivadas', label: 'Arquivadas', icon: Archive, count: countArquivadas },
  ];

  const emptyMessage = tab === 'ativas'
    ? 'Nenhuma oficina ativa encontrada'
    : tab === 'concluidas'
    ? 'Nenhuma oficina concluída encontrada'
    : 'Nenhuma oficina arquivada encontrada';

  return (
    <div className="space-y-6">
      <PageHeader icon={BookOpen} title="Oficinas" subtitle={`${total} oficina(s) encontrada(s)`}>
        <Link href="/cursos/novo"><Button><Plus className="w-4 h-4 mr-2" /> Nova Oficina</Button></Link>
      </PageHeader>

      {/* Toggle Ativas / Concluídas / Arquivadas */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                isActive ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'
              }`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar oficinas..." value={search} onChange={(e: any) => { setSearch(e?.target?.value ?? ''); setPage(1); }} className="pl-10" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i: number) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : (cursos?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {emptyMessage}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {cursos?.map?.((c: any, i: number) => (
              <motion.div
                key={c?.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className={`hover:shadow-md transition-shadow ${tab !== 'ativas' ? 'opacity-80' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-3 h-10 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: c?.tipoCurso?.cor ?? '#14b8a6' }} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{c?.nome ?? ''}</p>
                            {tab === 'arquivadas' && (
                              <Badge variant="secondary" className="text-xs">Arquivada</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                            <span>{c?.tipoCurso?.nome ?? ''}</span>
                            {c?.professor ? <span>Prof: {c.professor}</span> : null}
                            {c?.turno ? <span>Turno: {c.turno}</span> : null}
                            <span>Vagas: {c?.vagasOcupadas ?? 0}/{c?.vagas ?? 0}</span>
                            {c?.cargaHoraria ? <span>{c.cargaHoraria}h</span> : null}
                          </div>
                          {(c?.dataInicio || c?.dataFim) && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {c?.dataInicio ? format(new Date(c.dataInicio), 'dd/MM/yyyy') : '?'} → {c?.dataFim ? format(new Date(c.dataFim), 'dd/MM/yyyy') : '?'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:flex items-center gap-1.5 sm:gap-2 flex-shrink-0 w-full sm:w-auto">
                        {tab !== 'arquivadas' && (
                          <div className="col-span-2 sm:col-span-1">
                            <Select
                              value={c?.status ?? ''}
                              onValueChange={(v: string) => updateStatus(c?.id, v)}
                            >
                              <SelectTrigger className="w-full sm:w-32 h-8 text-[10px] sm:text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((s: string) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <Link href={`/cursos/${c?.id}`} className="flex-1 sm:flex-none">
                          <Button variant="outline" size="sm" className="w-full sm:w-8 h-8 p-0" title="Visualizar">
                            <Eye className="w-3.5 h-3.5" />
                            <span className="sm:hidden ml-2 text-[10px]">Ver</span>
                          </Button>
                        </Link>
                        {tab !== 'arquivadas' && (
                          <Link href={`/cursos/${c?.id}/editar`} className="flex-1 sm:flex-none">
                            <Button variant="outline" size="sm" className="w-full sm:w-8 h-8 p-0" title="Editar">
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="sm:hidden ml-2 text-[10px]">Editar</span>
                            </Button>
                          </Link>
                        )}
                        {tab === 'arquivadas' ? (
                          <Button variant="outline" size="sm" className="w-full sm:w-8 h-8 p-0" onClick={() => restaurarOficina(c)} title="Restaurar oficina">
                            <RotateCcw className="w-3.5 h-3.5 text-green-600" />
                            <span className="sm:hidden ml-2 text-[10px]">Restaurar</span>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="w-full sm:w-8 h-8 p-0" onClick={() => arquivarOficina(c)} title="Arquivar oficina">
                            <Archive className="w-3.5 h-3.5 text-amber-600" />
                            <span className="sm:hidden ml-2 text-[10px]">Arquivar</span>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="w-full sm:w-8 h-8 p-0 hover:bg-destructive/10 hover:text-destructive" onClick={() => excluirOficina(c)} title="Excluir oficina permanentemente">
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="sm:hidden ml-2 text-[10px]">Excluir</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )) ?? null}
          </AnimatePresence>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
        </div>
      )}
    </div>
  );
}