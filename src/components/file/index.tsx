import { useState } from "react";
import { useDeleteFileMutation } from "@/hooks/useDeleteFileMutation";
import { useDownloadFiles } from "@/hooks/useDownloadFiles";
import { useFetchFiles } from "@/hooks/useFetchFiles";
import { Button } from "../ui/button";
import { TableFile1 } from "./table-file1";
import { Pagination } from "./pagination";

// Tipo para o arquivo
export type FileRecord = {
  id: string;
  fileName: string;
  description: string;
  status: string;
  prioridade: string;
  createdAt: string;
};

export function TableFileHome() {
  const { data: files = [], isLoading, isError, error } = useFetchFiles();
  const deleteFileMutation = useDeleteFileMutation();
  const { handleDownload } = useDownloadFiles(files); // Corrigido o uso do hook de download
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const recordsPerPage = 10;

  // Função de paginação
  const paginate = (items: FileRecord[], page: number, perPage: number) => {
    const offset = (page - 1) * perPage;
    return items.slice(offset, offset + perPage);
  };
  const paginatedFiles = paginate(files, currentPage, recordsPerPage);
  const totalPages = Math.ceil(files.length / recordsPerPage);

  // Função para deletar um arquivo
  const handleDelete = (id: string) => {
    deleteFileMutation.mutate(id);
  };
  // Função para fazer download de arquivos
  const handleDownloadFiles = async (ids: string[]) => {
    try {
      await handleDownload(ids); // Corrigido o uso da função de download
    } catch (error) {
      console.error("Erro ao fazer o download dos arquivos:", error);
    }
  };
  // Função para selecionar um arquivo
  const handleSelectFile = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id)
        ? prev.filter((fileId) => fileId !== id)
        : [...prev, id]
    );
  };
  // Função para selecionar todos os arquivos
  const handleSelectAll = () => {
    if (selectedFiles.length === paginatedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(paginatedFiles.map((file) => file.id));
    }
  };

  if (isLoading) {
    return <div>Carregando arquivos...</div>;
  }

  if (isError) {
    return <div>Erro ao carregar arquivos: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => handleDownloadFiles(selectedFiles)}
          disabled={selectedFiles.length === 0}
        >
          Download Selecionados
        </Button>
      </div>
      <TableFile1
        files={paginatedFiles}
        selectedFiles={selectedFiles}
        onSelectFile={handleSelectFile}
        onSelectAll={handleSelectAll}
        onDelete={handleDelete}
        onDownload={handleDownloadFiles}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalRecords={files.length}
      />
    </div>
  );
}
