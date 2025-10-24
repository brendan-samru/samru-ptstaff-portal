import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface ContentItem {
  id?: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: 'video' | 'pdf' | 'document';
  category: string;
  department: string;
  downloadable: boolean;
  enabled: boolean;
  views: number;
  downloads: number;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
}

export async function createContentItem(contentData: Omit<ContentItem, 'id' | 'views' | 'downloads' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'content'), {
      ...contentData,
      views: 0,
      downloads: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating content item:', error);
    throw error;
  }
}

export async function getContentByDepartment(department: string): Promise<ContentItem[]> {
  try {
    const q = query(
      collection(db, 'content'),
      where('department', '==', department)
    );
    
    const querySnapshot = await getDocs(q);
    const items: ContentItem[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate()
      } as ContentItem);
    });
    
    return items;
  } catch (error) {
    console.error('Error getting content:', error);
    throw error;
  }
}

export async function updateContentItem(id: string, updates: Partial<ContentItem>) {
  try {
    const docRef = doc(db, 'content', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
}

export async function deleteContentItem(id: string) {
  try {
    await deleteDoc(doc(db, 'content', id));
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
}