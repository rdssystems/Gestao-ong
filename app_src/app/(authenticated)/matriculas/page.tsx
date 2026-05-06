'use client';

import { useEffect, useState, useCallback } from 'react';
import { ClipboardList, Search, Users, GraduationCap, Calendar, Clock, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';

export default function MatriculasPage() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar oficinas com Inscrições Abertas e Em Andamento
      const params1 = new URLSearchParams({
        search,
        status: 'Inscrições Abertas',
        page: '1',
        limit: '100',
      });
      const params2 = new URLSearchParams({
        search,
        status: 'Em Andamento',
        page: '1',
        limit: '100',
      });
      const [res1, res2] = await Promise.all([
        fetch(`/api/cursos?${params1}`),
        fetch(`/api/cursos?${params2}`),
      ]);
      const [data1, data2] = await Promise.all([
        res1?.json?.(),
        res2?.json?.(),
      ]);
      const allCursos = [...(data1?.data ?? []), ...(data2?.data ?? [])];
      const totalAll = allCursos.length;
      const start = (page - 1) * 10;
      const paginated = allCursos.slice(start, start + 10);
      setCursos(paginated);
      setTotalPages(Math.ceil(totalAll / 10));
      setTotal(totalAll);
    } catch {} finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      <PageHeader icon={ClipboardList} title="Matrículas" subtitle={`${total} oficina(s) disponível(is) para matrícula`} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar oficina..."
            value={search}
            onChange={(e: any) => { setSearch(e?.target?.value ?? ''); setPage(1); }}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i: number) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (cursos?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-lg">Nenhuma oficina disponível para matrícula</p>
            <p className="text-sm text-muted-foreground mt-1">
              Altere o status de uma oficina para &quot;Inscrições Abertas&quot; ou &quot;Em Andamento&quot; na página de oficinas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cursos?.map?.((c: any, i: number) => {
            const vagasDisp = Math.max(0, (c?.vagas ?? 0) - (c?.vagasOcupadas ?? 0));
            const vagasTotal = c?.vagas ?? 0;
            const percentOcupado = vagasTotal > 0 ? Math.min(100, ((c?.vagasOcupadas ?? 0) / vagasTotal) * 100) : 0;

            return (
              <motion.div
                key={c?.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/matriculas/curso/${c?.id}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 group"
                    style={{ borderLeftColor: c?.tipoCurso?.cor ?? '#14b8a6' }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                            {c?.nome ?? ''}
                          </h3>
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1"
                            style={{
                              backgroundColor: (c?.tipoCurso?.cor ?? '#14b8a6') + '20',
                              color: c?.tipoCurso?.cor ?? '#14b8a6',
                            }}
                          >
                            {c?.tipoCurso?.nome ?? ''}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            c?.status === 'Inscrições Abertas' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {c?.status ?? ''}
                          </span>
                          <Badge variant={vagasDisp > 0 ? 'default' : 'destructive'}>
                            {vagasDisp > 0 ? `${vagasDisp} vaga(s)` : 'Lotado'}
                          </Badge>
                        </div>
                      </div>

                      {/* Barra de vagas */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{c?.vagasOcupadas ?? 0} matriculado(s)</span>
                          <span>{vagasTotal} vaga(s) total</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percentOcupado >= 90 ? 'bg-red-500' : percentOcupado >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percentOcupado}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {c?.professor && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {c.professor}
                          </span>
                        )}
                        {c?.turno && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {c.turno}
                          </span>
                        )}
                        {c?.dataInicio && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(c.dataInicio), 'dd/MM/yyyy')}
                            {c?.dataFim ? ` - ${format(new Date(c.dataFim), 'dd/MM/yyyy')}` : ''}
                          </span>
                        )}
                        {c?.diasSemana && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {c.diasSemana}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          }) ?? null}
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
