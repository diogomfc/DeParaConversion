"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XIcon, PlusIcon } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ModalItemListFile } from "./modal-item-list-file";
import { Separator } from "../ui/separator";

interface FileListProps {
  files: File[];
  progress: Record<string, number>;
  onRemoveFile: (index: number) => void;
  onClearSelection: () => void;
  onUpload: (file: File) => Promise<void>; // A função de upload agora deve aceitar um arquivo específico
  isUploading: boolean;
  openFileDialog: () => void;
}

export function ModalListFile({
  files,
  progress,
  onRemoveFile,
  onClearSelection,
  onUpload,
  isUploading,
  openFileDialog,
}: FileListProps) {

  const [uploadingFileIndex, setUploadingFileIndex] = useState<number | null>(
    null
  );

  const handleUpload = async () => {
    for (let i = 0; i < files.length; i++) {
      setUploadingFileIndex(i);
      try {
        await onUpload(files[i]);
        onRemoveFile(i); // Remove o arquivo da lista após o upload
      } catch (error) {
        console.error("Erro ao fazer upload do arquivo:", error);
      }
    }
    setUploadingFileIndex(null);
  };

  return (
    <DialogContent className="flex flex-col max-h-[80vh]">
      <DialogHeader className="sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <DialogTitle>
            <h1> Arquivos Selecionados</h1>
            <p className="text-sm font-normal text-gray-500">
              Total de arquivos: <span className="text-blue-900">{files.length}</span>
            </p>
          </DialogTitle>


          <Button
            variant="ghost"
            className="text-gray-500 hover:text-red-600"
            onClick={onClearSelection}
          >
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
      </DialogHeader>

      <Separator />

      <main className="flex flex-col items-center gap-4 mt-2 overflow-y-auto">
        <AnimatePresence>
          {files.map((file, index) => (
            <ModalItemListFile
              key={file.name}
              file={file}
              progress={progress[file.name]}
              onRemove={() => onRemoveFile(index)}
            />
          ))}
        </AnimatePresence>
      </main>

      <Separator />

      <DialogFooter className="sticky bg-white z-10">
        <div className="flex gap-4 p-4">
          <Button variant="outline" onClick={openFileDialog}>
            <PlusIcon className="w-4 h-4" />
            Adicionar mais arquivos
          </Button>
          <Button
            disabled={files.length === 0 || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? "Enviando..." : "Iniciar upload"}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
};
