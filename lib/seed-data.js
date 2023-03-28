const Expense = require("./expense");
const ExpenseList = require("./expense-list");

const list = new ExpenseList();

list.addExpense(new Expense("coffee", 3.00));
list.addExpense(new Expense("ham sandwich", 8.90));
list.addExpense(new Expense("ginger tea", 5.50));
list.addExpense(new Expense("strawberry lime-ade", 6.50));
list.addExpense(new Expense("groceries", 45.00, "2023-02-23"));
list.addExpense(new Expense("piano practice", 13.00, "2023-02-23"));
list.addExpense(new Expense("flight tickets", 465.00, "2023-02-23"));

module.exports = list;