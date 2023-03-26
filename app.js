const express = require("express");
const morgan = require("morgan");
const Expense = require("./lib/expense");
const Account = require("./lib/account");

const app = express();
const PORT = 3000;
const HOST = "localhost";
const account = require("./lib/seed-data");

app.set("view engine", "pug");
app.set("views", "./views");

app.use(morgan("common"));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(PORT, HOST, () => {
  console.log(`listening on port ${PORT} host ${HOST}`);
});