'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, Plus, Search, Eye, Pencil, UserX, UserCheck, GraduationCap, Trash2, FolderPlus, FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ativo');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [cursos, setCursos] = useState<any[]>([]);
  const [selectedAluno, setSelectedAluno] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, status: statusFilter, page: String(page), limit: '10' });
      const res = await fetch(`/api/alunos?${params}`);
      const data = await res?.json?.();
      setAlunos(data?.data ?? []);
      setTotalPages(data?.totalPages ?? 1);
      setTotal(data?.total ?? 0);
    } catch {} finally { setLoading(false); }
  }, [search, statusFilter, page]);

  const fetchCursos = useCallback(async () => {
    try {
      const res = await fetch('/api/cursos?all=true');
      const data = await res?.json?.();
      setCursos(data ?? []);
    } catch {}
  }, []);

  useEffect(() => { 
    fetchData(); 
    fetchCursos();
  }, [fetchData, fetchCursos]);

  const toggleAtivo = async (aluno: any) => {
    const newAtivo = !aluno?.ativo;
    try {
      const res = await fetch(`/api/alunos/${aluno?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: newAtivo }),
      });
      if (res?.ok) {
        toast.success(newAtivo ? 'Aluno desarquivado!' : 'Aluno arquivado!');
        fetchData();
      }
    } catch { toast.error('Erro'); }
  };

  const deleteAluno = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este aluno? Todas as matrículas e registros de presença serão apagados.')) return;
    try {
      const res = await fetch(`/api/alunos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Aluno excluído com sucesso!');
        fetchData();
      } else {
        toast.error('Erro ao excluir aluno');
      }
    } catch { toast.error('Erro de comunicação com o servidor'); }
  };

  const handleToggleOficina = async (cursoId: string, matriculaId: string | undefined, isEnrolled: boolean) => {
    if (!selectedAluno) return;
    setIsToggling(cursoId);
    try {
      if (isEnrolled && matriculaId) {
        const res = await fetch(`/api/matriculas/${matriculaId}`, { method: 'DELETE' });
        if (res.ok) toast.success('Matrícula removida com sucesso!');
        else toast.error('Erro ao remover matrícula');
      } else {
        const res = await fetch('/api/matriculas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alunoId: selectedAluno.id, cursoId }),
        });
        const data = await res.json();
        if (res.ok) toast.success('Matrícula realizada com sucesso!');
        else toast.error(data?.error ?? 'Erro ao realizar matrícula');
      }
      
      // Update the selected aluno locally for fast feedback, then re-fetch
      const updatedRes = await fetch(`/api/alunos/${selectedAluno.id}`);
      const updatedAluno = await updatedRes.json();
      setSelectedAluno(updatedAluno);
      fetchData();
    } catch {
      toast.error('Erro de comunicação com o servidor');
    } finally {
      setIsToggling(null);
    }
  };

  const openDocModal = async (aluno: any) => {
    setSelectedAluno(aluno);
    setIsDocModalOpen(true);
    try {
      const res = await fetch(`/api/alunos/${aluno.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAluno(data);
      }
    } catch {}
  };

  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAluno || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    try {
      const res = await fetch(`/api/alunos/${selectedAluno.id}/documentos`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        toast.success('Documento anexado com sucesso!');
        // Refresh student data
        const updatedRes = await fetch(`/api/alunos/${selectedAluno.id}`);
        const updatedAluno = await updatedRes.json();
        setSelectedAluno(updatedAluno);
        fetchData();
      } else {
        toast.error('Erro ao anexar documento');
      }
    } catch {
      toast.error('Erro de comunicação com o servidor');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!window.confirm('Excluir este documento permanentemente?')) return;
    try {
      const res = await fetch(`/api/documentos/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Documento excluído!');
        const updatedRes = await fetch(`/api/alunos/${selectedAluno.id}`);
        const updatedAluno = await updatedRes.json();
        setSelectedAluno(updatedAluno);
        fetchData();
      } else {
        toast.error('Erro ao excluir documento');
      }
    } catch { toast.error('Erro no servidor'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={Users} title="Alunos" subtitle={`${total} aluno(s) encontrado(s)`}>
        <Link href="/alunos/novo">
          <Button><Plus className="w-4 h-4 mr-2" /> Novo Aluno</Button>
        </Link>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, CPF ou email..." value={search} onChange={(e: any) => { setSearch(e?.target?.value ?? ''); setPage(1); }} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Arquivados</SelectItem>
            <SelectItem value="todos">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i: number) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : (alunos?.length ?? 0) === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum aluno encontrado</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {alunos?.map?.((a: any, i: number) => (
            <motion.div key={a?.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:shadow-md transition-shadow overflow-hidden">
                <div className="flex flex-col sm:flex-row h-full">
                  {/* Lateral Photo */}
                  <div className="w-full sm:w-28 bg-primary/5 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-border relative overflow-hidden flex items-center justify-center">
                    {a?.fotoUrl ? (
                      <img src={a.fotoUrl} alt={a.nomeCompleto} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-primary/40">
                        <Users className="w-8 h-8" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {(a?.nomeCompleto ?? '?')?.[0]?.toUpperCase?.() ?? '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  <CardContent className="flex-1 p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-display font-bold text-lg tracking-tight">{a?.nomeCompleto ?? ''}</p>
                          <Badge variant={a?.ativo ? 'default' : 'secondary'} className="text-[10px] h-5">
                            {a?.ativo ? 'Ativo' : 'Arquivado'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {a?.sexo ? <span className="flex items-center gap-1">{a.sexo}</span> : null}
                          {a?.telefone ? <span className="flex items-center gap-1">{a.telefone}</span> : null}
                          {a?.bairro ? <span className="flex items-center gap-1">{a.bairro}</span> : null}
                        </div>
                        
                        {(a?.matriculas?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {a?.matriculas?.map?.((m: any) => (
                              <Link key={m?.id} href={`/cursos/${m?.curso?.id}`}>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                  <GraduationCap className="w-3 h-3" />
                                  {m?.curso?.nome ?? ''}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 self-end sm:self-center">
                        <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => openDocModal(a)} title="Anexar Documentos">
                          <FolderPlus className="w-4 h-4 text-purple-600" />
                          {(a?._count?.documentos ?? 0) > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white shadow-sm">
                              {a._count.documentos}
                            </span>
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { setSelectedAluno(a); setIsModalOpen(true); }} title="Oficinas">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Link href={`/alunos/${a?.id}`}><Button variant="ghost" size="icon" className="h-9 w-9" title="Ver Detalhes"><Eye className="w-4 h-4" /></Button></Link>
                        <Link href={`/alunos/${a?.id}/editar`}><Button variant="ghost" size="icon" className="h-9 w-9" title="Editar"><Pencil className="w-4 h-4" /></Button></Link>
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => toggleAtivo(a)} title={a?.ativo ? 'Arquivar' : 'Desarquivar'}>
                          {a?.ativo ? <UserX className="w-4 h-4 text-orange-500" /> : <UserCheck className="w-4 h-4 text-green-600" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => deleteAluno(a?.id)} title="Excluir Permanentemente">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          )) ?? null}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
        </div>
      )}

      {/* Modal de Oficinas */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Oficinas de {selectedAluno?.nomeCompleto}</DialogTitle>
            <DialogDescription className="sr-only">Gerencie as oficinas nas quais este aluno está matriculado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {cursos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">Nenhuma oficina disponível.</p>
            ) : (
              cursos.map(curso => {
                const matricula = selectedAluno?.matriculas?.find?.((m: any) => m.cursoId === curso.id && m.status === 'Ativa');
                const isEnrolled = !!matricula;
                const loading = isToggling === curso.id;
                const disabled = loading || (!isEnrolled && curso.vagas > 0 && curso.vagasOcupadas >= curso.vagas);

                return (
                  <div key={curso.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex h-5 items-center">
                      <input
                        type="checkbox"
                        checked={isEnrolled}
                        disabled={disabled}
                        onChange={() => handleToggleOficina(curso.id, matricula?.id, isEnrolled)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium leading-none ${disabled && !loading ? 'opacity-50' : ''}`}>
                          {curso.nome}
                        </p>
                        {loading && <span className="text-[10px] text-muted-foreground animate-pulse">Atualizando...</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {curso.vagas > 0 ? `${curso.vagasOcupadas}/${curso.vagas} vagas ocupadas` : 'Sem limite de vagas'}
                      </p>
                      {!isEnrolled && curso.vagas > 0 && curso.vagasOcupadas >= curso.vagas && (
                        <p className="text-[10px] text-destructive font-medium">Turma lotada</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Documentos */}
      <Dialog open={isDocModalOpen} onOpenChange={setIsDocModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Documentos de {selectedAluno?.nomeCompleto}</DialogTitle>
            <DialogDescription className="sr-only">Visualize e gerencie os documentos anexados deste aluno.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                onChange={handleUploadDoc}
                disabled={uploading}
                accept="image/*,.pdf"
              />
              <div className="flex flex-col items-center gap-2">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                ) : (
                  <FolderPlus className="w-8 h-8 text-muted-foreground" />
                )}
                <p className="text-sm font-medium">
                  {uploading ? 'Enviando documento...' : 'Clique ou arraste um arquivo para anexar'}
                </p>
                <p className="text-xs text-muted-foreground">PDFs e Imagens (PNG, JPG)</p>
              </div>
            </div>

            {/* List of Documents */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {(selectedAluno?.documentos?.length ?? 0) === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-4">Nenhum documento anexado ainda.</p>
              ) : (
                selectedAluno?.documentos?.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium truncate" title={doc.nome}>{doc.nome}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{doc.tipo.split('/')[1] || 'Doc'} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                      </a>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteDoc(doc.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
