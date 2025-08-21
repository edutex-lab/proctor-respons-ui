

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Auth, onAuthStateChanged, type User } from 'firebase/auth';
import { type Firestore} from 'firebase/firestore';
import { type FirebaseStorage} from 'firebase/storage';
import { auth, db, storage } from '../services/firebase'; // Impor instance dari file konfigurasi

// 1. Definisikan tipe untuk value dari context, sekarang termasuk user dan isLoading
interface FirebaseContextType {
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  user: User | null; // State untuk menyimpan data pengguna yang sedang login
  isLoading: boolean; // State untuk menandakan proses pengecekan auth sedang berjalan
}

// 2. Buat Context dengan nilai awal null
const FirebaseContext = createContext<FirebaseContextType | null>(null);

// 3. Buat Provider Component
interface FirebaseProviderProps {
  children: ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  // State untuk menyimpan user dan status loading
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Gunakan useEffect untuk memantau perubahan status otentikasi
  useEffect(() => {
    // onAuthStateChanged mengembalikan fungsi 'unsubscribe'
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Ketika status berubah, update state user
      setUser(currentUser);
      // Seteah pengecekan pertama selesai, set loading menjadi false
      setIsLoading(false);
    });

    // Cleanup function: Hentikan listener saat komponen di-unmount
    // untuk mencegah memory leak.
    return () => unsubscribe();
  }, []); // Dependency array kosong agar efek ini hanya berjalan sekali saat mount

  // Nilai yang akan disediakan untuk semua komponen di dalamnya
  const value: FirebaseContextType = {
    auth,
    db,
    user,
    storage,
    isLoading,
  };

  // Jangan render children sebelum pengecekan auth selesai
  // Ini mencegah "flicker" (tampilan singkat halaman login saat user sudah login)
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

// 4. Custom Hook untuk mempermudah penggunaan context (tidak ada perubahan di sini)
export function useFirebase() {
  const context = useContext(FirebaseContext);

  if (!context) {
    // Pesan error ini akan muncul jika hook digunakan di luar provider
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }

  return context;
}
