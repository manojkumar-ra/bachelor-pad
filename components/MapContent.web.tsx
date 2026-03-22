import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import Colors from '@/constants/Colors'

type Props = {
  region: any
  listings: any[]
  onMarkerPress: (id: string) => void
}

// web version - cant use react-native-maps on web so just show a list
export default function MapContent({ listings, onMarkerPress }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Property Locations</Text>
      <Text style={styles.subtitle}>Map view is available on mobile. Here are the listings:</Text>

      <FlatList
        data={listings}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onMarkerPress(item.id)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: Colors.textLight, marginTop: 2 }}>{item.location}</Text>
                <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.primary, marginTop: 4 }}>
                  Rs.{item.rent?.toLocaleString()}/mo
                </Text>
              </View>
              {item.bachelorFriendly && (
                <View style={styles.badge}>
                  <Text style={{ color: Colors.textWhite, fontSize: 10, fontWeight: '600' }}>Bachelor OK</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.primary, paddingHorizontal: 20, paddingTop: 50 },
  subtitle: { fontSize: 13, color: Colors.textLight, paddingHorizontal: 20, marginTop: 4 },
  card: {
    backgroundColor: Colors.card, padding: 15, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border
  },
  badge: { backgroundColor: Colors.bachelor, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }
})
