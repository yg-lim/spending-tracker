const Expense = require("./expense");

class Account {
  constructor() {
    this.expenses = [];
  }

  findExpenseById(id) {
    return this.expenses.find(expense => expense.id === id);
  }

  addExpense(expense) {
    if (!(expense instanceof Expense)) throw new Error("Can only add Expense objects.")
    this.expenses.push(expense);
  }

  deleteExpenseAtId(id) {
    let expenseIdx = this.expenses.findIndex(expense => expense.id === id);
    if (expenseIdx !== -1) this.expenses.splice(expenseIdx, 1);
  }

  getExpenses() {
    return this.expenses.slice();
  }

  expensesNewToOld() {
    let expenses = this.getExpenses();
    
    return expenses.sort((expenseA, expenseB) => {
      let dateA = expenseA.dateTime();
      let dateB = expenseB.dateTime();

      if (dateA > dateB) {
        return -1;
      } else if (dateA < dateB) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  allExpensesByMonthYear() {
    let expensesNewToOld = this.expensesNewToOld();
    let expenses = {};

    expensesNewToOld.forEach(expense => {
      let monthYear = expense.monthYearString();
      if (!(monthYear in expenses)) expenses[monthYear] = [];

      expenses[monthYear].push(expense);
    });

    return expenses;
  }

  expensesByMonthYear(monthYear) {
    return this.expensesNewToOld()
      .filter(expense => expense.monthYearString() === monthYear);
  }
}

module.exports = Account;