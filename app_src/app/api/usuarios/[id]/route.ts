import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const id = params.id;
    const body = await req.json();
    const { email, password, name, role } = body ?? {};
    
    if (!email || !name) {
      return NextResponse.json({ error: 'Email e nome são obrigatórios' }, { status: 400 });
    }
    
    // Check if email is used by another user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: 'Email já está em uso por outro usuário' }, { status: 409 });
    }

    const updateData: any = { email, name, role };
    
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true }
    });
    
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const id = params.id;
    
    // Prevent deleting oneself if we can identify it, though not strictly required
    if (session?.user?.email) {
      const userToDelete = await prisma.user.findUnique({ where: { id }});
      if (userToDelete?.email === session.user.email) {
        return NextResponse.json({ error: 'Não é possível excluir o próprio usuário' }, { status: 400 });
      }
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro interno' }, { status: 500 });
  }
}
