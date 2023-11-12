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
      schema: schema,
      inMemory: true,
      onMigration: buildMigrationRunner(migrations),
      schemaVersion: migrations.length,
    });
    initializeMigrationRecordsIfNecessary(realm);
    return realm;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
