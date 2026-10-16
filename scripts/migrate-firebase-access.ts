import { FieldPath, FieldValue } from 'firebase-admin/firestore';
import { db } from '../server/db';
import { syncFirebaseMemberships, syncPublicProfile } from '../server/auth';

// Reads existing data by default. Writes require the explicit --apply flag.
const apply = process.argv.includes('--apply');
const pageSize = 200;
const counts = { usersChecked: 0, usersMigrated: 0, childRecordsChecked: 0, childScopesToUpdate: 0, childScopesUpdated: 0, unresolvedChildren: 0, acceptedTeamsChecked: 0, acceptedEmailsToRemove: 0, acceptedEmailsRemoved: 0 };

async function migrateUsers() {
  let cursor: string | undefined;
  for (;;) {
    let query = db.collection('users').orderBy(FieldPath.documentId()).limit(pageSize);
    if (cursor) query = query.startAfter(cursor);
    const page = await query.get();
    if (page.empty) break;
    for (const user of page.docs) {
      counts.usersChecked += 1;
      if (user.data().deletedAt != null) continue;
      if (apply) {
        await syncPublicProfile(user.id);
        await syncFirebaseMemberships(user.id);
        counts.usersMigrated += 1;
      }
    }
    cursor = page.docs.at(-1)?.id;
    if (page.size < pageSize) break;
  }
}

async function migrateChildScopes(collectionName: 'chats' | 'chatSummaries') {
  let cursor: string | undefined;
  for (;;) {
    let query = db.collection(collectionName).orderBy(FieldPath.documentId()).limit(pageSize);
    if (cursor) query = query.startAfter(cursor);
    const page = await query.get();
    if (page.empty) break;
    const projectByTask = new Map<string, string | null>();
    const batch = db.batch();
    let writeCount = 0;
    for (const child of page.docs) {
      counts.childRecordsChecked += 1;
      const data = child.data();
      const taskId: unknown = data.taskId;
      if (typeof taskId !== 'string' || !taskId || taskId.includes('/')) {
        counts.unresolvedChildren += 1;
        continue;
      }
      if (!projectByTask.has(taskId)) {
        const task = await db.collection('tasks').doc(taskId).get();
        const projectId: unknown = task.data()?.projectId;
        projectByTask.set(taskId, typeof projectId === 'string' && !!projectId && !projectId.includes('/') ? projectId : null);
      }
      const projectId = projectByTask.get(taskId);
      if (!projectId) {
        counts.unresolvedChildren += 1;
        continue;
      }
      if (data.projectId === projectId) continue;
      counts.childScopesToUpdate += 1;
      if (apply) {
        batch.update(child.ref, { projectId });
        writeCount += 1;
      }
    }
    if (writeCount) {
      await batch.commit();
      counts.childScopesUpdated += writeCount;
    }
    cursor = page.docs.at(-1)?.id;
    if (page.size < pageSize) break;
  }
}

async function removeAcceptedTeamEmails() {
  let cursor: string | undefined;
  for (;;) {
    let query = db.collection('teams').where('status', '==', 'accepted').orderBy(FieldPath.documentId()).limit(pageSize);
    if (cursor) query = query.startAfter(cursor);
    const page = await query.get();
    if (page.empty) break;
    const batch = db.batch();
    let writeCount = 0;
    for (const team of page.docs) {
      counts.acceptedTeamsChecked += 1;
      if (!('email' in team.data())) continue;
      counts.acceptedEmailsToRemove += 1;
      if (apply) {
        batch.update(team.ref, { email: FieldValue.delete() });
        writeCount += 1;
      }
    }
    if (writeCount) {
      await batch.commit();
      counts.acceptedEmailsRemoved += writeCount;
    }
    cursor = page.docs.at(-1)?.id;
    if (page.size < pageSize) break;
  }
}

async function main() {
  await migrateUsers();
  await removeAcceptedTeamEmails();
  await migrateChildScopes('chats');
  await migrateChildScopes('chatSummaries');
  console.info(JSON.stringify({ mode: apply ? 'applied' : 'dry-run', ...counts }));
}

main().catch(() => {
  console.error('Firebase access migration failed. Check project credentials and retry; the migration is idempotent.');
  process.exitCode = 1;
});
