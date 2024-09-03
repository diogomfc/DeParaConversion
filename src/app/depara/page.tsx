"use client"

import { TableFileHome } from "@/components/file";
import { TableFile } from "@/components/file/table-file";
import UploaderFile from "@/components/file/uploader-file";

export default function NewPageDepara() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">DePara</h1>
      <UploaderFile />
      <TableFileHome />
    </div>
  );
}
