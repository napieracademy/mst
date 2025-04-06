// Dichiarazione globale per l'ambiente Deno

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

declare const Response: {
  new(body?: BodyInit | null, init?: ResponseInit): Response;
  prototype: Response;
  error(): Response;
  redirect(url: string | URL, status?: number): Response;
};

interface RequestInit {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  // ... altri campi
}

interface Response {
  readonly headers: Headers;
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType;
  readonly url: string;
  // ... altri metodi e proprietà
}

// Tipizzazione per serve
declare function serve(handler: (req: any) => Promise<Response>): void; 