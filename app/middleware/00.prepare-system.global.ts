import { SystemHelper } from "~/core/systems/SystemHelper";

/** Prepare the database before rendering system pages, including history navigation. */
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server || !to.path.startsWith("/systems/")) return;

  const systemId = String(to.params.id ?? "");
  if (!systemId) return;

  await SystemHelper.prepareSystem(systemId);
});
