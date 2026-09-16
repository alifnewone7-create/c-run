import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyAo1DFoWoWo-W5zFEf5IqSJN6GB1EHp7Bo',
  authDomain: 'coco-ai-c363d.firebaseapp.com',
  databaseURL:
    'https://coco-ai-c363d-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'coco-ai-c363d',
  storageBucket: 'coco-ai-c363d.firebasestorage.app',
  messagingSenderId: '890556806961',
  appId: '1:890556806961:web:1152bb331ff7d392b2e210',
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getDatabase(app)
export default app
