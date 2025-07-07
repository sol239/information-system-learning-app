export class FileHandler {
    public directories: string[];

    public constructor() {
        this.directories = this.getDataDirectories();
    }

    public getDataDirectories() {
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

    public printDirectories() {
        console.log('Data directories:', this.directories);
    }


}