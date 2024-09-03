
//TODO: Unico arquivo

import { NextResponse } from 'next/server';
import { parse } from 'json2csv';
import prisma from '@/lib/prisma';

type CsvDataRow = {
  [key: string]: string | number;
};

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // Converte o ID para número e verifica sua validade
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Busca o registro no banco de dados
    const record = await prisma.dePara.findUnique({
      where: { id: numericId },
      include: { generationDDL: true },
    });

    // Verifica se o registro foi encontrado e se os dados são válidos
    if (!record || !record.arquivoCSV) {
      return NextResponse.json({ error: 'Registro não encontrado ou dados inválidos' }, { status: 404 });
    }

    // Prepara os dados para o CSV
    let data: CsvDataRow[] = [];

    // Verifica se arquivoCSV é um objeto com processedData
    if (typeof record.arquivoCSV === 'object' && 'processedData' in record.arquivoCSV) {
      data = (record.arquivoCSV as any).processedData;
    } else if (Array.isArray(record.arquivoCSV)) {
      // Caso arquivoCSV seja diretamente um array de objetos
      data = record.arquivoCSV as CsvDataRow[];
    } else {
      // Caso arquivoCSV não esteja em um formato esperado
      return NextResponse.json({ error: 'Formato de arquivoCSV inválido' }, { status: 500 });
    }

    // Identifica todas as colunas presentes nos dados
    const allColumns = new Set<string>();
    data.forEach(row => Object.keys(row).forEach(key => allColumns.add(key)));
    
    // Define a ordem das colunas
    const columnOrder = [
      "Niv", "Campo", "Redef", "Gru", "FmtB", "PIni", "Tam", "IntB", "DecB", "Pic",
      "Usage", "Sinal", "OccDe", "OccAte", "DepON", "PK",
      ...Array.from(allColumns).filter(key => key.startsWith('AK') || key.startsWith('AN')).sort(),
      "TpConv", "Padr", "Coluna", "Varhost", "FmtC", "IntC", "DecC",
      "Null", "Excd", "Pfx", "Sfx", "Trunc", "Dup", "CpoBase"
    ];

    // Completa os dados para garantir que todas as colunas estão presentes
    const completeData = data.map(row => {
      const completeRow: CsvDataRow = {};
      columnOrder.forEach(col => {
        completeRow[col] = row[col] ?? ''; // Adiciona valor vazio se a coluna não estiver presente
      });
      return completeRow;
    });

    // Converte os dados para CSV com delimitador ;
    const csv = parse(completeData, { fields: columnOrder, delimiter: ';' });

    // Configura os cabeçalhos para download
    const headers = new Headers({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(record.fileName ?? 'download.csv')}"`,
    });

    return new NextResponse(csv, { headers });
  } catch (error) {
    console.error('Erro ao processar o download:', error);
    return NextResponse.json({ error: 'Erro ao processar o download' }, { status: 500 });
  }
}

//TODO: ZIP
// import { NextResponse } from 'next/server';
// import { parse } from 'json2csv';
// import JSZip from 'jszip';
// import prisma from '@/lib/prisma';

// type CsvDataRow = {
//   [key: string]: string | number;
// };


// export async function GET(request: Request, { params }: { params: { ids: string[] } }) {
//   const { ids } = params;

//   try {
//     if (!Array.isArray(ids) || ids.length === 0) {
//       return NextResponse.json({ error: 'Nenhum ID fornecido' }, { status: 400 });
//     }

//     const zip = new JSZip();
//     const filePromises = ids.map(async (id) => {
//       // Converte o ID para número e verifica sua validade
//       const numericId = parseInt(id, 10);
//       if (isNaN(numericId)) {
//         throw new Error(`ID inválido: ${id}`);
//       }

//       // Busca o registro no banco de dados
//       const record = await prisma.dePara.findUnique({
//         where: { id: numericId },
//         include: { generationDDL: true },
//       });

//       if (!record || !record.arquivoCSV) {
//         throw new Error(`Registro não encontrado ou dados inválidos para o ID: ${id}`);
//       }

//       // Prepara os dados para o CSV
//       let data: CsvDataRow[] = [];

//       if (typeof record.arquivoCSV === 'object' && 'processedData' in record.arquivoCSV) {
//         data = (record.arquivoCSV as any).processedData;
//       } else if (Array.isArray(record.arquivoCSV)) {
//         data = record.arquivoCSV as CsvDataRow[];
//       } else {
//         throw new Error(`Formato de arquivoCSV inválido para o ID: ${id}`);
//       }

//       const allColumns = new Set<string>();
//       data.forEach(row => Object.keys(row).forEach(key => allColumns.add(key)));

//       const columnOrder = [
//         "Niv", "Campo", "Redef", "Gru", "FmtB", "PIni", "Tam", "IntB", "DecB", "Pic",
//         "Usage", "Sinal", "OccDe", "OccAte", "DepON", "PK",
//         ...Array.from(allColumns).filter(key => key.startsWith('AK') || key.startsWith('AN')).sort(),
//         "TpConv", "Padr", "Coluna", "Varhost", "FmtC", "IntC", "DecC",
//         "Null", "Excd", "Pfx", "Sfx", "Trunc", "Dup", "CpoBase"
//       ];

//       const completeData = data.map(row => {
//         const completeRow: CsvDataRow = {};
//         columnOrder.forEach(col => {
//           completeRow[col] = row[col] ?? '';
//         });
//         return completeRow;
//       });

//       const csv = parse(completeData, { fields: columnOrder, delimiter: ';' });
//       zip.file(`${record.fileName ?? 'arquivo'}.csv`, csv);
//     });

//     await Promise.all(filePromises);

//     const zipBlob = await zip.generateAsync({ type: 'blob' });
//     const headers = new Headers({
//       'Content-Type': 'application/zip',
//       'Content-Disposition': `attachment; filename="arquivos.zip"`,
//     });

//     return new NextResponse(zipBlob, { headers });
//   } catch (error) {
//     console.error('Erro ao processar o download:', error);
//     return NextResponse.json({ error: 'Erro ao processar o download' }, { status: 500 });
//   }
// }


