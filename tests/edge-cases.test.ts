import { beforeEach, describe, expect, it } from "vitest"
import { POST as criarProjeto } from "@/app/api/projetos/route"
import { PATCH as editarProjeto } from "@/app/api/projetos/[id]/route"
import { POST as criarTarefa } from "@/app/api/projetos/[id]/tarefas/route"
import { PATCH as editarTarefa } from "@/app/api/projetos/[id]/tarefas/[taskId]/route"
import { __clearStore, createProject, createTask } from "@/lib/store"
import { ctx, emptyRequest, jsonRequest } from "./helpers"

beforeEach(() => __clearStore())

/** Request com Content-Type JSON mas corpo sintaticamente inválido. */
function brokenJsonRequest(method: string): Request {
  return new Request("http://test/api", {
    method,
    headers: { "Content-Type": "application/json" },
    body: "{ isto não é json",
  })
}

describe("corpo ausente ou inválido não derruba o handler", () => {
  it("POST /api/projetos sem corpo → 400", async () => {
    const res = await criarProjeto(emptyRequest("POST"))
    expect(res.status).toBe(400)
  })

  it("POST /api/projetos com JSON inválido → 400", async () => {
    const res = await criarProjeto(brokenJsonRequest("POST"))
    expect(res.status).toBe(400)
  })

  it("PATCH /api/projetos/[id] sem corpo → 400", async () => {
    const p = createProject("P", "")
    const res = await editarProjeto(emptyRequest("PATCH"), ctx({ id: p.id }))
    expect(res.status).toBe(400)
  })

  it("POST tarefas sem corpo (projeto válido) → 400", async () => {
    const p = createProject("P", "")
    const res = await criarTarefa(emptyRequest("POST"), ctx({ id: p.id }))
    expect(res.status).toBe(400)
  })
})

describe("tipos inválidos são rejeitados", () => {
  it("name numérico → 400", async () => {
    const res = await criarProjeto(jsonRequest("POST", { name: 123 }))
    expect(res.status).toBe(400)
  })

  it("title null → 400", async () => {
    const p = createProject("P", "")
    const res = await criarTarefa(jsonRequest("POST", { title: null }), ctx({ id: p.id }))
    expect(res.status).toBe(400)
  })

  it("PATCH tarefa com title não-string presente → 400 (não faz toggle)", async () => {
    const p = createProject("P", "")
    const t = createTask(p.id, "x")
    const res = await editarTarefa(jsonRequest("PATCH", { title: 42 }), ctx({ id: p.id, taskId: t.id }))
    expect(res.status).toBe(400)
  })
})

describe("isolamento entre projetos", () => {
  it("PATCH tarefa usando taskId de OUTRO projeto → 404", async () => {
    const p1 = createProject("P1", "")
    const p2 = createProject("P2", "")
    const t = createTask(p1.id, "tarefa do p1")
    const res = await editarTarefa(jsonRequest("PATCH", { title: "novo" }), ctx({ id: p2.id, taskId: t.id }))
    expect(res.status).toBe(404)
  })

  it("DELETE tarefa usando taskId de OUTRO projeto → 404", async () => {
    const p1 = createProject("P1", "")
    const p2 = createProject("P2", "")
    const t = createTask(p1.id, "tarefa do p1")
    const { DELETE } = await import("@/app/api/projetos/[id]/tarefas/[taskId]/route")
    const res = await DELETE(emptyRequest("DELETE"), ctx({ id: p2.id, taskId: t.id }))
    expect(res.status).toBe(404)
  })
})
