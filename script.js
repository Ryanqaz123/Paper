let data;
let expendatureChart;
let expenseChart;
let goalChart;

let nonrecurringName;
let nonrecurringValue;
let goalName;
let goalValue;
let goalSavings;
let goalAllocation;

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

$(document).ready(() => {
  const cache = localStorage['paper-finance'];
  if (cache) {
    data = JSON.parse(cache);
    setElementValues();

    data.expenses.forEach(x => createExpenseItem(x.name, x.value));
    data.goals.forEach(x => createGoalItem(x.name, x.value, x.savings, x.allocation));
  } else
    resetData(false);

  nonrecurringName = document.getElementById('nonrecurringName');
  nonrecurringValue = document.getElementById('nonrecurringValue');
  goalName = document.getElementById('goalName');
  goalValue = document.getElementById('goalValue');
  goalSavings = document.getElementById('goalSavings');
  goalAllocation = document.getElementById('goalAllocation');

  const textColor = '#d3d3d3';
  expendatureChart = new Chart(document.getElementById('expendatureChart').getContext('2d'), {
    type: 'pie',
    options: {
      title: {
        text: 'Expendature',
        fontColor: textColor,
        display: true,
      },
      scaleFontColor: textColor,
      responsive: false,
    },
  });

  expenseChart = new Chart(document.getElementById('expenseChart').getContext('2d'), {
    type: 'pie',
    options: {
      title: {
        text: 'Non-recurring Expenses',
        fontColor: textColor,
        display: true,
      },
      responsive: false,
    },
  });

  goalChart = new Chart(document.getElementById('goalChart').getContext('2d'), {
    type: 'pie',
    options: {
      title: {
        text: 'Goals',
        fontColor: textColor,
        display: true,
      },
      scaleFontColor: textColor,
      responsive: false,
    },
  });

  Chart.defaults.fontFamily = '\'Montserrat\', Arial, Helvetica, sans-serif';
  Chart.defaults.fontColor = textColor;

  updateExpendaturePieChart();
  updateExpensePieChart();
  updateGoalChart();
});

function resetData(updateCharts) {
  const expensesButtons = document.body.getElementsByTagName('button');
  for (let i = 0; i < expensesButtons.length; i++) {
    const button = expensesButtons[i];
    if (button.hasAttribute('expense')) {
      button.parentElement.remove();
      i--;
    }
  }

  data = {
    'annualIncome': 0,
    'housing': 0,
    'education': 0,
    'transportation': 0,
    'food': 0,
    'expenses': [],
    'goals': [],
    'netWorth': 0,
  };
  setElementValues();

  if (updateCharts) {
    updateExpendaturePieChart();
    updateExpensePieChart();
    updateGoalChart();
  }
}

function setElementValues() {
  document.getElementById('income').value = data.annualIncome;
  document.getElementById('housing').value = data.housing;
  document.getElementById('education').value = data.education;
  document.getElementById('transportation').value = data.transportation;
  document.getElementById('food').value = data.food;
}

function cacheData() {
  localStorage['paper-finance'] = JSON.stringify(data);
}

function addExpense() {
  const name = nonrecurringName.value;
  const value = nonrecurringValue.value;

  const lowerCaseName = name.toLowerCase();
  if (name.length >= 1 && lowerCaseName !== 'savings' && !data.expenses.map(x => x.name.toLowerCase()).includes(lowerCaseName)
    && value >= 0.01) {
    createExpenseItem(name, value);

    data.expenses.push({
      'name': name,
      'value': Math.floor(Number(value) * 100) / 100,
    });
  }

  nonrecurringName.value = '';
  nonrecurringValue.value = '';
  updateExpendaturePieChart();
  updateExpensePieChart();
}

function addGoal() {
  const name = goalName.value;
  const value = goalValue.value;
  const savings = goalSavings.value;
  const allocation = goalAllocation.value;

  if (name.length >= 1 && value >= 0.01 && savings >= 0 && allocation >= 0.01) {
    createGoalItem(name, value, savings, allocation);

    data.goals.push({
      'name': name,
      'value': Math.floor(Number(value) * 100) / 100,
      'savings': Math.floor(Number(savings) * 100) / 100,
      'allocation': Math.floor(Number(allocation) * 100) / 100,
    });
  }

  goalName.value = '';
  goalValue.value = '';
  goalSavings.value = '';
  goalAllocation.value = '';
  updateExpendaturePieChart();
  updateGoalChart();
}

function createExpenseItem(name, value) {
  const div = document.createElement('div');
  const p = document.createElement('p');
  const button = document.createElement('button');

  p.innerHTML = 'EXPENSE<br>' + name + '<br>' + formatter.format(value);
  button.innerHTML = 'DELETE';
  button.setAttribute('expense', name);
  button.onclick = () => deleteExpense(button);
  button.className = 'delButton';
  div.className = 'item';

  div.appendChild(p);
  div.appendChild(button);

  document.body.append(div);
}

function createGoalItem(name, value, savings, allocation) {
  const div = document.createElement('div');
  const p = document.createElement('p');
  const button = document.createElement('button');

  p.innerHTML = 'GOAL<br>' + name + '<br>' + formatter.format(value) + ' goal<br>' + formatter.format(savings) + ' saved<br>' +
    formatter.format(allocation) + '/month<br>' + Math.ceil((value - savings) / allocation) + ' months remaining';
  button.innerHTML = 'DELETE';
  button.setAttribute('goal', name);
  button.onclick = () => deleteGoal(button);
  div.className = 'item';

  div.appendChild(p);
  div.appendChild(button);

  document.body.append(div);
}

function deleteExpense(button) {
  data.expenses = data.expenses.filter(x => x.name !== button.getAttribute('expense'));
  button.parentElement.remove();
  updateExpensePieChart();
}

function deleteGoal(button) {
  data.goals = data.goals.filter(x => x.name !== button.getAttribute('goal'));
  button.parentElement.remove();
  updateExpendaturePieChart();
}

function updateExpendaturePieChart() {
  let values = [];
  let names = [];

  if (data.housing > 0) {
    values.push(data.housing);
    names.push('Housing');
  }

  if (data.education > 0) {
    values.push(data.education);
    names.push('Education');
  }

  if (data.transportation > 0) {
    values.push(data.transportation);
    names.push('Transportation');
  }

  if (data.food > 0) {
    values.push(data.food);
    names.push('Food');
  }

  const savings = data.goals.map(x => x.allocation).reduce((a, b) => a + b, 0);
  if (savings > 0) {
    values.push(savings);
    names.push('Goals');
  }

  const expenses = data.expenses.map(x => x.value).reduce((a, b) => a + b, 0);
  if (expenses > 0) {
    values.push(expenses);
    names.push('Non-recurring Expenses');
  }

  const monthlyIncome = data.annualIncome / 12;
  const unallocatedSavings = monthlyIncome - expenses - savings - data.housing - data.education - data.transportation - data.food;
  if (unallocatedSavings > 0) {
    values.push(Math.floor(unallocatedSavings));
    names.push('Unallocated Savings');
  }

  expenseChart.data = {
    datasets: [{
      data: values,
      backgroundColor: getChartColors(values.length),
    }],

    labels: names,
  };
  expenseChart.update();
}

function updateExpensePieChart() {
  expendatureChart.data = {
    datasets: [{
      data: data.expenses.map(x => x.value),
      backgroundColor: getChartColors(data.expenses.length),
    }],

    labels: data.expenses.map(x => x.name),
  };
  expendatureChart.update();
}

function updateGoalChart() {
  goalChart.data = {
    datasets: [{
      data: data.goals.map(x => x.allocation),
      backgroundColor: getChartColors(data.goals.length),
    }],

    labels: data.goals.map(x => x.name),
  };
  goalChart.update();
}

function getChartColors(number) {
  let colors = [];
  const increment = 1 / 12;
  let loops = 0;
  let hue = 0;
  for (let i = 0; i < number; i++) {
    colors.push(hslToHex(hue, 0.6, 0.6));
    if (hue >= 1) {
      hue = increment / (2 + loops);
      loops++;
    } else
      hue += increment;
  }

  return colors;
}

function hslToHex(h, s, l) {
  let r, g, b;
  if (s === 0)
    r = g = b = l;
  else {
    const hueToRgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}