import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'expo-router'
import Colors from '@/constants/Colors'

export default function MessagesScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchChats()
  }, [user])

  async function fetchChats() {
    try {
      // get chat rooms where current user is a participant
      const q = query(collection(db, 'chatRooms'), where('participants', 'array-contains', user?.uid))
      const snapshot = await getDocs(q)

      const chatList = []
      for (const chatDoc of snapshot.docs) {
        const data = chatDoc.data()
        // find the other person
        const otherId = data.participants.find((p: string) => p !== user?.uid)
        let otherName = 'Unknown'
        if (otherId) {
          const userDoc = await getDoc(doc(db, 'users', otherId))
          if (userDoc.exists()) otherName = userDoc.data().name
        }

        chatList.push({
          id: chatDoc.id,
          otherName,
          lastMessage: data.lastMessage || 'No messages yet',
          lastMessageTime: data.lastMessageTime,
          listingTitle: data.listingTitle || ''
        })
      }

      // sort by most recent
      chatList.sort((a, b) => {
        if (!a.lastMessageTime) return 1
        if (!b.lastMessageTime) return -1
        return b.lastMessageTime.seconds - a.lastMessageTime.seconds
      })
      setChats(chatList)
    } catch (err) {
      console.log('Error loading chats:', err)
    }
    setLoading(false)
  }

  // helper to show relative time
  function formatTime(timestamp: any) {
    if (!timestamp) return ''
    const date = new Date(timestamp.seconds * 1000)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'Just now'
    if (hours < 24) return hours + 'h ago'
    const days = Math.floor(hours / 24)
    if (days === 1) return 'Yesterday'
    return days + 'd ago'
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Messages 💬</Text>

      {loading ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Loading chats...</Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={{ fontSize: 50, marginBottom: 10 }}>📭</Text>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start a conversation by enquiring about a property</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chatItem} onPress={() => router.push(`/chat/${item.id}`)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.otherName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.chatTopRow}>
                  <Text style={styles.chatName}>{item.otherName}</Text>
                  <Text style={styles.chatTime}>{formatTime(item.lastMessageTime)}</Text>
                </View>
                {item.listingTitle ? <Text style={styles.listingTitle} numberOfLines={1}>Re: {item.listingTitle}</Text> : null}
                <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { fontSize: 24, fontWeight: 'bold', color: Colors.primary, paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.text },
  emptySubtext: { fontSize: 13, color: Colors.textLight, marginTop: 4, textAlign: 'center', paddingHorizontal: 40 },
  chatItem: {
    flexDirection: 'row', padding: 15, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: Colors.border, alignItems: 'center', gap: 12
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.textWhite, fontSize: 18, fontWeight: 'bold' },
  chatInfo: { flex: 1, gap: 2 },
  chatTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  chatName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  chatTime: { fontSize: 11, color: Colors.textLight },
  listingTitle: { fontSize: 12, color: Colors.accent },
  lastMsg: { fontSize: 13, color: Colors.textLight }
})
