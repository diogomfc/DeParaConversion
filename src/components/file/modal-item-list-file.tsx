'use client'

import { motion } from 'framer-motion'
import { TrashIcon } from 'lucide-react'
import Image from 'next/image'

import { Button } from '../ui/button'

interface FileItemProps {
  file: File
  progress: number
  onRemove: () => void
}

export function ModalItemListFile({ file, progress, onRemove }: FileItemProps) {
  return (
    <motion.div
      className="flex items-center justify-between w-full bg-gray-100 p-3 rounded-lg shadow-sm"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="flex-1 ">
        <div className="flex items-center gap-2">
          <Image src="/icon-csv.svg" alt="CSV Icon" width={22} height={22} />
          <p className="text-sm text-gray-700">{file.name}</p>
        </div>
        <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
          <motion.div
            className="bg-blue-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
      <Button
        variant={'ghost'}
        className="ml-4 text-red-500 hover:text-red-700"
        onClick={onRemove}
      >
        <TrashIcon className="w-5 h-5" />
      </Button>
    </motion.div>
  )
}
