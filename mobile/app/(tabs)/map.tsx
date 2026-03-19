import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { router } from "expo-router";

import { ScreenShell } from "../../components/screen-shell";
import { useMapSpotsQuery } from "../../hooks/use-map-spots-query";

export default function MapScreen() {
  const spotsQuery = useMapSpotsQuery();
  const spots = spotsQuery.data ?? [];

  return (
    <ScreenShell
      title="Map"
      body="Current area map, nearby spots, and quick add actions will live here."
    >
      <Pressable style={styles.addButton} onPress={() => router.push("/spots/new")}>
        <Text style={styles.addButtonText}>スポットを追加</Text>
      </Pressable>
      {spotsQuery.isLoading ? (
        <ActivityIndicator size="large" color="#7a5c3e" style={styles.loader} />
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: spots[0]?.latitude ?? 35.703,
            longitude: spots[0]?.longitude ?? 139.579,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08
          }}
        >
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
              title={spot.name}
              description={spot.formatted_address}
              onCalloutPress={() => router.push(`/spots/${spot.id}`)}
            />
          ))}
        </MapView>
      )}
      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>Visible spots</Text>
        <Text style={styles.footerBody}>
          {spots.length > 0 ? `${spots.length} spots loaded from the API.` : "No spots available yet."}
        </Text>
        {spots.slice(0, 3).map((spot) => (
          <Pressable key={spot.id} onPress={() => router.push(`/spots/${spot.id}`)}>
            <Text style={styles.link}>{spot.name}</Text>
          </Pressable>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  map: {
    marginTop: 16,
    height: 320,
    borderRadius: 20
  },
  loader: {
    marginTop: 32
  },
  addButton: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: "#7a5c3e",
    paddingVertical: 14,
    alignItems: "center"
  },
  addButtonText: {
    color: "#fffdf8",
    fontWeight: "700"
  },
  footerCard: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: "#fffdf8",
    padding: 16,
    borderWidth: 1,
    borderColor: "#e7dccb"
  },
  footerTitle: {
    color: "#2c241e",
    fontSize: 17,
    fontWeight: "700"
  },
  footerBody: {
    marginTop: 6,
    color: "#6a5a4e",
    fontSize: 14
  },
  link: {
    marginTop: 8,
    color: "#7a5c3e",
    fontWeight: "700"
  }
});
