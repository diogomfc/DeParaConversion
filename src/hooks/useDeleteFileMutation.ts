import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteFile = async (id: string): Promise<void> => {
 const response = await fetch(`/api/files/${id}/delete`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error("Erro ao deletar o arquivo.");
  }
};

export const useDeleteFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};
