import * as functions from "firebase-functions";
import * as express from "express";
import * as admin from "firebase-admin";
import {generate} from "./sprite";
import {createHash} from "crypto";

admin.initializeApp({
    storageBucket: "username-ink",
    databaseURL: "https://pug-pug-pug.firebaseio.com"
});

const app = express();
app.get("/i/retro/:seed", (req, res) => {
   const seed = createHash("md5").update(req.params.seed).digest("hex");
    const requestRef = admin.database().ref(`library/retro/${seed}`);

    console.log(`Requesting [retro] for seed: ${seed}`);
   requestRef.child("requested").set(true);
   requestRef.child("link").on("value", (snap) => {
      if (!snap.exists()) return;

       const firebaseLink = snap.val();
      res.redirect(firebaseLink);
   });
});

export const request_ink = functions.https.onRequest(app);
export const fulfill_ink = functions.database.ref("/library/{style}/{seed}").onCreate((snap, ctx) => {
    const seed = ctx.params.seed;

    if (ctx.params.style !== "retro") {
        throw `Unknown style ${ctx.params.style}`;
    }

    console.log(`Generating [retro] for seed: ${seed}`);
    const cloudFile = admin.storage().bucket().file(`public/retro/${seed}.png`);
    const writeStream = cloudFile.createWriteStream();
    const readStream = generate(seed).createPNGStream();
    readStream.pipe(writeStream);

    return new Promise((resolve) => {
        writeStream.on("finish", () => {
            const publicUrl = new URL(cloudFile.publicUrl());
            const firebaseLinkHost = publicUrl.hostname.startsWith("localhost") ?
                `http://localhost:${publicUrl.port}` : `https://firebasestorage.googleapis.com`;
            const firebaseFilename = encodeURIComponent(cloudFile.name);
            const firebaseLink = `${firebaseLinkHost}/v0/b/${cloudFile.bucket.name}/o/${firebaseFilename}?alt=media`
            snap.ref.child("link").set(firebaseLink);
            resolve();
        });
    });
});