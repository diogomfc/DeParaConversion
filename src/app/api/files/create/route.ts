import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
export async function POST(request: Request) {
  const { files } = await request.json()

  if (!files || files.length === 0) {
    return NextResponse.json(
      { error: 'Nenhum arquivo fornecido' },
      { status: 400 },
    )
  }

  try {
    const savedRecords = []

    for (const file of files) {
      const { arquivoCSV, fileName, description, status } = file

      // Define o prefixo e o sufixo com base no status
      const prefix = status === 'Atenção' ? 'M' : 'A'
      const suffix = status === 'Atenção' ? '_Lab.csv' : '_Sis.csv'

      // Adiciona o prefixo e sufixo corretos ao nome do arquivo
      const fileNameWithSuffix = `${prefix}${fileName
        .replace(/^[A-Z]/, '') // Remove a primeira letra original
        .replace(/\.[^/.]+$/, '')}${suffix}` // Adiciona o sufixo e mantém a extensão .csv

      // Verifica se já existe um registro com o mesmo fileName
      const existingRecord = await prisma.dePara.findFirst({
        where: { fileName: fileNameWithSuffix },
      })

      if (existingRecord) {
        // Exclui o registro existente, se houver
        console.log(
          `Registro existente encontrado para ${fileNameWithSuffix}. Excluindo...`,
        )
        await prisma.dePara.delete({
          where: { id: existingRecord.id },
        })
      }

      // Cria um novo registro no modelo DePara
      const savedRecord = await prisma.dePara.create({
        data: {
          fileName: fileNameWithSuffix,
          arquivoCSV,
          description,
          status,
        },
      })

      savedRecords.push(savedRecord)
    }

    // Retorna os IDs dos novos registros
    return NextResponse.json({
      savedRecords,
      message: 'Todos os arquivos foram salvos com sucesso',
    })
  } catch (error) {
    console.error('Erro ao salvar os dados:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar os dados' },
      { status: 500 },
    )
  }
}
