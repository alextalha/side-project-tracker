import { NextResponse } from "next/server"
import { listProjects, createProject, countTasks } from "@/lib/store"

export async function GET() {
  const projects = listProjects()
  const data = projects.map((p) => ({ ...p, taskCount: countTasks(p.id) }))
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, description } = body
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
  }
  const project = createProject(name.trim(), description?.trim() ?? "")
  return NextResponse.json(project, { status: 201 })
}
