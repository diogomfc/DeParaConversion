"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { UploadIcon, XIcon, PlusIcon } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import { ModalListFile } from "./modal-list-file";

interface DataRow {
  PK: string;
  Niv: string;
  TpConv: string;
  Gru: string;
  Redef: boolean;
  Tam: string;
}

// Componente para fazer upload de arquivos
export default function UploaderFile() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  // função de mutação para fazer o upload dos arquivos
  // const mutation = useMutation({
  //   mutationFn: async (file: File) => {
  //     const parsedData = await new Promise<DataRow[]>((resolve, reject) => {
  //       Papa.parse<DataRow>(file, {
  //         header: true,
  //         complete: (result) => resolve(result.data),
  //         error: (error) => reject(error),
  //       });
  //     });

  //     const processedData = processCSV(parsedData);

  //     // Simular atraso para o processamento dos arquivos
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     // Fazer o upload dos dados e salvar no banco de dados
  //     const response = await fetch("/api/files/create", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ arquivoCSV: processedData, fileName: file.name }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Erro ao salvar os dados.");
  //     }

  //     return await response.json();
  //   },
  //   onMutate: (file) => {
  //     setProgress((prev) => ({ ...prev, [file.name]: 0 }));
  //     setIsUploading(true);
  //   },
  //   onSuccess: (data, file) => {
  //     setProgress((prev) => ({ ...prev, [file.name]: 100 }));
  //     queryClient.invalidateQueries({ queryKey: ["files"] });
  //     setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
  //     if (files.length === 1) {
  //       setIsModalOpen(false);
  //     }
  //   },
  //   onError: () => {
  //     setIsUploading(false);
  //   },
  //   onSettled: () => {
  //     setIsUploading(false);
  //   },
  // });

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
      const { processedData, status } = processCSV(parsedData);

      // Simular atraso para o processamento dos arquivos
      //await new Promise((resolve) => setTimeout(resolve, 1000));

      // Fazer o upload dos dados e salvar no banco de dados
      const response = await fetch("/api/files/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arquivoCSV: processedData, fileName: file.name, description: 'Descrição opcional', status }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar os dados.");
      }

      return await response.json();
    },
    onMutate: (file) => {
      setProgress((prev) => ({ ...prev, [file.name]: 0 }));
      setIsUploading(true);
    },
    onSuccess: (data, file) => {
      setProgress((prev) => ({ ...prev, [file.name]: 100 }));
      queryClient.invalidateQueries({ queryKey: ["files"] });
      setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
      if (files.length === 1) {
        setIsModalOpen(false);
      }
    },
    onError: () => {
      setIsUploading(false);
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });


  //TODO: Processo de conversão dos campos da csv
  // Função para processar os dados da CSV
  // const processCSV = (data: DataRow[]): { processedData: DataRow[], tamTotalDCL: number, sumTamC: number, status: string } => {
  //   let nivValorPK = "";
  //   let tamTotalDCL = 0;
  //   let sumTamC = 0;

  //   // Processar dados para identificar valores e alterar TpConv
  //   data.forEach((row) => {
  //     if (row.PK === "PK") {
  //       nivValorPK = row.Niv;
  //     }
  //     if (row.TpConv === "DCL") {
  //       tamTotalDCL += parseFloat(row.Tam) || 0;
  //     }
  //   });

  //   // Limpar valores de TpConv exceto "DCL"
  //   data.forEach((row) => {
  //     if (row.TpConv !== "DCL") {
  //       row.TpConv = "";
  //     }
  //   });

  //   // Alterar valores de TpConv e calcular soma de Tam para "C"
  //   data.forEach((row) => {
  //     if (row.Niv === "#") {
  //       row.TpConv = "";
  //     } else if (row.Gru === "G" && row.Redef) {
  //       row.TpConv = "N";
  //     } else if (row.Niv === nivValorPK && row.TpConv !== "N") {
  //       row.TpConv = "C";
  //     } else if (row.TpConv !== "DCL") {
  //       row.TpConv = "N";
  //     }

  //     if (row.TpConv === "C") {
  //       sumTamC += parseFloat(row.Tam) || 0;
  //     }
  //   });

  //   // Determinar o status
  //   const status = tamTotalDCL !== sumTamC ? "Atenção" : "Confirmado";

  //   return { processedData: data, tamTotalDCL, sumTamC, status };
  // };

  const processCSV = (data: DataRow[]): { processedData: DataRow[], tamTotalDCL: number, sumTamC: number, status: string } => {
    let nivValorPK = "";
    let tamTotalDCL = 0;
    let sumTamC = 0;

    // Processar dados para identificar valores e alterar TpConv
    data.forEach((row) => {
      if (row.PK === "PK") {
        nivValorPK = row.Niv;
      }
      if (row.TpConv === "DCL") {
        tamTotalDCL += parseFloat(row.Tam) || 0;
      }
    });

    // Limpar valores de TpConv exceto "DCL"
    data.forEach((row) => {
      if (row.TpConv !== "DCL") {
        row.TpConv = "";
      }
    });

    // Alterar valores de TpConv e calcular soma de Tam para "C"
    data.forEach((row) => {
      if (row.Niv === "#") {
        row.TpConv = "";
      } else if (row.Gru === "G" && row.Redef) {
        row.TpConv = "N";
      } else if (row.Niv === nivValorPK && row.TpConv !== "N") {
        row.TpConv = "C";
      } else if (row.TpConv === "" && row.Gru !== "G") {
        row.TpConv = "N";
      }

      if (row.TpConv === "C") {
        sumTamC += parseFloat(row.Tam) || 0;
      }
    });

    // Determinar o status com base em tamTotalDCL e sumTamC
    const status = tamTotalDCL !== sumTamC ? "Atenção" : "OK";

    return { processedData: data, tamTotalDCL, sumTamC, status };
  };

  // Função para fazer o upload dos arquivos
  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles, ...acceptedFiles];
      if (!isModalOpen) {
        setIsModalOpen(true);
      }
      return newFiles;
    });
  };

  // Função para remover um arquivo da lista
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    multiple: true,
    disabled: isUploading,
    accept: {
      "text/csv": [".csv"],
    },
  });

  const handleUpload = async () => {
    for (const file of files) {
      await mutation.mutateAsync(file);
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
              className: `border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer ${isUploading ? "pointer-events-none" : ""
                }`,
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
