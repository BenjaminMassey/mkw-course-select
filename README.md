# Mario Kart Course Select

## Overview

A webpage for giving random courses in Mario Kart World.

Features:
  - Full randomization of 30 course list
  - Exclusive mode for avoiding repeats
  - Browser-based auto save/load of course list state

## Course list

The files in `images/courses/` are the single source of truth for which
courses exist. `courses.js` is generated from that directory:

    node generate-courses.mjs

To add or remove a course, add or remove its `.webp` in `images/courses/`
(and a matching map in `images/maps/`), re-run the generator, and commit the
regenerated `courses.js`. The list UI and map cache in the page are built
from the generated list at load time. The generator also warns if
`images/maps/` does not match `images/courses/`.

Course names are the filenames without extension. Filenames may include
spaces and special characters like apostrophes (the page URL-encodes them
when loading images). Characters that are invalid in filenames, like `?`,
are percent-encoded in the filename (e.g. `Great %3F Block Ruins.webp`) and
decoded for display, so the course still shows up as `Great ? Block Ruins`.
The generator warns if a filename contains characters that are invalid on
Windows.

## Screenshots

![main](images/docs/main-view.png)

![list](images/docs/list-view.png)

![course](images/docs/course-view.png)

## Contact

Created by benjamin.w.massey@gmail.com
