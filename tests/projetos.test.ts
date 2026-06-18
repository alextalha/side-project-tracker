import { beforeEach, describe, expect, it } from "vitest"
import { GET, POST } from "@/app/api/projetos/route"
import { PATCH, DELETE } from "@/app/api/projetos/[id]/route"
import { POST as criarTarefa } from "@/app/api/projetos/[id]/tarefas/route"
import { __clearStore, getProject, listTasks } from "@/lib/store"
import { ctx, emptyRequest, jsonRequest } from "./helpers"

beforeEach(() => __clearStore())

async function criarProjeto(name = "Projeto", description = "") {
  const res = await POST(jsonRequest("POST", { name, description }))
  return res.json()
}

describe("POST /api/projetos", () => {
  it("cria um projeto e retorna 201", async () => {
    const res = await POST(jsonRequest("POST", { name: "Meu app", description: "uma ideia" }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toMatchObject({ name: "Meu app", description: "uma ideia" })
    expect(body.done).toBeUndefined()
    expect(typeof body.id).toBe("string")
    expect(getProject(body.id)).toBeDefined()
  })

  it("faz trim do nome e aceita descrição ausente", async () => {
    const body = await criarProjeto("  Com espaços  ")
    expect(body.name).toBe("Com espaços")
    expect(body.description).toBe("")
  })

  it("retorna 400 quando o nome é vazio", async () => {
    const res = await POST(jsonRequest("POST", { name: "   " }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBeTruthy()
  })
})

describe("GET /api/projetos", () => {
  it("lista projetos incluindo taskCount", async () => {
    const p = await criarProjeto("Com tarefas")
    await criarTarefa(jsonRequest("POST", { title: "t1" }), ctx({ id: p.id }))
    await criarTarefa(jsonRequest("POST", { title: "t2" }), ctx({ id: p.id }))

    const res = await GET()
    expect(res.status).toBe(200)
    const lista = await res.json()
    expect(lista).toHaveLength(1)
    expect(lista[0].id).toBe(p.id)
    expect(lista[0].taskCount).toBe(2)
  })

  it("ordena por mais recente primeiro", async () => {
    const a = await criarProjeto("A")
    await new Promise((r) => setTimeout(r, 5))
    const b = await criarProjeto("B")
    const lista = await (await GET()).json()
    expect(lista.map((p: { id: string }) => p.id)).toEqual([b.id, a.id])
  })
})

describe("PATCH /api/projetos/[id]", () => {
  it("edita nome e descrição (200)", async () => {
    const p = await criarProjeto("Antigo", "desc antiga")
    const res = await PATCH(jsonRequest("PATCH", { name: "Novo", description: "desc nova" }), ctx({ id: p.id }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ id: p.id, name: "Novo", description: "desc nova" })
    expect(getProject(p.id)?.name).toBe("Novo")
  })

  it("retorna 400 sem nome", async () => {
    const p = await criarProjeto()
    const res = await PATCH(jsonRequest("PATCH", { name: "" }), ctx({ id: p.id }))
    expect(res.status).toBe(400)
  })

  it("retorna 404 para projeto inexistente", async () => {
    const res = await PATCH(jsonRequest("PATCH", { name: "X" }), ctx({ id: "nao-existe" }))
    expect(res.status).toBe(404)
  })
})

describe("DELETE /api/projetos/[id]", () => {
  it("exclui o projeto e suas tarefas (cascade) e retorna 204", async () => {
    const p = await criarProjeto()
    await criarTarefa(jsonRequest("POST", { title: "t" }), ctx({ id: p.id }))

    const res = await DELETE(emptyRequest("DELETE"), ctx({ id: p.id }))
    expect(res.status).toBe(204)
    expect(getProject(p.id)).toBeUndefined()
    expect(listTasks(p.id)).toHaveLength(0)
  })

  it("retorna 404 quando o projeto não existe", async () => {
    const res = await DELETE(emptyRequest("DELETE"), ctx({ id: "nao-existe" }))
    expect(res.status).toBe(404)
  })
})
