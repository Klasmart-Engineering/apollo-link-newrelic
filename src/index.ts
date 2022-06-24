// avoid error TS2339: Property 'newrelic' does not exist on type 'Window & typeof globalThis'
// without including the global augmentation in the library .d.ts output
import type * as shim from "../types/window";
export { NewRelicLink } from "./link";
export { defaultGraphQLErrorAttributesCallback } from "./graphQLError";
export { defaultNetworkErrorAttributesCallback } from "./networkError";
export type { NewRelicLinkOptions } from "./options";
