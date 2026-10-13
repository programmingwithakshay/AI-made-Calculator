
const display = document.getElementById("display");
const previous = document.getElementById("previous");
const buttons = document.querySelectorAll(".buttons button");

const historyBtn = document.getElementById("history-btn");
const historyPanel = document.getElementById("history-panel");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history");
const emptyHistory = document.getElementById("empty-history");

let firstNumber = "";
let operator = "";
let result = false;

// Load saved history
let history = [];

try {
  history = JSON.parse(
    localStorage.getItem("calculatorHistory") || "[]"
  );

  if (!Array.isArray(history)) {
    history = [];
  }
} catch {
  history = [];
}

// Show history
function showHistory() {
  historyList.innerHTML = "";

  emptyHistory.hidden = history.length > 0;

  history.forEach(function (item) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    const expression = document.createElement("span");
    const answer = document.createElement("span");

    button.type = "button";
    button.className = "history-item";

    expression.className = "history-expression";
    expression.textContent = item.expression;

    answer.className = "history-result";
    answer.textContent = "= " + item.answer;

    button.append(expression, answer);
    li.appendChild(button);
    historyList.appendChild(li);

    // Recall a previous calculation
    button.addEventListener("click", function () {
      display.value = item.answer;
      previous.textContent = item.expression + " =";

      firstNumber = "";
      operator = "";
      result = true;

      historyPanel.hidden = true;
      historyBtn.textContent = "History";
    });
  });
}

// Save completed calculations
function saveHistory(expression, answer) {
  history.unshift({
    expression: expression,
    answer: answer
  });

  history = history.slice(0, 20);

  try {
    localStorage.setItem(
      "calculatorHistory",
      JSON.stringify(history)
    );
  } catch (error) {
    console.log("Could not save history.");
  }

  showHistory();
}

// Toggle history panel
historyBtn.addEventListener("click", function () {
  historyPanel.hidden = !historyPanel.hidden;

  historyBtn.textContent = historyPanel.hidden
    ? "History"
    : "Hide";

  if (!historyPanel.hidden) {
    showHistory();
  }
});

// Clear history
clearHistoryBtn.addEventListener("click", function () {
  history = [];

  localStorage.removeItem("calculatorHistory");

  showHistory();
});

// Enter a number
function addNumber(number) {
  if (result || display.value === "Error") {
    display.value = number;
    result = false;
  } else if (display.value === "0") {
    display.value = number;
  } else if (display.value.length < 15) {
    display.value += number;
  }
}

// Perform a calculation
function calculate() {
  if (operator === "" || firstNumber === "") {
    return false;
  }

  const secondNumber = display.value;
  const a = Number(firstNumber);
  const b = Number(secondNumber);

  let answer;

  switch (operator) {
    case "+":
      answer = a + b;
      break;

    case "-":
      answer = a - b;
      break;

    case "*":
      answer = a * b;
      break;

    case "/":
      answer = b === 0 ? "Error" : a / b;
      break;
  }

  const expression =
    firstNumber + " " + operator + " " + secondNumber;

  if (!Number.isFinite(answer)) {
    display.value = "Error";
    previous.textContent = expression;

    firstNumber = "";
    operator = "";
    result = true;

    return false;
  }

  answer = Number(answer.toPrecision(12));
  display.value = String(answer);
  previous.textContent = expression + " =";

  firstNumber = "";
  operator = "";
  result = true;

  return true;
}

// Select an operator
function selectOperator(op) {
  if (display.value === "Error") return;

  // Calculate the pending operation first
  if (operator !== "" && !result) {
    const calculated = calculate();

    if (!calculated) return;
  }

  firstNumber = display.value;
  operator = op;

  previous.textContent = firstNumber + " " + op;
  display.value = "0";
  result = false;
}

// Handle button clicks
buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    const number = button.dataset.number;
    const op = button.dataset.operator;
    const action = button.dataset.action;

    // Number buttons
    if (number !== undefined) {
      addNumber(number);
      return;
    }

    // Operator buttons
    if (op !== undefined) {
      selectOperator(op);
      return;
    }

    // Other buttons
    switch (action) {
      case "clear":
        display.value = "0";
        previous.textContent = "";
        firstNumber = "";
        operator = "";
        result = false;
        break;

      case "delete":
        if (result || display.value === "Error") {
          display.value = "0";
          result = false;
        } else {
          display.value =
            display.value.slice(0, -1) || "0";
        }
        break;

      case "decimal":
        if (result || display.value === "Error") {
          display.value = "0.";
          result = false;
        } else if (!display.value.includes(".")) {
          display.value += ".";
        }
        break;

      case "sign":
        if (display.value !== "Error") {
          display.value = String(
            Number(display.value) * -1
          );
        }
        break;

      case "percent":
        if (display.value !== "Error") {
          display.value = String(
            Number(display.value) / 100
          );
        }
        break;

      case "equals":
        if (operator !== "") {
          const expression =
            firstNumber + " " + operator + " " +
            display.value;

          const success = calculate();

          // Save only the final result
          if (success) {
            saveHistory(expression, display.value);
          }
        }
        break;
    }
  });
});

// Show saved history on page load
showHistory();
