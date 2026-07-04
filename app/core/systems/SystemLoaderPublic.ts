import type { InformationSystem } from "~/model/InformationSystem";
import type { ISystemLoader } from "./ISystemLoader";
import type { Operation } from "~/utils/Operation/Operation";
import { SystemHelper } from "./SystemHelper";
import JSZip from "jszip";
import type { SystemFile } from "~/model/types/SystemFile";

export class SystemLoaderPublic implements ISystemLoader {
    async loadSystem(systemId: string): Promise<Operation<InformationSystem | null>> {
        const systemFiles = await this.getSystemFiles(systemId);
        const { InformationSystem } = await import("~/model/InformationSystem");
        return InformationSystem.loadSystem(systemFiles);
    }

    public async getSystemFiles(systemId: string): Promise<SystemFile[]> {
        const systemEntry = this.getSystemsToPreloadEntries()
            .map(entry => String(entry).trim())
            .find(entry => SystemHelper.normalizePublicName(entry) === systemId);

        if (!systemEntry) {
            throw new Error(`System with id "${systemId}" not found in runtimeConfig.public.systemsToPreload.`);
        }

        if (systemEntry.toLowerCase().endsWith(".zip")) {
            return this.getSystemFilesFromZip(systemEntry);
        }

        return this.getSystemFilesFromDirectory(systemEntry);
    }

    private getSystemsToPreloadEntries(): unknown[] {
        const systemsToPreload = useRuntimeConfig().public.systemsToPreload;
        if (!Array.isArray(systemsToPreload) || systemsToPreload.length === 0) {
            throw new Error("No systems to preload found in runtime config.");
        }

        return systemsToPreload;
    }

    private async getSystemFilesFromZip(systemEntry: string): Promise<SystemFile[]> {
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

    private async getSystemFilesFromDirectory(systemEntry: string): Promise<SystemFile[]> {
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

    private publicSystemUrl(path: string): string {
        const runtimeConfig = useRuntimeConfig();
        const baseURL = String(runtimeConfig.app?.baseURL ?? "").replace(/\/$/, "");
        return `${baseURL}/systems/${path}`;
    }

    private async fetchRequiredTextFile(url: string, label: string): Promise<string> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${label}: ${response.status}`);
        }

        return response.text();
    }

    private async fetchOptionalTextFile(url: string): Promise<string | null> {
        const response = await fetch(url);
        if (!response.ok) {
            return null;
        }

        return response.text();
    }

    private async fetchRequiredArrayBuffer(url: string, label: string): Promise<ArrayBuffer> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${label}: ${response.status}`);
        }

        return response.arrayBuffer();
    }
}
