import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, CalendarOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from 'date-fns/locale';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatFilterDate } from '@/utils/dateUtils';
import { useEffect } from "react";

const FormSchema = z.object({
  selectedDate: z.date().optional(),
});

interface DateFilterProps {
  onDateChange: (date: Date | undefined) => void;
  handleClearFilter: () => void;
  searchTerm: string; // Recebe o searchTerm para monitorar mudanças
}

export function DateFilter({ onDateChange, handleClearFilter, searchTerm }: DateFilterProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  // Resetar o campo de data quando o termo de busca for alterado
  useEffect(() => {
    if (searchTerm) {
      form.reset(); // Limpa o campo de data
    }
  }, [searchTerm, form]);

  const handleDateChange = (date: Date | undefined) => {
    form.setValue('selectedDate', date);
    onDateChange(date);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    form.reset();
    handleClearFilter();
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="selectedDate"
          render={({ field }) => (
            <FormItem>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <span>
                        {field.value ? formatFilterDate(field.value) : 'Selecione uma data'}
                      </span>
                      {field.value ? (
                        // Se houver uma data selecionada, mostra o ícone de limpar
                        <CalendarOff
                          className="ml-auto h-4 w-4 opacity-50"
                          onClick={handleClear} // Limpa a data
                        />
                      ) : (
                        // Se não houver uma data, mostra o ícone de calendário
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>

                {/* Exibe o calendário ao clicar */}
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={field.value}
                    onSelect={handleDateChange}
                    disabled={(date) => date > new Date()} // Desabilitar datas futuras
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
