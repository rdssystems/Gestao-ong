import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  try {
    const filePath = join(process.cwd(), 'public', 'uploads', ...params.path);

    if (!existsSync(filePath)) {
      return new NextResponse('Arquivo não encontrado', { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    
    // Tenta descobrir o content-type pela extensão
    const ext = params.path[params.path.length - 1].split('.').pop()?.toLowerCase();
    const contentType = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf'
    }[ext || ''] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('Erro ao carregar arquivo', { status: 500 });
  }
}
