import type { SystemFile } from "~/model/types/SystemFile";

export function areSystemFilesValid(files: SystemFile[]): boolean {
    const requiredFiles = ['config.json', 'create_schema.sql'];

    let isValid = true;

    for (const requiredFile of requiredFiles) {
        const fileExists = files.some(file => file.name === requiredFile);
        if (!fileExists) {
            isValid = false;
            break;
        }

    }

    return isValid;
}
