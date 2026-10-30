// The course lists are generated from images/courses/ (base courses) and
// images/courses/retro/ (retro courses) by generate-courses.mjs (see
// courses.js). Those folders are the single source of truth for which
// courses exist. Course names are the image filenames without extension;
// characters that are invalid in filenames (like "?") are percent-encoded
// in the filename and decoded for display.
//
// Retro courses come last so they sit together at the end of the list
// view. The "Retro Tracks" toggle leaves them out of the random pool and
// hides them in the list view when it is off.
const retro_courses = new Set(window.RETRO_COURSES || []);
const courses = [...(window.COURSES || []), ...retro_courses];

if (courses.length === 0) {
    console.error("courses.js is missing or empty. Run `node generate-courses.mjs` and reload.");
}

const course_locations = new Map([
    ["Acorn Heights", { x: "46%", y: "5%" }],
    ["Airship Fortress", { x: "22%", y: "28%" }],
    ["Boo Cinema", { x: "55%", y: "15%" }],
    ["Bowser's Castle", { x: "31%", y: "15%" }],
    ["Cheep Cheep Falls", { x: "55%", y: "50%" }],
    ["Choco Island 1", { x: "34%", y: "48%" }],
    ["Choco Island 2", { x: "44%", y: "48%" }],
    ["Choco Mountain", { x: "39%", y: "50%" }],
    ["Crown City", { x: "40%", y: "70%" }],
    ["Dandelion Depths", { x: "55%", y: "32%" }],
    ["Desert Hills", { x: "20%", y: "70%" }],
    ["Dino Dino Jungle", { x: "57%", y: "88%" }],
    ["DK Pass", { x: "63%", y: "40%" }],
    ["DK Spaceport", { x: "40%", y: "85%" }],
    ["Dry Bones Burnout", { x: "39%", y: "14%" }],
    ["Faraway Oasis", { x: "56%", y: "67%" }],
    ["Ghost Valley 1", { x: "55%", y: "9%" }],
    ["Ghost Valley 2", { x: "59%", y: "9%" }],
    ["Ghost Valley 3", { x: "59%", y: "17%" }],
    ["Great %3F Block Ruins", { x: "66%", y: "82%" }],
    ["Koopa Beach 1", { x: "42%", y: "78%" }],
    ["Koopa Troopa Beach", { x: "46%", y: "80%" }],
    ["Mario Bros Circuit", { x: "28%", y: "60%" }],
    ["Mario Circuit", { x: "48%", y: "22%" }],
    ["Mario Circuit 1", { x: "48%", y: "14%" }],
    ["Mario Circuit 2", { x: "43%", y: "24%" }],
    ["Mario Circuit 3", { x: "52%", y: "24%" }],
    ["Moo Moo Meadows", { x: "48%", y: "40%" }],
    ["Peach Beach", { x: "71%", y: "67%" }],
    ["Peach Stadium", { x: "47%", y: "55%" }],
    ["Rainbow Road", { x: "48%", y: "69%" }],
    ["Salty Salty Speedway", { x: "64%", y: "58%" }],
    ["Shy Guy Bazaar", { x: "20%", y: "48%" }],
    ["Sky-High Sundae", { x: "72%", y: "30%" }],
    ["Starview Peak", { x: "63%", y: "20%" }],
    ["Toad's Factory", { x: "40%", y: "30%" }],
    ["Vanilla Lake 1", { x: "66%", y: "30%" }],
    ["Wario Shipyard", { x: "71%", y: "50%" }],
    ["Wario Stadium", { x: "30%", y: "40%" }],
    ["Whistlestop Summit", { x: "30%", y: "80%" }]
]);

// Course names may contain characters that need encoding in URLs (spaces,
// "%", ...). Encode them so the names still resolve to the image files.
// Retro course images live in a retro/ subfolder.
function image_path(course, dir) {
    const sub = retro_courses.has(course) ? "retro/" : "";
    return "images/" + dir + "/" + sub + encodeURIComponent(course) + ".webp";
}

// Course names are stored percent-encoded where needed (e.g. "%3F" for
// "?"), so decode them for display.
function display_name(course) {
    try {
        return decodeURIComponent(course);
    } catch {
        return course;
    }
}

// Normalize a course name for matching: ignore apostrophes and treat "?",
// "%3F", and "Question Mark" as the same character. Used to migrate saved
// state that stored older course names.
function key_name(name) {
    let n = name.replace(/'/g, "");
    n = n.replace(/%3F/gi, "?");
    n = n.replace(/\?/g, "Question Mark");
    return n;
}

function save() {
    try {
        localStorage.setItem('current_list', JSON.stringify(current_list));
        localStorage.setItem('history', JSON.stringify(history));
        localStorage.setItem('exclusive', JSON.stringify(exclusive));
        localStorage.setItem('autoRemove', JSON.stringify(autoRemove));
        localStorage.setItem('retro', JSON.stringify(retro));
        console.log('Saved to localStorage');
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

// Saved state may reference courses by an older name (e.g. without
// apostrophes) or by a course that no longer exists in images/courses/.
// Match entries to courses by sanitized name and drop anything unknown.
function normalize_courses(saved) {
    const by_key = new Map();
    for (const course of courses) {
        by_key.set(key_name(course), course);
    }
    const out = [];
    for (const entry of saved) {
        const course = by_key.get(key_name(entry));
        if (course && !out.includes(course)) {
            out.push(course);
        }
    }
    return out;
}

function load() {
    try {
        const saved_list = localStorage.getItem('current_list');
        const saved_history = localStorage.getItem('history');
        const saved_exclusive = localStorage.getItem('exclusive');
        const saved_remove = localStorage.getItem('autoRemove');
        const saved_retro = localStorage.getItem('retro');
        console.log("Loaded from localStorage.");
        return {
            "current_list": saved_list ? normalize_courses(JSON.parse(saved_list)) : [...courses],
            "history": saved_history ? normalize_courses(JSON.parse(saved_history)) : [],
            "exclusive": saved_exclusive ? JSON.parse(saved_exclusive) : true,
            "autoRemove": saved_remove ? JSON.parse(saved_remove) : true,
            "retro": saved_retro ? JSON.parse(saved_retro) : true
        };
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return {
            "current_list": [...courses],
            "history": [],
            "exclusive": true,
            "autoRemove": true,
            "retro": true
        };
    }
}

let rolling = false;
let data = load();
let current_list = data["current_list"];
let history = data["history"];
let exclusive = data["exclusive"];
let autoRemove = data["autoRemove"];
let retro = data["retro"];

// Build the course list UI and the map cache from the course list.
function build_list() {
    const grid = document.getElementById("list-grid");
    if (courses.length === 0 || !grid) {
        return;
    }
    courses.forEach((course, i) => {
        const img = document.createElement("img");
        img.id = "list-" + i;
        img.className = "list-item";
        img.src = image_path(course, "courses");
        img.onclick = () => listClick(img.id);
        grid.appendChild(img);
    });
    displayListRetro();
}

// Hide the retro courses in the list view while retro tracks are off.
function displayListRetro() {
    courses.forEach((course, i) => {
        const item = document.getElementById("list-" + i);
        if (item) {
            item.classList.toggle('hidden', !retro && retro_courses.has(course));
        }
    });
}

// Course thumbnails are 16:9. Pick the number of grid columns that makes
// them as large as possible while fitting every course into the list area,
// then let the grid rows fill the remaining space. Runs on load and resize
// so the grid fills the page at any viewport size.
const COURSE_ASPECT = 16 / 9;
function layout_list() {
    const grid = document.getElementById("list-grid");
    if (!grid) {
        return;
    }
    // Only lay out the courses currently shown (retro ones may be hidden).
    for (const pad of grid.querySelectorAll(".list-pad")) {
        pad.remove();
    }
    const items = grid.querySelectorAll(".list-item:not(.hidden)");
    const count = items.length;
    if (count === 0) {
        return;
    }
    const rect = grid.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
        return;
    }
    const gap = rect.height * 0.005; // matches the 0.5vh CSS gap
    let best_cols = 1;
    let best_area = -1;
    for (let cols = 1; cols <= count; cols++) {
        const rows = Math.ceil(count / cols);
        const cell_w = (rect.width - (cols - 1) * gap) / cols;
        const cell_h = (rect.height - (rows - 1) * gap) / rows;
        // Largest 16:9 thumbnail that fits in one cell
        const img_w = Math.min(cell_w, cell_h * COURSE_ASPECT);
        const area = count * img_w * (img_w / COURSE_ASPECT);
        if (area > best_area) {
            best_area = area;
            best_cols = cols;
        }
    }
    const rows = Math.ceil(count / best_cols);
    // minmax(0, 1fr): without the 0 minimum, tracks refuse to shrink below
    // the images' min-content size and the last rows overflow the area.
    // (grid-template-rows rather than grid-auto-rows: the latter is not
    // settable via CSSOM in Chrome.)
    grid.style.gridTemplateColumns = `repeat(${best_cols}, minmax(0, 1fr))`;
    grid.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;

    // Center the (possibly partial) last row by padding it with empty cells.
    const lastRowStart = (rows - 1) * best_cols;
    const padLeft = Math.floor((best_cols - (count - lastRowStart)) / 2);
    const anchor = items[lastRowStart];
    for (let i = 0; i < padLeft; i++) {
        const pad = document.createElement("div");
        pad.className = "list-pad";
        grid.insertBefore(pad, anchor);
    }
}

window.addEventListener("resize", layout_list);

function build_cache() {
    const cache = document.getElementById("cache");
    if (!cache) {
        return;
    }
    for (const course of courses) {
        const img = document.createElement("img");
        img.className = "cache";
        img.src = image_path(course, "maps");
        cache.appendChild(img);
    }
}

// Show the loaded state. Runs on DOMContentLoaded rather than window.onload,
// which waits for every image (including the map cache) and would leave the
// toggles showing the HTML defaults until then.
function refresh_ui() {
    displayExclusive();
    displayRemove();
    displayRetro();
    displayListRetro();
    layout_list();
    showList();
    const map = history.length > 0
        ? image_path(history[history.length - 1], "maps")
        : document.getElementById("map").getAttribute("src");
    set_map_html(map);
}

document.addEventListener("DOMContentLoaded", function() {
    build_list();
    build_cache();
    refresh_ui();
});

// Another tab saved: pick up its state so this tab doesn't overwrite it
// with a stale copy on its next save.
window.addEventListener("storage", function(event) {
    if (event.storageArea !== localStorage) {
        return;
    }
    data = load();
    current_list = data["current_list"];
    history = data["history"];
    exclusive = data["exclusive"];
    autoRemove = data["autoRemove"];
    retro = data["retro"];
    refresh_ui();
});

// The reset and disable buttons need a second click within 5 seconds to
// confirm. Clear the pending timer on each click so an earlier one can't
// disarm a later confirmation early.
let reset_timer = null;
function resetList() {
    clearTimeout(reset_timer);
    if (reset_timer === null) {
        document.getElementById("reset_list").src = "images/reset_confirm.webp";
        reset_timer = setTimeout(disarmReset, 5000);
    } else {
        current_list = [...courses];
        history = [];
        save();
        console.log('List reset to full course list');
        disarmReset();
        showList();
    }
}
function disarmReset() {
    reset_timer = null;
    document.getElementById("reset_list").src = "images/reset.webp";
}

let disable_timer = null;
function disableList() {
    clearTimeout(disable_timer);
    if (disable_timer === null) {
        document.getElementById("disable_list").src = "images/disable_confirm.webp";
        disable_timer = setTimeout(disarmDisable, 5000);
    } else {
        current_list = [];
        save();
        console.log('List reset to none');
        disarmDisable();
        showList();
    }
}
function disarmDisable() {
    disable_timer = null;
    document.getElementById("disable_list").src = "images/disable.webp";
}

function toggleExclusive() {
    exclusive = !exclusive;
    displayExclusive();
    console.log('Exclusive mode:', exclusive);
    save();
}
function displayExclusive() {
    document.getElementById("exclusive").src = "images/" + (exclusive ? "check.webp" : "cross.webp");
}

function toggleRemove() {
    autoRemove = !autoRemove;
    displayRemove();
    console.log('Auto Remote:', autoRemove);
    save();
}
function displayRemove() {
    document.getElementById("auto-remove").src = "images/" + (autoRemove ? "check.webp" : "cross.webp");
}

function toggleRetro() {
    retro = !retro;
    displayRetro();
    displayListRetro();
    layout_list();
    console.log('Retro tracks:', retro);
    save();
}
function displayRetro() {
    document.getElementById("retro").src = "images/" + (retro ? "check.webp" : "cross.webp");
}

function toggleList() {
   document.getElementById('list-mode').classList.toggle('disabled');
   showList();
}
function showList() {
   for (let i = 0; i < courses.length; i++) {
      if (current_list.includes(courses[i])) {
        document.getElementById("list-" + i).classList.remove('excluded');
      } else {
        document.getElementById("list-" + i).classList.add('excluded');
      }
   }
}

function listClick(id) {
    let index = id.split("-")[1];
    let course = courses[index];
    console.log("Clicked list item " + display_name(course) + " (" + index + ")");
    if (current_list.includes(course)) {
        current_list.splice(current_list.indexOf(course), 1);
        save();
        console.log('Removing course:', display_name(course));
    } else {
        current_list.push(course);
        save();
        console.log("Added course:", display_name(course));
    }
    document.getElementById("list-" + index).classList.toggle('excluded', !current_list.includes(course));
}

// Roll sounds: the rattle (audio/roll.mp3) plays for the whole spin and the
// reel is timed to it, and the fanfare (audio/gold.mp3) plays when a gold
// roll is revealed. Created up front so the files start loading while the
// page is up.
const roll_audio = new Audio("audio/roll.mp3");
const gold_audio = new Audio("audio/gold.mp3");
const SOUND_VOLUME = 0.6;
roll_audio.volume = SOUND_VOLUME;
gold_audio.volume = SOUND_VOLUME;

// Start a clip from the beginning. A rejection (autoplay policy, missing
// file) must not break the roll, so swallow it.
function play_sound(audio) {
    try {
        audio.currentTime = 0;
        audio.play().catch(error => console.warn("Audio playback failed:", error));
    } catch (error) {
        console.warn("Audio playback failed:", error);
    }
}

// Slot-machine roll: scroll a strip of random courses from the pool across
// the course frame, speeding up from a slow start and easing out so it
// settles on the chosen course.
// How fast the reel scrolls: the original 24 courses in 2.3s. The number
// of courses scrolled past before the chosen one scales with the spin's
// duration, so a longer spin covers more courses rather than moving slower.
const REEL_SPEED = 24 / 2300; // courses per ms
// The spin lasts exactly as long as audio/roll.mp3: the rattle starts with
// the spin and the reel settles as the sound ends. The duration is read from
// the audio once its metadata has loaded; ROLL_FALLBACK_MS is the file's
// length (5.448s), used if a roll happens before the metadata arrives.
const ROLL_FALLBACK_MS = 5450;
function roll_duration_ms() {
    const d = roll_audio.duration;
    return Number.isFinite(d) && d > 0 ? Math.round(d * 1000) : ROLL_FALLBACK_MS;
}

// Rare "gold" roll, for a Mirror course: the chosen course lights up gold
// and flips horizontally just before the reel stops, and stays that way
// (with a gold "(Mirror)" label) until the next roll. Purely cosmetic.
// Add ?gold to the URL to force one for testing.
const GOLD_CHANCE = 0.0026;
const GOLD_REVEAL = 1200; // ms before the reel stops
const force_gold = new URLSearchParams(location.search).has("gold");

async function spin_reel(pool, chosen, gold) {
    // Reduced-motion rolls skip the reel (and its rattle): the course
    // appears instantly.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }
    const course_img = document.getElementById("course");
    const reel = document.getElementById("reel");
    const strip = document.getElementById("reel-strip");
    const random_course = () => pool[Math.floor(Math.random() * pool.length)];
    const add = (src) => {
        const img = document.createElement("img");
        img.className = "reel-item";
        img.src = src;
        strip.appendChild(img);
        return img;
    };

    const duration = roll_duration_ms();
    const reel_length = Math.round(duration * REEL_SPEED);

    // Start from whatever is showing now, then random fillers (no course
    // twice in a row), the chosen course, and a couple more to its right.
    strip.innerHTML = "";
    add(course_img.src);
    // Pick each filler from the courses that are allowed at that spot rather
    // than retrying random picks: with a pool of two, the last filler can
    // have no allowed course (one is prev, the other is chosen), so retrying
    // would loop forever. Fall back to any course in that case.
    let prev = null;
    for (let i = 0; i < reel_length; i++) {
        const last = i === reel_length - 1;
        const allowed = pool.filter(c => c !== prev && !(last && c === chosen));
        const c = allowed.length > 0
            ? allowed[Math.floor(Math.random() * allowed.length)]
            : random_course();
        add(image_path(c, "courses"));
        prev = c;
    }
    const chosen_img = add(image_path(chosen, "courses"));
    add(image_path(random_course(), "courses"));
    add(image_path(random_course(), "courses"));

    // Centre the first item, then transition to centring the chosen one.
    const item_w = strip.firstChild.getBoundingClientRect().width;
    const offset = (reel.clientWidth - item_w) / 2;
    let gold_timer = null;
    try {
        strip.style.transition = "none";
        strip.style.transform = `translateX(${offset}px)`;
        reel.classList.add("spinning");
        course_img.style.visibility = "hidden";
        strip.getBoundingClientRect(); // apply the start position before animating
        strip.style.transition = `transform ${duration}ms cubic-bezier(0.45, 0.05, 0.15, 1)`;
        strip.style.transform = `translateX(${offset - (reel_length + 1) * item_w}px)`;
        play_sound(roll_audio); // the rattle starts with the spin
        if (gold) {
            gold_timer = setTimeout(() => {
                chosen_img.classList.add("gold");
                document.getElementById("course-frame").classList.add("gold-frame");
                play_sound(gold_audio); // the fanfare starts with the reveal
            }, duration - GOLD_REVEAL);
        }
        await wait(duration);
        course_img.src = image_path(chosen, "courses");
    } finally {
        // Always put the course image back, or a failed roll leaves nothing
        // to click.
        clearTimeout(gold_timer);
        course_img.style.visibility = "";
        reel.classList.remove("spinning");
    }
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// Fade the map and label in or out. The fade itself is a CSS transition
// (see #map_container and #label in styles.css); this waits for it with a
// single timer. (Many short timers in a row stretch to seconds each when
// the tab is in the background, which made rolls look stuck.)
const FADE_DURATION = 150; // ms, matches styles.css
async function fade(opacity) {
    document.getElementById("map_container").style.opacity = opacity;
    document.getElementById("label").style.opacity = opacity;
    await wait(FADE_DURATION);
}

async function randomize() {
    if (rolling) {
        return;
    }
    rolling = true;
    try {
        await roll();
    } catch (error) {
        console.error("Roll failed:", error);
    } finally {
        // Always release the lock and show the map and label again, so an
        // error can't leave every later click ignored.
        rolling = false;
        document.getElementById("map_container").style.opacity = "";
        document.getElementById("label").style.opacity = "";
    }
}

async function roll() {
    let list = exclusive ? current_list : courses;
    if (!retro) {
        list = list.filter(course => !retro_courses.has(course));
    }

    if (list.length === 0) {
        document.getElementById("course").src = "images/empty.webp";
        document.getElementById("label").innerText = "List Empty";
        return;
    }

    // Copy: list may be current_list itself, which can change during the
    // roll (list clicks, reset, another tab).
    const pool = [...list];
    const course = pool[Math.floor(Math.random() * pool.length)];
    const gold = force_gold || Math.random() < GOLD_CHANCE;
    if (gold) {
        console.log('Gold roll!');
    }
    // Decide now, so toggling the settings mid-roll can't remove the course
    // without recording it in the history (or the other way round).
    const remove = exclusive && autoRemove;

    // A gold fanfare from a previous roll may still be ringing; stop it so
    // it doesn't overlap this roll's rattle.
    gold_audio.pause();

    await fade(0);

    document.getElementById("course").classList.remove("gold");
    document.getElementById("label").classList.remove("gold");
    document.getElementById("course-frame").classList.remove("gold-frame", "gold-landed");
    await spin_reel(pool, course, gold);

    document.getElementById("course").src = image_path(course, "courses");
    document.getElementById("course").classList.toggle("gold", gold);
    document.getElementById("label").classList.toggle("gold", gold);
    if (gold) {
        const mask = `url("${image_path(course, "courses")}")`;
        const shine = document.getElementById("shine");
        shine.style.maskImage = mask;
        shine.style.webkitMaskImage = mask;
        document.getElementById("course-frame").classList.add("gold-frame", "gold-landed");
    }
    document.getElementById("label").innerText = gold
        ? "★ " + display_name(course) + " (Mirror) ★"
        : display_name(course);

    // Remove the course and record it together, once the roll has landed,
    // against whatever the list is now.
    if (remove) {
        console.log('Removing course:', display_name(course));
        const index = current_list.indexOf(course);
        if (index !== -1) {
            current_list.splice(index, 1);
        }
        history.push(course);
        save();
        showList();
    }
    set_map_html(image_path(course, "maps"));

    await fade(1);
}

// Show the map with the pick number of each course in the history.
function set_map_html(map_path) {
    const container = document.getElementById("map_container");
    const map = document.getElementById("map");
    map.src = map_path;
    for (const marker of container.querySelectorAll(".map-marker")) {
        marker.remove();
    }
    history.forEach((course, i) => {
        const position = course_locations.get(course);
        if (!position) {
            console.warn("No map position for course: " + display_name(course));
            return;
        }
        const marker = document.createElement("img");
        marker.className = "map-marker";
        marker.style.left = position.x;
        marker.style.top = position.y;
        marker.src = "images/numbers/" + (i + 1) + ".svg";
        container.appendChild(marker);
    });
}
