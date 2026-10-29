
import { useState } from "react";
import "./App.css";

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [users, setUsers] = useState(() => read("users", []));
  const [user, setUser] = useState(() => read("loggedInUser", null));
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [expenses, setExpenses] = useState(() => read("expenses", []));
  const [budget, setBudget] = useState(() => read("budget", 10000));
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newBudget, setNewBudget] = useState("10000");

  const saveUsers = (data) => {
    setUsers(data);
    localStorage.setItem("users", JSON.stringify(data));
  };

  const saveExpenses = (data) => {
    setExpenses(data);
    localStorage.setItem("expenses", JSON.stringify(data));
  };

  const month = new Date().toISOString().slice(0, 7);

  const mine = expenses.filter((e) => e.email === user?.email);
  const monthly = mine.filter((e) => e.date.startsWith(month));
  const total = monthly.reduce((sum, e) => sum + e.amount, 0);

  function authenticate(e) {
    e.preventDefault();

    if (signup) {
      if (users.some((u) => u.email === email)) {
        alert("Account already exists!");
        return;
      }

      const newUser = {
        name,
        email,
        password,
        role: email.toLowerCase().includes("admin") ? "admin" : "user",
      };

      saveUsers([...users, newUser]);
      localStorage.setItem("loggedInUser", JSON.stringify(newUser));
      setUser(newUser);
    } else {
      const found = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!found) {
        alert("Invalid login. Please check your details or sign up.");
        return;
      }

      localStorage.setItem("loggedInUser", JSON.stringify(found));
      setUser(found);
    }
  }

  function addExpense(e) {
    e.preventDefault();

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    const item = {
      id: Date.now(),
      email: user.email,
      description,
      category,
      amount: value,
      date,
    };

    saveExpenses([item, ...expenses]);
    setAmount("");
    setDescription("");
    alert("Expense added successfully!");
  }

  function deleteExpense(id) {
    if (window.confirm("Delete this expense?")) {
      saveExpenses(expenses.filter((e) => e.id !== id));
    }
  }

  function updateBudget(e) {
    e.preventDefault();
    const value = Number(newBudget);

    if (!Number.isFinite(value) || value <= 0) {
      alert("Enter a valid budget.");
      return;
    }

    setBudget(value);
    localStorage.setItem("budget", JSON.stringify(value));
    alert("Budget updated!");
  }

  function logout() {
    localStorage.removeItem("loggedInUser");
    setUser(null);
    setEmail("");
    setPassword("");
  }

  if (!user) {
    return (
      <div className="auth-page">
        <form className="auth-card" onSubmit={authenticate}>
          <h1>Expense<span>Tracker</span></h1>
          <p>Make every rupee count.</p>

          {signup && (
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onChangeCapture={() => {}}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">{signup ? "Create Account" : "Login"}</button>
          <p>
            {signup ? "Already registered?" : "New here?"}
            <button
              type="button"
              className="link-button"
              onClick={() => setSignup(!signup)}
            >
              {signup ? " Login" : " Sign Up"}
            </button>
          </p>
          <small>Demo project · Local Storage authentication</small>
        </form>
      </div>
    );
  }

  const isAdmin = user.role === "admin";
  const shownExpenses = isAdmin ? expenses : mine;
  const allTotal = expenses
    .filter((e) => e.date.startsWith(month))
    .reduce((sum, e) => sum + e.amount, 0);

  const categoryTotals = ["Food", "Travel", "Shopping", "Bills", "Other"].map(
    (c) => ({
      name: c,
      amount: monthly
        .filter((e) => e.category === c)
        .reduce((sum, e) => sum + e.amount, 0),
    })
  );

  return (
    <div className="dashboard">
      <header>
        <h2>Expense<span>Tracker</span></h2>
        <div className="header-user">
          <span>{user.name} · {user.role}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main>
        <h1>{isAdmin ? "Admin Dashboard" : `Welcome, ${user.name}!`}</h1>
        <p className="muted">
          {isAdmin
            ? "Monitor users and review recorded expenses."
            : "Track your spending and stay within your budget."}
        </p>

        {isAdmin ? (
          <>
            <div className="summary-grid">
              <Summary title="Registered Users" value={users.length} />
              <Summary title="All Transactions" value={expenses.length} />
              <Summary title="Expenses This Month" value={`₹${allTotal.toFixed(2)}`} />
            </div>

            <section className="panel">
              <h2>Registered Users</h2>
              {users.map((u) => (
                <div className="user-row" key={u.email}>
                  <span>{u.name} ({u.email})</span>
                  <strong>{u.role}</strong>
                </div>
              ))}
            </section>

            <ExpenseTable expenses={shownExpenses} onDelete={deleteExpense} />
          </>
        ) : (
          <>
            <div className="summary-grid">
              <Summary title="Monthly Expenses" value={`₹${total.toFixed(2)}`} />
              <Summary title="Monthly Budget" value={`₹${budget.toFixed(2)}`} />
              <Summary
                title="Balance Remaining"
                value={`₹${(budget - total).toFixed(2)}`}
              />
            </div>

            <div className="content-grid">
              <section className="panel">
                <h2>Add an Expense</h2>
                <form className="expense-form" onSubmit={addExpense}>
                  <label>Description</label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Lunch"
                    required
                  />

                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />

                  <label>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Shopping</option>
                    <option>Bills</option>
                    <option>Other</option>
                  </select>

                  <label>Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />

                  <button type="submit">+ Add Expense</button>
                </form>
              </section>

              <section className="panel">
                <h2>Monthly Budget</h2>
                <form className="expense-form" onSubmit={updateBudget}>
                  <label>Set budget (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    required
                  />
                  <button type="submit">Update Budget</button>
                </form>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((total / budget) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="muted">
                  {budget > 0 ? Math.round((total / budget) * 100) : 0}% of budget used
                </p>

                {total > budget && (
                  <p className="warning">Budget exceeded! Review your spending.</p>
                )}

                <h3>Spending by Category</h3>
                {categoryTotals.map((c) => (
                  <div className="category-row" key={c.name}>
                    <span>{c.name}</span>
                    <strong>₹{c.amount.toFixed(2)}</strong>
                  </div>
                ))}
              </section>
            </div>

            <ExpenseTable expenses={shownExpenses} onDelete={deleteExpense} />
          </>
        )}
      </main>
    </div>
  );
}

function Summary({ title, value }) {
  return (
    <div className="summary-card">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function ExpenseTable({ expenses, onDelete }) {
  return (
    <section className="panel">
      <h2>Transactions</h2>
      {expenses.length === 0 ? (
        <p className="muted">No expenses recorded yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Account</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>{e.description}</td>
                  <td>{e.category}</td>
                  <td>{e.date}</td>
                  <td>₹{e.amount.toFixed(2)}</td>
                  <td>{e.email}</td>
                  <td>
                    <button className="delete-button" onClick={() => onDelete(e.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default App;
