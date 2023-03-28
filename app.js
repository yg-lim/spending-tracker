const express = require("express");
const morgan = require("morgan");
const Expense = require("./lib/expense");
const ExpenseList = require("./lib/expense-list");

const app = express();
const PORT = 3000;
const HOST = "localhost";
const list = require("./lib/seed-data");
const expensesNewToOld = require("./lib/expenses-new-to-old");
const monthToString = require("./lib/month");

app.set("view engine", "pug");
app.set("views", "./views");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

const prevMonthPath = (year, month) => {
  year = Number(year);
  month = Number(month);

  if (month === 1) {
    month = 12;
    year -= 1;
  } else {
    month -= 1;
  }

  return `${String(year)}/${String(month)}`;
};

const nextMonthPath = (year, month) => {
  year = Number(year);
  month = Number(month);

  if (month === 12) {
    month = 1;
    year += 1;
  } else {
    month += 1;
  }

  return `${String(year)}/${String(month)}`;
};

const isCurrentMonth = (year, month) => {
  let today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  let todayDate = new Date(currentYear, currentMonth);
  let comparedDate = new Date(year, +month - 1);

  return todayDate.getTime() === comparedDate.getTime();
};

const validDate = (year, month) => {
  let today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth();

  let thisMonth = new Date(currentYear, currentMonth);
  let comparedMonth = new Date(year, +month - 1);

  return comparedMonth.toString() !== "Invalid Date" &&
    comparedMonth.getTime() <= thisMonth.getTime();
} ;

app.get("/", (req, res) => {
  let today = new Date();
  let yearMonthPath = `${today.getFullYear()}/${Number(today.getMonth()) + 1}`;
  res.redirect(yearMonthPath);
});

app.get("/:year/:month", (req, res, next) => {
  let year = req.params.year;
  let month = req.params.month;

  if (!validDate(year, month)) next(new Error("Invalid date!"));

  let expenses = list.getExpensesByYearMonth(year, String(+month - 1));

  res.locals = { monthToString, prevMonthPath, nextMonthPath, isCurrentMonth };
  res.render("expenses", {
    expenses: expensesNewToOld(expenses),
    total: `$${expenses.reduce((acc, val) => acc + val.amount, 0).toFixed(2)}`,
    date: String(new Date().getDate()),
    month: month,
    year: year,
  });
});

app.post("/expenses", (req, res, next) => {
  // import express-validator and express-flash
  // validate inputs from form
  // add new expense to relative place
  // redirect should be to the month in which the expense was added into
  // error handling middleware implementation
});

app.use((err, req, res, _next) => {
  console.log(err);
  res.status(404).send(err.message);
});

app.listen(PORT, HOST, () => {
  console.log(`listening on port ${PORT} host ${HOST}`);
});