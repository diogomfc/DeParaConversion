/* eslint-disable @typescript-eslint/no-explicit-any */
import { parse } from 'json2csv'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

type CsvDataRow = {
  [key: string]: string | number
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params

  try {
    const numericId = parseInt(id, 10)
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const record = await prisma.dePara.findUnique({
      where: { id: numericId },
      include: { generationDDL: true },
    })

    if (!record || !record.arquivoCSV) {
      return NextResponse.json(
        { error: 'Registro não encontrado ou dados inválidos' },
        { status: 404 },
      )
    }

    let data: CsvDataRow[] = []

    if (
      typeof record.arquivoCSV === 'object' &&
      'processedData' in record.arquivoCSV
    ) {
      data = (record.arquivoCSV as any).processedData
    } else if (Array.isArray(record.arquivoCSV)) {
      data = record.arquivoCSV as CsvDataRow[]
    } else {
      return NextResponse.json(
        { error: 'Formato de arquivoCSV inválido' },
        { status: 500 },
      )
    }

    const allColumns = new Set<string>()
    data.forEach((row) =>
      Object.keys(row).forEach((key) => allColumns.add(key)),
    )

    const columnOrder = [
      'Niv',
      'Campo',
      'Redef',
      'Gru',
      'FmtB',
      'PIni',
      'Tam',
      'IntB',
      'DecB',
      'Pic',
      'Usage',
      'Sinal',
      'OccDe',
      'OccAte',
      'DepON',
      'PK',
      ...Array.from(allColumns)
        .filter((key) => key.startsWith('AK') || key.startsWith('AN'))
        .sort(),
      'TpConv',
      'Padr',
      'Coluna',
      'Varhost',
      'FmtC',
      'IntC',
      'DecC',
      'Null',
      'Excd',
      'Pfx',
      'Sfx',
      'Trunc',
      'Dup',
      'CpoBase',
    ]

    const completeData = data.map((row) => {
      const completeRow: CsvDataRow = {}
      columnOrder.forEach((col) => {
        completeRow[col] = row[col] ?? ''
      })
      return completeRow
    })

    const csv = parse(completeData, { fields: columnOrder, delimiter: ';' })

    // Certifique-se de que o nome do arquivo seja corretamente formatado
    const fileName =
      (record.fileName ?? 'download').replace(/[^a-zA-Z0-9_.-]/g, '_') + '.csv'

    // Define os cabeçalhos de resposta para forçar o download como .csv
    const headers = new Headers({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: '0',
    })

    // Retorna o CSV com os cabeçalhos configurados para download
    return new NextResponse(csv, { headers })
  } catch (error) {
    console.error('Erro ao processar o download:', error)
    return NextResponse.json(
      { error: 'Erro ao processar o download' },
      { status: 500 },
    )
  }
}
