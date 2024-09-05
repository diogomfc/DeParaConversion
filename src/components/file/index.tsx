import { useEffect, useState } from 'react'

import { useToast } from '@/hooks/use-toast'
import { useDeleteFileMutation } from '@/hooks/useDeleteFileMutation'
import { useDownloadFiles } from '@/hooks/useDownloadFiles'
import { useDownloadZip } from '@/hooks/useDownloadZip'
import { useFetchFiles } from '@/hooks/useFetchFiles'

import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { DateFilter } from './date-filter'
import { Pagination } from './pagination'
import { StatusFilter } from './status-filter' // Importe o componente StatusFilter
import { TableFile } from './table-file'

export type FileRecord = {
  id: string
  fileName: string
  description: string
  status: string
  prioridade: string
  createdAt: string
}

export function TableFileHome() {
  const { toast } = useToast()
  const { data: files = [], isLoading, isError, error } = useFetchFiles()
  const deleteFileMutation = useDeleteFileMutation()
  const { handleDownload: handleDownloadZip } = useDownloadZip(files)
  const { handleDownload: handleDownloadIndividual } = useDownloadFiles(files)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [allFiles, setAllFiles] = useState<FileRecord[]>(files)
  const [filteredFiles, setFilteredFiles] = useState<FileRecord[]>(files)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos') // Ajuste aqui
  const recordsPerPage = 10

  useEffect(() => {
    let result = allFiles

    if (searchTerm) {
      result = result.filter((file) =>
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    } else if (selectedDate) {
      result = result.filter((file) => {
        const fileDate = new Date(file.createdAt)
        return (
          fileDate.getFullYear() === selectedDate.getFullYear() &&
          fileDate.getMonth() === selectedDate.getMonth() &&
          fileDate.getDate() === selectedDate.getDate()
        )
      })
    }

    if (selectedStatus !== 'Todos') {
      result = result.filter((file) => file.status === selectedStatus)
    }

    setFilteredFiles(result)
    setCurrentPage(1) // Resetar para a primeira página ao filtrar
  }, [searchTerm, selectedDate, allFiles, selectedStatus])

  useEffect(() => {
    setAllFiles(files)
  }, [files])

  const paginate = (items: FileRecord[], page: number, perPage: number) => {
    const offset = (page - 1) * perPage
    return items.slice(offset, offset + perPage)
  }

  const paginatedFiles = paginate(filteredFiles, currentPage, recordsPerPage)
  const totalPages = Math.ceil(filteredFiles.length / recordsPerPage)

  const handleDelete = (id: string) => {
    deleteFileMutation.mutate(id)

    toast({
      title: 'Sucesso!',
      description: 'Arquivo excluído com sucesso.',
    })
  }

  const handleDownloadFiles = async (ids: string[]) => {
    try {
      if (ids.length === 1) {
        await handleDownloadIndividual(ids) // Download individual
      } else if (ids.length > 1) {
        await handleDownloadZip(ids) // Download em ZIP
      }

      toast({
        title: 'Download Concluído',
        description: `${ids.length} arquivos foram baixados com sucesso.`,
      })
    } catch (error) {
      console.error('Erro ao fazer o download dos arquivos:', error)

      toast({
        title: 'Erro',
        description: 'Ocorreu um problema ao fazer o download dos arquivos.',
      })
    }
  }

  const handleSelectFile = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id)
        ? prev.filter((fileId) => fileId !== id)
        : [...prev, id],
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === allFiles.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(filteredFiles.map((file) => file.id))
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  const handleClearDateFilter = () => {
    setSelectedDate(undefined)
    setSelectedStatus('Todos') // Limpar filtro de status
    setFilteredFiles(allFiles)
    setCurrentPage(1)
  }

  if (isLoading) {
    return <div>Carregando arquivos...</div>
  }

  if (isError) {
    return <div>Erro ao carregar arquivos: {error.message}</div>
  }

  return (
    <div>
      <div className="flex justify-between mb-4 gap-2">
        <Input
          placeholder="Buscar por nome do arquivo"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mr-4"
        />

        <DateFilter
          placeholderDateFilter="Filtrar por data"
          onDateChange={handleDateChange}
          handleClearFilter={handleClearDateFilter}
          searchTerm={searchTerm}
        />

        <StatusFilter
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
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
  )
}
