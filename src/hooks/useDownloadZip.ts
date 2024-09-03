import { generateZipFilename } from '@/utils/dateUtils';
import { useCallback } from 'react';

export function useDownloadZip(files: { id: string; fileName: string }[]) {
  const handleDownload = useCallback(async (ids: string[]) => {
    // Cria a URL da API com os IDs dos arquivos
    const response = await fetch(`/api/files/download-zip/${ids.join(',')}`);

    if (!response.ok) {
      throw new Error('Erro ao baixar arquivos.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Gera o nome do arquivo ZIP com base na data e hora atuais
    const zipFilename = generateZipFilename();
    a.download = zipFilename; // Define o nome dinâmico para o arquivo zip

    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  return { handleDownload };
}