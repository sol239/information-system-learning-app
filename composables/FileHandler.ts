import { InformationSystem } from '~/model/InformationSystem'
import { usePropertyStore } from '#imports';


export class FileHandler {
    public directories: string[];
    private propertyStore;

    public constructor() {
        this.directories = this.getDataDirectories();
        this.propertyStore = usePropertyStore();
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

    private printProperties(definitions: Record<string, any>, indent = '') {
        for (const [defName, def] of Object.entries(definitions)) {
            if (def.properties) {
                console.log(`${indent}Definition: ${defName}`);
                console.log(`${indent}Properties:`);
                for (const [propName, propSchema] of Object.entries(def.properties)) {
                    let type = propSchema.type ?? 'unknown';
                    if (Array.isArray(type)) {
                        type = type.join(', ');
                    }
                    console.log(`Property: ${propName}`);
                    console.log(`Type: ${type}`);
                    this.propertyStore.addProperty(propName, type);
                }
            } else {
                console.log(`(no properties)`);
            }
            console.log('');
        }
    }

    public getInformationSystems(): InformationSystem[] {
        const configFiles = import.meta.glob('~/assets/data/*/config.json', { eager: true });
        const informationSystems: InformationSystem[] = [];

        for (const [path, module] of Object.entries(configFiles)) {
            try {
                const configData = (module as any).default;
                const infoSystem: InformationSystem = InformationSystem.fromJSON(configData);
                console.log("Config Data:", configData)
                infoSystem.databaseInit(configData);
                console.log(`Parsed config from ${path}:`);
                informationSystems.push(infoSystem);
            } catch (error) {
                console.error(`Failed to parse config from ${path}:`, error);
                // Continue processing other files even if one fails
            }
        }

        const schemaFiles = import.meta.glob('~/assets/data/*/json-schema.json', { eager: true });

        for (const [path, module] of Object.entries(schemaFiles)) {
            try {
                const schemaData = (module as any).default;
                console.log(`Schema from ${path}:`);

                if (schemaData.definitions) {
                    this.printProperties(schemaData.definitions);
                } else {
                    console.log('No definitions found in schema.');
                }
            } catch (error) {
                console.error(`Failed to parse schema from ${path}:`, error);
            }
        }

        return informationSystems;
    }


}
