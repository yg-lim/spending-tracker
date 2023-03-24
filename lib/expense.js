const nextId = require("./next-id");

class Expense {
  constructor(name, amount, date) {
    this.id = nextId();
    this.name = name;
    this.amount = amount;
    this.date = date ? new Date(date) : new Date();
    this.date.setHours(0, 0, 0, 0);
  }

  fullDateString() {
    return this.date.toDateString();
  }

  dayMonthYearString() {
    let fullDate = this.fullDateString().split(" ");
    return fullDate.slice(0, 3).join(" ");
  }

  monthYearString() {
    let fullDate = this.fullDateString().split(" ");
    let month = fullDate[1];
    let year = fullDate[3];
    return `${month} ${year}`;
  }

  dateTime() {
    return this.date.getTime();
  }

  changeDate(newDate) {
    this.date = new Date(newDate);
  }

  changeAmount(newAmount) {
    this.amount = newAmount;
  }

  changeName(newName) {
    this.name = newName;
  }

  getAmount() {
    return this.amount.toFixed(2);
  }
}

module.exports = Expense;