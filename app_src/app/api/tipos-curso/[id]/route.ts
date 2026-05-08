export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const tipo = await prisma.tipoCurso.findUnique({ where: { id: params?.id } });
    if (!tipo) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    return NextResponse.json(tipo);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { nome, descricao, cor, ativo } = body ?? {};
    const tipo = await prisma.tipoCurso.update({
      where: { id: params?.id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(cor !== undefined && { cor }),
        ...(ativo !== undefined && { ativo }),
      },
    });
    return NextResponse.json(tipo);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Nome já existe' }, { status: 409 });
    }
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    // Check if there are linked courses or interests before deleting
    const linkedCursos = await prisma.curso.count({ where: { tipoCursoId: params?.id } });
    if (linkedCursos > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir: existem ${linkedCursos} oficinas vinculadas a este tipo.` },
        { status: 400 }
      );
    }

    await prisma.tipoCurso.delete({ where: { id: params?.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === 'P2003') {
      return NextResponse.json({ error: 'Não é possível excluir: este registro possui dependências vinculadas.' }, { status: 400 });
    }
    return NextResponse.json({ error: error?.message ?? 'Erro ao excluir' }, { status: 500 });
  }
}

