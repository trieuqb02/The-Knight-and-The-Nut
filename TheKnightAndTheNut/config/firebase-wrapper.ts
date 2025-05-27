import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child } from "firebase/database";

const firebaseConfig = {
  
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export async function writeData(path: string, data: any): Promise<boolean> {
  const dataRef = ref(db, path);
  const snapshot = await get(dataRef);
  if (snapshot.exists()) {
    console.log(`⚠ UserId ${path} đã tồn tại, không ghi đè!`);
    return false;
  } else {
    await set(dataRef, data);
    return true;
  }
}

export async function getUser(userId: string): Promise<any | null> {
  try {
    const userRef = ref(db, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
}

export function updateData(path: string, data: any): void {
  const dataRef = ref(db, path);
  set(dataRef, data)
    .then(() => console.log("✅ Dữ liệu đã được ghi thành công"))
    .catch((error) => console.error("❌ Ghi dữ liệu thất bại:", error));
}

export async function getAllData(path: string): Promise<any> {
  const snapshot = await get(child(ref(db), path));
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    console.warn("⚠ Không có dữ liệu tại path:", path);
    return null;
  }
}

(window as any).FirebaseBundle = {
  writeData,
  updateData,
  getAllData,
  getUser
};
