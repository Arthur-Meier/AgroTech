/**
 * Minimal HTTP client helpers — fetch wrapper (TypeScript)
 * -----------------------------------------------------------------------------
 * PURPOSE
 *  - Provide tiny, typed helpers for JSON-based HTTP requests using `fetch`.
 *  - Keep usage ergonomic with generics (callers define the expected JSON type).
 *
 * SCOPE (no behavior changes here)
 *  - Comments and documentation only. The implementation remains exactly the
 *    same, so existing call sites are unaffected.
 *
 * DESIGN NOTES
 *  - `fetch` resolves the Promise for *any* HTTP response; it only rejects on
 *    network/transport errors. We explicitly check `res.ok` and throw on non-2xx
 *    statuses so callers can handle errors with try/catch.
 *  - We assume JSON APIs and parse response bodies with `res.json()`.
 *
 * EXTENSION IDEAS (future; not implemented here)
 *  - Base URL and default headers via a higher-order factory, e.g., `createClient`.
 *  - Request timeouts with `AbortController` to avoid hanging requests.
 *  - Retries/backoff for transient 5xx responses.
 *  - Auth: attach bearer tokens from secure storage; refresh on 401.
 *  - Structured error objects mapping status codes to domain errors.
 *
 * Last reviewed: 2025-09-03
 */

/**
 * Perform a GET request and parse the JSON response.
 *
 * @typeParam T - Expected JSON shape of the response body.
 * @param url - Absolute or relative URL to request.
 * @returns A promise that resolves to the parsed JSON typed as `T`.
 * @throws Error when the HTTP status is not in the 2xx range, with a minimal
 *         message containing the method, URL, and status code. Network errors
 *         (e.g., DNS, connectivity) also reject the Promise from `fetch`.
 */
export async function apiGet<T>(url: string): Promise<T> {
  // Issue the request using the platform's `fetch` implementation (RN/Web).
  const res = await fetch(url);
  // `fetch` does not throw for 4xx/5xx; surface those as exceptions here.
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  // Parse and return JSON as the generic type `T`.
  return res.json() as Promise<T>;
}

/**
 * Perform a POST request with a JSON body and parse the JSON response.
 *
 * @typeParam T - Expected JSON shape of the response body.
 * @param url - Absolute or relative URL to request.
 * @param body - Arbitrary payload that will be JSON-stringified.
 * @returns A promise that resolves to the parsed JSON typed as `T`.
 * @throws Error when the HTTP status is not in the 2xx range. Transport errors
 *         (e.g., offline) will reject from `fetch` itself.
 *
 * SECURITY & CONSISTENCY
 *  - `Content-Type: application/json` header is declared explicitly to avoid
 *    server-side content-negotiation ambiguity.
 *  - `JSON.stringify` is used as provided; callers are responsible for ensuring
 *    the payload is serializable and does not leak sensitive data accidentally.
 */
export async function apiPost<T>(url: string, body: any): Promise<T> {
  // Issue a JSON POST; keep headers minimal and explicit.
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  // Surface non-2xx as exceptions so callers can handle via try/catch.
  if (!res.ok) throw new Error(`POST ${url} -> ${res.status}`);
  // Parse and return the JSON body.
  return res.json() as Promise<T>;
}
