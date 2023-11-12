import { PersonRecord, PersonSchema } from "./db/schema";
import Realm from "realm";

const seedData: PersonRecord[] = [
  {
    id: new Realm.BSON.ObjectId(),
    name: "Jotaro Kujo",
  },
  {
    id: new Realm.BSON.ObjectId(),
    name: "Joseph Joestar",
  },
  {
    id: new Realm.BSON.ObjectId(),
    name: "Muhammad Avdol",
  },
  {
    id: new Realm.BSON.ObjectId(),
    name: "Dio Brando",
  },
];

const seedDataExists = (realm: Realm): boolean => {
  return realm.objects<PersonRecord>(PersonSchema.name).length > 0;
};

export const initializeRealm = (realm: Realm): void => {
  if (seedDataExists(realm)) {
    return;
  }

  realm.write(() => {
    seedData.forEach((person) => {
      realm.create<PersonRecord>(PersonSchema.name, person);
    });
  });
};
