import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { SAMPLE_LISTINGS } from '@/scripts/seed-data'

// run this once to add demo listings to firestore
export async function seedDatabase(userId: string, userName: string) {
  try {
    for (const listing of SAMPLE_LISTINGS) {
      await addDoc(collection(db, 'listings'), {
        ...listing,
        ownerId: userId,
        ownerName: userName,
        createdAt: serverTimestamp()
      })
    }
    console.log('Database seeded!')
    return true
  } catch (err) {
    console.log('Error seeding:', err)
    return false
  }
}
