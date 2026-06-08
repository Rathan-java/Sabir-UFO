# Sabir UFO — architecture & data model

## High-level

```
   ┌──────────────┐        ┌──────────────┐
   │   Web (Vite) │        │ Flutter (iOS/│
   │  vanilla JS  │        │ Android/Web) │
   └──────┬───────┘        └──────┬───────┘
          │                       │
          │     Firebase SDK      │
          └──────────┬────────────┘
                     │
            ┌────────▼────────┐
            │  Firebase Auth  │  ← Google Sign-In
            │  Cloud Firestore│  ← rules-enforced
            └─────────────────┘
                     │
        ┌────────────┴────────────┐
        │   Cloudinary (free)     │  ← unsigned uploads
        │   (or Firebase Storage) │
        └─────────────────────────┘
```

Both clients are thin: they talk directly to Firestore (subject to security
rules). There is **no custom backend**. Media goes to Cloudinary by default
so the project stays on Firebase Spark (free).

## Data model (Firestore)

### `users/{uid}`
| field         | type      | notes                                |
|---------------|-----------|--------------------------------------|
| displayName   | string    | Editable by owner. ≤ 80 chars.       |
| email         | string    | Comes from Google. Read-only.        |
| photoURL      | string    | Google photo URL.                    |
| role          | string    | `'user'` or `'admin'`.               |
| createdAt     | timestamp | server.                              |

### `sightings/{auto-id}`
| field           | type      | notes                                  |
|-----------------|-----------|----------------------------------------|
| reporterUid     | string    | Firestore rules pin this to auth.uid.  |
| reporterName    | string    | Snapshot of displayName at submit.     |
| reporterEmail   | string    |                                        |
| isPublic        | bool      | Show on public map with name.          |
| classification  | string    | Hynek/Vallée enum (see config).        |
| objectShape     | string    | enum: disc/triangle/sphere/…           |
| witnessCount    | int       |                                        |
| sightedAt       | timestamp\|number | When the sighting happened.    |
| durationText    | string    | Free text ("~3 minutes").              |
| location        | map       | `{ lat, lng, place }`                  |
| description     | string    | Required. ≤ 5000 chars.                |
| media           | array     | `[{ url, type: 'image'\|'video' }]`    |
| status          | string    | `pending` \| `reviewed` \| `verified` \| `rejected` |
| adminNotes      | string    | Admin-only (rules limit writes).       |
| createdAt       | timestamp | server.                                |

### `interviews/{id}`
| field         | type      | notes                                |
|---------------|-----------|--------------------------------------|
| title         | string    |                                      |
| youtubeId     | string    | Used to build thumbnail URL.         |
| publishedAt   | timestamp |                                      |
| order         | int       | Display order.                       |

### `ebook/config`  (single doc)
| field            | type     | notes                                |
|------------------|----------|--------------------------------------|
| title            | string   |                                      |
| blurb            | string   |                                      |
| price            | string   | Free-form ("$19.99").                |
| coverImageUrl    | string   |                                      |

## Security model (Firestore rules)

- **`users/{uid}`** — owner read/write own; admin read all; only admin can
  change `role`.
- **`sightings/{id}`** — owner read/write own (only while `status == 'pending'`);
  admin full access; anyone may read sightings where `isPublic == true`. The
  client redacts the reporter name when `isPublic == false`.
- **`interviews`** / **`ebook`** — public read; admin-only write.
- Default deny on everything else.

See `/firebase/firestore.rules` for the source of truth.

## Admin elevation

A user becomes admin if their Google email matches `VITE_ADMIN_EMAIL` (web)
or `AppConfig.adminEmail` (mobile). On first sign-in, the client writes
`role: 'admin'` to their `users/{uid}` doc. If you change the admin email
later, the next sign-in for that email also gets promoted.

## Free-tier discipline

- All reads are paginated to small page sizes where it matters (admin list
  reads all sightings, which is fine for researcher-scale volume).
- Media uploads bypass Firebase Storage by default and go to Cloudinary's
  free unsigned endpoint, so the project stays on Spark.
- Map tiles come from free OpenStreetMap.
- YouTube thumbnails are loaded directly from `img.youtube.com` (no API key).
