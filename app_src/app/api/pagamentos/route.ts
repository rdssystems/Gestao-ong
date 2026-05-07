export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req?.url ?? '');
    const cursoId = searchParams?.get('cursoId');
    const matriculaId = searchParams?.get('matriculaId');
    const alunoId = searchParams?.get('alunoId');
    const mes = searchParams?.get('mes');
    const ano = searchParams?.get('ano');

    const where: any = {};
    if (cursoId) where.cursoId = cursoId;
    if (matriculaId) where.matriculaId = matriculaId;
    if (alunoId) where.alunoId = alunoId;
    if (mes) where.mesReferencia = parseInt(mes);
    if (ano) where.anoReferencia = parseInt(ano);

    const pagamentos = await prisma.pagamentoMensalidade.findMany({
      where,
      include: {
        aluno: { select: { nomeCompleto: true, fotoUrl: true } },
        curso: { select: { nome: true } },
      },
      orderBy: [{ anoReferencia: 'desc' }, { mesReferencia: 'desc' }, { dataPagamento: 'desc' }],
    });

    return NextResponse.json(pagamentos);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao listar pagamentos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { matriculaId, cursoId, alunoId, mesReferencia, anoReferencia, valorPago, formaPagamento } = body ?? {};

    if (!matriculaId || !cursoId || !alunoId || !mesReferencia || !anoReferencia || valorPago === undefined) {
      return NextResponse.json({ error: 'Dados incompletos para registrar pagamento' }, { status: 400 });
    }

    // Permite múltiplos pagamentos para o mesmo mês/ano

    const pagamento = await prisma.pagamentoMensalidade.create({
      data: {
        matriculaId,
        cursoId,
        alunoId,
        mesReferencia: parseInt(String(mesReferencia)),
        anoReferencia: parseInt(String(anoReferencia)),
        valorPago: parseFloat(String(valorPago)),
        formaPagamento: formaPagamento ?? null,
        status: 'Pago',
      },
    });

    return NextResponse.json(pagamento, { status: 201 });
  } catch (error: any) {
    console.error('Erro no pagamento:', error);
    return NextResponse.json({ error: error?.message ?? 'Erro ao registrar pagamento' }, { status: 500 });
  }
}
