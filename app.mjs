import express from "express";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/load-balancer-test", (req, res) => {
  res.send(`Hello World! This is a load balancer test on port ${port}`);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
