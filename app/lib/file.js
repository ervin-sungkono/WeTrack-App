import { deleteObject, getDownloadURL, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebase/config';

// Function to upload a single file
export async function uploadSingleFile(file, path) {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    console.log("snapshot", snapshot)
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;

  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Function to upload multiple files
export async function uploadMultipleFiles(files, basePath) {
  const uploadTasks = files.map(async (file) => {
    const storageRef = ref(storage, `${basePath}/${file.name}`);
    try {
      await uploadBytesResumable(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return { 
        originalFileName: file.name, 
        attachmentStoragePath: downloadURL 
      };
      
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      throw new Error(`${error.message}`)
    }
  });

  return Promise.all(uploadTasks);
}

// Function to delete file
export async function deleteExistingFile(path) {
  try {
      const storageRef = ref(storage, path);
      const deletedFile = await deleteObject(storageRef);
      console.log("snapshot", deletedFile)
      return deletedFile;

    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
}