let courses = [
    "Acorn Heights",
    "Airship Fortress",
    "Boo Cinema",
    "Bowser's Castle",
    "Cheep Cheep Falls",
    "Choco Mountain",
    "Crown City",
    "Dandelion Depths",
    "Desert Hills",
    "Dino Dino Jungle",
    "DK Pass",
    "DK Spaceport",
    "Dry Bones Burnout",
    "Faraway Oasis",
    "Great ? Block Ruins",
    "Koopa Troopa Beach",
    "Mario Bros Circuit",
    "Mario Circuit",
    "Moo Moo Meadows",
    "Peach Beach",
    "Peach Stadium",
    "Rainbow Road",
    "Salty Salty Speedway",
    "Shy Guy Bazaar",
    "Sky-High Sundae",
    "Starview Peak",
    "Toad's Factory",
    "Wario Shipyard",
    "Wario Stadium",
    "Whistlestop Summit"
];

const course_locations = new Map([
    ["Acorn Heights", { x: "46%", y: "5%" }],
    ["Airship Fortress", { x: "22%", y: "28%" }],
    ["Boo Cinema", { x: "55%", y: "15%" }],
    ["Bowser's Castle", { x: "31%", y: "15%" }],
    ["Cheep Cheep Falls", { x: "55%", y: "50%" }],
    ["Choco Mountain", { x: "39%", y: "50%" }],
    ["Crown City", { x: "40%", y: "70%" }],
    ["Dandelion Depths", { x: "55%", y: "32%" }],
    ["Desert Hills", { x: "20%", y: "70%" }],
    ["Dino Dino Jungle", { x: "57%", y: "88%" }],
    ["DK Pass", { x: "63%", y: "40%" }],
    ["DK Spaceport", { x: "40%", y: "85%" }],
    ["Dry Bones Burnout", { x: "39%", y: "14%" }],
    ["Faraway Oasis", { x: "56%", y: "67%" }],
    ["Great ? Block Ruins", { x: "66%", y: "82%" }],
    ["Koopa Troopa Beach", { x: "46%", y: "80%" }],
    ["Mario Bros Circuit", { x: "28%", y: "60%" }],
    ["Mario Circuit", { x: "48%", y: "22%" }],
    ["Moo Moo Meadows", { x: "48%", y: "40%" }],
    ["Peach Beach", { x: "71%", y: "67%" }],
    ["Peach Stadium", { x: "47%", y: "55%" }],
    ["Rainbow Road", { x: "48%", y: "69%" }],
    ["Salty Salty Speedway", { x: "64%", y: "58%" }],
    ["Shy Guy Bazaar", { x: "20%", y: "48%" }],
    ["Sky-High Sundae", { x: "70%", y: "30%" }],
    ["Starview Peak", { x: "63%", y: "20%" }],
    ["Toad's Factory", { x: "40%", y: "30%" }],
    ["Wario Shipyard", { x: "71%", y: "50%" }],
    ["Wario Stadium", { x: "30%", y: "40%" }],
    ["Whistlestop Summit", { x: "30%", y: "80%" }]
]);

function save() {
    try {
        localStorage.setItem('current_list', JSON.stringify(current_list));
        localStorage.setItem('history', JSON.stringify(history));
        localStorage.setItem('exclusive', JSON.stringify(exclusive));
        localStorage.setItem('autoRemove', JSON.stringify(autoRemove));
        console.log('Saved to localStorage');
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

function load() {
    try {
        const saved_list = localStorage.getItem('current_list');
        const saved_history = localStorage.getItem('history');
        const saved_exclusive = localStorage.getItem('exclusive');
        const saved_remove = localStorage.getItem('autoRemove');
        console.log("Loaded from localStorage.");
        return {
            "current_list": saved_list ? JSON.parse(saved_list) : [...courses],
            "history": saved_history ? JSON.parse(saved_history) : [],
            "exclusive": saved_exclusive ? JSON.parse(saved_exclusive) : false,
            "autoRemove": saved_remove ? JSON.parse(saved_remove) : false
        };
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return {
            "current_list": [...courses],
            "exclusive": false,
            "autoRemove": false
        };
    }
}

let rolling = false;
let data = load();
let current_list = data["current_list"];
let history = data["history"];
let exclusive = data["exclusive"];
let autoRemove = data["autoRemove"];

window.onload = function() {
    displayExclusive();
    displayRemove();
    if (history.length > 0) {
        let filename = get_filename(history[history.length - 1]);
        set_map_html("images/maps/" + filename);
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
    console.log("Clicked list item " + course + " (" + index + ")");
    if (current_list.includes(course)) {
        current_list.splice(current_list.indexOf(course), 1);
        save();
        console.log('Removing course:', course);
    } else {
        current_list.push(course);
        save();
        console.log("Added course:", course);
    }
    document.getElementById("list-" + index).classList.toggle('excluded');
}

async function randomize() {
    if (rolling) {
        return;
    }
    rolling = true;
    
    let list = exclusive ? current_list : courses;
    
    if (list.length === 0) {
        document.getElementById("course").src = "images/empty.webp";
        //document.getElementById("map").src = "images/nothing.webp";
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
        console.log('Removing course:', course);
        current_list.splice(num, 1);
        save();
    }
    
    let filename =get_filename(course);
    let course_path = "images/courses/" + filename;
    let map_path = "images/maps/" + filename;
    document.getElementById("course").src = course_path;
    document.getElementById("label").innerText = course;

    set_map_html(map_path);
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

function get_filename(course) {
    let filename = course + ".webp";
    filename = filename.replace("?", "Question Mark");
    filename = filename.replace("'", "");
    return filename;
}

function set_map_html(map_path) {
    document.getElementById("map").src = map_path;
    let html = document.getElementById("map").outerHTML;
    for (let i = 0; i < history.length; i++) {
        let course = history[i];
        let position = course_locations.get(course);
        html += ' <img style="position: absolute; ';
        html += 'width: 3vh; height: 3vh; ';
        html += 'left: ' + position.x + '; ';
        html += 'top: ' + position.y + ';" ';
        html += 'src="images/numbers/' + (i + 1).toString() + '.png" />';
    }
    document.getElementById('map_container').innerHTML = html;
}
