const Expense = require("./expense");

class ExpenseList {
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

  getExpensesByYearMonth(year, month) {
    return this.getExpenses()
      .filter(expense => expense.yearMonthString() === `${year}${month}`);
  }
}

module.exports = ExpenseList;
