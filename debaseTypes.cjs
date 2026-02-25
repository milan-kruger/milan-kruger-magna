const path = require('path');
const fs = require('fs').promises;

async function transformGeneratedTypes(filePath) {
    try {
        let content = await fs.readFile(filePath, 'utf8');

        // Replace type definitions ending in "Base"
        const baseTypeRegex = /export type (\w+)Base = {([^}]+)};/g;
        content = content.replace(baseTypeRegex, (match, typeName, properties) => {
            return `export type ${typeName} = {${properties}};`;
        });

        // Update any remaining type references ending in "Base"
        content = content.replace(/(\w+)Base\b/g, '$1');

        await fs.writeFile(filePath, content, 'utf8');
        console.log(`File transformed successfully: ${filePath}`);
    } catch (error) {
        throw new Error(`Error transforming file ${filePath}: ${error.message}`);
    }
}

async function main() {
    const configPath = process.argv[2];
    if (!configPath) {
        throw new Error("Please provide a configuration file path as an argument.");
    }

    try {
        const rtkConfigFile = path.resolve(__dirname, configPath);
        const rtkConfigContent = await fs.readFile(rtkConfigFile, 'utf8');
        const rtkConfigJSON = JSON.parse(rtkConfigContent);
        const apiOutputFile = rtkConfigJSON['outputFile'];
        const fullApiFilePath = path.resolve("src/project", apiOutputFile);

        await transformGeneratedTypes(fullApiFilePath);
    } catch (err) {
        console.error('Failed to remove `Base` suffix from abstract classes:', err);
        process.exit(1);
    }
}

main();
