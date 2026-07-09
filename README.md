# ARO Website — Firebase + Vercel

## Stack
- **Frontend**: Static HTML/JS (no framework)
- **Database**: Firebase Firestore
- **Image Storage**: Firebase Storage
- **Auth**: Firebase Authentication (email/password)
- **Hosting**: Vercel

---

## One-time Setup

### 1. Run the migration script (push seed data into Firestore)

You need a Firebase service account key:
1. Firebase Console → Project Settings → Service Accounts
2. Click **Generate new private key** → download the JSON file
3. Save it as `scripts/serviceAccount.json`

Then run:
```bash
npm install
npm run migrate
```

This pushes all content from `scripts/content.json` into Firestore.
Check your Firestore console to verify the data landed correctly.

**Delete `scripts/serviceAccount.json` after running** — never commit it to git.

---

### 2. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel will detect `vercel.json` and route correctly:
- `/` → public website (reads Firestore)
- `/admin` → CMS panel (Firebase Auth + Firestore + Storage)

---

### 3. Add to .gitignore

Create a `.gitignore` file:
```
scripts/serviceAccount.json
node_modules/
```

---

## URLs (after deploy)

| URL | What |
|-----|------|
| `https://your-project.vercel.app/` | Public ARO website |
| `https://your-project.vercel.app/admin` | CMS — login with your Firebase Auth user |

---

## Content Management

Log into `/admin` with the email/password you set up in Firebase Authentication.

### Sections managed from CMS
- Campaigns (+ video manager, image upload)
- Programmes (+ video manager, image upload)
- Policy Engagement (+ video manager, image upload)
- International Work (+ video manager, image upload)
- Films & Media (YouTube/Vimeo embed)
- News & Stories (rich text, image, published/draft toggle)
- Reclaimer Profiles (portrait upload, bio, quote)
- Impact Statistics (homepage ticker + strip)
- Partners & Funders
- Site Info (address, phone, email, social links)

### Images
Images upload directly to Firebase Storage under `images/{collection}/`.
URLs are stored in Firestore alongside the content item.

### Videos
Paste any YouTube or Vimeo URL. The site embeds it automatically.
Never upload video files — always use YouTube or Vimeo.

---

## Firebase Security Rules

### Firestore
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Project Structure

```
aro-website/
├── public/
│   ├── site/
│   │   ├── index.html      ← Public website
│   │   └── images/
│   │       └── aro-logo.png
│   └── admin/
│       └── index.html      ← CMS panel
├── scripts/
│   ├── migrate.js          ← One-time Firestore seed script
│   └── content.json        ← Seed data
├── vercel.json             ← Vercel routing
├── package.json
└── README.md
```