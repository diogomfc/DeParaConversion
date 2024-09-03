import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Busca todos os registros do modelo DePara
    const files = await prisma.dePara.findMany({
      select: {
        id: true,
        fileName: true,
        status: true,
        createdAt: true,  
      },
      // orderBy: {
      //   createdAt: 'desc',  
      // },
    });

    // Retorna a lista de arquivos
    return NextResponse.json(files);
  } catch (error) {
    console.error('Erro ao buscar os arquivos:', error);
    return NextResponse.json({ error: 'Erro ao buscar os arquivos' }, { status: 500 });
  }
}
