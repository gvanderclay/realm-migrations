import { RealmMigration } from "../migrations/types";
import { PersonRecord, PersonSchema } from "../schema";

export const migrationAddEmailToPerson1699822619037: RealmMigration = {
  name: "migrationAddEmailToPerson1699822619037",
  migration: (oldRealm, newRealm) => {
    const newObjects = newRealm.objects<PersonRecord>(PersonSchema.name);

    for (let i = 0; i < newObjects.length; i++) {
      const newObject = newObjects[i];
      newObject.email =
        newObject.name.toLowerCase().replace(" ", ".") + "@example.com";
    }
  },
};
