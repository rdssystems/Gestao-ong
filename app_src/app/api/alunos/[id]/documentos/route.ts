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

    let finalBuffer = buffer;
    let finalFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    let finalMimetype = file.type;

    // If it's an image, compress and convert to WebP
    if (file.type.startsWith('image/')) {
      finalBuffer = await sharp(buffer)
        .rotate() // Auto-rotate based on EXIF
        .webp({ quality: 80 })
        .toBuffer();
      
      const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9.-]/g, '_');
      finalFilename = `${Date.now()}-${baseName}.webp`;
      finalMimetype = 'image/webp';
    }

    const filePath = join(uploadDir, finalFilename);
    const fileUrl = `/api/servir-arquivo/alunos/${params.id}/${finalFilename}`;

    await writeFile(filePath, finalBuffer);
    const { chmod } = await import('fs/promises');
    await chmod(filePath, 0o644);

    const documento = await prisma.documento.create({
      data: {
        nome: file.name.endsWith('.webp') ? file.name : (file.type.startsWith('image/') ? `${file.name.split('.')[0]}.webp` : file.name),
        url: fileUrl,
        tipo: finalMimetype,
        alunoId: params.id,
      }
    });

    return NextResponse.json(documento, { status: 201 });
  } catch (error: any) {
    console.error('Erro no upload de documento:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
