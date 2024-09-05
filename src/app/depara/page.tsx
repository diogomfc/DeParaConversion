'use client'

import { TableFileHome } from '@/components/file'
import UploaderFile from '@/components/file/uploader-file'
import { Header } from '@/components/header'

export default function NewPageDepara() {
  return (
    <div className="container mx-auto p-4">
      <Header />
      <UploaderFile />
      <TableFileHome />
    </div>
  )
}
