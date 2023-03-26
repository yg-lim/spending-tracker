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

  expensesByYearMonth(yearMonth) {
    return this.getExpenses()
      .filter(expense => expense.yearMonthString() === yearMonth);
  }

  totalByMonth(expenses) {
    let total = expenses.reduce((acc, val) => acc + val.amount, 0);

    return `$${total.toFixed(2)}`;
  }
}

module.exports = Account;