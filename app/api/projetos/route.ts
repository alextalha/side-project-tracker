import { NextResponse } from "next/server"
import { listProjects, createProject, countTasks } from "@/lib/store"
import { readJson } from "@/lib/http"

export async function GET() {
  const projects = listProjects()
  const data = projects.map((p) => ({ ...p, taskCount: countTasks(p.id) }))
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { name, description } = await readJson(request)
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
  }
  const desc = typeof description === "string" ? description.trim() : ""
  const project = createProject(name.trim(), desc)
  return NextResponse.json(project, { status: 201 })
}
