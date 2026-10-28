import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.doUnmock("~/core/systems/SystemHelper");
});

it("waits for database preparation on every system navigation", async () => {
  let finishPreparation!: () => void;
  const prepareSystem = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finishPreparation = resolve;
      }),
  );
  vi.doMock("~/core/systems/SystemHelper", () => ({
    SystemHelper: { prepareSystem },
  }));
  vi.stubGlobal(
    "defineNuxtRouteMiddleware",
    (middleware: unknown) => middleware,
  );
  const { default: middleware } =
    await import("../../app/middleware/00.prepare-system.global");
  // eslint-disable-next-line no-unused-vars
  const navigate = middleware as unknown as (to: {
    path: string;
    params: { id?: string };
  }) => Promise<void>;

  await navigate({ path: "/systems", params: {} });
  expect(prepareSystem).not.toHaveBeenCalled();

  const route = {
    path: "/systems/camp/nastenka",
    params: { id: "camp" },
  };
  let completed = false;
  const navigation = navigate(route).then(() => {
    completed = true;
  });
  expect(prepareSystem).toHaveBeenCalledWith("camp");
  await Promise.resolve();
  expect(completed).toBe(false);
  finishPreparation();
  await navigation;
  expect(completed).toBe(true);

  const returnNavigation = navigate(route);
  expect(prepareSystem).toHaveBeenCalledTimes(2);
  finishPreparation();
  await returnNavigation;
});
