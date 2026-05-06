'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { AlunoForm } from '@/components/aluno-form';
import { PageHeader } from '@/components/page-header';

export default function EditarAlunoPage() {
  const params = useParams();
  const [aluno, setAluno] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/alunos/${params.id}`)
      .then((r: any) => r?.json?.())
      .then((d: any) => setAluno(d ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) return <div className="h-32 bg-muted animate-pulse rounded-xl" />;
  if (!aluno) return <div className="text-center py-16 text-muted-foreground">Aluno não encontrado</div>;

  return (
    <div className="space-y-6">
      <PageHeader icon={Pencil} title="Editar Aluno" subtitle={`Editando dados de ${aluno?.nomeCompleto ?? ''}`} />
      <AlunoForm initialData={aluno} isEdit />
    </div>
  );
}
