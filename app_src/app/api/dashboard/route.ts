export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [totalAlunos, totalCursos, totalMatriculas, recentAlunos, topCursos] = await Promise.all([
      prisma.aluno.count({ where: { ativo: true } }),
      prisma.curso.count({ where: { ativo: true } }),
      prisma.matricula.count({ where: { status: 'Ativa' } }),
      prisma.aluno.findMany({
        where: { ativo: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, nomeCompleto: true, email: true, createdAt: true },
      }),
      prisma.curso.findMany({
        where: { ativo: true },
        include: { tipoCurso: true, _count: { select: { matriculas: { where: { status: 'Ativa' } } } } },
        orderBy: { vagasOcupadas: 'desc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      totalAlunos,
      totalCursos,
      totalMatriculas,
      recentAlunos: recentAlunos ?? [],
      topCursos: topCursos ?? [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}
