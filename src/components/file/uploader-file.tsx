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
}

export default function UploaderFile() {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();
  const [uploadComplete, setUploadComplete] = useState(false);

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

  // Função para processar o CSV com async/await
  const processCSV = async (data: DataRow[]): Promise<{ processedData: DataRow[], tamTotalDCL: number, sumTamC: number, status: string }> => {
    let nivValorPK = "";
    let tamTotalDCL = 0;
    let sumTamC = 0;

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
      } else if (row.Gru === "G" && row.Redef) {
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

