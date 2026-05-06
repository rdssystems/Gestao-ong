export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

    // Generate unique filename
    const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadDir, uniqueFilename);
    const fileUrl = `/uploads/alunos/${params.id}/${uniqueFilename}`;

    await writeFile(filePath, buffer);

    const documento = await prisma.documento.create({
      data: {
        nome: file.name,
        url: fileUrl,
        tipo: file.type,
        alunoId: params.id,
      }
    });

    return NextResponse.json(documento, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
