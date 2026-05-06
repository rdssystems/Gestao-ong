export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req?.url ?? '');
    const search = searchParams?.get('search') ?? '';
    const status = searchParams?.get('status') ?? 'ativo';
    const page = parseInt(searchParams?.get('page') ?? '1');
    const limit = parseInt(searchParams?.get('limit') ?? '10');
    const tipoCursoId = searchParams?.get('tipoCursoId') ?? '';
    const all = searchParams?.get('all') === 'true';

    const where: any = {};
    if (status === 'ativo') where.ativo = true;
    else if (status === 'inativo') where.ativo = false;

    if (search) {
      where.OR = [
        { nomeCompleto: { contains: search, mode: 'insensitive' } },
        { numeroDocumento: { contains: search } },
        { nomeMae: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tipoCursoId) {
      where.interesses = { some: { tipoCursoId } };
    }

    if (all) {
      const alunos = await prisma.aluno.findMany({
        where: { ativo: true },
        orderBy: { nomeCompleto: 'asc' },
        select: { id: true, nomeCompleto: true, cpf: true, email: true },
      });
      return NextResponse.json(alunos ?? []);
    }

    const [alunos, total] = await Promise.all([
      prisma.aluno.findMany({
        where,
        include: {
          interesses: { include: { tipoCurso: true } },
          matriculas: {
            where: { status: 'Ativa' },
            include: { curso: { select: { id: true, nome: true } } },
          },
          _count: { select: { matriculas: true, documentos: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.aluno.count({ where }),
    ]);

    return NextResponse.json({ data: alunos ?? [], total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { interesses, ...data } = body ?? {};
    if (!data?.nomeCompleto) return NextResponse.json({ error: 'Nome completo é obrigatório' }, { status: 400 });

    if (data?.dataNascimento) {
      data.dataNascimento = new Date(data.dataNascimento);
    }

    const aluno = await prisma.aluno.create({
      data: {
        ...data,
        interesses: (interesses?.length ?? 0) > 0
          ? { create: (interesses as string[]).map((tipoCursoId: string) => ({ tipoCursoId })) }
          : undefined,
      },
      include: { interesses: { include: { tipoCurso: true } } },
    });
    return NextResponse.json(aluno, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'CPF já cadastrado' }, { status: 409 });
    }
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}
