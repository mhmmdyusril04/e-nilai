/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as bidang from "../bidang.js";
import type * as clerk from "../clerk.js";
import type * as evaluation from "../evaluation.js";
import type * as http from "../http.js";
import type * as indikator from "../indikator.js";
import type * as invitations from "../invitations.js";
import type * as nomination from "../nomination.js";
import type * as users from "../users.js";
import type * as workers from "../workers.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  bidang: typeof bidang;
  clerk: typeof clerk;
  evaluation: typeof evaluation;
  http: typeof http;
  indikator: typeof indikator;
  invitations: typeof invitations;
  nomination: typeof nomination;
  users: typeof users;
  workers: typeof workers;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
