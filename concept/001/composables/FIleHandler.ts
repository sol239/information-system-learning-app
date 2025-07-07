export class FileHandler {
    public directories: string[];

    public constructor() {
        this.directories = this.getDataDirectories();
    }

    public getDataDirectories(): string[] {
        // Get all files in assets/data/ subdirectories
        const modules = import.meta.glob('~/assets/data/*/**', { eager: false });

        // Extract unique directory names
        const directories = [...new Set(
            Object.keys(modules).map(path => {
                // Match pattern: /assets/data/DIRECTORY_NAME/...
                const match = path.match(/\/assets\/data\/([^\/]+)\//);
                return match ? match[1] : null;
            }).filter((dir): dir is string => dir !== null)
        )];

        return directories;
    }

    public printDirectories(): void {
        console.log('Data directories:', this.directories);
    }

    public getConfigFilesPaths(): Map<string, string> {
        // Import all config.json files in assets/data/*/config.json
        const configModules = import.meta.glob('~/assets/data/*/config.json', { eager: false });
        const configFilePaths = new Map<string, string>();

        Object.keys(configModules).forEach((path) => {
            // Extract the directory name from the path
            const match = path.match(/\/assets\/data\/([^\/]+)\/config\.json$/);
            if (match) {
                const directory = match[1];
                configFilePaths.set(directory, path);
            }
        });

        return configFilePaths;
    }


}