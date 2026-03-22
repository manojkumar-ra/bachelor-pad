import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import { signOut } from 'firebase/auth'
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'
import Colors from '@/constants/Colors'
import PropertyCard from '@/components/PropertyCard'
import { seedDatabase } from '@/utils/seedDatabase'

export default function ProfileScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [myListings, setMyListings] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'listings' | 'favorites'>('listings')

  useEffect(() => {
    if (user) {
      loadUserData()
      loadMyListings()
    }
  }, [user])

  async function loadUserData() {
    try {
      const userDoc = await getDoc(doc(db, 'users', user!.uid))
      if (userDoc.exists()) {
        setUserData(userDoc.data())
        // also load favorites
        const favIds = userDoc.data().favorites || []
        if (favIds.length > 0) {
          const favListings = []
          for (const id of favIds) {
            const listingDoc = await getDoc(doc(db, 'listings', id))
            if (listingDoc.exists()) {
              favListings.push({ id: listingDoc.id, ...listingDoc.data() })
            }
          }
          setFavorites(favListings)
        }
      }
    } catch (err) {
      console.log('Error loading user:', err)
    }
  }

  async function loadMyListings() {
    try {
      const q = query(collection(db, 'listings'), where('ownerId', '==', user!.uid))
      const snapshot = await getDocs(q)
      setMyListings(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.log('Error loading my listings:', err)
    }
  }

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await signOut(auth)
        router.replace('/')
      }}
    ])
  }

  const displayData = activeTab === 'listings' ? myListings : favorites

  return (
    <SafeAreaView style={styles.container}>
      {/* profile info */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarBig}>
          <Text style={styles.avatarText}>{user?.displayName?.charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {userData?.isOwner && (
          <View style={styles.ownerBadge}>
            <Text style={styles.ownerBadgeText}>Property Owner</Text>
          </View>
        )}
      </View>

      {/* stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{myListings.length}</Text>
          <Text style={styles.statLabel}>Listings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
      </View>

      {/* tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, activeTab === 'listings' && styles.tabActive]} onPress={() => setActiveTab('listings')}>
          <Text style={[styles.tabText, activeTab === 'listings' && styles.tabTextActive]}>My Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'favorites' && styles.tabActive]} onPress={() => setActiveTab('favorites')}>
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>Favorites</Text>
        </TouchableOpacity>
      </View>

      {displayData.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            {activeTab === 'listings' ? "You haven't posted any listings yet" : 'No favorites saved yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <PropertyCard property={item} onPress={() => router.push(`/property/${item.id}`)} />
          )}
          contentContainerStyle={{ padding: 20, gap: 15 }}
        />
      )}

      {/* buttons at bottom */}
      <View style={styles.bottomBtns}>
        <TouchableOpacity style={styles.postBtn} onPress={() => router.push('/add-listing')}>
          <Text style={styles.postBtnText}>+ Post Listing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* seed button - only shows if no listings, for demo */}
      {myListings.length === 0 && (
        <TouchableOpacity
          style={styles.seedBtn}
          onPress={async () => {
            const ok = await seedDatabase(user!.uid, user!.displayName || 'Owner')
            if (ok) {
              Alert.alert('Done!', 'Sample listings added. Go to Home to see them.')
              loadMyListings()
            }
          }}
        >
          <Text style={styles.seedBtnText}>Load Sample Listings (Demo)</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileHeader: { alignItems: 'center', paddingTop: 50, paddingBottom: 15 },
  avatarBig: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10
  },
  avatarText: { color: Colors.textWhite, fontSize: 28, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  userEmail: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  ownerBadge: { backgroundColor: Colors.bachelor, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  ownerBadgeText: { color: Colors.textWhite, fontSize: 11, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 40, paddingVertical: 15,
    borderBottomWidth: 1, borderBottomColor: Colors.border
  },
  statItem: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textLight },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 10, gap: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: Colors.card },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.text },
  tabTextActive: { color: Colors.textWhite },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, color: Colors.textLight },
  bottomBtns: { flexDirection: 'row', padding: 15, gap: 10 },
  postBtn: { flex: 1, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  postBtnText: { color: Colors.textWhite, fontWeight: '600' },
  logoutBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: Colors.error },
  logoutBtnText: { color: Colors.error, fontWeight: '600' },
  seedBtn: { marginHorizontal: 15, marginBottom: 10, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: Colors.success },
  seedBtnText: { color: Colors.textWhite, fontWeight: '600', fontSize: 13 },
})
