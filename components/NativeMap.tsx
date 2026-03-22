import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import Colors from "@/constants/Colors";

type Props = {
  region: any;
  listings: any[];
  onMarkerPress: (id: string) => void;
};

export default function NativeMap({ region, listings, onMarkerPress }: Props) {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {listings.map((item: any) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            pinColor={item.bachelorFriendly ? Colors.bachelor : Colors.highlight}
          >
            <Callout onPress={() => onMarkerPress(item.id)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{item.title}</Text>
                <Text style={styles.calloutPrice}>
                  ₹{item.rent?.toLocaleString()}/mo
                </Text>
                {item.bachelorFriendly && (
                  <Text style={styles.calloutBadge}>Bachelor Friendly</Text>
                )}
                <Text style={styles.calloutTap}>Tap for details</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.bachelor }]} />
          <Text style={styles.legendText}>Bachelor Friendly</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.highlight }]} />
          <Text style={styles.legendText}>Other</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  callout: { padding: 8, minWidth: 150 },
  calloutTitle: { fontWeight: "bold", fontSize: 14, color: Colors.text },
  calloutPrice: { fontSize: 13, color: Colors.primary, fontWeight: "600", marginTop: 2 },
  calloutBadge: { fontSize: 11, color: Colors.bachelor, marginTop: 2 },
  calloutTap: { fontSize: 10, color: Colors.textLight, marginTop: 4 },
  legend: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 10,
    gap: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: Colors.text },
});
