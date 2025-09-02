import { InformationSystem } from '~/model/InformationSystem'
import { usePropertyStore } from '#imports';


export class FileHandler {

    public static getInformationSystems(): InformationSystem[] {
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
        return informationSystems;
    }


}
