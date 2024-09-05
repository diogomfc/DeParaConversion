import { CircleAlert, FilterX, Rocket, TriangleAlert } from 'lucide-react'
import * as React from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StatusFilterProps {
  selectedStatus: string
  onStatusChange: (status: string) => void
}

export function StatusFilter({
  selectedStatus,
  onStatusChange,
}: StatusFilterProps) {
  return (
    <Select value={selectedStatus} onValueChange={onStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione o status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Status</SelectLabel>
          <SelectItem value="Todos">
            <div className="flex gap-2 items-center text-muted-foreground">
              <FilterX size={16} />
              <span>Todos</span>
            </div>
          </SelectItem>
          <SelectItem value="Conferido">
            <div className="flex gap-2 items-center">
              <Rocket size={16} className="text-green-500" />
              <span>Conferido</span>
            </div>
          </SelectItem>
          <SelectItem value="Atenção">
            <div className="flex gap-2 items-center">
              <CircleAlert size={16} className="text-yellow-500" />
              <span>Atenção</span>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
