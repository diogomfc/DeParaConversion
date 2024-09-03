import { Button } from "../ui/button";

// Pagination Component
export function Pagination({ currentPage, totalPages, onPageChange, totalRecords }: any) {
  return (
    <div className="flex justify-between items-center mt-4">
      <div className="text-xs flex gap-2">
        <span className="text-muted-foreground">Total de arquivos:</span>
        <span>{totalRecords}</span>
      </div>
      <div className="flex space-x-2 items-center">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => onPageChange((prev: number) => Math.max(prev - 1, 1))}
          size={"sm"}
        >
          Anterior
        </Button>
        <span className="text-xs">Página {currentPage} de {totalPages}</span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange((prev: number) => Math.min(prev + 1, totalPages))}
          size={"sm"}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}

