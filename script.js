// ========================================
// EXPENSE TRACKER
// ========================================


// ========================================
// GET HTML ELEMENTS
// ========================================

const openExpenseBtn = document.getElementById("openExpenseBtn");

const closeExpenseBtn = document.getElementById("closeExpenseBtn");

const cancelExpenseBtn = document.getElementById("cancelExpenseBtn");

const expenseModal = document.getElementById("expenseModal");

const expenseForm = document.getElementById("expenseForm");

const totalExpensesElement =
    document.getElementById("totalExpenses");

const budgetRemainingElement =
    document.getElementById("budgetRemaining");


// ========================================
// INITIAL VALUES
// ========================================

let totalExpenses = 28500;

const totalBudget = 40000;

let budgetRemaining = totalBudget - totalExpenses;


// ========================================
// OPEN EXPENSE FORM
// ========================================

openExpenseBtn.addEventListener("click", function () {

    expenseModal.style.display = "flex";

});


// ========================================
// CLOSE EXPENSE FORM
// ========================================

closeExpenseBtn.addEventListener("click", function () {

    expenseModal.style.display = "none";

});


// ========================================
// CANCEL EXPENSE
// ========================================

cancelExpenseBtn.addEventListener("click", function () {

    expenseModal.style.display = "none";

});


// ========================================
// ADD EXPENSE
// ========================================

expenseForm.addEventListener("submit", function (event) {

    event.preventDefault();


    // Get values from form

    const category =
        document.getElementById("category").value;

    const description =
        document.getElementById("description").value;

    const amount =
        Number(document.getElementById("amount").value);

    const date =
        document.getElementById("date").value;


    // Check amount

    if (amount <= 0) {

        alert("Please enter a valid amount.");

        return;

    }


    // ========================================
    // CATEGORY EMOJIS
    // ========================================

    const categoryIcons = {

        Food: "🍔",

        Travel: "🚌",

        Shopping: "🛍",

        Bills: "💡",

        Entertainment: "🎬",

        Other: "📌"

    };


    const icon = categoryIcons[category] || "📌";


    // ========================================
    // FORMAT DATE
    // ========================================

    const dateObject = new Date(date);

    const formattedDate =
        dateObject.toLocaleDateString("en-IN", {

            day: "2-digit",

            month: "short",

            year: "numeric"

        });


    // ========================================
    // CREATE TRANSACTION
    // ========================================

    const transactionHTML = `

        <div class="transaction-row">

            <span>${icon} ${category}</span>

            <span>${description}</span>

            <span>${formattedDate}</span>

            <strong>- ₹${amount.toLocaleString("en-IN")}</strong>

        </div>

    `;


    // ========================================
    // ADD TRANSACTION TO PAGE
    // ========================================

    const transactionHeader =
        document.querySelector(".transaction-header");


    transactionHeader.insertAdjacentHTML(
        "afterend",
        transactionHTML
    );


    // ========================================
    // UPDATE TOTAL EXPENSES
    // ========================================

    totalExpenses += amount;

    budgetRemaining = totalBudget - totalExpenses;


    totalExpensesElement.textContent =
        "₹" + totalExpenses.toLocaleString("en-IN");


    // ========================================
    // UPDATE BUDGET REMAINING
    // ========================================

    budgetRemainingElement.textContent =
        "₹" + budgetRemaining.toLocaleString("en-IN");


    // ========================================
    // RESET FORM
    // ========================================

    expenseForm.reset();


    // ========================================
    // CLOSE MODAL
    // ========================================

    expenseModal.style.display = "none";


    // ========================================
    // SUCCESS MESSAGE
    // ========================================

    alert("Expense added successfully!");

});