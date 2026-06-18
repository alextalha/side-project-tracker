import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  __clearStore,
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  createTask,
  listTasks,
  toggleTask,
  updateTask,
  deleteTask,
  countTasks,
  countCompletedTasks,
} from "@/lib/store"

beforeEach(() => __clearStore())
afterEach(() => vi.useRealTimers())

describe("projetos (store)", () => {
  it("cria e recupera por id", () => {
    const p = createProject("App", "ideia")
    expect(getProject(p.id)).toEqual(p)
    expect(typeof p.id).toBe("string")
    expect(typeof p.createdAt).toBe("string")
  })

  it("listProjects ordena por mais recente primeiro", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
    const a = createProject("A", "")
    vi.setSystemTime(new Date("2026-01-02T00:00:00Z"))
    const b = createProject("B", "")
    expect(listProjects().map((p) => p.id)).toEqual([b.id, a.id])
  })

  it("updateProject altera campos; undefined se não existe", () => {
    const p = createProject("Old", "x")
    expect(updateProject(p.id, "New", "y")).toMatchObject({ name: "New", description: "y" })
    expect(getProject(p.id)?.name).toBe("New")
    expect(updateProject("nao-existe", "z", "")).toBeUndefined()
  })

  it("deleteProject remove o projeto e suas tarefas (cascade)", () => {
    const p = createProject("P", "")
    createTask(p.id, "t1")
    createTask(p.id, "t2")
    expect(deleteProject(p.id)).toBe(true)
    expect(getProject(p.id)).toBeUndefined()
    expect(listTasks(p.id)).toHaveLength(0)
    expect(deleteProject(p.id)).toBe(false)
  })
})

describe("tarefas (store)", () => {
  it("createTask começa com done=false e vincula o projectId", () => {
    const p = createProject("P", "")
    expect(createTask(p.id, "Tarefa")).toMatchObject({
      projectId: p.id,
      title: "Tarefa",
      done: false,
    })
  })

  it("listTasks ordena por mais antiga primeiro e filtra por projeto", () => {
    vi.useFakeTimers()
    const p = createProject("P", "")
    const q = createProject("Q", "")
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
    const t1 = createTask(p.id, "t1")
    vi.setSystemTime(new Date("2026-01-02T00:00:00Z"))
    const t2 = createTask(p.id, "t2")
    createTask(q.id, "de outro projeto")
    expect(listTasks(p.id).map((t) => t.id)).toEqual([t1.id, t2.id])
  })

  it("toggleTask alterna o done e respeita o projectId", () => {
    const p = createProject("P", "")
    const t = createTask(p.id, "x")
    expect(toggleTask(p.id, t.id)?.done).toBe(true)
    expect(toggleTask(p.id, t.id)?.done).toBe(false)
    expect(toggleTask("outro-projeto", t.id)).toBeUndefined()
  })

  it("updateTask altera o título e respeita o projectId", () => {
    const p = createProject("P", "")
    const t = createTask(p.id, "antigo")
    expect(updateTask(p.id, t.id, "novo")?.title).toBe("novo")
    expect(updateTask("outro-projeto", t.id, "z")).toBeUndefined()
  })

  it("deleteTask remove e respeita o projectId", () => {
    const p = createProject("P", "")
    const t = createTask(p.id, "x")
    expect(deleteTask("outro-projeto", t.id)).toBe(false)
    expect(deleteTask(p.id, t.id)).toBe(true)
    expect(deleteTask(p.id, t.id)).toBe(false)
  })

  it("countTasks e countCompletedTasks", () => {
    const p = createProject("P", "")
    const t1 = createTask(p.id, "a")
    createTask(p.id, "b")
    expect(countTasks(p.id)).toBe(2)
    expect(countCompletedTasks(p.id)).toBe(0)
    toggleTask(p.id, t1.id)
    expect(countCompletedTasks(p.id)).toBe(1)
  })
})
