
import { useState } from "react";
import "./App.css";

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const categories = ["Food", "Travel", "Shopping", "Bills", "Other"];
const colors = ["#8b7cf6", "#ef86b5", "#f5b75e", "#58b8a7", "#a5a0b4"];

const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

function App() {
  const [users, setUsers] = useState(() => read("users", []));
  const [user, setUser] = useState(() => read("loggedInUser", null));
  const [expenses, setExpenses] = useState(() => read("expenses", []));
  const [budget, setBudget] = useState(() => read("budget", 10000));

  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newBudget, setNewBudget] = useState(
    String(read("budget", 10000))
  );
  const [activeNav, setActiveNav] = useState("Dashboard");

  const month = new Date().toISOString().slice(0, 7);
  const isAdmin = user?.role === "admin";

  const mine = expenses.filter((e) => e.email === user?.email);
  const monthly = mine.filter((e) => e.date.startsWith(month));
  const total = monthly.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = budget - total;

  const allMonthly = expenses.filter((e) => e.date.startsWith(month));
  const shownExpenses = isAdmin ? expenses : mine;
  const currentExpenses = isAdmin ? allMonthly : monthly;
  const currentTotal = currentExpenses.reduce(
    (s, e) => s + Number(e.amount), 0
  );

  const categoryTotals = categories.map((c) => ({
    name: c,
    amount: currentExpenses
      .filter((e) => e.category === c)
      .reduce((s, e) => s + Number(e.amount), 0),
  }));

  let progress = 0;
  const donut = categoryTotals
    .filter((c) => c.amount > 0)
    .map((c) => {
      const start = progress;
      progress += (c.amount / (currentTotal || 1)) * 100;
      return `${colors[categories.indexOf(c.name)]} ${start}% ${progress}%`;
    });

  const donutStyle = donut.length
    ? `conic-gradient(${donut.join(", ")})`
    : "#f1eaf1";

  const weekly = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    const key = d.toISOString().slice(0, 10);
    return {
      key,
      label: d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      value: currentExpenses
        .filter((e) => e.date === key)
        .reduce((s, e) => s + Number(e.amount), 0),
    };
  });

  const maxBar = Math.max(...weekly.map((b) => b.value), 1);

  function saveUsers(data) {
    setUsers(data);
    localStorage.setItem("users", JSON.stringify(data));
  }

  function saveExpenses(data) {
    setExpenses(data);
    localStorage.setItem("expenses", JSON.stringify(data));
  }

  function authenticate(e) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (signup) {
      if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        alert("Account already exists!");
        return;
      }

      const newUser = {
        name: name.trim(),
        email: cleanEmail,
        password,
        role: cleanEmail.includes("admin") ? "admin" : "user",
      };

      saveUsers([...users, newUser]);
      localStorage.setItem("loggedInUser", JSON.stringify(newUser));
      setUser(newUser);
    } else {
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === cleanEmail &&
          u.password === password
      );

      if (!found) {
        alert("Invalid login. Please sign up or check your details.");
        return;
      }

      localStorage.setItem("loggedInUser", JSON.stringify(found));
      setUser(found);
    }
  }

  function addExpense(e) {
    e.preventDefault();

    if (Number(amount) <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    const item = {
      id: Date.now(),
      email: user.email,
      description: description.trim(),
      category,
      amount: Number(amount),
      date,
    };

    saveExpenses([item, ...expenses]);
    setAmount("");
    setDescription("");
  }

  function deleteExpense(id) {
    if (window.confirm("Delete this expense?")) {
      saveExpenses(expenses.filter((e) => e.id !== id));
    }
  }

  function updateBudget(e) {
    e.preventDefault();
    if (Number(newBudget) <= 0) {
      alert("Enter a valid budget.");
      return;
    }

    setBudget(Number(newBudget));
    localStorage.setItem("budget", JSON.stringify(Number(newBudget)));
  }

  function logout() {
    localStorage.removeItem("loggedInUser");
    setUser(null);
    setEmail("");
    setPassword("");
  }

  function goTo(label, id) {
    setActiveNav(label);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  if (!user) {
    return (
      <div className="auth-page">
        <form className="auth-card" onSubmit={authenticate}>
          <div className="brand-mark">₹</div>
          <p className="eyebrow">YOUR MONEY, IN FOCUS</p>
          <h1>Fin<span>arium</span></h1>
          <p className="auth-copy">
            A calmer way to track your spending and plan your month.
          </p>

          {signup && (
            <label className="auth-label">
              Full name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </label>
          )}

          <label className="auth-label">
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="auth-label">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </label>

          <button className="primary-button auth-submit">
            {signup ? "Create account →" : "Login to dashboard →"}
          </button>

          <p className="auth-switch">
            {signup ? "Already registered?" : "New to Finarium?"}
            <button
              type="button"
              className="text-button"
              onClick={() => setSignup(!signup)}
            >
              {signup ? "Log in" : "Create an account"}
            </button>
          </p>
          <p className="auth-footnote">
            Personal finance made clearer.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-mark">₹</span>
          <span>Finarium<small>PERSONAL FINANCE</small></span>
        </a>

        <p className="nav-caption">WORKSPACE</p>

        <nav className="side-nav">
          {[
            ["Dashboard", "dashboard", "⌂"],
            ["Transactions", "transactions", "↔"],
            ["Reports", "reports", "▥"],
            ["Settings", "settings", "⚙"],
          ].map(([label, id, icon]) => (
            <button
              key={label}
              className={`nav-item ${activeNav === label ? "active" : ""}`}
              onClick={() => goTo(label, id)}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-tip">
          <div className="tip-spark">✦</div>
          <h3>Small steps, big goals.</h3>
          <p>Keep an eye on your budget and plan your spending.</p>
          <button onClick={() => goTo("Settings", "settings")}>
            Review budget ↗
          </button>
        </div>

        <div className="sidebar-profile">
          <div className="avatar">
            {(user.name || user.email)[0].toUpperCase()}
          </div>
          <div className="profile-copy">
            <strong>{user.name || "User"}</strong>
            <span>{isAdmin ? "Administrator" : "Personal account"}</span>
          </div>
          <button className="logout-mini" onClick={logout} title="Log out">
            ↗
          </button>
        </div>
      </aside>

      <main className="main-area" id="dashboard">
        <div className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">₹</span> Finarium
          </div>
          <div className="breadcrumb">
            Workspace / <strong>{activeNav}</strong>
          </div>
          <div className="topbar-actions">
            <span className="date-pill">
              ◷ {new Date().toLocaleDateString("en-IN")}
            </span>
            <div className="avatar top-avatar">
              {(user.name || user.email)[0].toUpperCase()}
            </div>
          </div>
        </div>

        <section className="page-heading">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>
              {isAdmin
                ? "Admin dashboard"
                : `Welcome back, ${user.name?.split(" ")[0] || "there"}`}
              <span className="wave"> ✦</span>
            </h1>
            <p className="subheading">
              Here’s what’s happening with your money this month.
            </p>
          </div>
          {!isAdmin && (
            <button
              className="primary-button"
              onClick={() => goTo("Transactions", "add-expense")}
            >
              ＋ Add expense
            </button>
          )}
        </section>

        <section className="metric-grid">
          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-icon purple">↗</span>
              <span className="metric-label">
                {isAdmin ? "Total users" : "Monthly spending"}
              </span>
            </div>
            <h2>{isAdmin ? users.length : money(total)}</h2>
            <div className="metric-foot">
              {isAdmin ? "Registered accounts" : "Expenses this month"}
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-icon pink">▤</span>
              <span className="metric-label">
                {isAdmin ? "Transactions" : "Monthly budget"}
              </span>
            </div>
            <h2>{isAdmin ? expenses.length : money(budget)}</h2>
            <div className="metric-foot">
              {isAdmin ? "Recorded expenses" : "Your spending limit"}
            </div>
          </article>

          <article className="metric-card">
            <div className="metric-top">
              <span className="metric-icon mint">⌁</span>
              <span className="metric-label">
                {isAdmin ? "Monthly expenses" : "Budget remaining"}
              </span>
            </div>
            <h2>{isAdmin ? money(currentTotal) : money(remaining)}</h2>
            <div className="metric-foot">
              {isAdmin ? "All users this month" : "Available to spend"}
            </div>
          </article>
        </section>

        {isAdmin ? (
          <section className="panel section-panel" id="transactions">
            <div className="section-title">
              <div>
                <p className="eyebrow">ADMINISTRATION</p>
                <h2>Registered users</h2>
              </div>
              <span className="count-pill">{users.length} accounts</span>
            </div>

            {users.map((u) => (
              <div className="user-row" key={u.email}>
                <div className="avatar">{(u.name || u.email)[0]}</div>
                <div className="user-detail">
                  <strong>{u.name}</strong>
                  <span>{u.email}</span>
                </div>
                <span className="role-pill">{u.role}</span>
              </div>
            ))}
            <ExpenseTable expenses={shownExpenses} onDelete={deleteExpense} />
          </section>
        ) : (
          <>
            <div className="dashboard-grid">
              <section className="panel spending-panel" id="reports">
                <div className="section-title">
                  <div>
                    <p className="eyebrow">YOUR FINANCES</p>
                    <h2>Spending breakdown</h2>
                  </div>
                  <span className="period-pill">This month</span>
                </div>

                <div className="donut-layout">
                  <div
                    className="donut-chart"
                    style={{ background: donutStyle }}
                  >
                    <div className="donut-hole">
                      <span>Total spent</span>
                      <strong>{money(total)}</strong>
                    </div>
                  </div>

                  <div className="legend-list">
                    {categoryTotals.map((c, i) => (
                      <div className="legend-item" key={c.name}>
                        <span className="legend-label">
                          <i style={{ background: colors[i] }} />
                          {c.name}
                        </span>
                        <strong>{money(c.amount)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel-divider" />
                <div className="budget-inline">
                  <div>
                    <span>Monthly budget used</span>
                    <strong>
                      {Math.round((total / Math.max(budget, 1)) * 100)}%
                    </strong>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${total > budget ? "over-budget" : ""}`}
                      style={{
                        width: `${Math.min((total / Math.max(budget, 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p>{money(Math.max(remaining, 0))} remaining</p>
                  {remaining < 0 && (
                    <p className="warning">You have exceeded your budget.</p>
                  )}
                </div>
              </section>

              <section className="panel chart-panel">
                <div className="section-title">
                  <div>
                    <p className="eyebrow">DAILY ACTIVITY</p>
                    <h2>Recent spending</h2>
                  </div>
                  <span className="chart-key"><i /> Expenses</span>
                </div>

                <div className="bar-chart">
                  <div className="chart-y-labels">
                    <span>{money(maxBar)}</span>
                    <span>{money(maxBar / 2)}</span>
                    <span>₹0</span>
                  </div>
                  <div className="bar-chart-body">
                    <div className="chart-grid-lines">
                      <i /><i /><i />
                    </div>
                    {weekly.map((b) => (
                      <div className="bar-column" key={b.key} title={`${b.label}: ${money(b.value)}`}>
                        <div className="bar-space">
                          <div
                            className={`bar ${b.key === new Date().toISOString().slice(0, 10) ? "today-bar" : ""}`}
                            style={{
                              height: `${b.value ? Math.max((b.value / maxBar) * 100, 5) : 2}%`,
                            }}
                          />
                        </div>
                        <span>{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="chart-footer">
                  <span>Spending over the last 7 days</span>
                  <strong>{money(weekly.reduce((s, b) => s + b.value, 0))}</strong>
                </div>
              </section>
            </div>

            <div className="lower-grid">
              <section className="panel add-panel" id="add-expense">
                <div className="section-title">
                  <div>
                    <p className="eyebrow">QUICK ENTRY</p>
                    <h2>Add an expense</h2>
                  </div>
                  <span className="round-plus">＋</span>
                </div>

                <form className="expense-form" onSubmit={addExpense}>
                  <label>
                    Description
                    <input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Lunch with friends"
                      required
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      Amount (₹)
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </label>
                    <label>
                      Category
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {categories.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </label>
                  </div>
                  <label>
                    Date
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </label>
                  <button className="primary-button full-button">
                    Save expense →
                  </button>
                </form>
              </section>

              <section className="panel budget-panel" id="settings">
                <div className="section-title">
                  <div>
                    <p className="eyebrow">PLAN AHEAD</p>
                    <h2>Budget settings</h2>
                  </div>
                  <span className="metric-icon mint">◎</span>
                </div>
                <p className="panel-description">
                  Set a monthly spending limit that works for you.
                </p>
                <form className="budget-form" onSubmit={updateBudget}>
                  <label>
                    Monthly budget (₹)
                    <input
                      type="number"
                      min="1"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      required
                    />
                  </label>
                  <button className="secondary-button">Update budget</button>
                </form>
                <div className="budget-summary">
                  <span>Current budget</span><strong>{money(budget)}</strong>
                </div>
                <div className="budget-summary">
                  <span>Spent so far</span><strong>{money(total)}</strong>
                </div>
                <div className="budget-summary">
                  <span>Remaining</span>
                  <strong className={remaining < 0 ? "negative" : "positive"}>
                    {money(remaining)}
                  </strong>
                </div>
              </section>
            </div>

            <section className="panel transactions-panel" id="transactions">
              <div className="section-title">
                <div>
                  <p className="eyebrow">YOUR ACTIVITY</p>
                  <h2>Recent transactions</h2>
                </div>
                <span className="count-pill">{shownExpenses.length} records</span>
              </div>
              <ExpenseTable expenses={shownExpenses} onDelete={deleteExpense} />
            </section>
          </>
        )}

        <footer className="app-footer">
          <span>Finarium · Personal finance, made clearer.</span>
          <span>Built for your financial goals ♡</span>
        </footer>
      </main>
    </div>
  );
}

function ExpenseTable({ expenses, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <strong>No transactions yet</strong>
        <p>Add your first expense to see it here.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Transaction</th>
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
              <td><strong>{e.description}</strong></td>
              <td><span className="category-pill">{e.category}</span></td>
              <td>{e.date}</td>
              <td className="amount-cell">−{money(e.amount)}</td>
              <td>{e.email}</td>
              <td>
                <button
                  className="delete-button"
                  onClick={() => onDelete(e.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
