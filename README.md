# shohruhxamrayev.uz

Personal site — plain HTML/CSS/JS, deployed on Vercel at https://shohruhxamrayev.uz.

Edit any file, commit, push to `main` → Vercel redeploys automatically.

## Adding a book

1. Add an entry to `books-data.js` (copy an existing one; `status` is `"reading"` or `"read"`).
2. Copy any file in `books/` to `books/<slug>.html` and change `data-slug="..."` to the new slug.

The shelf, reading list, collection and book page all update from the data automatically.

## Adding a journal entry

1. Put the photos in `journal/`, plus a 640px-wide copy of each in `journal/thumbs/` (same file name).
2. Add an entry to `journal-data.js`: title, type, date, places with coordinates (for the map), text and photos.
3. Copy any file in `journal/` (e.g. `bukhara.html`) to `journal/<slug>.html` and change `data-slug="..."`.

The map, stats, filters, timeline, entry page and photo viewer all update from the data.
