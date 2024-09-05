import axios from 'axios'
import { saveAs } from 'file-saver'

import { FileRecord } from '@/components/file'

export const useDownloadFiles = (files?: FileRecord[]) => {
  const handleDownload = async (ids: string[]) => {
    try {
      for (const id of ids) {
        const response = await axios.get(`/api/files/${id}/download`, {
          responseType: 'blob',
        })

        if (response.status !== 200) {
          throw new Error(
            `Erro ao fazer o download do arquivo. Status: ${response.status}. Detalhes: ${response.statusText}`,
          )
        }

        const fileRecord = files?.find((file) => file.id === id)
        const fileName = fileRecord?.fileName ?? 'download.csv'

        saveAs(new Blob([response.data]), fileName)
      }
    } catch (error) {
      console.error('Erro ao fazer o download dos arquivos:', error)
    }
  }

  return { handleDownload }
}
