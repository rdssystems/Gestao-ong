export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req?.url ?? '');
    const search = searchParams?.get('search') ?? '';
    const status = searchParams?.get('status') ?? '';
    const tipoCursoId = searchParams?.get('tipoCursoId') ?? '';
    const page = parseInt(searchParams?.get('page') ?? '1');
    const limit = parseInt(searchParams?.get('limit') ?? '10');
    const all = searchParams?.get('all') === 'true';

    const ativo = searchParams?.get('ativo');
    const where: any = ativo === 'false' ? { ativo: false } : { ativo: true };
    if (search) {
      where.nome = { contains: search, mode: 'insensitive' };
    }
    if (status) {
      where.status = status;
    }
    if (tipoCursoId) {
      where.tipoCursoId = tipoCursoId;
    }

    if (all) {
      const cursos = await prisma.curso.findMany({
        where,
        include: { tipoCurso: true },
        orderBy: { nome: 'asc' },
      });
      return NextResponse.json(cursos ?? []);
    }

    const [cursos, total] = await Promise.all([
      prisma.curso.findMany({
        where,
        include: { tipoCurso: true, _count: { select: { matriculas: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.curso.count({ where }),
    ]);

    return NextResponse.json({ data: cursos ?? [], total, page, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, tipoCursoId, cargaHoraria, vagas, dataInicio, dataFim, turno, diasSemana, horarioInicio, horarioFim, professor, status, temMensalidade, valorMensalidade } = body ?? {};
    if (!nome || !tipoCursoId) return NextResponse.json({ error: 'Nome e tipo de curso são obrigatórios' }, { status: 400 });

    const curso = await prisma.curso.create({
      data: {
        nome,
        tipoCurso: {
          connect: { id: tipoCursoId }
        },
        cargaHoraria: parseInt(String(cargaHoraria ?? 0)),
        vagas: parseInt(String(vagas ?? 0)),
        dataInicio: dataInicio ? new Date(dataInicio) : null,
        dataFim: dataFim ? new Date(dataFim) : null,
        turno: turno ?? null,
        diasSemana: diasSemana ?? null,
        horarioInicio: horarioInicio ?? null,
        horarioFim: horarioFim ?? null,
        professor: professor ?? null,
        status: status ?? 'Inscrições Abertas',
        temMensalidade: Boolean(temMensalidade),
        valorMensalidade: valorMensalidade ? parseFloat(String(valorMensalidade)) : null,
      },
      include: { tipoCurso: true },
    });
    return NextResponse.json(curso, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}
