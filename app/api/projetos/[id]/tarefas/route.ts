import { NextResponse } from "next/server"
import { listTasks, createTask, getProject } from "@/lib/store"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return NextResponse.json(listTasks(id))
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!getProject(id)) {
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
  }
  const body = await request.json()
  const { title } = body
  if (!title?.trim()) {
    return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 })
  }
  const task = createTask(id, title.trim())
  return NextResponse.json(task, { status: 201 })
}
