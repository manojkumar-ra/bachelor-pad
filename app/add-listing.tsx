import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native'
import { useRouter } from 'expo-router'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'
import Colors from '@/constants/Colors'

const TYPES = ['PG', 'Flat', 'Room', '1BHK', '2BHK']
const AMENITY_LIST = ['WiFi', 'AC', 'Parking', 'Laundry', 'Kitchen', 'Gym', 'Power Backup', 'Water Supply', 'Furnished', 'Geyser', 'CCTV', 'Security']

export default function AddListingScreen() {
  const router = useRouter()
  const { user } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('PG')
  const [rent, setRent] = useState('')
  const [location, setLocation] = useState('')
  const [area, setArea] = useState('')
  const [bachelorFriendly, setBachelorFriendly] = useState(true)
  const [amenities, setAmenities] = useState<string[]>([])
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleAmenity(amenity: string) {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity))
    } else {
      setAmenities([...amenities, amenity])
    }
  }

  async function handleSubmit() {
    if (!title.trim()) { Alert.alert('Error', 'Please enter a title'); return }
    if (!rent.trim()) { Alert.alert('Error', 'Please enter monthly rent'); return }
    if (!location.trim()) { Alert.alert('Error', 'Please enter location'); return }
    if (!user) { Alert.alert('Error', 'You need to be logged in'); return }

    setLoading(true)
    try {
      const listingData: any = {
        title: title.trim(),
        description: description.trim(),
        type,
        rent: parseInt(rent),
        location: location.trim(),
        area: area.trim(),
        bachelorFriendly,
        amenities,
        ownerId: user.uid,
        ownerName: user.displayName || 'Unknown',
        avgRating: 0,
        reviewCount: 0,
        createdAt: serverTimestamp()
      }

      // add coords if given
      if (latitude && longitude) {
        listingData.latitude = parseFloat(latitude)
        listingData.longitude = parseFloat(longitude)
      }

      await addDoc(collection(db, 'listings'), listingData)
      Alert.alert('Success', 'Your listing has been posted!', [
        { text: 'OK', onPress: () => router.back() }
      ])
    } catch (err) {
      console.log('Error posting listing:', err)
      Alert.alert('Error', 'Could not post listing. Try again.')
    }
    setLoading(false)
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={styles.heading}>Post Your Property</Text>

      <Text style={styles.label}>Title *</Text>
      <TextInput style={styles.input} placeholder="e.g. Spacious PG near Tech Park" value={title} onChangeText={setTitle} placeholderTextColor={Colors.textLight} />

      <Text style={styles.label}>Property Type *</Text>
      <View style={styles.typeRow}>
        {TYPES.map(t => (
          <TouchableOpacity key={t} style={[styles.typeChip, type === t && styles.typeChipActive]} onPress={() => setType(t)}>
            <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Monthly Rent (Rs) *</Text>
      <TextInput style={styles.input} placeholder="e.g. 8000" value={rent} onChangeText={setRent} keyboardType="numeric" placeholderTextColor={Colors.textLight} />

      <Text style={styles.label}>Location *</Text>
      <TextInput style={styles.input} placeholder="e.g. Koramangala, Bangalore" value={location} onChangeText={setLocation} placeholderTextColor={Colors.textLight} />

      <Text style={styles.label}>Area / Landmark</Text>
      <TextInput style={styles.input} placeholder="e.g. Near Forum Mall" value={area} onChangeText={setArea} placeholderTextColor={Colors.textLight} />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { minHeight: 90, textAlignVertical: 'top' }]} placeholder="Tell more about the property..." value={description} onChangeText={setDescription} multiline numberOfLines={4} placeholderTextColor={Colors.textLight} />

      {/* bachelor toggle */}
      <View style={styles.switchRow}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>Bachelor Friendly</Text>
        <Switch value={bachelorFriendly} onValueChange={setBachelorFriendly} trackColor={{ false: Colors.border, true: Colors.bachelor }} thumbColor={Colors.card} />
      </View>

      {/* amenities */}
      <Text style={styles.label}>Amenities</Text>
      <View style={styles.amenitiesGrid}>
        {AMENITY_LIST.map(amenity => (
          <TouchableOpacity
            key={amenity}
            style={[styles.amenityChip, amenities.includes(amenity) && styles.amenityChipActive]}
            onPress={() => toggleAmenity(amenity)}
          >
            <Text style={[styles.amenityText, amenities.includes(amenity) && { color: Colors.textWhite, fontWeight: '600' }]}>{amenity}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* coordinates */}
      <Text style={styles.label}>Map Coordinates (optional)</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="decimal-pad" placeholderTextColor={Colors.textLight} />
        <TextInput style={[styles.input, { flex: 1 }]} placeholder="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="decimal-pad" placeholderTextColor={Colors.textLight} />
      </View>
      <Text style={{ fontSize: 11, color: Colors.textLight, marginTop: 4, fontStyle: 'italic' }}>
        Tip: Search your address on Google Maps and copy the coordinates
      </Text>

      <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
        <Text style={{ color: Colors.textWhite, fontSize: 16, fontWeight: 'bold' }}>
          {loading ? 'Posting...' : 'Post Listing'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heading: { fontSize: 22, fontWeight: 'bold', color: Colors.primary, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, padding: 12, fontSize: 14, color: Colors.text
  },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border
  },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeChipText: { fontSize: 13, color: Colors.text },
  typeChipTextActive: { color: Colors.textWhite },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, backgroundColor: Colors.card, padding: 14, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border
  },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border
  },
  amenityChipActive: { backgroundColor: Colors.success, borderColor: Colors.success },
  amenityText: { fontSize: 12, color: Colors.text },
  submitBtn: {
    backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 10,
    alignItems: 'center', marginTop: 25
  }
})
