import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Home, ChevronLeft, ClipboardList, Settings as SettingsIcon, Clock, LogOut, History } from "lucide-react";

import LoginScreen from "./components/LoginScreen";
import HomeMenu from "./components/HomeMenu";
import InspectionTypeSelection from "./components/InspectionTypeSelection";
import DepartmentSelection from "./components/DepartmentSelection";
import ProjectEntitySelection from "./components/ProjectEntitySelection";
import ModuleSelection from "./components/ModuleSelection";
import Dashboard from "./components/Dashboard";
import ReportsHome from "./components/ReportsHome";
import ReportsBrowser from "./components/ReportsBrowser";
import SettingsScreen from "./components/SettingsScreen";
import FireHoseReelInspection from "./components/FireHoseReelInspection";
import FireExtinguisherInspection from "./components/FireExtinguisherInspection";
import ElectricalToolsInspection from "./components/ElectricalToolsInspection";
import PortableToolsInspection from "./components/PortableToolsInspection";
import LadderInspection from "./components/LadderInspection";
import HandToolsInspection from "./components/HandToolsInspection";
import SafetyHarnessInspection from "./components/SafetyHarnessInspection";
import ScaffoldingInspection from "./components/ScaffoldingInspection";
import StoreInspection from "./components/StoreInspection";
import HazardAspectReport from "./components/HazardAspectReport";
import RecentInspections from "./components/RecentInspections";
import ActivityLog from "./components/ActivityLog";
import HSEInspectionReport from "./components/HSEInspectionReport";
import CorrectiveActionRequest from "./components/CorrectiveActionRequest";
import IncidentReport from "./components/IncidentReport";
import IncidentInvestigationReport from "./components/IncidentInvestigationReport";
import DisciplinaryWarning from "./components/DisciplinaryWarning";

const BRAND_BLUE = "#1B3C74";

const MODULE_COMPONENTS = {
  fhr: { Component: FireHoseReelInspection, label: "Fire Hose Reel Inspection" },
  fe: { Component: FireExtinguisherInspection, label: "Fire Extinguisher Inspection" },
  et: { Component: ElectricalToolsInspection, label: "Electrical Tools Inspection" },
  pt: { Component: PortableToolsInspection, label: "Portable Tools Inspection" },
  ldr: { Component: LadderInspection, label: "Ladder Inspection" },
  ht: { Component: HandToolsInspection, label: "Hand Tools Inspection" },
  sh: { Component: SafetyHarnessInspection, label: "Safety Harness Inspection" },
  sc: { Component: ScaffoldingInspection, label: "Mobile Scaffolding Inspection" },
  si: { Component: StoreInspection, label: "Store Inspection" },
  ha: { Component: HazardAspectReport, label: "Hazard / Aspect Report" },
  hse: { Component: HSEInspectionReport, label: "HSE Inspection Report" },
  car: { Component: CorrectiveActionRequest, label: "Corrective Action Request" },
  ir: { Component: IncidentReport, label: "Incident Report" },
  iir: { Component: IncidentInvestigationReport, label: "Incident Investigation Report" },
  dw: { Component: DisciplinaryWarning, label: "Disciplinary Warning" },
};

// Every screen except login shows the shared top bar (hamburger + settings).
const WRAPPED_ROUTES = new Set([
  "home", "inspectionType", "department", "projectEntity", "moduleSelection",
  "module", "dashboard", "reportsHome", "reportsBrowser", "settings", "recentInspections", "activity",
]);

function TopBar({ onGoHome, onGoBack, onGoReports, onGoRecent, onGoActivity, onLogout, onOpenSettings, canGoBack }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", background: BRAND_BLUE,
      }}>
        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: 4, display: "flex" }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div style={{ color: "#fff", fontSize: 12.5, opacity: 0.85 }}>Joseph Group HSE</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            aria-label="Back"
            onClick={onGoBack}
            disabled={!canGoBack}
            style={{
              background: "transparent", border: "none", color: "#fff", cursor: canGoBack ? "pointer" : "default",
              padding: 4, display: "flex", opacity: canGoBack ? 1 : 0.4,
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            aria-label="Settings"
            onClick={onOpenSettings}
            style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: 4, display: "flex" }}
          >
            <SettingsIcon size={19} />
          </button>
        </div>
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20,
          background: "#fff", borderBottom: "1px solid #e5e2d8", boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        }}>
          <button onClick={() => { setOpen(false); onGoHome(); }} style={menuItemStyle}>
            <Home size={16} color={BRAND_BLUE} /> Home
          </button>
          <button
            onClick={() => { setOpen(false); onGoBack(); }}
            disabled={!canGoBack}
            style={{ ...menuItemStyle, opacity: canGoBack ? 1 : 0.4, cursor: canGoBack ? "pointer" : "default" }}
          >
            <ChevronLeft size={16} color={BRAND_BLUE} /> Back
          </button>
          <button onClick={() => { setOpen(false); onGoReports(); }} style={menuItemStyle}>
            <ClipboardList size={16} color={BRAND_BLUE} /> Reports
          </button>
          <button onClick={() => { setOpen(false); onGoRecent(); }} style={menuItemStyle}>
            <Clock size={16} color={BRAND_BLUE} /> Recent Inspection
          </button>
          <button onClick={() => { setOpen(false); onGoActivity(); }} style={menuItemStyle}>
            <History size={16} color={BRAND_BLUE} /> Activity
          </button>
          <button onClick={() => { setOpen(false); onLogout(); }} style={{ ...menuItemStyle, borderBottom: "none" }}>
            <LogOut size={16} color={BRAND_BLUE} /> Log Out
          </button>
        </div>
      )}
    </div>
  );
}

const menuItemStyle = {
  width: "100%", display: "flex", alignItems: "center", gap: 10,
  padding: "13px 16px", background: "transparent", border: "none", borderBottom: "1px solid #f0eee7",
  fontSize: 13.5, color: "#2c2c2a", textAlign: "left", cursor: "pointer",
};

export default function App() {
  // navStack: history of screens actually visited, so the hamburger "Back"
  // button can step back one screen at a time.
  const [navStack, setNavStack] = useState([{ route: "login" }]);
  const current = navStack[navStack.length - 1];

  const isInternalPop = useRef(false);
  const NAV_STATE_KEY = "jg_hse_nav_state";

  // Persist the navigation stack on every change, so a refresh (which reloads
  // the whole page) can restore the exact screen instead of dropping back to
  // Login. Restoration below only happens if a real login session still exists.
  useEffect(() => {
    try {
      sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(navStack));
    } catch (e) {
      // storage full or unavailable; refresh will fall back to Login, which is safe
    }
  }, [navStack]);

  useEffect(() => {
    async function restoreNav() {
      try {
        const raw = sessionStorage.getItem(NAV_STATE_KEY);
        if (!raw) return;
        const stack = JSON.parse(raw);
        if (!Array.isArray(stack) || stack.length === 0) return;
        if (stack.length === 1 && stack[0].route === "login") return;
        const res = await window.storage.get("current_session", true);
        if (!res) return;
        setNavStack(stack);
      } catch (e) {
        // no valid saved state; stay on Login
      }
    }
    restoreNav();
  }, []);

  function pushEntry(entry) {
    setNavStack((prev) => [...prev, entry]);
    try {
      window.history.pushState({ appNav: true }, "");
    } catch (e) {}
  }

  function resetTo(entry) {
    setNavStack([entry]);
    try {
      window.history.pushState({ appNav: true }, "");
    } catch (e) {}
  }

  // Hardware/gesture back button: never closes the app. Returns to the Home
  // menu (Start Inspection / Dashboard / Reports) unless already on Home or Login.
  useEffect(() => {
    function handlePopState() {
      if (isInternalPop.current) {
        isInternalPop.current = false;
        return;
      }
      setNavStack((prev) => {
        const cur = prev[prev.length - 1];
        if (cur.route === "login" || cur.route === "home") return prev;
        return [{ route: "home" }];
      });
      try {
        window.history.pushState({ appNav: true }, "");
      } catch (e) {}
    }
    window.addEventListener("popstate", handlePopState);
    try {
      window.history.pushState({ appNav: true }, "");
    } catch (e) {}
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function handleLoginSuccess() {
    resetTo({ route: "home" });
  }

  function handleHomeSelect(key) {
    if (key === "startInspection") pushEntry({ route: "inspectionType" });
    else if (key === "dashboard") pushEntry({ route: "dashboard" });
    else if (key === "reports") pushEntry({ route: "reportsHome" });
  }

  function handleInspectionTypeSelect(type) {
    if (type === "factory") pushEntry({ route: "department" });
    else if (type === "projects") pushEntry({ route: "projectEntity" });
  }

  function handleDepartmentChosen(deptCode) {
    pushEntry({
      route: "moduleSelection",
      deptContext: { departmentCode: deptCode, projectName: null, projectNo: null },
    });
  }

  function handleProjectEntityContinue(entityCode, extra) {
    pushEntry({
      route: "moduleSelection",
      deptContext: { departmentCode: entityCode, projectName: extra.projectName, projectNo: extra.projectNo },
    });
  }

  function handleSelectModule(moduleKey) {
    const ctx = current.deptContext || {};
    pushEntry({
      route: "module",
      moduleKey,
      initialDepartment: ctx.departmentCode,
      initialProjectName: ctx.projectName,
      initialProjectNo: ctx.projectNo,
    });
  }

  async function handleLogout() {
    try {
      await window.storage.delete("current_session", true);
    } catch (e) {}
    resetTo({ route: "login" });
  }

  function handleGoHome() {
    pushEntry({ route: "home" });
  }

  function handleGoReports() {
    pushEntry({ route: "reportsHome" });
  }

  function handleGoRecent() {
    pushEntry({ route: "recentInspections" });
  }

  function handleGoActivity() {
    pushEntry({ route: "activity" });
  }

  function handleOpenSettings() {
    pushEntry({ route: "settings" });
  }

  function handleSelectReportsMode(mode) {
    pushEntry({ route: "reportsBrowser", mode });
  }

  function handleHamburgerBack() {
    setNavStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  function handleOpenReport(moduleKey, fullReport) {
    pushEntry({ route: "module", moduleKey, initialReport: fullReport, initialScreen: "preview" });
  }

  function handleEditReport(moduleKey, fullReport) {
    pushEntry({ route: "module", moduleKey, initialReport: fullReport, initialScreen: "form" });
  }

  const showTopBar = WRAPPED_ROUTES.has(current.route);
  const canGoBack = navStack.length > 1;

  return (
    <div>
      {showTopBar && (
        <TopBar
          onGoHome={handleGoHome}
          onGoBack={handleHamburgerBack}
          onGoReports={handleGoReports}
          onGoRecent={handleGoRecent}
          onGoActivity={handleGoActivity}
          onLogout={handleLogout}
          onOpenSettings={handleOpenSettings}
          canGoBack={canGoBack}
        />
      )}

      {current.route === "login" && <LoginScreen onLoginSuccess={handleLoginSuccess} />}

      {current.route === "home" && <HomeMenu onSelect={handleHomeSelect} />}

      {current.route === "inspectionType" && (
        <InspectionTypeSelection onSelect={handleInspectionTypeSelect} />
      )}

      {current.route === "department" && (
        <DepartmentSelection onSelectDepartment={handleDepartmentChosen} />
      )}

      {current.route === "projectEntity" && (
        <ProjectEntitySelection onContinue={handleProjectEntityContinue} />
      )}

      {current.route === "moduleSelection" && (
        <ModuleSelection onSelectModule={handleSelectModule} />
      )}

      {current.route === "dashboard" && (
        <Dashboard onOpenSettings={handleOpenSettings} onLogout={handleLogout} />
      )}

      {current.route === "reportsHome" && (
        <ReportsHome onSelect={handleSelectReportsMode} />
      )}

      {current.route === "recentInspections" && (
        <RecentInspections onOpenReport={handleOpenReport} />
      )}

      {current.route === "activity" && (
        <ActivityLog />
      )}

      {current.route === "reportsBrowser" && (
        <ReportsBrowser mode={current.mode} onOpenReport={handleOpenReport} />
      )}

      {current.route === "settings" && (
        <SettingsScreen onEditReport={handleEditReport} />
      )}

      {current.route === "module" && current.moduleKey && MODULE_COMPONENTS[current.moduleKey] && (() => {
        const { Component, label } = MODULE_COMPONENTS[current.moduleKey];
        return (
          <div>
            <div style={{
              padding: "8px 16px", background: "#FAF9F5", borderBottom: "1px solid #e5e2d8",
              fontSize: 12, color: "#5b594e", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
            }}>
              {label}
            </div>
            <Component
              initialDepartment={current.initialDepartment}
              initialReport={current.initialReport}
              initialScreen={current.initialScreen}
              initialProjectName={current.initialProjectName}
              initialProjectNo={current.initialProjectNo}
            />
          </div>
        );
      })()}
    </div>
  );
}
