import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: { ids: string[] } }) {
  const { ids } = params;

  try {
    // Verifica se os IDs foram fornecidos
    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: 'IDs não fornecidos ou inválidos.' }, { status: 400 });
    }

    // Converte IDs para números
    const idsNumber = ids.map(id => Number(id));

    // Remove registros do banco de dados
    await prisma.dePara.deleteMany({
      where: {
        id: { in: idsNumber },
      },
    });

    return NextResponse.json({ message: 'Arquivos excluídos com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir arquivos:', error);
    return NextResponse.json({ error: 'Erro ao excluir arquivos' }, { status: 500 });
  }
}
