import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'
import Colors from '@/constants/Colors'
import PropertyCard from '@/components/PropertyCard'

const PROPERTY_TYPES = ['All', 'PG', 'Flat', 'Room', '1BHK', '2BHK']

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [listings, setListings] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [searchText, setSearchText] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [bachelorOnly, setBachelorOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchListings()
  }, [])

  // refilter whenever filters change
  useEffect(() => {
    filterListings()
  }, [searchText, selectedType, bachelorOnly, listings])

  async function fetchListings() {
    try {
      const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setListings(data)
    } catch (err) {
      console.log('Error fetching listings:', err)
    }
    setLoading(false)
  }

  function filterListings() {
    let result = [...listings]

    // search by text
    if (searchText.trim()) {
      const search = searchText.toLowerCase()
      result = result.filter(item =>
        item.title?.toLowerCase().includes(search) ||
        item.location?.toLowerCase().includes(search) ||
        item.area?.toLowerCase().includes(search)
      )
    }

    // filter by type
    if (selectedType !== 'All') {
      result = result.filter(item => item.type === selectedType)
    }

    // bachelor only filter
    if (bachelorOnly) {
      result = result.filter(item => item.bachelorFriendly === true)
    }

    setFiltered(result)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, {user?.displayName || 'there'} 👋</Text>
          <Text style={styles.headerSubtitle}>Find your perfect pad</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-listing')}>
          <Text style={styles.addBtnText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by location, area..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={Colors.textLight}
        />
      </View>

      {/* filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContainer}>
        {PROPERTY_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={[styles.filterText, selectedType === type && styles.filterTextActive]}>{type}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.filterChip, bachelorOnly && { backgroundColor: Colors.bachelor }]}
          onPress={() => setBachelorOnly(!bachelorOnly)}
        >
          <Text style={[styles.filterText, bachelorOnly && styles.filterTextActive]}>Bachelor ✓</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* listings */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading listings...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 50, marginBottom: 10 }}>🏘️</Text>
          <Text style={styles.emptyText}>No listings found</Text>
          <Text style={styles.emptySubtext}>
            {listings.length === 0 ? 'Be the first to post a listing!' : 'Try changing your filters'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PropertyCard property={item} onPress={() => router.push(`/property/${item.id}`)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    ...(Platform.OS === 'web' ? { maxWidth: 800, alignSelf: 'center' as const, width: '100%' as any } : {})
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: Colors.primary },
  headerSubtitle: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: Colors.textWhite, fontWeight: '600', fontSize: 13 },
  searchRow: { paddingHorizontal: 20, marginTop: 10 },
  searchInput: {
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, padding: 12, fontSize: 14, color: Colors.text
  },
  filterScroll: { maxHeight: 50, marginTop: 12 },
  filterContainer: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, color: Colors.text },
  filterTextActive: { color: Colors.textWhite },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { fontSize: 16, color: Colors.text, fontWeight: '600' },
  emptySubtext: { fontSize: 13, color: Colors.textLight, marginTop: 4 },
  listContent: { padding: 20, gap: 15 },
})
