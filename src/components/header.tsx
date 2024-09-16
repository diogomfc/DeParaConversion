import Image from 'next/image'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b">
      <Link href="#" className="flex items-center gap-2" prefetch={false}>
        <Image src="/logoDepara2.svg" alt="DePara" width={100} height={100} />
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <>
            <div className="flex gap-3 items-center">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage
                    src={`https://github.com/`}
                    // src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${Math.random()}`}
                    alt="Avatar"
                    className="h-full w-full rounded-full object-cover"
                  />
                  <AvatarFallback>DS</AvatarFallback>
                </Avatar>
              </Button>
              <div className="flex flex-col">
                <div className="font-semibold">Diogo Silva</div>
                <div className="text-xs text-muted-foreground">
                  diogo.silva@eccox.com.br
                </div>
              </div>
            </div>
          </>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
              <AvatarFallback>DS</AvatarFallback>
            </Avatar>
            <div className="grid gap-0.5 leading-none">
              <div className="font-semibold">Diogo Silva</div>
              <div className="text-sm text-muted-foreground">
                diogo.silva@eccox.com.br
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="#" className="flex items-center gap-2" prefetch={false}>
              <div className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="#" className="flex items-center gap-2" prefetch={false}>
              <div className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="#" className="flex items-center gap-2" prefetch={false}>
              <div className="h-4 w-4" />
              <span>Sign out</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
