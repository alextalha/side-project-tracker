import { NextResponse } from "next/server"
import { toggleTask, deleteTask, updateTask } from "@/lib/store"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id, taskId } = await params

  // O toggle envia PATCH sem body; a edição de título envia { title }.
  let body: { title?: string } = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  if (typeof body.title === "string") {
    if (!body.title.trim()) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 })
    }
    const task = updateTask(id, taskId, body.title.trim())
    if (!task) return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    return NextResponse.json(task)
  }

  const task = toggleTask(id, taskId)
  if (!task) return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
  return NextResponse.json(task)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id, taskId } = await params
  const ok = deleteTask(id, taskId)
  if (!ok) return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
