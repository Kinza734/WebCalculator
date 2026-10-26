
const display = document.getElementById("display");
const menuBtn = document.getElementById("menuBtn");
const submenu = document.getElementById("submenu");

const basicPanel = document.getElementById("basicPanel");
const unitPanel = document.getElementById("unitPanel");
const currencyPanel = document.getElementById("currencyPanel");
const scientificKeys = document.getElementById("scientificKeys");

let scientificMode = false;

// Three-dots menu open/close
menuBtn.addEventListener("click", () => {
    const isHidden = submenu.classList.toggle("hidden");
    menuBtn.setAttribute("aria-expanded", String(!isHidden));
});

// Change calculator mode
submenu.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-mode]");
    if (!button) return;

    const mode = button.dataset.mode;

    basicPanel.classList.toggle(
        "hidden", mode !== "basic" && mode !== "scientific"
    );
    unitPanel.classList.toggle("hidden", mode !== "unit");
    currencyPanel.classList.toggle("hidden", mode !== "currency");

    scientificMode = mode === "scientific";
    scientificKeys.classList.toggle("hidden", !scientificMode);

    submenu.classList.add("hidden");
    menuBtn.setAttribute("aria-expanded", "false");
});

// Close menu if user clicks outside it
document.addEventListener("click", (event) => {
    if (!event.target.closest(".menu-container")) {
        submenu.classList.add("hidden");
        menuBtn.setAttribute("aria-expanded", "false");
    }
});

// Basic calculator buttons
document.querySelector(".keys").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;
    const message = document.getElementById("calcMessage");

    message.textContent = "";

    if (action === "clear") {
        display.value = "0";
        return;
    }

    if (action === "delete") {
        display.value = display.value.slice(0, -1) || "0";
        return;
    }

    if (action === "calculate") {
        calculate();
        return;
    }

    if (value !== undefined) {
        if (display.value === "0" && /[0-9.]/.test(value)) {
            display.value = value;
        } else {
            display.value += value;
        }
    }
});

// Evaluate only calculator characters, not arbitrary JavaScript
function calculate() {
    const expression = display.value;

    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
        document.getElementById("calcMessage").textContent =
            "Invalid expression.";
        return;
    }

    try {
        const result = Function('"use strict"; return (' + expression + ')')();

        if (typeof result !== "number" || !Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        display.value = String(Number(result.toPrecision(12)));
    } catch {
        document.getElementById("calcMessage").textContent =
            "Invalid calculation. Please check your expression.";
    }
}

// Scientific calculator buttons
scientificKeys.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const action = button.dataset.action;
    const number = Number(display.value);
    let result;

    if (action === "pi") {
        display.value = display.value === "0"
            ? String(Math.PI)
            : display.value + String(Math.PI);
        return;
    }

    if (action === "exp") {
        display.value += "**";
        return;
    }

    if (!Number.isFinite(number)) {
        document.getElementById("calcMessage").textContent =
            "Enter a valid number first.";
        return;
    }

    switch (action) {
        case "sqrt":
            result = Math.sqrt(number);
            break;
        case "square":
            result = number ** 2;
            break;
        case "sin":
            result = Math.sin(number * Math.PI / 180);
            break;
        case "cos":
            result = Math.cos(number * Math.PI / 180);
            break;
        case "tan":
            result = Math.tan(number * Math.PI / 180);
            break;
        case "log":
            result = Math.log10(number);
            break;
        default:
            return;
    }

    if (!Number.isFinite(result)) {
        document.getElementById("calcMessage").textContent =
            "This operation is not defined for this input.";
        return;
    }

    document.getElementById("calcMessage").textContent = "";
    display.value = String(Number(result.toPrecision(12)));
});

// Unit conversion options
const unitOptions = {
    length: {
        Meter: 1,
        Kilometer: 1000,
        Centimeter: 0.01,
        Mile: 1609.344,
        Foot: 0.3048
    },
    weight: {
        Kilogram: 1,
        Gram: 0.001,
        Pound: 0.45359237
    },
    temperature: {
        Celsius: "C",
        Fahrenheit: "F",
        Kelvin: "K"
    }
};

const unitType = document.getElementById("unitType");
const unitFrom = document.getElementById("unitFrom");
const unitTo = document.getElementById("unitTo");

function populateUnits() {
    const type = unitType.value;
    const units = Object.keys(unitOptions[type]);

    unitFrom.innerHTML = "";
    unitTo.innerHTML = "";

    units.forEach((unit) => {
        unitFrom.add(new Option(unit, unit));
        unitTo.add(new Option(unit, unit));
    });

    if (type === "length") unitTo.value = "Kilometer";
    if (type === "weight") unitTo.value = "Gram";
    if (type === "temperature") unitTo.value = "Fahrenheit";

    document.getElementById("unitResult").textContent =
        "Choose units and enter a value.";
}

unitType.addEventListener("change", populateUnits);

function convertTemperature(value, from, to) {
    let celsius;

    if (from === "C") celsius = value;
    if (from === "F") celsius = (value - 32) * 5 / 9;
    if (from === "K") celsius = value - 273.15;

    if (to === "C") return celsius;
    if (to === "F") return celsius * 9 / 5 + 32;
    if (to === "K") return celsius + 273.15;
}

document.getElementById("convertUnit").addEventListener("click", () => {
    const value = Number(document.getElementById("unitValue").value);
    const from = unitFrom.value;
    const to = unitTo.value;
    let result;

    if (!Number.isFinite(value)) {
        document.getElementById("unitResult").textContent =
            "Please enter a valid number.";
        return;
    }

    if (unitType.value === "temperature") {
        if (unitFrom.value === "K" && value < 0) {
            document.getElementById("unitResult").textContent =
                "Kelvin cannot be below zero.";
            return;
        }

        result = convertTemperature(
            value,
            unitOptions.temperature[from],
            unitOptions.temperature[to]
        );
    } else {
        const units = unitOptions[unitType.value];
        result = value * units[from] / units[to];
    }

    if (!Number.isFinite(result)) {
        document.getElementById("unitResult").textContent =
            "Unable to convert this value.";
        return;
    }

    document.getElementById("unitResult").textContent =
        `${value} ${from} = ${Number(result.toPrecision(10))} ${to}`;
});

// Currency conversion
// Illustrative sample rates: amount of currency per 1 USD.
// Replace with verified current rates before using for real transactions.
const currencyRates = {
    USD: 1,
    PKR: 280,
    EUR: 0.92,
    GBP: 0.79,
    SAR: 3.75
};

document.getElementById("convertCurrency").addEventListener("click", () => {
    const amount = Number(
        document.getElementById("currencyAmount").value
    );
    const from = document.getElementById("currencyFrom").value;
    const to = document.getElementById("currencyTo").value;
    const output = document.getElementById("currencyResult");

    if (!Number.isFinite(amount) || amount < 0) {
        output.textContent = "Please enter a valid non-negative amount.";
        return;
    }

    // Convert the amount to USD, then to the target currency.
    const usdAmount = amount / currencyRates[from];
    const result = usdAmount * currencyRates[to];

    output.textContent =
        `${amount.toLocaleString()} ${from} = ` +
        `${result.toLocaleString(undefined, {
            maximumFractionDigits: 2
        })} ${to}`;
});

// Populate the default unit lists on page load
populateUnits();
