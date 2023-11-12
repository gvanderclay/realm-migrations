import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import "react-native-get-random-values";
import { initializeRealm } from "./src/data";
import { createRealm } from "./src/db/realm";
import { PersonRecord, PersonSchema } from "./src/db/schema";

const realm = createRealm();
initializeRealm(realm);

export default function App() {
  const [data, setData] = useState<PersonRecord[]>([]);
  useEffect(() => {
    const people = realm.objects<PersonRecord>(PersonSchema.name);
    setData([...people]);
  }, []);
  return (
    <View style={styles.container}>
      {data.map((person) => (
        <View key={person.id.toHexString()}>
          <Text>{`Name: ${person.name}`}</Text>
          <Text>{`Email: ${person.email}`}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
