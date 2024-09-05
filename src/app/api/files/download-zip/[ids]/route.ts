import { parse } from 'json2csv'
import JSZip from 'jszip'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

type CsvDataRow = {
  [key: string]: string | number
}

export async function GET(
  request: Request,
  { params }: { params: { ids: string } },
) {
  const { ids } = params
  const fileIds = ids.split(',')

  try {
    const zip = new JSZip()

    for (const id of fileIds) {
      const numericId = parseInt(id, 10)
      if (isNaN(numericId)) {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
      }

      const record = await prisma.dePara.findUnique({
        where: { id: numericId },
        include: { generationDDL: true },
      })

      if (!record || !record.arquivoCSV) {
        continue
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
        continue
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

      zip.file(`${record.fileName ?? 'download'}.csv`, csv)
    }

    const blob = await zip.generateAsync({ type: 'blob' })

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="arquivos.zip"`,
      },
    })
  } catch (error) {
    console.error('Erro ao processar o download:', error)
    return NextResponse.json(
      { error: 'Erro ao processar o download' },
      { status: 500 },
    )
  }
}
