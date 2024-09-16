/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AlertCircle,
  DownloadIcon,
  Flame,
  MoreVerticalIcon,
  PencilIcon,
  Rocket,
  TrashIcon,
  TriangleAlert,
} from 'lucide-react'
import Image from 'next/image'

import { formatDate } from '@/utils/dateUtils'

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { FileRecord } from '.'

export function TableFile({
  files,
  selectedFiles,
  onSelectFile,
  onSelectAll,
  onDelete,
  onDownload,
}: any) {
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
          <TableHead>
            <div className="flex items-center justify-center">Status</div>
          </TableHead>
          <TableHead className="">
            <div className=" flex items-center justify-center">Prioridade</div>
          </TableHead>
          <TableHead>Criado por</TableHead>
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
              <div className="flex items-center justify-center">
                {/* {file.status === 'Conferido' ? (
                  <Rocket className="mr-2 h-4 w-4 text-green-500" />
                ) : file.status === 'Atenção' ? (
                  <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                ) : null}
                {file.status} */}

                {file.status === 'Conferido' ? (
                  <Rocket className="mr-2 h-4 w-4 text-green-500" />
                ) : file.status === 'Conferido-Multi' ? (
                  <Rocket className="mr-2 h-4 w-4 text-blue-500" />
                ) : file.status === 'Atenção' ? (
                  <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                ) : file.status === 'Atenção-Multi' ? (
                  <AlertCircle className="mr-2 h-4 w-4 text-orange-500" />
                ) : file.status === 'Atenção-PK' ? (
                  <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                ) : file.status === 'Atenção-Sobreposição' ? (
                  <TriangleAlert className="mr-2 h-4 w-4 text-purple-500" />
                ) : null}
                {file.status}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-center">
                <Flame className="mr-2 h-4 w-4 text-red-400" />
                {/* {file.prioridade} */}
                Alta
              </div>
            </TableCell>

            <TableCell>
              <div className="flex gap-3 items-center">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage
                      src={`https://github.com/`}
                      alt="Avatar"
                      className="h-full w-full rounded-full object-cover"
                    />
                    <AvatarFallback>DS</AvatarFallback>
                  </Avatar>
                </Button>
                <div className="flex flex-col">
                  <div className="font-normal">Diogo Silva</div>
                  <div className="text-xs text-muted-foreground">
                    diogo.silva@eccox.com.br
                  </div>
                </div>
              </div>
            </TableCell>

            <TableCell>{formatDate(file.createdAt)}</TableCell>

            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload([file.id])}
              >
                <DownloadIcon className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon">
                <PencilIcon className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  console.log('Deletar arquivo com ID:', file.id)
                  onDelete(file.id)
                }}
              >
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
  )
}
