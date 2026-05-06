'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { CursoForm } from '@/components/curso-form';
import { PageHeader } from '@/components/page-header';

export default function EditarCursoPage() {
  const params = useParams();
  const [curso, setCurso] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/cursos/${params.id}`)
      .then((r: any) => r?.json?.())
      .then((d: any) => setCurso(d ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) return <div className="h-32 bg-muted animate-pulse rounded-xl" />;
  if (!curso) return <div className="text-center py-16 text-muted-foreground">Oficina não encontrada</div>;

  return (
    <div className="space-y-6">
      <PageHeader icon={Pencil} title="Editar Oficina" subtitle={`Editando ${curso?.nome ?? ''}`} />
      <CursoForm initialData={curso} isEdit />
    </div>
  );
}
