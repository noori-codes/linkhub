import express from "express";

const app = express();

console.clear();

app.listen(3000, () => {
  console.log("Sever is app an running on port 3000");
});

console.log("hello world");
