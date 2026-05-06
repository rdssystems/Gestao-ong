export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const cursoId = params?.id;
    if (!cursoId) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    // Get the course with its type
    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        tipoCurso: true,
        matriculas: {
          include: {
            aluno: {
              select: {
                id: true,
                nomeCompleto: true,
                cpf: true,
                email: true,
                telefone: true,
                whatsapp: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!curso) return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 });

    // Get already enrolled student IDs
    const matriculadosIds = (curso.matriculas ?? []).map((m: any) => m?.alunoId).filter(Boolean);

    // Find students interested in this course type who are NOT already enrolled
    const interessados = await prisma.aluno.findMany({
      where: {
        ativo: true,
        interesses: {
          some: { tipoCursoId: curso.tipoCursoId },
        },
        id: {
          notIn: matriculadosIds.length > 0 ? matriculadosIds : ['__none__'],
        },
      },
      select: {
        id: true,
        nomeCompleto: true,
        cpf: true,
        email: true,
        telefone: true,
        whatsapp: true,
      },
      orderBy: { nomeCompleto: 'asc' },
    });

    return NextResponse.json({
      curso: {
        id: curso.id,
        nome: curso.nome,
        tipoCurso: curso.tipoCurso,
        vagas: curso.vagas,
        vagasOcupadas: curso.vagasOcupadas,
        status: curso.status,
        turno: curso.turno,
        diasSemana: curso.diasSemana,
        professor: curso.professor,
        dataInicio: curso.dataInicio,
        dataFim: curso.dataFim,
        cargaHoraria: curso.cargaHoraria,
      },
      matriculados: curso.matriculas ?? [],
      interessados: interessados ?? [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}
