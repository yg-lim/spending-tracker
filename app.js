const express = require("express");
const morgan = require("morgan");
const Expense = require("./lib/expense");
const ExpenseList = require("./lib/expense-list");
const { body, validationResult } = require("express-validator");
const session = require("express-session");
const flash = require("express-flash");
const store = require("connect-loki");

const app = express();
const PORT = 3000;
const HOST = "localhost";
const LokiStore = store(session);
const list = require("./lib/seed-data");
const expensesNewToOld = require("./lib/expenses-new-to-old");
const monthToString = require("./lib/month");

app.set("view engine", "pug");
app.set("views", "./views");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: "spending-tracker-session-id",
  secret: "not-very-secure",
  resave: false,
  saveUninitialized: true,
}))
app.use(flash());
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

const prevMonthPath = (year, month) => {
  year = Number(year);
  month = Number(month);

  if (month === 1) {
    month = 12;
    year -= 1;
  } else {
    month -= 1;
  }

  return `${String(year)}/${String(month).padStart(2, "0")}`;
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

  return `${String(year)}/${String(month).padStart(2, "0")}`;
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
  let yearMonthPath = `${today.getFullYear()}/${String(Number(today.getMonth()) + 1).padStart(2, "0")}`;
  res.redirect(yearMonthPath);
});

// edit individual expense page
app.get("/edit/:expenseId", (req, res, next) => {
  let expenseId = +req.params.expenseId;

  let expense = list.findExpenseById(expenseId);
  if (!expense) next(new Error("Expense not found"));

  res.render("edit", { expense });
});

app.get("/:year/:month", (req, res, next) => {
  let year = req.params.year;
  let month = req.params.month.padStart(2, "0");

  if (!validDate(year, month)) next(new Error("Invalid date!"));
  
  Object.assign(res.locals, { monthToString, prevMonthPath, nextMonthPath, isCurrentMonth });

  let expenses = list.getExpensesByYearMonth(year, String(+month - 1).padStart(2, "0"));

  res.render("expenses", {
    expenses: expensesNewToOld(expenses),
    total: `$${expenses.reduce((acc, val) => acc + val.amount, 0).toFixed(2)}`,
    date: String(new Date().getDate()),
    month: month,
    year: year,
  });
});

app.post("/expenses",
  [
    body("description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Description of expense is required.")
      .bail()
      .isLength({ max: 25 })
      .withMessage("Number of characters for description must be 25 or less."),
    body("amount")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Amount is required.")
      .bail()
      .isCurrency()
      .withMessage("Must be valid dollar amount in 00.00 format!"),
    body("date")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Date is required.")
      .bail()
      .isDate({ format: "YYYY-MM-DD", strictMode: true })
      .withMessage("Date must be in valid YYYY-MM-DD format")   
  ],
  (req, res, next) => {
    let date = req.body.date.split("-");
    let year = date[0];
    let month = date[1];

    if (!validDate(year, month)) next(new Error("Invalid date!"));

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach(error => req.flash("error", error.msg));
    } else {
      let expense = new Expense(req.body.description, Number(req.body.amount), req.body.date);
      list.addExpense(expense);
      req.flash("success", "New expense has been added!");
    }
    res.redirect(`${year}/${month}`);
  }
);

app.use((err, req, res, _next) => {
  console.log(err);
  res.status(404).send(err.message);
});

app.listen(PORT, HOST, () => {
  console.log(`listening on port ${PORT} host ${HOST}`);
});