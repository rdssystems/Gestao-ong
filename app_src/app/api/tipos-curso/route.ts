export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req?.url ?? '');
    const search = searchParams?.get('search') ?? '';
    const page = parseInt(searchParams?.get('page') ?? '1');
    const limit = parseInt(searchParams?.get('limit') ?? '50');
    const all = searchParams?.get('all') === 'true';

    const where: any = {};
    if (search) {
      where.nome = { contains: search, mode: 'insensitive' };
    }

    if (all) {
      const tipos = await prisma.tipoCurso.findMany({ orderBy: { nome: 'asc' } });
      return NextResponse.json(tipos ?? []);
    }

    const [tipos, total] = await Promise.all([
      prisma.tipoCurso.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tipoCurso.count({ where }),
    ]);

    return NextResponse.json({ data: tipos ?? [], total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, descricao, cor } = body ?? {};
    if (!nome) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });

    const tipo = await prisma.tipoCurso.create({
      data: { nome, descricao: descricao ?? null, cor: cor ?? '#14b8a6' },
    });
    return NextResponse.json(tipo, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Tipo de curso já existe' }, { status: 409 });
    }
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}
