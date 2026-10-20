// The course list is generated from images/courses/ by generate-courses.mjs
// (see courses.js). That list is the single source of truth for which
// courses exist. Course names are the image filenames without extension;
// characters that are invalid in filenames (like "?") are percent-encoded
// in the filename and decoded for display.
const courses = window.COURSES || [];

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

// The retro courses added in a later update. The "Retro Tracks" toggle
// leaves these out of the random pool when it is off.
const retro_courses = new Set([
    "Choco Island 1",
    "Choco Island 2",
    "Ghost Valley 1",
    "Ghost Valley 2",
    "Ghost Valley 3",
    "Koopa Beach 1",
    "Mario Circuit 1",
    "Mario Circuit 2",
    "Mario Circuit 3",
    "Vanilla Lake 1"
]);

// Course names may contain characters that need encoding in URLs (spaces,
// "%", ...). Encode them so the names still resolve to the image files.
function image_path(course, dir) {
    return "images/" + dir + "/" + encodeURIComponent(course) + ".webp";
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

document.addEventListener("DOMContentLoaded", function() {
    build_list();
    build_cache();
    layout_list();
});

window.onload = function() {
    displayExclusive();
    displayRemove();
    displayRetro();
    if (history.length > 0) {
        set_map_html(image_path(history[history.length - 1], "maps"));
    }
};

let reset_safety = true;
function resetList() {
    if (reset_safety) {
        reset_safety = false;
        document.getElementById("reset_list").src = "images/reset_confirm.webp";
        resetTimer();
    } else {
        current_list = [...courses];
        history = [];
        save();
        console.log('List reset to full course list');
        document.getElementById("reset_list").src = "images/reset.webp";
        reset_safety = true;
        showList();
    }
}
async function resetTimer() {
    await new Promise(r => setTimeout(r, 5000));
    reset_safety = true;
    document.getElementById("reset_list").src = "images/reset.webp";
}

let disable_safety = true;
function disableList() {
    if (disable_safety) {
        disable_safety = false;
        document.getElementById("disable_list").src = "images/disable_confirm.webp";
        disableTimer();
    } else {
        current_list = [];
        save();
        console.log('List reset to none');
        document.getElementById("disable_list").src = "images/disable.webp";
        disable_safety = true;
        showList();
    }
}
async function disableTimer() {
    await new Promise(r => setTimeout(r, 5000));
    disable_safety = true;
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
    document.getElementById("list-" + index).classList.toggle('excluded');
}

async function randomize() {
    if (rolling) {
        return;
    }
    rolling = true;
    
    let list = exclusive ? current_list : courses;
    if (!retro) {
        list = list.filter(course => !retro_courses.has(course));
    }
    
    if (list.length === 0) {
        document.getElementById("course").src = "images/empty.webp";
        document.getElementById("label").innerText = "List Empty";
        rolling = false;
        return;
    }

    for (let i = 1; i <= 10; i++) {
        document.getElementById("course").style.opacity = 1 - (i * 0.1);
        document.getElementById("map_container").style.opacity = 1 - (i * 0.1);
        document.getElementById("label").style.opacity = 1 - (i * 0.1);
        await new Promise(r => setTimeout(r, 15));
    }
    
    let num = Math.floor(Math.random() * list.length);
    let course = list[num];
    
    if (exclusive && autoRemove) {
        console.log('Removing course:', display_name(course));
        current_list.splice(current_list.indexOf(course), 1);
        save();
    }
    
    document.getElementById("course").src = image_path(course, "courses");
    document.getElementById("label").innerText = display_name(course);

    set_map_html(image_path(course, "maps"));
    if (exclusive && autoRemove) {
        history.push(course);
        save();
    }
    
    await new Promise(r => setTimeout(r, 100));
    for (let i = 1; i <= 10; i++) {
        document.getElementById("course").style.opacity = i * 0.1;
        document.getElementById("map_container").style.opacity = i * 0.1;
        document.getElementById("label").style.opacity = i * 0.1;
        await new Promise(r => setTimeout(r, 15));
    }
    rolling = false;
}

function set_map_html(map_path) {
    document.getElementById("map").src = map_path;
    let html = document.getElementById("map").outerHTML;
    for (let i = 0; i < history.length; i++) {
        let course = history[i];
        let position = course_locations.get(course);
        if (!position) {
            console.warn("No map position for course: " + display_name(course));
            continue;
        }
        html += ' <img style="position: absolute; ';
        html += 'width: 3vh; height: 3vh; ';
        html += 'left: ' + position.x + '; ';
        html += 'top: ' + position.y + ';" ';
        html += 'src="images/numbers/' + (i + 1).toString() + '.png" />';
    }
    document.getElementById('map_container').innerHTML = html;
}
