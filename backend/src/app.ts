import express from "express";
//this code is here to test if it would work...
const app = express();

app.get("/", (req, res) => {
  res.send("Working");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});