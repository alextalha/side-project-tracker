import { beforeEach, describe, expect, it } from "vitest"
import { POST as criarProjetoHandler } from "@/app/api/projetos/route"
import { GET, POST } from "@/app/api/projetos/[id]/tarefas/route"
import { PATCH, DELETE } from "@/app/api/projetos/[id]/tarefas/[taskId]/route"
import { __clearStore } from "@/lib/store"
import { ctx, emptyRequest, jsonRequest } from "./helpers"

beforeEach(() => __clearStore())

async function novoProjeto(name = "Projeto") {
  const res = await criarProjetoHandler(jsonRequest("POST", { name }))
  return (await res.json()).id as string
}

async function novaTarefa(projectId: string, title = "Tarefa") {
  const res = await POST(jsonRequest("POST", { title }), ctx({ id: projectId }))
  return res.json()
}

describe("POST /api/projetos/[id]/tarefas", () => {
  it("cria tarefa e retorna 201", async () => {
    const id = await novoProjeto()
    const res = await POST(jsonRequest("POST", { title: "Tarefa 1" }), ctx({ id }))
    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({ title: "Tarefa 1", done: false, projectId: id })
  })

  it("retorna 404 se o projeto não existe", async () => {
    const res = await POST(jsonRequest("POST", { title: "x" }), ctx({ id: "nao-existe" }))
    expect(res.status).toBe(404)
  })

  it("retorna 400 se o título é vazio", async () => {
    const id = await novoProjeto()
    const res = await POST(jsonRequest("POST", { title: "   " }), ctx({ id }))
    expect(res.status).toBe(400)
  })
})

describe("GET /api/projetos/[id]/tarefas", () => {
  it("lista as tarefas do projeto em ordem de criação", async () => {
    const id = await novoProjeto()
    await novaTarefa(id, "a")
    await novaTarefa(id, "b")
    const res = await GET(emptyRequest("GET"), ctx({ id }))
    expect(res.status).toBe(200)
    const lista = await res.json()
    expect(lista.map((t: { title: string }) => t.title)).toEqual(["a", "b"])
  })
})

describe("PATCH /api/projetos/[id]/tarefas/[taskId]", () => {
  it("sem corpo: alterna o done (toggle) e volta ao alternar de novo", async () => {
    const id = await novoProjeto()
    const t = await novaTarefa(id)

    const res = await PATCH(emptyRequest("PATCH"), ctx({ id, taskId: t.id }))
    expect(res.status).toBe(200)
    expect((await res.json()).done).toBe(true)

    const res2 = await PATCH(emptyRequest("PATCH"), ctx({ id, taskId: t.id }))
    expect((await res2.json()).done).toBe(false)
  })

  it("com { title }: edita o título sem alterar o done", async () => {
    const id = await novoProjeto()
    const t = await novaTarefa(id, "antigo")
    const res = await PATCH(jsonRequest("PATCH", { title: "novo" }), ctx({ id, taskId: t.id }))
    expect(res.status).toBe(200)
    const atualizada = await res.json()
    expect(atualizada.title).toBe("novo")
    expect(atualizada.done).toBe(false)
  })

  it("retorna 400 ao editar com título vazio", async () => {
    const id = await novoProjeto()
    const t = await novaTarefa(id)
    const res = await PATCH(jsonRequest("PATCH", { title: "   " }), ctx({ id, taskId: t.id }))
    expect(res.status).toBe(400)
  })

  it("retorna 404 para tarefa inexistente", async () => {
    const id = await novoProjeto()
    const res = await PATCH(jsonRequest("PATCH", { title: "x" }), ctx({ id, taskId: "nao-existe" }))
    expect(res.status).toBe(404)
  })
})

describe("DELETE /api/projetos/[id]/tarefas/[taskId]", () => {
  it("exclui a tarefa e retorna 204", async () => {
    const id = await novoProjeto()
    const t = await novaTarefa(id)
    const res = await DELETE(emptyRequest("DELETE"), ctx({ id, taskId: t.id }))
    expect(res.status).toBe(204)
  })

  it("retorna 404 se a tarefa não existe", async () => {
    const id = await novoProjeto()
    const res = await DELETE(emptyRequest("DELETE"), ctx({ id, taskId: "nao-existe" }))
    expect(res.status).toBe(404)
  })
})
