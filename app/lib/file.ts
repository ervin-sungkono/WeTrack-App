import 'server-only'

import { randomUUID } from 'node:crypto'
import { getAdminBucket } from '@/server/db'

export type UploadedFileReference = {
  originalFileName: string
  attachmentStoragePath: string
}

function normalizeStoragePath(path: string): string {
  const normalized = path.replaceAll('\\', '/').replace(/^\/+/, '')
  const segments = normalized.split('/')
  if (!normalized || segments.some((segment) => segment === '..' || segment === '.')) {
    throw new Error('Invalid storage path')
  }
  return normalized
}

function storagePathFromInput(pathOrUrl: string, bucketName: string): string {
  if (pathOrUrl.startsWith('gs://')) {
    const url = new URL(pathOrUrl)
    if (url.hostname !== bucketName) throw new Error('Unsupported storage bucket')
    return normalizeStoragePath(url.pathname)
  }

  if (pathOrUrl.startsWith('https://')) {
    const url = new URL(pathOrUrl)
    const bucketPrefix = `/v0/b/${bucketName}/o/`
    if (url.hostname !== 'firebasestorage.googleapis.com' || !url.pathname.startsWith(bucketPrefix)) {
      throw new Error('Unsupported storage URL')
    }
    return normalizeStoragePath(decodeURIComponent(url.pathname.slice(bucketPrefix.length)))
  }

  return normalizeStoragePath(pathOrUrl)
}

function downloadUrl(bucketName: string, storagePath: string, token: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`
}

export async function uploadSingleFile(file: File, path: string): Promise<string> {
  const storagePath = normalizeStoragePath(path)
  const token = randomUUID()
  const bucket = getAdminBucket()
  await bucket.file(storagePath).save(Buffer.from(await file.arrayBuffer()), {
    resumable: false,
    metadata: {
      contentType: file.type || 'application/octet-stream',
      metadata: { firebaseStorageDownloadTokens: token },
    },
  })
  return downloadUrl(bucket.name, storagePath, token)
}

export async function uploadMultipleFiles(files: File[], basePath: string): Promise<UploadedFileReference[]> {
  const storagePath = normalizeStoragePath(basePath)
  return Promise.all(files.map(async (file) => ({
    originalFileName: file.name,
    attachmentStoragePath: await uploadSingleFile(file, `${storagePath}/${file.name.replace(/[\\/]/g, '_')}`),
  })))
}

export async function deleteExistingFile(pathOrUrl: string | null | undefined): Promise<void> {
  if (!pathOrUrl) return
  const bucket = getAdminBucket()
  const storagePath = storagePathFromInput(pathOrUrl, bucket.name)
  await bucket.file(storagePath).delete({ ignoreNotFound: true })
}
