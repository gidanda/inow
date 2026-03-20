import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { router } from "expo-router";

import { MapPreview } from "../../components/map-preview";
import { useMapSpotsQuery } from "../../hooks/use-map-spots-query";

const SHEET_COLLAPSED_OFFSET = 124;

export default function MapScreen() {
  const spotsQuery = useMapSpotsQuery();
  const spots = spotsQuery.data ?? [];
  const openCreateSpot = () => router.push("/spots/new");
  const sheetTranslateY = useRef(new Animated.Value(SHEET_COLLAPSED_OFFSET)).current;
  const sheetOffsetRef = useRef(SHEET_COLLAPSED_OFFSET);
  const isSheetOpenRef = useRef(false);

  useEffect(() => {
    const listenerId = sheetTranslateY.addListener(({ value }) => {
      sheetOffsetRef.current = value;
    });

    return () => {
      sheetTranslateY.removeListener(listenerId);
    };
  }, [sheetTranslateY]);

  const animateSheet = (toValue: number) => {
    isSheetOpenRef.current = toValue === 0;
    Animated.spring(sheetTranslateY, {
      toValue,
      useNativeDriver: true,
      tension: 80,
      friction: 14
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 4,
      onPanResponderMove: (_, gestureState) => {
        const nextValue = Math.min(
          SHEET_COLLAPSED_OFFSET,
          Math.max(0, sheetOffsetRef.current + gestureState.dy)
        );
        sheetTranslateY.setValue(nextValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldOpen = gestureState.dy < -24 || sheetOffsetRef.current < SHEET_COLLAPSED_OFFSET / 2;
        animateSheet(shouldOpen ? 0 : SHEET_COLLAPSED_OFFSET);
      },
      onPanResponderTerminate: () => {
        animateSheet(isSheetOpenRef.current ? 0 : SHEET_COLLAPSED_OFFSET);
      }
    })
  ).current;

  return (
    <View style={styles.container}>
      {spotsQuery.isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#7a5c3e" />
        </View>
      ) : (
        <MapPreview spots={spots} onSpotPress={(spotId) => router.push(`/spots/${spotId}`)} />
      )}

      <SafeAreaView pointerEvents="box-none" style={styles.overlay}>
        <View style={styles.topBar}>
          <View style={styles.searchBar}>
            <View pointerEvents="none" style={styles.glassHighlight} />
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              placeholder="スポットを検索"
              placeholderTextColor="#7d7268"
              style={styles.searchInput}
            />
          </View>
          <Pressable style={styles.menuButton}>
            <View pointerEvents="none" style={styles.glassHighlight} />
            <View style={styles.menuGlyph}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </View>
          </Pressable>
        </View>

        <View pointerEvents="box-none" style={styles.bottomOverlay}>
          <Animated.View
            style={[styles.spotPanel, { transform: [{ translateY: sheetTranslateY }] }]}
            {...panResponder.panHandlers}
          >
            <View pointerEvents="none" style={styles.sheetGlow} />
            <Pressable
              style={styles.sheetHandleArea}
              onPress={() => animateSheet(isSheetOpenRef.current ? SHEET_COLLAPSED_OFFSET : 0)}
            >
              <View style={styles.sheetHandle} />
              <Text style={styles.spotCount}>
                {spots.length > 0 ? `${spots.length} spots loaded` : "No spots available yet."}
              </Text>
            </Pressable>

            <ScrollView
              contentContainerStyle={styles.spotList}
              showsVerticalScrollIndicator={false}
              style={styles.spotListScroll}
            >
              {spots.slice(0, 8).map((spot) => (
                <Pressable key={spot.id} style={styles.spotChip} onPress={() => router.push(`/spots/${spot.id}`)}>
                  <View pointerEvents="none" style={styles.chipHighlight} />
                  <Text style={styles.spotChipLabel}>{spot.name}</Text>
                </Pressable>
              ))}
              <Pressable style={styles.hiddenAction} onPress={openCreateSpot}>
                <Text style={styles.hiddenActionLabel}>新規スポット作成導線</Text>
              </Pressable>
            </ScrollView>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d9d4cc"
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between"
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(245,246,250,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#6d7a95",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  searchIcon: {
    color: "#5e544b",
    fontSize: 18
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: "#2c241e",
    fontSize: 16
  },
  menuButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(245,246,250,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    shadowColor: "#6d7a95",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  menuGlyph: {
    width: 20,
    height: 18,
    justifyContent: "space-between"
  },
  menuLine: {
    height: 3,
    borderRadius: 999,
    backgroundColor: "#302923"
  },
  bottomOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 0
  },
  spotPanel: {
    minHeight: 260,
    maxHeight: 340,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(244,246,250,0.82)",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(255,255,255,0.74)",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 28,
    shadowColor: "#71829d",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 14
  },
  sheetHandleArea: {
    alignItems: "center",
    paddingBottom: 12
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(205,212,223,0.95)",
    marginBottom: 12
  },
  spotCount: {
    color: "#4c5564",
    fontSize: 14,
    fontWeight: "600"
  },
  spotListScroll: {
    flexGrow: 0
  },
  spotList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 8
  },
  spotChip: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.68)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.74)",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  spotChipLabel: {
    color: "#2c241e",
    fontWeight: "600"
  },
  glassHighlight: {
    position: "absolute",
    top: 1,
    left: 1,
    right: 1,
    height: "52%",
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.2)"
  },
  sheetGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 88,
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  chipHighlight: {
    position: "absolute",
    top: 1,
    left: 1,
    right: 1,
    height: "55%",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)"
  },
  hiddenAction: {
    width: 0,
    height: 0,
    opacity: 0
  },
  hiddenActionLabel: {
    fontSize: 0
  }
});
