"use client";

//TODO: Único arquivo
import { useMutation, useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FolderIcon, Rocket, Flame, DownloadIcon, PencilIcon, TrashIcon, MoreVerticalIcon } from "lucide-react";
import Image from "next/image";
import { queryClient } from "@/lib/react-query";
import { useState } from "react";

import { formatDate } from "@/utils/dateUtils";
import { Checkbox } from "../ui/checkbox";

import axios from 'axios';
import { saveAs } from 'file-saver';

type FileRecord = {
  id: string;
  fileName: string;
  description: string;
  status: string;
  prioridade: string;
  createdAt: string;
};

export function TableFile() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const recordsPerPage = 10;

  const fetchFiles = async (): Promise<FileRecord[]> => {
    const response = await fetch("/api/files/list");
    if (!response.ok) {
      throw new Error("Erro ao buscar os arquivos.");
    }
    return response.json();
  };

  const { data: files } = useQuery<FileRecord[], Error>({
    queryKey: ["files"],
    queryFn: fetchFiles,
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/files/${id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar o arquivo.");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  const handleDelete = (id: string) => {
    deleteFileMutation.mutate(id);
  };

  const handleDownload = async (ids: string[]) => {
    try {
      for (const id of ids) {
        const response = await axios.get(`/api/files/${id}/download`, {
          responseType: 'blob',
        });

        if (response.status !== 200) {
          throw new Error(`Erro ao fazer o download do arquivo. Status: ${response.status}. Detalhes: ${response.statusText}`);
        }

        const fileRecord = files?.find(file => file.id === id);
        const fileName = fileRecord?.fileName ?? 'download.csv';

        saveAs(new Blob([response.data]), fileName);
      }
    } catch (error) {
      console.error("Erro ao fazer o download dos arquivos:", error);
    }
  };

  const handleSelectFile = (id: string) => {
    setSelectedFiles((prev) =>
      prev.includes(id)
        ? prev.filter((fileId) => fileId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === paginatedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(paginatedFiles.map((file) => file.id));
    }
  };


  if (!files) {
    return <div>Carregando arquivos...</div>;
  }

  // Lógica de paginação
  const totalRecords = files.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const paginatedFiles = files.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Button
          variant="outline"
          onClick={() => handleDownload(selectedFiles)}
          disabled={selectedFiles.length === 0}
        >
          Download Selecionados
        </Button>
      </div>
      <Table className="border border-gray-200">
        <TableHeader className="bg-gray-100">
          <TableRow className="">
            <TableHead className="w-[50px] pl-6">
              <Checkbox
                checked={selectedFiles.length === paginatedFiles.length}
                onCheckedChange={handleSelectAll}
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
          {paginatedFiles.map((file, index) => (
            <TableRow key={file.id}>
              <TableCell className=" pl-6">
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={() => handleSelectFile(file.id)}
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
              <TableCell className="">{formatDate(file.createdAt)}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => handleDownload([file.id])}>
                  <DownloadIcon className=" h-4 w-4" />
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
                  onClick={() => handleDelete(file.id)}
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

      <div className="flex justify-between items-center mt-4">
        <div className="text-xs flex gap-2">
          <span className="text-muted-foreground">Total de arquivos:</span>
          <span className="" >{totalRecords}</span>
        </div>
        <div className="flex space-x-2 items-center">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            size={"sm"}
          >
            Anterior
          </Button>
          <span className="text-xs">Página {currentPage} de {totalPages}</span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            size={"sm"}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}

//TODO: opção com ZIP
// "use client";

// import { useMutation, useQuery } from "@tanstack/react-query";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { FolderIcon, Rocket, Flame, DownloadIcon, PencilIcon, TrashIcon, MoreVerticalIcon } from "lucide-react";
// import Image from "next/image";
// import { queryClient } from "@/lib/react-query";
// import { useState } from "react";

// import { formatDate } from "@/utils/dateUtils";
// import { Checkbox } from "../ui/checkbox";

// import axios from 'axios';
// import { saveAs } from 'file-saver';

// type FileRecord = {
//   id: string;
//   fileName: string;
//   description: string;
//   status: string;
//   prioridade: string;
//   createdAt: string;
// };

// export function TableFile() {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
//   const recordsPerPage = 20;

//   const fetchFiles = async (): Promise<FileRecord[]> => {
//     const response = await fetch("/api/files/list");
//     if (!response.ok) {
//       throw new Error("Erro ao buscar os arquivos.");
//     }
//     return response.json();
//   };

//   const { data: files } = useQuery<FileRecord[], Error>({
//     queryKey: ["files"],
//     queryFn: fetchFiles,
//   });

//   const deleteFileMutation = useMutation({
//     mutationFn: async (id: string) => {
//       const response = await fetch(`/api/files/${id}/delete`, {
//         method: 'DELETE',
//       });

//       if (!response.ok) {
//         throw new Error("Erro ao deletar o arquivo.");
//       }

//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["files"] });
//     },
//   });

//   const handleDelete = (id: string) => {
//     deleteFileMutation.mutate(id);
//   };

//   const handleDownload = async (ids: string[]) => {
//     try {
//       // Verifica se há mais de um arquivo selecionado
//       if (ids.length > 1) {
//         // Faz uma requisição para a API para gerar o ZIP com os arquivos
//         const response = await axios.get(`/api/files/download`, {
//           params: { ids },
//           responseType: 'blob',
//         });

//         if (response.status !== 200) {
//           throw new Error(`Erro ao fazer o download dos arquivos. Status: ${response.status}. Detalhes: ${response.statusText}`);
//         }

//         // Salva o arquivo ZIP usando file-saver
//         saveAs(response.data, 'arquivos.zip');
//       } else {
//         // Faz uma requisição para a API para download do arquivo individual
//         const id = ids[0];
//         const fileRecord = files?.find(file => file.id === id);
//         const fileName = fileRecord?.fileName ?? 'download.csv';

//         const response = await axios.get(`/api/files/${id}/download`, {
//           responseType: 'blob',
//         });

//         if (response.status !== 200) {
//           throw new Error(`Erro ao fazer o download do arquivo. Status: ${response.status}. Detalhes: ${response.statusText}`);
//         }

//         // Salva o arquivo individual usando file-saver
//         saveAs(response.data, fileName);
//       }
//     } catch (error) {
//       console.error("Erro ao fazer o download dos arquivos:", error);
//     }
//   };

//   const handleSelectFile = (id: string) => {
//     setSelectedFiles((prev) =>
//       prev.includes(id)
//         ? prev.filter((fileId) => fileId !== id)
//         : [...prev, id]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectedFiles.length === paginatedFiles.length) {
//       setSelectedFiles([]);
//     } else {
//       setSelectedFiles(paginatedFiles.map((file) => file.id));
//     }
//   };

//   if (!files) {
//     return <div>Carregando arquivos...</div>;
//   }

//   // Lógica de paginação
//   const totalRecords = files.length;
//   const totalPages = Math.ceil(totalRecords / recordsPerPage);
//   const paginatedFiles = files.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

//   return (
//     <div>
//       <div className="flex justify-between mb-4">
//         <Button
//           variant="outline"
//           onClick={() => handleDownload(selectedFiles)}
//           disabled={selectedFiles.length === 0}
//         >
//           Download Selecionados
//         </Button>
//       </div>
//       <Table className="border border-gray-200">
//         <TableHeader className="bg-gray-100">
//           <TableRow>
//             <TableHead className="w-[50px] pl-6">
//               <Checkbox
//                 checked={selectedFiles.length === paginatedFiles.length}
//                 onCheckedChange={handleSelectAll}
//               />
//             </TableHead>
//             <TableHead>Nome</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Prioridade</TableHead>
//             <TableHead>Criado em</TableHead>
//             <TableHead className="w-[50px]"></TableHead>
//             <TableHead className="w-[50px]"></TableHead>
//             <TableHead className="w-[50px]"></TableHead>
//             <TableHead className="w-[50px]"></TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {paginatedFiles.map((file) => (
//             <TableRow key={file.id}>
//               <TableCell className="pl-6">
//                 <Checkbox
//                   checked={selectedFiles.includes(file.id)}
//                   onCheckedChange={() => handleSelectFile(file.id)}
//                 />
//               </TableCell>

//               <TableCell>
//                 <div className="flex items-center">
//                   <Image
//                     src="/icon-csv.svg"
//                     alt="CSV Icon"
//                     width={16}
//                     height={16}
//                     className="mr-2"
//                   />
//                   {file.fileName}
//                 </div>
//               </TableCell>
//               <TableCell>
//                 <div className="flex items-center">
//                   <Rocket className="mr-2 h-4 w-4" />
//                   {file.status}
//                 </div>
//               </TableCell>
//               <TableCell>
//                 <div className="flex items-center">
//                   <Flame className="mr-2 h-4 w-4" />
//                   {file.prioridade}
//                 </div>
//               </TableCell>
//               <TableCell>{formatDate(file.createdAt)}</TableCell>
//               <TableCell>
//                 <Button variant="outline" size="sm" onClick={() => handleDownload([file.id])}>
//                   <DownloadIcon className="h-4 w-4" />
//                 </Button>
//               </TableCell>
//               <TableCell>
//                 <Button variant="ghost" size="icon">
//                   <PencilIcon className="h-4 w-4" />
//                 </Button>
//               </TableCell>
//               <TableCell>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={() => handleDelete(file.id)}
//                 >
//                   <TrashIcon className="h-4 w-4" />
//                 </Button>
//               </TableCell>
//               <TableCell>
//                 <Button variant="ghost" size="icon">
//                   <MoreVerticalIcon className="h-4 w-4" />
//                 </Button>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>

//       <div className="flex justify-between items-center mt-4">
//         <div className="text-xs flex gap-2">
//           <span className="text-muted-foreground">Total de arquivos:</span>
//           <span>{totalRecords}</span>
//         </div>
//         <div className="flex space-x-2 items-center">
//           <Button
//             variant="outline"
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//             size={"sm"}
//           >
//             Anterior
//           </Button>
//           <span className="text-xs">Página {currentPage} de {totalPages}</span>
//           <Button
//             variant="outline"
//             disabled={currentPage === totalPages}
//             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//             size={"sm"}
//           >
//             Próxima
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
