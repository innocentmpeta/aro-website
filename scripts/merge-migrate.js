/**
 * ARO Content Merge Migration
 * Pushes scripts/content.json into Firestore WITHOUT clobbering existing
 * image / images / videos fields on documents that already exist live.
 *
 * - Existing doc (same id as content.json): merge all fields EXCEPT
 *   image, images, videos — those are left exactly as they are live.
 * - New doc (id not present live): created in full from content.json.
 *
 * Run once: node scripts/merge-migrate.js
 * Requires serviceAccount-aro.json in the project root.
 */

const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccount-aro.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();
const content = require('./content.json');

const MEDIA_FIELDS = ['image', 'images', 'videos'];

const ARRAY_COLLECTIONS = [
  'campaigns',
  'programmes',
  'policy',
  'films',
  'news',
  'reclaimers',
  'partners'
];

async function run() {
  console.log('\nStarting merge migration (text fields only on existing docs)...\n');

  await db.collection('config').doc('site').set(content.site, { merge: true });
  console.log('Site config merged');
  await db.collection('config').doc('stats').set({ items: content.stats });
  console.log('Stats replaced');

  for (const col of ARRAY_COLLECTIONS) {
    const items = content[col] || [];
    if (!items.length) { console.log(`- ${col}: empty, skipping`); continue; }

    let created = 0, merged = 0;
    for (const item of items) {
      const ref = db.collection(col).doc(item.id);
      const snap = await ref.get();

      if (snap.exists) {
        const payload = { ...item };
        for (const f of MEDIA_FIELDS) delete payload[f];
        delete payload.id;
        await ref.set(payload, { merge: true });
        merged++;
      } else {
        await ref.set(item);
        created++;
      }
    }
    console.log(`✓ ${col}: ${merged} merged (text only), ${created} created new`);
  }

  console.log('\nDone.\n');
  process.exit(0);
}

run().catch(err => { console.error('Migration failed:', err); process.exit(1); });
