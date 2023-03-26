const Expense = require("./expense");
const Account = require("./account");

const account = new Account();

account.addExpense(new Expense("coffee", 3.00));
account.addExpense(new Expense("ham sandwich", 8.90));
account.addExpense(new Expense("ginger tea", 5.50));
account.addExpense(new Expense("strawberry lime-ade", 6.50));
account.addExpense(new Expense("groceries", 45.00, "2023-02-23"));
account.addExpense(new Expense("piano practice", 13.00, "2023-02-23"));
account.addExpense(new Expense("flight tickets", 465.00, "2022-09-23"));

module.exports = account;