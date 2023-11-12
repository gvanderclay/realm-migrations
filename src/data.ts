import { PersonRecord, PersonSchema } from "./db/schema";
import Realm from "realm";

const seedData: PersonRecord[] = [
  {
    id: new Realm.BSON.ObjectId(),
    name: "Jotaro Kujo",
    email: "jotaro@kujo.com",
  },
  {
    id: new Realm.BSON.ObjectId(),
    name: "Joseph Joestar",
    email: "joseph@joestar.com",
  },
  {
    id: new Realm.BSON.ObjectId(),
    name: "Muhammad Avdol",
    email: "muhammad@avdol.com",
  },
  {
    id: new Realm.BSON.ObjectId(),
    name: "Dio Brando",
    email: "Dio@Brando.com",
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
