import Realm from "realm";

export const MigrationSchema: Realm.ObjectSchema = {
  name: "MigrationRecord",
  primaryKey: "id",
  properties: {
    id: "objectId",
    name: "string",
    createdAt: "date",
  },
};

export type MigrationRecord = {
  id: Realm.BSON.ObjectId;
  name: string;
  createdAt: Date;
};

export const schema: Required<Realm.Configuration>["schema"] = [
  MigrationSchema,
];