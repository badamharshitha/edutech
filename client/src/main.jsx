import React, { createContext, useContext, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import axios from "axios";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./styles.css";

const forwardedApiUrl = window.location.hostname.match(
  /-(5173|5174)\.app\.github\.dev$/,
)
  ? `${window.location.protocol}//${window.location.hostname.replace(/-(5173|5174)\.app\.github\.dev$/, "-5000.app.github.dev")}/api`
  : "http://localhost:5000/api";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || forwardedApiUrl,
  withCredentials: true,
});
const AuthContext = createContext(null);
function useAuth() {
  return useContext(AuthContext);
}
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("/auth/me")
      .then((response) => setUser(response.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.data.user);
    return data.data.user;
  };
  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    setUser(null);
  };
  if (loading)
    return <div className="loading-screen">Loading EduBridge...</div>;
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
function Shell({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav =
    user?.role === "ADMIN"
      ? [
          ["/admin/dashboard", "Dashboard", LayoutDashboard],
          ["/admin/volunteers", "Volunteers", Users],
          ["/admin/students", "Students", GraduationCap],
          ["/admin/support", "Support", HeartHandshake],
        ]
      : user?.role === "VOLUNTEER"
        ? [
            ["/volunteer/dashboard", "Dashboard", LayoutDashboard],
            ["/volunteer/students", "My students", GraduationCap],
            ["/volunteer/students/new", "Add student", ClipboardList],
            ["/volunteer/verification", "Verification", ShieldCheck],
          ]
        : [
            ["/sponsor/dashboard", "Dashboard", LayoutDashboard],
            ["/sponsor/recommendations", "Recommendations", Sparkles],
            ["/sponsor/students", "All students", GraduationCap],
            ["/sponsor/sponsorships", "My sponsorships", HeartHandshake],
          ];
  return (
    <div className="app-shell">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <span className="brand-mark">
            <GraduationCap size={20} />
          </span>{" "}
          EduBridge
        </div>
        <nav>
          {nav.map(([to, label, Icon]) => (
            <Link
              onClick={() => setOpen(false)}
              className="nav-link"
              to={to}
              key={to}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <button className="logout" onClick={logout}>
          <LogOut size={17} /> Sign out
        </button>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="icon-button menu" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
          <div className="crumb">
            Workspace <ChevronRight size={15} />{" "}
            <strong>{user?.role?.toLowerCase()}</strong>
          </div>
          <div className="avatar">{user?.name?.[0]}</div>
        </header>
        {children}
      </main>
    </div>
  );
}
function Protected({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return <Shell>{children}</Shell>;
}
function Landing() {
  const [stats, setStats] = useState({});
  useEffect(() => {
    api
      .get("/stats")
      .then((r) => setStats(r.data.data))
      .catch(() => {});
  }, []);
  return (
    <>
      <header className="public-nav">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <GraduationCap size={20} />
          </span>{" "}
          EduBridge
        </Link>
        <nav>
          <a href="#how">How it works</a>
          <a href="#why">Why EduBridge</a>
        </nav>
        <div className="nav-actions">
          <Link className="text-link" to="/login">
            Log in
          </Link>
          <Link className="button primary small" to="/register">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span></span> Education changes everything
          </p>
          <h1>
            Every student deserves <em>the chance</em> to thrive.
          </h1>
          <p className="hero-text">
            EduBridge connects verified volunteers, generous sponsors and
            deserving students to turn educational barriers into open doors.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/register">
              Find your way in <ArrowRight size={18} />
            </Link>
            <a className="button ghost" href="#how">
              See how it works
            </a>
          </div>
          <div className="trust">
            <ShieldCheck size={18} /> Transparent support, verified at every
            step
          </div>
        </div>
        <div className="hero-art">
          <div className="art-note">
            <Sparkles size={18} />
            <span>Impact, made visible</span>
          </div>
          <div className="art-number">
            {stats.supportProvided || 0}
            <small> KES directed to learning</small>
          </div>
          <div className="art-students">
            <div className="student-orb">EDU</div>
            <div>
              <strong>{stats.studentsSupported || 0}</strong>
              <span>students supported</span>
            </div>
          </div>
        </div>
      </section>
      <section className="stats">
        <Stat n={stats.studentsSupported || 0} label="Students supported" />
        <Stat n={stats.activeVolunteers || 0} label="Active volunteers" />
        <Stat n={stats.sponsors || 0} label="Sponsors" />
        <Stat
          n={stats.supportProvided || 0}
          label="Support provided"
          suffix=" KES"
        />
      </section>
      <section id="how" className="section">
        <div className="section-heading">
          <p className="eyebrow">The bridge</p>
          <h2>From a need to a new beginning.</h2>
          <p>
            One thoughtful connection can keep a student in school. Our process
            makes every one count.
          </p>
        </div>
        <div className="steps">
          {[
            [
              "01",
              "Identify",
              "A volunteer sees a student’s potential and shares their story.",
            ],
            [
              "02",
              "Understand",
              "Need analysis turns context into a clear, human picture.",
            ],
            [
              "03",
              "Connect",
              "Sponsors find the right opportunity to create meaningful impact.",
            ],
            [
              "04",
              "Follow through",
              "Progress is tracked transparently from first support to completion.",
            ],
          ].map(([n, t, d]) => (
            <div className="step" key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
      <section id="why" className="why">
        <div>
          <p className="eyebrow">Built for trust</p>
          <h2>Good intentions deserve a clear path to impact.</h2>
        </div>
        <div className="why-grid">
          <Feature
            icon={ShieldCheck}
            title="Verified people"
            text="A careful verification workflow protects students and sponsors alike."
          />
          <Feature
            icon={Sparkles}
            title="Smarter matching"
            text="Decision support highlights need without replacing human judgment."
          />
          <Feature
            icon={BarChart3}
            title="Visible progress"
            text="Every contribution has a status, a story and an accountable next step."
          />
        </div>
      </section>
      <footer>
        <div className="brand">
          <span className="brand-mark">
            <GraduationCap size={20} />
          </span>{" "}
          EduBridge
        </div>
        <span>Every student deserves education.</span>
      </footer>
    </>
  );
}
function Stat({ n, label, suffix = "" }) {
  return (
    <div>
      <strong>
        {n}
        {suffix}
      </strong>
      <span>{label}</span>
    </div>
  );
}
function Feature({ icon: Icon, title, text }) {
  return (
    <div className="feature">
      <Icon size={22} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const u = await login(e.target.email.value, e.target.password.value);
      nav(
        u.role === "ADMIN"
          ? "/admin/dashboard"
          : u.role === "VOLUNTEER"
            ? "/volunteer/dashboard"
            : "/sponsor/dashboard",
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign in.");
    }
  };
  return (
    <AuthPage title="Welcome back" sub="Sign in to continue your impact.">
      <form onSubmit={submit}>
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
        />
        {error && <div className="error">{error}</div>}
        <button className="button primary full">
          Sign in <ArrowRight size={17} />
        </button>
      </form>
      <p className="form-foot">
        New to EduBridge? <Link to="/register">Create an account</Link>
      </p>
    </AuthPage>
  );
}
function Register() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", {
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value,
        role: e.target.role.value,
      });
      setMessage("Account created. You can now sign in.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create account.");
    }
  };
  return (
    <AuthPage
      title="Start your bridge"
      sub="Choose how you want to make education possible."
    >
      <form onSubmit={submit}>
        <Field label="Full name" name="name" placeholder="Your name" />
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
        />
        <label className="field">
          <span>I want to</span>
          <select name="role" defaultValue="SPONSOR">
            <option value="SPONSOR">Sponsor a student</option>
            <option value="VOLUNTEER">Volunteer in my community</option>
          </select>
        </label>
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
        />
        {(error || message) && (
          <div className={error ? "error" : "success"}>{error || message}</div>
        )}
        <button className="button primary full">
          Create account <ArrowRight size={17} />
        </button>
      </form>
      <p className="form-foot">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthPage>
  );
}
function Field({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input required {...props} />
    </label>
  );
}
function AuthPage({ title, sub, children }) {
  return (
    <div className="auth-page">
      <Link className="brand auth-brand" to="/">
        <span className="brand-mark">
          <GraduationCap size={20} />
        </span>{" "}
        EduBridge
      </Link>
      <div className="auth-card">
        <div className="auth-icon">
          <HeartHandshake />
        </div>
        <h1>{title}</h1>
        <p>{sub}</p>
        {children}
      </div>
    </div>
  );
}
function Dashboard({ role }) {
  const [data, setData] = useState(null);
  const { user } = useAuth();
  useEffect(() => {
    api
      .get(role === "ADMIN" ? "/admin/overview" : "/students", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("edubridge-token")}`,
        },
      })
      .then((r) => setData(r.data.data))
      .catch(() => {});
  }, [role]);
  const isAdmin = role === "ADMIN";
  const count = isAdmin ? data?.students : data?.length;
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Good to see you</p>
          <h1>
            {isAdmin
              ? "A clearer view of impact."
              : `Welcome, ${user?.name?.split(" ")[0]}.`}
          </h1>
          <p className="muted">Here is what is moving forward today.</p>
        </div>
        <Link
          className="button primary"
          to={
            isAdmin
              ? "/admin/students"
              : role === "VOLUNTEER"
                ? "/volunteer/students/new"
                : "/sponsor/recommendations"
          }
        >
          {role === "SPONSOR" ? "Find a student" : "Take action"}{" "}
          <ArrowRight size={17} />
        </Link>
      </div>
      <div className="metric-grid">
        <Metric
          label={isAdmin ? "Total students" : "Students in your care"}
          value={count || 0}
          icon={GraduationCap}
        />
        <Metric
          label={isAdmin ? "High priority" : "Pending review"}
          value={
            isAdmin
              ? data?.highPriority
              : data?.filter((s) => s.verificationStatus === "PENDING")
                  .length || 0
          }
          icon={Sparkles}
        />
        <Metric
          label={isAdmin ? "Active support" : "Support in motion"}
          value={isAdmin ? data?.activeSupport : 0}
          icon={HeartHandshake}
        />
        <Metric
          label={isAdmin ? "Support directed" : "Your next milestone"}
          value={isAdmin ? `${data?.totalAmount || 0} KES` : "Make a match"}
          icon={CircleDollarSign}
        />
      </div>
      <div className="dashboard-grid">
        <div className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h2>Priority landscape</h2>
              <p className="muted">A snapshot of students who need us most.</p>
            </div>
            <BarChart3 size={20} />
          </div>
          {isAdmin && data ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.priority}>
                <CartesianGrid vertical={false} stroke="#e7e3d9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#ee6c4d" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty
              title="Your student list is ready"
              text="Keep building your bridge by reviewing the workspace sections."
            />
          )}
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Next steps</h2>
              <p className="muted">Small actions, real momentum.</p>
            </div>
          </div>
          <div className="check-list">
            <Check title="Complete your profile" />
            <Check title="Review the latest student stories" />
            <Check title="Keep support status up to date" />
          </div>
        </div>
      </div>
    </div>
  );
}
function Metric({ label, value, icon: Icon }) {
  return (
    <div className="metric">
      <div className="metric-icon">
        <Icon size={19} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function Check({ title }) {
  return (
    <div className="check">
      <CheckCircle2 size={18} />
      <span>{title}</span>
      <ChevronRight size={16} />
    </div>
  );
}
function Empty({ title, text }) {
  return (
    <div className="empty">
      <BookOpen size={28} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Students({ sponsor = false }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const { user } = useAuth();
  useEffect(() => {
    api
      .get(sponsor ? "/recommendations/students" : "/students", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("edubridge-token")}`,
        },
      })
      .then((r) => setItems(r.data.data))
      .catch((e) =>
        setError(e.response?.data?.message || "Unable to load students."),
      );
  }, [sponsor]);
  const support = async (student) => {
    if (!confirm(`Support ${student.name} with ${student.requiredAmount} KES?`))
      return;
    try {
      await api.post(
        "/support",
        { studentId: student.id, amount: student.requiredAmount },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edubridge-token")}`,
          },
        },
      );
      alert("Support request created.");
    } catch (e) {
      alert(e.response?.data?.message || "Unable to create support request.");
    }
  };
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">
            {sponsor ? "AI-assisted matching" : "Student stories"}
          </p>
          <h1>
            {sponsor
              ? "Opportunities that fit."
              : "The students you are helping."}
          </h1>
          <p className="muted">
            {sponsor
              ? "Recommendations are guidance. You decide where your support belongs."
              : "Every profile is a person, not just a number."}
          </p>
        </div>
        {user.role === "VOLUNTEER" && (
          <Link className="button primary" to="/volunteer/students/new">
            Add student <ArrowRight size={17} />
          </Link>
        )}
      </div>
      {error && <div className="error">{error}</div>}
      <div className="student-grid">
        {items.map((s) => (
          <article className="student-card" key={s.id}>
            <div className="student-top">
              <div className="student-avatar">{s.name[0]}</div>
              <div>
                <h3>{s.name}</h3>
                <p>
                  {s.school} · {s.location}
                </p>
              </div>
              <span className={`priority ${s.priority?.toLowerCase()}`}>
                {s.priority}
              </span>
            </div>
            <div className="student-details">
              <span>{s.supportCategory}</span>
              <strong>{s.requiredAmount} KES</strong>
            </div>
            <div className="score">
              <div>
                <span>Need score</span>
                <strong>{s.needScore ?? s.score}/100</strong>
              </div>
              <div className="score-bar">
                <i style={{ width: `${s.needScore ?? s.score}%` }} />
              </div>
            </div>
            <p className="card-copy">{s.matchReason || s.explanation}</p>
            {sponsor && (
              <button
                className="button primary full"
                onClick={() => support(s)}
              >
                Support this student <HeartHandshake size={17} />
              </button>
            )}
          </article>
        ))}
      </div>
      {!items.length && !error && (
        <Empty
          title="No student profiles yet"
          text="New stories will appear here as they are verified."
        />
      )}
    </div>
  );
}
function AdminStudentReview() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState("");
  const load = () =>
    api
      .get("/admin/students")
      .then((response) => {
        setItems(response.data.data);
        setError("");
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load students."),
      );
  useEffect(() => {
    load();
  }, []);
  const update = async (id, status) => {
    setProcessing(`${id}:${status}`);
    setError("");
    setMessage("");
    try {
      await api.patch(`/admin/students/${id}`, { status });
      setMessage(`Student ${status === "APPROVED" ? "approved" : "rejected"}.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update student.");
    } finally {
      setProcessing("");
    }
  };
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Trust and safety</p>
          <h1>Student review</h1>
          <p className="muted">
            Review submitted student profiles before sponsors can support them.
          </p>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <div className="panel table-panel">
        <div className="table-head">
          <strong>Student</strong>
          <strong>School</strong>
          <strong>Need score</strong>
          <strong>Status</strong>
          <strong>Actions</strong>
        </div>
        {items.map((item) => {
          const status = item.verificationStatus || "PENDING";
          const pending = status === "PENDING";
          return (
            <div className="table-row" key={item.id}>
              <span>{item.name}</span>
              <span>{item.school}</span>
              <span>{item.needScore ?? item.score ?? "—"}/100</span>
              <span className={`status ${status.toLowerCase()}`}>{status}</span>
              <span>
                {pending ? (
                  <div>
                    <button
                      type="button"
                      className="button primary small"
                      disabled={Boolean(processing)}
                      onClick={() => update(item.id, "APPROVED")}
                    >
                      {processing === `${item.id}:APPROVED`
                        ? "Approving..."
                        : "Approve"}
                    </button>{" "}
                    <button
                      type="button"
                      className="button ghost small"
                      disabled={Boolean(processing)}
                      onClick={() => update(item.id, "REJECTED")}
                    >
                      {processing === `${item.id}:REJECTED`
                        ? "Rejecting..."
                        : "Reject"}
                    </button>
                  </div>
                ) : (
                  "Reviewed"
                )}
              </span>
            </div>
          );
        })}
        {!items.length && (
          <Empty
            title="No student profiles yet"
            text="Submitted student profiles will appear here for review."
          />
        )}
      </div>
    </div>
  );
}
function NewStudent() {
  const nav = useNavigate();
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const body = Object.fromEntries(form.entries());
    try {
      await api.post(
        "/students",
        {
          ...body,
          familyIncome: Number(body.familyIncome),
          familySize: Number(body.familySize),
          academicPerformance: Number(body.academicPerformance),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edubridge-token")}`,
          },
        },
      );
      nav("/volunteer/students");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit student.");
    }
  };
  return (
    <div className="page narrow">
      <div className="page-head">
        <div>
          <p className="eyebrow">Add a student</p>
          <h1>Share their story with care.</h1>
          <p className="muted">
            The more context you provide, the more useful the need analysis
            becomes.
          </p>
        </div>
      </div>
      <form className="panel form-panel" onSubmit={submit}>
        <h2>Personal and academic details</h2>
        <div className="form-grid">
          <Field label="Student name" name="name" placeholder="Full name" />
          <Field label="Age" name="age" type="number" placeholder="14" />
          <Field
            label="School / college"
            name="school"
            placeholder="School name"
          />
          <Field
            label="Location"
            name="location"
            placeholder="City or county"
          />
          <Field
            label="Academic performance (%)"
            name="academicPerformance"
            type="number"
            placeholder="75"
          />
          <label className="field">
            <span>Educational need</span>
            <select name="educationalNeed">
              <option>high</option>
              <option>medium</option>
              <option>low</option>
            </select>
          </label>
          <Field
            label="Family income (KES)"
            name="familyIncome"
            type="number"
            placeholder="8000"
          />
          <Field
            label="Family size"
            name="familySize"
            type="number"
            placeholder="5"
          />
          <label className="field">
            <span>Dropout risk</span>
            <select name="dropoutRisk">
              <option>high</option>
              <option>medium</option>
              <option>low</option>
            </select>
          </label>
          <label className="field">
            <span>Support category</span>
            <select name="supportCategory">
              <option>Tuition Fee</option>
              <option>Exam Fee</option>
              <option>Study Materials</option>
              <option>Transportation</option>
              <option>Higher Education</option>
              <option>Other</option>
            </select>
          </label>
          <Field
            label="Required amount (KES)"
            name="requiredAmount"
            type="number"
            placeholder="12000"
          />
        </div>
        <label className="field">
          <span>Description</span>
          <textarea
            name="description"
            rows="4"
            placeholder="Tell sponsors what this support would make possible."
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="button primary">
          Submit for review <ArrowRight size={17} />
        </button>
      </form>
    </div>
  );
}
function Sponsorships() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api
      .get("/support", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("edubridge-token")}`,
        },
      })
      .then((r) => setItems(r.data.data));
  }, []);
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Support tracking</p>
          <h1>Impact in motion.</h1>
          <p className="muted">
            Follow each contribution from intention to completion.
          </p>
        </div>
      </div>
      <div className="panel table-panel">
        <div className="table-head">
          <strong>Student</strong>
          <strong>Category</strong>
          <strong>Amount</strong>
          <strong>Status</strong>
        </div>
        {items.map((s) => (
          <div className="table-row" key={s.id}>
            <span>{s.student}</span>
            <span>{s.category}</span>
            <span>{s.amount} KES</span>
            <span className={`status ${s.status.toLowerCase()}`}>
              {s.status.replace("_", " ")}
            </span>
          </div>
        ))}
        {!items.length && (
          <Empty
            title="Your first impact is waiting"
            text="Support a student to see their progress here."
          />
        )}
      </div>
    </div>
  );
}
function AdminSponsorshipReview() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState("");
  const load = () =>
    api
      .get("/admin/support")
      .then((response) => {
        setItems(response.data.data);
        setError("");
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load support requests."),
      );
  useEffect(() => {
    load();
  }, []);
  const update = async (item, status) => {
    const action = status === "APPROVED" ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${action} this sponsorship?`)) return;
    setProcessing(`${item.id}:${status}`);
    setError("");
    setMessage("");
    try {
      await api.patch(`/admin/support/${item.id}`, { status });
      setMessage(`Sponsorship ${status.toLowerCase()}.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update sponsorship.");
    } finally {
      setProcessing("");
    }
  };
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Sponsorship review</p>
          <h1>Support requests</h1>
          <p className="muted">Review sponsorships before support moves forward.</p>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <div className="panel table-panel admin-support-table">
        <div className="table-head">
          <strong>Student</strong>
          <strong>Sponsor</strong>
          <strong>Category</strong>
          <strong>Amount</strong>
          <strong>Status</strong>
          <strong>Actions</strong>
        </div>
        {items.map((item) => {
          const pending = item.status === "PENDING";
          return (
            <div className="table-row" key={item.id}>
              <span>{item.student?.name || "Unknown student"}</span>
              <span>{item.sponsor?.name || "Unknown sponsor"}</span>
              <span>{item.category}</span>
              <span>{item.amount} KES</span>
              <span className={`status ${item.status.toLowerCase()}`}>
                {item.status}
              </span>
              <span>
                {pending ? (
                  <div>
                    <button
                      type="button"
                      className="button primary small"
                      disabled={Boolean(processing)}
                      onClick={() => update(item, "APPROVED")}
                    >
                      {processing === `${item.id}:APPROVED` ? "Approving..." : "Approve"}
                    </button>{" "}
                    <button
                      type="button"
                      className="button ghost small"
                      disabled={Boolean(processing)}
                      onClick={() => update(item, "REJECTED")}
                    >
                      {processing === `${item.id}:REJECTED` ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                ) : (
                  "Processed"
                )}
              </span>
            </div>
          );
        })}
        {!items.length && (
          <Empty
            title="No support requests yet"
            text="New sponsorship requests will appear here for review."
          />
        )}
      </div>
    </div>
  );
}
function VolunteerReview() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState("");
  const load = () =>
    api
      .get("/admin/volunteers")
      .then((response) => setItems(response.data.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load volunteers."),
      );
  useEffect(() => {
    load();
  }, []);
  const update = async (id, status) => {
    setProcessing(`${id}:${status}`);
    setError("");
    setMessage("");
    try {
      await api.patch(`/admin/volunteers/${id}`, { status });
      setMessage(
        `Volunteer ${status === "APPROVED" ? "approved" : "rejected"}.`,
      );
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update volunteer.");
    } finally {
      setProcessing("");
    }
  };
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Trust and safety</p>
          <h1>Volunteer review</h1>
          <p className="muted">
            Review pending community volunteers before they submit student
            profiles.
          </p>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}
      <div className="panel table-panel">
        <div className="table-head">
          <strong>Volunteer</strong>
          <strong>Email</strong>
          <strong>Status</strong>
          <strong>Actions</strong>
        </div>
        {items.map((item) => {
          const status = item.profile?.verificationStatus || "PENDING";
          const pending = status !== "APPROVED";
          return (
            <div className="table-row" key={item.id}>
              <span>{item.name}</span>
              <span>{item.email}</span>
              <span className={`status ${status.toLowerCase()}`}>{status}</span>
              <span>
                {pending ? (
                  <div>
                    <button
                      type="button"
                      className="button primary small"
                      disabled={Boolean(processing)}
                      onClick={() => update(item.id, "APPROVED")}
                    >
                      {processing === `${item.id}:APPROVED`
                        ? "Approving..."
                        : "Approve"}
                    </button>{" "}
                    <button
                      type="button"
                      className="button ghost small"
                      disabled={Boolean(processing)}
                      onClick={() => update(item.id, "REJECTED")}
                    >
                      {processing === `${item.id}:REJECTED`
                        ? "Rejecting..."
                        : "Reject"}
                    </button>
                  </div>
                ) : (
                  "Reviewed"
                )}
              </span>
            </div>
          );
        })}
        {!items.length && (
          <Empty
            title="No volunteers to review"
            text="New volunteer verification requests will appear here."
          />
        )}
      </div>
    </div>
  );
}
function DataPage({ title, eyebrow, endpoint, children }) {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get(endpoint)
      .then((response) => setData(response.data.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load this page."),
      );
  }, [endpoint]);
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {children(data)}
    </div>
  );
}
function Profile() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    await api
      .patch("/profile", Object.fromEntries(form.entries()))
      .then(() => setMessage("Profile updated."))
      .catch((err) =>
        setMessage(err.response?.data?.message || "Unable to update profile."),
      );
  };
  return (
    <div className="page narrow">
      <div className="page-head">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Your profile</h1>
        </div>
      </div>
      <form className="panel form-panel" onSubmit={submit}>
        <Field label="Name" name="name" defaultValue={user?.name} />
        <Field
          label="Location"
          name="location"
          defaultValue={user?.profile?.location || ""}
        />
        {user?.role === "SPONSOR" && (
          <>
            <Field
              label="Budget (KES)"
              name="budget"
              type="number"
              defaultValue={user?.profile?.budget || 0}
            />
            <label className="field">
              <span>Preferred category</span>
              <select
                name="preferredCategories"
                defaultValue={
                  user?.profile?.preferredCategories?.[0] || "Tuition Fee"
                }
              >
                {[
                  "Tuition Fee",
                  "Exam Fee",
                  "Study Materials",
                  "Transportation",
                  "Higher Education",
                  "Other Educational Support",
                ].map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
          </>
        )}
        <button className="button primary">
          Save profile <CheckCircle2 size={17} />
        </button>
        {message && <div className="success">{message}</div>}
      </form>
    </div>
  );
}
function StudentDetail() {
  const { id } = useParams();
  return (
    <DataPage
      title="Student details"
      eyebrow="Student profile"
      endpoint={`/students/${id}`}
    >
      {(student) => (
        <div className="panel detail-panel">
          <div className="student-top">
            <div className="student-avatar">{student.name?.[0]}</div>
            <div>
              <h2>{student.name}</h2>
              <p>
                {student.school} · {student.location}
              </p>
            </div>
            <span className={`priority ${student.priority?.toLowerCase()}`}>
              {student.priority}
            </span>
          </div>
          <p>{student.description}</p>
          <div className="metric-grid">
            <Metric
              label="Need score"
              value={`${student.needScore || student.score}/100`}
              icon={Sparkles}
            />
            <Metric
              label="Category"
              value={student.supportCategory}
              icon={BookOpen}
            />
            <Metric
              label="Required"
              value={`${student.requiredAmount} KES`}
              icon={CircleDollarSign}
            />
          </div>
          <h3>Support timeline</h3>
          {student.supports?.length ? (
            student.supports.map((item) => (
              <div className="table-row" key={item.id || item._id}>
                <span>{item.status}</span>
                <span>{item.amount} KES</span>
                <span>{item.notes || "Support request recorded"}</span>
              </div>
            ))
          ) : (
            <Empty
              title="No support yet"
              text="This student is awaiting their first support request."
            />
          )}
        </div>
      )}
    </DataPage>
  );
}
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<Landing />} />
        <Route path="/how-it-works" element={<Landing />} />
        <Route
          path="/volunteer/dashboard"
          element={
            <Protected role="VOLUNTEER">
              <Dashboard role="VOLUNTEER" />
            </Protected>
          }
        />
        <Route
          path="/volunteer/students"
          element={
            <Protected role="VOLUNTEER">
              <Students />
            </Protected>
          }
        />
        <Route
          path="/volunteer/students/new"
          element={
            <Protected role="VOLUNTEER">
              <NewStudent />
            </Protected>
          }
        />
        <Route
          path="/volunteer/students/:id"
          element={
            <Protected role="VOLUNTEER">
              <StudentDetail />
            </Protected>
          }
        />
        <Route
          path="/volunteer/profile"
          element={
            <Protected role="VOLUNTEER">
              <Profile />
            </Protected>
          }
        />
        <Route
          path="/volunteer/verification"
          element={
            <Protected role="VOLUNTEER">
              <Verification />
            </Protected>
          }
        />
        <Route
          path="/sponsor/dashboard"
          element={
            <Protected role="SPONSOR">
              <Dashboard role="SPONSOR" />
            </Protected>
          }
        />
        <Route
          path="/sponsor/recommendations"
          element={
            <Protected role="SPONSOR">
              <Students sponsor />
            </Protected>
          }
        />
        <Route
          path="/sponsor/students"
          element={
            <Protected role="SPONSOR">
              <Students sponsor={false} />
            </Protected>
          }
        />
        <Route
          path="/sponsor/students/:id"
          element={
            <Protected role="SPONSOR">
              <StudentDetail />
            </Protected>
          }
        />
        <Route
          path="/sponsor/sponsorships"
          element={
            <Protected role="SPONSOR">
              <Sponsorships />
            </Protected>
          }
        />
        <Route
          path="/sponsor/support"
          element={
            <Protected role="SPONSOR">
              <Sponsorships />
            </Protected>
          }
        />
        <Route
          path="/sponsor/profile"
          element={
            <Protected role="SPONSOR">
              <Profile />
            </Protected>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <Protected role="ADMIN">
              <Dashboard role="ADMIN" />
            </Protected>
          }
        />
        <Route
          path="/admin/volunteers"
          element={
            <Protected role="ADMIN">
              <VolunteerReview />
            </Protected>
          }
        />
        <Route
          path="/admin/students"
          element={
            <Protected role="ADMIN">
              <AdminStudentReview />
            </Protected>
          }
        />
        <Route
          path="/admin/sponsors"
          element={
            <Protected role="ADMIN">
              <DataPage
                title="Sponsors"
                eyebrow="Community partners"
                endpoint="/admin/sponsors"
              >
                {(items) => (
                  <div className="panel table-panel">
                    {items.map((item) => (
                      <div className="table-row" key={item.id}>
                        <span>{item.name}</span>
                        <span>{item.email}</span>
                        <span>{item.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </DataPage>
            </Protected>
          }
        />
        <Route
          path="/admin/support"
          element={
            <Protected role="ADMIN">
              <AdminSponsorshipReview />
            </Protected>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <Protected role="ADMIN">
              <DataPage
                title="Audit logs"
                eyebrow="Accountability"
                endpoint="/admin/audit-logs"
              >
                {(items) => (
                  <div className="panel table-panel">
                    {items.map((item) => (
                      <div className="table-row" key={item.id || item._id}>
                        <span>{item.action}</span>
                        <span>{item.entityType}</span>
                        <span>{item.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </DataPage>
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}
function Verification() {
  const { user } = useAuth();
  return (
    <div className="page narrow">
      <div className="page-head">
        <div>
          <p className="eyebrow">Trust and safety</p>
          <h1>Verification status</h1>
          <p className="muted">
            Approved volunteers help us keep every student story grounded and
            protected.
          </p>
        </div>
      </div>
      <div className="panel verification">
        <div className="verification-icon">
          <ShieldCheck />
        </div>
        <div>
          <span className="status approved">
            {user?.profile?.verificationStatus || "PENDING"}
          </span>
          <h2>
            {user?.profile?.verificationStatus === "APPROVED"
              ? "You are approved to submit students."
              : "Your verification is being reviewed."}
          </h2>
          <p>
            Keep your contact details current. An administrator may reach out if
            more information is needed.
          </p>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
