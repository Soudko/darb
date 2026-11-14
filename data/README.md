# Places data
Add a real place as a new object in `places.json` (copy the sample, give it a new `id`, and leave out `is_sample`).
Every fact (each facility) needs a `source` (who checked it) and a `date` (YYYY-MM-DD).
Anything nobody has checked must be `"available": "unknown"`. Never guess.
Real places replace the sample in the assistant; the sample is used only while there are no real places.
Photos go in `client/public/places/` and `photo` holds the file name.
