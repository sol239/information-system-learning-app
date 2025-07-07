export class FileHandler {
    public constructor() {
        this.printDataDirectories();
    }

    public printDataDirectories() {
        // Get all files in assets/data/ subdirectories
        const modules = import.meta.glob('~/assets/data/*/**', { eager: false });

        // Extract unique directory names
        const directories = [...new Set(
            Object.keys(modules).map(path => {
                // Match pattern: /assets/data/DIRECTORY_NAME/...
                const match = path.match(/\/assets\/data\/([^\/]+)\//);
                return match ? match[1] : null;
            }).filter(Boolean)
        )];

        // Print the directories
        console.log('Directories in assets/data/:');
        directories.forEach(dir => {
            console.log(`- ${dir}`);
        });

        return directories;
    }
}