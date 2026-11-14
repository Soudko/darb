// The only place the screens call the server.
import type { AssistantRequest, AssistantResponse, ErrorCode, PlaceView } from '../../../shared/types';

export class ApiFailure extends Error {
  constructor(public code: ErrorCode | 'offline') {
    super(code);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  } catch {
    throw new ApiFailure('offline');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiFailure(body?.error?.code ?? 'server_error');
  return body as T;
}

let placesCache: Promise<PlaceView[]> | null = null;
export function getPlaces(): Promise<PlaceView[]> {
  if (!placesCache) {
    placesCache = call<{ places: PlaceView[] }>('/api/places').then((r) => r.places);
    placesCache.catch(() => (placesCache = null));
  }
  return placesCache;
}

export function askAssistant(req: AssistantRequest): Promise<AssistantResponse> {
  return call<AssistantResponse>('/api/assistant', { method: 'POST', body: JSON.stringify(req) });
}
