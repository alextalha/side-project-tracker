"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProjetoCardProps {
  id: string
  name: string
  description: string
  taskCount: number
}

export function ProjetoCard({ id, name, description, taskCount }: ProjetoCardProps) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Excluir "${name}"? Todas as tarefas serão removidas.`)) return
    await fetch(`/api/projetos/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">
            <Link href={`/projetos/${id}`} className="hover:underline">
              {name}
            </Link>
          </CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {taskCount} {taskCount === 1 ? "tarefa" : "tarefas"}
          </Badge>
        </div>
        {description && (
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        )}
      </CardHeader>
      <CardFooter className="justify-between gap-2">
        <Link
          href={`/projetos/${id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Ver tarefas →
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDelete} 
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
