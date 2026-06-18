import { NextResponse } from "next/server"
import { deleteProject, updateProject } from "@/lib/store"
import { readJson } from "@/lib/http"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { name, description } = await readJson(request)
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
  }
  const desc = typeof description === "string" ? description.trim() : ""
  const project = updateProject(id, name.trim(), desc)
  if (!project) {
    return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
  }
  return NextResponse.json(project)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ok = deleteProject(id)
  if (!ok) return NextResponse.json({ error: "Projeto não encontrado" }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
