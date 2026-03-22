import { useState, useEffect } from 'react'
import { View } from 'react-native'
import * as Location from 'expo-location'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useRouter } from 'expo-router'
import MapContent from '@/components/MapContent'

// map screen - shows listings on a map
export default function MapScreen() {
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [region, setRegion] = useState({
    latitude: 13.0827, // default to chennai
    longitude: 80.2707,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05
  })

  useEffect(() => {
    getUserLocation()
    fetchListings()
  }, [])

  async function getUserLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return

      const location = await Location.getCurrentPositionAsync({})
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      })
    } catch (err) {
      console.log('Couldnt get location:', err)
    }
  }

  async function fetchListings() {
    try {
      const snapshot = await getDocs(collection(db, 'listings'))
      // only get listings that have coordinates
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((item: any) => item.latitude && item.longitude)
      setListings(data)
    } catch (err) {
      console.log('Error fetching map listings:', err)
    }
  }

  return (
    <MapContent
      region={region}
      listings={listings}
      onMarkerPress={(id: string) => router.push(`/property/${id}`)}
    />
  )
}
