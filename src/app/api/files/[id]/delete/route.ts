import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params

  try {
    // Verifica se o ID está definido
    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido.' }, { status: 400 })
    }

    // Remove o registro do banco de dados
    const deletedFile = await prisma.dePara.delete({
      where: { id: Number(id) },
    })

    // Retorna uma resposta de sucesso
    return NextResponse.json(deletedFile)
  } catch (error) {
    console.error('Erro ao excluir o arquivo:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir o arquivo' },
      { status: 500 },
    )
  }
}
