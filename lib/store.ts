import { randomUUID } from "crypto"

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  done: boolean
  createdAt: string
}

// Em dev, o Next pode instanciar este módulo separadamente para as rotas de API
// e para os Server Components (Turbopack recompila por rota), criando Maps
// diferentes — o projeto "salva" na API mas a página renderiza vazia. Ancorar no
// globalThis garante UMA única instância compartilhada por todo o processo
// (e sobrevive ao HMR, então os dados não somem a cada hot-reload).
const globalForStore = globalThis as unknown as {
  __projects?: Map<string, Project>
  __tasks?: Map<string, Task>
}
const projects = (globalForStore.__projects ??= new Map<string, Project>())
const tasks = (globalForStore.__tasks ??= new Map<string, Task>())

const PROJECTS_KEY = "side-tracker-projects"
const TASKS_KEY = "side-tracker-tasks"

// Carregar dados do localStorage na inicialização
function loadFromStorage() {
  if (typeof window === "undefined") return
  
  try {
    const projectsData = localStorage.getItem(PROJECTS_KEY)
    const tasksData = localStorage.getItem(TASKS_KEY)
    
    if (projectsData) {
      const parsed = JSON.parse(projectsData) as Project[]
      parsed.forEach((p) => projects.set(p.id, p))
    }
    
    if (tasksData) {
      const parsed = JSON.parse(tasksData) as Task[]
      parsed.forEach((t) => tasks.set(t.id, t))
    }
  } catch (e) {
    console.error("Erro ao carregar dados do localStorage:", e)
  }
}

// Salvar projetos no localStorage
function saveProjects() {
  if (typeof window === "undefined") return
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(Array.from(projects.values())))
}

// Salvar tarefas no localStorage
function saveTasks() {
  if (typeof window === "undefined") return
  localStorage.setItem(TASKS_KEY, JSON.stringify(Array.from(tasks.values())))
}

// Carregar na primeira vez
loadFromStorage()

export function listProjects(): Project[] {
  return Array.from(projects.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getProject(id: string): Project | undefined {
  return projects.get(id)
}

export function createProject(name: string, description: string): Project {
  const project: Project = {
    id: randomUUID(),
    name,
    description,
    createdAt: new Date().toISOString(),
  }
  projects.set(project.id, project)
  saveProjects()
  return project
}

export function updateProject(
  id: string,
  name: string,
  description: string
): Project | undefined {
  const project = projects.get(id)
  if (!project) return undefined
  project.name = name
  project.description = description
  saveProjects()
  return project
}

export function deleteProject(id: string): boolean {
  if (!projects.has(id)) return false
  projects.delete(id)
  
  // Deletar tarefas associadas
  for (const [taskId, task] of tasks) {
    if (task.projectId === id) tasks.delete(taskId)
  }
  
  saveProjects()
  saveTasks()
  return true
}

export function listTasks(projectId: string): Task[] {
  return Array.from(tasks.values())
    .filter((t) => t.projectId === projectId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export function createTask(projectId: string, title: string): Task {
  const task: Task = {
    id: randomUUID(),
    projectId,
    title,
    done: false,
    createdAt: new Date().toISOString(),
  }
  tasks.set(task.id, task)
  saveTasks()
  return task
}

export function toggleTask(projectId: string, taskId: string): Task | undefined {
  const task = tasks.get(taskId)
  if (!task || task.projectId !== projectId) return undefined
  task.done = !task.done
  saveTasks()
  return task
}

export function updateTask(
  projectId: string,
  taskId: string,
  title: string
): Task | undefined {
  const task = tasks.get(taskId)
  if (!task || task.projectId !== projectId) return undefined
  task.title = title
  saveTasks()
  return task
}

export function deleteTask(projectId: string, taskId: string): boolean {
  const task = tasks.get(taskId)
  if (!task || task.projectId !== projectId) return false
  tasks.delete(taskId)
  saveTasks()
  return true
}

export function countTasks(projectId: string): number {
  return Array.from(tasks.values()).filter((t) => t.projectId === projectId).length
}

export function countCompletedTasks(projectId: string): number {
  return Array.from(tasks.values()).filter((t) => t.projectId === projectId && t.done).length
}
