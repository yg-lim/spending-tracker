let sortExpenses = expenses => {
  return expenses.slice().sort((expenseA, expenseB) => {
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
};

module.exports = sortExpenses;