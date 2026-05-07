export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: params?.id },
      include: {
        interesses: { include: { tipoCurso: true } },
        matriculas: { include: { curso: { include: { tipoCurso: true } } } },
        documentos: true,
        pagamentos: {
          include: { curso: true },
          orderBy: { dataPagamento: 'desc' }
        },
      },
    });
    if (!aluno) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    return NextResponse.json(aluno);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { interesses, ...data } = body ?? {};

    if (data?.dataNascimento) {
      data.dataNascimento = new Date(data.dataNascimento);
    }

    // Update interesses if provided
    if (interesses !== undefined) {
      await prisma.alunoInteresse.deleteMany({ where: { alunoId: params?.id } });
      if ((interesses?.length ?? 0) > 0) {
        await prisma.alunoInteresse.createMany({
          data: (interesses as string[]).map((tipoCursoId: string) => ({
            alunoId: params?.id,
            tipoCursoId,
          })),
        });
      }
    }

    const aluno = await prisma.aluno.update({
      where: { id: params?.id },
      data,
      include: { interesses: { include: { tipoCurso: true } } },
    });
    return NextResponse.json(aluno);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'CPF já cadastrado' }, { status: 409 });
    }
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const aluno = await prisma.aluno.findUnique({
      where: { id: params?.id },
      include: { matriculas: true },
    });
    if (!aluno) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    // Decrement vagas for active enrollments
    for (const m of aluno.matriculas) {
      if (m.status === 'Ativa') {
        await prisma.curso.update({
          where: { id: m.cursoId },
          data: { vagasOcupadas: { decrement: 1 } },
        });
      }
    }

    // Delete related records
    await prisma.$transaction([
      prisma.alunoInteresse.deleteMany({ where: { alunoId: params?.id } }),
      prisma.presenca.deleteMany({ where: { alunoId: params?.id } }),
      prisma.matricula.deleteMany({ where: { alunoId: params?.id } }),
      prisma.aluno.delete({ where: { id: params?.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao excluir' }, { status: 500 });
  }
}
