'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-hot-toast';
import { Settings, Plus, Edit2, Trash2, Shield, Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const schema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().when('$isEdit', (isEdit, schema) => {
    return isEdit[0] 
      ? schema.notRequired() 
      : schema.required('Senha é obrigatória').min(6, 'A senha deve ter no mínimo 6 caracteres');
  }),
  confirmPassword: yup.string().when('password', (password, schema) => {
    if (password?.[0]) {
      return schema.required('Confirmação de senha é obrigatória')
        .oneOf([yup.ref('password')], 'As senhas não coincidem');
    }
    return schema.notRequired();
  })
});

export default function ConfiguracoesPage() {
  const { data: users, error, isLoading, mutate } = useSWR('/api/usuarios', fetcher);
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    context: { isEdit: !!editingUser }
  });

  const openNewUserDialog = () => {
    setEditingUser(null);
    reset({ name: '', email: '', password: '', confirmPassword: '' });
    setIsOpen(true);
  };

  const openEditUserDialog = (user: any) => {
    setEditingUser(user);
    reset({ name: user.name, email: user.email, password: '', confirmPassword: '' });
    setIsOpen(true);
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const url = editingUser ? `/api/usuarios/${editingUser.id}` : '/api/usuarios';
      const method = editingUser ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: 'admin' // Fixed role for now
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao salvar usuário');
      }

      toast.success(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
      setIsOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao excluir usuário');
      }
      toast.success('Usuário excluído!');
      mutate();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-2">
            <Settings className="w-8 h-8 text-primary" />
            Configurações
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie os usuários do sistema e outras opções</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4 bg-muted/20">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Usuários do Sistema
              </CardTitle>
              <CardDescription>Contas com acesso administrativo ao painel</CardDescription>
            </div>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNewUserDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}</DialogTitle>
                  <DialogDescription>
                    {editingUser 
                      ? 'Preencha a nova senha apenas se quiser alterar a senha atual.' 
                      : 'Adicione um novo usuário para acessar o sistema administrativo.'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" {...register('name')} placeholder="Ex: João da Silva" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email de Acesso</Label>
                    <Input id="email" type="email" {...register('email')} placeholder="Ex: joao@ong.org" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message as string}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">{editingUser ? 'Nova Senha (opcional)' : 'Senha'}</Label>
                    <Input id="password" type="password" {...register('password')} placeholder={editingUser ? 'Deixe em branco para não alterar' : 'Mínimo 6 caracteres'} />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message as string}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input id="confirmPassword" type="password" {...register('confirmPassword')} placeholder="Repita a senha" />
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message as string}</p>}
                  </div>
                  
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Salvar
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-destructive">Erro ao carregar usuários.</div>
            ) : users?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Nenhum usuário cadastrado.</div>
            ) : (
              <div className="divide-y divide-border">
                {users?.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditUserDialog(user)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteUser(user.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
