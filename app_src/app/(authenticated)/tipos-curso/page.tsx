'use client';

import { useEffect, useState, useCallback } from 'react';
import { Tags, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface TipoCurso {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string;
  ativo: boolean;
}

export default function TiposCursoPage() {
  const [tipos, setTipos] = useState<TipoCurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TipoCurso | null>(null);
  const [form, setForm] = useState({ nome: '', descricao: '', cor: '#14b8a6' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, page: String(page), limit: '10' });
      const res = await fetch(`/api/tipos-curso?${params}`);
      const data = await res?.json?.();
      setTipos(data?.data ?? []);
      setTotalPages(data?.totalPages ?? 1);
    } catch { } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!form?.nome?.trim?.()) { toast.error('Nome é obrigatório'); return; }
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/tipos-curso/${editing.id}` : '/api/tipos-curso';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res?.json?.();
      if (!res?.ok) { toast.error(data?.error ?? 'Erro'); return; }
      toast.success(editing ? 'Tipo atualizado!' : 'Tipo criado!');
      setDialogOpen(false);
      setEditing(null);
      setForm({ nome: '', descricao: '', cor: '#14b8a6' });
      fetchData();
    } catch { toast.error('Erro ao salvar'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Desativar este tipo de oficina?')) return;
    try {
      await fetch(`/api/tipos-curso/${id}`, { method: 'DELETE' });
      toast.success('Tipo desativado!');
      fetchData();
    } catch { toast.error('Erro'); }
  };

  const openEdit = (t: TipoCurso) => {
    setEditing(t);
    setForm({ nome: t?.nome ?? '', descricao: t?.descricao ?? '', cor: t?.cor ?? '#14b8a6' });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ nome: '', descricao: '', cor: '#14b8a6' });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader icon={Tags} title="Tipos de Oficina" subtitle="Categorias para organizar as oficinas">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Novo Tipo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Tipo' : 'Novo Tipo de Oficina'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form?.nome ?? ''} onChange={(e: any) => setForm({ ...form, nome: e?.target?.value ?? '' })} placeholder="Ex: Informática" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={form?.descricao ?? ''} onChange={(e: any) => setForm({ ...form, descricao: e?.target?.value ?? '' })} placeholder="Descrição opcional" />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form?.cor ?? '#14b8a6'} onChange={(e: any) => setForm({ ...form, cor: e?.target?.value ?? '#14b8a6' })} className="w-10 h-10 rounded cursor-pointer" />
                  <span className="text-sm text-muted-foreground">{form?.cor}</span>
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? 'Salvar Alterações' : 'Criar Tipo'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tipos..."
          value={search}
          onChange={(e: any) => { setSearch(e?.target?.value ?? ''); setPage(1); }}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i: number) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : (tipos?.length ?? 0) === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum tipo de oficina encontrado</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tipos?.map?.((t: TipoCurso, i: number) => (
            <motion.div key={t?.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t?.cor ?? '#14b8a6' }} />
                      <div>
                        <p className="font-medium">{t?.nome ?? ''}</p>
                        {t?.descricao ? <p className="text-xs text-muted-foreground">{t.descricao}</p> : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!t?.ativo && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="w-4 h-4" /></Button>
                      {t?.ativo && <Button variant="ghost" size="icon" onClick={() => handleDelete(t?.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )) ?? null}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
          <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
        </div>
      )}
    </div>
  );
}
