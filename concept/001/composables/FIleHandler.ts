import { InformationSystem } from '~/model/InformationSystem'


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

    public getInformationSystems(): InformationSystem[] {
        const configFiles = import.meta.glob('~/assets/data/*/config.json', { eager: true });
        const informationSystems: InformationSystem[] = [];

        for (const [path, module] of Object.entries(configFiles)) {
            try {
                const configData = (module as any).default;
                const infoSystem: InformationSystem = InformationSystem.fromJSON(configData);
                infoSystem.databaseInit(configData);
                console.log(`Parsed config from ${path}:`);
                informationSystems.push(infoSystem);
            } catch (error) {
                console.error(`Failed to parse config from ${path}:`, error);
                // Continue processing other files even if one fails
            }
        }

        return informationSystems;
    }


}