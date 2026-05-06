export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const documento = await prisma.documento.findUnique({ where: { id: params?.id } });
    if (!documento) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    // Delete file from filesystem
    try {
      const filePath = join(process.cwd(), 'public', documento.url);
      await unlink(filePath);
    } catch (e) {
      // Ignore if file doesn't exist on disk
    }

    await prisma.documento.delete({ where: { id: params?.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Erro ao excluir' }, { status: 500 });
  }
}
