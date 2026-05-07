'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, ArrowLeft, Pencil, Phone, MapPin, Calendar, FileText, Users, FolderPlus, Download, Camera, Loader2, Eye, User, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AlunoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [aluno, setAluno] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/alunos/${params.id}`)
      .then((r: any) => r?.json?.())
      .then((d: any) => setAluno(d ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) return <div className="space-y-4">{[1,2,3].map((i: number) => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}</div>;
  if (!aluno) return <div className="text-center py-16 text-muted-foreground">Aluno não encontrado</div>;

  const infoItem = (label: string, value: string | null | undefined) => value ? (
    <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value}</p></div>
  ) : null;

  const handleUploadDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!aluno || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setUploadingDoc(true);
    try {
      const res = await fetch(`/api/alunos/${aluno.id}/documentos`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        toast.success('Documento anexado com sucesso!');
        const updatedRes = await fetch(`/api/alunos/${aluno.id}`);
        const updatedAluno = await updatedRes.json();
        setAluno(updatedAluno);
      } else {
        toast.error('Erro ao anexar documento');
      }
    } catch {
      toast.error('Erro de comunicação com o servidor');
    } finally {
      setUploadingDoc(false);
      e.target.value = '';
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!window.confirm('Excluir este documento permanentemente?')) return;
    try {
      const res = await fetch(`/api/documentos/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Documento excluído!');
        const updatedRes = await fetch(`/api/alunos/${aluno.id}`);
        const updatedAluno = await updatedRes.json();
        setAluno(updatedAluno);
      } else {
        toast.error('Erro ao excluir documento');
      }
    } catch { toast.error('Erro no servidor'); }
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!aluno || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setUploadingFoto(true);
    try {
      const res = await fetch(`/api/alunos/${aluno.id}/foto`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setAluno({ ...aluno, fotoUrl: data.fotoUrl });
      } else {
        alert('Erro ao anexar foto');
      }
    } catch {
      alert('Erro de comunicação com o servidor');
    } finally {
      setUploadingFoto(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 text-primary font-bold text-2xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
            {aluno?.fotoUrl ? (
              <img src={aluno.fotoUrl} alt={aluno.nomeCompleto} className="w-full h-full object-cover" />
            ) : (
              (aluno?.nomeCompleto ?? '?')?.[0]?.toUpperCase?.() ?? '?'
            )}
            
            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center text-white" title="Alterar Foto (Câmera ou Arquivo)">
              {uploadingFoto ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
              <input type="file" className="hidden" accept="image/*" capture="environment" disabled={uploadingFoto} onChange={handleFotoUpload} />
            </label>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight">{aluno?.nomeCompleto ?? ''}</h1>
              <Badge variant={aluno?.ativo ? 'default' : 'secondary'}>{aluno?.ativo ? 'Ativo' : 'Inativo'}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Cadastrado em {aluno?.createdAt ? format(new Date(aluno.createdAt), "dd/MM/yyyy", { locale: ptBR }) : '-'}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
          <Link href={`/alunos/${aluno?.id}/editar`}><Button><Pencil className="w-4 h-4 mr-2" /> Editar</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Dados do Participante */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Dados do Participante</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {infoItem('Nome Completo', aluno?.nomeCompleto)}
              {infoItem('Data de Nascimento', aluno?.dataNascimento ? format(new Date(aluno.dataNascimento), 'dd/MM/yyyy') : null)}
              {infoItem('Sexo', aluno?.sexo)}
            </CardContent>
          </Card>
        </motion.div>

        {/* 2. Documentação */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Documentação</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {infoItem('Tipo de Documento', aluno?.tipoDocumento)}
              {infoItem('Número do Documento', aluno?.numeroDocumento)}
              {aluno?.tipoDocumento === 'Certidão de Nascimento' && infoItem('Número da Certidão', aluno?.numeroCertidao)}
            </CardContent>
          </Card>
        </motion.div>

        {/* 3. Dados do Responsável */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Dados do Responsável</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {infoItem('Nome do Responsável', aluno?.nomeMae)}
              {infoItem('Telefone', aluno?.telefone)}
              {infoItem('Outro Telefone', aluno?.whatsapp)}
            </CardContent>
          </Card>
        </motion.div>

        {/* 4. Endereço */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> Endereço Completo</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {infoItem('Rua / Avenida', aluno?.endereco)}
              {infoItem('Número', aluno?.numero)}
              {infoItem('Complemento', aluno?.complemento)}
              {infoItem('Bairro', aluno?.bairro)}
              {infoItem('Cidade', aluno?.cidade)}
              {infoItem('CEP', aluno?.cep)}
            </CardContent>
          </Card>
        </motion.div>

        {/* Interesses em Oficinas */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> Interesses em Oficinas</CardTitle></CardHeader>
            <CardContent>
              {(aluno?.interesses?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum interesse registrado</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {aluno?.interesses?.map?.((int: any) => (
                    <span key={int?.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: (int?.tipoCurso?.cor ?? '#14b8a6') + '20', color: int?.tipoCurso?.cor ?? '#14b8a6' }}>
                      {int?.tipoCurso?.nome ?? ''}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {(aluno?.matriculas?.length ?? 0) > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Matrículas</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aluno?.matriculas?.map?.((m: any) => (
                <div key={m?.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{m?.curso?.nome ?? ''}</p>
                    <p className="text-xs text-muted-foreground">{m?.curso?.tipoCurso?.nome ?? ''}</p>
                  </div>
                  <Badge variant={m?.status === 'Ativa' ? 'default' : 'secondary'}>{m?.status ?? ''}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. Histórico de Mensalidades */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" /> Histórico de Mensalidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(aluno?.pagamentos?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 font-semibold">Oficina</th>
                      <th className="pb-2 font-semibold">Referência</th>
                      <th className="pb-2 font-semibold">Valor</th>
                      <th className="pb-2 font-semibold">Data Pagto</th>
                      <th className="pb-2 font-semibold">Forma</th>
                      <th className="pb-2 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aluno?.pagamentos?.map?.((p: any) => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 pr-2">
                          <p className="font-medium">{p?.curso?.nome ?? 'Oficina'}</p>
                        </td>
                        <td className="py-3 px-2">
                          {format(new Date(p.anoReferencia, p.mesReferencia - 1), 'MMMM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="py-3 px-2 font-medium">
                          R$ {p.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {format(new Date(p.dataPagamento), 'dd/MM/yyyy')}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {p.formaPagamento || '-'}
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* 7. Documentos Anexados */}
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2"><FolderPlus className="w-5 h-5" /> Documentos Anexados</CardTitle>
            <div className="relative">
              <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleUploadDoc} disabled={uploadingDoc} accept="image/*,.pdf" />
              <Button size="sm" variant="outline" disabled={uploadingDoc}>
                {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Anexar Novo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(aluno?.documentos?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum documento anexado.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {aluno?.documentos?.map?.((doc: any) => (
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
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-blue-600" 
                        onClick={() => {
                          if (doc.tipo.includes('pdf')) {
                            window.open(doc.url, '_blank');
                          } else {
                            setPreviewDoc(doc);
                          }
                        }}
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <a href={doc.url} download={doc.nome} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                      </a>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteDoc(doc.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-1 overflow-hidden bg-transparent border-none">
          <DialogTitle className="sr-only">Visualização de Documento</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={previewDoc?.url} 
              alt={previewDoc?.nome} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium">
              {previewDoc?.nome}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
