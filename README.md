# shohruhxamrayev.uz

Personal site — plain HTML/CSS/JS, deployed on Vercel at https://shohruhxamrayev.uz.

Edit any file, commit, push to `main` → Vercel redeploys automatically.

## Adding a book

1. Add an entry to `books-data.js` (copy an existing one; `status` is `"reading"` or `"read"`).
2. Copy any file in `books/` to `books/<slug>.html` and change `data-slug="..."` to the new slug.

The shelf, reading list, collection and book page all update from the data automatically.
