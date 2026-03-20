import { Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { env } from "../lib/env";
import type { SpotSummary } from "../services/api";

type MapPreviewProps = {
  spots: SpotSummary[];
  onSpotPress?: (spotId: string) => void;
};

export function MapPreview({ spots, onSpotPress }: MapPreviewProps) {
  const isMapKitPreview = env.mapProvider === "mapkit" && Platform.OS === "ios";

  if (!isMapKitPreview) {
    return (
      <View style={styles.root}>
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>MapKit 検証中</Text>
          <Text style={styles.noticeBody}>
            現在の地図表示は iOS の MapKit を検証用に使っています。Google Maps API への切り替え時は、この
            コンポーネントを差し替えて Android と Web にも地図描画を広げます。
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <MapView
        style={styles.map}
        mapType="mutedStandard"
        showsCompass
        showsScale
        pitchEnabled={false}
        rotateEnabled={false}
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
            onCalloutPress={() => onSpotPress?.(spot.id)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 32
  },
  map: {
    flex: 1
  },
  noticeCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#fff8ef",
    padding: 18,
    borderWidth: 1,
    borderColor: "#e7dccb",
    justifyContent: "center"
  },
  noticeTitle: {
    color: "#2c241e",
    fontSize: 17,
    fontWeight: "700"
  },
  noticeBody: {
    marginTop: 8,
    color: "#6a5a4e",
    fontSize: 14,
    lineHeight: 20
  }
});
