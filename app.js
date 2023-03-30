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

const validMonth = (year, month) => {
  let date = new Date(year, month);
  if (date.toString() === "Invalid Date") return false;

  let today = new Date();
  let todaysMonth = +today.getMonth() + 1;
  let todaysYear = +today.getFullYear();

  let comparedMonth = +date.getMonth();
  let comparedYear = +date.getFullYear();

  return (comparedMonth <= todaysMonth) && (comparedYear <= todaysYear);
} ;

const expenseValidation = [
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
    .bail()
    .custom(value => {
      let date = new Date(value);
      let today = new Date();

      return date.toString() !== "Invalid Date" && date.getTime() <= today.getTime();
    })
    .withMessage("Must enter valid date that is either from today or prior.")
];

app.get("/", (req, res) => {
  let today = new Date();
  let yearMonthPath = `${today.getFullYear()}/${String(Number(today.getMonth()) + 1).padStart(2, "0")}`;
  res.redirect(yearMonthPath);
});

// edit individual expense page
app.get("/edit/:expenseId", (req, res, next) => {
  let expenseId = +req.params.expenseId;

  let expense = list.findExpenseById(expenseId);
  if (!expense) next(new Error("Expense not found."));

  res.render("edit", { expense });
});

// submit edit to expense
app.post("/edit/:expenseId",
  expenseValidation,
  (req, res, next) => {
    let expenseId = +req.params.expenseId;
    let expense = list.findExpenseById(expenseId);

    if (!expense) next(new Error("Expense not found."));

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach(error => req.flash("error", error.msg));
      res.render("edit", { expense, flash: req.flash() });
    } else {
      let description = req.body.description;
      let amount = Number(req.body.amount);
      let date = req.body.date;

      expense.changeDesc(description);
      expense.changeAmount(amount);
      expense.changeDate(date);
      req.flash("success", "Expense details have been updated.");

      let fullDate = date.split("-");
      let year = fullDate[0];
      let month = fullDate[1];
    
      res.redirect(`/${year}/${month}`);
    }
  }
);

app.post("/delete/:expenseId", (req, res, next) => {
  let expenseId = +req.params.expenseId;
  let expense = list.findExpenseById(expenseId);

  if (!expense) {
    next(new Error("Expense not found."));
  } else {
    list.deleteExpenseAtId(expenseId);
    req.flash("success", "Expense has been deleted.");

    let date = expense.date;
    let year = date.getFullYear();
    let month = +date.getMonth() + 1;

    res.redirect(`/${year}/${String(month).padStart(2, "0")}`);
  }
});

app.get("/:year/:month", (req, res, next) => {
  let year = req.params.year;
  let month = req.params.month.padStart(2, "0");

  if (!validMonth(year, month)) next(new Error("Invalid date!"));
  else {
    Object.assign(res.locals, { monthToString, prevMonthPath, nextMonthPath, isCurrentMonth });

    let expenses = list.getExpensesByYearMonth(year, String(+month - 1).padStart(2, "0"));

    res.render("expenses", {
      expenses: expensesNewToOld(expenses),
      total: `$${expenses.reduce((acc, val) => acc + val.amount, 0).toFixed(2)}`,
      date: String(new Date().getDate()),
      month: month,
      year: year,
    });
  }
});

app.post("/expenses",
  expenseValidation,
  (req, res, next) => {
    let date = req.body.date.split("-");
    let year = date[0];
    let month = date[1];

    if (!validMonth(year, month)) next(new Error("Invalid date!"));

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