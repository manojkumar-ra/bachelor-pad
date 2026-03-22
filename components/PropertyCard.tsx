import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import Colors from '@/constants/Colors'

type Props = {
  property: any
  onPress: () => void
}

// placeholder images for different types
const IMAGES: any = {
  PG: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
  Flat: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
  Room: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400',
  '1BHK': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
  '2BHK': 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=400'
}

export default function PropertyCard({ property, onPress }: Props) {
  const imageUrl = property.images?.[0] || IMAGES[property.type] || IMAGES.Flat

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: imageUrl }} style={styles.image} />

      {/* bachelor badge */}
      {property.bachelorFriendly && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Bachelor Friendly</Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
          <Text style={styles.type}>{property.type}</Text>
        </View>
        <Text style={styles.location} numberOfLines={1}>📍 {property.location || 'Location not specified'}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>₹{property.rent?.toLocaleString() || 'N/A'}/mo</Text>
          <View style={styles.ratingRow}>
            <Text style={{ fontSize: 14 }}>⭐</Text>
            <Text style={styles.rating}>{property.avgRating?.toFixed(1) || 'New'}</Text>
          </View>
        </View>

        {/* show first 3 amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <View style={styles.amenitiesRow}>
            {property.amenities.slice(0, 3).map((a: string, i: number) => (
              <View key={i} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
            {property.amenities.length > 3 && (
              <Text style={styles.moreText}>+{property.amenities.length - 3} more</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card, borderRadius: 12, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4
  },
  image: { width: '100%', height: 180, backgroundColor: Colors.border },
  badge: {
    position: 'absolute', top: 10, left: 10, backgroundColor: Colors.bachelor,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12
  },
  badgeText: { color: Colors.textWhite, fontSize: 11, fontWeight: '600' },
  info: { padding: 14, gap: 6 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: Colors.text, flex: 1, marginRight: 8 },
  type: {
    fontSize: 11, color: Colors.accent, backgroundColor: Colors.background,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, fontWeight: '600'
  },
  location: { fontSize: 13, color: Colors.textLight },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  price: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 13, fontWeight: '600', color: Colors.text },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  amenityChip: { backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  amenityText: { fontSize: 11, color: Colors.textLight },
  moreText: { fontSize: 11, color: Colors.textLight, alignSelf: 'center' }
})
