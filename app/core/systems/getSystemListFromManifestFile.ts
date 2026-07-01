/**
 * Function to get the list of systems from the manifest file.
 * @returns A promise resolving to an array of system filenames, they shall be located in the public/systems directory.
 */
export async function getSystemListFromManifestFile(): Promise<string[]> {

    // path of the file is set in the nuxt.config.ts file as a public runtime config variable
    const config = useRuntimeConfig();
    const manifestFilePath = config.public.manifestFilePath;

    const response = await fetch("/systems/manifest.json");

    if (!response.ok) {
        throw new Error("Failed to load manifest");
    }

    const manifest = await response.json();
    const systemsList = manifest.systems || [];
    return systemsList; 
}