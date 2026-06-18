"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Pencil, Check, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Task {
  id: string
  title: string
  done: boolean
}

interface ListaTarefasProps {
  projectId: string
  initialTasks: Task[]
}

export function ListaTarefas({ projectId, initialTasks }: ListaTarefasProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!title.trim()) {
      setError("Título é obrigatório")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/projetos/${projectId}/tarefas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Erro ao criar tarefa")
        return
      }
      const task = await res.json()
      setTasks((prev) => [...prev, task])
      setTitle("")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(taskId: string) {
    const res = await fetch(`/api/projetos/${projectId}/tarefas/${taskId}`, {
      method: "PATCH",
    })
    if (!res.ok) return
    const updated = await res.json()
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
    router.refresh()
  }

  async function handleDelete(taskId: string) {
    await fetch(`/api/projetos/${projectId}/tarefas/${taskId}`, {
      method: "DELETE",
    })
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    router.refresh()
  }

  function startEdit(task: Task) {
    setEditingId(task.id)
    setEditTitle(task.title)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle("")
  }

  async function handleEditSave(taskId: string) {
    if (!editTitle.trim()) {
      cancelEdit()
      return
    }
    const res = await fetch(`/api/projetos/${projectId}/tarefas/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle }),
    })
    if (res.ok) {
      const updated = await res.json()
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)))
      router.refresh()
    }
    cancelEdit()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex gap-2">
        <div className="flex-1 space-y-1">
          <Label htmlFor="new-task" className="sr-only">
            Nova tarefa
          </Label>
          <Input
            id="new-task"
            placeholder="Nova tarefa…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "…" : "Adicionar"}
        </Button>
      </form>

      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          Nenhuma tarefa ainda. Adicione a primeira acima!
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-md border px-3 py-2"
            >
              <Checkbox
                id={task.id}
                checked={task.done}
                onCheckedChange={() => handleToggle(task.id)}
              />
              {editingId === task.id ? (
                <>
                  <Input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleEditSave(task.id)
                      } else if (e.key === "Escape") {
                        cancelEdit()
                      }
                    }}
                    className="flex-1 h-7"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditSave(task.id)}
                    className="h-6 w-6"
                    title="Salvar"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cancelEdit}
                    className="h-6 w-6"
                    title="Cancelar"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <label
                    htmlFor={task.id}
                    className={`flex-1 text-sm cursor-pointer ${
                      task.done ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {task.title}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(task)}
                    className="h-6 w-6"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(task.id)}
                    className="text-destructive hover:text-destructive h-6 w-6"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
