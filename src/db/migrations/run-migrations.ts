import Realm from "realm";
import { MigrationRecord, MigrationSchema } from "../schema";
import { RealmMigration } from "./types";
import { migrations } from "./migrations";

export const buildMigrationRunner =
  (migrations: RealmMigration[]): Realm.MigrationCallback =>
  (oldRealm, newRealm) => {
    const migrationShouldRun = (migration: RealmMigration) => {
      const migrationRecords = oldRealm.objects(MigrationSchema.name);
      return (
        migrationRecords.filtered("name = $0", migration.name).length === 0
      );
    };
    const createMigrationRecord = (migration: RealmMigration) => {
      const migrationRecord: MigrationRecord = {
        id: new Realm.BSON.ObjectId(),
        name: migration.name,
        createdAt: new Date(),
      };
      const newRecord = newRealm.create(MigrationSchema.name, migrationRecord);
      console.log(`Created migration record: ${newRecord.name}`);
    };
    const runMigration = (migration: RealmMigration) => {
      if (!migrationShouldRun(migration)) {
        return;
      }
      migration.migration(oldRealm, newRealm);
      createMigrationRecord(migration);
    };
    if (oldRealm.schemaVersion === newRealm.schemaVersion) {
      console.log("Realm schema version is the same, skipping migrations");
      return;
    }
    console.log(
      `Migrating Realm from version ${oldRealm.schemaVersion} to ${newRealm.schemaVersion}`
    );
    const migrationsToRun = migrations.filter(migrationShouldRun);
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
