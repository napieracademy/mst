// Dichiarazione di tipo per l'ambiente Deno

declare namespace Deno {
  interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
  
  export function serve(handler: (request: Request) => Promise<Response>): void;
}

// Dichiarazione di moduli per Supabase e altre dipendenze Deno
declare module 'https://esm.sh/@supabase/supabase-js@2.39.0' {
  export interface SupabaseClientOptions {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
  }

  export interface User {
    id: string;
    app_metadata: {
      provider?: string;
      [key: string]: any;
    };
    user_metadata: {
      [key: string]: any;
    };
    aud: string;
    email?: string;
  }

  export interface PostgrestError {
    message: string;
  }

  export interface PostgrestResponse<T> {
    data: T | null;
    error: PostgrestError | null;
  }

  export interface PostgrestFilterBuilder<T> {
    eq: (column: string, value: any) => PostgrestFilterBuilder<T>;
    neq: (column: string, value: any) => PostgrestFilterBuilder<T>;
    select: (columns?: string) => PostgrestFilterBuilder<T>;
    single: () => Promise<PostgrestResponse<T>>;
  }

  export interface SupabaseQueryBuilder<T> {
    from: (table: string) => PostgrestFilterBuilder<T>;
    rpc: (fn: string, params?: any) => Promise<PostgrestResponse<T>>;
  }

  export interface SupabaseClient {
    from<T = any>(table: string): PostgrestFilterBuilder<T>;
    rpc<T = any>(fn: string, params?: any): Promise<PostgrestResponse<T>>;
    storage: {
      from(bucket: string): {
        upload: (path: string, data: Blob, options?: any) => Promise<{ data: any; error: any }>;
        getPublicUrl: (path: string) => { publicUrl: string };
      };
    };
  }

  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: SupabaseClientOptions
  ): SupabaseClient;
}

declare module 'https://deno.land/std@0.177.0/http/server.ts' {
  export function serve(handler: (req: Request) => Promise<Response>): void;
} 