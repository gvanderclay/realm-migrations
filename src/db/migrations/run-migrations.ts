import Realm from "realm";
import { MigrationRecord, MigrationSchema } from "../schema";
import { RealmMigration } from "./types";
import { migrations } from "./migrations";

/*
 * Takes an array of migrations and returns a Realm migration callback
 */
export const buildMigrationRunner =
  (migrations: RealmMigration[]): Realm.MigrationCallback =>
  (oldRealm, newRealm) => {
    // Check if a migration should run by checking if a migration record exists
    const migrationShouldRun = (migration: RealmMigration) => {
      const migrationRecords = oldRealm.objects(MigrationSchema.name);
      return (
        migrationRecords.filtered("name = $0", migration.name).length === 0
      );
    };

    // Create a migration record for a migration that has run
    const createMigrationRecord = (migration: RealmMigration) => {
      const migrationRecord: MigrationRecord = {
        id: new Realm.BSON.ObjectId(),
        name: migration.name,
        createdAt: new Date(),
      };
      const newRecord = newRealm.create(MigrationSchema.name, migrationRecord);
      console.log(`Created migration record: ${newRecord.name}`);
    };

    // Run a migration and create a migration record
    const runMigration = (migration: RealmMigration) => {
      if (!migrationShouldRun(migration)) {
        return;
      }
      migration.migration(oldRealm, newRealm);
      createMigrationRecord(migration);
    };

    // If the schema version is the same, then no migrations need to be run
    // This is redundant since Realm will not call the migration callback if the
    // schema version is the same, but it's here for clarity
    if (oldRealm.schemaVersion === newRealm.schemaVersion) {
      console.log("Realm schema version is the same, skipping migrations");
      return;
    }

    console.log(
      `Migrating Realm from version ${oldRealm.schemaVersion} to ${newRealm.schemaVersion}`
    );

    // Run all migrations that have not been run yet
    const migrationsToRun = migrations.filter(migrationShouldRun);

    // If there are no migrations to run, we log and finish
    // Again this is redundant since Realm will not call the migration callback
    // if there are no migrations to run, but it's here for clarity
    if (migrationsToRun.length === 0) {
      console.log("No migrations to run");
      return;
    }

    for (const migration of migrationsToRun) {
      console.log(`Running migration: ${migration.name}`);
      runMigration(migration);
    }
  };

// When the app is first installed, migrations are not run because the schema
// has not changed. This means that the migration records are not created.
// If we don't do this, then
// the following situation could happen:
// 1. User installs app and begins using it (migrations aren't present yet since this is a new install)
// 2. We add a new migration
// 3. User upgrades to new version with new migration
// 4. All migrations are run including ones that did not need to run
// 5. User is sad
export const initializeMigrationRecordsIfNecessary = (realm: Realm) => {
  const migrationRecords = realm.objects(MigrationSchema.name);
  if (migrations.length === migrationRecords.length) {
    console.log("Migration records already exist, skipping creation");
    return;
  }
  const migrationRecordNamesSet = new Set(migrationRecords.map((x) => x.name));
  const missingMigrations = migrations.filter(
    (x) => !migrationRecordNamesSet.has(x.name)
  );
  console.log(
    "Migration records missing:",
    missingMigrations.map((x) => x.name)
  );
  realm.write(() => {
    for (const migration of missingMigrations) {
      const migrationRecord: MigrationRecord = {
        id: new Realm.BSON.ObjectId(),
        name: migration.name,
        createdAt: new Date(),
      };
      const newRecord = realm.create(MigrationSchema.name, migrationRecord);
      console.log(`Created migration record: ${newRecord.name}`);
    }
  });
};
