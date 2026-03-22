import { View, Text, StyleSheet } from 'react-native'
import MapView, { Marker, Callout } from 'react-native-maps'
import Colors from '@/constants/Colors'

type Props = {
  region: any
  listings: any[]
  onMarkerPress: (id: string) => void
}

// native map component - only used on ios/android
export default function MapContent({ region, listings, onMarkerPress }: Props) {
  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} region={region} showsUserLocation={true} showsMyLocationButton={true}>
        {listings.map((item: any) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            pinColor={item.bachelorFriendly ? Colors.bachelor : Colors.highlight}
          >
            <Callout onPress={() => onMarkerPress(item.id)}>
              <View style={{ padding: 8, minWidth: 150 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{item.title}</Text>
                <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 2 }}>
                  Rs.{item.rent?.toLocaleString()}/mo
                </Text>
                {item.bachelorFriendly && <Text style={{ fontSize: 11, color: Colors.bachelor, marginTop: 2 }}>Bachelor Friendly</Text>}
                <Text style={{ fontSize: 10, color: Colors.textLight, marginTop: 4 }}>Tap for details</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* legend at bottom */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.bachelor }]} />
          <Text style={{ fontSize: 11 }}>Bachelor Friendly</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.highlight }]} />
          <Text style={{ fontSize: 11 }}>Other</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  legend: {
    position: 'absolute', bottom: 20, left: 20, backgroundColor: Colors.card,
    borderRadius: 10, padding: 10, gap: 6,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 }
})
