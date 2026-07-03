// migrate-add-owner-id.js
//
// ONE-TIME BACKFILL — run this BEFORE publishing the new multi-tenant
// firestore.rules. Stamps every existing item/supplier/movement/sale/
// deliveryStatus/loginLog document, plus the shared config/categories and
// config/locations docs, with the ownerId of a single Client Admin (the
// account that should "own" everything that existed before multi-tenancy).
// Also sets parentId on every existing Staff account to that same uid.
//
// Uses the Firebase ADMIN SDK, which ignores security rules entirely — so
// it works no matter which rules are currently published, and doesn't
// touch your live app code at all.
//
// RUN:
//   node migrate-add-owner-id.cjs
//
// This script is safe to re-run — it skips any document that already has
// an ownerId/parentId, so running it twice does nothing extra the second
// time.

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// <<< REQUIRED: paste the uid of the Client Admin who owns the existing data >>>
const OWNER_ID = 'x6hvgUICTWMSyrl7YpPA9rrjIRW2';

const BATCH_LIMIT = 400; // stay under Firestore's 500-writes-per-batch cap

async function backfillCollection(name) {
  const snap = await db.collection(name).get();
  let batch = db.batch();
  let pending = 0;
  let stamped = 0;
  let alreadyDone = 0;

  for (const docSnap of snap.docs) {
    if (docSnap.data().ownerId) { alreadyDone++; continue; }
    batch.update(docSnap.ref, { ownerId: OWNER_ID });
    pending++;
    stamped++;
    if (pending >= BATCH_LIMIT) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  }
  if (pending > 0) await batch.commit();

  console.log(`${name}: ${snap.size} total, stamped ${stamped}, already had ownerId ${alreadyDone}`);
}

async function migrateConfigDocs() {
  for (const key of ['categories', 'locations']) {
    const oldRef = db.collection('config').doc(key);
    const oldSnap = await oldRef.get();
    if (!oldSnap.exists) {
      console.log(`config/${key}: no existing doc, skipping`);
      continue;
    }
    const newId = `${key}_${OWNER_ID}`;
    const newRef = db.collection('config').doc(newId);
    const newSnap = await newRef.get();
    if (newSnap.exists) {
      console.log(`config/${newId}: already exists, skipping`);
      continue;
    }
    await newRef.set({ ...oldSnap.data(), ownerId: OWNER_ID });
    console.log(`config/${key} -> config/${newId} (old doc left in place, unused by the app)`);
  }
}

async function migrateStaffParentIds() {
  const snap = await db.collection('users').where('role', '==', 'staff').get();
  let updated = 0;
  let alreadyDone = 0;
  for (const docSnap of snap.docs) {
    if (docSnap.data().parentId) { alreadyDone++; continue; }
    await docSnap.ref.update({ parentId: OWNER_ID });
    updated++;
  }
  console.log(`users (staff): ${snap.size} total, set parentId on ${updated}, already had parentId ${alreadyDone}`);
}

async function main() {
  const ownerDoc = await db.collection('users').doc(OWNER_ID).get();
  if (!ownerDoc.exists) {
    console.error(`No users/${OWNER_ID} document found - double check the uid.`);
    process.exit(1);
  }
  console.log(`Backfilling everything to owner: ${ownerDoc.data().email || OWNER_ID} (role: ${ownerDoc.data().role})`);

  await backfillCollection('items');
  await backfillCollection('suppliers');
  await backfillCollection('movements');
  await backfillCollection('sales');
  await backfillCollection('deliveryStatus');
  await backfillCollection('loginLogs');
  await migrateConfigDocs();
  await migrateStaffParentIds();

  console.log('\nDone. Spot-check a few documents in the Firestore console, then publish the new firestore.rules.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});