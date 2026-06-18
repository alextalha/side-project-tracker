// Lê o corpo JSON de uma Request de forma segura: se o corpo estiver ausente,
// vazio ou não for um objeto JSON válido, retorna {} em vez de lançar exceção.
export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const data = await request.json()
    return data && typeof data === "object" ? (data as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}
