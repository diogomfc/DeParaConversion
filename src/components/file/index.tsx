import { useState } from 'react';
import { useFetchFiles } from '@/hooks/useFetchFiles';
import { useDeleteFileMutation } from '@/hooks/useDeleteFileMutation';
import { useDownloadFiles } from '@/hooks/useDownloadFiles'; // Hook para download individual
import { useDownloadZip } from '@/hooks/useDownloadZip'; // Hook para download em ZIP
import { Button } from '../ui/button';
import { TableFile } from './table-file';
import { Pagination } from './pagination';
import { useToast } from '@/hooks/use-toast';
import { useDeleteFilesMutation } from '@/hooks/useDeleteFilesMutation';

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
  const { toast } = useToast()
  const { data: files = [], isLoading, isError, error } = useFetchFiles();
  const deleteFileMutation = useDeleteFileMutation();
  const deleteFilesMutation = useDeleteFilesMutation(); // Hook para deletar múltiplos arquivos
  const { handleDownload: handleDownloadZip } = useDownloadZip(files);
  const { handleDownload: handleDownloadIndividual } = useDownloadFiles(files);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const recordsPerPage = 10;

  const paginate = (items: FileRecord[], page: number, perPage: number) => {
    const offset = (page - 1) * perPage;
    return items.slice(offset, offset + perPage);
  };

  const paginatedFiles = paginate(files, currentPage, recordsPerPage);
  const totalPages = Math.ceil(files.length / recordsPerPage);

  const handleDelete = (id: string) => {
    deleteFileMutation.mutate(id);

    toast({
      title: "Sucesso!",
      description: "Arquivo excluído com sucesso.",
    });
  };

  const handleDownloadFiles = async (ids: string[]) => {
    try {
      if (ids.length === 1) {
        await handleDownloadIndividual(ids); // Download individual
      } else if (ids.length > 1) {
        await handleDownloadZip(ids); // Download em ZIP
      }

      toast({
        title: "Download Concluído",
        description: `${ids.length} arquivos foram baixados com sucesso.`,
      });

    } catch (error) {
      console.error("Erro ao fazer o download dos arquivos:", error);

      // Exibir toast para erro
      toast({
        title: "Erro",
        description: "Ocorreu um problema ao fazer o download dos arquivos.",
      });
    }
  };

  const handleSelectFile = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id)
        ? prev.filter((fileId) => fileId !== id)
        : [...prev, id]
    );
  };

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
          {selectedFiles.length === 1 ? "Download" : "Download Selecionados"}
        </Button>
      </div>
      <TableFile
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
