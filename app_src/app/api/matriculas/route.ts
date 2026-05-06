export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req?.url ?? '');
    const search = searchParams?.get('search') ?? '';
    const status = searchParams?.get('status') ?? '';
    const cursoId = searchParams?.get('cursoId') ?? '';
    const alunoId = searchParams?.get('alunoId') ?? '';
    const page = parseInt(searchParams?.get('page') ?? '1');
    const limit = parseInt(searchParams?.get('limit') ?? '10');

    const where: any = {};
    if (status) where.status = status;
    if (cursoId) where.cursoId = cursoId;
    if (alunoId) where.alunoId = alunoId;
    if (search) {
      where.OR = [
        { aluno: { nomeCompleto: { contains: search, mode: 'insensitive' } } },
        { curso: { nome: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [matriculas, total] = await Promise.all([
      prisma.matricula.findMany({
        where,
        include: { aluno: true, curso: { include: { tipoCurso: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.matricula.count({ where }),
    ]);

    return NextResponse.json({ data: matriculas ?? [], total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { alunoId, cursoId, observacoes } = body ?? {};
    if (!alunoId || !cursoId) {
      return NextResponse.json({ error: 'Aluno e curso são obrigatórios' }, { status: 400 });
    }

    // Check duplicate
    const existing = await prisma.matricula.findUnique({
      where: { alunoId_cursoId: { alunoId, cursoId } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Aluno já está matriculado neste curso' }, { status: 409 });
    }

    // Check vagas
    const curso = await prisma.curso.findUnique({ where: { id: cursoId } });
    if (!curso) return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 });
    if (curso.vagas > 0 && curso.vagasOcupadas >= curso.vagas) {
      return NextResponse.json({ error: 'Não há vagas disponíveis' }, { status: 400 });
    }

    // Create and increment vagas
    const [matricula] = await prisma.$transaction([
      prisma.matricula.create({
        data: { alunoId, cursoId, observacoes: observacoes ?? null },
        include: { aluno: true, curso: { include: { tipoCurso: true } } },
      }),
      prisma.curso.update({
        where: { id: cursoId },
        data: { vagasOcupadas: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(matricula, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}
