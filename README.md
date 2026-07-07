# ARO Website & CMS

**African Reclaimers Organisation — Website & Content Management System**

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# Development mode (auto-restart on changes)
npm run dev
```

The server runs on **http://localhost:3000** by default.

| URL | What it is |
|-----|-----------|
| `http://localhost:3000` | Public-facing ARO website |
| `http://localhost:3000/admin` | CMS — content management panel |

---

## Project Structure

```
aro-website/
├── server/
│   ├── index.js          # Express server entry point
│   ├── data.js           # JSON read/write helper
│   └── routes/
│       ├── api.js        # REST API (all content CRUD + file upload)
│       ├── admin.js      # Serves the CMS panel
│       └── site.js       # Serves the public website
├── public/
│   ├── site/
│   │   ├── index.html    # Public website (single page, self-contained)
│   │   └── images/       # Static images (logo etc.)
│   ├── admin/
│   │   └── index.html    # CMS panel (single page app)
│   └── uploads/          # User-uploaded images and media (auto-created)
├── data/
│   └── content.json      # All site content (the "database")
└── package.json
```

---

## Content Management

### Sections you can manage from the CMS

| Section | What you can do |
|---------|----------------|
| **Campaigns** | Add/edit/delete campaigns. Mark as Current or Historical. Add YouTube/Vimeo videos. |
| **Programmes** | Add/edit/delete programme descriptions. Add videos. |
| **Policy** | Add/edit policy engagement items. Add videos. |
| **International** | Add/edit international work entries. Add videos. |
| **Films & Media** | Add documentary and animation films with YouTube/Vimeo links. Set type (Documentary / Animation / Campaign). |
| **News & Stories** | Write articles. Set Published/Draft status. Categorise by type. |
| **Reclaimers** | Add member profiles with photo, quote, bio. |
| **Impact Stats** | Edit the four statistics in the ticker and homepage strip. |
| **Partners** | Add/remove partner and funder organisations. |
| **Site Info** | Edit address, phone, email, social media links. |

### Adding videos

1. Go to the relevant section (e.g. Campaigns)
2. Click **▶ Videos** on any item
3. Paste a YouTube or Vimeo link and give it a title
4. Click **+ Add Video**

The video will appear embedded directly in that section on the live site.

### Adding news articles

1. Go to **News & Stories**
2. Click **+ Add Article**
3. Write the headline and body text
4. Set **Published** toggle to ON when ready to go live
5. Leave it OFF to save as a draft

### Uploading images

Click the image upload zone in any form. Supported formats: JPG, PNG. Maximum size: 20MB.

---

## Data Storage

All content is stored in `data/content.json` — a plain JSON file. This means:

- **No database required** — the file is the database
- **Easy to back up** — just copy the file
- **Easy to migrate** — the file can be moved to any server

To back up all content and uploaded media:
```bash
# Back up content
cp data/content.json data/content.backup.json

# Back up uploads
cp -r public/uploads/ uploads-backup/
```

---

## Changing the Port

Set a `PORT` environment variable before starting:

```bash
PORT=8080 npm start
```

---

## Production Notes

- For production, place behind a reverse proxy (nginx or Caddy)
- Set `NODE_ENV=production`
- Consider a daily cron job to back up `data/content.json` and `public/uploads/`
- Video files should always be hosted on YouTube or Vimeo — never uploaded directly to the server
# aro-website
