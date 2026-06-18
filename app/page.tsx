import { listProjects, countTasks } from "@/lib/store"
import { NovoProjetoDialog } from "@/components/novo-projeto-dialog"
import { ProjetoCard } from "@/components/projeto-card"

export const dynamic = "force-dynamic"

export default function Home() {
  const projects = listProjects()
  const projectsWithCount = projects.map((p) => ({
    ...p,
    taskCount: countTasks(p.id),
  }))

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Seus projetos</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Organize suas ideias e acompanhe o progresso
          </p>
        </div>
        <NovoProjetoDialog />
      </div>

      {projectsWithCount.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-muted-foreground">Nenhum projeto ainda.</p>
          <p className="text-sm text-muted-foreground">
            Clique em &ldquo;+ Novo projeto&rdquo; para começar!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projectsWithCount.map((p) => (
            <ProjetoCard key={p.id} {...p} />
          ))}
        </div>
      )}
    </div>
  )
}
