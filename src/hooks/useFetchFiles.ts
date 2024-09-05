import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export type FileRecord = {
  id: string
  fileName: string
  description: string
  status: string
  prioridade: string
  createdAt: string
}

const fetchFiles = async (): Promise<FileRecord[]> => {
  const response = await axios.get('/api/files/list')
  if (response.status !== 200) {
    throw new Error('Erro ao buscar os arquivos.')
  }
  return response.data
}

export const useFetchFiles = () => {
  return useQuery<FileRecord[], Error>({
    queryKey: ['files'],
    queryFn: fetchFiles,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5,
    retry: 3, // Tenta 3 vezes em caso de falha
  })
}
