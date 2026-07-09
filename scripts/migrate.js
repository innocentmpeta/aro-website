/**
 * ARO Content Migration Script
 * Pushes content.json into Firestore as the initial dataset.
 * Run once: node scripts/migrate.js
 *
 * Requires a Firebase service account key.
 * Download from: Firebase Console → Project Settings → Service Accounts → Generate new private key
 * Save as: scripts/serviceAccount.json
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ── Service account ───────────────────────────────────────────────────────────
const serviceAccountPath = path.join(__dirname, 'serviceAccount.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('\n❌  scripts/serviceAccount.json not found.');
  console.error('   Download your service account key from:');
  console.error('   Firebase Console → Project Settings → Service Accounts → Generate new private key');
  console.error('   Save it as scripts/serviceAccount.json\n');
  process.exit(1);
}

const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'aro-website-be081'
});

const db = admin.firestore();

// ── Content to migrate ────────────────────────────────────────────────────────
const content = require('./content.json');

// Collections to migrate — each becomes a Firestore collection
// site and stats go into a 'config' document
const ARRAY_COLLECTIONS = [
  'campaigns',
  'programmes',
  'policy',
  'international',
  'films',
  'news',
  'reclaimers',
  'partners'
];

async function migrate() {
  console.log('\n🚀  Starting ARO content migration to Firestore...\n');

  // ── Migrate site config + stats into single config doc ───────────────────
  try {
    await db.collection('config').doc('site').set(content.site);
    console.log('✓  Site config migrated');

    await db.collection('config').doc('stats').set({ items: content.stats });
    console.log('✓  Stats migrated');
  } catch (err) {
    console.error('✗  Config migration failed:', err.message);
  }

  // ── Migrate each array collection ────────────────────────────────────────
  for (const col of ARRAY_COLLECTIONS) {
    const items = content[col] || [];
    if (!items.length) {
      console.log(`—  ${col}: empty, skipping`);
      continue;
    }

    const batch = db.batch();
    items.forEach(item => {
      const ref = db.collection(col).doc(item.id);
      batch.set(ref, item);
    });

    try {
      await batch.commit();
      console.log(`✓  ${col}: ${items.length} item${items.length > 1 ? 's' : ''} migrated`);
    } catch (err) {
      console.error(`✗  ${col} migration failed:`, err.message);
    }
  }

  console.log('\n✅  Migration complete. Check your Firestore console to verify.\n');
  process.exit(0);
}

migrate();