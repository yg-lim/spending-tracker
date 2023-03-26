const express = require("express");
const morgan = require("morgan");
const Expense = require("./lib/expense");
const Account = require("./lib/account");

const app = express();
const PORT = 3000;
const HOST = "localhost";
const account = require("./lib/seed-data");
const expensesNewToOld = require("./lib/expenses-new-to-old");
const MONTHS_IN_YEAR = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};

app.set("view engine", "pug");
app.set("views", "./views");

app.use(morgan("common"));
app.use(express.static("public"));

app.get("/", (req, res) => {
  let today = new Date();
  let yearMonth = `${today.getFullYear()}/${today.getMonth()}`;
  res.redirect(yearMonth);
});

app.get("/:year/:month", (req, res) => {
  let year = +req.params.year;
  let month = +req.params.month;
  let yearMonth = `${year}${month}`;
  let monthsExpenses = account.expensesByYearMonth(yearMonth);

  // perhaps make a dates object that we can pass into the view
  // has various props such as Next Month, Prev Month (value generated from a static method we'll add to Account class, we can move the MONTHS_IN_YEAR data structure to it too)

  res.render("expenses", {
    expenses: expensesNewToOld(monthsExpenses),
    total: account.totalByMonth(monthsExpenses),
    monthToString: MONTHS_IN_YEAR[month],
    month,
    year,
  });
});

app.listen(PORT, HOST, () => {
  console.log(`listening on port ${PORT} host ${HOST}`);
});