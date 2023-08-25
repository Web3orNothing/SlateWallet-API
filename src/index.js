import express from "express";
import bodyParser from "body-parser";

import cors from "cors";
import dotEnv from "dotenv";

import apiRouters from "./routes/index.js";

dotEnv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable cors
app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Add the apiRoutes stack to the server
app.use("/", apiRouters);

app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});

export default app;
