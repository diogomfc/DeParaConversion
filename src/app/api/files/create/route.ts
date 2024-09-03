import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { arquivoCSV, fileName, description, status } = await request.json();

  // Define o sufixo com base no status
  const suffix = status === "Atenção" ? "_Lab.csv" : "_Sis.csv";

  // Adiciona o sufixo correto ao nome do arquivo
  const fileNameWithSuffix = `${fileName
    .replace(/^[A-Z]/, "M") // Altera a primeira letra para "M"
    .replace(/\.[^/.]+$/, "")}${suffix}`; // Adiciona o sufixo e mantém a extensão .csv

  try {
    // Verifica se já existe um registro com o mesmo fileName
    const existingRecord = await prisma.dePara.findFirst({
      where: { fileName: fileNameWithSuffix },
    });

    if (existingRecord) {
      // Exclui o registro existente, se houver
      console.log('Registro existente encontrado. Excluindo...');
      await prisma.dePara.delete({
        where: { id: existingRecord.id },
      });
    }

    // Cria um novo registro no modelo DePara
    const savedRecord = await prisma.dePara.create({
      data: {
        fileName: fileNameWithSuffix,
        arquivoCSV,
        description,
        status,
      },
    });

    // Retorna o ID do novo registro
    return NextResponse.json({ id: savedRecord.id, message: 'Dados salvos com sucesso' });
  } catch (error) {
    console.error('Erro ao salvar os dados:', error);
    return NextResponse.json({ error: 'Erro ao salvar os dados' }, { status: 500 });
  }
}






