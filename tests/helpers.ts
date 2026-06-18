// Helpers para exercitar os route handlers do App Router diretamente.

/** Request com corpo JSON (usado para POST/PATCH). */
export function jsonRequest(method: string, body: unknown): Request {
  return new Request("http://test/api", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

/** Request sem corpo (ex.: DELETE, ou o PATCH de toggle que não envia body). */
export function emptyRequest(method: string): Request {
  return new Request("http://test/api", { method })
}

/** Monta o segundo argumento dos handlers: { params: Promise<...> }. */
export function ctx(params: Record<string, string>) {
  return { params: Promise.resolve(params) }
}
