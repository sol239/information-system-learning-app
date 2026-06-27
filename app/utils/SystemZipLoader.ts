import JSZip from 'jszip';
import { InformationSystem } from '~/model/InformationSystem';
import { type Mapping } from '~/language/Mapping';
import { MappingCs } from '~/language/MappingCs';
import { Operation } from '~/utils/Operation/Operation';
import { OperationResultType } from '~/utils/Operation/OperationResultType';

/**
 * Utility class responsible for loading and parsing ZIP files that contain information system configurations and related data.
 */
export class SystemZipLoader {

    /**
     * Internal JSZip instance to handle ZIP file operations.
     */
    private zip: JSZip = new JSZip();

    /**
     * A map of file paths to their text content for all CSV files in the ZIP.
     */
    public csvFilesContent: Record<string, string> = {};

    /**
     * A map of Vue file names to their source content for all .vue files in the ZIP.
     */
    public vueFilesContent: Record<string, string> = {};

    /**
     * A map of SQL file names to their text content for all .sql files in the ZIP.
     */
    public sqlFilesContent: Record<string, string> = {};

    /**
     * The content of the JSON configuration file.
     */
    public jsonConfigFileContent: string | null = null;

    /**
     * The content of the JSON components file.
     */
    public jsonComponentsContent: string | null = null;

    /**
     * Loads the ZIP file and initializes the internal file structure.
     * @param zipFile The ZIP file to load.
     */
    private async loadZip(zipFile: File): Promise<void> {
        this.zip = await JSZip.loadAsync(zipFile);
        await this.loadFiles();
    }

    /**
     * Reads all non-directory entries from the loaded ZIP and stores their text content.
     */
    private async loadFiles(): Promise<void> {
        const promises: Promise<void>[] = [];
        this.zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
                promises.push(
                    zipEntry.async('text').then(content => {
                        if (relativePath.endsWith('config.json')) {
                            this.jsonConfigFileContent = content;
                        } else if (relativePath.endsWith('system_components.json')) {
                            this.jsonComponentsContent = content;
                        } else if (relativePath.endsWith('.csv')) {
                            const filename = relativePath.split('/').pop()!.replace(/\.[^/.]+$/, '');
                            this.csvFilesContent[filename] = content;
                        } else if (relativePath.endsWith('.vue')) {
                            const filename = relativePath.split('/').pop()!;
                            this.vueFilesContent[filename] = content;
                        } else if (relativePath.endsWith('.sql')) {
                            const filename = relativePath.split('/').pop()!;
                            this.sqlFilesContent[filename] = content;
                        }
                    })
                );
            }
        });
        await Promise.all(promises);
    }

    /**
     * Static factory method to create an instance of SystemZipLoader and load the zip file.
     * @param zipFile  The ZIP file to load.
     * @returns A promise that resolves to a SystemZipLoader instance, or null on failure.
     */
    public static async create(zipFile: File): Promise<Operation<SystemZipLoader | null>> {
        try {
            const loader = new SystemZipLoader();
            await loader.loadZip(zipFile);
            return new Operation(OperationResultType.SUCCESS, 'ZIP file loaded successfully', loader);
        } catch (error) {
            return new Operation(OperationResultType.ERROR, `Failed to load ZIP file: ${error}`, null);
        }
    }

    public printDebugInfo(): void {
        //console.log('JSON Config Content:', this.jsonConfigFileContent);
        for (const [filename, content] of Object.entries(this.csvFilesContent)) {
            //console.log(`CSV File: ${filename}, Content:`, content);
        }
    }
}