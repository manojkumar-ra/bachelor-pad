import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, TextInput } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'
import Colors from '@/constants/Colors'

// placeholder images
const IMAGES: any = {
  PG: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
  Flat: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600',
  Room: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600',
  '1BHK': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
  '2BHK': 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600'
}

export default function PropertyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [property, setProperty] = useState<any>(null)
  const [ownerName, setOwnerName] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(5)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadProperty()
  }, [id])

  async function loadProperty() {
    try {
      const docSnap = await getDoc(doc(db, 'listings', id as string))
      if (docSnap.exists()) {
        const data = docSnap.data()
        setProperty(data)

        // get owner name
        if (data.ownerId) {
          const ownerDoc = await getDoc(doc(db, 'users', data.ownerId))
          if (ownerDoc.exists()) setOwnerName(ownerDoc.data().name)
        }

        // check if favorited
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const favs = userDoc.data().favorites || []
            setIsFavorite(favs.includes(id))
          }
        }
        loadReviews()
      }
    } catch (err) {
      console.log('Error loading property:', err)
    }
    setLoading(false)
  }

  async function loadReviews() {
    try {
      const q = query(collection(db, 'reviews'), where('listingId', '==', id))
      const snapshot = await getDocs(q)
      setReviews(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.log('Error loading reviews:', err)
    }
  }

  async function toggleFavorite() {
    if (!user) return
    try {
      const userRef = doc(db, 'users', user.uid)
      if (isFavorite) {
        await updateDoc(userRef, { favorites: arrayRemove(id) })
      } else {
        await updateDoc(userRef, { favorites: arrayUnion(id) })
      }
      setIsFavorite(!isFavorite)
    } catch (err) {
      console.log('Error toggling favorite:', err)
    }
  }

  async function submitReview() {
    if (!reviewText.trim()) { Alert.alert('Error', 'Please write a review'); return }
    if (!user) return

    try {
      await addDoc(collection(db, 'reviews'), {
        listingId: id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        text: reviewText.trim(),
        rating: rating,
        createdAt: new Date().toISOString()
      })

      // update avg rating
      const newReviews = [...reviews, { rating }]
      const avg = newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length
      await updateDoc(doc(db, 'listings', id as string), {
        avgRating: Math.round(avg * 10) / 10,
        reviewCount: newReviews.length
      })

      setReviewText('')
      setRating(5)
      loadReviews()
      Alert.alert('Thanks!', 'Your review has been posted')
    } catch (err) {
      console.log('Error posting review:', err)
      Alert.alert('Error', 'Couldnt post review')
    }
  }

  // start chat with owner
  async function startChat() {
    if (!user || !property) return
    try {
      // check if chat already exists between these two users for this listing
      const q = query(collection(db, 'chatRooms'), where('participants', 'array-contains', user.uid))
      const snapshot = await getDocs(q)
      const existing = snapshot.docs.find(d => {
        const data = d.data()
        return data.listingId === id && data.participants.includes(property.ownerId)
      })

      if (existing) {
        router.push(`/chat/${existing.id}`)
        return
      }

      // create new chat
      const chatRef = await addDoc(collection(db, 'chatRooms'), {
        participants: [user.uid, property.ownerId],
        listingId: id,
        listingTitle: property.title,
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp()
      })
      router.push(`/chat/${chatRef.id}`)
    } catch (err) {
      console.log('Error starting chat:', err)
      Alert.alert('Error', 'Couldnt start chat')
    }
  }

  if (loading) return <View style={styles.center}><Text>Loading...</Text></View>
  if (!property) return <View style={styles.center}><Text>Property not found</Text></View>

  const imageUrl = property.images?.[0] || IMAGES[property.type] || IMAGES.Flat

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />

      {/* fav button */}
      <TouchableOpacity style={styles.favBtn} onPress={toggleFavorite}>
        <Text style={{ fontSize: 20 }}>{isFavorite ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{property.title}</Text>
          {property.bachelorFriendly && (
            <View style={styles.bachelorBadge}><Text style={styles.badgeText}>Bachelor Friendly</Text></View>
          )}
        </View>

        <Text style={styles.location}>📍 {property.location || 'Location not specified'}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{property.rent?.toLocaleString()}/month</Text>
          <View style={styles.typeChip}><Text style={styles.typeText}>{property.type}</Text></View>
        </View>

        {/* description */}
        {property.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>
        ) : null}

        {/* amenities */}
        {property.amenities && property.amenities.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {property.amenities.map((a: string, i: number) => (
                <View key={i} style={styles.amenityItem}>
                  <Text style={{ color: Colors.success, fontWeight: 'bold' }}>✓</Text>
                  <Text style={styles.amenityLabel}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* owner */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Posted by</Text>
          <View style={styles.ownerRow}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerInitial}>{ownerName.charAt(0).toUpperCase() || '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.text }}>{ownerName}</Text>
              <Text style={{ fontSize: 11, color: Colors.textLight }}>Property Owner</Text>
            </View>
            {property.ownerId !== user?.uid && (
              <TouchableOpacity style={styles.chatBtn} onPress={startChat}>
                <Text style={styles.chatBtnText}>Chat Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
          {reviews.map(review => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontWeight: '600', fontSize: 13, color: Colors.text }}>{review.userName}</Text>
                <Text style={{ fontSize: 12 }}>{'⭐'.repeat(review.rating)}</Text>
              </View>
              <Text style={{ fontSize: 13, color: Colors.textLight, lineHeight: 18 }}>{review.text}</Text>
            </View>
          ))}

          {/* write review */}
          {user && property.ownerId !== user.uid && (
            <View style={styles.addReview}>
              <Text style={{ fontWeight: '600', fontSize: 14 }}>Write a Review</Text>
              <View style={{ flexDirection: 'row', gap: 5 }}>
                {[1,2,3,4,5].map(num => (
                  <TouchableOpacity key={num} onPress={() => setRating(num)}>
                    <Text style={{ fontSize: 28, color: num <= rating ? Colors.star : Colors.border }}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.reviewInput}
                placeholder="Share your experience..."
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={3}
                placeholderTextColor={Colors.textLight}
              />
              <TouchableOpacity style={styles.submitBtn} onPress={submitReview}>
                <Text style={{ color: Colors.textWhite, fontWeight: '600', fontSize: 13 }}>Post Review</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250, backgroundColor: Colors.border },
  favBtn: {
    position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(255,255,255,0.9)',
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center'
  },
  content: { padding: 20, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.primary },
  bachelorBadge: { backgroundColor: Colors.bachelor, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: Colors.textWhite, fontSize: 11, fontWeight: '600' },
  location: { fontSize: 14, color: Colors.textLight },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 22, fontWeight: 'bold', color: Colors.success },
  typeChip: { backgroundColor: Colors.accent, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  typeText: { color: Colors.textWhite, fontSize: 12, fontWeight: '600' },
  section: { marginTop: 10, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  description: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 5,
    borderWidth: 1, borderColor: Colors.border
  },
  amenityLabel: { fontSize: 12, color: Colors.text },
  ownerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card,
    padding: 12, borderRadius: 10, borderWidth: 1, borderColor: Colors.border
  },
  ownerAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center'
  },
  ownerInitial: { color: Colors.textWhite, fontSize: 18, fontWeight: 'bold' },
  chatBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  chatBtnText: { color: Colors.textWhite, fontSize: 13, fontWeight: '600' },
  reviewItem: {
    backgroundColor: Colors.card, padding: 12, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border
  },
  addReview: {
    backgroundColor: Colors.card, padding: 14, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, gap: 10
  },
  reviewInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10,
    fontSize: 13, color: Colors.text, textAlignVertical: 'top', minHeight: 70
  },
  submitBtn: { backgroundColor: Colors.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' }
})
