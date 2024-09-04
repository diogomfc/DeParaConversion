"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { UploadIcon, XIcon, PlusIcon } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import { ModalListFile } from "./modal-list-file";
import axios from "axios";

interface DataRow {
  PK: string;
  Niv: string;
  TpConv: string;
  Gru: string;
  Redef: boolean;
  Tam: string;
  [key: string]: any;
}

export default function UploaderFile() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();
  const [uploadComplete, setUploadComplete] = useState(false);

  // TODO:v1 Função para processar o CSV com async/await
  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const parsedData = await new Promise<DataRow[]>((resolve, reject) => {
        Papa.parse<DataRow>(file, {
          header: true,
          complete: (result) => resolve(result.data),
          error: (error) => reject(error),
        });
      });

      // Processar os dados CSV e obter o status
      const { processedData, status } = await processCSV(parsedData);

      // Fazer o upload dos dados e salvar no banco de dados
      const response = await axios.post("/api/files/create", {
        files: [{
          arquivoCSV: processedData,
          fileName: file.name,
          description: 'Descrição opcional',
          status
        }]
      });

      if (response.status !== 200) {
        throw new Error("Erro ao salvar os dados.");
      }

      return response.data;
    },
    onMutate: (file) => {
      setProgress((prev) => ({ ...prev, [file.name]: 0 }));
      setIsUploading(true);
    },
    onSuccess: (data, file) => {
      setProgress((prev) => ({ ...prev, [file.name]: 100 }));
    },
    onError: () => {
      setIsUploading(false);
    },
    onSettled: () => {
      // Se todos os arquivos foram processados
      if (files.length === 0) {
        setIsUploading(false);
        setUploadComplete(true);
      }
    },
  });

  const processCSV = async (data: DataRow[]): Promise<{ processedData: DataRow[], tamTotalDCL: number, sumTamC: number, status: string }> => {
    let nivValorPK = "";
    let tamTotalDCL = 0;
    let sumTamC = 0;

    data.forEach((row) => {
      if (row.TpConv !== "DCL") {
        row.TpConv = "";  // Limpa o valor se não for "DCL"
      }
    });

    // Loop único para processar dados e calcular tamTotalDCL
    data.forEach((row) => {
      if (row.PK === "PK") {
        nivValorPK = row.Niv;
      }

      if (row.TpConv === "DCL") {
        tamTotalDCL += parseFloat(row.Tam) || 0;
      }
    });

    // Loop para atualizar TpConv e calcular sumTamC
    data.forEach((row) => {
      if (row.Niv === "#") {
        row.TpConv = "";
      } else if (row.Niv === "") {
        row.TpConv = ""; // Não preenche se Niv estiver 
      }
      else if (row.Gru === "G" && row.Redef) {
        row.TpConv = "N";
      } else if (row.Niv === nivValorPK && row.TpConv !== "N") {
        row.TpConv = "C";
      } else if (row.TpConv === "") {
        row.TpConv = "N";
      }

      // Calcular a soma de Tam para "C"
      if (row.TpConv === "C") {
        sumTamC += parseFloat(row.Tam) || 0;
      }
    });

    // Determinar o status com base em tamTotalDCL e sumTamC
    const status = tamTotalDCL !== sumTamC ? "Atenção" : "Conferido";

    return { processedData: data, tamTotalDCL, sumTamC, status };
  };

  //TODO:v2 Função para processar o CSV e preencher o campo TpConv
  // Função para processar o CSV e preencher o campo TpConv
  // const processCSV = async (data: DataRow[]): Promise<{ processedData: DataRow[], tamTotalDCL: number, sumTamC: number, status: string }> => {
  //   let nivValorPK = "";
  //   let tamTotalDCL = 0;
  //   let sumTamC = 0;
  //   let markNForE = false;  // Variável para marcar elementos E como "N"

  //   // Primeiro loop para determinar nivValorPK e calcular tamTotalDCL
  //   data.forEach((row) => {
  //     if (row.PK === "PK") {
  //       nivValorPK = row.Niv;
  //       markNForE = true;  // Ativa a marcação "N" para próximos "E"
  //     }

  //     if (row.TpConv === "DCL") {
  //       tamTotalDCL += parseFloat(row.Tam) || 0;
  //     }
  //   });

  //   // Limpar os valores existentes em TpConv, exceto se for "DCL"
  //   data.forEach((row) => {
  //     if (row.TpConv !== "DCL") {
  //       row.TpConv = "";  // Limpa o valor se não for "DCL"
  //     }
  //   });

  //   // Segundo loop para preencher TpConv e calcular sumTamC
  //   data.forEach((row) => {
  //     if (row.Niv === "#") {
  //       row.TpConv = ""; // Deixa a célula em branco se Niv for "#"
  //     } else if (row.Niv === "") {
  //       row.TpConv = ""; // Não preenche se Niv estiver vazio (final da tabela)
  //     } else if (row.Gru === "G" && row.Redef) {
  //       if (row.PK === "PK") {
  //         row.TpConv = "C";
  //         markNForE = true;  // Ativa a marcação "N" para próximos "E"
  //       } else if (row.TpConv !== "DCL" && !markNForE) {
  //         row.TpConv = "N";
  //       }
  //     } else if (row.Niv === nivValorPK && row.TpConv !== "N") {
  //       row.TpConv = "C";
  //     }

  //     // Aplica "N" para os elementos "E" se necessário
  //     if (markNForE && row.PK === "E") {
  //       row.TpConv = "N";
  //     }

  //     // Calcular a soma de Tam para "C"
  //     if (row.TpConv === "C") {
  //       sumTamC += parseFloat(row.Tam) || 0;
  //     }
  //   });

  //   // Comparar tamTotalDCL e sumTamC para determinar o status
  //   const status = tamTotalDCL !== sumTamC ? "Atenção" : "Conferido";

  //   return { processedData: data, tamTotalDCL, sumTamC, status };
  // };

  //TODO: v3
  // const mutation = useMutation({
  //   mutationFn: async (file: File) => {
  //     // Parse CSV e obter as colunas
  //     const parsedData = await new Promise<DataRow[]>((resolve, reject) => {
  //       Papa.parse<DataRow>(file, {
  //         header: true,
  //         complete: (result) => resolve(result.data),
  //         error: (error) => reject(error),
  //       });
  //     });

  //     // Identificar todas as colunas do CSV (incluindo as dinâmicas AK/AN)
  //     const allColumns = new Set<string>([
  //       'PK', 'Niv', 'TpConv', 'Gru', 'Redef', 'Tam',
  //       // Adicione outras colunas estáticas aqui se necessário
  //       ...Object.keys(parsedData[0] || {}), // Inclui todas as colunas do CSV
  //     ]);

  //     // Processar os dados CSV e obter o status
  //     const { processedData, status } = await processCSV(parsedData, allColumns);

  //     // Fazer o upload dos dados e salvar no banco de dados
  //     const response = await axios.post("/api/files/create", {
  //       files: [{
  //         arquivoCSV: processedData,
  //         fileName: file.name,
  //         description: 'Descrição opcional',
  //         status
  //       }]
  //     });

  //     if (response.status !== 200) {
  //       throw new Error("Erro ao salvar os dados.");
  //     }

  //     return response.data;
  //   },
  //   onMutate: (file) => {
  //     setProgress((prev) => ({ ...prev, [file.name]: 0 }));
  //     setIsUploading(true);
  //   },
  //   onSuccess: (data, file) => {
  //     setProgress((prev) => ({ ...prev, [file.name]: 100 }));
  //   },
  //   onError: () => {
  //     setIsUploading(false);
  //   },
  //   onSettled: () => {
  //     // Se todos os arquivos foram processados
  //     if (files.length === 0) {
  //       setIsUploading(false);
  //       setUploadComplete(true);
  //     }
  //   },
  // });


  // const processCSV = async (data: DataRow[], allColumns: Set<string>): Promise<{ processedData: DataRow[], tamTotalDCL: number, sumTamC: number, status: string }> => {
  //   let nivValorPK = "";
  //   let tamTotalDCL = 0;
  //   let sumTamC = 0;

  //   // Conjunto para marcar os índices das linhas que devem ser preenchidas com "N"
  //   const markRowsE = new Set<number>();
  //   let markE = false; // Variável para saber se deve marcar linhas `E` como "N"

  //   // Primeiro loop para determinar nivValorPK, calcular tamTotalDCL e marcar índices para linhas `E`
  //   data.forEach((row, index) => {
  //     // Marcar se encontrarmos valores `AU`, `AN`, ou `AK` em qualquer coluna
  //     if (row.PK === "PK") {
  //       nivValorPK = row.Niv;
  //       markE = true; // Ativa a marcação para linhas `E` após encontrar `PK`
  //     } else {
  //       // Verificar se algum valor em qualquer coluna é "AU", "AN", ou "AK"
  //       for (const key of Object.keys(row)) {
  //         if (["AU", "AN", "AK"].includes(row[key as keyof DataRow])) {
  //           markE = true; // Ativa a marcação para linhas `E`
  //           break;
  //         }
  //       }
  //     }

  //     if (row.TpConv === "DCL") {
  //       tamTotalDCL += parseFloat(row.Tam) || 0;
  //     }

  //     // Se a marcação está ativada, adicione o índice da linha `E` ao conjunto
  //     if (markE && row.PK === "E") {
  //       markRowsE.add(index);
  //     }
  //   });

  //   // Limpar os valores existentes em TpConv, exceto se for "DCL"
  //   data.forEach((row) => {
  //     if (row.TpConv !== "DCL") {
  //       row.TpConv = "";  // Limpa o valor se não for "DCL"
  //     }
  //   });

  //   // Segundo loop para preencher TpConv e calcular sumTamC
  //   data.forEach((row, index) => {
  //     if (row.Niv === "#") {
  //       row.TpConv = ""; // Deixa a célula em branco se Niv for "#"
  //     } else if (row.Niv === "") {
  //       row.TpConv = ""; // Não preenche se Niv estiver vazio (final da tabela)
  //     } else if (row.Gru === "G" && row.Redef) {
  //       if (row.PK === "PK") {
  //         row.TpConv = "C";
  //         markE = true; // Ativa a marcação para linhas `E` após encontrar `PK`
  //       } else if (row.TpConv !== "DCL" && markE) {
  //         row.TpConv = "N";
  //       }
  //     } else if (row.Niv === nivValorPK && row.TpConv !== "N") {
  //       row.TpConv = "C";
  //     }

  //     // Aplica "N" para os elementos "E" se o índice estiver no conjunto
  //     if (markRowsE.has(index)) {
  //       row.TpConv = "N";
  //     }

  //     // Calcular a soma de Tam para "C"
  //     if (row.TpConv === "C") {
  //       sumTamC += parseFloat(row.Tam) || 0;
  //     }
  //   });

  //   // Comparar tamTotalDCL e sumTamC para determinar o status
  //   const status = tamTotalDCL !== sumTamC ? "Atenção" : "Conferido";

  //   return { processedData: data, tamTotalDCL, sumTamC, status };
  // };


  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles, ...acceptedFiles];
      if (!isModalOpen) {
        setIsModalOpen(true);
      }
      return newFiles;
    });
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    multiple: true,
    disabled: isUploading,
    accept: {
      "text/csv": [".csv"],
    },
  });

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadComplete(false);

    try {
      // Use Promise.all para garantir que todos os arquivos sejam processados
      await Promise.all(files.map(file => mutation.mutateAsync(file)));

      // Atualize a lista após todos os arquivos serem processados
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setFiles([]);
    } catch (error) {
      console.error('Erro ao fazer upload dos arquivos:', error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const clearSelection = () => {
    setFiles([]);
    setIsModalOpen(false);
  };

  return (
    <div className="my-8">
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <div
            {...getRootProps({
              className: `border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer ${isUploading ? "pointer-events-none" : ""}`,
            })}
          >
            <input {...getInputProps()} />
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-1 text-sm text-gray-600">
              Clique ou arraste arquivos aqui para fazer upload
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Arquivos permitidos: CSV
            </p>
          </div>

          {/* Modal com os arquivos selecionados */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <ModalListFile
              files={files}
              progress={progress}
              onRemoveFile={removeFile}
              onClearSelection={clearSelection}
              onUpload={handleUpload}
              isUploading={isUploading}
              openFileDialog={open}
            />
          </Dialog>
        </div>
      </div>
    </div>
  );
}

