export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const curso = await prisma.curso.findUnique({
      where: { id: params?.id },
      include: {
        tipoCurso: true,
        matriculas: { include: { aluno: true } },
        pagamentos: true,
      },
    });
    if (!curso) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    return NextResponse.json(curso);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    if (params?.id === 'undefined') {
      return NextResponse.json({ error: 'ID da oficina inválido' }, { status: 400 });
    }

    const body = await req.json();
    const { nome, tipoCursoId, cargaHoraria, vagas, dataInicio, dataFim, turno, diasSemana, horarioInicio, horarioFim, professor, status, ativo, temMensalidade, valorMensalidade } = body ?? {};

    const data: any = {};
    if (nome !== undefined) data.nome = nome;
    if (tipoCursoId !== undefined) {
      data.tipoCurso = {
        connect: { id: tipoCursoId }
      };
    }
    if (cargaHoraria !== undefined) data.cargaHoraria = parseInt(String(cargaHoraria ?? 0));
    if (vagas !== undefined) data.vagas = parseInt(String(vagas ?? 0));
    if (dataInicio !== undefined) data.dataInicio = dataInicio ? new Date(dataInicio) : null;
    if (dataFim !== undefined) data.dataFim = dataFim ? new Date(dataFim) : null;
    if (turno !== undefined) data.turno = turno;
    if (diasSemana !== undefined) data.diasSemana = diasSemana;
    if (horarioInicio !== undefined) data.horarioInicio = horarioInicio;
    if (horarioFim !== undefined) data.horarioFim = horarioFim;
    if (professor !== undefined) data.professor = professor;
    if (status !== undefined) data.status = status;
    if (ativo !== undefined) data.ativo = ativo;
    if (temMensalidade !== undefined) data.temMensalidade = Boolean(temMensalidade);
    if (valorMensalidade !== undefined) data.valorMensalidade = valorMensalidade ? parseFloat(String(valorMensalidade)) : null;

    const curso = await prisma.curso.update({
      where: { id: params?.id },
      data,
      include: { tipoCurso: true },
    });
    return NextResponse.json(curso);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    // Check for active enrollments
    const activeMatriculas = await prisma.matricula.count({
      where: { cursoId: params?.id, status: 'Ativa' },
    });
    if (activeMatriculas > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir: existem ${activeMatriculas} matrícula(s) ativa(s) nesta oficina.` },
        { status: 400 }
      );
    }

    // Delete related records first, then the curso
    await prisma.$transaction([
      prisma.matricula.deleteMany({ where: { cursoId: params?.id } }),
      prisma.curso.delete({ where: { id: params?.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao excluir' }, { status: 500 });
  }
}
