/// <reference types="vite/client" />

import type { VibeCadApi } from "../main/preload";

declare global {
  interface Window {
    vibeCad: VibeCadApi;
  }
}

export {};
