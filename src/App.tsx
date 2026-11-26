
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  Download,
  FileText,
  Filter,
  LayoutDashboard,
  Leaf,
  Menu,
  MessageSquare,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatCurrency,
  formatFullCurrency,
  grants as demoGrants,
  monthlyFunding,
  programmes,
  type Grant,
  type GrantStatus,
} from "./data";

import "./App.css";

type Page = "Overview" | "Grants" | "Insights" | "AI Assistant";
type ApiStatus = "loading" | "connected" | "error";

type ApiGrant = {
  grant_id: string;
  organisation: string;
  programme: string;
  region: string;
  committed: number;
  disbursed: number;
  status: string;
  start_date: string;
};

const API_URL = "http://localhost:8000";

const navItems: { label: Page; icon: typeof LayoutDashboard }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Grants", icon: FileText },
  { label: "Insights", icon: BarChart3 },
  { label: "AI Assistant", icon: MessageSquare },
];

const statusClass = (status: GrantStatus) =>
  status.toLowerCase().replace(" ", "-");

const currencyTooltip = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

function App() {
  const [grants, setGrants] = useState<Grant[]>(demoGrants);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("loading");
  const [page, setPage] = useState<Page>("Overview");
  const [search, setSearch] = useState("");
  const [programme, setProgramme] = useState("All programmes");
  const [region, setRegion] = useState("All regions");
  const [status, setStatus] = useState("All statuses");
  const [role, setRole] = useState("Programme Officer");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "assistant" | "user"; text: string }[]
  >([
    {
      role: "assistant",
      text: "Hello! I'm the Compass demo assistant. Ask me about committed funding, disbursements, grant status or programme allocation.",
    },
  ]);

  // Fetch grant records from FastAPI.
  useEffect(() => {
    let cancelled = false;

    async function loadGrants() {
      try {
        const response = await fetch(`${API_URL}/api/grants`);

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const rows: ApiGrant[] = await response.json();

        const apiGrants: Grant[] = rows.map((row) => {
          if (
            !["On track", "At risk", "Completed"].includes(row.status)
          ) {
            throw new Error(`Unexpected status for ${row.grant_id}`);
          }

          const committed = Number(row.committed);
          const disbursed = Number(row.disbursed);

          if (
            !Number.isFinite(committed) ||
            !Number.isFinite(disbursed)
          ) {
            throw new Error(`Invalid funding amount for ${row.grant_id}`);
          }

          return {
            id: row.grant_id,
            organisation: row.organisation,
            programme: row.programme,
            region: row.region,
            committed,
            disbursed,
            status: row.status as GrantStatus,
            startDate: row.start_date,
          };
        });

        if (!cancelled) {
          setGrants(apiGrants);
          setApiStatus("connected");
        }
      } catch (error) {
        console.error("Unable to load grants from Compass API:", error);

        if (!cancelled) {
          setApiStatus("error");
          // Keep the fallback demo records visible if the API is unavailable.
        }
      }
    }

    void loadGrants();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGrants = useMemo(() => {
    const query = search.toLowerCase().trim();

    return grants.filter((grant) => {
      const matchesSearch =
        !query ||
        [
          grant.id,
          grant.organisation,
          grant.programme,
          grant.region,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (programme === "All programmes" ||
          grant.programme === programme) &&
        (region === "All regions" || grant.region === region) &&
        (status === "All statuses" || grant.status === status)
      );
    });
  }, [grants, search, programme, region, status]);

  const committed = filteredGrants.reduce(
    (sum, grant) => sum + grant.committed,
    0
  );

  const disbursed = filteredGrants.reduce(
    (sum, grant) => sum + grant.disbursed,
    0
  );

  const remaining = committed - disbursed;

  const atRisk = filteredGrants.filter(
    (grant) => grant.status === "At risk"
  ).length;

  const programmeData = programmes.map((item) => ({
    name: item.name,
    value: filteredGrants
      .filter((grant) => grant.programme === item.name)
      .reduce((sum, grant) => sum + grant.committed, 0),
    color: item.color,
  }));

  const regionalData = [
    "East Africa",
    "West Africa",
    "Southern Africa",
  ].map((name) => ({
    name,
    committed: filteredGrants
      .filter((grant) => grant.region === name)
      .reduce((sum, grant) => sum + grant.committed, 0),
    disbursed: filteredGrants
      .filter((grant) => grant.region === name)
      .reduce((sum, grant) => sum + grant.disbursed, 0),
  }));

  function resetFilters() {
    setSearch("");
    setProgramme("All programmes");
    setRegion("All regions");
    setStatus("All statuses");
  }

  function downloadCsv() {
    const headers = [
      "Grant ID",
      "Organisation",
      "Programme",
      "Region",
      "Committed",
      "Disbursed",
      "Status",
      "Start date",
    ];

    const rows = filteredGrants.map((grant) => [
      grant.id,
      grant.organisation,
      grant.programme,
      grant.region,
      grant.committed,
      grant.disbursed,
      grant.status,
      grant.startDate,
    ]);

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "compass-grants.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function askAssistant(question: string) {
    const q = question.toLowerCase();

    if (q.includes("risk") || q.includes("behind")) {
      const risky = filteredGrants.filter(
        (grant) => grant.status === "At risk"
      );

      return `There are ${risky.length} at-risk grants in the current filtered view. ${
        risky
          .slice(0, 4)
          .map((grant) => grant.organisation)
          .join(", ") || "No at-risk grants match the current filters"
      }. This is based on the grant status labels, not an independent risk prediction.`;
    }

    if (q.includes("programme") || q.includes("allocation")) {
      const top = [...programmeData].sort(
        (a, b) => b.value - a.value
      )[0];

      return top && top.value > 0
        ? `${top.name} has the highest committed funding in the current view, at ${formatFullCurrency(top.value)}.`
        : "No programme funding matches the current filters.";
    }

    if (q.includes("disburs")) {
      return `Total disbursed funding in the current filtered view is ${formatFullCurrency(disbursed)}, out of ${formatFullCurrency(committed)} committed.`;
    }

    if (q.includes("remaining") || q.includes("balance")) {
      return `The difference between committed and disbursed funding in the current view is ${formatFullCurrency(remaining)}. This does not necessarily mean the amount is overdue or available to spend.`;
    }

    if (q.includes("how many") || q.includes("number of grant")) {
      return `There are ${filteredGrants.length} grants in the current filtered view, including ${atRisk} marked at risk.`;
    }

    return `In the current filtered view, ${formatFullCurrency(committed)} is committed across ${filteredGrants.length} grants, and ${formatFullCurrency(disbursed)} has been disbursed. Try asking about risk, programmes, disbursements or remaining funding.`;
  }

  function sendMessage(question = chatInput) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;

    const answer = askAssistant(cleanQuestion);

    setMessages((previous) => [
      ...previous,
      { role: "user", text: cleanQuestion },
      { role: "assistant", text: answer },
    ]);

    setChatInput("");
  }

  function renderFilters() {
    return (
      <div className="filters">
        <label className="search-box">
          <Search size={17} />
          <input
            aria-label="Search grants"
            placeholder="Search grants..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <select
          aria-label="Filter by programme"
          value={programme}
          onChange={(event) => setProgramme(event.target.value)}
        >
          <option>All programmes</option>
          {programmes.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>

        <select
          aria-label="Filter by region"
          value={region}
          onChange={(event) => setRegion(event.target.value)}
        >
          <option>All regions</option>
          <option>East Africa</option>
          <option>West Africa</option>
          <option>Southern Africa</option>
        </select>

        <select
          aria-label="Filter by grant status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option>All statuses</option>
          <option>On track</option>
          <option>At risk</option>
          <option>Completed</option>
        </select>

        <button className="button button-quiet" onClick={resetFilters}>
          <Filter size={15} />
          Reset
        </button>
      </div>
    );
  }

  function renderGrantTable(data: Grant[]) {
    return (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Organisation</th>
              <th>Programme</th>
              <th>Region</th>
              <th>Committed</th>
              <th>Disbursed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((grant) => (
              <tr key={grant.id}>
                <td>
                  <div className="organisation-cell">
                    <span className="organisation-avatar">
                      {grant.organisation.charAt(0)}
                    </span>
                    <span>
                      <strong>{grant.organisation}</strong>
                      <small>{grant.id}</small>
                    </span>
                  </div>
                </td>
                <td>{grant.programme}</td>
                <td>{grant.region}</td>
                <td className="money">
                  {formatCurrency(grant.committed)}
                </td>
                <td className="money">
                  {formatCurrency(grant.disbursed)}
                </td>
                <td>
                  <span className={`status ${statusClass(grant.status)}`}>
                    <span className="status-dot" />
                    {grant.status}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  No grants match these filters. Try resetting your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  function renderDashboard() {
    return (
      <>
        <section className="kpi-grid">
          <article className="kpi-card">
            <div className="kpi-top">
              <span>Committed funding</span>
              <span className="kpi-icon purple">
                <Wallet size={19} />
              </span>
            </div>
            <h2>{formatCurrency(committed)}</h2>
            <p>
              <span className="positive">
                <ArrowUpRight size={15} /> Portfolio
              </span>
              <span> total commitments</span>
            </p>
          </article>

          <article className="kpi-card">
            <div className="kpi-top">
              <span>Funds disbursed</span>
              <span className="kpi-icon green">
                <Activity size={19} />
              </span>
            </div>
            <h2>{formatCurrency(disbursed)}</h2>
            <p>
              <span className="positive">
                <ArrowUpRight size={15} />{" "}
                {committed ? Math.round((disbursed / committed) * 100) : 0}%
              </span>
              <span> of commitments</span>
            </p>
          </article>

          <article className="kpi-card">
            <div className="kpi-top">
              <span>Undisbursed balance</span>
              <span className="kpi-icon amber">
                <Clock3 size={19} />
              </span>
            </div>
            <h2>{formatCurrency(remaining)}</h2>
            <p>
              <span>Committed less disbursed</span>
            </p>
          </article>

          <article className="kpi-card">
            <div className="kpi-top">
              <span>Grants at risk</span>
              <span className="kpi-icon rose">
                <ArrowDownRight size={19} />
              </span>
            </div>
            <h2>{atRisk}</h2>
            <p>
              <span className="risk-text">
                {filteredGrants.length
                  ? Math.round((atRisk / filteredGrants.length) * 100)
                  : 0}
                % of filtered grants
              </span>
            </p>
          </article>
        </section>

        <section className="chart-grid">
          <article className="panel funding-panel">
            <div className="panel-heading">
              <div>
                <h3>Funding over time</h3>
                <p>Monthly commitments and disbursements</p>
              </div>
              <span className="chart-label">2026 demo data</span>
            </div>

            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyFunding}
                  margin={{ top: 12, right: 4, left: 0, bottom: 0 }}
                  barGap={5}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e9edf3"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8b95a5", fontSize: 11 }}
                  />
                  <YAxis
                    width={64}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8b95a5", fontSize: 11 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => currencyTooltip(Number(value))}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e9edf3",
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, paddingBottom: 16 }}
                  />
                  <Bar
                    dataKey="committed"
                    name="Committed"
                    fill="#6875e8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                  <Bar
                    dataKey="disbursed"
                    name="Disbursed"
                    fill="#43b99b"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel programme-panel">
            <div className="panel-heading">
              <div>
                <h3>Funding by programme</h3>
                <p>Committed funding allocation</p>
              </div>
            </div>

            <div className="donut-area">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={programmeData.filter((item) => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={66}
                    outerRadius={96}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {programmeData
                      .filter((item) => item.value > 0)
                      .map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => currencyTooltip(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="donut-center">
                <span>Total committed</span>
                <strong>{formatCurrency(committed)}</strong>
              </div>
            </div>

            <div className="programme-legend">
              {programmeData.map((item) => (
                <div className="legend-row" key={item.name}>
                  <span className="legend-name">
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </span>
                  <strong>{formatCurrency(item.value)}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="panel regional-panel">
          <div className="panel-heading">
            <div>
              <h3>Regional funding</h3>
              <p>Compare commitments and disbursements by region</p>
            </div>
          </div>

          <div className="chart-area regional-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regionalData}
                margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e9edf3"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#667085", fontSize: 12 }}
                />
                <YAxis
                  width={65}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8b95a5", fontSize: 11 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => currencyTooltip(Number(value))}
                />
                <Legend />
                <Bar
                  dataKey="committed"
                  name="Committed"
                  fill="#6875e8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="disbursed"
                  name="Disbursed"
                  fill="#43b99b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel grants-panel">
          <div className="panel-heading">
            <div>
              <h3>Grant portfolio</h3>
              <p>
                Showing {filteredGrants.length} of {grants.length} grants
              </p>
            </div>
            <button className="button button-outline" onClick={downloadCsv}>
              <Download size={16} /> Export CSV
            </button>
          </div>

          {renderFilters()}
          {renderGrantTable(filteredGrants)}
        </section>
      </>
    );
  }

  function renderInsights() {
    const regionCount = new Set(
      filteredGrants.map((grant) => grant.region)
    ).size;
    const programmeCount = new Set(
      filteredGrants.map((grant) => grant.programme)
    ).size;
    const completedCount = filteredGrants.filter(
      (grant) => grant.status === "Completed"
    ).length;

    return (
      <>
        <section className="kpi-grid">
          <article className="kpi-card">
            <div className="kpi-top">
              <span>Reporting regions</span>
              <span className="kpi-icon purple">
                <Users size={19} />
              </span>
            </div>
            <h2>{regionCount}</h2>
            <p>Represented in the current view</p>
          </article>

          <article className="kpi-card">
            <div className="kpi-top">
              <span>Programmes</span>
              <span className="kpi-icon green">
                <Leaf size={19} />
              </span>
            </div>
            <h2>{programmeCount}</h2>
            <p>With matching grants</p>
          </article>

          <article className="kpi-card">
            <div className="kpi-top">
              <span>Completion rate</span>
              <span className="kpi-icon amber">
                <CheckCircle2 size={19} />
              </span>
            </div>
            <h2>
              {filteredGrants.length
                ? Math.round(
                    (completedCount / filteredGrants.length) * 100
                  )
                : 0}
              %
            </h2>
            <p>Based on grant status labels</p>
          </article>

          <article className="kpi-card">
            <div className="kpi-top">
              <span>Disbursement rate</span>
              <span className="kpi-icon rose">
                <Activity size={19} />
              </span>
            </div>
            <h2>
              {committed ? Math.round((disbursed / committed) * 100) : 0}%
            </h2>
            <p>Disbursed divided by committed</p>
          </article>
        </section>

        <section className="panel grants-panel">
          <div className="panel-heading">
            <div>
              <h3>Explore grant data</h3>
              <p>Apply filters to compare the portfolio.</p>
            </div>
          </div>
          {renderFilters()}
          {renderGrantTable(filteredGrants)}
        </section>
      </>
    );
  }

  function renderChat() {
    return (
      <section className="panel chat-panel">
        <div className="panel-heading">
          <div>
            <h3>Compass AI Assistant</h3>
            <p>Explore the grant portfolio using natural language.</p>
          </div>
          <span className="demo-tag">DEMO MODE</span>
        </div>

        <div className="chat-disclaimer">
          <Bot size={18} />
          This prototype uses predefined rules and the current grant dataset.
          It is not connected to a live AI model or live financial systems.
        </div>

        <div className="chat-messages" aria-live="polite">
          {messages.map((message, index) => (
            <div
              key={`${index}-${message.role}`}
              className={`chat-message ${message.role}`}
            >
              <span className="chat-avatar">
                {message.role === "assistant" ? (
                  <Bot size={17} />
                ) : (
                  <Users size={17} />
                )}
              </span>
              <p>{message.text}</p>
            </div>
          ))}
        </div>

        <div className="suggested-questions">
          <button onClick={() => sendMessage("How much has been disbursed?")}>
            How much has been disbursed?
          </button>
          <button onClick={() => sendMessage("Which grants are at risk?")}>
            Which grants are at risk?
          </button>
          <button
            onClick={() => sendMessage("Which programme has the most funding?")}
          >
            Which programme has the most funding?
          </button>
        </div>

        <form
          className="chat-input-row"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage();
          }}
        >
          <input
            aria-label="Ask the Compass assistant"
            placeholder="Ask about grants or funding..."
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
          />
          <button
            className="send-button"
            type="submit"
            aria-label="Send message"
            disabled={!chatInput.trim()}
          >
            <Send size={17} />
          </button>
        </form>
      </section>
    );
  }

  const pageDescription: Record<Page, string> = {
    Overview: "Monitor funding, programme performance and grant delivery.",
    Grants: "Search and explore the grant portfolio.",
    Insights: "Explore regional coverage and portfolio indicators.",
    "AI Assistant": "Ask questions about the demonstration dataset.",
  };

  const connectionLabel =
    apiStatus === "loading"
      ? "Connecting..."
      : apiStatus === "connected"
        ? "API connected"
        : "API offline · Demo data";

  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Command size={23} />
          </div>
          <div>
            <strong>compass</strong>
            <span>IMPACT INTELLIGENCE</span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <button
          className="workspace-switch"
          onClick={() =>
            setRole((previous) =>
              previous === "Programme Officer"
                ? "Administrator"
                : "Programme Officer"
            )
          }
        >
          <span className="workspace-avatar">L</span>
          <span className="workspace-copy">
            <strong>LIF Foundation</strong>
            <small>{role}</small>
          </span>
          <ChevronDown size={16} />
        </button>

        <div className="nav-label">ANALYTICS</div>

        <nav className="main-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`nav-item ${page === item.label ? "active" : ""}`}
                onClick={() => {
                  setPage(item.label);
                  setMobileMenu(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.label === "AI Assistant" && (
                  <span className="nav-new">AI</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <CircleHelp size={18} />
            <span>
              <strong>Need help?</strong>
              <small>Explore the demo dashboard</small>
            </span>
          </div>

          <button className="nav-item" onClick={() => setPage("Insights")}>
            <Settings2 size={18} />
            <span>Settings & indicators</span>
          </button>

          <div className="user-profile">
            <div className="user-avatar">AD</div>
            <span>
              <strong>Analytics Demo</strong>
              <small>{role}</small>
            </span>
            <ShieldCheck size={17} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenu(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{page}</strong>
          </div>

          <div className="topbar-actions">
            <span className="data-status">
              <span className="online-dot" />
              {connectionLabel}
            </span>
            <button
              className="help-button"
              title="Open AI assistant"
              aria-label="Open AI assistant"
              onClick={() => setPage("AI Assistant")}
            >
              <Bot size={19} />
            </button>
            <div className="user-avatar top-avatar">AD</div>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                LIF FOUNDATION · ANALYTICS
              </div>
              <h1>
                {page === "Overview"
                  ? "Portfolio overview"
                  : page === "AI Assistant"
                    ? "Ask Compass"
                    : page}
              </h1>
              <p>{pageDescription[page]}</p>
            </div>

            <div className="heading-actions">
              <span className="date-pill">
                <Clock3 size={15} />
                FY 2026
              </span>
              <button className="button button-primary" onClick={downloadCsv}>
                <Download size={16} />
                Export data
              </button>
            </div>
          </section>

          {page === "Overview" && renderDashboard()}

          {page === "Grants" && (
            <section className="panel grants-panel standalone-grants">
              <div className="panel-heading">
                <div>
                  <h3>All grants</h3>
                  <p>
                    {filteredGrants.length} grants match the current filters.
                  </p>
                </div>
                <button className="button button-outline" onClick={downloadCsv}>
                  <Download size={16} /> Export CSV
                </button>
              </div>
              {renderFilters()}
              {renderGrantTable(filteredGrants)}
            </section>
          )}

          {page === "Insights" && renderInsights()}

          {page === "AI Assistant" && renderChat()}

          <footer className="page-footer">
            <span>Compass · Grant Analytics Prototype</span>
            <span>
              {apiStatus === "connected"
                ? "Database-backed grant records · Illustrative data"
                : apiStatus === "loading"
                  ? "Connecting to the local API..."
                  : "Showing fallback demo data · API unavailable"}
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
