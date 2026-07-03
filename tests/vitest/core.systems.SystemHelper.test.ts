import JSZip from "jszip";
import { afterEach, describe, expect, it, vi } from "vitest";

async function loadSystemHelper(preloadedSystems?: unknown[]) {
    const configuredPreloadedSystems = arguments.length === 0 ? ["primary-system"] : preloadedSystems;

    vi.resetModules();
    vi.stubGlobal("useRuntimeConfig", () => ({
        app: {
            baseURL: "/app-base/",
        },
        public: {
            preloadedSystems: configuredPreloadedSystems,
        },
    }));

    const { SystemHelper } = await import("../../app/core/systems/SystemHelper");
    return SystemHelper;
}

async function loadSystemLoaderPublic(preloadedSystems?: unknown[]) {
    await loadSystemHelper(preloadedSystems);
    const { SystemLoaderPublic } = await import("../../app/core/systems/SystemLoaderPublic");
    return new SystemLoaderPublic();
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

            expect(SystemHelper.normalizePublicName("skolni-tabor-palava")).toBe("skolni-tabor-palava");
        });

        it("removes zip extension from zip file names", async () => {
            const SystemHelper = await loadSystemHelper();

            expect(SystemHelper.normalizePublicName("skolni-tabor-palava.zip")).toBe("skolni-tabor-palava");
            expect(SystemHelper.normalizePublicName("skolni-tabor-palava.ZIP")).toBe("skolni-tabor-palava");
        });

        it("trims whitespace before normalizing", async () => {
            const SystemHelper = await loadSystemHelper();

            expect(SystemHelper.normalizePublicName("  skolni-tabor-palava.zip  ")).toBe("skolni-tabor-palava");
        });

        it("throws for empty public names", async () => {
            const SystemHelper = await loadSystemHelper();

            expect(() => SystemHelper.normalizePublicName("   ")).toThrow(
                "runtimeConfig.public.preloadedSystems contains an empty system entry."
            );
        });
    });

    describe("getPrimarySystemId", () => {
        it("returns the normalized first preloaded system", async () => {
            const SystemHelper = await loadSystemHelper(["primary-system.zip", "secondary-system"]);

            expect(SystemHelper.getPrimarySystemId()).toBe("primary-system");
        });

        it("throws when no preloaded systems are configured", async () => {
            const SystemHelper = await loadSystemHelper([]);

            expect(() => SystemHelper.getPrimarySystemId()).toThrow(
                "No preloaded systems found in runtime config."
            );
        });
    });

    describe("getPreloadedSystemIds", () => {
        it("returns normalized IDs for all preloaded systems", async () => {
            const SystemHelper = await loadSystemHelper([
                "primary-system.zip",
                "secondary-system",
                "third-system.ZIP",
            ]);

            expect(SystemHelper.getPreloadedSystemIds()).toEqual([
                "primary-system",
                "secondary-system",
                "third-system",
            ]);
        });

        it("throws when preloaded systems are missing", async () => {
            const SystemHelper = await loadSystemHelper(undefined);

            expect(() => SystemHelper.getPreloadedSystemIds()).toThrow(
                "No preloaded systems found in runtime config."
            );
        });
    });

    describe("getSystemFiles", () => {
        it("returns files for a preloaded directory system", async () => {
            const fetchMock = vi.fn(async (url: string) => {
                if (url === "/app-base/systems/directory-system/config.json") {
                    return new Response('{"id":"directory-system"}');
                }

                if (url === "/app-base/systems/directory-system/create_schema.sql") {
                    return new Response("CREATE TABLE demo (id INTEGER);");
                }

                return new Response(null, { status: 404 });
            });
            vi.stubGlobal("fetch", fetchMock);
            const systemLoader = await loadSystemLoaderPublic(["directory-system"]);

            const files = await systemLoader.getSystemFiles("directory-system");

            expect(files).toEqual([
                {
                    name: "config.json",
                    path: "directory-system/config.json",
                    content: '{"id":"directory-system"}',
                },
                {
                    name: "create_schema.sql",
                    path: "directory-system/create_schema.sql",
                    content: "CREATE TABLE demo (id INTEGER);",
                },
            ]);
            expect(fetchMock).toHaveBeenCalledWith("/app-base/systems/directory-system/config.json");
            expect(fetchMock).toHaveBeenCalledWith("/app-base/systems/directory-system/create_schema.sql");
        });

        it("omits optional directory files when they are not available", async () => {
            vi.stubGlobal("fetch", vi.fn(async (url: string) => {
                if (url === "/app-base/systems/directory-system/config.json") {
                    return new Response('{"id":"directory-system"}');
                }

                return new Response(null, { status: 404 });
            }));
            const systemLoader = await loadSystemLoaderPublic(["directory-system"]);

            const files = await systemLoader.getSystemFiles("directory-system");

            expect(files).toEqual([
                {
                    name: "config.json",
                    path: "directory-system/config.json",
                    content: '{"id":"directory-system"}',
                },
            ]);
        });

        it("returns files for a preloaded zip system", async () => {
            const zip = new JSZip();
            zip.file("config.json", '{"id":"zip-system"}');
            zip.file("sql/create_schema.sql", "CREATE TABLE zip_demo (id INTEGER);");
            const zipData = await zip.generateAsync({ type: "arraybuffer" });

            const fetchMock = vi.fn(async (url: string) => {
                if (url === "/app-base/systems/zip-system.zip") {
                    return new Response(zipData);
                }

                return new Response(null, { status: 404 });
            });
            vi.stubGlobal("fetch", fetchMock);
            const systemLoader = await loadSystemLoaderPublic(["zip-system.zip"]);

            const files = await systemLoader.getSystemFiles("zip-system");

            expect(files).toEqual(expect.arrayContaining([
                {
                    name: "config.json",
                    path: "config.json",
                    content: '{"id":"zip-system"}',
                },
                {
                    name: "create_schema.sql",
                    path: "sql/create_schema.sql",
                    content: "CREATE TABLE zip_demo (id INTEGER);",
                },
            ]));
            expect(fetchMock).toHaveBeenCalledWith("/app-base/systems/zip-system.zip");
        });

        it("throws when the requested system is not preloaded", async () => {
            const systemLoader = await loadSystemLoaderPublic(["known-system"]);

            await expect(systemLoader.getSystemFiles("missing-system")).rejects.toThrow(
                'System with id "missing-system" not found in runtimeConfig.public.preloadedSystems.'
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

            await expect(SystemHelper.prepareSystem("prepared-system")).resolves.toBe(true);

            expect(store.selectedSystemId).toBe("prepared-system");
            expect(store.getSystemById).toHaveBeenCalledWith("prepared-system");
            expect(isDatabaseInitialized).toHaveBeenCalledWith(store.getSystemById.mock.results[0].value.database);
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

            await expect(SystemHelper.prepareSystem("missing-system")).resolves.toBe(false);

            expect(store.selectedSystemId).toBe("missing-system");
            expect(console.error).toHaveBeenCalledWith("System not found for system missing-system");
        });
    });
});
