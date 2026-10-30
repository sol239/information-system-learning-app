import { afterEach, describe, expect, it, vi } from "vitest";

async function loadSystemHelper(systemsToPreload?: unknown[]) {
  const configuredSystemsToPreload =
    arguments.length === 0 ? ["primary-system"] : systemsToPreload;

  vi.resetModules();
  vi.stubGlobal("useRuntimeConfig", () => ({
    app: {
      baseURL: "/app-base/",
    },
    public: {
      systemsToPreload: configuredSystemsToPreload,
    },
  }));

  const { SystemHelper } = await import("../../app/core/systems/SystemHelper");
  return SystemHelper;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.doUnmock("~/utils/DatabaseWrapper");
  vi.restoreAllMocks();
});

describe("SystemHelper", () => {
  describe("normalizePublicName", () => {
    it("returns directory names unchanged", async () => {
      const SystemHelper = await loadSystemHelper();

      expect(SystemHelper.normalizePublicName("skolni-tabor-palava")).toBe(
        "skolni-tabor-palava",
      );
    });

    it("removes zip extension from zip file names", async () => {
      const SystemHelper = await loadSystemHelper();

      expect(SystemHelper.normalizePublicName("skolni-tabor-palava.zip")).toBe(
        "skolni-tabor-palava",
      );
      expect(SystemHelper.normalizePublicName("skolni-tabor-palava.ZIP")).toBe(
        "skolni-tabor-palava",
      );
    });

    it("trims whitespace before normalizing", async () => {
      const SystemHelper = await loadSystemHelper();

      expect(
        SystemHelper.normalizePublicName("  skolni-tabor-palava.zip  "),
      ).toBe("skolni-tabor-palava");
    });

    it("throws for empty public names", async () => {
      const SystemHelper = await loadSystemHelper();

      expect(() => SystemHelper.normalizePublicName("   ")).toThrow(
        "runtimeConfig.public.systemsToPreload contains an empty system entry.",
      );
    });
  });

  describe("getPrimarySystemId", () => {
    it("returns the normalized first preloaded system", async () => {
      const SystemHelper = await loadSystemHelper([
        "primary-system.zip",
        "secondary-system",
      ]);

      expect(SystemHelper.getPrimarySystemId()).toBe("primary-system");
    });

    it("throws when no preloaded systems are configured", async () => {
      const SystemHelper = await loadSystemHelper([]);

      expect(() => SystemHelper.getPrimarySystemId()).toThrow(
        "No systems to preload found in runtime config.",
      );
    });
  });

  describe("getSystemsToPreloadIds", () => {
    it("returns normalized IDs for all systems to preload", async () => {
      const SystemHelper = await loadSystemHelper([
        "primary-system.zip",
        "secondary-system",
        "third-system.ZIP",
      ]);

      expect(SystemHelper.getSystemsToPreloadIds()).toEqual([
        "primary-system",
        "secondary-system",
        "third-system",
      ]);
    });

    it("throws when systems to preload are missing", async () => {
      const SystemHelper = await loadSystemHelper(undefined);

      expect(() => SystemHelper.getSystemsToPreloadIds()).toThrow(
        "No systems to preload found in runtime config.",
      );
    });
  });

  describe("prepareSystem", () => {
    it("selects the system and initializes its database when needed", async () => {
      const isDatabaseInitialized = vi.fn(async () => false);
      vi.doMock("~/utils/DatabaseWrapper", () => ({
        DatabaseWrapper: {
          isDatabaseInitialized,
        },
      }));
      const initializeDatabase = vi.fn(async () => {});
      const store = {
        selectedSystemId: "",
        getSystemById: vi.fn(() => ({
          id: "prepared-system",
          database: {
            initializeDatabase,
          },
        })),
      };
      vi.stubGlobal("useSystemsStore", () => store);
      const SystemHelper = await loadSystemHelper();

      await expect(SystemHelper.prepareSystem("prepared-system")).resolves.toBe(
        true,
      );

      expect(store.selectedSystemId).toBe("prepared-system");
      expect(store.getSystemById).toHaveBeenCalledWith("prepared-system");
      expect(isDatabaseInitialized).toHaveBeenCalledWith(
        store.getSystemById.mock.results[0].value.database,
      );
      expect(initializeDatabase).toHaveBeenCalledOnce();
    });

    it("returns false when the system does not exist", async () => {
      vi.doMock("~/utils/DatabaseWrapper", () => ({
        DatabaseWrapper: {
          isDatabaseInitialized: vi.fn(),
        },
      }));
      vi.spyOn(console, "error").mockImplementation(() => {});
      const store = {
        selectedSystemId: "",
        getSystemById: vi.fn(() => null),
      };
      vi.stubGlobal("useSystemsStore", () => store);
      const SystemHelper = await loadSystemHelper();

      await expect(SystemHelper.prepareSystem("missing-system")).resolves.toBe(
        false,
      );

      expect(store.selectedSystemId).toBe("missing-system");
      expect(console.error).toHaveBeenCalledWith(
        "System not found for system missing-system",
      );
    });
  });
});
