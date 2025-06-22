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
    "Whistletop Summit"
];

let rolling = false;

async function randomize() {
    if (rolling) {
        return;
    }
    rolling = true;
    for (let i = 1; i <= 10; i++) {
        document.getElementById("course").style.opacity = 1 - (i * 0.1);
        document.getElementById("label").style.opacity = 1 - (i * 0.1);
        await new Promise(r => setTimeout(r, 15));
    }
    let num = Math.floor(Math.random() * courses.length);
    let course = courses[num];
    let path = "images/courses/" + course + ".webp";
    path = path.replace("?", "Question Mark");
    path = path.replace("'", "");
    document.getElementById("course").src = path;
    document.getElementById("label").innerText = course;
    for (let i = 1; i <= 10; i++) {
        document.getElementById("course").style.opacity = i * 0.1;
        document.getElementById("label").style.opacity = i * 0.1;
        await new Promise(r => setTimeout(r, 15));
    }
    rolling = false;
}