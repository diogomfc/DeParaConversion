import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para o formato "31 de ago 2024 às 20:14" em português.
 * @param dateString - A string de data a ser formatada.
 * @returns A data formatada.
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, "d 'de' MMM yyyy 'às' HH:mm", { locale: ptBR });
};

/**
 * Gera um nome de arquivo ZIP no formato "dePara-ddMMyyyy-HHmm.zip".
 * @returns O nome do arquivo ZIP.
 */
export const generateZipFilename = (): string => {
  const now = new Date();
  const datePart = format(now, 'ddMMyyyy', { locale: ptBR });
  const timePart = format(now, 'HHmm', { locale: ptBR });
  return `dePara-${datePart}-${timePart}.zip`;
};