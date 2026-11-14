# Places data
Add a real place as a new object in `places.json` (copy an existing place and give it a new `id`).
Every fact (each facility) needs a `source` (who checked it) and a `date` (YYYY-MM-DD).
Anything nobody has checked must be `"available": "unknown"`. Never guess.
Every yes or no fact needs its official source (with the web address) and the date it was read. Sources and quotes are listed in `SOURCES.md`.
Photos go in `client/public/places/` and `photo` holds the file name.
