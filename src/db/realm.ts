import Realm from "realm";
import { migrations } from "./migrations/migrations";
import {
  buildMigrationRunner,
  initializeMigrationRecordsIfNecessary,
} from "./migrations/run-migrations";
import { schema } from "./schema";

export const createRealm = () => {
  try {
    const realm = new Realm({
      // Array of schema records to use in the Realm
      schema: schema,
      // Using in memory realm for demonstration purposes
      inMemory: true,
      // Utilize the migration runner with the migrations that are generated
      // by the migration generator
      onMigration: buildMigrationRunner(migrations),
      // Set the schema version to the length of the migrations array
      schemaVersion: migrations.length,
    });
    initializeMigrationRecordsIfNecessary(realm);
    return realm;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
