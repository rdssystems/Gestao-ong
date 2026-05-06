'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar as CalendarIcon, Download, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function HistoricoChamadaPage() {
  const params = useParams();
  const router = useRouter();
  const [curso, setCurso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matrix, setMatrix] = useState<{ dates: string[], students: any[], data: Record<string, Record<string, string>> }>({
    dates: [],
    students: [],
    data: {}
  });

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true);
    
    Promise.all([
      fetch(`/api/cursos/${params.id}`).then(r => r.json()),
      fetch(`/api/cursos/${params.id}/chamada?full=true`).then(r => r.json())
    ])
    .then(([cursoData, presencas]) => {
      setCurso(cursoData);
      
      if (Array.isArray(presencas)) {
        // Organizar dados para a matriz
        const dateSet = new Set<string>();
        const studentMap = new Map<string, any>();
        const attendanceData: Record<string, Record<string, string>> = {};

        presencas.forEach((p: any) => {
          const dateKey = p.data.split('T')[0];
          dateSet.add(dateKey);
          
          if (!studentMap.has(p.alunoId)) {
            studentMap.set(p.alunoId, p.aluno);
          }

          if (!attendanceData[p.alunoId]) {
            attendanceData[p.alunoId] = {};
          }
          attendanceData[p.alunoId][dateKey] = p.status;
        });

        // Ordenar datas
        const sortedDates = Array.from(dateSet).sort();
        // Ordenar alunos por nome
        const sortedStudents = Array.from(studentMap.values()).sort((a, b) => 
          a.nomeCompleto.localeCompare(b.nomeCompleto)
        );

        setMatrix({
          dates: sortedDates,
          students: sortedStudents,
          data: attendanceData
        });
      }
    })
    .catch(() => toast.error('Erro ao carregar histórico'))
    .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>;

  return (
    <div className="space-y-6 relative print:p-0 print:m-0 print:space-y-4">
      <style jsx global>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          /* Esconder elementos de interface global */
          aside, nav, header { display: none !important; }
          /* Esconder botões e sombras */
          .print\\:hidden { display: none !important; }
          .shadow-\\[2px_0_5px_-2px_rgba\\(0\\,0\\,0\\,0\\.1\\)\\] { box-shadow: none !important; }
          .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
          /* Limpar layout global que possa restringir largura */
          body > div { display: block !important; padding: 0 !important; max-width: none !important; }
          main { padding: 0 !important; width: 100% !important; max-width: none !important; }
        }
      `}</style>

      {/* Banner de Cabeçalho Preenchido (Oculto na impressão) */}
      <div className="relative -mt-6 -mx-6 px-6 pt-10 pb-8 mb-6 rounded-b-[2rem] overflow-hidden border-b shadow-sm print:hidden">
        <div 
          className="absolute inset-0 opacity-[0.12] pointer-events-none z-0"
          style={{ backgroundColor: curso?.tipoCurso?.cor || 'var(--primary)' }} 
        />
        <div className="absolute top-0 left-0 right-0 h-1.5 z-0" style={{ backgroundColor: curso?.tipoCurso?.cor || 'var(--primary)' }} />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 print:hidden">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="print:hidden bg-background/80 backdrop-blur-sm shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight text-foreground">Diário de Frequência</h1>
              <p className="text-sm font-medium text-muted-foreground">{curso?.nome}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto print:hidden">
            <Button variant="outline" className="hidden sm:flex print:hidden bg-background/80 backdrop-blur-sm shadow-sm" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" /> Exportar / Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* Cabeçalho exclusivo para impressão */}
      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-widest">{curso?.nome}</h1>
        <p className="text-sm text-gray-600 mt-1">Diário de Frequência • Gestão ONG</p>
      </div>

      <Card className="overflow-hidden border-none shadow-none print:shadow-none print:border print:border-gray-200">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Mapa de Presenças ({matrix.dates.length} dias registrados)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider sticky left-0 bg-muted/50 z-10 border-r min-w-[200px]">
                    Nome do Aluno
                  </th>
                  {matrix.dates.map((date) => (
                    <th key={date} className="p-2 text-center text-[10px] font-bold uppercase tracking-tighter border-r min-w-[60px]">
                      <div className="flex flex-col items-center">
                        <span>{format(parseISO(date), 'dd/MM')}</span>
                        <span className="text-[8px] opacity-60 font-normal">{format(parseISO(date), 'eee', { locale: ptBR })}</span>
                      </div>
                    </th>
                  ))}
                  <th className="p-2 text-center text-xs font-bold bg-muted/30 min-w-[60px]">Total %</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {matrix.students.length === 0 ? (
                  <tr>
                    <td colSpan={matrix.dates.length + 2} className="p-8 text-center text-muted-foreground italic">
                      Nenhuma chamada realizada até o momento.
                    </td>
                  </tr>
                ) : (
                  matrix.students.map((aluno) => {
                    let presentCount = 0;
                    matrix.dates.forEach(d => {
                      if (matrix.data[aluno.id]?.[d] === 'P' || matrix.data[aluno.id]?.[d] === 'J') presentCount++;
                    });
                    const percent = matrix.dates.length > 0 ? Math.round((presentCount / matrix.dates.length) * 100) : 0;

                    return (
                      <tr key={aluno.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 text-sm font-medium sticky left-0 bg-background z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          {aluno.nomeCompleto}
                        </td>
                        {matrix.dates.map((date) => {
                          const status = matrix.data[aluno.id]?.[date];
                          return (
                            <td key={date} className="p-2 text-center border-r">
                              {status ? (
                                <Badge 
                                  className={`
                                    w-7 h-7 rounded-md p-0 flex items-center justify-center text-[10px] font-bold border-none
                                    ${status === 'P' ? 'bg-emerald-500 text-white' : ''}
                                    ${status === 'A' ? 'bg-rose-500 text-white' : ''}
                                    ${status === 'J' ? 'bg-amber-500 text-white' : ''}
                                  `}
                                >
                                  {status}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground/30 text-xs">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-2 text-center bg-muted/10 font-mono text-xs font-bold">
                          <span className={percent < 75 ? 'text-rose-500' : 'text-emerald-600'}>
                            {percent}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500"></div>
          <span className="text-xs text-muted-foreground font-medium">P = Presente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-500"></div>
          <span className="text-xs text-muted-foreground font-medium">A = Ausente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500"></div>
          <span className="text-xs text-muted-foreground font-medium">J = Justificado</span>
        </div>
      </div>
    </div>
  );
}
