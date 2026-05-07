export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'alunos', params.id);
    await mkdir(uploadDir, { recursive: true });

    // Process image with sharp
    // Resize to max 800px width and convert to WebP
    const processedBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Generate unique filename with .webp extension
    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `foto-${Date.now()}-${baseName}.webp`;
    const filePath = join(uploadDir, uniqueFilename);
    const fileUrl = `/api/servir-arquivo/alunos/${params.id}/${uniqueFilename}`;

    await writeFile(filePath, processedBuffer);
    const { chmod } = await import('fs/promises');
    await chmod(filePath, 0o644);

    const aluno = await prisma.aluno.update({
      where: { id: params.id },
      data: { fotoUrl: fileUrl }
    });

    return NextResponse.json({ success: true, fotoUrl: fileUrl }, { status: 200 });
  } catch (error: any) {
    console.error('Erro no upload de foto:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
