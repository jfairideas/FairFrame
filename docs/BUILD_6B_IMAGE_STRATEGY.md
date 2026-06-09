# Build 6B Image Strategy

**Founder decision (June 2026):** Session-local first. No Supabase image storage in Build 6B.

## Principle

FairFrame is **metadata-first**. We are not building an image-hosting business. Cards and previews use the image already in the user's current session — not a permanent cloud library.

## Build 6B card rendering

- **Source:** `SessionContext.session.imageUri` — the local file URI from capture or upload.
- **Preview:** Card preview screen reads the active session image at render time.
- **Export/share:** Capture the composed card view (e.g. `react-native-view-shot`) using the session-local URI embedded in the layout.
- **Lifetime:** Image exists only for the current analysis session unless the user exports/saves to their device photo roll.

## Explicitly out of scope (Build 6B)

- Supabase Storage buckets
- Permanent image upload on analysis save
- Public galleries or social feeds
- Image library / history thumbnail tables
- CDN or third-party image hosting

## What we do persist

Analysis **metadata** only (already in Build 6A):

- `analysis_history` normalized columns + `result` JSONB
- `profiles` progression aggregates
- `visual_dna` trait maps

No `image_url` or storage path on history rows in Build 6B.

## Future reconsideration

Revisit cloud image storage only if product requires:

- Saved card history across devices
- Cloud restore after reinstall
- Shareable card URLs with embedded imagery

Until then, session-local + on-device export is the default path.

## Implementation note for card engine

When building `CardPreview` / PRESS CARD in 6B:

```typescript
// Read from SessionContext — do not fetch from Supabase Storage
const { session } = useSession();
const imageUri = session?.imageUri;
```

If `session` is null (user navigated away), prompt user to analyze a new frame rather than loading a stored image.
