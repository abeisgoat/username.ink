const islands = require("./islands.json");
const { createHash } = require("crypto");

for (let u=0; u<10; u++) {
    const seed = createHash("md5")
        .update(process.argv[2] + u)
        .digest()
        .reduce((sum, uint) => sum + uint, 0);
    let words = []
    let i = 1;
    while (words.length < 10) {
        words = [...words, ...islands[(seed * i) % islands.length].split(" ").map((word) => word.replace(/[^a-zA-Z0-9]/g, "")).filter((word) => (word.length > 2))];
        i++;
    }

    let username = ""
    i = 0;
    while (username.length < 6) {
        username = words.slice(0, (i++) + (seed % 2)).join("");
    }

    console.log({username})
}