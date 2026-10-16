import 'server-only'

import {
  FieldPath,
  FieldValue,
  Filter,
  Firestore,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type Query,
  type QuerySnapshot,
  type SetOptions,
  type Transaction,
  type WriteBatch,
} from 'firebase-admin/firestore'
import type { db as AdminDatabase } from './db'

type Database = typeof AdminDatabase
type WhereOperator = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'not-in' | 'array-contains-any'
type FirestoreField = string | FieldPath

type QueryConstraint =
  | { readonly kind: 'filter'; readonly value: Filter }
  | { readonly kind: 'order'; readonly fieldPath: FirestoreField; readonly direction: 'asc' | 'desc' }
  | { readonly kind: 'limit'; readonly count: number }

export type WhereConstraint = Extract<QueryConstraint, { kind: 'filter' }>

export type CompatDocumentSnapshot<T extends DocumentData = DocumentData> = {
  readonly id: string
  readonly ref: DocumentReference<T>
  readonly updateTime: DocumentSnapshot<T>['updateTime']
  exists(): boolean
  data(): T | undefined
  get(fieldPath: FirestoreField): unknown
}

export type CompatQuerySnapshot<T extends DocumentData = DocumentData> = {
  readonly docs: CompatDocumentSnapshot<T>[]
  readonly empty: boolean
  readonly size: number
  forEach(callback: (snapshot: CompatDocumentSnapshot<T>) => void): void
}

export type CompatTransaction = {
  get<T extends DocumentData>(reference: DocumentReference<T>): Promise<CompatDocumentSnapshot<T>>
  set<T extends DocumentData>(reference: DocumentReference<T>, data: T): CompatTransaction
  set<T extends DocumentData>(reference: DocumentReference<T>, data: T, options: SetOptions): CompatTransaction
  update<T extends DocumentData>(reference: DocumentReference<T>, data: DocumentData): CompatTransaction
  delete(reference: DocumentReference): CompatTransaction
}

function wrapDocumentSnapshot<T extends DocumentData>(snapshot: DocumentSnapshot<T>): CompatDocumentSnapshot<T> {
  return {
    id: snapshot.id,
    ref: snapshot.ref,
    updateTime: snapshot.updateTime,
    exists: () => snapshot.exists,
    data: () => snapshot.data(),
    get: (fieldPath) => snapshot.get(fieldPath),
  }
}

function wrapQuerySnapshot<T extends DocumentData>(snapshot: QuerySnapshot<T>): CompatQuerySnapshot<T> {
  const docs = snapshot.docs.map((document) => wrapDocumentSnapshot(document))
  return {
    docs,
    empty: snapshot.empty,
    size: snapshot.size,
    forEach: (callback) => docs.forEach(callback),
  }
}

export function collection(firestore: Database, path: string): CollectionReference
export function collection(reference: DocumentReference, path: string): CollectionReference
export function collection(source: Database | DocumentReference, path: string): CollectionReference {
  return source.collection(path)
}

export function doc(firestore: Database, path: string, ...segments: string[]): DocumentReference
export function doc(reference: CollectionReference, id?: string): DocumentReference
export function doc(source: Database | CollectionReference, pathOrId?: string, ...segments: string[]): DocumentReference {
  if (source instanceof Firestore) {
    if (!pathOrId) throw new Error('A document path is required when using a Firestore instance')
    return source.doc([pathOrId, ...segments].join('/'))
  }
  return pathOrId ? source.doc(pathOrId) : source.doc()
}

export function where(fieldPath: FirestoreField, operator: WhereOperator, value: unknown): WhereConstraint {
  return { kind: 'filter', value: Filter.where(fieldPath, operator, value) }
}

export function and(...filters: readonly WhereConstraint[]): WhereConstraint {
  return { kind: 'filter', value: Filter.and(...filters.map((filter) => filter.value)) }
}

export function or(...filters: readonly WhereConstraint[]): WhereConstraint {
  return { kind: 'filter', value: Filter.or(...filters.map((filter) => filter.value)) }
}

export function orderBy(fieldPath: FirestoreField, direction: 'asc' | 'desc' = 'asc'): QueryConstraint {
  return { kind: 'order', fieldPath, direction }
}

export function limit(count: number): QueryConstraint {
  if (!Number.isInteger(count) || count < 0) throw new Error('Firestore query limit must be a non-negative integer')
  return { kind: 'limit', count }
}

export function query(reference: Query, ...constraints: QueryConstraint[]): Query {
  return constraints.reduce((current, constraint) => {
    if (constraint.kind === 'filter') return current.where(constraint.value)
    if (constraint.kind === 'order') return current.orderBy(constraint.fieldPath, constraint.direction)
    return current.limit(constraint.count)
  }, reference)
}

export async function getDoc<T extends DocumentData>(reference: DocumentReference<T>): Promise<CompatDocumentSnapshot<T>> {
  return wrapDocumentSnapshot(await reference.get())
}

export async function getDocs<T extends DocumentData>(reference: Query<T>): Promise<CompatQuerySnapshot<T>> {
  return wrapQuerySnapshot(await reference.get())
}

export function addDoc<T extends DocumentData>(reference: CollectionReference<T>, data: T): Promise<DocumentReference<T>> {
  return reference.add(data)
}

export function setDoc<T extends DocumentData>(reference: DocumentReference<T>, data: T): Promise<void>
export function setDoc<T extends DocumentData>(reference: DocumentReference<T>, data: T, options: SetOptions): Promise<void>
export function setDoc<T extends DocumentData>(reference: DocumentReference<T>, data: T, options?: SetOptions): Promise<void> {
  return (options ? reference.set(data, options) : reference.set(data)).then(() => undefined)
}

export function updateDoc(reference: DocumentReference, data: DocumentData): Promise<void> {
  return reference.update(data).then(() => undefined)
}

export function deleteDoc(reference: DocumentReference): Promise<void> {
  return reference.delete().then(() => undefined)
}

type TransactionCallback<T> = (transaction: CompatTransaction) => Promise<T> | T

export function runTransaction<T>(firestore: Database, callback: TransactionCallback<T>): Promise<T> {
  return firestore.runTransaction(async (transaction) => callback(wrapTransaction(transaction)))
}

function wrapTransaction(transaction: Transaction): CompatTransaction {
  return {
    get: async (reference) => wrapDocumentSnapshot(await transaction.get(reference)),
    set(reference, data, options?) {
      if (options) transaction.set(reference, data, options)
      else transaction.set(reference, data)
      return this
    },
    update(reference, data) {
      transaction.update(reference, data)
      return this
    },
    delete(reference) {
      transaction.delete(reference)
      return this
    },
  }
}

export function writeBatch(firestore: Database): WriteBatch {
  return firestore.batch()
}

export const serverTimestamp = FieldValue.serverTimestamp
export const increment = FieldValue.increment
export const arrayUnion = FieldValue.arrayUnion
export const arrayRemove = FieldValue.arrayRemove
export const deleteField = FieldValue.delete
export { FieldPath, FieldValue, Filter }
