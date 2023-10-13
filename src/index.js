import cron from "node-cron";

import dotEnv from "dotenv";
import webpush from "web-push";

import { checkTx } from "./handler.js";
import app from "./app.js";

dotEnv.config();

const port = process.env.PORT || 5000;

const subject = process.env.SUBJECT;
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
webpush.setVapidDetails(subject, publicVapidKey, privateVapidKey);

app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});

cron.schedule("0 * * * * *", checkTx);
