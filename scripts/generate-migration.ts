import { kebabCase, upperFirst, camelCase } from "lodash";
import fs from "fs";
import path from "path";

const TS_EXTENSION = ".ts";
// directory where the migration files are stored
const MIGRATIONS_DIR = path.join(__dirname, "../src/db/migrations");

const handleError = (errorMessage: string) => {
  console.error(errorMessage);
  process.exit(1);
};

// Helper function to generate migration name
// Example: migrationAddEmailToUser1629781234567
const generateMigrationName = (name: string, timestamp: string) =>
  `migration${upperFirst(camelCase(name))}${timestamp}`;

// Files that should not be included in the migration index file since they are not migrations
const excludedFiles = ["migrations.ts", "types.ts", "run-migrations.ts"];

// Fetch all migration file names without extension for example 1629781234567-add-email-to-user
const fetchMigrationFileNamesWithoutExt = (directory: string) =>
  fs
    .readdirSync(directory)
    .filter(
      (file) =>
        file.endsWith(TS_EXTENSION) && excludedFiles.includes(file) === false
    )
    .map((file) => file.replace(TS_EXTENSION, ""));

// Get the name of the migration from the command line arguments.
// For example, if the command is 'yarn generate-migration add email to user'
// then the migration name is 'add email to user'
// This supports multiple words in the migration name
// Calling `.slice(2)` removes the first two arguments which are 'tsx' and 'scripts/generate-migration.ts'
const args = process.argv.slice(2);

if (args.length === 0) {
  handleError("Please provide a name for the migration");
}

const migrationName = args.join(" ");
const timestamp = `${Date.now()}`;
const fileName = `${timestamp}-${kebabCase(migrationName)}${TS_EXTENSION}`;
const filePath = path.join(MIGRATIONS_DIR, fileName);
const migrationNameInFile = generateMigrationName(migrationName, timestamp);

// Template for the new migration file
const template = `import { RealmMigration } from '../migrations/types';

export const ${migrationNameInFile}: RealmMigration = {
  name: "${migrationNameInFile}",
  migration: (oldRealm, newRealm) => {
  }
}`;

if (fs.existsSync(filePath)) {
  handleError("Migration already exists");
}

// Write the migration file to the migrations directory
fs.writeFileSync(filePath, template);

console.log("Migration created at", filePath);

// Get the path of the file that will be used to export all migrations
const indexFilePath = path.join(MIGRATIONS_DIR, "migrations.ts");

// Get and sort all the existing migration file names without extension, including the new migration
const filenamesWithoutExt = fetchMigrationFileNamesWithoutExt(MIGRATIONS_DIR);
filenamesWithoutExt.sort((a, b) => {
  const aTimestamp = Number.parseInt(a.split("-")[0]);
  const bTimestamp = Number.parseInt(b.split("-")[0]);
  return aTimestamp - bTimestamp;
});

// Parse the migration file names to get the migration name, timestamp and variable name
const migrationInfo = filenamesWithoutExt.map((filenameWithoutExtension) => {
  const migrationName = upperFirst(
    camelCase(filenameWithoutExtension.split("-").slice(1).join("-"))
  );
  const migrationTimeStamp = filenameWithoutExtension.split("-")[0];
  const migrationVarName = generateMigrationName(
    migrationName,
    migrationTimeStamp
  );
  return {
    fileName: filenameWithoutExtension,
    name: migrationName,
    timestamp: migrationTimeStamp,
    varName: migrationVarName,
  };
});

// Create the content of the migration index file, exporting all migrations
const indexFile = `// This file is auto-generated by ts-scripts/generate-new-migration.ts
// Do not edit this file manually
// To add a new migration, run 'yarn generate-migration <migration name>'
import { RealmMigration } from '../migrations/types';

${migrationInfo
  .map(({ varName, fileName }) => `import { ${varName} } from './${fileName}';`)
  .join("\n")}
export const migrations: RealmMigration[] = [
  ${migrationInfo.map((migration) => migration.varName).join(",\n  ")},
];
`;

// Write the migration index file
fs.writeFileSync(indexFilePath, indexFile);
