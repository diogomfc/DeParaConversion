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