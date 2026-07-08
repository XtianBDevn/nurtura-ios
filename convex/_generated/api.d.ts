/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as careLogs from "../careLogs.js";
import type * as careRecipients from "../careRecipients.js";
import type * as chatMessages from "../chatMessages.js";
import type * as constants from "../constants.js";
import type * as dashboard from "../dashboard.js";
import type * as fhir from "../fhir.js";
import type * as healthProfiles from "../healthProfiles.js";
import type * as http from "../http.js";
import type * as integrations from "../integrations.js";
import type * as lib_authz from "../lib/authz.js";
import type * as medications from "../medications.js";
import type * as messages from "../messages.js";
import type * as profiles from "../profiles.js";
import type * as schedule from "../schedule.js";
import type * as securityEvents from "../securityEvents.js";
import type * as subscriptions from "../subscriptions.js";
import type * as timeEntries from "../timeEntries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  careLogs: typeof careLogs;
  careRecipients: typeof careRecipients;
  chatMessages: typeof chatMessages;
  constants: typeof constants;
  dashboard: typeof dashboard;
  fhir: typeof fhir;
  healthProfiles: typeof healthProfiles;
  http: typeof http;
  integrations: typeof integrations;
  "lib/authz": typeof lib_authz;
  medications: typeof medications;
  messages: typeof messages;
  profiles: typeof profiles;
  schedule: typeof schedule;
  securityEvents: typeof securityEvents;
  subscriptions: typeof subscriptions;
  timeEntries: typeof timeEntries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
