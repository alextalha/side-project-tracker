import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { getProject, listTasks, countCompletedTasks } from "@/lib/store"
import { ListaTarefas } from "@/components/lista-tarefas"
import { EditarProjetoDialog } from "@/components/editar-projeto-dialog"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjetoPage({ params }: Props) {
  const { id } = await params
  const project = getProject(id)
  if (!project) notFound()

  const tasks = listTasks(id)
  const completed = countCompletedTasks(id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-4">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground -ml-3")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Link>
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <EditarProjetoDialog
              id={project.id}
              name={project.name}
              description={project.description}
            />
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
          {tasks.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {completed} de {tasks.length} {tasks.length === 1 ? "tarefa concluída" : "tarefas concluídas"}
            </p>
          )}
        </div>
      </div>

      <ListaTarefas projectId={id} initialTasks={tasks} />
    </div>
  )
}
