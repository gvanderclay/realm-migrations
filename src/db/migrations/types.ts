import type Realm from "realm";

export type RealmMigration = {
  name: string;
  migration: (oldRealm: Realm, newRealm: Realm) => void;
};
