import dotEnv from "dotenv";
import webpush from "web-push";
import Moralis from "moralis";

import { checkTx } from "./handler.js";
import app from "./app.js";

dotEnv.config();

const port = process.env.PORT || 5000;

const subject = process.env.SUBJECT;
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
webpush.setVapidDetails(subject, publicVapidKey, privateVapidKey);

if (process.argv[2] == "checkTx") {
  await checkTx();
} else {
  await Moralis.start({
    apiKey: process.env.MORAILS_API_KEY,
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}!`);
  });
}
