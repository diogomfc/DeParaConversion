import { useState } from 'react'

export const useSelectedFiles = () => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  const handleSelectFile = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id)
        ? prev.filter((fileId) => fileId !== id)
        : [...prev, id],
    )
  }

  const handleSelectAll = (allFilesIds: string[]) => {
    setSelectedFiles((prev) =>
      prev.length === allFilesIds.length ? [] : allFilesIds,
    )
  }

  return {
    selectedFiles,
    handleSelectFile,
    handleSelectAll,
  }
}
