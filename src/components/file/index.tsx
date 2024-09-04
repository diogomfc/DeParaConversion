import { useState, useEffect } from 'react';
import { useFetchFiles } from '@/hooks/useFetchFiles';
import { useDeleteFileMutation } from '@/hooks/useDeleteFileMutation';
import { useDownloadFiles } from '@/hooks/useDownloadFiles'; // Hook para download individual
import { useDownloadZip } from '@/hooks/useDownloadZip'; // Hook para download em ZIP
import { TableFile } from './table-file';
import { Pagination } from './pagination';
import { useToast } from '@/hooks/use-toast';
import { useDeleteFilesMutation } from '@/hooks/useDeleteFilesMutation';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { DateFilter } from './date-filter';

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
  const { toast } = useToast();
  const { data: files = [], isLoading, isError, error } = useFetchFiles();
  const deleteFileMutation = useDeleteFileMutation();
  const deleteFilesMutation = useDeleteFilesMutation(); // Hook para deletar múltiplos arquivos
  const { handleDownload: handleDownloadZip } = useDownloadZip(files);
  const { handleDownload: handleDownloadIndividual } = useDownloadFiles(files);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o termo de pesquisa
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<FileRecord[]>(files);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined); // Estado para a data selecionada
  const recordsPerPage = 10;

  useEffect(() => {
    // Atualiza os arquivos filtrados com base no termo de pesquisa e na data
    if (searchTerm) {
      setFilteredFiles(
        files.filter((file) =>
          file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setSelectedDate(undefined); // Limpa o filtro de data quando o termo de pesquisa é alterado
    } else if (selectedDate) {
      const filtered = files.filter((file) => {
        const fileDate = new Date(file.createdAt);
        return (
          fileDate.getFullYear() === selectedDate.getFullYear() &&
          fileDate.getMonth() === selectedDate.getMonth() &&
          fileDate.getDate() === selectedDate.getDate()
        );
      });
      setFilteredFiles(filtered);
    } else {
      setFilteredFiles(files); // Sem filtros
    }

    setCurrentPage(1); // Resetar para a primeira página ao filtrar
  }, [searchTerm, selectedDate, files]);

  const paginate = (items: FileRecord[], page: number, perPage: number) => {
    const offset = (page - 1) * perPage;
    return items.slice(offset, offset + perPage);
  };

  const paginatedFiles = paginate(filteredFiles, currentPage, recordsPerPage);
  const totalPages = Math.ceil(filteredFiles.length / recordsPerPage);

  const handleDelete = (id: string) => {
    deleteFileMutation.mutate(id);

    toast({
      title: 'Sucesso!',
      description: 'Arquivo excluído com sucesso.',
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
        title: 'Download Concluído',
        description: `${ids.length} arquivos foram baixados com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao fazer o download dos arquivos:', error);

      toast({
        title: 'Erro',
        description: 'Ocorreu um problema ao fazer o download dos arquivos.',
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

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  // Função para limpar o filtro e exibir todos os arquivos
  const handleClearDateFilter = () => {
    setSelectedDate(undefined); // Limpa a data selecionada
    setFilteredFiles(files); // Resetar para todos os arquivos
    setCurrentPage(1); // Resetar para a primeira página
  };

  if (isLoading) {
    return <div>Carregando arquivos...</div>;
  }

  if (isError) {
    return <div>Erro ao carregar arquivos: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between mb-4 gap-2">
        <Input
          placeholder="Buscar por nome do arquivo"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Atualiza o termo de pesquisa
          className="mr-4"
        />

        <DateFilter
          onDateChange={handleDateChange}
          handleClearFilter={handleClearDateFilter}
          searchTerm={searchTerm}
        />

        <Button
          variant="outline"
          onClick={() => handleDownloadFiles(selectedFiles)}
          disabled={selectedFiles.length === 0}
        >
          {selectedFiles.length === 1 ? 'Download' : 'Download Selecionados'}
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
        totalRecords={filteredFiles.length}
      />
    </div>
  );
}
