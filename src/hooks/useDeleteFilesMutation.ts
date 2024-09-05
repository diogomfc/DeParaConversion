import { useMutation, useQueryClient } from '@tanstack/react-query'

// Função para deletar múltiplos arquivos
const deleteFiles = async (ids: string[]): Promise<void> => {
  // Construa a URL com os IDs
  const url = `/api/files/delete/${ids.join('/')}`

  const response = await fetch(url, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Erro ao deletar os arquivos.')
  }
}

// Hook para usar a função de deletar arquivos
export const useDeleteFilesMutation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string[]>({
    mutationFn: deleteFiles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
    },
  })
}
