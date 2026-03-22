import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'
import Colors from '@/constants/Colors'

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [otherName, setOtherName] = useState('')
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    if (!id) return
    loadChatInfo()

    // realtime listener for messages
    const q = query(
      collection(db, 'chatRooms', id as string, 'messages'),
      orderBy('createdAt', 'asc')
    )
    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setMessages(msgs)
      // scroll to bottom
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    })

    return unsubscribe
  }, [id])

  async function loadChatInfo() {
    try {
      const chatDoc = await getDoc(doc(db, 'chatRooms', id as string))
      if (chatDoc.exists()) {
        const data = chatDoc.data()
        const otherId = data.participants.find((p: string) => p !== user?.uid)
        if (otherId) {
          const userDoc = await getDoc(doc(db, 'users', otherId))
          if (userDoc.exists()) setOtherName(userDoc.data().name)
        }
      }
    } catch (err) {
      console.log('Error loading chat info:', err)
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !user) return
    const msgText = newMessage.trim()
    setNewMessage('') // clear immediately

    try {
      // add to messages subcollection
      await addDoc(collection(db, 'chatRooms', id as string, 'messages'), {
        text: msgText,
        senderId: user.uid,
        senderName: user.displayName || 'Unknown',
        createdAt: serverTimestamp()
      })
      // update last message in chat room
      await updateDoc(doc(db, 'chatRooms', id as string), {
        lastMessage: msgText,
        lastMessageTime: serverTimestamp()
      })
    } catch (err) {
      console.log('Error sending message:', err)
    }
  }

  function formatTime(timestamp: any) {
    if (!timestamp) return ''
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function renderMessage({ item }: { item: any }) {
    const isMe = item.senderId === user?.uid
    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowRight : styles.msgRowLeft]}>
        <View style={[styles.msgBubble, isMe ? styles.myBubble : styles.otherBubble]}>
          {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
          <Text style={[styles.msgText, { color: isMe ? Colors.textWhite : Colors.text }]}>{item.text}</Text>
          <Text style={[styles.msgTime, { color: isMe ? 'rgba(255,255,255,0.6)' : Colors.textLight }]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      {/* who you're chatting with */}
      {otherName ? (
        <View style={styles.chatHeader}>
          <View style={styles.headerAvatar}>
            <Text style={{ color: Colors.textWhite, fontWeight: 'bold', fontSize: 15 }}>{otherName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text }}>{otherName}</Text>
        </View>
      ) : null}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.msgList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
            <Text style={{ color: Colors.textLight }}>No messages yet. Say hello! 👋</Text>
          </View>
        }
      />

      {/* input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          placeholderTextColor={Colors.textLight}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !newMessage.trim() && { opacity: 0.4 }]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Text style={{ color: Colors.textWhite, fontWeight: '600', fontSize: 14 }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 15,
    paddingVertical: 10, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border
  },
  headerAvatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center'
  },
  msgList: { padding: 15, gap: 8, flexGrow: 1 },
  msgRow: { marginBottom: 4 },
  msgRowRight: { alignItems: 'flex-end' },
  msgRowLeft: { alignItems: 'flex-start' },
  msgBubble: { maxWidth: '75%', padding: 10, borderRadius: 12 },
  myBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: Colors.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  senderName: { fontSize: 11, color: Colors.accent, fontWeight: '600', marginBottom: 2 },
  msgText: { fontSize: 14, lineHeight: 19 },
  msgTime: { fontSize: 10, marginTop: 3, alignSelf: 'flex-end' },
  inputRow: {
    flexDirection: 'row', padding: 10, paddingHorizontal: 15, backgroundColor: Colors.card,
    borderTopWidth: 1, borderTopColor: Colors.border, alignItems: 'flex-end', gap: 8
  },
  textInput: {
    flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 20,
    paddingHorizontal: 15, paddingVertical: 8, fontSize: 14, color: Colors.text, maxHeight: 100
  },
  sendBtn: { backgroundColor: Colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 }
})
