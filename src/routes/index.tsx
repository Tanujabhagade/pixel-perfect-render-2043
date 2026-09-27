import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast, Toaster } from "sonner";
import {
  Activity, AlertTriangle, ArrowDown, ArrowLeft, ArrowRight, BarChart3, Bell,
  Building2, Camera, Check, CheckCircle2, ChevronDown, CircleHelp, ClipboardList,
  Clock3, Compass, FileText, Filter, Gauge, HardHat, ImagePlus, Layers3, LocateFixed,
  MapPin, Menu, Plus, Search, ShieldCheck, Sparkles, TrendingUp, Upload, Users,
  Waves, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createDemoIssues, departments, categories, initialNotifications, type CivicIssue, type CivicRole, type CivicStatus } from "@/lib/civic-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CivicPulse | Smarter Civic Infrastructure" },
      { name: "description", content: "From citizen reports to smarter cities. Report issues, track resolutions, and help improve your city." },
      { property: "og:title", content: "CivicPulse | Smarter Civic Infrastructure" },
      { property: "og:description", content: "From citizen reports to smarter cities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CivicPulse,
});

type View = "home" | "dashboard" | "report" | "reports" | "detail" | "map" | "intelligence" | "admin" | "notifications";
const nav = [
  { id: "dashboard", label: "Overview", icon: Gauge },
  { id: "reports", label: "Issue queue", icon: ClipboardList },
  { id: "map", label: "Civic map", icon: MapPin },
  { id: "intelligence", label: "Civic intelligence", icon: BarChart3 },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;
const prettyStatus = (status: CivicStatus) => status === "AWAITING CITIZEN VERIFICATION" ? "Awaiting verification" : status.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const statusStyle = (status: CivicStatus) => status === "RESOLVED" ? "bg-emerald-50 text-emerald-700" : status === "IN PROGRESS" || status === "ASSIGNED" ? "bg-sky-50 text-sky-700" : status === "AWAITING CITIZEN VERIFICATION" ? "bg-violet-50 text-violet-700" : status === "REOPENED" || status === "REJECTED" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800";
const priorityStyle = (priority: CivicIssue["priority"]) => priority === "Critical" ? "bg-rose-100 text-rose-800" : priority === "High" ? "bg-orange-100 text-orange-800" : priority === "Medium" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700";

function CivicPulse() {
  const [role, setRole] = useState<CivicRole | null>(null);
  const [view, setView] = useState<View>("home");
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [selectedId, setSelectedId] = useState("CIV-2026-00124");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All issues");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [mobileNav, setMobileNav] = useState(false);
  const [newIssueId, setNewIssueId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("civicpulse-demo");
    if (stored) {
      try {
        const state = JSON.parse(stored);
        if (state.role) setRole(state.role);
        if (state.issues?.length) setIssues(state.issues);
      } catch { /* Use fresh demo data if the saved demo state is unavailable. */ }
    }
    if (!issues.length) setIssues(createDemoIssues());
  }, []);

  useEffect(() => {
    if (!issues.length) return;
    localStorage.setItem("civicpulse-demo", JSON.stringify({ role, issues }));
  }, [issues, role]);

  const activeIssues = issues.length ? issues : createDemoIssues();
  const selectedIssue = activeIssues.find((issue) => issue.id === selectedId) ?? activeIssues[0];
  const visibleIssues = useMemo(() => activeIssues.filter((issue) => {
    const matchesSearch = `${issue.id} ${issue.title} ${issue.category} ${issue.location} ${issue.ward} ${issue.department} ${issue.status}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All issues" || issue.status === filter.toUpperCase() || (filter === "Open" && ["NEW", "UNDER REVIEW", "ASSIGNED", "REOPENED"].includes(issue.status));
    return matchesSearch && matchesFilter;
  }), [activeIssues, search, filter]);

  const enterRole = (nextRole: CivicRole) => {
    setRole(nextRole);
    setView("dashboard");
    setMobileNav(false);
    toast.success(`Viewing CivicPulse as ${nextRole === "officer" ? "Municipal Officer" : nextRole === "admin" ? "Administrator" : "Citizen"}`);
  };
  const changeStatus = (id: string, status: CivicStatus) => {
    setIssues((current) => current.map((issue) => issue.id === id ? { ...issue, status } : issue));
    toast.success(`Issue updated to ${prettyStatus(status)}`);
  };
  const openIssue = (id: string) => { setSelectedId(id); setView("detail"); };

  if (!role && view === "home") return <Landing onSelectRole={enterRole} onGoMap={() => { setRole("citizen"); setView("map"); }} />;

  return (
    <div className="civic-shell flex">
      <Toaster position="top-right" richColors />
      <aside className={`${mobileNav ? "fixed inset-y-0 left-0 z-40 flex" : "hidden"} w-[250px] shrink-0 flex-col border-r border-border bg-card px-5 py-6 md:sticky md:top-0 md:flex md:h-screen`}>
        <div className="flex items-center gap-3 pb-9">
          <img src="/civicpulse.svg" alt="" className="h-10 w-10 rounded-lg" />
          <div><div className="text-[17px] font-bold leading-tight tracking-[-0.3px]">CivicPulse</div><div className="mt-1 text-[10px] font-semibold uppercase tracking-[1.25px] text-muted-foreground">City operations</div></div>
          <Button variant="ghost" size="icon" className="ml-auto md:hidden" aria-label="Close navigation" onClick={() => setMobileNav(false)}><X /></Button>
        </div>
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.3px] text-muted-foreground">Workspace</div>
        <nav className="space-y-1">
          {nav.map(({ id, label, icon: Icon }) => <Button key={id} variant="ghost" className={`h-10 w-full justify-start gap-3 rounded-md px-3 text-[13px] ${view === id || (id === "reports" && view === "detail") ? "bg-accent font-semibold text-accent-foreground" : "text-muted-foreground"}`} onClick={() => { setView(id); setMobileNav(false); }}><Icon className="h-[17px] w-[17px]" />{label}{id === "notifications" && <span className="ml-auto h-2 w-2 rounded-full bg-orange-500" />}</Button>)}
        </nav>
        {role === "admin" && <><div className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[1.3px] text-muted-foreground">Administration</div><Button variant="ghost" className={`h-10 w-full justify-start gap-3 rounded-md px-3 text-[13px] ${view === "admin" ? "bg-accent font-semibold text-accent-foreground" : "text-muted-foreground"}`} onClick={() => setView("admin")}><Building2 className="h-[17px] w-[17px]" />Manage city</Button></>}
        <div className="mt-auto border-t border-border pt-5">
          <div className="mb-4 flex items-center gap-3 px-2"><div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-semibold text-primary">{role === "officer" ? "MO" : role === "admin" ? "AD" : "RS"}</div><div className="min-w-0"><div className="truncate text-[13px] font-semibold">{role === "officer" ? "Municipal Officer" : role === "admin" ? "City Administrator" : "Rahul Sharma"}</div><div className="mt-0.5 text-[11px] text-muted-foreground">Pune Municipal · Demo</div></div></div>
          <Button variant="outline" className="h-9 w-full justify-between border-border text-xs" onClick={() => { setRole(null); setView("home"); }}><span>Switch demo role</span><ChevronDown className="h-4 w-4" /></Button>
          <div className="mt-4 flex items-center gap-2 px-2 text-[10px] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Demo environment</div>
        </div>
      </aside>
      {mobileNav && <button className="fixed inset-0 z-30 bg-foreground/30 md:hidden" aria-label="Close menu" onClick={() => setMobileNav(false)} />}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[66px] items-center border-b border-border bg-card/95 px-4 backdrop-blur md:px-8">
          <Button variant="ghost" size="icon" aria-label="Open menu" className="mr-2 md:hidden" onClick={() => setMobileNav(true)}><Menu /></Button>
          <div className="relative w-full max-w-[460px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search issues, locations, wards…" className="h-9 border-0 bg-muted pl-9 text-[13px] shadow-none focus-visible:ring-1" /></div>
          <div className="ml-auto flex items-center gap-2"><span className="hidden rounded-sm bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-accent-foreground sm:inline">Demo mode</span><Button variant="ghost" size="icon" className="relative" aria-label="Notifications" onClick={() => setView("notifications")}><Bell className="h-[18px] w-[18px]" />{notifications.some((item) => item.unread) && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-card" />}</Button></div>
        </header>
        <div className="mx-auto max-w-[1450px] px-4 py-7 md:px-8 md:py-8">
          {view === "dashboard" && <Dashboard role={role ?? "citizen"} issues={activeIssues} onReport={() => setView("report")} onIssue={openIssue} onViewAll={() => setView("reports")} />}
          {view === "report" && <ReportWizard onCancel={() => setView("dashboard")} onSubmit={(issue) => { setIssues((current) => [issue, ...current]); setNewIssueId(issue.id); setSelectedId(issue.id); setView("detail"); toast.success("Your civic report was submitted"); }} />}
          {view === "reports" && <IssueQueue role={role ?? "citizen"} issues={visibleIssues} search={search} filter={filter} onFilter={setFilter} onIssue={openIssue} />}
          {view === "detail" && selectedIssue && <IssueDetail issue={selectedIssue} role={role ?? "citizen"} isNew={newIssueId === selectedIssue.id} onBack={() => setView("reports")} onStatus={(status) => changeStatus(selectedIssue.id, status)} />}
          {view === "map" && <CivicMap issues={visibleIssues} search={search} onIssue={openIssue} />}
          {view === "intelligence" && <Intelligence issues={activeIssues} />}
          {view === "admin" && <AdminDashboard issues={activeIssues} />}
          {view === "notifications" && <Notifications items={notifications} onRead={(id) => setNotifications((items) => items.map((item) => item.id === id ? { ...item, unread: false } : item))} />}
        </div>
      </main>
    </div>
  );
}

function Landing({ onSelectRole, onGoMap }: { onSelectRole: (role: CivicRole) => void; onGoMap: () => void }) {
  const [showRoles, setShowRoles] = useState(false);
  return <div className="min-h-screen bg-card text-foreground">
    <Toaster position="top-right" richColors />
    <header className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between px-5"><div className="flex items-center gap-3"><img src="/civicpulse.svg" alt="CivicPulse" className="h-10 w-10 rounded-lg" /><span className="text-[18px] font-bold">CivicPulse</span></div><div className="flex items-center gap-2"><Button variant="ghost" className="hidden text-sm text-muted-foreground sm:inline-flex" onClick={onGoMap}>Explore civic map</Button><Button className="h-10 px-5" onClick={() => setShowRoles(true)}>Open demo <ArrowRight /></Button></div></header>
    <section className="relative overflow-hidden border-y border-border bg-background">
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 py-16 md:grid-cols-[1.03fr_.97fr] md:py-[92px]">
        <div className="relative z-10"><div className="mb-7 inline-flex items-center gap-2 border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[1px] text-primary"><span className="h-2 w-2 rounded-full bg-emerald-500" />Pune · Civic infrastructure</div><h1 className="max-w-[590px] text-[48px] font-semibold leading-[1.07] tracking-[-1.3px] md:text-[62px]">From citizen reports to <span className="text-primary">smarter cities.</span></h1><p className="mt-6 max-w-[500px] text-[16px] leading-7 text-muted-foreground">One connected platform to surface local issues, direct municipal action, and keep residents informed every step of the way.</p><div className="mt-8 flex flex-wrap gap-3"><Button size="lg" className="h-12 px-5" onClick={() => setShowRoles(true)}>Report a civic issue <ArrowRight /></Button><Button size="lg" variant="outline" className="h-12" onClick={onGoMap}>Explore civic map <MapPin /></Button></div><div className="mt-9 flex items-center gap-5 text-[11px] text-muted-foreground"><span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" />Built for residents</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Transparent resolution</span></div></div>
        <div className="relative min-h-[340px] overflow-hidden border border-border bg-card p-4 shadow-sm md:min-h-[410px] md:p-5"><div className="flex items-center justify-between border-b border-border pb-4"><div><div className="text-[11px] font-bold uppercase tracking-[1px] text-muted-foreground">Pune · Live civic pulse</div><div className="mt-1 text-[14px] font-semibold">Ward activity overview</div></div><div className="flex items-center gap-1.5 text-[11px] text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Updated just now</div></div><div className="civic-map civic-grid relative mt-4 h-[220px] overflow-hidden md:h-[278px]">{[[22,28,"High"],[54,35,"Medium"],[74,20,"High"],[41,61,"Low"],[82,69,"Critical"],[26,76,"Medium"],[61,79,"High"],[89,42,"Low"]].map(([left, top, level], index) => <span key={index} className={`absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-card shadow-sm ${level === "Critical" ? "bg-rose-600" : level === "High" ? "bg-orange-500" : level === "Medium" ? "bg-amber-500" : "bg-emerald-600"}`} style={{ left: `${left}%`, top: `${top}%` }}><MapPin className="h-3.5 w-3.5 text-primary-foreground" /></span>)}<div className="absolute bottom-3 left-3 bg-card px-3 py-2 text-[10px] text-muted-foreground shadow-sm">Central Pune · Ward 12</div></div><div className="grid grid-cols-3 divide-x divide-border pt-4 text-center"><div><div className="text-[18px] font-semibold">1,284</div><div className="mt-1 text-[10px] text-muted-foreground">Reports tracked</div></div><div><div className="text-[18px] font-semibold">76%</div><div className="mt-1 text-[10px] text-muted-foreground">Resolved this month</div></div><div><div className="text-[18px] font-semibold">18</div><div className="mt-1 text-[10px] text-muted-foreground">Wards connected</div></div></div></div>
      </div>
    </section>
    <section className="mx-auto max-w-[1240px] px-5 py-14 md:py-16"><div className="flex flex-wrap items-end justify-between gap-5"><div><div className="text-[11px] font-bold uppercase tracking-[1.2px] text-primary">A clearer path to action</div><h2 className="mt-3 text-[28px] font-semibold tracking-[-.5px]">Every report moves the city forward.</h2></div><p className="max-w-[360px] text-[13px] leading-6 text-muted-foreground">From the first photo to the final verification, CivicPulse keeps the whole response connected.</p></div><div className="mt-9 grid grid-cols-2 border-l border-t border-border sm:grid-cols-4 lg:grid-cols-7">{[{ icon: Camera, title: "Report", text: "Share a local issue" }, { icon: Sparkles, title: "Understand", text: "AI-assisted review" }, { icon: AlertTriangle, title: "Prioritize", text: "Surface what matters" }, { icon: Compass, title: "Route", text: "Find the right team" }, { icon: HardHat, title: "Resolve", text: "Track real progress" }, { icon: CheckCircle2, title: "Verify", text: "Confirm the outcome" }, { icon: TrendingUp, title: "Learn", text: "Improve over time" }].map(({ icon: Icon, title, text }, index) => <div key={title} className="min-h-[135px] border-b border-r border-border p-4"><div className="flex items-center justify-between"><Icon className="h-[19px] w-[19px] text-primary" /><span className="text-[10px] text-muted-foreground">0{index + 1}</span></div><div className="mt-5 text-[13px] font-semibold">{title}</div><div className="mt-1 text-[10px] text-muted-foreground">{text}</div></div>)}</div></section>
    <section className="border-t border-border bg-background"><div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-12 md:grid-cols-[.8fr_1.2fr] md:py-14"><div><div className="text-[11px] font-bold uppercase tracking-[1.2px] text-primary">Built for better decisions</div><h2 className="mt-3 max-w-[370px] text-[27px] font-semibold leading-tight">See patterns. Respond with purpose.</h2><p className="mt-4 max-w-[390px] text-[13px] leading-6 text-muted-foreground">Understand where issues cluster, which teams need support, and what residents still need verified.</p></div><div className="grid grid-cols-2 gap-x-8 gap-y-6">{[{ icon: Layers3, title: "Connected reporting", copy: "Find nearby reports and link recurring concerns." }, { icon: Building2, title: "Smart routing", copy: "Get each issue to the right department sooner." }, { icon: Activity, title: "Resolution tracking", copy: "Follow updates from submission to verification." }, { icon: BarChart3, title: "Civic intelligence", copy: "Turn everyday reports into useful local insight." }].map(({ icon: Icon, title, copy }) => <div key={title} className="flex gap-3"><Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" /><div><div className="text-[13px] font-semibold">{title}</div><div className="mt-1 text-[11px] leading-5 text-muted-foreground">{copy}</div></div></div>)}</div></div></section>
    <footer className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-5 text-[11px] text-muted-foreground"><span>© 2026 CivicPulse · A civic technology demonstration</span><span>Prototype data · Pune Municipal</span></footer>
    {showRoles && <RoleDialog onClose={() => setShowRoles(false)} onChoose={(selected) => { setShowRoles(false); onSelectRole(selected); }} />}
  </div>;
}

function RoleDialog({ onClose, onChoose }: { onClose: () => void; onChoose: (role: CivicRole) => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/45 p-4" role="presentation" onClick={onClose}><section role="dialog" aria-modal="true" aria-labelledby="choose-role" className="w-full max-w-[470px] border border-border bg-card p-6 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[1px] text-primary">CivicPulse · Demo</div><h2 id="choose-role" className="mt-2 text-[22px] font-semibold">Choose your perspective</h2><p className="mt-1 text-[13px] text-muted-foreground">Explore the city response from a different seat.</p></div><Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}><X /></Button></div><div className="mt-6 space-y-2">{[{ role: "citizen" as const, title: "Continue as Citizen", detail: "Report and track local issues", icon: Users }, { role: "officer" as const, title: "Continue as Municipal Officer", detail: "Triage, assign and resolve reports", icon: HardHat }, { role: "admin" as const, title: "Continue as Administrator", detail: "Review city-wide operations", icon: Building2 }].map(({ role, title, detail, icon: Icon }) => <Button key={role} variant="outline" className="h-auto w-full justify-start gap-4 rounded-md p-4 text-left" onClick={() => onChoose(role)}><span className="grid h-10 w-10 shrink-0 place-items-center bg-accent text-primary"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">{title}</span><span className="mt-1 block text-[11px] font-normal text-muted-foreground">{detail}</span></span><ArrowRight className="h-4 w-4 text-muted-foreground" /></Button>)}</div><p className="mt-4 text-[10px] text-muted-foreground">Demo accounts use fictional names and local demonstration data.</p></section></div>;
}

function PageHeading({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div>{eyebrow && <div className="text-[10px] font-bold uppercase tracking-[1.25px] text-primary">{eyebrow}</div>}<h1 className="mt-1 text-[26px] font-semibold tracking-[-.5px] md:text-[30px]">{title}</h1>{subtitle && <p className="mt-1.5 text-[13px] text-muted-foreground">{subtitle}</p>}</div>{action}</div>;
}

function Stat({ label, value, note, icon: Icon, tone = "default" }: { label: string; value: string | number; note?: string; icon: typeof Activity; tone?: string }) {
  return <div className="border border-border bg-card p-4"><div className="flex items-start justify-between gap-2"><span className="text-[11px] font-medium text-muted-foreground">{label}</span><Icon className={`h-4 w-4 ${tone === "danger" ? "text-rose-600" : tone === "success" ? "text-emerald-600" : "text-primary"}`} /></div><div className="mt-2 text-[26px] font-semibold tracking-[-.5px]">{value}</div>{note && <div className="mt-1 text-[10px] text-muted-foreground">{note}</div>}</div>;
}

function Dashboard({ role, issues, onReport, onIssue, onViewAll }: { role: CivicRole; issues: CivicIssue[]; onReport: () => void; onIssue: (id: string) => void; onViewAll: () => void }) {
  const citizen = role === "citizen";
  const stats = citizen ? [
    { label: "My reports", value: 12, icon: FileText, note: "+2 this month" },
    { label: "Open", value: 3, icon: AlertTriangle, note: "1 needs attention", tone: "danger" },
    { label: "In progress", value: 4, icon: Activity, note: "Across 3 departments" },
    { label: "Resolved", value: 4, icon: CheckCircle2, note: "1 awaiting your review", tone: "success" },
  ] : [
    { label: "Total issues", value: "1,284", icon: FileText, note: "+8.4% this month" },
    { label: "Open", value: "246", icon: AlertTriangle, note: "Across all wards", tone: "danger" },
    { label: "In progress", value: "91", icon: Activity, note: "43 due within 24h" },
    { label: "Resolved", value: "876", icon: CheckCircle2, note: "76% this month", tone: "success" },
  ];
  const rows = citizen ? issues.slice(0, 5) : issues.filter((issue) => !["RESOLVED", "REJECTED"].includes(issue.status)).slice(0, 6);
  return <>
    <PageHeading eyebrow={citizen ? "Resident workspace · Pune" : "Pune Municipal Corporation · Operations"} title={citizen ? "Good morning, Rahul" : "Municipal operations"} subtitle={citizen ? "Here's what's happening with your civic reports." : "Monitor, prioritize and resolve civic infrastructure issues."} action={citizen ? <Button className="h-10" onClick={onReport}><Plus />Report an issue</Button> : <div className="flex items-center gap-2 border border-border bg-card px-3 py-2 text-[11px] text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" />Ward-wide view <ChevronDown className="h-3.5 w-3.5" /></div>} />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.map((stat) => <Stat key={stat.label} {...stat} />)}</div>
    {!citizen && <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-3"><Stat label="Overdue" value="34" icon={Clock3} note="SLA breached" tone="danger" /><Stat label="Critical" value="12" icon={AlertTriangle} note="Immediate action" tone="danger" /><Stat label="Awaiting verification" value="27" icon={CheckCircle2} note="Citizen review" tone="success" /></div>}
    <div className="mt-7 grid gap-6 xl:grid-cols-[1.45fr_.75fr]">
      <section className="min-w-0 border border-border bg-card"><div className="flex items-center justify-between border-b border-border px-4 py-4 md:px-5"><div><h2 className="text-[14px] font-semibold">{citizen ? "Recent reports" : "Priority queue"}</h2><p className="mt-1 text-[11px] text-muted-foreground">{citizen ? "Follow your latest issue updates" : "Issues needing municipal attention"}</p></div><Button variant="ghost" size="sm" onClick={onViewAll}>View all <ArrowRight /></Button></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead><tr className="border-b border-border text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{(citizen ? ["Issue", "Location", "Priority", "Status"] : ["Priority", "Issue", "Ward", "SLA", "Status"]).map((col) => <th key={col} className="px-4 py-3 font-semibold">{col}</th>)}</tr></thead><tbody>{rows.map((issue) => <tr key={issue.id} onClick={() => onIssue(issue.id)} className="cursor-pointer border-b border-border/70 last:border-0 hover:bg-muted/60">{citizen ? <><td className="px-4 py-3"><div className="text-[12px] font-semibold">{issue.title}</div><div className="mt-1 text-[10px] text-muted-foreground">{issue.id}</div></td><td className="px-4 py-3 text-[11px] text-muted-foreground">{issue.location}</td><td className="px-4 py-3"><Badge className={priorityStyle(issue.priority)}>{issue.priority}</Badge></td><td className="px-4 py-3"><Badge className={statusStyle(issue.status)}>{prettyStatus(issue.status)}</Badge></td></> : <><td className="px-4 py-3"><Badge className={priorityStyle(issue.priority)}>{issue.priority}</Badge></td><td className="px-4 py-3"><div className="text-[12px] font-semibold">{issue.title}</div><div className="mt-1 text-[10px] text-muted-foreground">{issue.id} · {issue.location}</div></td><td className="px-4 py-3 text-[11px]">{issue.ward}</td><td className="px-4 py-3 text-[11px] font-medium text-orange-700">{issue.age === "18 min" ? "18h left" : "SLA active"}</td><td className="px-4 py-3"><Badge className={statusStyle(issue.status)}>{prettyStatus(issue.status)}</Badge></td></>}</tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-border px-4 py-3 text-[10px] text-muted-foreground"><span>Showing {rows.length} of {citizen ? 12 : "246"} issues</span><Button variant="ghost" size="sm" onClick={onViewAll}>Open queue <ArrowRight /></Button></div></section>
      <section className="min-w-0 border border-border bg-card"><div className="flex items-center justify-between border-b border-border px-4 py-4"><div><h2 className="text-[14px] font-semibold">Issues near you</h2><p className="mt-1 text-[11px] text-muted-foreground">Central Pune · Ward 12</p></div><Button variant="ghost" size="icon" aria-label="Open map" onClick={onViewAll}><ArrowRight /></Button></div><div className="civic-map civic-grid relative h-[230px]">{issues.slice(0, 12).map((issue) => <button key={issue.id} aria-label={`Open ${issue.id}`} title={issue.title} onClick={() => onIssue(issue.id)} className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card shadow ${issue.priority === "Critical" ? "bg-rose-600" : issue.priority === "High" ? "bg-orange-500" : issue.priority === "Medium" ? "bg-amber-500" : "bg-emerald-600"}`} style={{ left: `${issue.left}%`, top: `${issue.top}%` }} />)}<div className="absolute bottom-3 left-3 flex gap-3 bg-card px-3 py-2 text-[9px] text-muted-foreground shadow"><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-rose-600" />Critical</span><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-orange-500" />High</span><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-amber-500" />Medium</span></div></div><div className="flex items-center justify-between p-4"><span className="text-[11px] text-muted-foreground">24 issues within 2 km</span><Button variant="outline" size="sm" onClick={onViewAll}>Explore map <MapPin /></Button></div></section>
    </div>
    <div className="mt-6 grid gap-6 md:grid-cols-2"><section className="border border-border bg-card p-5"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="text-[13px] font-semibold">Civic pulse · Ward 12</h2></div><p className="mt-3 text-[12px] leading-5 text-muted-foreground">Drainage complaints have increased <strong className="font-semibold text-foreground">42%</strong> this month. An inspection near Deccan Gymkhana may help prevent repeat flooding.</p><div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted-foreground"><span>Potential recurring issue · Demo insight</span><Button variant="link" className="h-auto p-0 text-[11px]" onClick={onViewAll}>View insights</Button></div></section><section className="border border-border bg-card p-5"><div className="flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /><h2 className="text-[13px] font-semibold">Latest updates</h2></div>{[{ text: "Your report was assigned to Road Maintenance", time: "12 min ago" }, { text: "A resolution is ready for your review", time: "1 hour ago" }].map((item) => <div key={item.text} className="mt-4 flex justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"><span className="text-[11px]">{item.text}</span><span className="shrink-0 text-[10px] text-muted-foreground">{item.time}</span></div>)}</section></div>
  </>;
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) { return <span className={`inline-flex max-w-[170px] items-center truncate rounded-sm px-2 py-1 text-[9px] font-bold uppercase tracking-[.4px] ${className}`}>{children}</span>; }

function ReportWizard({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (issue: CivicIssue) => void }) {
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState<CivicIssue["priority"]>("High");
  const [department, setDepartment] = useState(departments[0]);
  const [location, setLocation] = useState("FC Road, Pune");
  const [image, setImage] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [linked, setLinked] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const steps = ["Report", "Location", "AI analysis", "Review", "Submitted"];
  const analyze = () => {
    if (!description.trim()) { toast.error("Add a short description before analysis"); return; }
    setAnalyzing(true);
    window.setTimeout(() => { setAnalyzing(false); setStep(1); }, 1100);
  };
  const submit = () => {
    const newId = `CIV-2026-${String(Date.now()).slice(-5)}`;
    onSubmit({ id: newId, title: description.length > 48 ? `${description.slice(0, 45)}…` : description, category, location, ward: "Ward 12", department, priority, status: "NEW", age: "Just now", citizen: "Rahul Sharma", description, confidence: 94, lat: 18.5204, left: 54, top: 42 });
    setStep(4);
  };
  const loadImage = (file?: File) => { if (!file) return; if (!file.type.startsWith("image/")) { toast.error("Choose an image file to continue"); return; } setImage(URL.createObjectURL(file)); };
  return <div className="mx-auto max-w-[880px]">
    <div className="mb-6 flex items-center justify-between"><Button variant="ghost" className="-ml-3 text-muted-foreground" onClick={onCancel}><ArrowLeft />Back to overview</Button><span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Secure civic reporting</span></div>
    <PageHeading eyebrow="New civic report" title={step === 4 ? "Report submitted" : "Report an issue"} subtitle={step === 4 ? "Your report is now part of the city response." : "Help your city understand what needs attention."} />
    <div className="mb-7 flex items-center">{steps.map((label, index) => <div key={label} className="flex min-w-0 flex-1 items-center"><div className="flex min-w-0 items-center gap-2"><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${step >= index ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{step > index ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span className={`hidden text-[10px] font-medium sm:block ${step >= index ? "text-foreground" : "text-muted-foreground"}`}>{label}</span></div>{index < steps.length - 1 && <span className={`mx-2 h-px flex-1 ${step > index ? "bg-primary" : "bg-border"}`} />}</div>)}</div>
    {step === 0 && <section className="border border-border bg-card p-5 md:p-7"><h2 className="text-[15px] font-semibold">What needs attention?</h2><p className="mt-1 text-[12px] text-muted-foreground">A photo and a few details help the right team respond.</p><div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); loadImage(event.dataTransfer.files[0]); }} className="mt-5 grid min-h-[210px] place-items-center border border-dashed border-border bg-background p-4 text-center">{image ? <div className="relative"><img src={image} alt="Selected civic issue" className="max-h-[220px] max-w-full object-contain" /><Button variant="outline" size="sm" className="mt-3" onClick={() => { setImage(""); if (fileRef.current) fileRef.current.value = ""; }}>Remove photo</Button></div> : <div><div className="mx-auto grid h-12 w-12 place-items-center border border-border bg-card text-primary"><ImagePlus className="h-5 w-5" /></div><div className="mt-3 text-[13px] font-semibold">Add a photo of the issue</div><div className="mt-1 text-[11px] text-muted-foreground">Drop an image here or choose from your device</div><div className="mt-4 flex justify-center gap-2"><Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload />Upload photo</Button><Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Camera />Use camera</Button></div></div>}<input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => loadImage(event.target.files?.[0])} /></div><label className="mt-5 block text-[12px] font-semibold" htmlFor="issue-description">Describe the civic problem <span className="text-rose-600">*</span></label><Textarea id="issue-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="There is a large pothole near the school entrance and several bikes are having difficulty passing." className="mt-2 min-h-[105px] resize-y bg-card text-[13px]" /><p className="mt-2 text-[10px] text-muted-foreground">Be specific about what you noticed and how it affects the area.</p><div className="mt-6 flex justify-end"><Button className="h-10" disabled={analyzing} onClick={analyze}>{analyzing ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Analyzing issue…</> : <>Analyze with AI <Sparkles /></>}</Button></div></section>}
    {step === 1 && <section className="border border-border bg-card p-5 md:p-7"><h2 className="text-[15px] font-semibold">Confirm the issue location</h2><p className="mt-1 text-[12px] text-muted-foreground">A nearby address helps route the report to the right ward.</p><div className="mt-5 flex flex-col gap-2 sm:flex-row"><Input value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Search location" placeholder="Search street, landmark or area" className="h-10" /><Button variant="outline" className="h-10 shrink-0" onClick={() => { setLocation("FC Road, Pune"); toast.success("Using demo location near FC Road"); }}><LocateFixed />Use current location</Button></div><div className="civic-map civic-grid relative mt-4 h-[300px] overflow-hidden border border-border">{["FC Road, Pune", "Deccan Gymkhana", "Shivajinagar", "JM Road"].map((place, index) => <button key={place} className={`absolute flex items-center gap-1.5 border px-2 py-1.5 text-[10px] shadow-sm ${location === place ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`} style={{ left: `${[28, 57, 41, 72][index]}%`, top: `${[32, 54, 72, 25][index]}%` }} onClick={() => setLocation(place)}><MapPin className="h-3 w-3" />{place}</button>)}</div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{[{ label: "Address", value: location }, { label: "Ward", value: "Ward 12" }, { label: "Latitude", value: "18.5204° N" }, { label: "Longitude", value: "73.8567° E" }].map((item) => <div key={item.label} className="border border-border p-3"><div className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{item.label}</div><div className="mt-1 truncate text-[11px] font-medium">{item.value}</div></div>)}</div><div className="mt-6 flex justify-between"><Button variant="outline" onClick={() => setStep(0)}><ArrowLeft />Back</Button><Button onClick={() => setStep(2)}>Continue <ArrowRight /></Button></div></section>}
    {step === 2 && <section className="border border-border bg-card p-5 md:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-[15px] font-semibold">AI analysis · Review suggestions</h2><p className="mt-1 text-[12px] text-muted-foreground">Demo analysis · Suggestions are editable before submission.</p></div><span className="flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" />94% confidence</span></div><div className="mt-5 grid gap-5 md:grid-cols-[.8fr_1.2fr]">{image ? <img src={image} alt="Issue evidence" className="h-[200px] w-full object-cover" /> : <div className="civic-map grid h-[200px] place-items-center text-primary"><MapPin className="h-8 w-8" /></div>}<div className="grid grid-cols-2 gap-3">{[{ label: "Category", value: category, options: categories, change: setCategory }, { label: "Severity", value: priority, options: ["Critical", "High", "Medium", "Low"], change: (value: string) => setPriority(value as CivicIssue["priority"]) }, { label: "Department", value: department, options: departments, change: setDepartment }].map((item) => <label key={item.label} className="block"><span className="text-[10px] font-semibold text-muted-foreground">{item.label}</span><select aria-label={item.label} value={item.value} onChange={(event) => item.change(event.target.value)} className="mt-1 block h-10 w-full border border-input bg-background px-2 text-[11px] outline-none focus:border-primary">{item.options.map((option) => <option key={option}>{option}</option>)}</select></label>)}<div className="border border-border bg-accent/50 p-3"><div className="text-[9px] font-bold uppercase text-muted-foreground">Detected signals</div><div className="mt-2 flex flex-wrap gap-1">{["Pothole", "Road safety", "Traffic"].map((tag) => <span key={tag} className="bg-card px-2 py-1 text-[9px]">{tag}</span>)}</div></div></div></div><label className="mt-5 block text-[11px] font-semibold">Report description</label><Textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-[85px] text-[12px]" /><div className="mt-4 border-l-2 border-primary bg-background px-4 py-3 text-[11px] leading-5 text-muted-foreground">Potentially 3 similar reports found nearby. AI suggestions are simulated for this demonstration.</div><div className="mt-6 flex flex-wrap justify-between gap-2"><Button variant="outline" onClick={() => setStep(1)}><ArrowLeft />Location</Button><div className="flex gap-2"><Button variant="outline" onClick={() => { setLinked(true); toast.success("Linked to the nearby pothole report"); }}>Link similar issue</Button><Button onClick={() => { setConfirmed(true); setStep(3); }}>Confirm analysis <ArrowRight /></Button></div></div>{linked && <p className="mt-3 text-right text-[10px] text-emerald-700">Linked to CIV-2026-00119</p>}{confirmed && <span className="sr-only">Analysis confirmed</span>}</section>}
    {step === 3 && <section className="border border-border bg-card p-5 md:p-7"><h2 className="text-[15px] font-semibold">Review your report</h2><p className="mt-1 text-[12px] text-muted-foreground">Check the details before sending this to the city team.</p><div className="mt-5 grid gap-5 sm:grid-cols-[220px_1fr]">{image ? <img src={image} alt="Your uploaded civic issue" className="h-[170px] w-full object-cover" /> : <div className="civic-map grid h-[170px] place-items-center"><MapPin className="h-8 w-8 text-primary" /></div>}<div><div className="flex flex-wrap gap-2"><Badge className={priorityStyle(priority)}>{priority} priority</Badge><Badge className="bg-accent text-accent-foreground">94% AI confidence</Badge></div><h3 className="mt-3 text-[15px] font-semibold">{category}</h3><p className="mt-2 text-[12px] leading-5 text-muted-foreground">{description}</p><div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3"><div><div className="text-[9px] uppercase text-muted-foreground">Location</div><div className="mt-1 text-[11px] font-medium">{location} · Ward 12</div></div><div><div className="text-[9px] uppercase text-muted-foreground">Assigned team</div><div className="mt-1 text-[11px] font-medium">{department}</div></div></div></div></div><div className="mt-5 border border-border p-4"><div className="flex items-center gap-2 text-[12px] font-semibold"><Layers3 className="h-4 w-4 text-primary" />Similar reports nearby</div><p className="mt-2 text-[11px] text-muted-foreground">3 reports found within 500 m · Closest match 91% similar</p><div className="mt-3 flex flex-wrap gap-2">{["CIV-2026-00119 · 120 m", "CIV-2026-00107 · 280 m", "CIV-2026-00098 · 420 m"].map((item) => <span key={item} className="border border-border px-2 py-1.5 text-[10px]">{item}</span>)}</div></div><div className="mt-6 flex justify-between"><Button variant="outline" onClick={() => setStep(2)}><ArrowLeft />Edit details</Button><Button onClick={submit}>Submit civic report <ArrowRight /></Button></div></section>}
    {step === 4 && <section className="border border-border bg-card px-5 py-10 text-center md:py-14"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check className="h-8 w-8" /></div><div className="mt-5 text-[10px] font-bold uppercase tracking-[1.3px] text-emerald-700">Report received</div><h2 className="mt-2 text-[24px] font-semibold">Your civic issue has been reported.</h2><p className="mx-auto mt-2 max-w-[430px] text-[13px] leading-6 text-muted-foreground">The {department} team can now review your {category.toLowerCase()} report. We’ll keep you updated as it moves forward.</p><div className="mx-auto mt-7 max-w-[470px] border border-border bg-background p-4"><div className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Complaint ID</div><div className="mt-1 text-[21px] font-semibold tracking-[.3px]">{selectedIssue.id}</div><div className="mt-4 grid grid-cols-3 divide-x divide-border border-t border-border pt-4 text-[10px]"><div><span className="block text-muted-foreground">Category</span><span className="mt-1 block truncate font-semibold">{category.split(" /")[0]}</span></div><div><span className="block text-muted-foreground">Location</span><span className="mt-1 block truncate font-semibold">{location}</span></div><div><span className="block text-muted-foreground">Status</span><span className="mt-1 block font-semibold">New</span></div></div></div><div className="mt-6 flex flex-wrap justify-center gap-2"><Button onClick={onCancel}>Track report <ArrowRight /></Button><Button variant="outline" onClick={() => window.location.reload()}>Report another issue</Button></div><p className="mt-5 text-[10px] text-muted-foreground">Your report will be visible to the municipal response team.</p></section>}
  </div>;
}