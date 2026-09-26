import "server-only";
import { EventEmitter } from "node:events";

declare global {
  // Prevent duplicate instances during development HMR
  // eslint-disable-next-line no-var
  var __familyEventBus: EventEmitter | undefined;
}

export const eventBus = globalThis.__familyEventBus ?? new EventEmitter();
eventBus.setMaxListeners(20);

if (process.env.NODE_ENV !== "production") {
  globalThis.__familyEventBus = eventBus;
}
