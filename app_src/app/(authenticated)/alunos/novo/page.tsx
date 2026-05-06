'use client';

import { UserPlus } from 'lucide-react';
import { AlunoForm } from '@/components/aluno-form';
import { PageHeader } from '@/components/page-header';

export default function NovoAlunoPage() {
  return (
    <div className="space-y-6">
      <PageHeader icon={UserPlus} title="Novo Aluno" subtitle="Preencha os dados para cadastrar um novo aluno" />
      <AlunoForm />
    </div>
  );
}
