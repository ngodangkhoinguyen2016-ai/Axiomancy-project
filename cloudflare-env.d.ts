import type { D1Database as MiniflareD1Database } from "@miniflare/d1";

declare global {
  type D1Database = MiniflareD1Database;

  interface Fetcher {
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  }
}

export {};
