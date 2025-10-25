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
    "Whistletop Summit"
];

function save() {
    try {
        localStorage.setItem('current_list', JSON.stringify(current_list));
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
        const saved_exclusive = localStorage.getItem('exclusive');
        const saved_remove = localStorage.getItem('autoRemove');
        console.log("Loaded from localStorage.");
        return {
            "current_list": saved_list ? JSON.parse(saved_list) : [...courses],
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
let exclusive = data["exclusive"];
let autoRemove = data["autoRemove"];

window.onload = function() {
    displayExclusive();
    displayRemove();
};

let reset_safety = true;
function resetList() {
    if (reset_safety) {
        reset_safety = false;
        document.getElementById("reset_list").src = "images/reset_confirm.webp";
        resetTimer();
    } else {
        current_list = [...courses];
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
        document.getElementById("label").innerText = "List Empty";
        rolling = false;
        return;
    }

    for (let i = 1; i <= 10; i++) {
        document.getElementById("course").style.opacity = 1 - (i * 0.1);
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
    
    let path = "images/courses/" + course + ".webp";
    path = path.replace("?", "Question Mark");
    path = path.replace("'", "");
    document.getElementById("course").src = path;
    document.getElementById("label").innerText = course;
    
    await new Promise(r => setTimeout(r, 100));
    for (let i = 1; i <= 10; i++) {
        document.getElementById("course").style.opacity = i * 0.1;
        document.getElementById("label").style.opacity = i * 0.1;
        await new Promise(r => setTimeout(r, 15));
    }
    rolling = false;
}