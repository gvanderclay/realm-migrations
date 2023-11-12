// this is an example of how migrations are performed in realm without
// the use of the migration pattern.
import Realm from "realm";

type OldPerson = {
  name: string;
  age: number;
};

type NewPerson = OldPerson & {
  email: string;
};

// Original Schema and config
const PersonSchema = {
  name: "Person",
  properties: {
    name: "string",
    age: "int",
  },
};

const realm = new Realm({
  schemaVersion: 1,
  schema: [PersonSchema],
});

// 1. Add a new property to the schema

// The variable name change is not necessary, I'm just using it to illustrate the schema has changed!
const PersonSchemaV2 = {
  name: "Person",
  properties: {
    name: "string",
    age: "int",
    email: "string",
  },
};

// 2. Increment the schema version
const realmV2WithoutMigration = new Realm({
  schemaVersion: 2,
  schema: [PersonSchemaV2],
});

// 3. Migrate the data
const migration = (oldRealm: Realm, newRealm: Realm) => {
  // Only apply this migration if schemaVersion is 2
  if (oldRealm.schemaVersion < 1) {
    const oldPeople = oldRealm.objects<OldPerson>("Person");
    const newPeople = newRealm.objects<NewPerson>("Person");

    // loop through all objects and set the new 'email' property to a default value
    for (let i = 0; i < oldPeople.length; i++) {
      newPeople[i].email = `${oldPeople[i].name.toLowerCase()}@example.com}`;
    }
  }
};

const realmV2 = new Realm({
  schemaVersion: 2,
  schema: [PersonSchemaV2],
  onMigration: migration,
});
