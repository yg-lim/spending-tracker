const nextId = require("./next-id");

class Expense {
  static DAYS_IN_WEEK = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  }
  
  constructor(description, amount, date) {
    this.id = nextId();
    this.description = description;
    this.amount = amount;
    this.date = date ? new Date(date) : new Date();
  }

  fullDateString() {
    return this.date.toDateString();
  }

  dayMonthYearString() {
    let fullDate = this.fullDateString().split(" ");
    return fullDate.slice(0, 3).join(" ");
  }

  yearMonthString() {
    let year = this.date.getFullYear();
    let month = String(this.date.getMonth()).padStart(2, "0");
    return `${year}${month}`;
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

  changeName(newDesc) {
    this.description = newDesc;
  }

  getAmount() {
    return `$${this.amount.toFixed(2)}`;
  }

  getDay() {
    return Expense.DAYS_IN_WEEK[`${this.date.getDay()}`];
  }

  getDate() {
    return this.date.getDate();
  }
}

module.exports = Expense;