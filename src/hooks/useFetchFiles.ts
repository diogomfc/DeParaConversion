import { useQuery } from "@tanstack/react-query";

type FileRecord = {
  id: string;
  fileName: string;
  description: string;
  status: string;
  prioridade: string;
  createdAt: string;
};

const fetchFiles = async (): Promise<FileRecord[]> => {
  const response = await fetch("/api/files/list");
  if (!response.ok) {
    throw new Error("Erro ao buscar os arquivos.");
  }
  return response.json();
};

export const useFetchFiles = () => {
  return useQuery<FileRecord[], Error>({
    queryKey: ["files"],
    queryFn: fetchFiles,
  });
};
