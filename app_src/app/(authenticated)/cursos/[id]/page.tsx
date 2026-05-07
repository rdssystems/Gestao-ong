'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, ArrowLeft, Pencil, Clock, Users, Calendar, MapPin, ClipboardList, Eye, CircleDollarSign, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CursoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [curso, setCurso] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedMatricula, setSelectedMatricula] = useState<any>(null);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    valor: '',
    formaPagamento: 'Dinheiro',
  });

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/cursos/${params.id}`)
      .then((r: any) => r?.json?.())
      .then((d: any) => setCurso(d ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params?.id]);

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatricula) return;
    setSavingPayment(true);
    try {
      const res = await fetch('/api/pagamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matriculaId: selectedMatricula.id,
          cursoId: curso.id,
          alunoId: selectedMatricula.alunoId,
          mesReferencia: paymentForm.mes,
          anoReferencia: paymentForm.ano,
          valorPago: paymentForm.valor,
          formaPagamento: paymentForm.formaPagamento,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao registrar pagamento');
      toast.success('Pagamento registrado com sucesso!');
      setIsPaymentModalOpen(false);
      
      // Refresh curso data
      const refreshRes = await fetch(`/api/cursos/${curso.id}`);
      const refreshData = await refreshRes.json();
      setCurso(refreshData);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingPayment(false);
    }
  };

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
              {curso?.matriculas?.map?.((m: any) => {
                const pagamentosAluno = curso?.pagamentos?.filter((p: any) => p.matriculaId === m.id) || [];
                const currentMonthPayment = pagamentosAluno.find((p: any) => p.mesReferencia === (new Date().getMonth() + 1) && p.anoReferencia === new Date().getFullYear());
                
                return (
                  <div key={m?.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border gap-3">
                    <Link href={`/alunos/${m?.aluno?.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {(m?.aluno?.nomeCompleto ?? '?')?.[0]?.toUpperCase?.() ?? '?'}
                      </div>
                      <p className="text-sm font-medium truncate">{m?.aluno?.nomeCompleto ?? ''}</p>
                    </Link>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
                      <Badge variant={m?.status === 'Ativa' ? 'default' : 'secondary'}>{m?.status ?? ''}</Badge>
                      
                      {curso?.temMensalidade && (
                        <>
                          <Badge variant={currentMonthPayment ? 'default' : 'destructive'} className="text-[10px]">
                            {currentMonthPayment ? 'Mês Pago' : 'Mês Pendente'}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 text-xs px-2"
                            onClick={() => {
                              setSelectedMatricula(m);
                              setPaymentForm({
                                ...paymentForm,
                                mes: new Date().getMonth() + 1,
                                ano: new Date().getFullYear(),
                                valor: curso.valorMensalidade ? String(curso.valorMensalidade) : '',
                              });
                              setIsPaymentModalOpen(true);
                            }}
                          >
                            <CircleDollarSign className="w-3.5 h-3.5 mr-1 text-green-600" />
                            Receber
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-background rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CircleDollarSign className="w-5 h-5 text-green-600" /> Registrar Pagamento
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsPaymentModalOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
            
            <div className="p-4 bg-muted/30 border-b">
              <p className="text-sm text-muted-foreground">Aluno</p>
              <p className="font-semibold">{selectedMatricula?.aluno?.nomeCompleto}</p>
            </div>

            {/* Check for existing payment */}
            {(() => {
              const existing = curso?.pagamentos?.find((p: any) => 
                p.matriculaId === selectedMatricula?.id && 
                p.mesReferencia === paymentForm.mes && 
                p.anoReferencia === paymentForm.ano
              );
              if (existing) {
                return (
                  <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                    <div className="p-1 bg-amber-100 rounded-full">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-800">Pagamento já registrado</p>
                      <p className="text-[10px] text-amber-700">Já existe um lançamento para este mês. Você ainda pode realizar outro lançamento se necessário.</p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <form onSubmit={handleSavePayment} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mês Referência</Label>
                  <Select value={String(paymentForm.mes)} onValueChange={(v) => setPaymentForm({...paymentForm, mes: parseInt(v)})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }).map((_, i) => (
                        <SelectItem key={i+1} value={String(i+1)}>{new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Input type="number" value={paymentForm.ano} onChange={(e) => setPaymentForm({...paymentForm, ano: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Valor Pago (R$)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <Input 
                    type="number" step="0.01" min="0.01" required className="pl-9"
                    value={paymentForm.valor} onChange={(e) => setPaymentForm({...paymentForm, valor: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select value={paymentForm.formaPagamento} onValueChange={(v) => setPaymentForm({...paymentForm, formaPagamento: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                    <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={savingPayment} className="bg-green-600 hover:bg-green-700 text-white">
                  {savingPayment ? 'Salvando...' : 'Confirmar Recebimento'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
