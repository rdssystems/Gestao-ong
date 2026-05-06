'use client';

import { BookOpen } from 'lucide-react';
import { CursoForm } from '@/components/curso-form';
import { PageHeader } from '@/components/page-header';

export default function NovoCursoPage() {
  return (
    <div className="space-y-6">
      <PageHeader icon={BookOpen} title="Nova Oficina" subtitle="Cadastre uma nova oficina" />
      <CursoForm />
    </div>
  );
}
