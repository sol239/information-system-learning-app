import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createJiti } from 'jiti';

// Utility to handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is 3 levels up from app/model/SystemComponents/
const projectRoot = path.resolve(__dirname, '../../..');
// In this project, '~' seems to point to the 'app' directory based on the imports
const appRoot = path.resolve(projectRoot, 'app');

/**
 * Configure jiti to handle TypeScript files and resolve aliases.
 * This allows us to import .ts files and use the '~/...' alias.
 */
const jiti = createJiti(import.meta.url, {
    alias: {
        '~': appRoot,
    },
    interopDefault: true,
});

/**
 * Recursively scans the directory for .ts files, imports them,
 * and collects all Component instances using their toJSON() method.
 */
async function generateComponentsJson() {
    const components = [];
    const searchDir = __dirname;

    //console.log(`Scanning for components in: ${searchDir}`);

    function walk(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.ts')) {
                // Skip the base Component.ts or any other non-component definition files
                if (entry.name === 'Component.ts') continue;

                try {
                    // Use jiti to load the TypeScript file
                    const module = jiti(fullPath);

                    // Iterate over all exports in the file
                    for (const exportName in module) {
                        const exported = module[exportName];

                        // Use the inbuilt component method toJSON() as requested
                        // We duck-type it by checking if toJSON is a function
                        if (exported && typeof exported.toJSON === 'function') {
                            const componentData = exported.toJSON();

                            // Check if it has a name to ensure it's a valid component instance
                            if (componentData && componentData.id) {
                                components.push(componentData);
                                //console.log(`  Found component: ${componentData.name} (${componentData.id})`);
                            }
                        }
                    }
                } catch (error) {
                    console.error(`  Warning: Failed to load ${entry.name}:`, error.message);
                }
            }
        }
    }

    walk(searchDir);

    // Save the result to the preloaded public system folder.
    const outputFileName = 'system_components.json';
    const outputDir = path.join(projectRoot, 'public', 'systems', 'skolni-tabor-palava');
    const outputFilePath = path.join(outputDir, outputFileName);

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputFilePath, JSON.stringify(components, null, 2), 'utf-8');

    //console.log(`\nSuccess! Generated ${components.length} components into ${outputFilePath}`);
}

// Execute the generation
generateComponentsJson().catch(err => {
    console.error('Fatal error during component generation:', err);
    process.exit(1);
});
