import JSZip from "jszip";
import type { SystemFile } from "~/model/types/SystemFile";

export class SystemHelper {

    public static getPrimarySystemId(): string {
        return this.normalizePublicName(this.getPreloadedSystemEntries()[0]);
    }

    public static getPreloadedSystemIds(): string[] {
        return this.getPreloadedSystemEntries().map(systemEntry => this.normalizePublicName(systemEntry));
    }

    public static normalizePublicName(publicName: unknown): string {
        const systemId = String(publicName).trim().replace(/\.zip$/i, "");

        if (!systemId) {
            throw new Error("runtimeConfig.public.preloadedSystems contains an empty system entry.");
        }

        return systemId;
    }

    public static async getSystemFiles(systemId: string): Promise<SystemFile[]> {
        const systemEntry = this.getPreloadedSystemEntries()
            .map(entry => String(entry).trim())
            .find(entry => this.normalizePublicName(entry) === systemId);

        if (!systemEntry) {
            throw new Error(`System with id "${systemId}" not found in runtimeConfig.public.preloadedSystems.`);
        }

        if (systemEntry.toLowerCase().endsWith(".zip")) {
            return this.getSystemFilesFromZip(systemEntry);
        }

        return this.getSystemFilesFromDirectory(systemEntry);
    }

    private static getPreloadedSystemEntries(): unknown[] {
        const preloadedSystems = useRuntimeConfig().public.preloadedSystems;
        if (!Array.isArray(preloadedSystems) || preloadedSystems.length === 0) {
            throw new Error("No preloaded systems found in runtime config.");
        }

        return preloadedSystems;
    }

    private static async getSystemFilesFromZip(systemEntry: string): Promise<SystemFile[]> {
        const zipData = await this.fetchRequiredArrayBuffer(
            this.publicSystemUrl(systemEntry),
            systemEntry
        );
        const zip = await JSZip.loadAsync(zipData);
        const systemFiles: SystemFile[] = [];
        const readFiles: Promise<void>[] = [];

        zip.forEach((relativePath, zipEntry) => {
            if (zipEntry.dir) {
                return;
            }

            readFiles.push(
                zipEntry.async("text").then(content => {
                    systemFiles.push({
                        name: relativePath.split("/").pop() ?? relativePath,
                        path: relativePath,
                        content,
                    });
                })
            );
        });

        await Promise.all(readFiles);
        return systemFiles;
    }

    private static async getSystemFilesFromDirectory(systemEntry: string): Promise<SystemFile[]> {
        const systemFiles: SystemFile[] = [
            {
                name: "config.json",
                path: `${systemEntry}/config.json`,
                content: await this.fetchRequiredTextFile(
                    this.publicSystemUrl(`${systemEntry}/config.json`),
                    `${systemEntry}/config.json`
                ),
            },
        ];

        const createSchemaSql = await this.fetchOptionalTextFile(
            this.publicSystemUrl(`${systemEntry}/create_schema.sql`)
        );
        if (createSchemaSql !== null) {
            systemFiles.push({
                name: "create_schema.sql",
                path: `${systemEntry}/create_schema.sql`,
                content: createSchemaSql,
            });
        }

        return systemFiles;
    }

    private static publicSystemUrl(path: string): string {
        const runtimeConfig = useRuntimeConfig();
        const baseURL = String(runtimeConfig.app?.baseURL ?? "").replace(/\/$/, "");
        return `${baseURL}/systems/${path}`;
    }

    private static async fetchRequiredTextFile(url: string, label: string): Promise<string> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${label}: ${response.status}`);
        }

        return response.text();
    }

    private static async fetchOptionalTextFile(url: string): Promise<string | null> {
        const response = await fetch(url);
        if (!response.ok) {
            return null;
        }

        return response.text();
    }

    private static async fetchRequiredArrayBuffer(url: string, label: string): Promise<ArrayBuffer> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${label}: ${response.status}`);
        }

        return response.arrayBuffer();
    }
}
