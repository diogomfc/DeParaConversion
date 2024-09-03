import Image from "next/image";
import { Checkbox } from "../ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DownloadIcon, Flame, MoreVerticalIcon, PencilIcon, Rocket, TrashIcon } from "lucide-react";
import { Button } from "../ui/button";
import { formatDate } from "@/utils/dateUtils";
import { FileRecord } from ".";

export function TableFile({ files, selectedFiles, onSelectFile, onSelectAll, onDelete, onDownload }: any) {
  return (
    <Table className="border border-gray-200">
      <TableHeader className="bg-gray-100">
        <TableRow>
          <TableHead className="w-[50px] pl-6">
            <Checkbox
              checked={selectedFiles.length === files.length}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Prioridade</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file: FileRecord) => (
          <TableRow key={file.id}>
            <TableCell className="pl-6">
              <Checkbox
                checked={selectedFiles.includes(file.id)}
                onCheckedChange={() => onSelectFile(file.id)}
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <Image
                  src="/icon-csv.svg"
                  alt="CSV Icon"
                  width={16}
                  height={16}
                  className="mr-2"
                />
                {file.fileName}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <Rocket className="mr-2 h-4 w-4" />
                {file.status}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <Flame className="mr-2 h-4 w-4" />
                {file.prioridade}
              </div>
            </TableCell>
            <TableCell>{formatDate(file.createdAt)}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => onDownload([file.id])}>
                <DownloadIcon className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon">
                <PencilIcon className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" onClick={() => onDelete(file.id)}>
                <TrashIcon className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}