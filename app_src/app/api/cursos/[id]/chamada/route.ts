export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/cursos/[id]/chamada - Listar histórico de chamadas ou chamadas de um dia específico
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('data');
    const full = searchParams.get('full') === 'true';

    if (full) {
      const allPresencas = await prisma.presenca.findMany({
        where: { cursoId: params.id },
        include: { aluno: true },
        orderBy: [{ data: 'asc' }, { aluno: { nomeCompleto: 'asc' } }],
      });
      return NextResponse.json(allPresencas);
    }

    if (dateStr) {
      // Filtrar por uma data específica (ignorando o horário)
      const date = new Date(dateStr);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const presencas = await prisma.presenca.findMany({
        where: {
          cursoId: params.id,
          data: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: { aluno: true },
        orderBy: { aluno: { nomeCompleto: 'asc' } },
      });
      return NextResponse.json(presencas);
    }

    // Retornar todas as datas que tiveram chamada
    const datasChamada = await prisma.presenca.findMany({
      where: { cursoId: params.id },
      select: { data: true },
      distinct: ['data'],
      orderBy: { data: 'desc' },
    });

    // Agrupar por data (apenas o dia)
    const uniqueDates = Array.from(new Set(datasChamada.map(p => p.data.toISOString().split('T')[0])));
    
    return NextResponse.json(uniqueDates);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao buscar chamadas' }, { status: 500 });
  }
}

// POST /api/cursos/[id]/chamada - Salvar uma nova chamada
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { data, chamadas } = body; // chamadas: Array<{ alunoId: string, status: string }>

    if (!data || !chamadas || !Array.isArray(chamadas)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const attendanceDate = new Date(data);
    const startOfDay = new Date(new Date(data).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(data).setHours(23, 59, 59, 999));

    // Usar transação para deletar chamadas antigas do mesmo dia (se houver) e salvar as novas
    await prisma.$transaction(async (tx) => {
      // Deletar registros existentes para este curso nesta data
      await tx.presenca.deleteMany({
        where: {
          cursoId: params.id,
          data: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      // Criar novos registros
      await tx.presenca.createMany({
        data: chamadas.map((c: any) => ({
          cursoId: params.id,
          alunoId: c.alunoId,
          status: c.status,
          data: attendanceDate,
        })),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('ERRO NA CHAMADA:', error);
    return NextResponse.json({ 
      error: error?.message ?? 'Erro ao salvar chamada',
      details: error?.code // Útil para erros do Prisma
    }, { status: 500 });
  }
}
