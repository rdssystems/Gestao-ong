export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { status, observacoes } = body ?? {};

    const current = await prisma.matricula.findUnique({ where: { id: params?.id } });
    if (!current) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    const data: any = {};
    if (observacoes !== undefined) data.observacoes = observacoes;

    // Handle vagas when cancelling/reactivating
    if (status && status !== current?.status) {
      data.status = status;
      if (status === 'Cancelada' && current?.status === 'Ativa') {
        await prisma.curso.update({
          where: { id: current.cursoId },
          data: { vagasOcupadas: { decrement: 1 } },
        });
      } else if (status === 'Ativa' && current?.status === 'Cancelada') {
        const curso = await prisma.curso.findUnique({ where: { id: current.cursoId } });
        if (curso && curso.vagas > 0 && curso.vagasOcupadas >= curso.vagas) {
          return NextResponse.json({ error: 'Não há vagas disponíveis' }, { status: 400 });
        }
        await prisma.curso.update({
          where: { id: current.cursoId },
          data: { vagasOcupadas: { increment: 1 } },
        });
      }
    }

    const matricula = await prisma.matricula.update({
      where: { id: params?.id },
      data,
      include: { aluno: true, curso: { include: { tipoCurso: true } } },
    });
    return NextResponse.json(matricula);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const current = await prisma.matricula.findUnique({ where: { id: params?.id } });
    if (!current) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    // Handle vagas if deleting an active enrollment
    if (current?.status === 'Ativa') {
      await prisma.curso.update({
        where: { id: current.cursoId },
        data: { vagasOcupadas: { decrement: 1 } },
      });
    }

    await prisma.matricula.delete({ where: { id: params?.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao excluir' }, { status: 500 });
  }
}
