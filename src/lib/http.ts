export type HttpError = {
  status: number;
  message: string;
};

export async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
    ...init,
  });
  if (!resp.ok) {
    let message = resp.statusText || 'Request failed';
    try {
      const data = await resp.json();
      message = (data && (data.message || data.error)) || message;
    } catch {}
    const error: HttpError = { status: resp.status, message };
    throw error;
  }
  return resp.json() as Promise<T>;
}


