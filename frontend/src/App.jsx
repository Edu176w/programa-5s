import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  LayoutDashboard, Factory, ClipboardList, CalendarRange, Users, Settings as SettingsIcon,
  Plus, X, Camera, ChevronRight, ChevronLeft, ChevronDown, Search, Download, Upload,
  Trash2, Pencil, Check, CheckCircle2, AlertTriangle, Clock, TrendingUp, ArrowLeft,
  Filter, Save, RotateCcw, Loader2, WifiOff, Wrench, Briefcase, Truck, ClipboardCheck,
  BarChart3, ListChecks, Building2, ImagePlus, ImageOff, CalendarDays, UserRound,
  ShieldCheck, Menu, Cloud, CircleAlert, FolderOpen, ChevronUp, MapPin, FileDown, FileUp
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  LineChart, Line, Legend, Cell,
} from "recharts";

/* ================================================================
   ESTILOS — identidade visual própria: painel de controle industrial
   (grafite + aço) para navegação, e superfície "papel de açúcar"
   (bege claro) para o conteúdo operacional, com selos de inspeção
   como assinatura visual dos indicadores.
   ================================================================ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800;900&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

:root{
  --ink:#12171B; --panel:#1B2329; --panel-2:#232C33; --panel-3:#2C363E;
  --steel:#3D4952; --steel-soft:#8494A0; --steel-soft-2:#5C6C77;
  --paper:#EFE8D8; --paper-2:#F8F4E9; --paper-3:#FFFFFF;
  --ink-on-paper:#251F16; --ink-soft:#5C5344;
  --line:#DCD2B8; --line-soft:#EAE2CB;
  --cana:#5D7A34; --cana-dark:#455D24; --cana-tint:#E4EAD4;
  --bagaco:#B67A2E; --bagaco-dark:#8C5B1E; --bagaco-tint:#F2E3CC;
  --red:#BC4430; --red-tint:#F6DFD8; --red-dark:#8F3120;
  --amber:#C3891F; --amber-tint:#F6E7C4; --amber-dark:#8F660F;
  --green:#3F7A46; --green-tint:#DEEBDD; --green-dark:#2C5A32;
  --gray:#7A7362; --gray-tint:#E9E4D6;
  --shadow-1: 0 1px 2px rgba(18,23,27,0.08), 0 1px 1px rgba(18,23,27,0.04);
  --shadow-2: 0 6px 20px rgba(18,23,27,0.14), 0 2px 6px rgba(18,23,27,0.08);
  --shadow-3: 0 20px 50px rgba(18,23,27,0.35);
  --radius-s:6px; --radius-m:10px; --radius-l:16px;
  --font-display:'Big Shoulders Display', Impact, 'Arial Narrow Bold', sans-serif;
  --font-body:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:'IBM Plex Mono', 'SF Mono', Consolas, monospace;
}
*,*::before,*::after{ box-sizing:border-box; }
.g5-root{
  font-family:var(--font-body); color:var(--ink-on-paper); background:var(--paper);
  min-height:100vh; -webkit-font-smoothing:antialiased; line-height:1.45;
  overflow-x:hidden; width:100%;
}
.g5-root, .g5-root *{ scrollbar-width:thin; scrollbar-color:var(--steel-soft) transparent; }
.g5-root *::-webkit-scrollbar{ width:8px; height:8px; }
.g5-root *::-webkit-scrollbar-thumb{ background:#C9BE9C; border-radius:8px; }
.g5-root h1,.g5-root h2,.g5-root h3,.g5-root h4{ font-family:var(--font-display); font-weight:800; letter-spacing:0.01em; margin:0; }
.g5-root input, .g5-root select, .g5-root textarea{ font-family:inherit; color:inherit; }
.g5-root button{ font-family:inherit; }
.g5-mono{ font-family:var(--font-mono); font-variant-numeric:tabular-nums; }
.g5-visually-hidden{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; }

/* ---------- App chrome (dark, control-room) ---------- */
.g5-header{
  background:linear-gradient(180deg,var(--ink),var(--panel) 140%);
  color:var(--paper-2); padding:14px 20px; position:sticky; top:0; z-index:40;
  box-shadow:var(--shadow-2); border-bottom:3px solid var(--bagaco);
}
.g5-header-row{ display:flex; align-items:center; gap:14px; max-width:1360px; margin:0 auto; }
.g5-brand{ display:flex; align-items:center; gap:12px; min-width:0; flex:1; }
.g5-brand-mark{
  width:42px; height:42px; border-radius:10px; background:var(--panel-3);
  border:2px solid var(--bagaco); display:flex; align-items:center; justify-content:center;
  color:var(--bagaco); flex:none; box-shadow:inset 0 0 0 1px rgba(255,255,255,0.04);
}
.g5-brand-text{ min-width:0; }
.g5-brand-title{ font-family:var(--font-display); font-size:22px; font-weight:800; line-height:1; color:#fff;
  text-transform:uppercase; letter-spacing:0.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.g5-brand-sub{ font-family:var(--font-mono); font-size:11px; color:var(--steel-soft); margin-top:4px; letter-spacing:0.03em; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.g5-header-right{ display:flex; align-items:center; gap:10px; flex:none; min-width:0; }
.g5-cycle-chip{
  font-family:var(--font-mono); font-size:11.5px; color:var(--paper-2); background:var(--panel-3);
  border:1px solid var(--steel); padding:7px 12px; border-radius:20px; display:flex; align-items:center; gap:7px;
  white-space:nowrap; min-width:0;
}
.g5-cycle-dot{ width:7px; height:7px; border-radius:50%; background:var(--green); box-shadow:0 0 0 3px rgba(63,122,70,0.28); flex:none; }
.g5-cycle-text{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; min-width:0; }
.g5-sync{ display:flex; align-items:center; gap:6px; font-size:11px; color:var(--steel-soft); font-family:var(--font-mono); }
.g5-ciclo-switch{ display:flex; align-items:center; gap:2px; background:var(--panel-3); border:1px solid var(--steel); border-radius:20px; padding:3px; flex:none; }
.g5-ciclo-switch-btn{
  font-family:var(--font-mono); font-size:11px; font-weight:700; color:var(--steel-soft); background:transparent;
  border:none; padding:5px 10px; border-radius:16px; cursor:pointer; transition:background .15s ease, color .15s ease;
}
.g5-ciclo-switch-btn:hover{ color:#fff; }
.g5-ciclo-switch-btn.active{ background:var(--bagaco); color:var(--ink); }
.g5-historico-badge{
  font-family:var(--font-mono); font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;
  color:#fff; background:var(--steel-soft-2); padding:5px 10px; border-radius:20px; flex:none; white-space:nowrap;
}

.g5-tabbar{ background:var(--panel); border-bottom:1px solid var(--steel); overflow-x:auto; }
.g5-tabbar-row{ display:flex; gap:2px; max-width:1360px; margin:0 auto; padding:0 12px; }
.g5-tab{
  display:flex; align-items:center; gap:8px; padding:12px 16px; background:transparent; border:none;
  color:var(--steel-soft); font-size:13.5px; font-weight:600; cursor:pointer; white-space:nowrap;
  border-bottom:3px solid transparent; transition:color .15s ease, border-color .15s ease; letter-spacing:0.01em;
}
.g5-tab:hover{ color:#fff; }
.g5-tab.active{ color:#fff; border-bottom-color:var(--bagaco); }
.g5-tab svg{ flex:none; }

.g5-main{ max-width:1360px; margin:0 auto; padding:22px 20px 80px; }
@media (max-width:760px){
  .g5-main{ padding:16px 12px 90px; }
  .g5-brand-title{ font-size:18px; }
  .g5-header-row{ flex-wrap:wrap; }
  .g5-header-right{ width:100%; justify-content:space-between; }
  .g5-cycle-chip{ max-width:72%; white-space:nowrap; }
}

/* ---------- Generic building blocks ---------- */
.g5-page-head{ display:flex; align-items:flex-end; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:18px; }
.g5-page-title{ font-size:30px; color:var(--ink-on-paper); text-transform:uppercase; }
.g5-page-desc{ font-family:var(--font-body); font-weight:500; font-size:13.5px; color:var(--ink-soft); margin-top:4px; }
.g5-eyebrow{ font-family:var(--font-mono); font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:var(--bagaco-dark); font-weight:600; margin-bottom:2px; display:block; }

.g5-btn{
  display:inline-flex; align-items:center; justify-content:center; gap:7px; border-radius:var(--radius-s);
  border:1.5px solid transparent; padding:9px 14px; font-size:13.5px; font-weight:700; cursor:pointer;
  transition:all .14s ease; font-family:var(--font-body); letter-spacing:0.01em; white-space:nowrap;
}
.g5-btn:active{ transform:translateY(1px); }
.g5-btn:disabled{ opacity:0.5; cursor:not-allowed; transform:none; }
.g5-btn-primary{ background:var(--cana); border-color:var(--cana-dark); color:#fff; box-shadow:var(--shadow-1); }
.g5-btn-primary:hover:not(:disabled){ background:var(--cana-dark); }
.g5-btn-dark{ background:var(--ink); border-color:var(--ink); color:#fff; }
.g5-btn-dark:hover:not(:disabled){ background:var(--panel-3); }
.g5-btn-outline{ background:var(--paper-3); border-color:var(--line); color:var(--ink-on-paper); }
.g5-btn-outline:hover:not(:disabled){ border-color:var(--steel-soft-2); background:var(--paper-2); }
.g5-btn-ghost{ background:transparent; border-color:transparent; color:var(--ink-soft); padding:8px 10px; }
.g5-btn-ghost:hover:not(:disabled){ background:var(--paper-2); color:var(--ink-on-paper); }
.g5-btn-danger{ background:var(--red-tint); border-color:var(--red); color:var(--red-dark); }
.g5-btn-danger:hover:not(:disabled){ background:var(--red); color:#fff; }
.g5-btn-sm{ padding:6px 10px; font-size:12.5px; }
.g5-btn-icon{ padding:8px; }
.g5-btn-block{ width:100%; }

.g5-card{ background:var(--paper-3); border:1px solid var(--line); border-radius:var(--radius-m); box-shadow:var(--shadow-1); }
.g5-card-pad{ padding:18px; }

.g5-stat-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
@media (max-width:900px){ .g5-stat-grid{ grid-template-columns:repeat(2,1fr); } }
.g5-stat{ background:var(--paper-3); border:1px solid var(--line); border-radius:var(--radius-m); padding:16px 18px; position:relative; overflow:hidden; box-shadow:var(--shadow-1); }
.g5-stat-bar{ position:absolute; left:0; top:0; bottom:0; width:5px; }
.g5-stat-label{ font-family:var(--font-mono); font-size:10.5px; text-transform:uppercase; letter-spacing:0.06em; color:var(--ink-soft); font-weight:600; }
.g5-stat-value{ font-family:var(--font-display); font-size:34px; font-weight:800; line-height:1.1; margin-top:4px; color:var(--ink-on-paper); }
.g5-stat-sub{ font-size:12px; color:var(--ink-soft); margin-top:3px; }

/* ---------- Stamp badge — signature element (selo de inspeção) ---------- */
.g5-stamp{
  --sc: var(--gray); --sct: var(--gray-tint);
  display:inline-flex; align-items:center; justify-content:center; flex-direction:column;
  width:54px; height:54px; border-radius:50%; border:2.5px dashed var(--sc); background:var(--sct);
  color:var(--sc); transform:rotate(-4deg); flex:none; position:relative;
}
.g5-stamp::after{ content:''; position:absolute; inset:4px; border-radius:50%; border:1px solid var(--sc); opacity:0.5; }
.g5-stamp-val{ font-family:var(--font-mono); font-weight:700; font-size:16px; line-height:1; }
.g5-stamp-unit{ font-family:var(--font-mono); font-size:8px; letter-spacing:0.04em; margin-top:1px; }
.g5-stamp-sm{ width:38px; height:38px; }
.g5-stamp-sm .g5-stamp-val{ font-size:12px; }
.g5-stamp-sm .g5-stamp-unit{ display:none; }
.g5-stamp-lg{ width:84px; height:84px; border-width:3px; }
.g5-stamp-lg .g5-stamp-val{ font-size:26px; }
.g5-stamp.tone-green{ --sc:var(--green); --sct:var(--green-tint); }
.g5-stamp.tone-amber{ --sc:var(--amber); --sct:var(--amber-tint); }
.g5-stamp.tone-red{ --sc:var(--red); --sct:var(--red-tint); }
.g5-stamp.tone-none{ --sc:var(--steel-soft-2); --sct:var(--paper-2); }

.g5-pill{
  display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px;
  font-size:11.5px; font-weight:700; font-family:var(--font-body); letter-spacing:0.01em; white-space:nowrap;
  border:1px solid transparent;
}
.g5-pill svg{ flex:none; }
.g5-pill.tone-green{ background:var(--green-tint); color:var(--green-dark); }
.g5-pill.tone-amber{ background:var(--amber-tint); color:var(--amber-dark); }
.g5-pill.tone-red{ background:var(--red-tint); color:var(--red-dark); }
.g5-pill.tone-gray{ background:var(--gray-tint); color:var(--ink-soft); }
.g5-pill.tone-cana{ background:var(--cana-tint); color:var(--cana-dark); }
.g5-pill.tone-bagaco{ background:var(--bagaco-tint); color:var(--bagaco-dark); }

.g5-dept-tag{ display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; color:var(--ink-soft); }
.g5-dept-dot{ width:9px; height:9px; border-radius:3px; flex:none; }
`;
const STYLES_B = `
/* ---------- Forms ---------- */
.g5-field{ display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
.g5-field-row{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media (max-width:600px){ .g5-field-row{ grid-template-columns:1fr; } }
.g5-label{ font-size:12px; font-weight:700; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.03em; }
.g5-label .opt{ text-transform:none; font-weight:500; color:var(--steel-soft-2); letter-spacing:0; }
.g5-input, .g5-select, .g5-textarea{
  border:1.5px solid var(--line); background:var(--paper-3); border-radius:var(--radius-s); padding:9px 11px;
  font-size:14px; color:var(--ink-on-paper); outline:none; transition:border-color .12s ease, box-shadow .12s ease; width:100%;
}
.g5-input:focus, .g5-select:focus, .g5-textarea:focus{ border-color:var(--cana); box-shadow:0 0 0 3px var(--cana-tint); }
.g5-textarea{ resize:vertical; min-height:72px; font-family:inherit; line-height:1.5; }
.g5-input::placeholder, .g5-textarea::placeholder{ color:#B3A98C; }
.g5-help{ font-size:11.5px; color:var(--steel-soft-2); }
.g5-check-row{ display:flex; align-items:center; gap:8px; font-size:13.5px; font-weight:600; cursor:pointer; user-select:none; }
.g5-search{ position:relative; flex:1; min-width:180px; }
.g5-search svg{ position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--steel-soft-2); }
.g5-search input{ padding-left:32px; }
.g5-toolbar{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
.g5-chip-toggle{
  display:flex; gap:4px; background:var(--paper-2); border:1px solid var(--line); border-radius:20px; padding:3px;
}
.g5-chip-toggle button{
  border:none; background:transparent; padding:6px 13px; border-radius:16px; font-size:12.5px; font-weight:700;
  color:var(--ink-soft); cursor:pointer; white-space:nowrap;
}
.g5-chip-toggle button.active{ background:var(--ink); color:#fff; }

/* ---------- Tables ---------- */
.g5-table-wrap{ overflow-x:auto; border:1px solid var(--line); border-radius:var(--radius-m); background:var(--paper-3); box-shadow:var(--shadow-1); }
.g5-table{ width:100%; border-collapse:collapse; font-size:13.5px; min-width:640px; }
.g5-table thead th{
  text-align:left; font-family:var(--font-mono); font-size:10.5px; text-transform:uppercase; letter-spacing:0.05em;
  color:var(--paper-2); background:var(--panel); padding:11px 14px; font-weight:600; white-space:nowrap; cursor:pointer;
  user-select:none; position:sticky; top:0;
}
.g5-table thead th.no-sort{ cursor:default; }
.g5-table thead th span.arrow{ margin-left:4px; opacity:0.7; }
.g5-table tbody td{ padding:11px 14px; border-top:1px solid var(--line-soft); vertical-align:middle; }
.g5-table tbody tr:hover{ background:var(--paper-2); }
.g5-table tbody tr.clickable{ cursor:pointer; }
.g5-table .num-cell{ font-family:var(--font-mono); text-align:center; font-weight:700; }
.g5-score-cell{ display:inline-flex; align-items:center; justify-content:center; min-width:44px; padding:4px 8px; border-radius:6px; font-family:var(--font-mono); font-weight:700; font-size:12.5px; }
.g5-score-input{ width:56px; text-align:center; font-family:var(--font-mono); font-weight:700; padding:6px 4px; border:1.5px solid var(--line); border-radius:6px; background:var(--paper-2); }
.g5-score-input:focus{ outline:none; border-color:var(--cana); background:#fff; }

/* ---------- Modal / Dialog ---------- */
.g5-overlay{ position:fixed; inset:0; background:rgba(18,23,27,0.6); backdrop-filter:blur(2px); z-index:100; display:flex; align-items:flex-start; justify-content:center; padding:5vh 16px; overflow-y:auto; }
.g5-modal{ background:var(--paper-3); border-radius:var(--radius-l); width:100%; max-width:640px; box-shadow:var(--shadow-3); margin:auto; border:1px solid var(--line); animation:g5pop .16s ease; }
@keyframes g5pop{ from{ opacity:0; transform:translateY(8px) scale(0.98);} to{ opacity:1; transform:none; } }
.g5-modal-head{ display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-bottom:1px solid var(--line); }
.g5-modal-title{ font-size:19px; text-transform:uppercase; }
.g5-modal-body{ padding:20px; max-height:70vh; overflow-y:auto; }
.g5-modal-foot{ display:flex; justify-content:flex-end; gap:10px; padding:16px 20px; border-top:1px solid var(--line); background:var(--paper-2); border-radius:0 0 var(--radius-l) var(--radius-l); }
.g5-confirm-icon{ width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:var(--red-tint); color:var(--red-dark); flex:none; }

/* ---------- Area cards ---------- */
.g5-dept-section{ margin-bottom:26px; }
.g5-dept-head{ display:flex; align-items:center; gap:10px; margin-bottom:12px; padding-bottom:8px; border-bottom:2px solid var(--ink); }
.g5-dept-head h3{ font-size:19px; text-transform:uppercase; }
.g5-dept-count{ font-family:var(--font-mono); font-size:11.5px; color:var(--ink-soft); background:var(--paper-2); padding:2px 9px; border-radius:10px; }
.g5-area-grid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(240px,1fr)); gap:12px; }
.g5-area-card{
  background:var(--paper-3); border:1px solid var(--line); border-radius:var(--radius-m); padding:14px 15px;
  cursor:pointer; transition:box-shadow .14s ease, transform .14s ease; box-shadow:var(--shadow-1); text-align:left;
  display:flex; flex-direction:column; gap:10px; position:relative;
}
.g5-area-card:hover{ box-shadow:var(--shadow-2); transform:translateY(-2px); border-color:var(--steel-soft-2); }
.g5-area-card-top{ display:flex; align-items:flex-start; justify-content:space-between; gap:8px; }
.g5-area-card-name{ font-family:var(--font-display); font-size:17px; font-weight:800; line-height:1.15; color:var(--ink-on-paper); text-transform:uppercase; }
.g5-area-card-leader{ font-size:12px; color:var(--ink-soft); display:flex; align-items:center; gap:5px; }
.g5-area-card-foot{ display:flex; align-items:center; justify-content:space-between; margin-top:auto; padding-top:8px; border-top:1px dashed var(--line); }
.g5-open-count{ font-size:11.5px; font-weight:700; color:var(--ink-soft); display:flex; align-items:center; gap:5px; }

/* ---------- PAD item cards ---------- */
.g5-item-card{ background:var(--paper-3); border:1px solid var(--line); border-radius:var(--radius-m); padding:14px 16px; box-shadow:var(--shadow-1); }
.g5-item-card.is-done{ opacity:0.72; }
.g5-item-head{ display:flex; align-items:flex-start; gap:12px; }
.g5-item-num{ font-family:var(--font-mono); font-weight:700; font-size:13px; color:var(--bagaco-dark); background:var(--bagaco-tint); border-radius:6px; padding:2px 8px; flex:none; }
.g5-item-problem{ font-weight:700; font-size:14.5px; line-height:1.35; flex:1; color:var(--ink-on-paper); }
.g5-item-problem.is-done{ text-decoration:line-through; text-decoration-color:var(--steel-soft-2); }
.g5-item-meta{ display:flex; flex-wrap:wrap; gap:8px 16px; margin-top:10px; font-size:12.5px; color:var(--ink-soft); }
.g5-item-meta-i{ display:flex; align-items:center; gap:5px; }
.g5-item-actions-text{ margin-top:10px; padding:10px 12px; background:var(--paper-2); border-radius:var(--radius-s); font-size:13px; white-space:pre-line; border-left:3px solid var(--cana); }
.g5-item-photos{ display:flex; gap:8px; margin-top:10px; }
.g5-photo-thumb{ width:64px; height:64px; border-radius:var(--radius-s); object-fit:cover; border:1px solid var(--line); }
.g5-photo-slot{ width:64px; height:64px; border-radius:var(--radius-s); border:1.5px dashed var(--line); display:flex; align-items:center; justify-content:center; color:var(--steel-soft-2); background:var(--paper-2); flex-direction:column; gap:2px; font-size:9px; text-align:center; cursor:pointer; }
.g5-photo-slot:hover{ border-color:var(--cana); color:var(--cana-dark); }
.g5-item-footrow{ display:flex; align-items:center; justify-content:space-between; margin-top:12px; padding-top:10px; border-top:1px dashed var(--line); gap:10px; flex-wrap:wrap; }
.g5-item-btns{ display:flex; gap:6px; }

/* ---------- Misc ---------- */
.g5-empty{ text-align:center; padding:50px 20px; color:var(--ink-soft); }
.g5-empty svg{ color:var(--steel-soft-2); margin-bottom:10px; }
.g5-empty h4{ font-size:17px; text-transform:uppercase; color:var(--ink-on-paper); margin-bottom:4px; }
.g5-empty p{ font-size:13px; max-width:360px; margin:0 auto; }

.g5-loading-screen{ min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; background:var(--ink); color:var(--paper); }
.g5-loading-screen .spin{ animation:g5spin 1s linear infinite; color:var(--bagaco); }
@keyframes g5spin{ to{ transform:rotate(360deg); } }

.g5-toast{ position:fixed; bottom:22px; left:50%; transform:translateX(-50%); background:var(--ink); color:#fff; padding:11px 18px; border-radius:24px; box-shadow:var(--shadow-3); font-size:13px; font-weight:600; display:flex; align-items:center; gap:8px; z-index:200; border:1px solid var(--panel-3); }

.g5-back-link{ display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:700; color:var(--ink-soft); background:none; border:none; cursor:pointer; padding:4px 0; margin-bottom:10px; }
.g5-back-link:hover{ color:var(--ink-on-paper); }

.g5-chart-card{ background:var(--paper-3); border:1px solid var(--line); border-radius:var(--radius-m); padding:18px; box-shadow:var(--shadow-1); min-width:0; }
.g5-chart-title{ font-size:15px; text-transform:uppercase; margin-bottom:2px; }
.g5-chart-sub{ font-size:12px; color:var(--ink-soft); margin-bottom:12px; }

.g5-two-col{ display:grid; grid-template-columns:1.3fr 1fr; gap:16px; min-width:0; }
.g5-two-col > *{ min-width:0; }
@media (max-width:900px){ .g5-two-col{ grid-template-columns:1fr; } }

.g5-detail-header{ background:linear-gradient(135deg,var(--panel),var(--ink) 120%); border-radius:var(--radius-l); padding:20px 22px; color:#fff; display:flex; align-items:center; gap:18px; flex-wrap:wrap; margin-bottom:18px; box-shadow:var(--shadow-2); }
.g5-detail-header-info{ flex:1; min-width:220px; }
.g5-detail-header h2{ font-size:26px; text-transform:uppercase; color:#fff; }
.g5-detail-header-meta{ display:flex; gap:16px; flex-wrap:wrap; margin-top:8px; font-size:12.5px; color:var(--steel-soft); }
.g5-detail-header-meta b{ color:#fff; font-weight:700; }

.g5-scoretable{ display:grid; grid-auto-flow:column; grid-auto-columns:minmax(90px,1fr); gap:8px; overflow-x:auto; padding-bottom:4px; }
.g5-scoretable-col{ background:var(--paper-2); border:1px solid var(--line); border-radius:var(--radius-s); padding:9px 8px; text-align:center; }
.g5-scoretable-col label{ display:block; font-family:var(--font-mono); font-size:9.5px; text-transform:uppercase; color:var(--ink-soft); margin-bottom:2px; }
.g5-scoretable-col .per{ font-size:9.5px; color:var(--steel-soft-2); margin-bottom:6px; }

.g5-committee-grid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:12px; }
.g5-member-card{ background:var(--paper-3); border:1px solid var(--line); border-radius:var(--radius-m); padding:14px; display:flex; gap:12px; align-items:center; box-shadow:var(--shadow-1); }
.g5-avatar{ width:44px; height:44px; border-radius:50%; background:var(--panel); color:var(--paper); display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-weight:800; font-size:16px; flex:none; border:2px solid var(--bagaco); }

.g5-phase{ margin-bottom:16px; }
.g5-phase-title{ display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.g5-phase-title h3{ font-size:16.5px; text-transform:uppercase; }
.g5-phase-num{ width:26px; height:26px; border-radius:50%; background:var(--ink); color:#fff; display:flex; align-items:center; justify-content:center; font-family:var(--font-mono); font-size:12px; font-weight:700; flex:none; }
.g5-task-row{ display:flex; align-items:center; gap:12px; padding:10px 14px; background:var(--paper-3); border:1px solid var(--line); border-radius:var(--radius-s); margin-bottom:6px; flex-wrap:wrap; }
.g5-task-name{ flex:1; min-width:200px; font-weight:600; font-size:13.5px; }
.g5-task-period{ font-family:var(--font-mono); font-size:11.5px; color:var(--ink-soft); }

.g5-danger-zone{ border:1.5px dashed var(--red); background:var(--red-tint); border-radius:var(--radius-m); padding:16px 18px; }
.g5-settings-section{ margin-bottom:24px; }
.g5-settings-section h3{ font-size:16px; text-transform:uppercase; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--line); }
.g5-tag-row{ display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
.g5-tag-editable{ display:flex; align-items:center; gap:6px; background:var(--paper-2); border:1px solid var(--line); border-radius:20px; padding:5px 6px 5px 12px; font-size:12.5px; font-weight:600; }
.g5-tag-editable button{ background:var(--paper-3); border:none; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--ink-soft); }
.g5-tag-editable button:hover{ background:var(--red-tint); color:var(--red-dark); }

.g5-print-hint{ font-size:11.5px; color:var(--steel-soft-2); }
`;
// ============================================================
// DADOS REAIS extraidos do GERENCIADOR_PROGRAMA_5S (3o Ciclo).xlsx
// Usina Serra Grande - Programa 5S. Fotos originais nao foram
// migradas (arquivo de origem tinha ~55MB em imagens); os itens
// continuam totalmente editaveis e aceitam novas fotos.
// ============================================================
const SEED_AREAS_BY_CYCLE = {"1":[{"id":"area-1","nome":"Caldeira","departamento":"Industrial","lider":"ROMERITO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":51,"comentario":""},"c1-a2":{"nota":70,"comentario":""},"c1-a3":{"nota":97,"comentario":""},"c1-a4":{"nota":94,"comentario":""}}},{"id":"area-2","nome":"Laboratório","departamento":"Administrativo","lider":"ODAIR","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":67,"comentario":""},"c1-a2":{"nota":84,"comentario":""},"c1-a3":{"nota":90,"comentario":""},"c1-a4":{"nota":80,"comentario":""}}},{"id":"area-3","nome":"Destilaria","departamento":"Industrial","lider":"DAVID","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":32,"comentario":""},"c1-a2":{"nota":31,"comentario":""},"c1-a3":{"nota":89,"comentario":""},"c1-a4":{"nota":70,"comentario":""}}},{"id":"area-4","nome":"Armazéns E Área De Envase","departamento":"Industrial","lider":"NELSON BRÁS","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":43,"comentario":""},"c1-a2":{"nota":56,"comentario":""},"c1-a3":{"nota":97,"comentario":""},"c1-a4":{"nota":91,"comentario":""}}},{"id":"area-5","nome":"Mesas, Tombador E Esteiras","departamento":"Industrial","lider":"MARCONE","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":57,"comentario":""},"c1-a2":{"nota":65,"comentario":""},"c1-a3":{"nota":94,"comentario":""},"c1-a4":{"nota":88,"comentario":""}}},{"id":"area-6","nome":"Fabricação","departamento":"Industrial","lider":"GILBERTO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":42,"comentario":""},"c1-a2":{"nota":67,"comentario":""},"c1-a3":{"nota":88,"comentario":""},"c1-a4":{"nota":91,"comentario":""}}},{"id":"area-7","nome":"Moenda","departamento":"Industrial","lider":"CLÁUDIO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":43,"comentario":""},"c1-a2":{"nota":56,"comentario":""},"c1-a3":{"nota":91,"comentario":""},"c1-a4":{"nota":80,"comentario":""}}},{"id":"area-8","nome":"Ruas, Navio","departamento":"Industrial","lider":"ZUMBA","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":27,"comentario":""},"c1-a2":{"nota":62,"comentario":""},"c1-a3":{"nota":88,"comentario":""},"c1-a4":{"nota":80,"comentario":""}}},{"id":"area-9","nome":"Balança","departamento":"Administrativo","lider":"ROZEILDO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":75,"comentario":""},"c1-a2":{"nota":81,"comentario":""},"c1-a3":{"nota":100,"comentario":""},"c1-a4":{"nota":100,"comentario":""}}},{"id":"area-10","nome":"Vestiário / Refeitório","departamento":"Administrativo","lider":"ROZEILDO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":75,"comentario":""},"c1-a2":{"nota":81,"comentario":""},"c1-a3":{"nota":100,"comentario":""},"c1-a4":{"nota":100,"comentario":""}}},{"id":"area-11","nome":"Caldeiraria","departamento":"Manutenção","lider":"PEDRO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":34,"comentario":""},"c1-a2":{"nota":56,"comentario":""},"c1-a3":{"nota":100,"comentario":""},"c1-a4":{"nota":97,"comentario":""}}},{"id":"area-12","nome":"Elétrica","departamento":"Manutenção","lider":"DJAIR / VALMIR","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":44,"comentario":""},"c1-a2":{"nota":47,"comentario":""},"c1-a3":{"nota":85,"comentario":""},"c1-a4":{"nota":84,"comentario":""}}},{"id":"area-13","nome":"Extração","departamento":"Manutenção","lider":"EDENILDO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":52,"comentario":""},"c1-a2":{"nota":72,"comentario":""},"c1-a3":{"nota":95,"comentario":""},"c1-a4":{"nota":100,"comentario":""}}},{"id":"area-14","nome":"Centrífugas De Açúcar (Manut.)","departamento":"Manutenção","lider":"SÉRGIO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":52,"comentario":""},"c1-a2":{"nota":36,"comentario":""},"c1-a3":{"nota":74,"comentario":""},"c1-a4":{"nota":56,"comentario":""}}},{"id":"area-15","nome":"Oficina Mecânica","departamento":"Manutenção","lider":"RENILSON","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":33,"comentario":""},"c1-a2":{"nota":62,"comentario":""},"c1-a3":{"nota":94,"comentario":""},"c1-a4":{"nota":87,"comentario":""}}},{"id":"area-16","nome":"Instrumentação","departamento":"Manutenção","lider":"MARCO AURÉLIO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":63,"comentario":""},"c1-a2":{"nota":62,"comentario":""},"c1-a3":{"nota":97,"comentario":""},"c1-a4":{"nota":100,"comentario":""}}},{"id":"area-17","nome":"Lubrificação","departamento":"Manutenção","lider":"ANDERSON OLIVEIRA","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":66,"comentario":""},"c1-a2":{"nota":67,"comentario":""},"c1-a3":{"nota":100,"comentario":""},"c1-a4":{"nota":100,"comentario":""}}},{"id":"area-18","nome":"Mecânica","departamento":"Manutenção","lider":"FLÁVIO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":37,"comentario":""},"c1-a2":{"nota":42,"comentario":""},"c1-a3":{"nota":88,"comentario":""},"c1-a4":{"nota":83,"comentario":""}}},{"id":"area-19","nome":"Escritório Manutenção","departamento":"Administrativo","lider":"LIDIANE","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c1-a1":{"nota":47,"comentario":""},"c1-a2":{"nota":69,"comentario":""},"c1-a3":{"nota":97,"comentario":""},"c1-a4":{"nota":100,"comentario":""}}},{"id":"area-20","nome":"Administrativo — Célio","departamento":"Administrativo","lider":"Célio","auditor":"Marcos Araújo","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-21","nome":"Garagem — Jefferson","departamento":"Garagem","lider":"Jefferson","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-22","nome":"Garagem — Jair","departamento":"Garagem","lider":"Jair","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-23","nome":"Garagem — Cicero","departamento":"Garagem","lider":"Cicero","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-24","nome":"Garagem — Roberto","departamento":"Garagem","lider":"Roberto","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-25","nome":"Garagem — Rozenildo","departamento":"Garagem","lider":"Rozenildo","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}}],"2":[{"id":"area-1","nome":"Caldeira","departamento":"Industrial","lider":"ROMERITO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":59.5,"comentario":""},"c2-a2":{"nota":56,"comentario":""},"c2-a3":{"nota":61.6,"comentario":""}}},{"id":"area-2","nome":"Laboratório","departamento":"Administrativo","lider":"ODAIR","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":55.3,"comentario":""},"c2-a2":{"nota":63.7,"comentario":""},"c2-a3":{"nota":59.5,"comentario":""}}},{"id":"area-3","nome":"Destilaria","departamento":"Industrial","lider":"DAVID","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":50.4,"comentario":""},"c2-a2":{"nota":52.5,"comentario":""},"c2-a3":{"nota":52.5,"comentario":""}}},{"id":"area-4","nome":"Armazéns E Área De Envase","departamento":"Industrial","lider":"NELSON BRÁS","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":59.5,"comentario":""},"c2-a2":{"nota":63.7,"comentario":""},"c2-a3":{"nota":63.7,"comentario":""}}},{"id":"area-5","nome":"Mesas, Tombador E Esteiras","departamento":"Industrial","lider":"MARCONE","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":54.6,"comentario":""},"c2-a2":{"nota":50.4,"comentario":""},"c2-a3":{"nota":58.1,"comentario":""}}},{"id":"area-6","nome":"Fabricação","departamento":"Industrial","lider":"GILBERTO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":48.3,"comentario":""},"c2-a2":{"nota":45.5,"comentario":""},"c2-a3":{"nota":53.9,"comentario":""}}},{"id":"area-7","nome":"Moenda","departamento":"Industrial","lider":"CLÁUDIO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":49.7,"comentario":""},"c2-a2":{"nota":46.9,"comentario":""},"c2-a3":{"nota":57.4,"comentario":""}}},{"id":"area-8","nome":"Ruas, Navio","departamento":"Industrial","lider":"ZUMBA","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":54.6,"comentario":""},"c2-a2":{"nota":46.9,"comentario":""},"c2-a3":{"nota":49,"comentario":""}}},{"id":"area-9","nome":"Balança","departamento":"Administrativo","lider":"ROZEILDO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":58.1,"comentario":""},"c2-a2":{"nota":60.2,"comentario":""},"c2-a3":{"nota":62.3,"comentario":""}}},{"id":"area-10","nome":"Vestiário / Refeitório","departamento":"Administrativo","lider":"ROZEILDO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":58.1,"comentario":""},"c2-a2":{"nota":60.2,"comentario":""},"c2-a3":{"nota":62.3,"comentario":""}}},{"id":"area-11","nome":"Caldeiraria","departamento":"Manutenção","lider":"PEDRO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":61.6,"comentario":""},"c2-a2":{"nota":53.9,"comentario":""},"c2-a3":{"nota":64.4,"comentario":""}}},{"id":"area-12","nome":"Elétrica","departamento":"Manutenção","lider":"DJAIR / VALMIR","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":44.1,"comentario":""},"c2-a2":{"nota":43.4,"comentario":""},"c2-a3":{"nota":58.1,"comentario":""}}},{"id":"area-13","nome":"Extração","departamento":"Manutenção","lider":"EDENILDO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":56,"comentario":""},"c2-a2":{"nota":49.7,"comentario":""},"c2-a3":{"nota":60.2,"comentario":""}}},{"id":"area-14","nome":"Centrífugas De Açúcar (Manut.)","departamento":"Manutenção","lider":"SÉRGIO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":57.4,"comentario":""},"c2-a2":{"nota":57.4,"comentario":""},"c2-a3":{"nota":58.1,"comentario":""}}},{"id":"area-15","nome":"Oficina Mecânica","departamento":"Manutenção","lider":"RENILSON","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":61.6,"comentario":""},"c2-a2":{"nota":67.9,"comentario":""},"c2-a3":{"nota":64.4,"comentario":""}}},{"id":"area-16","nome":"Instrumentação","departamento":"Manutenção","lider":"MARCO AURÉLIO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":60.2,"comentario":""},"c2-a2":{"nota":63.7,"comentario":""},"c2-a3":{"nota":62.3,"comentario":""}}},{"id":"area-17","nome":"Lubrificação","departamento":"Manutenção","lider":"ANDERSON OLIVEIRA","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":61.6,"comentario":""},"c2-a2":{"nota":58.1,"comentario":""},"c2-a3":{"nota":60.2,"comentario":""}}},{"id":"area-18","nome":"Mecânica","departamento":"Manutenção","lider":"FLÁVIO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":35.7,"comentario":""},"c2-a2":{"nota":55.3,"comentario":""},"c2-a3":{"nota":53.9,"comentario":""}}},{"id":"area-19","nome":"Escritório Manutenção","departamento":"Administrativo","lider":"LIDIANE","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{"c2-a1":{"nota":65.8,"comentario":""},"c2-a2":{"nota":62.3,"comentario":""},"c2-a3":{"nota":63.7,"comentario":""}}},{"id":"area-20","nome":"Administrativo — Célio","departamento":"Administrativo","lider":"Célio","auditor":"Marcos Araújo","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-21","nome":"Garagem — Jefferson","departamento":"Garagem","lider":"Jefferson","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-22","nome":"Garagem — Jair","departamento":"Garagem","lider":"Jair","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-23","nome":"Garagem — Cicero","departamento":"Garagem","lider":"Cicero","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-24","nome":"Garagem — Roberto","departamento":"Garagem","lider":"Roberto","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-25","nome":"Garagem — Rozenildo","departamento":"Garagem","lider":"Rozenildo","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}}],"3":[{"id":"area-1","nome":"Caldeira","departamento":"Industrial","lider":"ROMERITO","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-16","itens":[{"id":"a1-1","numero":1,"problema":"ESPAÇAMENTO ENTRE PEÇAS DO PISO CHAPARIA E ESTRUTURA QUEBRADA PRECISANDO DE SOLDA","qtdAcoes":1,"oQueFazer":"1. Ajustar piso vazado retirando brechas e soldar partes quebradas;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-2","numero":2,"problema":"FALTA DE PINTURA NA ESTRUTURA SUPERIOR DO DISTRIBUIDOR DE BAGAÇO","qtdAcoes":1,"oQueFazer":"1. Relizar pintura na estrutura apresentada","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-3","numero":3,"problema":"FALTA DA COBERTURA NO DISTRIBUIDOR DE BAGAÇO;","qtdAcoes":1,"oQueFazer":"1. Realizar o complemento da cobertura do distribuidor de bagaço","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-4","numero":4,"problema":"FALTA DE PINTURA NA COBERTURA","qtdAcoes":1,"oQueFazer":"1. Realizar pintura","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-5","numero":5,"problema":"EQUIPAMENTOS COM DESGASTES E FALTA DE PADRONIZAÇÃO NA PINTURA","qtdAcoes":1,"oQueFazer":"1. Realizar pintura","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-6","numero":6,"problema":"MATERIAIS DESNECESSÁRIOS NO LOCAL; FALTA DE PINTURANAS ESTRUTURAS LATERAL DA CALDEIRA","qtdAcoes":2,"oQueFazer":"1. Retirar materiais sem utilidade;\n2. Realizar pintura e padronização no equipamento","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-7","numero":7,"problema":"MATERIAIS DE LIMPEZA NO CHÃO E SEM LOCAL ADEQUADO;","qtdAcoes":1,"oQueFazer":"1. Providenciar local para guarda de produtos de limpeza e utensílios;","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-8","numero":8,"problema":"ESPAÇO DOS ANTIGOS AR CONDICIONADOS SEM USO","qtdAcoes":1,"oQueFazer":"1. Definir se haverá prenchimento da área e pintura das duas áreas ou instalar um ar condicionado reserva","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Romerito","status":"concluido","foto":null},{"id":"a1-9","numero":9,"problema":"FALTA DE IDENTIFICAÇÃO NA MANGUEIRA DE AR; PRESENÇA DE ESPELHO COM OUTROS MATERIAIS SEM PADRONIZAÇÃO; MATERIAIS DE LIMPEZA ENCOSTADO NA PAREDE","qtdAcoes":2,"oQueFazer":"1. Realizar identificação e padronização dos itens presentes nesta área;\n2. Alocar materiais de limpeza em local designado","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-10","numero":10,"problema":"PRESENÇA DE BURACOS E PASSAGENS DESATIVADAS DE TUBULAÇÕES","qtdAcoes":2,"oQueFazer":"1. Solicitar vedação dos buracos a Eng. Civil na parte superior da parede e teto;\n2. Realizar pintura","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Romerito","status":"concluido","foto":null},{"id":"a1-11","numero":11,"problema":"CABEAMENTO DESORDENADO E SEM ACABAMENTO; TOMADA SEM PADRONIZAÇÃO DE INSTALAÇÃO","qtdAcoes":3,"oQueFazer":"1. Realizar cobertura na passagem do cabo no piso;\n2. Ordenar os cabeamentos embaixo da mesa;\n3. Realizar instalação padronizada da tomada presente embaixo da mesa","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-12","numero":12,"problema":"QUADRO DE GESTÃO À VISTA NECESSITANDO DE ÁREA DE PROTEÇÃO NA ÁREA EXTERNA","qtdAcoes":1,"oQueFazer":"1. Instalar cobertura para fixação do quadro na área externa","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Romerito","status":"concluido","foto":null},{"id":"a1-13","numero":13,"problema":"VIDRO DA JANELA QUEDRADO EM JANELA DA ÁREA INTERNA CALDEIRA","qtdAcoes":1,"oQueFazer":"1. Solicitar troca vidro da janela que apresenta trinca;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-14","numero":14,"problema":"ESTRUTURA PREDIAL NECESSITANDO DE REPAROS E PINTURA;","qtdAcoes":2,"oQueFazer":"1. Fechar buracos na estrutura predial e restaurar reboco;\n2. Realizar pintura predial.","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-15","numero":15,"problema":"CONTAINER DE TERCEIROS PRESENTE NO LOCAL","qtdAcoes":1,"oQueFazer":"1. Verificar alternativa com serviço de terceiros de realocação ou finalização do uso deste container no local","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Romerito","status":"concluido","foto":null},{"id":"a1-16","numero":16,"problema":"FIAÇÃO EXPOSTA COM TAMPA ABERTA","qtdAcoes":1,"oQueFazer":"1. Verificar com equipe de Instrumentação / Elétrica a proteção e cobertura do cabeamento","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Romerito","status":"concluido","foto":null},{"id":"a1-17","numero":17,"problema":"FALTA DE PINTURA E PADRONIZAÇÃO DA ÁREA","qtdAcoes":1,"oQueFazer":"1. Solicitação de pintura da parede","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Romerito","status":"concluido","foto":null},{"id":"a1-18","numero":18,"problema":"FALTA DE REBOCO E PADRONIZAÇÃO NA ESTRUTURA DA PAREDE","qtdAcoes":1,"oQueFazer":"1. Solicitação de acabamento na parede e pintura","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-19","numero":19,"problema":"ILUMINAÇÃO DE EMRGÊNCIA ANTIGA SEM FUNCIONAMENTO; BANDEJA DA FIAÇÃO ELÉTRICA COM DESGASTE;","qtdAcoes":1,"oQueFazer":"1. Retirar a iluminação de emergência da parte inferior sem utilidade ou reativar;","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Romerito","status":"concluido","foto":null},{"id":"a1-20","numero":20,"problema":"TUBULAÇÕES DE AR COMPRIMIDO SEM UTILIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Verificar tubulações sem utilidade para retirar","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-21","numero":21,"problema":"FIAÇÃO ELÉTRICA SEM UTILIZAÇÃO NO ESPAÇO DE PRODUTOS QUÍMICOS","qtdAcoes":1,"oQueFazer":"1. Solicitar ao setor da Elétrica a retirada da fiação sem utilidade","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Romerito","status":"concluido","foto":null},{"id":"a1-22","numero":22,"problema":"FALTA DE LAYOUT NO AMBIENTE DE PRODUTOS QUÍMICOS","qtdAcoes":1,"oQueFazer":"1. Criar layout demarcando áreas","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Romerito","status":"concluido","foto":null},{"id":"a1-23","numero":23,"problema":"INSTALAÇÃO ELÉTRICA DO MOTOR DO MEXEDOR NECESSITANDO DE AJUSTE E PADRONIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Solicitar ao setor da Elétrica reinstalação da fiação","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Romerito","status":"concluido","foto":null},{"id":"a1-24","numero":24,"problema":"FALTA DE JANELA NA PORTA DO CCM DA CALDEIRA NORAÇO 2, OCASIONANDO ACUMULO DE POEIRA E BAGAÇO","qtdAcoes":1,"oQueFazer":"1. Solicitar alocação de janela para a porta","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-25","numero":25,"problema":"TETO ESTRUTURAL DO CCM DA NORAÇO 2 COM DETERIORAÇÃO","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng. Civil recuperação estrutural","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Romerito","status":"pendente","foto":null},{"id":"a1-26","numero":26,"problema":"PRÉDIO CCM DA NORAÇO 3 COM TELHADO QUEBRADO","qtdAcoes":1,"oQueFazer":"1. Recuperar estrutura do telhado;","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Romerito","status":"concluido","foto":null},{"id":"a1-27","numero":27,"problema":"FALTA DE COBERTURA ACIMA DA PORTA OCASIONANDO ACUMULO DE POEIRA E BAGAÇO","qtdAcoes":1,"oQueFazer":"1. Recolocar uma vedação acima da porta de madeira para proteger de sujidades","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Romerito","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":72.0,"comentario":""}}},{"id":"area-2","nome":"Laboratório","departamento":"Administrativo","lider":"ODAIR","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-16","itens":[{"id":"a2-1","numero":1,"problema":"PORTA DE ENTRADA COM PROBLEMAS ESTRUTURAIS","qtdAcoes":1,"oQueFazer":"1. Solicitar reparo na porta de entrada e vedações apropriada contra poeira;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Odair","status":"pendente","foto":null},{"id":"a2-2","numero":2,"problema":"FALTA DE PINTURA PADRONIZADA NA ENTRADA DO PRÉDIO DO DEPT INDUSTRIAL E LABORATÓRIO","qtdAcoes":1,"oQueFazer":"1. Realizar pintura na parede da entrada do setor;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Odair","status":"pendente","foto":null},{"id":"a2-3","numero":3,"problema":"FALTA DE PINTURA PADRONIZADA NA LATERAL DO PRÉDIO DO DEPT INDUSTRIAL E LABORATÓRIO","qtdAcoes":1,"oQueFazer":"1. Realizar pintura na parede da entrada do setor;","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Odair","status":"concluido","foto":null},{"id":"a2-4","numero":4,"problema":"FALTA DE SINALIZAÇÃO NO COMPARTIMENTO DA FÁBRICA PARA O LABORATÓRIO","qtdAcoes":1,"oQueFazer":"1. Identificar compartimentos de recebimento de amostras","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Odair","status":"concluido","foto":null},{"id":"a2-5","numero":5,"problema":"PAREDE COM SUJIDADE; FALTA DE VENTILAÇÃO EXTERNA DO AMBIENTE","qtdAcoes":3,"oQueFazer":"1. Realizar pintura no teto;\n2. Melhorar limpeza das paredes;\n3. Solicitar instalaçaõ de cobogós;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Odair","status":"pendente","foto":null},{"id":"a2-6","numero":6,"problema":"DIFICULDADE NA LIMPEZA E FALTA DE ESCOAMENTO DE ÁGUA FORA DO LABORATÓRIO","qtdAcoes":1,"oQueFazer":"1. Instalar ponto de água dentro do setor para limpeza e ralo para escoamento;\nOBS: foi comprado estante para alocar potes do chão","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Odair","status":"pendente","foto":null},{"id":"a2-7","numero":7,"problema":"ESTRUTURA PREDIAL PRECISANDO DE PINTURA","qtdAcoes":1,"oQueFazer":"1. Solicitar pintura predial;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Odair","status":"pendente","foto":null},{"id":"a2-8","numero":8,"problema":"MATERIAIS DIVERSOS SEM ORGANIZAÇÃO;","qtdAcoes":1,"oQueFazer":"1. Organizar diversos materiais atrás do balcão principal;","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Odair","status":"concluido","foto":null},{"id":"a2-9","numero":9,"problema":"CABEAMENTO SEM ORGANIZAÇÃO APARADOS POR UMA CAIXA DE PAPELÃO","qtdAcoes":1,"oQueFazer":"1. Realizar a organização dos cabos no local instalado ou alocar o switch em caixa suspensa na alvenaria do laboratório","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Odair","status":"pendente","foto":null},{"id":"a2-10","numero":10,"problema":"USO DE ADAPTADOR E EXTENSÃO CURTA PARA CONEXÃO COM O TELEFONE DO SETOR","qtdAcoes":1,"oQueFazer":"1. Instalar uma extensão nova com comprimento suficiente até o ponto de uso do telefone","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Odair","status":"concluido","foto":null},{"id":"a2-11","numero":11,"problema":"PISO APRESENTANDO CERÂMICA COM DESGASTE","qtdAcoes":null,"oQueFazer":"1. Realizar troca de cerâmica com sinais de desgaste","prazo":{"type":"text","value":"Cancelado"},"responsavel":"ODAIR","status":"pendente","foto":null},{"id":"a2-12","numero":12,"problema":"VIDROS APRESENTANDO RACHADURAS NA DIVISÓRIA DO LABORATÓRIO E DEPT","qtdAcoes":1,"oQueFazer":"1. Solicitar a troca de vidros rachados e proteção com película transparente para evitar estilhaços acaso houvesse quebra","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Odair","status":"pendente","foto":null},{"id":"a2-13","numero":13,"problema":"MATERIAIS SEM UTILIDADE NA PAREDE EXTERNA","qtdAcoes":1,"oQueFazer":"1. Solicitar a retirada de materiais sem utilidade","prazo":{"type":"date","value":"2026-03-23"},"responsavel":"Odair","status":"concluido","foto":null}],"auditorias":{"c3-a1":{"nota":88.0,"comentario":""},"c3-a2":{"nota":89.0,"comentario":""},"c3-a3":{"nota":89.0,"comentario":""}}},{"id":"area-3","nome":"Destilaria","departamento":"Industrial","lider":"DAVID","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-16","itens":[{"id":"a3-1","numero":1,"problema":"ANDAIME DE MANUTENÇÃO PRESENTE NO LOCAL","qtdAcoes":1,"oQueFazer":"1. Solicitar retirada do andaime do setor da manutenção;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-2","numero":2,"problema":"ESTRUTURAS PRECISANDO DE PINTURA","qtdAcoes":2,"oQueFazer":"1. Realizar pintura nas dornas;\n2. Realizar pintura nas tubulações","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-3","numero":3,"problema":"VÁLVULA SEM HASTE NA PASSAGEM DA RAMPA","qtdAcoes":1,"oQueFazer":"1. Providenciar a haste ou troca da válvula ou ainda a retirada caso não tenha mais utilidade;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-4","numero":4,"problema":"PISO DANIFICADO COM USO DE CHAPARIAS PARA PASSAGEM DE EMPILHADEIRA","qtdAcoes":1,"oQueFazer":"1. Solicitar reparo no piso de alvenaria e retirar posteriormente as chapas","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-5","numero":5,"problema":"CABOS DE FIAÇÃO ELÉTRICA PRECISANDO DE READEQUAÇÃO;","qtdAcoes":1,"oQueFazer":"1. Solicitar ao setor de manutenção elétrica a readequação da instalação dos cabos;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-6","numero":6,"problema":"NECESSIDADE DE PINTURA NAS TORRES DE RESFRIAMENTO","qtdAcoes":1,"oQueFazer":"1. Realizar pintura na estrutura da torre de resfriamento maior.","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-7","numero":7,"problema":"TETO DO SUPERVISÓDIO COM UM BURACO TAMPADO COM RECORTE DE MADEIRA","qtdAcoes":1,"oQueFazer":"1. Solicitar o fechamento com alvenaria a Eng. Civil","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-8","numero":8,"problema":"AR CONDICIONADO COM INSTALAÇÃO FORA DE PADRONIZAÇÃO","qtdAcoes":2,"oQueFazer":"1. Realizar adequamento na instalação com novo isolamento entorno do aparelho;\n2. Realocar instalação elétrica para estar mais próxima do aparelho.","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-9","numero":9,"problema":"BANHEIRO PRÓXIMO AO SUPERVISÓRIO COM SUJIDADES; FALTA DE PIA PARA LAVAGEM DAS MÃOS;","qtdAcoes":2,"oQueFazer":"1. Solicitar instalação de pia;\n2. Realizar limpeza geral do ambiente;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-10","numero":10,"problema":"FALTA DE ILUMINAÇÃO","qtdAcoes":1,"oQueFazer":"1. Solicitar instalação de iluminação no local.","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-11","numero":11,"problema":"ARMÁRIOS SEM IDENTIFICAÇÃO; MATERIAIS DIVERSOS FORA DOS ARMÁRIOS;\nESTRUTURA COM ARMÁRIO DENTRO DE OUTRO.","qtdAcoes":1,"oQueFazer":"1. Separar os armários que estão em composição ou solicitar um novo para atender a utilização do local","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-12","numero":12,"problema":"PRESENÇA DE MATERIAIS SEM UTILIDADE","qtdAcoes":1,"oQueFazer":"1. Retirar materiais do local","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"David","status":"concluido","foto":null},{"id":"a3-13","numero":13,"problema":"PAREDES DO AMBIENTE COM SUJIDADES","qtdAcoes":1,"oQueFazer":"1. Realizar pintura nas paredes do ambiente.","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-14","numero":14,"problema":"FALTA DE ACABAMENTO NA ESTRUTURA COM PASSAGEM DE TUBULAÇÕES","qtdAcoes":2,"oQueFazer":"1. Solicitar reparo no acabamento na alvenaria e retirar o apoio colocado na tubulação;\n2. Realização de pintura após reparo;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-15","numero":15,"problema":"AMBIENTE DE GUARDA DE SACOS PRECISANDO DE PINTURA","qtdAcoes":1,"oQueFazer":"1. Solicitar pintura com tinta adequada para a possibilidade de lavar o ambiente sempre que for necessário","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-16","numero":16,"problema":"FALTA DE PINTURA NA ESCADA DE ACESSO A CENTRÍFUGA","qtdAcoes":1,"oQueFazer":"Realizar pintura na escada de acesso a centrífuga","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"concluido","foto":null},{"id":"a3-17","numero":17,"problema":"PRESENÇA DE MATERIAIS E CAIXOTE SEM UTILIZAÇÃO AO LADO DA ESCADARIA","qtdAcoes":1,"oQueFazer":"1. Separar materiais de utilididade e descartar os que não serão mais utilizados","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"David","status":"concluido","foto":null},{"id":"a3-18","numero":18,"problema":"PAINEL COM RISCO EM ÁREA ACIMA DE CENTRIFUGAÇÃO","qtdAcoes":1,"oQueFazer":"1. Verificar realocação deste quadro para evitar problemas por grande volume de líquido vindo na parte superior da plataforma de centrifugação","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-19","numero":19,"problema":"ACUMULO DE RESÍDUO LÍQUIDO ENTORNO DO EQUIPAMENTO NA FÁBRICA DE LEVEDURA","qtdAcoes":1,"oQueFazer":"1. Necessidade de nivelamento do piso para facilitar escoamento e limpeza do setor","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-20","numero":20,"problema":"FALTA DE PINTURA E PADRONIZAÇÃO NA IDENTIFICAÇÃO DAS DORNAS","qtdAcoes":2,"oQueFazer":"1. Realizar serviço de pintura em Dronas e Pré Fermentadores\n2. Padronização na identificação das dornas e PFs","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-21","numero":21,"problema":"ACUMULO DE MATERIAIS DIVERSOS NO FUNDO DA PASSARELA DAS DORNAS","qtdAcoes":2,"oQueFazer":"1. Retirar materiais sem utilidade;\n2. Padronizar a área para delimitação e uso de materiais","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"David","status":"concluido","foto":null},{"id":"a3-22","numero":22,"problema":"MATERIAIS SEM UTILIDADE NA ÁREA","qtdAcoes":1,"oQueFazer":"1. Retirar materiais do local e os que estão soldados sem utilidade","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"David","status":"concluido","foto":null},{"id":"a3-23","numero":23,"problema":"MATERIAIS UTILIZADOS COMO APOIO NA ENTRESSAFRA DEIXADOS DURANTE A OPERAÇÃO DE SAFRA SEM UTILIDADE NO LOCAL","qtdAcoes":1,"oQueFazer":"1. Retirar materiais sem utilidade fora do momento de manutenção do aparelho","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null},{"id":"a3-24","numero":24,"problema":"PRESENÇA DE MATERIAIS SEM UTILIDADE ENTORNO DO COLETOR DE LIXO; CRESCIMENTO DO MATO E VEGETAÇÃO NO LOCAL","qtdAcoes":2,"oQueFazer":"1. Retirar materiais sem utilidade próximos ao coletor de lixo;\n2. Realizar a capinação do mato ou solicitar serviço para deixar o coletor de lixo livre e à vista de todos","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"David","status":"concluido","foto":null},{"id":"a3-25","numero":25,"problema":"PRESENÇA DE ARMÁRIOS ENTORNO DA ÁREA SEM IDENTIFICAÇÃO","qtdAcoes":1,"oQueFazer":"1. Verificar com o setor ou demais setores para qual finalidade a presença destes armários e eliminar do ambiente ou realocar realizando padronização","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"David","status":"concluido","foto":null},{"id":"a3-26","numero":26,"problema":"CANO QUE CONDUZ FIAÇÃO ELÉTRICA QUEBRADO","qtdAcoes":1,"oQueFazer":"1. Solititar o conserto/troca da tubulação ou criar outro meio de passagem da fiação","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"David","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":79.0,"comentario":""}}},{"id":"area-4","nome":"Armazéns E Área De Envase","departamento":"Industrial","lider":"NELSON BRÁS","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-16","itens":[{"id":"a4-1","numero":1,"problema":"PAREDE PRECISANDO DE PINTURA;","qtdAcoes":2,"oQueFazer":"1. Solicitar instalação de bicas no telhado para evitar sujeira na parede e/ou mudança no projeto de exaustão do pó de açúcar no telhado;\n\n2. Realizar pintura","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-2","numero":2,"problema":"TELHADO PRÓXIMO A PONTE ROLANTE COM GOTEIRAS","qtdAcoes":1,"oQueFazer":"1. Realizar a troca das telhas","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-3","numero":3,"problema":"PRESENÇA DE PÓ NOS EQUIPAMENTOS E OBSTRUÇÃO DO AR CONDICIONADO COM FREQUÊNCIA","qtdAcoes":1,"oQueFazer":"1. Adquirir e/ou melhorar sistema de exautão para retirada do pó presente no ambiente","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-4","numero":4,"problema":"DIFICULDADE NA UTILIZAÇÃO NA PASSAGEM DO ESPAÇO PARA REALIZAÇÃO DA LIMPEZA DO SETOR","qtdAcoes":1,"oQueFazer":"1. Solicitar a caldeiraria uma escada auxiliar para a diferença de nível no piso do setor;","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Brás","status":"concluido","foto":null},{"id":"a4-5","numero":5,"problema":"COBERTURA SUJA; NECESSIDADE DE REPAROS","qtdAcoes":2,"oQueFazer":"1. Realizar a limpeza;\n2. Restaurar a fixação ou trocar parte da cobertura solta","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Brás","status":"concluido","foto":null},{"id":"a4-6","numero":6,"problema":"PRESENÇA DE CABEAMENTO SEM UTILIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Verificar com setor da instrumentação a retirada dos cabos caso não houver utilidade ou aplicar em algum equipamento pendente","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Brás","status":"concluido","foto":null},{"id":"a4-7","numero":7,"problema":"PISO NECESSITANDO DE NOVA PINTURA; FALTA DE DERMARCAÇÃO E LAYOUT PARA LOTES DE EMBALAGENS","qtdAcoes":2,"oQueFazer":"1. Realizar limpeza e nova pintura no piso;\n2. Definir layout para alocação de embalagens do envase","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-8","numero":8,"problema":"ESTRUTURA DANIFICADA NA PAREDE QUE ALOCA AS EMBALAGENS","qtdAcoes":2,"oQueFazer":"1. Solicitar o reparo e Eng. Civil.\n2. Realizar a pintura","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Brás","status":"concluido","foto":null},{"id":"a4-9","numero":9,"problema":"FALTA DE COBERTURA NO MOTOR E LIGAÇÃO DE EIXOS ENTRE DOIS SOPRADORES","qtdAcoes":1,"oQueFazer":"1. Solicitar ao setor da Manutenção a cobertura","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-10","numero":10,"problema":"TELA RASGADA E COM SUJIDADES","qtdAcoes":2,"oQueFazer":"1. Solicitar a retirada desta passagem de ar e vedar com alvenaria;\n2. Realizar pintura","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Brás","status":"concluido","foto":null},{"id":"a4-11","numero":11,"problema":"EQUIPAMENTOS SEM UTILIDADE","qtdAcoes":1,"oQueFazer":"1. Solicitar a retirada dos  equipamentos sem utilidade com o setor da Manutenção","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Brás","status":"concluido","foto":null},{"id":"a4-12","numero":12,"problema":"MATERIAIS SEM UTILIDADE ACIMA DA ESTRUTURA","qtdAcoes":1,"oQueFazer":"1. Retirar materiais sem utilização","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Brás","status":"concluido","foto":null},{"id":"a4-13","numero":13,"problema":"PRESENÇA DE INFILTRAÇÃO NA PAREDE","qtdAcoes":2,"oQueFazer":"1. Solicitar a retirada da infiltração da parede\n2. Realizar pintura","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Brás","status":"concluido","foto":null},{"id":"a4-14","numero":14,"problema":"PISO NECESSITANDO DE REPAROS PARA UTILIZAR O QUARTO DE LIMPEZA DENTRO DO ENVASE","qtdAcoes":1,"oQueFazer":"1. Solicitar retirada da antiga pintura e refazer","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Brás","status":"concluido","foto":null},{"id":"a4-15","numero":15,"problema":"ESPAÇO INSUFICIENTE PARA ALOCAÇÃO DE MATERIAL. CADA PORTA ACOMODA MATERIAL DE 3 COLABORADORES","qtdAcoes":1,"oQueFazer":"1. Retirar armários de alvenaria e adquirir novos armários padrão do vestiário geral ou realizar reforma nos existentes diminuindo a quantidade de colaboradores a utilizar os vãos","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-16","numero":16,"problema":"ESCADAS DAS ANTIGAS ENTRADAS AO ARMAZÉM. ÁREA DE PASSAGEM NA CALÇADA PREJUDICADA.","qtdAcoes":1,"oQueFazer":"1. Solicitar a construção civil para eliminar a escadaria de acesso que não há mais acesso;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-17","numero":17,"problema":"AÇÚCAR DERRADO AO CHÃO EM CIMA DE LONA PRETA; SUJIDADES NA ESTRUTURA","qtdAcoes":2,"oQueFazer":"1. Solicitar ao setor da manutenção para reduzir ao máximo a incidência de rasgos no transporte de sacos de açúcar nas esteiras;\n2 Criar um coletor de açúcar tubular com válvula no fundo para retirada de açúcar vazado","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-18","numero":18,"problema":"ESTRUTURA PREDIAL COM SUJIDADES;  SINALIZAÇÃO APAGADA DE DIRECIONAMENTO DE PEDESTRES E VEÍCULOS","qtdAcoes":3,"oQueFazer":"1. Solicitar a plataforma e equipe da construção civil para pintura geral dos armazéns;\n2. Padronizar a pintura junto as portas de emergências na parte lateral;\n3. Revisar as identificações de direcionamento de pedestres e veículos.","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-19","numero":19,"problema":"TELHADO DO ARMAZÉM 1 COM FUROS E DETERIORAZAÇÃO CRIANDO GOTEIRAS COM CHUVA","qtdAcoes":1,"oQueFazer":"1. Trocar peças das telhas danificadas","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-20","numero":20,"problema":"FIAÇÃO PENDURADA NOS APOIOS DA ESTRUTURA DA ÁREA EXTERNA DO CD","qtdAcoes":1,"oQueFazer":"1. Solicitar a adequação na passagem da fiação","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-21","numero":21,"problema":"FALTA DE ESPAÇO PARA GUARDAR MATERIAIS DE LIMPEZA DOS ARMAZÉNS","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng. Civil a construção no espaço posterior ao CCM da casa de bomba, um quarto (ou área similar) para guarda de materiais de limpeza e apoio dos armazéns","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-22","numero":22,"problema":"RETIRADA DAS ANTIGAS PORTAS DENTRO DOS ARMAZÉNS 1 E 2","qtdAcoes":1,"oQueFazer":"1. Solicitar a equipe de manutenção a retirada da porta e materiais envolvidos","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-23","numero":23,"problema":"DIVERSOS MATERIAIS DA CONSTRUÇÃO CIVIL ALOCADOS NA ÁREA DELIMITADA DO ARMAZÉM","qtdAcoes":1,"oQueFazer":"1. Verificar com a Eng. Civil alocação de material ou delimitação dos mesmos através de construção de layouts","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-24","numero":24,"problema":"FALTA DE BLOQUEIO DE ACESSO AO POÇO DE BOMBEAMENTO DE ÁGUA","qtdAcoes":1,"oQueFazer":"1. Solicitar um gradeamento para tornar o acesso controlado impedindo livre acesso","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null},{"id":"a4-25","numero":25,"problema":"CAIXA COM FIOS EXPOSTOS SEM ORGANIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Verificar com setor de Instrumentação / TI a adequação dos fios expostos","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Brás","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":84.0,"comentario":""}}},{"id":"area-5","nome":"Mesas, Tombador E Esteiras","departamento":"Industrial","lider":"MARCONE","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-16","itens":[{"id":"a5-1","numero":1,"problema":"TOMBADORES COM PINTURA INACABADA SEM PADRONIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Realizar pintura dos equipamentos de forma uniforme","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Marcone","status":"concluido","foto":null},{"id":"a5-2","numero":2,"problema":"MATERIAIS SEM UTILIZAÇÃO, DESORGANIZADOS EMBAIXO DA CHAPARIA DE DESCARREGAMENTO DO TOMBADOR 3","qtdAcoes":3,"oQueFazer":"1. Retirar materiais embaixo da chaparia e realocar em outra localidade;\n2. Descartar materiais sem utilidades ou encaminhar para sucata;\n3. Ordenar materiais necessários em outra localidade","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Marcone","status":"concluido","foto":null},{"id":"a5-3","numero":3,"problema":"DIFICULDADE NA LIMPEZA NA CHAPA INCLINADA SUPERIOR ABAIXO DO RETORNO DA 4° ESTEIRA","qtdAcoes":null,"oQueFazer":"1. Solicitar a extensão da alvenaria do piso para retirada das sujidades da chapa;","prazo":{"type":"text","value":"Cancelado"},"responsavel":"MARCONE","status":"pendente","foto":null},{"id":"a5-4","numero":4,"problema":"ESCOAMENTO DA SUCÇÃO DO CAVUCO ATRAVESSANDO A RUA AO LADO DA ESTEIRA","qtdAcoes":1,"oQueFazer":"1. Criar um escoamento de águas residuais do cavuco direcionado ao sistema de decantação do navio.","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Marcone","status":"pendente","foto":null},{"id":"a5-5","numero":5,"problema":"MATERIAIS SEM UTILIZAÇÃO COM CHAPARIAS","qtdAcoes":1,"oQueFazer":"1. Retirar chaparias e tubos que podem ser reaproveitados ou colocar para sucata","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Marcone","status":"pendente","foto":null},{"id":"a5-6","numero":6,"problema":"ÁREA SEM UTILIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Realizar a eliminação deste espaço nivelando ao piso geral","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Marcone","status":"pendente","foto":null},{"id":"a5-7","numero":7,"problema":"MATERIAIS SEM UTILIZAÇÃO COM CHAPARIAS","qtdAcoes":null,"oQueFazer":"1. Retirar chaparias e tubos que podem ser reaproveitados ou colocar para sucata","prazo":{"type":"text","value":"Cancelado"},"responsavel":"MARCONE","status":"pendente","foto":null},{"id":"a5-8","numero":8,"problema":"ÁREA SEM UTILIZAÇÃO, ACUMULANDO ÁGUA","qtdAcoes":null,"oQueFazer":"1. Realizar a eliminação deste espaço nivelando ao piso geral","prazo":{"type":"text","value":"Cancelado"},"responsavel":"MARCONE","status":"pendente","foto":null},{"id":"a5-9","numero":9,"problema":"PAINEL DE COMANDO SEM UTILIDADE NO LADO ESQUERDO","qtdAcoes":1,"oQueFazer":"1. Solicitar ao setor da elétrica a retirada do painel sem utilidade","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Marcone","status":"concluido","foto":null},{"id":"a5-10","numero":10,"problema":"TUBULAÇÕES COM BAIXA ALTURA NECESSITANDO REPAROS; ALGUMAS TUBULAÇÕES DESATIVADAS","qtdAcoes":2,"oQueFazer":"1. Elevar a altura das tubulações em uso para facilitar passagem de empilhadeira.\n2. Retirar outras que não tem mais utilidade","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Marcone","status":"pendente","foto":null},{"id":"a5-11","numero":11,"problema":"TUBULAÇÕES DO ANTIGO SISTEMA AMERICANO SEM UTILIZAÇÃO","qtdAcoes":null,"oQueFazer":"1. Solicitar a retirada das tubulações que não tem mais utilidade","prazo":{"type":"text","value":"Cancelado"},"responsavel":"MARCONE","status":"pendente","foto":null},{"id":"a5-12","numero":12,"problema":"VAZAMENTO EM TUBULAÇÃO ACIMA DA ESTRUTURA;\nESPAÇO CRIADO INACABADO PARA ÁREA PRÓXIMA AO BANHEIRO.","qtdAcoes":null,"oQueFazer":"1. Solicitar reparo na tubulação que atravessa acima do espaço criado;\n2. Verificar com Eng. Civil a finialização do espaço a ser utilizado","prazo":{"type":"text","value":"Cancelado"},"responsavel":"MARCONE","status":"pendente","foto":null},{"id":"a5-13","numero":13,"problema":"FALTA DE ORGANIZAÇÃO NO AMBIENTE PRÓXIMO A 1° NAVALHA; PRESENÇA DE SACOS AMARELOS NA PAREDE DIVIDINDO OUTRA ÁREA POSTERIOR","qtdAcoes":2,"oQueFazer":"1. Retirar materiais sem utilização.\n2. Retirar sacos com pregos na parede","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Marcone","status":"concluido","foto":null},{"id":"a5-14","numero":14,"problema":"FALTA PADRONIZAÇÃO NO REBOCO DA PAREDE E PINTURA","qtdAcoes":2,"oQueFazer":"1. Realizar reboco e uniformidade na parede;\n2 . Realizar pintura do quarto","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Marcone","status":"concluido","foto":null},{"id":"a5-15","numero":15,"problema":"FALTA DE LAYOUT","qtdAcoes":1,"oQueFazer":"1. Criar layout e padronizar a alocação de materiais no quarto.","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Marcone","status":"pendente","foto":null},{"id":"a5-16","numero":16,"problema":"ILUMINAÇÃO INSTALADA SEM PADRONIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Realizar nova instalação de iluminação no ambiente padronizado","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Marcone","status":"pendente","foto":null},{"id":"a5-17","numero":17,"problema":"TETO DO QUARTO DA 1° NAVALHA PRECISANDO DE REPARO E ACABAMENTO","qtdAcoes":2,"oQueFazer":"1. Relizar reparo e acabamento do teto;\n2. Realizar pintura","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Marcone","status":"concluido","foto":null},{"id":"a5-18","numero":18,"problema":"ESTRUTURA DANIFICADA NECESSITANDO DE REPAROS, PRÓXIMO AO CCM DAS ESTEIRAS","qtdAcoes":2,"oQueFazer":"1. Realizar reparo estrutural na estrutura;\n2 . Realizar pintura da estrutura","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Marcone","status":"concluido","foto":null},{"id":"a5-19","numero":19,"problema":"FIAÇÃO SEM UTILIZAÇÃO PRÓXIMO AO CCM DAS ESTEIRAS","qtdAcoes":1,"oQueFazer":"1. Solicitar a retirada da fiação caso não houver utilidade ou aplicar seu uso devido","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Marcone","status":"concluido","foto":null},{"id":"a5-20","numero":20,"problema":"PRESENÇA DE LUMINÁRIA SEM UTILIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Retirar a luminária sem utilidade do local","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Marcone","status":"concluido","foto":null},{"id":"a5-21","numero":21,"problema":"ESTRUTURA DO MURO DE TOMBAMENTO DE CANA DO ESTOQUE COMPROMETIDO; PISO DE PASSAGEM DA ENTREGA DE CANA PRECISANDO DE REPAROS","qtdAcoes":2,"oQueFazer":"1. Solicitar a Eng. Civil o reparo da estrutura e pintura da parede;\n2. Realizar reparos no piso de transitação das cargas de cana","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Marcone","status":"concluido","foto":null},{"id":"a5-22","numero":22,"problema":"LOCAL PARA APOIO A OPERAÇÃO DOS COLABORADORES DA LIMPEZA DAS CARROÇAS NECESSITANDO DE MELHORIAS ESTRUTURAIS","qtdAcoes":1,"oQueFazer":"1. Solicitar construção de uma unidade de apoio para a operação no local de alvenaria","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Marcone","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":67.0,"comentario":""}}},{"id":"area-6","nome":"Fabricação","departamento":"Industrial","lider":"GILBERTO","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-17","itens":[{"id":"a6-1","numero":1,"problema":"EXCESSO DE ÁGUA NO AMBIENTE FABRIL","qtdAcoes":1,"oQueFazer":"1. Realizar modificações no escoamento da galeria principal do prédio da Fabricação com apoio da Eng. Civil","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-2","numero":2,"problema":"DANOS NA ESTRUTURA DO PISO COM PASSAGEM DA EMPILHADEIRA","qtdAcoes":1,"oQueFazer":"1. Realizar retorma da estrutura do piso da fabricação","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-3","numero":3,"problema":"AUSÊNCIA DA TALHA PARA GUARDA DE PRODUTO QUÍMICO (BOMBOBA DE 200 L)","qtdAcoes":1,"oQueFazer":"1. Solcitar compra e instalação de nova talha","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-4","numero":4,"problema":"SUJIDADES NA PAREDES DO DECANTADOR","qtdAcoes":1,"oQueFazer":"1. Realizar pintura no entorno dos decantadores","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Gilberto","status":"concluido","foto":null},{"id":"a6-5","numero":5,"problema":"VAZAMENTO NO PISO DE CHAPARIA DO FILTRO DO FLOTADOR DE XAROPE","qtdAcoes":1,"oQueFazer":"1. Realizar vedações necessárias para evitar vazamentos no piso térreo da fabricação","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-6","numero":6,"problema":"ITEM DE ILUMINAÇÃO SEM UTILIDADE PRÓXIMO DA DOSAGEM DE PRODUTOS QUÍMICO CLARIFICANTE","qtdAcoes":1,"oQueFazer":"1. Solicitar a retirada do material sem uso ou adequar uma iluminação padronizada","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Gilberto","status":"concluido","foto":null},{"id":"a6-7","numero":7,"problema":"ESTRUTURAS PRECISANDO DE PINTURAS","qtdAcoes":1,"oQueFazer":"1. Realizar pintura e proteção na estrutura contra sujidades vinda da parte superior","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-8","numero":8,"problema":"SUJEIRA NO PISO DURANTE A OPERAÇÃO DEVIDO A OBSTRUÇÃO DE GALERIA;","qtdAcoes":1,"oQueFazer":"1. Realizar desobstrução da galeria em torno do local ou construir outra galeria","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-9","numero":9,"problema":"VAZAMENTOS PROVENIENTES DO PISO SUPERIOR SUJANDO A ESTRUTURA DA BOMBA E TUBULAÇÕES","qtdAcoes":2,"oQueFazer":"1. Solicitar ao setor da Manutenção a conclusão da melhoria de vedação da 1° mexedeira;\n2. Realizar vedação de brechas das chaparias no piso superior","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-10","numero":10,"problema":"FALTA DE HIGINENIZAÇÃO NA TUBULAÇÃO; FALTA DE PINTURA EM TRECHOS DA TUBULAÇÃO;\n SUJEIRA NO ENTORNO DA BOMBA","qtdAcoes":2,"oQueFazer":"1. Realizar limpeza nas tubulações;\n2. Realizar pinturas nas tubulações;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-11","numero":11,"problema":"PRESENÇA DE ABERTURAS NO PISO SUPERIOR DAS MEXEDEIRAS OCASIONANDO GOTEIRAS NO PISO DA FÁBRICAÇÃO","qtdAcoes":1,"oQueFazer":"1. Solicita ao Setor da Manutenção a vedação do piso de chaparia presente no piso das mexedeiras","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-12","numero":12,"problema":"DANOS NA ESTRUTURA DE COBERTURA E ISOLAMENTO PRÓXIMO DA MEXEDEIRA","qtdAcoes":1,"oQueFazer":"1. Realizar a troca da vedação da tubulação","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-13","numero":13,"problema":"FALTA PINTURA E CONSERVAÇÃO NA ENXOFREIRA","qtdAcoes":1,"oQueFazer":"1. Realizar pintura","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Gilberto","status":"concluido","foto":null},{"id":"a6-14","numero":14,"problema":"PORTA DO QUARTO FRENTE A ENXOFREIRA COM PASSAGEM DE POEIRA","qtdAcoes":1,"oQueFazer":"1. Realizar compra de nova porta para local;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-15","numero":15,"problema":"ÁREA INTERNA COM FALTA DE PINTURA, PADRONIZAÇÃO E NECESSITANDO DE REPAROS NO TETO","qtdAcoes":2,"oQueFazer":"1. Restaurar paredes e seu acabamento;\n2. Realizar pintura","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-16","numero":16,"problema":"Teto de chaparia necessitando de reparos na estrutura","qtdAcoes":1,"oQueFazer":"1. Solicita ao Setor da Manutenção a restauração do piso de chaparia com devidas vedações","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-17","numero":17,"problema":"FIAÇÃO ELÉTRICA COM PASSAGEM NO MEIO DA ÁREA, PREJUDICANDO A UTILIZAÇÃO DO ESPAÇO","qtdAcoes":1,"oQueFazer":"1. Solciitar alteração na passagem do cabeamento para liberar espaço e melhorar a segurança","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-18","numero":18,"problema":"PRESENÇA DE SUJIDADES NAS PAREDES E TUBULAÇÕES","qtdAcoes":3,"oQueFazer":"1. Realizar limpeza da parede e tubulações;\n2. Realizar pintura das tubulações;\n3. Realizar melhorias de piso superior ou calha para evitar água / rejeito da parte superior","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-19","numero":19,"problema":"MATERIAIS NA ÁREA DE PREPARAÇÃO DA ENXOFREIRA SEM INDENTIFICAÇÃO; CARRINHO DE TRANSPORTE DO ENXOFRE SEM PADRONIZAÇÃO NAS ALÇAS","qtdAcoes":3,"oQueFazer":"1. Separar materiais sem utilidade e descartar;\n2. Realizar layout e definição de padronização na área;\n3. Realizar adequações no carrinho de enxofre com alças no mesmo tamanho e pintura","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Gilberto","status":"concluido","foto":null},{"id":"a6-20","numero":20,"problema":"PAREDES NECESSITANDO REPARO NO ACABAMENTO E PINTURA","qtdAcoes":2,"oQueFazer":"1. Realizar reparo na parede lateral direita na parte superior e na de fundo;\n2. Realizar pintura das paredes","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Gilberto","status":"concluido","foto":null},{"id":"a6-21","numero":21,"problema":"TETO DO AMBIENTE DA ENXOFREIRA PRECISANDO DE REPAROS E PINTURA","qtdAcoes":2,"oQueFazer":"1. Solicitar reparos necessários na alvenaria no teto;\n2. Realizar pintura do teto","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-22","numero":22,"problema":"TETO APRESENTANDO DANOS ESTRUTURAIS PRÓXIMO DA ÁREA DE PREPARO DA ENXOFREIRA","qtdAcoes":2,"oQueFazer":"1. Solicitar reparo na alvenaria;\n2. Realizar pintura","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-23","numero":23,"problema":"GOTEIRAS DO PISO DOS AQUECEDORES E PENEIRAS ESTÁTICAS PARA O TÉRREO","qtdAcoes":1,"oQueFazer":"1. Solicitar ao setor da Caldeiraria vedação dos pontos de passagem de água ou criar uma bandeja com escoamento direcionado.","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-24","numero":24,"problema":"CALHAS SEM INSTALAÇÃO PADRONIZADA, ESPALHANDO CHUVA AO REDOR DO PISO","qtdAcoes":1,"oQueFazer":"1. Solicitar serviço para conclusão ou reparo na descida de águas provenientes das calhas nos setores da fabricação","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-25","numero":25,"problema":"VAPOR SAINDO PELA GALERIA EM DIREÇÃO AS BOMBAS DE CALDO CALEADO","qtdAcoes":1,"oQueFazer":"1. Restruturar a galeria","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-26","numero":26,"problema":"ACUMULO DE SUJIDADES DE REJEITOS LÍQUIDOS  POR TRÁS DA BOMBA DE CALDO CALEADO","qtdAcoes":1,"oQueFazer":"1. Nivelar o piso para que este volume não se acumule neste local","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-27","numero":27,"problema":"SUJIDADES PRESENTES NA PORTA;\nFALTA DE PINTURA NO CORRIMÃO;\nSUJIDADES NA PAREDE.","qtdAcoes":3,"oQueFazer":"1. Realizar a limpeza da porta presente no ambiente;\nemergência presente;\n2. Realizar pintura do corrimão;\n3. Solicitar pintura em toda a extensão da parede.","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Gilberto","status":"concluido","foto":null},{"id":"a6-28","numero":28,"problema":"LAMPADA DE EMERGÊNCIA COM SUJIDADES E VERIFICAR FUNCIONALIDADE.","qtdAcoes":1,"oQueFazer":"1. Realizar limpeza e verificação na iluminação de emergência presente;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-29","numero":29,"problema":"FALTA DE PINTURA NAS TUBULAÇÕES DIFICULTANDO A IDENTIFICAÇÃO DO FLUIDO; FALTA DE PINTURA NA ESTRUTURA DAS VIGAS; PRESENÇA DE FIAÇAO JUNTO AO CHÃO MOLHADO","qtdAcoes":3,"oQueFazer":"1. Realizar pintura nas tubulações;\n2. Realizar pintura nas vigas da estrutura predial;\n3. Verificar fiação se há utilidade e caso não houver solicitar a retirada;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-30","numero":30,"problema":"FALTA DE PINTURA E IDENTIFICAÇÃO NAS TUBULAÇÕES; PAREDE COM SUJIDADES NECESSITANDO DE LIMPEZA E PINTURA;","qtdAcoes":2,"oQueFazer":"1. Realizar pintura nas tubulações;\n2. Limpar as paredes e realizar pintura;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-31","numero":31,"problema":"MATERIAIS SEM UTILIDADE NO SETOR POR TRÁS DE UM PAINEL DA ELÉTRICA AO LADO DO TANQUE DE MEL","qtdAcoes":1,"oQueFazer":"1. Retirar materiais sem utilidade","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Gilberto","status":"concluido","foto":null},{"id":"a6-32","numero":32,"problema":"MATERIAIS DE ILUMINAÇÃO SEM USO NA PAREDE","qtdAcoes":1,"oQueFazer":"1. Solicitar a retirada do material sem uso ou adequar uma iluminação padronizada","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-33","numero":33,"problema":"SUJIDADES NAS PAREDES E TUBULAÇÃO","qtdAcoes":2,"oQueFazer":"1. Realizar limpeza da parede;\n2. Realizar limpeza de tubulação e/ou pintura","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-34","numero":34,"problema":"PRESENÇA DE EXCESSO DE SUJIDADES DE TORTA QUANDO HÁ CARREGAMENTO","qtdAcoes":1,"oQueFazer":"1. Realizar melhoria da galeira para escoamento de resíduos provenientes do carregamento","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-35","numero":35,"problema":"CALHA PROTEGENDO A BOMBA POR SUJIDADES;","qtdAcoes":1,"oQueFazer":"1. Relizar melhorias para coleta dos resíduos da operação sem cair no motor da bomba;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-36","numero":36,"problema":"INSTALAÇÃO ELÉTRICA COM PRESENÇA DE ÁGUA E TORTA.","qtdAcoes":1,"oQueFazer":"1. Verificar com setor elétrico melhorias na passagem dos fios no ambiente no piso molhado","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-37","numero":37,"problema":"FALTA DE PINTURA NAS TUBULAÇÕES E ESTRUTURAS; EXCESSO DE SUJIDADE DE TORTA; PRANCHAS DE MADEIRAS COMO PISO; CAPAS DE PROTEÇÃO DAS BOMBAS FORA DO LUGAR","qtdAcoes":2,"oQueFazer":"1. Realizar pintura nas tubulações e estruturas ao entorno;\n2. Retirar pranchas de madeira como passagem;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-38","numero":38,"problema":"FALTA PINTURA DA ÁREA DE ALVENARIA;","qtdAcoes":1,"oQueFazer":"1. Realizar pintura na parede","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-39","numero":39,"problema":"NECESSIDADE DE PINTURA DA TUBULAÇÃO E TANQUE;","qtdAcoes":1,"oQueFazer":"1. Realizar pintura nas tubulações e tanque;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-40","numero":40,"problema":"REALIZAR REPAROS NA ALVENARIA E PINTURA AO LADO DO TANQUE PULMÃO DE ÁGUA CONDENSADA","qtdAcoes":2,"oQueFazer":"1. Realizar reparos e acabamento na alvenaria;\n2. Realizar pintura","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-41","numero":41,"problema":"MATERIAIS SEM UTILIDADE NO AMBIENTE","qtdAcoes":1,"oQueFazer":"1. Realizar retirada de materiais sem utilidades do ambiente","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-42","numero":42,"problema":"FALTA DE PADRONIZAÇÃO NAS TUBULAÇÕES DE ÁGUA CONDENSADA","qtdAcoes":1,"oQueFazer":"1. Realizar pintura","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-43","numero":43,"problema":"NECESSIDADE DE PINTURA NAS PAREDES E ESTRUTURA","qtdAcoes":1,"oQueFazer":"1. Realizar pintura nas paredes;","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Gilberto","status":"concluido","foto":null},{"id":"a6-44","numero":44,"problema":"FALTA DE PINTURA","qtdAcoes":1,"oQueFazer":"1. Realizar pintura","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Gilberto","status":"concluido","foto":null},{"id":"a6-45","numero":45,"problema":"GALERIA DANIFICADA PROXIMO AS BOMBAS DE MEL E MAGMA;","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng. Civil reparo na galeria danificada.","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-46","numero":46,"problema":"EXCESSO DE SUJIDADE AO ENTORNO DA BOMBA DE MAGMA","qtdAcoes":1,"oQueFazer":"1. Realizar limpeza entorno da bomba","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Gilberto","status":"concluido","foto":null},{"id":"a6-47","numero":47,"problema":"FIAÇÃO ELÉTRICA DESORGANIZADA EM PADRONIZAÇÃO POR TRÁS DAS CENTRÍFUGAS DE MASSA B","qtdAcoes":1,"oQueFazer":"1. Solicitar o setor da Elétrica a padronização das ligações","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-48","numero":48,"problema":"SUJEIRA NO CANTO ESQUERDO DE VAZAMENTOS","qtdAcoes":1,"oQueFazer":"1. Criar uma bandeja para evitar cair massa no canto esquerdo da foto, direcionar para o diluidor","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-49","numero":49,"problema":"TERMINAÇÃO DE QUEDA D'GUA DA CALHA DANIFICADA","qtdAcoes":1,"oQueFazer":"1. Realizar a troca do material por tubulação de PVC","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-50","numero":50,"problema":"MATERIAS SEM UTILIDADE NO LOCAL PRESENTES E DESPERDÍCIO DE ÁGUA","qtdAcoes":2,"oQueFazer":"1. Retirar materiais sem utilidade do local;\n2. Criar uma forma de utilizar a água no registro presente sem desperdício","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-51","numero":51,"problema":"FIAÇÃO NECESSITANDO DE MELHORIAS DE INSTALAÇÃO E SEGURANÇA","qtdAcoes":1,"oQueFazer":"1. Solicitar ao Setor Elétrico melhoria na instalação elétrica do prédio","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-52","numero":52,"problema":"PRESENÇA DE PEDAÇOS DE TELHAS PARA PROTEGER PASSAGEM DE FIAÇÃO ELÉTRICA; FIO ELÉTRICO PASSANDO NO PISO DE UMA PONTA A OUTRA","qtdAcoes":1,"oQueFazer":"1. Melhorar passagem de fiação elétrica nas instalações;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-53","numero":53,"problema":"MATERIAIS SEM UTILIZAÇÃO NA ENTRADA DAS TORRES DE REFRIGERAÇÃO","qtdAcoes":1,"oQueFazer":"1. Retirar materiais sem utilização ou redicionar para uso devido","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-54","numero":54,"problema":"FALTA DE IDENTIFICAÇÃO NOS COMANDOS DO QUADRO ELÉTRICO","qtdAcoes":1,"oQueFazer":"1. Solicitar a identificação com apoio de datador de etiquetas nomeando os comandos","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-55","numero":55,"problema":"MATERIAIS DE PEÇAS E LIMPEZA ALOCADOS AO CHÃO E ENCOSTADOS NO PAINEL ELÉTRICO DO CCM DAS BOMBAS","qtdAcoes":1,"oQueFazer":"1. Criar um layout e marcação no piso para alocar materiais dispersos no ambiente","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-56","numero":56,"problema":"TETO DO CCM NECESSITANDO DE REPAROS","qtdAcoes":1,"oQueFazer":"1. Solicitar apoio da Eng. Civil para tratar o teto da estrutura","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-57","numero":57,"problema":"DANOS ESTRUTURAIS NA PAREDE DO PRÉDIO DO CCM DAS TORRES","qtdAcoes":1,"oQueFazer":"1. Realizar reparos na alvenaria;","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Gilberto","status":"concluido","foto":null},{"id":"a6-58","numero":58,"problema":"ESCOAMENTO E DERPERDÍCIO DE ÁGUA DA CASA DE BOMBAS PARA A RUA PRINCIPAL","qtdAcoes":1,"oQueFazer":"1. Realizar uma canaleta de retorno para o poço de bombeamento","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-59","numero":59,"problema":"FALTA DE PADRONIZAÇÃO E PINTURA NO BALÃO DE SUCÇÃO DA BOMBA DE ÁGUA","qtdAcoes":1,"oQueFazer":"1. Realizar pintura","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-60","numero":60,"problema":"FALTA DE PADRONIZAÇÃO NAS CORES DOS MOTORES","qtdAcoes":1,"oQueFazer":"1. Definir padronização na pintura das bombas do setor","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-61","numero":61,"problema":"DANO ESTRUTURAL EM SUSTENTAÇÃO NA COLUNA DA CASA DE BOMBA","qtdAcoes":1,"oQueFazer":"1. Realizar reparo necessário","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-62","numero":62,"problema":"FALTA DE GRADE PROTETIVA ENTRE AS BOMBAS DE ÁGUA E O POÇO","qtdAcoes":1,"oQueFazer":"1. Solicitar o gradeamento do local","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-63","numero":63,"problema":"FALTA DE MANUTENÇÃO ADEQUADA OCASIONANDO APARÊNCIA DETERIORADA AO EQUIPAMENTO; MATERIAL PARA REPARO A FRENTE DO EQUIPAMENTO","qtdAcoes":1,"oQueFazer":"1. Solicitar a execução da manutenção na torre de resfriamento","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-64","numero":64,"problema":"FALTA DE MARCAÇÕES E LAYOUT NO ESPAÇO","qtdAcoes":1,"oQueFazer":"1. Delimitar área com layout e marcações para guarda de materiais utilizáveis na parte superior e inferior","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Gilberto","status":"concluido","foto":null},{"id":"a6-65","numero":65,"problema":"ACRÍLICO COM PROBLEMAS DE SUJIDADES","qtdAcoes":null,"oQueFazer":"1. Melhoria na limpeza dos acrílicos na área interna e externa. Caso não haver melhorias, solicitar a troca dos acrílicos","prazo":{"type":"text","value":"Cancelado"},"responsavel":"GILBERTO","status":"pendente","foto":null},{"id":"a6-66","numero":66,"problema":"ESTRUTURA EXTERNA DA PENEIRA ESTÁTICA COM SUJIDADES","qtdAcoes":1,"oQueFazer":"1. Realizar pintura da estrutura","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-67","numero":67,"problema":"EXCESSO DE PÓ NO AMBIENTE E EQUIPAMENTOS","qtdAcoes":1,"oQueFazer":"1. Adquirir e instalar um sistema de exaustão para evitar o acumulo de pó e sujidades","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Gilberto","status":"pendente","foto":null},{"id":"a6-68","numero":68,"problema":"PRESENÇA DE SUJIDADE","qtdAcoes":1,"oQueFazer":"1. Realizar a limpeza das laterais e piso","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Gilberto","status":"concluido","foto":null}],"auditorias":{"c3-a1":{"nota":74.0,"comentario":""}}},{"id":"area-7","nome":"Moenda","departamento":"Industrial","lider":"CLÁUDIO","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-17","itens":[{"id":"a7-1","numero":1,"problema":"CABOS EXPOSTOS SEM ORGANIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Solicitar ao setor da Manutenção a retirada de equipamentos da rua e reinstalar na safra no piso superior ou outro local","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Cláudio","status":"concluido","foto":null},{"id":"a7-2","numero":2,"problema":"REALIZAR A RETIRADA DE MATERIAIS PRÓXIMO AO MURO PARA DESOBTRUIR A ÁREA","qtdAcoes":2,"oQueFazer":"1. Solicitar ao setor da Manutenção a retirada dos materiais da área;\n\n2. Solicitar ao setor da Manutenção delimitação de espaço entre área útil da manutenção separada da via de acesso","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Cláudio","status":"concluido","foto":null},{"id":"a7-3","numero":3,"problema":"REALIZAR O CALÇAMENTO","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng. Civil para realizar o calçamento da via","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Cláudio","status":"pendente","foto":null},{"id":"a7-4","numero":4,"problema":"PISO ESTRUTURAL ACIMA DOS DECANTADORES DE AREIA DANIFICADO","qtdAcoes":1,"oQueFazer":"1. Solicitar reparo da alvenaria ou trocar o piso atual por chaparias","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Cláudio","status":"pendente","foto":null},{"id":"a7-5","numero":5,"problema":"FIAÇÃO DE MÁQUINAS DE SOLDA PASSANDO PELA ESCADA DE ACESSO","qtdAcoes":1,"oQueFazer":"1. Solicitar ao setor da Manutenção uma passagem auxiliar fora da escada para fiação deixando as escadas livres","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Cláudio","status":"pendente","foto":null},{"id":"a7-6","numero":6,"problema":"PISO DESNIVELADO ACUMULANDO ÁGUA E CALDO QUANDO OCORRE ALGUM PROBLEMA NAS BOMBAS","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng. Civil para nivelar o piso favorecendo o escoamento para a saída desta área","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Cláudio","status":"pendente","foto":null},{"id":"a7-7","numero":7,"problema":"FALTA DE BLOQUEIO AOS IBC´S DE PRODUTO QUÍMICOS EM ÁREA DE CIRCULAÇÃO GERAL DE COLABORADORES","qtdAcoes":1,"oQueFazer":"1. Realizar gradeamento e acesso restrito aos locais dos IBCs de produtos químicos","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Cláudio","status":"pendente","foto":null},{"id":"a7-8","numero":8,"problema":"SINALIZAÇÃO DE MOTORES DAS BOMBAS ACIONADAS COM FITAS DIVERSAS E DE SEGURANÇA","qtdAcoes":1,"oQueFazer":"1. Realizar um sistema de sinalização visual nas bombas estão acionadas para os operadores","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Cláudio","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":67.0,"comentario":""}}},{"id":"area-8","nome":"Ruas, Navio","departamento":"Industrial","lider":"ZUMBA","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-17","itens":[{"id":"a8-1","numero":1,"problema":"REALIZAR PINTURA EM TODA A ESTRUTURA DO NAVIO","qtdAcoes":1,"oQueFazer":"1. Realizar pintura no equipamento","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Zumba","status":"pendente","foto":null},{"id":"a8-2","numero":2,"problema":"ESTRUTURA ELÉTRICA DE SUSTENTAÇÃO DOS CABOS DANIFICADA","qtdAcoes":1,"oQueFazer":"1. Realizar intervenção e solução na fiação sem apoio","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Zumba","status":"pendente","foto":null},{"id":"a8-3","numero":3,"problema":"PREDIO NECESSITANDO DE CORREÇÕES ESTRUTURAL E PINTURA GERAL","qtdAcoes":2,"oQueFazer":"1. Realizar pintura no ambiente;\n2. Restaurar comogós","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Zumba","status":"pendente","foto":null},{"id":"a8-4","numero":4,"problema":"ESTRUTURA ELÉTRICA NECESSITANDO DE PADRONIZAÇÃO NA PASSAGEM DO PRÉDIO","qtdAcoes":1,"oQueFazer":"1. Realizar intervenção e padronização na fiação","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Zumba","status":"pendente","foto":null},{"id":"a8-5","numero":5,"problema":"ESTRUTURA PREDIAL PRECISANDO DE PINTURA","qtdAcoes":1,"oQueFazer":"1. Realizar pintura no prédio","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Zumba","status":"pendente","foto":null},{"id":"a8-6","numero":6,"problema":"ESTRUTURA DO NAVIO PRECISANDO DE PINTURA E TUBULAÇÃO","qtdAcoes":1,"oQueFazer":"1. Realizar pintura na estrutura;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Zumba","status":"pendente","foto":null},{"id":"a8-7","numero":7,"problema":"TORRE DE RESFRIAMENTO COM SUJIDADES NA BASE","qtdAcoes":1,"oQueFazer":"1. Limpeza nas torres de resfriamento","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Zumba","status":"concluido","foto":null},{"id":"a8-8","numero":8,"problema":"FALTA DE PINTURA NA ESTRUTURA;","qtdAcoes":1,"oQueFazer":"1. Realizar pintura da estrutura.","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Zumba","status":"pendente","foto":null},{"id":"a8-9","numero":9,"problema":"FALTA DE COBERTURA TELHADO","qtdAcoes":1,"oQueFazer":"1. Realizar cobertura para engrenagens acima da plataforma","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Zumba","status":"pendente","foto":null},{"id":"a8-10","numero":10,"problema":"MATERIAIS SEM UTILIDADE NO AMBIENTE","qtdAcoes":1,"oQueFazer":"1. Redirecionar material de uso em outra localidade","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Zumba","status":"concluido","foto":null},{"id":"a8-11","numero":11,"problema":"FALTA DE CALÇAMENTO NA SAÍDA DOS CAMINHÕES","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng. Civil a pavimentação de calçamento da rua de saída dos caminhões e em torno do navio.","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Zumba","status":"pendente","foto":null},{"id":"a8-12","numero":12,"problema":"PRESENÇA DE TUBULAÇÃO SEM UTILIDADE","qtdAcoes":1,"oQueFazer":"1. Retirar a tubulação sem utilidade do antigo sistema americano","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Zumba","status":"pendente","foto":null},{"id":"a8-13","numero":13,"problema":"MURO AO LADO DA RUA DO NAVIO COM PARTES DANIFICADAS","qtdAcoes":1,"oQueFazer":"1. Restaurar muro com complemento e realizar pintura","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Zumba","status":"concluido","foto":null},{"id":"a8-14","numero":14,"problema":"FIAÇÃO AO LADO DO PAINEL DE CONTROLE SEM PADRONIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Solicitar ao setor da Elétrica padronização e melhoria visual na passagem da fiação","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Zumba","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":77.0,"comentario":""}}},{"id":"area-9","nome":"Balança","departamento":"Administrativo","lider":"ROZEILDO","auditor":"MARCOS ARAÚJO","dataFoto":"2025-10-01","itens":[{"id":"a9-1","numero":1,"problema":"PRESENÇA DE FIAÇÃO NA BASE DA ESTRUTURA","qtdAcoes":1,"oQueFazer":"1. Criar proteção adequada ao cabeamento ótico/fibra ao prédio da balança","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Rozeildo","status":"concluido","foto":null},{"id":"a9-2","numero":2,"problema":"MATERIAL DE LIMPEZA SEM LOCAL PARA GUARDA","qtdAcoes":null,"oQueFazer":"1. Solicitar armário para guarda dos utensílios de limpeza do setor","prazo":{"type":"text","value":"Cancelado"},"responsavel":"ROZEILDO","status":"pendente","foto":null},{"id":"a9-3","numero":3,"problema":"SUJIDADES NA PINTURA DO PRÉDIO; PRESENÇA DE FIAÇÃO NA CAIXA DE PASSAGEM ABERTA","qtdAcoes":1,"oQueFazer":"1. Solicitar pintura das paredes do prédio;\n.","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Rozeildo","status":"concluido","foto":null},{"id":"a9-4","numero":4,"problema":"PISO COM CERÂMICA APRESENTANDO SINAIS DE DESGASTE","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng. Civil a troca da cerâmica","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Rozeildo","status":"concluido","foto":null},{"id":"a9-5","numero":5,"problema":"PRESENÇA DA ANTIGA CAIXA DE AR CONDICIONADO DE JANELA SEM UTILIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng. Civil a retirada da estrutura, ajuste e pintura","prazo":{"type":"date","value":"2026-05-23"},"responsavel":"Rozeildo","status":"concluido","foto":null},{"id":"a9-6","numero":6,"problema":"TRANSITO DE COLABORADORES EM CIMA DA BALANÇA RODOVIÁRIA","qtdAcoes":1,"oQueFazer":"1.Realizar modificação entorno da balança para dificultar a passagem de colaboradores para evitar erros de pesagem OBS: hoje dependendo de atenção redobrada do balanceiro para evitar possíveis erros pelo ocorrido","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Rozeildo","status":"pendente","foto":null},{"id":"a9-7","numero":7,"problema":"NECESSIDADE DE PADRONIZAR A GUARDA DE MATERIAIS DIVERSOS DO SETOR","qtdAcoes":1,"oQueFazer":"1. Criar um balção com gaveteiro e armário inferior com porta lateral","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Rozeildo","status":"pendente","foto":null},{"id":"a9-8","numero":8,"problema":"FALTA DE COBERTURA EM DIAS DE CHUVA PARA MOTORISTAS EM AGUARDO","qtdAcoes":null,"oQueFazer":"1. Alongar cobertura do acesso ao prédio","prazo":{"type":"text","value":"Cancelado"},"responsavel":"ROZEILDO","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":91.0,"comentario":""},"c3-a2":{"nota":80.0,"comentario":""},"c3-a3":{"nota":77.0,"comentario":""}}},{"id":"area-10","nome":"Vestiário / Refeitório","departamento":"Administrativo","lider":"ROZEILDO","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-18","itens":[{"id":"a10-1","numero":1,"problema":"DESGASTE NA PINTURA DA RAMPA DE ACESSO","qtdAcoes":1,"oQueFazer":"1. Revitalizar pintura no piso de entrada com desgaste.","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Rozeildo","status":"concluido","foto":null},{"id":"a10-2","numero":2,"problema":"DESGASTE NA PINTURA DE ACESSO INTERNO DO VESTIÁRIO","qtdAcoes":1,"oQueFazer":"1. Revitalizar pintura no piso de entrada com desgaste.","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Rozeildo","status":"pendente","foto":null},{"id":"a10-3","numero":3,"problema":"DESGATE E OXIDAÇÃO DOS ARMÁRIOS DO VESTIÁRIO","qtdAcoes":1,"oQueFazer":"1. Realizar recuperação com lixamento e pintura","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Rozeildo","status":"pendente","foto":null},{"id":"a10-4","numero":4,"problema":"MICTORIO COM MARCAS NA ESTRUTURA E VAZAMENTO NO PISO","qtdAcoes":1,"oQueFazer":"1. Aplicar algum produto que deixe a superficie limpa e branca","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Rozeildo","status":"concluido","foto":null},{"id":"a10-5","numero":5,"problema":"PARTE INFERIOR DAS PAREDES APRESENTANDO DETERIORAÇÃO","qtdAcoes":1,"oQueFazer":"1. Realizar reparo na alvenaria com pintura;","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Rozeildo","status":"pendente","foto":null},{"id":"a10-6","numero":6,"problema":"PARTE INFERIOR DAS PAREDES APRESENTANDO DETERIORAÇÃO; RALO APRESENTANDO SUJIDADES","qtdAcoes":2,"oQueFazer":"1. Realizar reparo na alvenaria com pintura;\n2. Aplicar produto de limpeza no ralo para deixar branco","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Rozeildo","status":"pendente","foto":null},{"id":"a10-7","numero":7,"problema":"LUMINÁRIA COM PARTE DE COBERTURA SEGURADA POR ABRAÇADEIRA;","qtdAcoes":1,"oQueFazer":"1. Realizar a troca da luminária;","prazo":{"type":"date","value":"2026-04-30"},"responsavel":"Rozeildo","status":"concluido","foto":null},{"id":"a10-8","numero":8,"problema":"CANTO DA JANELA APRESENTANDO DETERIORAÇÃO NO ACABAMENTO","qtdAcoes":1,"oQueFazer":"1. Realizar reparo na alvenaria junto a janela e fazer acabamento necessário","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Rozeildo","status":"pendente","foto":null},{"id":"a10-9","numero":9,"problema":"MATERIAL DE LIMPEZA SEM ESPAÇO OCUPANDO PRANCHAS NO LOCAL","qtdAcoes":1,"oQueFazer":"1. Criar um espaço para construção ou aquisição de armário e eliminar material de limpeza junto as bolsas dos colaboradores","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Rozeildo","status":"pendente","foto":null},{"id":"a10-10","numero":10,"problema":"FÓRMICA COM DETERIORAÇÃO PREJUDICANDO ESTRUTURA E UTILIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Solicitar o reparo necessário","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Rozeildo","status":"pendente","foto":null},{"id":"a10-11","numero":11,"problema":"DESGASTE NA PINTURA DE ACESSO DO REFEITÓRIO","qtdAcoes":1,"oQueFazer":"1. Revitalizar pintura no piso com desgaste.","prazo":{"type":"text","value":"3° ciclo"},"responsavel":"Rozeildo","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":91.0,"comentario":""},"c3-a2":{"nota":80.0,"comentario":""},"c3-a3":{"nota":77.0,"comentario":""}}},{"id":"area-11","nome":"Caldeiraria","departamento":"Manutenção","lider":"PEDRO","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-20","itens":[{"id":"a11-1","numero":1,"problema":"DINJUTOR ELÉTRICO COM FALTA DE PROTEÇÃO E SUJEIRA - PÁTIO PRINCIPAL","qtdAcoes":1,"oQueFazer":"1. Solcitar a trocar ou adequação do dinjuntor","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-2","numero":2,"problema":"MATERIAIS ALOCADOS EM ÁREA SEM IDENTIFICAÇÃO","qtdAcoes":1,"oQueFazer":"1. Identificar área ou redicionais os materiais para seus repectivos locais","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-3","numero":3,"problema":"MATERIAIS DE LIMPEZA SEM PADRONIZAÇÃO DE LOCAL","qtdAcoes":1,"oQueFazer":"1. Providenciar e delimitar área para materiais de limpeza ou armário para esta finalidade","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-4","numero":4,"problema":"FALTA DE REBOCO EM ESTRUTURA NECESSITANDO ACABAMENTO NO PERÍMETRO DO PÁTIO PRINCIPAL","qtdAcoes":1,"oQueFazer":"1. Solicitar o acabamento e pintura e Eng. Civil","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-5","numero":5,"problema":"INSTALAÇÃO ELÉTRICA NECESSITANDO ADEQUAÇÕES EM INTERRUPTOR E FINALIZAÇÃO DE TOMADAS","qtdAcoes":2,"oQueFazer":"1. Instalar tomadas;\n2 . Adequar interruptores de iluminação","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-6","numero":6,"problema":"FALTA DE PADRONIZAÇÃO PARA KIR DE PRIMEIROS SOCORROS","qtdAcoes":1,"oQueFazer":"1. Definir layout e identificação para kit de primeiros socorro","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-7","numero":7,"problema":"MATERIAIS MISTURADOS;\nMATERIAS SEM USO;\nMATERIAIS SEM IDENTIFICAÇÃO;\nCANALETA SEM GRADE;","qtdAcoes":4,"oQueFazer":"1.Selecionar o que está sem uso e descartar:\n2. Definir local para cada item;\n3. Limpar área; \n4. colocar grades na canaleta;","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-8","numero":8,"problema":"PAREDE COM SERVIÇO DE PINTURA INCOMPLETO","qtdAcoes":1,"oQueFazer":"1. Finalizar pintura da parede","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-9","numero":9,"problema":"TUBULAÇÕES SEM PINTURA ADEQUADA;\nFALTA DE IDENTIFICAÇÃO EM MATERIAIS E OUTROS COBERTO POR LONA","qtdAcoes":2,"oQueFazer":"1. Pintar tubulações;\n2. Identificar materiais e os que estão cobertos por lona","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-10","numero":10,"problema":"PAREDE NECESSITANDO PINTURA","qtdAcoes":1,"oQueFazer":"1. Solciitar a pintura geral do prédio","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-11","numero":11,"problema":"CALÇAMENTO E PEDRAS DE CONCRETO DA GALERIA PRECISANDO DE REPAROS","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng. Civil a cobertura da galeria por alvenaria\n2. Realizar reparos no calçamento da rua","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-12","numero":12,"problema":"BANCADAS DESPADRONIZADAS;\nFALTA DE PINTURA","qtdAcoes":1,"oQueFazer":"1. Padronizar bancadas com pintura unificada.","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-13","numero":13,"problema":"ESTRUTURA EM MADEIRA NECESSITANDO ADEQUAÇÃO E PADRONIZAÇÃO; FALTA DE PINTURA NO LOCAL","qtdAcoes":2,"oQueFazer":"1. Solicitar a Eng. Civil reforma na estrutura atualmente pertencente ao setor;\n2. Realizar pintura das paredes","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-14","numero":14,"problema":"ALVENARIA NECESSITANDO VEDAÇÃO","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng. Civil melhoria nas vedações para evitar acumulo de pragas no local","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-15","numero":15,"problema":"INSTALAÇÃO ELÉTRICA SEM PADRONIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Solicitar nova instalação elétrica padronizada","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-16","numero":16,"problema":"PAREDES NECESSITANDO DE REPATOS E PINTURA","qtdAcoes":2,"oQueFazer":"1. Solicitar reparo na estrutura a Eng, Civil com reboco.\n2. Realizar pintura da alvenaria e seu entorno","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-17","numero":17,"problema":"ESTRUTURA DETERIORADA E SEM PADRONIZAÇÃO","qtdAcoes":2,"oQueFazer":"1. Padronizar a estrutura danificada de comogós instalando novos ou modificar a parede para fechamento;\n2. Realizar pintura","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null},{"id":"a11-18","numero":18,"problema":"CONSTRUIR PISO PARA ÁREA EXTERNA DE MATERIAIS DO SETOR","qtdAcoes":1,"oQueFazer":"1. Verificar com Eng. Civil a construção do piso","prazo":null,"responsavel":"Pedro","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":91.0,"comentario":""},"c3-a2":{"nota":94.0,"comentario":""},"c3-a3":{"nota":94.0,"comentario":""}}},{"id":"area-12","nome":"Elétrica","departamento":"Manutenção","lider":"DJAIR / VALMIR","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-20","itens":[{"id":"a12-1","numero":1,"problema":"FALTA DE IDENTIFICAÇÃO NO PAINEL DE ACIONAMENTO DA BOMBA DE LAVAGEM; PRESENÇA DE SUJIDADES NAS ÁREAS ACIMA E EMBAIXO DA BANCADA","qtdAcoes":2,"oQueFazer":"1. Identificar e padronizar o painel de acionamento de bomba;\n2. Realizar limpeza da banca da e entorno","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-2","numero":2,"problema":"FALTA DE PADRONIZAÇÃO EM PORTÃO BLOQUEADO; PORTÃO SEM UTILIZAÇÃO","qtdAcoes":2,"oQueFazer":"1. Retirar portão sem utilidade do local;\n2. Fechar com alvenaria a área e realizar acabamento e pintura","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-3","numero":3,"problema":"FALTA TERMINAR A IDENTIFICAÇÃO DOS MATERIAIS","qtdAcoes":1,"oQueFazer":"1. Identificar todas as baias e materiais presentes","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-4","numero":4,"problema":"MATERIAIS SEM CLASSIFICAÇÃO ACIMA DA ESTANTE; MATERAIS SEM CLASSIFICAÇÃO E LAYOUT NO PISO ENTRE AS ESTANTES","qtdAcoes":2,"oQueFazer":"1. Classificar, identificar os itens presentes em caixas de papelão ou caixotes;\n2. Identificar materiais no piso e criar layout para o mesmo caso ou direcionar para alocação adequada.","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-5","numero":5,"problema":"DIJUNTOR DE QUARTO DE UTENSÍLIOS E PEÇAS FORA DO PADRÃO DE INSTALAÇÃO","qtdAcoes":1,"oQueFazer":"1. Realizar nova instalação elétrica padronizada","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-6","numero":6,"problema":"FALTA DE PADRONIZAÇÃO PARA DESCARTE DE LÂMPADAS","qtdAcoes":1,"oQueFazer":"1. Criar identificação para descarte único de lâmpadas descartadas","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-7","numero":7,"problema":"FIAÇÃO PASSANDO POR PAINEL SEM PADRONIZAÇÃO E ORGANIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Criar uma passagem de fiação com padronização","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-8","numero":8,"problema":"QUADRO BRANCO SEM ESPAÇAMENTO PARA REUNIÕES EM MEIO A MOTORES RETIRADOS NA ENTRESSAFRA","qtdAcoes":1,"oQueFazer":"1. Criar layout de área útil para utilidade do quadro como instruções pontuais.","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-9","numero":9,"problema":"FALTA DE LAYOUT; CAMBIARRA COM FIOS LIGADOS DIRETAMENTE NA TOMADA ELÉTRICA; FALTA DE IDENTIFICAÇÃO DA TENSÃO NAS TOMADAS","qtdAcoes":3,"oQueFazer":"1. Criar layout e padronização de área para kit de primeiros socorros;\n2. Identificar tensão elétrica nas tomadas instaladas;\n3. Criar layout na mesa da sala","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-10","numero":10,"problema":"PAREDE COM SUJIDADES","qtdAcoes":1,"oQueFazer":"1. Solicitar pintura","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-11","numero":11,"problema":"FALTA IDENTIFICAÇÃO NO DESCARTE DE LIXO COMUM","qtdAcoes":1,"oQueFazer":"1. Realizar padronização para descarte de materiais classicados como \"comum\"","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-12","numero":12,"problema":"PORTÃO DETERIORADO; FALTANDO GRADE NO PISO; LOCAL SUJO.","qtdAcoes":2,"oQueFazer":"1. Fabricar e instalar portão novo; \n2. Fabricar e instalar grade no piso","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-13","numero":13,"problema":"FALTA RESTRIÇÃO PORTÃO PARA RESTRINGIR O ACESSO; ÁREA SUJA.","qtdAcoes":2,"oQueFazer":"1. Realizar restrição do acesso;\n2. Realizar limpeza da área (zona livre)","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-14","numero":14,"problema":"FALTA DE PROTEÇÃO NOS CONTACTORES","qtdAcoes":1,"oQueFazer":"1. Solicitar uma proteção para a saída de alta tensão","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-15","numero":15,"problema":"DEGRAUS EM ALVENARIA SEM UTILIDADE","qtdAcoes":1,"oQueFazer":"1. Solicitar a retirada dos degraus","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-16","numero":16,"problema":"FALTA DE PINTURA NA PAREDE","qtdAcoes":1,"oQueFazer":"1. Solicitar pintura após retirada dos degraus","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-17","numero":17,"problema":"MESA EM MÁS CONDIÇÕES","qtdAcoes":1,"oQueFazer":"1. Substituir mesa p/ material metálico;","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-18","numero":18,"problema":"FALTA PINTURA NA PAREDE","qtdAcoes":1,"oQueFazer":"1. Solicitar pintura","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-19","numero":19,"problema":"FIAÇÃO INSTALADA SEM ORGANIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Adequar a instalação da fiação com organização e padronização","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-20","numero":20,"problema":"DIJUNTOR SEM CAIXA DE PROTEÇÃO COM SUJIDADES","qtdAcoes":2,"oQueFazer":"1. Realizar limpeza do local após desligamento da fiação;\n2. Reinstalar dijuntor com caixa de proteção ou em outra localidade","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-21","numero":21,"problema":"ACOMODAÇÕES DE AR CONDICIONADO SEM UTILIZAÇÃO; SUJIDADES NA PAREDE; PASSAGEM DE CABOS SEM ORGANIZAÇÃO","qtdAcoes":3,"oQueFazer":"1. Verificar se o espaço do ar condicionado será ainda utilidade e caso não for solicitar a vedação;\n2. Organizar a instalação e passagem de cabos e fiação;\n3. Realizar limpeza na extensão da parede","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-22","numero":22,"problema":"PINTURA COM DESGASTES NA PAREDE","qtdAcoes":1,"oQueFazer":"1. Solicitar pintura após adequações na organização dos cabos e fiação e definição dos locais em aberto do ar condicionado","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-23","numero":23,"problema":"CABOS SEM ORGANIZAÇÃO PRÓXIMO A PORTA DE ENTRADA DA CASA DE FORÇA 01","qtdAcoes":1,"oQueFazer":"1. Realizar adequação e padronização na instalação dos cabos","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-24","numero":24,"problema":"CABOS SEM ORGANIZAÇÃO PRÓXIMO AOS PAINEIS NA CASA DE FORÇA 01","qtdAcoes":1,"oQueFazer":"1. Adequar instalação do ar condicionado","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-25","numero":25,"problema":"FALTA DE INSTALAÇÃO PADRONIZADA NO AR CONDICIONADO DA CASA DE FORÇA 02","qtdAcoes":1,"oQueFazer":"1. Adequar instalação do ar condicionado","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-26","numero":26,"problema":"PAINEL SEM IDENTIFICAÇÃO E AVISOS DE SEGURANÇA PRÓXIMO AO GERADOR","qtdAcoes":1,"oQueFazer":"1. Identificar paineis e colocar sinalização de segurança","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null},{"id":"a12-27","numero":27,"problema":"FALTA DE IDENTIFICAÇÃO NO ACIONAMENTO DA BOMBA DO GERADOR DE DIESEL","qtdAcoes":1,"oQueFazer":"1. Realizar identificação e padronização do painel de acionamento da bomba","prazo":null,"responsavel":"Djair\nValmir","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":88.0,"comentario":""},"c3-a2":{"nota":91.0,"comentario":""},"c3-a3":{"nota":78.0,"comentario":""}}},{"id":"area-13","nome":"Extração","departamento":"Manutenção","lider":"EDENILDO","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-20","itens":[{"id":"a13-1","numero":1,"problema":"PISO SEM UNIFORMIDADE DIFICULTANDO A LIMPEZA DO LOCAL","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng. Civil melhoria no piso","prazo":null,"responsavel":"Edenildo","status":"pendente","foto":null},{"id":"a13-2","numero":2,"problema":"INSTALAÇÃO ELÉTRICA DA ILUMINAÇÃO IMPROVISADA","qtdAcoes":1,"oQueFazer":"1. Solicitar reinstalação da iluminação da sala padronizada","prazo":null,"responsavel":"Edenildo","status":"pendente","foto":null},{"id":"a13-3","numero":3,"problema":"MATERIAIS DESORGANIZADOS POR CIMA DO ARMÁRIO","qtdAcoes":3,"oQueFazer":"1. Limpar e organizar área;\n2. Descartar materiais sem utilização;\n3. Organizar materiais e identificá-los;","prazo":null,"responsavel":"Edenildo","status":"pendente","foto":null},{"id":"a13-4","numero":4,"problema":"BANCO ALOCADO SEM SEGUIR A DEMARCAÇÃO DO LAYOUT; FALTA DE PADRONIZAÇÃO DOS ARMÁRIOS","qtdAcoes":2,"oQueFazer":"1. Direcionar o banco para um local apropriado;\n2. Padronizar armários","prazo":null,"responsavel":"Edenildo","status":"pendente","foto":null},{"id":"a13-5","numero":5,"problema":"SUJEIRA; MATERIAIS DESORGANIZADOS OBSTRUINDO A VIA; MATERIAIS NÃO IDENTIFICADOS;","qtdAcoes":3,"oQueFazer":"1. Limpar área;\n2. Organizar e identificar materiais;\n3. Definir layout e demarcar área;","prazo":null,"responsavel":"Edenildo","status":"pendente","foto":null},{"id":"a13-6","numero":6,"problema":"MATERIAIS DESORGANIZADOS; FERRAMENTAS DESORGANIZADAS; FALTA DE PADRONIZAÇÃO DA MESA SEM IDENTIFICAÇÃO E LAYOUT","qtdAcoes":4,"oQueFazer":"1. Limpar área;\n2. Organizar e identificar materiais;\n3. Organizar e identificar ferramentas;\n4. Criar layout e padronizar a mesa","prazo":null,"responsavel":"Edenildo","status":"pendente","foto":null},{"id":"a13-7","numero":7,"problema":"FIAÇÃO DE MÁQUINAS DE SOLDA ATRAVESSANDO A RUA AO LADO DA MOENDA","qtdAcoes":1,"oQueFazer":"1. Retirar fiação da rua e reinstar máquinas de solda em outro posicionamento para não reincidir a situação","prazo":null,"responsavel":"Edenildo","status":"pendente","foto":null},{"id":"a13-8","numero":8,"problema":"FALTA DE PADRONIZAÇÃO NO REJEITO DE MATERIAIS","qtdAcoes":2,"oQueFazer":"1. Padronizar a cor dos tambores de acumulo dos rejeitos;\n2. Realizar identificação seguindo uma padronização","prazo":null,"responsavel":"Edenildo","status":"pendente","foto":null},{"id":"a13-9","numero":9,"problema":"PRESENÇA DE BAIAS COM RESÍDUO DE ÓLEO APÓS DESMONTAGEM DA MOENDA SEM IDENTIFICAÇÃO","qtdAcoes":2,"oQueFazer":"1. Identificar os materiais;\n2. Isolar a área delimitando acesso restrito a proximidade com o resíduo","prazo":null,"responsavel":"Edenildo","status":"pendente","foto":null},{"id":"a13-10","numero":10,"problema":"FALTA DE IDENTIFICAÇÃO","qtdAcoes":1,"oQueFazer":"1. Identificar as peças e materiais","prazo":null,"responsavel":"Edenildo","status":"pendente","foto":null},{"id":"a13-11","numero":11,"problema":"MATERIAIS DESORGANIZADOS NO LOCAL; SUJIDADES NO LOCAL","qtdAcoes":2,"oQueFazer":"1. Alocar os materiais nos seus devidos locais após a utilização;\n2. Realizar limpeza","prazo":null,"responsavel":"Edenildo","status":"pendente","foto":null},{"id":"a13-12","numero":12,"problema":"PRESENÇA DE EPIs LOCAL; SUJIDADES NO LOCAL","qtdAcoes":2,"oQueFazer":"1. Alocar os materiais nos seus devidos locais após a utilização;\n2. Realizar limpeza","prazo":null,"responsavel":"Edenildo","status":"pendente","foto":null},{"id":"a13-13","numero":13,"problema":"MATERIAL SEM RECOLHIMENTO APÓS A UTILIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Alocar o material no seu devido local após a utilização;","prazo":null,"responsavel":"Edenildo","status":"pendente","foto":null},{"id":"a13-14","numero":14,"problema":"MATERIAS SEM USO;\nMATERIAIS SEM IDENTIFICAÇÃO;\nFALTA DE LIMPEZA;  PAREDE SUJA; ARMÁRIOS DESPADRONIZADOS","qtdAcoes":7,"oQueFazer":"1. Retirar materiais sem uso e descartar;\n2. Organizar o local;\n3. Limpar o local;\n4. Pintar paredes, teto e estrutura;\n5. Padronizar armários;\n6. Definir local para pendurar os aventais e EPI´s;\n7. Criar padrão de limpeza das máquinas de solda","prazo":{"type":"date","value":"2025-10-30"},"responsavel":"Pedro","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":83.0,"comentario":""},"c3-a2":{"nota":88.0,"comentario":""},"c3-a3":{"nota":76.0,"comentario":""}}},{"id":"area-14","nome":"Centrífugas De Açúcar (Manut.)","departamento":"Manutenção","lider":"SÉRGIO","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-20","itens":[{"id":"a14-1","numero":1,"problema":"FALTA DE LOCAL PARA GUARDA DE MATERIAIS;\nFALTA DE IDENTIFICAÇÃO","qtdAcoes":3,"oQueFazer":"1. Identificar os materiais\n2. Adquirir e instalar armários para alocação dos materiais;\n3. Padronizar os materiais criando layout no armário a ser instalado;","prazo":null,"responsavel":"Sérgio","status":"pendente","foto":null},{"id":"a14-2","numero":2,"problema":"FALTA DE LOCAL PARA GUARDA DE EPIs","qtdAcoes":1,"oQueFazer":"1.  Adquirir e instalar armários para alocação dos materiais;","prazo":null,"responsavel":"Sérgio","status":"pendente","foto":null},{"id":"a14-3","numero":3,"problema":"FALTA DE ORGANIZAÇÃO DENTRO DO ARMÁRIO DA BANCADA","qtdAcoes":1,"oQueFazer":"1. Realizar a ordenação dos materiais e criar layout interno","prazo":null,"responsavel":"Sérgio","status":"pendente","foto":null},{"id":"a14-4","numero":4,"problema":"INSTALAÇÃO DE ILUMINAÇÃO IMPROVISADA","qtdAcoes":1,"oQueFazer":"1. Solicitar a reinstalação da iluminação padronizada","prazo":null,"responsavel":"Sérgio","status":"pendente","foto":null},{"id":"a14-5","numero":5,"problema":"PISO APRESENTANDO DESGASTE NA PINTURA","qtdAcoes":2,"oQueFazer":"1. Realizar pintura;\n2. Verificar vazamentos adicionais que interferem no setor e contactar seus respectivos lideres para saná-los","prazo":null,"responsavel":"Sérgio","status":"pendente","foto":null},{"id":"a14-6","numero":6,"problema":"PRESENÇA DE ALTA TEMPERATURA DEVIDO A TUBULAÇÃO DE VAPOR","qtdAcoes":1,"oQueFazer":"1. Solicitar vedação térmica da tubulação de vapor","prazo":null,"responsavel":"Sérgio","status":"pendente","foto":null},{"id":"a14-7","numero":7,"problema":"TENTO SEM COBERTURA NA PASSAGEM DE TUBULAÇÕES","qtdAcoes":1,"oQueFazer":"1. Solicitar uma cobertura da área","prazo":null,"responsavel":"Sérgio","status":"pendente","foto":null},{"id":"a14-8","numero":8,"problema":"MATERIAS SEM USO;\nMATERIAIS SEM IDENTIFICAÇÃO;\nFALTA DE LIMPEZA;  PAREDE SUJA; ARMÁRIOS DESPADRONIZADOS","qtdAcoes":7,"oQueFazer":"1. Retirar materiais sem uso e descartar;\n2. Organizar o local;\n3. Limpar o local;\n4. Pintar paredes, teto e estrutura;\n5. Padronizar armários;\n6. Definir local para pendurar os aventais e EPI´s;\n7. Criar padrão de limpeza das máquinas de solda","prazo":{"type":"date","value":"2025-10-30"},"responsavel":"Pedro","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":77.0,"comentario":""},"c3-a2":{"nota":61.0,"comentario":""},"c3-a3":{"nota":53.0,"comentario":""}}},{"id":"area-15","nome":"Oficina Mecânica","departamento":"Manutenção","lider":"RENILSON","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-21","itens":[{"id":"a15-1","numero":1,"problema":"FALTA DE PADRONIZAÇÃO E LAYOUT PARA KIT DE PRIMEIROS SOCORROS; FALTA IDENTIFICAÇÃO DOS MATERIAIS NA PRATELEIRA","qtdAcoes":2,"oQueFazer":"1. Criar um layout e delimitação para uso de kit de primeiros socorros;\n2. Identificar os materiais presentes nas prateleiras","prazo":null,"responsavel":"Renilson","status":"pendente","foto":null},{"id":"a15-2","numero":2,"problema":"FALTA DE INSTALAÇÃO DE TOMADAS NA REFORMA DO LOCAL","qtdAcoes":1,"oQueFazer":"1. Solicitar a instalação das tomadas nos locais em aberto","prazo":null,"responsavel":"Renilson","status":"pendente","foto":null},{"id":"a15-3","numero":3,"problema":"FALTA NO CONTROLE DE ACESSO","qtdAcoes":1,"oQueFazer":"1. Instalar uma porta/portão para controle de acesso","prazo":null,"responsavel":"Renilson","status":"pendente","foto":null},{"id":"a15-4","numero":4,"problema":"ALTA UMIDADE PRESENTE NA PAREDE","qtdAcoes":2,"oQueFazer":"1. Solicitar a Eng. Civil sanar vazamentos e a origem da umidade na parede da sala;\n2. Realizar pintura após correção da umidade na parede","prazo":null,"responsavel":"Renilson","status":"pendente","foto":null},{"id":"a15-5","numero":5,"problema":"FALTA DE ILUMINAÇÃO NA ENTRADA DO BANHEIRO","qtdAcoes":1,"oQueFazer":"1. Solicitar instalação de iluminação","prazo":null,"responsavel":"Renilson","status":"pendente","foto":null},{"id":"a15-6","numero":6,"problema":"PAREDE COM SINAIS DE INFILTRAÇÃO; PINTURA PRECISANDO SER REFEITA.","qtdAcoes":2,"oQueFazer":"1. Verificar com a Eng. Civil a retirada desta infiltração;\n2. Realizar nova pintura","prazo":null,"responsavel":"Renilson","status":"pendente","foto":null},{"id":"a15-7","numero":7,"problema":"TOMADA INSTALADA EM CAIXA AMARRADA POR ARAME","qtdAcoes":1,"oQueFazer":"1. Realizar nova instalação da tomada de forma adequada","prazo":null,"responsavel":"Renilson","status":"pendente","foto":null},{"id":"a15-8","numero":8,"problema":"INSTALAÇÃO DE FIAÇÃO JUNTO AO TORNO SEM PADRONIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Solicitar a reinstalação ou adequação da existente nos equipamentos","prazo":null,"responsavel":"Renilson","status":"pendente","foto":null},{"id":"a15-9","numero":9,"problema":"MATERIAS SEM USO;\nMATERIAIS SEM IDENTIFICAÇÃO;\nFALTA DE LIMPEZA;  PAREDE SUJA; ARMÁRIOS DESPADRONIZADOS","qtdAcoes":7,"oQueFazer":"1. Retirar materiais sem uso e descartar;\n2. Organizar o local;\n3. Limpar o local;\n4. Pintar paredes, teto e estrutura;\n5. Padronizar armários;\n6. Definir local para pendurar os aventais e EPI´s;\n7. Criar padrão de limpeza das máquinas de solda","prazo":{"type":"date","value":"2025-10-30"},"responsavel":"Renilson","status":"pendente","foto":null},{"id":"a15-10","numero":10,"problema":"DANO ESTRUTURAL NA PAREDE","qtdAcoes":2,"oQueFazer":"1. Solicitar a Eng. Civil reparo estrutural necessário na parede;\n2. Realizar pintura após o reparo estrutural","prazo":null,"responsavel":"Renilson","status":"pendente","foto":null},{"id":"a15-11","numero":11,"problema":"VAZAMENTO E SUJIDADES NA PAREDE PELO AR CONDICIONADO;","qtdAcoes":1,"oQueFazer":"1. Verificar sistema de drenagem do ar condicionado e revisão no equipamento para evitar fuga de água fora do sistema de drenagem","prazo":null,"responsavel":"Renilson","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":85.0,"comentario":""},"c3-a2":{"nota":91.0,"comentario":""},"c3-a3":{"nota":88.0,"comentario":""}}},{"id":"area-16","nome":"Instrumentação","departamento":"Manutenção","lider":"MARCO AURÉLIO","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-20","itens":[{"id":"a16-1","numero":1,"problema":"FALTA DE LAYOUT PARA ALOCAÇÃO DA ESCADA","qtdAcoes":1,"oQueFazer":"1. Criar um layout para determinar a posição para a escada no setor","prazo":null,"responsavel":"Marco Aurélio","status":"pendente","foto":null},{"id":"a16-2","numero":2,"problema":"NECESSIDADE DE MELHORIA NA UTILIZAÇÃO DA BANCADA DE LIMPEZA","qtdAcoes":1,"oQueFazer":"1. Solicitar a alteração ou troca da bancada para facilitar o uso da área inferior","prazo":null,"responsavel":"Marco Aurélio","status":"pendente","foto":null},{"id":"a16-3","numero":3,"problema":"RETORNO DE ÁGUA DO AR CONDICIONADO SENDO CONTIDO POR CALHA","qtdAcoes":1,"oQueFazer":"1. Verificar a troca do ar condicionado por do mesmo modelo em bom estado ou aquisição de novo","prazo":null,"responsavel":"Marco Aurélio","status":"pendente","foto":null},{"id":"a16-4","numero":4,"problema":"ARMÁRIOS COM SINAIS DE DETERIORAÇÃO","qtdAcoes":1,"oQueFazer":"1. Realizar recuperação e pintura dos armários","prazo":null,"responsavel":"Marco Aurélio","status":"pendente","foto":null},{"id":"a16-5","numero":5,"problema":"FALTA DE PADRONIZAÇÃO NA ALIMENTAÇÃO DAS TOMADAS","qtdAcoes":1,"oQueFazer":"1. Solicitar a instalação elétrica  padronizada e caso não utilizar tomadas, trocar a passagem dos cabos","prazo":null,"responsavel":"Marco Aurélio","status":"pendente","foto":null},{"id":"a16-6","numero":6,"problema":"FALTA DE IDENTIFICAÇÃO NOS ARMÁRIOS","qtdAcoes":1,"oQueFazer":"1. Realizar a identificação de todas as baias","prazo":null,"responsavel":"Marco Aurélio","status":"pendente","foto":null},{"id":"a16-7","numero":7,"problema":"PRESENÇA DE INSTALAÇÃO ELÉTRICA SEM UTILIDADE","qtdAcoes":1,"oQueFazer":"1. Solicitar a retirada desta instalação.","prazo":null,"responsavel":"Marco Aurélio","status":"pendente","foto":null},{"id":"a16-8","numero":8,"problema":"FALTA DE IDENTIFICAÇÃO DENTRO DOS ARMÁRIOS","qtdAcoes":2,"oQueFazer":"1. Criar layout interno para separar os tipos de peças\n2. Realizar a identificação de todas as prateleiras","prazo":null,"responsavel":"Marco Aurélio","status":"pendente","foto":null},{"id":"a16-9","numero":9,"problema":"CABEAMENTO SOLTO POR CIMA DE CHAPAS NO TETO DA SALA","qtdAcoes":1,"oQueFazer":"1. Realizar passagem dos fios de modo protegido segundo padronização da elétrica","prazo":null,"responsavel":"Marco Aurélio","status":"pendente","foto":null},{"id":"a16-10","numero":10,"problema":"MATERIAS SEM USO;\nMATERIAIS SEM IDENTIFICAÇÃO;\nFALTA DE LIMPEZA;  PAREDE SUJA; ARMÁRIOS DESPADRONIZADOS","qtdAcoes":7,"oQueFazer":"1. Retirar materiais sem uso e descartar;\n2. Organizar o local;\n3. Limpar o local;\n4. Pintar paredes, teto e estrutura;\n5. Padronizar armários;\n6. Definir local para pendurar os aventais e EPI´s;\n7. Criar padrão de limpeza das máquinas de solda","prazo":{"type":"date","value":"2025-10-30"},"responsavel":"Pedro","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":88.0,"comentario":""},"c3-a2":{"nota":91.0,"comentario":""},"c3-a3":{"nota":75.0,"comentario":""}}},{"id":"area-17","nome":"Lubrificação","departamento":"Manutenção","lider":"ANDERSON OLIVEIRA","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-21","itens":[{"id":"a17-1","numero":1,"problema":"PISO NECESSITANDO DE REPAROS E PINTURA","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng. Civil melhoria no piso","prazo":null,"responsavel":"Anderson Oliveira","status":"pendente","foto":null},{"id":"a17-2","numero":2,"problema":"MELHORAR APOIO DOS TAMBORES E MELHORIA DO ESPAÇO","qtdAcoes":1,"oQueFazer":"1. Criação de cavaletes","prazo":null,"responsavel":"Anderson Oliveira","status":"pendente","foto":null},{"id":"a17-3","numero":3,"problema":"INSTALAÇÃO IMPROVIDASA DE VENTILAÇÃO LOCAL","qtdAcoes":1,"oQueFazer":"1. Solicitar a aquisição de um ventilador de parede","prazo":null,"responsavel":"Anderson Oliveira","status":"pendente","foto":null},{"id":"a17-4","numero":4,"problema":"TOMADA INAPROPRIADA FORA DE PADRONIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Solictar nova instalação de tomada","prazo":null,"responsavel":"Anderson Oliveira","status":"pendente","foto":null},{"id":"a17-5","numero":5,"problema":"PASSAGEM DE TUBULAÇÃO SEM VEDAÇÃO TÉRMICA INTERNAMENTE NA ÁREA DE TRABALHO","qtdAcoes":1,"oQueFazer":"1. Solicitar a vedação térmica da tubulação","prazo":null,"responsavel":"Anderson Oliveira","status":"pendente","foto":null},{"id":"a17-6","numero":6,"problema":"ILUMINAÇÃO IMPROVISADA NECESSITANDO REPAROS","qtdAcoes":1,"oQueFazer":"1. Realizar melhorias na iluminação do local","prazo":null,"responsavel":"Anderson Oliveira","status":"pendente","foto":null},{"id":"a17-7","numero":7,"problema":"ESTRUTURA DE ALVENARIA COM DETERIORAÇÃO PRECISANDO DE REPAROS","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng.Civil o reparo necessário para o setor","prazo":null,"responsavel":"Anderson Oliveira","status":"pendente","foto":null},{"id":"a17-8","numero":8,"problema":"FALTA DE CONTROLE DE ACESSO AO SETOR","qtdAcoes":1,"oQueFazer":"1. Solicitar gradeamento para acesso controlado","prazo":null,"responsavel":"Anderson Oliveira","status":"pendente","foto":null},{"id":"a17-9","numero":9,"problema":"MATERIAS SEM USO;\nMATERIAIS SEM IDENTIFICAÇÃO;\nFALTA DE LIMPEZA;  PAREDE SUJA; ARMÁRIOS DESPADRONIZADOS","qtdAcoes":7,"oQueFazer":"1. Retirar materiais sem uso e descartar;\n2. Organizar o local;\n3. Limpar o local;\n4. Pintar paredes, teto e estrutura;\n5. Padronizar armários;\n6. Definir local para pendurar os aventais e EPI´s;\n7. Criar padrão de limpeza das máquinas de solda","prazo":{"type":"date","value":"2025-10-30"},"responsavel":"Anderson Oliveira","status":"pendente","foto":null},{"id":"a17-10","numero":10,"problema":"FALTA DE CONTROLE DE ACESSO AO SETOR","qtdAcoes":1,"oQueFazer":"1. Solicitar gradeamento para acesso controlado","prazo":null,"responsavel":"Anderson Oliveira","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":86.0,"comentario":""},"c3-a2":{"nota":91.0,"comentario":""},"c3-a3":{"nota":94.0,"comentario":""}}},{"id":"area-18","nome":"Mecânica","departamento":"Manutenção","lider":"FLÁVIO","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-21","itens":[{"id":"a18-1","numero":1,"problema":"SISTEMA DE FIAÇÃO DE TOMADA E ILUMINAÇÃO IMPROVISADOS SEM PADRONIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Instalar tomadas e interruptores de forma padronizada.","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-2","numero":2,"problema":"FALTA DE REBOCO E PINTURA NA PAREDE","qtdAcoes":2,"oQueFazer":"1. Restaurar reboco e unificar a parede;\n2. Realizar pintura","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-3","numero":3,"problema":"SUJEIRA; MATERIAIS DESORGANIZADOS; MATERIAIS SEM UTILIZAÇÃO;","qtdAcoes":4,"oQueFazer":"1. Limpar área;\n2. Descartar materiais sem uso;\n3. Organizar materiais;\n4. Identificar materiais.","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-4","numero":4,"problema":"ESTRUTURA DO AMBIENTE SEM ILUMINAÇÃO","qtdAcoes":1,"oQueFazer":"1. Solicitar instalação de iluminação no ambiente","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-5","numero":5,"problema":"PAREDES NECESSITANDO DE REPAROS E PINTURA","qtdAcoes":1,"oQueFazer":"1. Realizar reparos necessários e pintura posterior na parede","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-6","numero":6,"problema":"FIAÇÃO EXPOSTA SEM PADRONIZAÇÃO NA INSTALAÇÃO","qtdAcoes":1,"oQueFazer":"1. Corrigir infra de elétrica;","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-7","numero":7,"problema":"PRESENÇA DE PAINEL DESATIVADO SENDO UTILIZADO COMO LIXEIRO","qtdAcoes":1,"oQueFazer":"1. Solicitar a retirada deste painel","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-8","numero":8,"problema":"PRESENÇA DE ARMÁRIOS EM ÁREA INAPROPRIADA","qtdAcoes":1,"oQueFazer":"1. Solicitar a retirada destes armários e realocar para outro local padronizado","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-9","numero":9,"problema":"ESCADA SEM DELIMITAÇÃO DE LAYOUT PARA GUARDA APÓS USO","qtdAcoes":1,"oQueFazer":"1. Determinar um local  com layout para guarda do material após a utilização","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-10","numero":10,"problema":"MESA UTILIZADA COMO BANCADA COM DETERIORAÇÃO E SEM PADRONIZAÇÃO","qtdAcoes":3,"oQueFazer":"1. Reformar mesa ou adquirir nova bancada;\n2. Criar padronização realizando pintura e layout da área de trabalho.\n3. Identificar as gavetas","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-11","numero":11,"problema":"EXCESSO DE ÁGUA NO SISTEMA DE REFRIGERAÇÃO DURANTE A MOAGEM","qtdAcoes":1,"oQueFazer":"1. Realizar melhorias para diminuir a incidência de água na localidade","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-12","numero":12,"problema":"ARMÁRIOS SEM PADRONIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Aquisição de novos armários","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-13","numero":13,"problema":"UTENSÍLIOS NÃO UTILIZANDO O ESPAÇO DELIMITADO","qtdAcoes":1,"oQueFazer":"1. Atentar e adequar os utensílios, ferramentas e bancadas para estarem dentro da delimitação do layout","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-14","numero":14,"problema":"FALTA DE IDENTIFICAÇÃO DAS PEÇAS AGRUPADAS","qtdAcoes":1,"oQueFazer":"1. Realizar a identificação dos itens","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-15","numero":15,"problema":"FALTA DE IDENTIFICAÇÃO DAS PEÇAS AGRUPADAS","qtdAcoes":1,"oQueFazer":"1. Realizar a identificação dos itens","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-16","numero":16,"problema":"CABOS DESORGANIZADOS","qtdAcoes":1,"oQueFazer":"1. Realizar melhoria na distribuição do cabeamento","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-17","numero":17,"problema":"REALIZAR MELHORIAS NA ESTRUTURA ALVENARIA PARA CABEAMENTO NO PRÉDIO DE AR COMPRIMIDO","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng. Civil melhoria na estrutura para passagem do cabeamento","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-18","numero":18,"problema":"ILUMINAÇÃO SEM PADRONIZAÇÃO NO PRÉDIO DE AR COMPRIMIDO","qtdAcoes":1,"oQueFazer":"1. Solicitar a instalação da iluminação padronizada no local","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-19","numero":19,"problema":"MATERIAS SEM USO;\nMATERIAIS SEM IDENTIFICAÇÃO;\nFALTA DE LIMPEZA;  PAREDE SUJA; ARMÁRIOS DESPADRONIZADOS","qtdAcoes":7,"oQueFazer":"1. Retirar materiais sem uso e descartar;\n2. Organizar o local;\n3. Limpar o local;\n4. Pintar paredes, teto e estrutura;\n5. Padronizar armários;\n6. Definir local para pendurar os aventais e EPI´s;\n7. Criar padrão de limpeza das máquinas de solda","prazo":{"type":"date","value":"2025-10-30"},"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-20","numero":20,"problema":"CABOS DESORGANIZADOS; ILUMINAÇÃO PRECISANDO DE MELHORIAS ABAIXO DA MOENDA","qtdAcoes":1,"oQueFazer":"1. Revisar a instalação da fiação e adequar a iluminação","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-21","numero":21,"problema":"INSTALAÇÃO DE TOMADA INADEQUADA NO AMBIENTE","qtdAcoes":1,"oQueFazer":"1. Solicitar instalação de tomadas necessárias ao setor conforme padronização","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-22","numero":22,"problema":"PRESENÇA DE INFILTRAÇÃO E TELHAS PARA PROTEGER O AMBIENTE DE TRABALHO","qtdAcoes":1,"oQueFazer":"1. Solicitar a Eng. Civil a melhoria na infra estrutura do teto abaixo da moenda","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-23","numero":23,"problema":"PRESENÇA DE ARMÁRIOS SEM IDENTIFICAÇÃO E NEM PADRONIZAÇÃO","qtdAcoes":1,"oQueFazer":"1. Verificar a necessidade dos armários e padroniza-los conforme demais do setor","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-24","numero":24,"problema":"PISO APRESENTANDO AFUNDAMENTO PRÓXIMO A UMA GALERIA","qtdAcoes":1,"oQueFazer":"1. Solicitar a verificação da Eng. Civil sobre intervenção e obras no local","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null},{"id":"a18-25","numero":25,"problema":"FALTA DE PADRONIZAÇÃO E LAYOUT EM MESA DE TRABALHO","qtdAcoes":1,"oQueFazer":"1. Realizar layout e padronização na mesa de trabalho, realizando melhoria da infraestrutura atual ou solicitar uma nova estação","prazo":null,"responsavel":"Flávio","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":75.0,"comentario":""},"c3-a2":{"nota":71.0,"comentario":""},"c3-a3":{"nota":80.0,"comentario":""}}},{"id":"area-19","nome":"Escritório Manutenção","departamento":"Administrativo","lider":"LIDIANE","auditor":"MARCOS ARAÚJO","dataFoto":"2026-03-20","itens":[{"id":"a19-1","numero":1,"problema":"PASTAS SEM LOCAL DELIMITADO SEM PADRONIZAÇÃO DE GUARDA","qtdAcoes":1,"oQueFazer":"1. Instalar armário projetado para alocação das pastas que se encontram em cima do armário","prazo":null,"responsavel":"Lidiane","status":"pendente","foto":null},{"id":"a19-2","numero":2,"problema":"FALTA LOCAL PARA ALOCAÇÃO DE EPIs; ARQUIVOS ESPALHADOS; FALTA DE LAYOUT E DEFINIÇÃO DE ESPAÇO PARA KIT DE PRIMEIROS SOCORROS","qtdAcoes":4,"oQueFazer":"1. Guardar arquivos em estante/local adequado;\n2. Modificar e instalar armários conforme padrão já solicitado em projeto;\n3. Definir local para alocação de EPIs e objetos pessoais.\n4. Definição de local para kit de primeiros socorros","prazo":null,"responsavel":"Lidiane","status":"pendente","foto":null},{"id":"a19-3","numero":3,"problema":"FALTA ESPAÇO PARA ORGANIZAÇÃO DE PROJETOS;","qtdAcoes":2,"oQueFazer":"1. Organizar arquivos, projetos e materiais, dependendo de armário/nicho já projetado para área;\n2. Retirar a mesa atual e colocar uma nova projetada com tamanho adequado para visualização e estudos de projetos","prazo":null,"responsavel":"Lidiane","status":"pendente","foto":null},{"id":"a19-4","numero":4,"problema":"PROJETOS DESORGANIZADOS; MATERIAIS JUNTO COM ARQUIVOS SEM PADRONIZAÇÃO;","qtdAcoes":2,"oQueFazer":"1. Organizar os projetos com armário já projetado para área;\n2. Criar layout para não misturar papéis e projetos com ferramentas e utensílios de atividade em campo.","prazo":null,"responsavel":"Lidiane","status":"pendente","foto":null},{"id":"a19-5","numero":5,"problema":"ESTAÇÕES DE TRABALHO SIMILARES OCUPANDO ESPAÇOS DIFERENTES","qtdAcoes":1,"oQueFazer":"1. Realocar a estação de trabalho da esquerda para a direita, unificando os trabalhos em área padronizada","prazo":null,"responsavel":"LIDIANE","status":"pendente","foto":null},{"id":"a19-6","numero":6,"problema":"SUJIDADES NAS TOMADAS; FALTA DE TAMPA NA SAÍDA DO CABEAMENTO DE REDE;  FALTA DE ORGANIZAÇÃO EM CABEAMENTO E FIAÇÃO","qtdAcoes":3,"oQueFazer":"1. Retirar as tampas das tomadas e realizar limpeza;\n2. Solicitar tampa para saida de cabeamento de rede ou realizar a troca;\n3. Organizar cabeamento embaixo da mesa","prazo":null,"responsavel":"Lidiane","status":"pendente","foto":null},{"id":"a19-7","numero":7,"problema":"FALTA DE LAYOUT E PADRONIZAÇÃO NA ESTAÇÃO DE ATENDIMENTO AOS COLABORADORES E REQUISIÇÕES.","qtdAcoes":1,"oQueFazer":"1.  Criar layout para a estação de trabalho administrativo","prazo":null,"responsavel":"Lidiane","status":"pendente","foto":null},{"id":"a19-8","numero":8,"problema":"MATERIAS SEM USO;\nMATERIAIS SEM IDENTIFICAÇÃO;\nFALTA DE LIMPEZA;  PAREDE SUJA; ARMÁRIOS DESPADRONIZADOS","qtdAcoes":7,"oQueFazer":"1. Retirar materiais sem uso e descartar;\n2. Organizar o local;\n3. Limpar o local;\n4. Pintar paredes, teto e estrutura;\n5. Padronizar armários;\n6. Definir local para pendurar os aventais e EPI´s;\n7. Criar padrão de limpeza das máquinas de solda","prazo":{"type":"date","value":"2025-10-30"},"responsavel":"Pedro","status":"pendente","foto":null}],"auditorias":{"c3-a1":{"nota":97.0,"comentario":""},"c3-a2":{"nota":61.0,"comentario":""},"c3-a3":{"nota":89.0,"comentario":""}}},{"id":"area-20","nome":"Administrativo — Célio","departamento":"Administrativo","lider":"Célio","auditor":"Marcos Araújo","dataFoto":null,"itens":[],"auditorias":{"c3-a1":{"nota":50.0,"comentario":""},"c3-a2":{"nota":51.0,"comentario":""},"c3-a3":{"nota":62.0,"comentario":""}}},{"id":"area-21","nome":"Garagem — Jefferson","departamento":"Garagem","lider":"Jefferson","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{"c3-a1":{"nota":28.0,"comentario":""},"c3-a2":{"nota":55.0,"comentario":""},"c3-a3":{"nota":49.0,"comentario":""}}},{"id":"area-22","nome":"Garagem — Jair","departamento":"Garagem","lider":"Jair","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{"c3-a1":{"nota":28.0,"comentario":""},"c3-a2":{"nota":37.0,"comentario":""},"c3-a3":{"nota":36.0,"comentario":""}}},{"id":"area-23","nome":"Garagem — Cicero","departamento":"Garagem","lider":"Cicero","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{"c3-a1":{"nota":26.0,"comentario":""},"c3-a2":{"nota":44.0,"comentario":""},"c3-a3":{"nota":33.0,"comentario":""}}},{"id":"area-24","nome":"Garagem — Roberto","departamento":"Garagem","lider":"Roberto","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{"c3-a1":{"nota":33.0,"comentario":""},"c3-a2":{"nota":45.0,"comentario":""},"c3-a3":{"nota":41.0,"comentario":""}}},{"id":"area-25","nome":"Garagem — Rozenildo","departamento":"Garagem","lider":"Rozenildo","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{"c3-a1":{"nota":32.0,"comentario":""},"c3-a2":{"nota":43.0,"comentario":""},"c3-a3":{"nota":60.0,"comentario":""}}}],"4":[{"id":"area-1","nome":"Caldeira","departamento":"Industrial","lider":"ROMERITO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-2","nome":"Laboratório","departamento":"Administrativo","lider":"ODAIR","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-3","nome":"Destilaria","departamento":"Industrial","lider":"DAVID","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-4","nome":"Armazéns E Área De Envase","departamento":"Industrial","lider":"NELSON BRÁS","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-5","nome":"Mesas, Tombador E Esteiras","departamento":"Industrial","lider":"MARCONE","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-6","nome":"Fabricação","departamento":"Industrial","lider":"GILBERTO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-7","nome":"Moenda","departamento":"Industrial","lider":"CLÁUDIO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-8","nome":"Ruas, Navio","departamento":"Industrial","lider":"ZUMBA","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-9","nome":"Balança","departamento":"Administrativo","lider":"ROZEILDO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-10","nome":"Vestiário / Refeitório","departamento":"Administrativo","lider":"ROZEILDO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-11","nome":"Caldeiraria","departamento":"Manutenção","lider":"PEDRO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-12","nome":"Elétrica","departamento":"Manutenção","lider":"DJAIR / VALMIR","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-13","nome":"Extração","departamento":"Manutenção","lider":"EDENILDO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-14","nome":"Centrífugas De Açúcar (Manut.)","departamento":"Manutenção","lider":"SÉRGIO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-15","nome":"Oficina Mecânica","departamento":"Manutenção","lider":"RENILSON","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-16","nome":"Instrumentação","departamento":"Manutenção","lider":"MARCO AURÉLIO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-17","nome":"Lubrificação","departamento":"Manutenção","lider":"ANDERSON OLIVEIRA","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-18","nome":"Mecânica","departamento":"Manutenção","lider":"FLÁVIO","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-19","nome":"Escritório Manutenção","departamento":"Administrativo","lider":"LIDIANE","auditor":"MARCOS ARAÚJO","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-20","nome":"Administrativo — Célio","departamento":"Administrativo","lider":"Célio","auditor":"Marcos Araújo","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-21","nome":"Garagem — Jefferson","departamento":"Garagem","lider":"Jefferson","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-22","nome":"Garagem — Jair","departamento":"Garagem","lider":"Jair","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-23","nome":"Garagem — Cicero","departamento":"Garagem","lider":"Cicero","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-24","nome":"Garagem — Roberto","departamento":"Garagem","lider":"Roberto","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}},{"id":"area-25","nome":"Garagem — Rozenildo","departamento":"Garagem","lider":"Rozenildo","auditor":"Hérmane Jasher","dataFoto":null,"itens":[],"auditorias":{}}]};
const SEED_SETTINGS = {"millName":"Usina Serra Grande","programName":"Programa 5S","thresholds":{"red":60,"yellow":79},"departments":["Industrial","Manutenção","Administrativo","Garagem"],"developedNote":"Baseado no Gerenciador do Programa 5S (3º Ciclo) — Metodologia Gesteq","cicloAtual":"4","ciclos":{"1":{"label":"1º Ciclo","period":"Novembro/2025 a Fevereiro/2026","rounds":[{"id":"c1-a1","label":"Auditoria 1","periodo":"Novembro/2025"},{"id":"c1-a2","label":"Auditoria 2","periodo":"Dezembro/2025"},{"id":"c1-a3","label":"Auditoria 3","periodo":"Janeiro/2026"},{"id":"c1-a4","label":"Auditoria 4","periodo":"Fevereiro/2026"}]},"2":{"label":"2º Ciclo","period":"Março a Maio de 2026","rounds":[{"id":"c2-a1","label":"Auditoria 1","periodo":"Março/2026"},{"id":"c2-a2","label":"Auditoria 2","periodo":"Abril/2026"},{"id":"c2-a3","label":"Auditoria 3","periodo":"Maio/2026"}]},"3":{"label":"3º Ciclo","period":"Junho a Agosto de 2026","rounds":[{"id":"c3-a1","label":"Auditoria 1","periodo":"Junho/2026"},{"id":"c3-a2","label":"Auditoria 2","periodo":"Julho/2026"},{"id":"c3-a3","label":"Auditoria 3","periodo":"Agosto/2026"}]},"4":{"label":"4º Ciclo","period":"","rounds":[]}}};
const SEED_COMMITTEE = [{"id":"m1","nome":"Hérmane Jasher","cargo":"Coordenação do Programa 5S","departamento":"Administrativo"},{"id":"m2","nome":"Marcos Araújo","cargo":"Consultoria — Gesteq","departamento":"Administrativo"},{"id":"m3","nome":"George","cargo":"Facilitador — Industrial","departamento":"Industrial"},{"id":"m4","nome":"Durval Neto","cargo":"Facilitador — Manutenção","departamento":"Manutenção"},{"id":"m5","nome":"Hermani Quintela","cargo":"Facilitador — Manutenção","departamento":"Manutenção"},{"id":"m6","nome":"Diogo","cargo":"Facilitador — Industrial","departamento":"Industrial"},{"id":"m7","nome":"Diogenes","cargo":"Equipe do Programa 5S","departamento":"Administrativo"},{"id":"m8","nome":"Carlos","cargo":"Equipe do Programa 5S","departamento":"Administrativo"},{"id":"m9","nome":"Miguel","cargo":"Diretoria","departamento":"Administrativo"},{"id":"m10","nome":"Gesildo","cargo":"PCM Automotivo — Garagem","departamento":"Garagem"}];
const SEED_CRONOGRAMA = [{"id":"f1","fase":"Fase Preparatória","tarefas":[{"id":"f1t1","nome":"Ciclo II — Loteamento, formação de grupos e diagnóstico inicial","periodo":"Março a Maio de 2026","status":"concluido"},{"id":"f1t2","nome":"Ciclo III — Preparação, loteamento e ajustes de grupos","periodo":"Junho a Agosto de 2026","status":"em_andamento"}]},{"id":"f2","fase":"Fase de Capacitação","tarefas":[{"id":"f2t1","nome":"Reformulação da equipe de auditores","periodo":"Contínuo","status":"em_andamento"},{"id":"f2t2","nome":"Treinamento para terceiros no Programa 5S","periodo":"Junho e Julho de 2026","status":"em_andamento"},{"id":"f2t3","nome":"Treinamento para novos grupos (Garagem) no Programa 5S","periodo":"Junho e Julho de 2026","status":"concluido"}]},{"id":"f3","fase":"Fase de Execução","tarefas":[{"id":"f3t1","nome":"Condução e monitoramento contínuo das ações","periodo":"Março a Agosto de 2026","status":"em_andamento"},{"id":"f3t2","nome":"Auditorias mensais para avaliação de desempenho","periodo":"Mensal","status":"em_andamento"},{"id":"f3t3","nome":"Seminário de apresentação dos grupos — Ciclo I","periodo":"Concluído","status":"concluido"},{"id":"f3t4","nome":"Seminário de apresentação dos grupos — Ciclo II","periodo":"Concluído","status":"concluido"},{"id":"f3t5","nome":"Seminário de apresentação dos grupos — Ciclo III","periodo":"Agosto de 2026","status":"pendente"}]}];
const SEED_MASTERPLAN = [{"item":1,"acao":"Realizar apresentação do Modelo do Programa 5S da Gesteq para a Diretoria.","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2025-10-01","dataTermino":"2025-10-09","observacoes":""},{"item":2,"acao":"Realizar apresentação do Modelo do Programa 5S da Gesteq para os gerentes dos Departamentos Industrial e de Manutenção.","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2025-10-01","dataTermino":"2025-10-09","observacoes":""},{"item":3,"acao":"Definir área de Descarte (Coleta Seletiva, Sucata e Materiais para reaproveitamento).","responsavel":"Miguel","status":"concluida","dataInicio":"2025-10-01","dataTermino":"2025-10-09","observacoes":""},{"item":4,"acao":"Definir o Facilitador do Departamento de Manutenção.","responsavel":"Hermani Quintela","status":"concluida","dataInicio":"2025-10-01","dataTermino":"2025-10-09","observacoes":""},{"item":5,"acao":"Definir o Facilitador do Departamento de Industrial.","responsavel":"Diogo","status":"concluida","dataInicio":"2025-10-01","dataTermino":"2025-10-09","observacoes":""},{"item":6,"acao":"Direcionar a definição dos Loteamentos das áreas (Industrial e Manutenção).","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-09","observacoes":""},{"item":7,"acao":"Lotear as áreas alinhadas, para especificar por líder e grupo do 5S para o Industrial.","responsavel":"Diogo","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-09","observacoes":""},{"item":8,"acao":"Lotear as áreas alinhadas, para especificar por líder e grupo do 5S para a Manutenção.","responsavel":"Hermani Quintela","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-09","observacoes":""},{"item":9,"acao":"Definir 3 participantes para as dinâmicas da apresentação do Programa 5S da Manutenção.","responsavel":"Hermani Quintela","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-10","observacoes":""},{"item":10,"acao":"Definir 3 participantes para as dinâmicas da apresentação do Programa 5S do Industrial.","responsavel":"Diogo","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-10","observacoes":""},{"item":11,"acao":"Construir versão completa e definitiva do Loteamento da Fase 1 do Programa 5S da Serra Grande.","responsavel":"Cicero Leite","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-10","observacoes":""},{"item":12,"acao":"Realizar apresentação do Modelo do Programa 5S da Gesteq, com Loteamento, para os Líderes da Manutenção.","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-10","observacoes":""},{"item":13,"acao":"Realizar apresentação do Modelo do Programa 5S da Gesteq, com Loteamento, para os Líderes do Industrial.","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-10","observacoes":""},{"item":14,"acao":"Capturar registros fotográficos para construção dos PADs da Manutenção.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-10","observacoes":""},{"item":15,"acao":"Capturar registros fotográficos para construção dos PADs do Industrial.","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-10","observacoes":""},{"item":16,"acao":"Formar os grupos do 5S do Departamento de Manutenção.","responsavel":"Durval Neto","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-10","observacoes":""},{"item":17,"acao":"Formar os grupos do 5S do Departamento Industrial.","responsavel":"George","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-10","observacoes":""},{"item":18,"acao":"Definir claramente qual será a \"Área de Descarte\", para o destino da: 1-Coleta Seletiva; 2-Sucatas para venda; 3-Materiais e Equipamentos para Reutilização.","responsavel":"Hermani Quintela","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-10","observacoes":""},{"item":19,"acao":"Iniciar construção dos PADs do Departamento de Manutenção e treinar o Facilitador.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-10","observacoes":""},{"item":20,"acao":"Iniciar construção dos PADs do Departamento Industrial e treinar o Facilitador.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-10","observacoes":""},{"item":21,"acao":"Definir o Calendário do 1º Ciclo e Seminário do Programa 5S da Serra Grande.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-24","observacoes":""},{"item":22,"acao":"Definir premiação para os vencedores do 1º Seminário do Programa 5S da Serra Grande.","responsavel":"Miguel","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-24","observacoes":""},{"item":23,"acao":"Realizar treinamento para os facilitadores sobre elaboração de PADs.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-10-09","dataTermino":"2025-10-24","observacoes":""},{"item":24,"acao":"Realizar construção de todos os PADs do Departamento de Manutenção e treinar o Facilitador.","responsavel":"Durval Neto","status":"concluida","dataInicio":"2025-10-10","dataTermino":"2025-10-24","observacoes":""},{"item":25,"acao":"Realizar construção de todos os PADs do Departamento Industrial.","responsavel":"George","status":"concluida","dataInicio":"2025-10-10","dataTermino":"2025-10-24","observacoes":""},{"item":26,"acao":"Realizar revisão final do Loteamento dos Grupos do 5S (Industrial e Manutenção).","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-10-10","dataTermino":"2025-10-29","observacoes":""},{"item":27,"acao":"Validar e alinhar a área de descarte.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-10-10","dataTermino":"2025-10-29","observacoes":""},{"item":28,"acao":"Definir e alinhar calendário dos dois ciclos iniciais do Programa 5S.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-10-10","dataTermino":"2025-10-29","observacoes":""},{"item":29,"acao":"Definir equipe de auditores (4).","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-10-10","dataTermino":"2025-10-29","observacoes":""},{"item":30,"acao":"Revisar todos os PADs do Departamento de Manutenção Industrial.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-10-10","dataTermino":"2025-10-29","observacoes":""},{"item":31,"acao":"Revisar todos os PADs do Departamento Industrial.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-10-10","dataTermino":"2025-10-29","observacoes":""},{"item":32,"acao":"Realizar entrega (apresentação, explicação e negociação dos prazos) dos PADs para os líderes do Departamento de Manutenção Industrial.","responsavel":"Durval Neto","status":"concluida","dataInicio":"2025-10-29","dataTermino":"2025-10-30","observacoes":""},{"item":33,"acao":"Realizar entrega (apresentação, explicação e negociação dos prazos) dos PADs para os líderes do Departamento Industrial.","responsavel":"George","status":"concluida","dataInicio":"2025-10-29","dataTermino":"2025-10-30","observacoes":""},{"item":34,"acao":"Realizar treinamento do Programa 5S com TODOS os envolvidos (Superintendente, Diretores, Gestores, Encarregados, Líderes e Operacionais).","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2025-10-29","dataTermino":"2025-11-13","observacoes":""},{"item":35,"acao":"Realizar Diagnóstico Inicial dos Grupos do Departamento de Manutenção.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-10-29","dataTermino":"2025-11-14","observacoes":""},{"item":36,"acao":"Realizar Diagnóstico Inicial dos Grupos do Departamento Industrial.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-10-29","dataTermino":"2025-11-14","observacoes":""},{"item":37,"acao":"Realizar 2ª Auditoria dos Grupos do do Departamento de Manutenção.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-11-14","dataTermino":"2025-12-11","observacoes":""},{"item":38,"acao":"Realizar 2ª Auditoria dos Grupos do do Departamento Industrial.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-11-14","dataTermino":"2025-12-11","observacoes":""},{"item":39,"acao":"Apresentar o escopo completo do projeto para equipe do projeto (Diogo, Hermani, George, Diogenes, Durval e Rodrigo).","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2025-11-08","dataTermino":"2025-12-11","observacoes":""},{"item":40,"acao":"Realinhar status atual do Programa 5S, direcionar situações que ainda precisam de atenção (áreas mistas, intervenções interdepartamentais por servicos, mais demandas de coletores nas áreas, estruturação de Baias de descarte final da Usina inteira e áreas de descarte).","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-11-09","dataTermino":"2025-12-11","observacoes":""},{"item":41,"acao":"Revisar e validar indicadores propostos pelo grupo e validar lista final para construção dos quadros de gestão à vista.","responsavel":"Miguel","status":"concluida","dataInicio":"2025-12-16","dataTermino":"2026-01-05","observacoes":""},{"item":42,"acao":"Reunir gestores para discutir e validar (ou não) a separação dos grupos da categoria “Administrativo”, definindo a premiação separada deles e possível alteração na premiação dos grupos das demais categorias.","responsavel":"Miguel","status":"concluida","dataInicio":"2025-12-16","dataTermino":"2025-12-18","observacoes":""},{"item":43,"acao":"Filtrar e validar tipos e quantidades de armários necessários do Industrial antes de orçar.","responsavel":"George","status":"concluida","dataInicio":"2025-12-16","dataTermino":"2026-01-02","observacoes":""},{"item":44,"acao":"Filtrar e validar tipos e quantidades de armários necessários da Manutenção antes de orçar.","responsavel":"Durval Neto","status":"concluida","dataInicio":"2025-12-16","dataTermino":"2026-01-02","observacoes":""},{"item":45,"acao":"Compartilhar no grupo o arquivo com layouts dos quadros de gestão à vista e os modelos já discutidos.","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2025-12-16","dataTermino":"2025-12-26","observacoes":""},{"item":46,"acao":"Agendar e definir conteúdo do workshop de liderança para implantação dos quadros à vista e preparo para seminário.","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2025-12-16","dataTermino":"2026-01-23","observacoes":""},{"item":47,"acao":"Levantar custos por unidade dos armários (por tipo) e consolidar orçamento para aprovação.","responsavel":"Durval Neto","status":"cancelada","dataInicio":"2025-12-16","dataTermino":"2026-04-17","observacoes":""},{"item":48,"acao":"Definir padrão de atuação para terceiros (checklist) e formalizar processo de solicitação e comprovantes (e-mail) de execução.","responsavel":"Durval Neto","status":"concluida","dataInicio":"2025-12-16","dataTermino":"2026-01-02","observacoes":""},{"item":49,"acao":"Preparar e divulgar cronograma de divulgação dos resultados e critérios de pontuação (incluindo peso 70/30) para os líderes.","responsavel":"George","status":"concluida","dataInicio":"2025-12-16","dataTermino":"2025-12-26","observacoes":""},{"item":50,"acao":"Agendar reunião com grupos administrativos (Lidiane, Odair, Roseildo) para explicar categoria separada e critérios de premiação (após validação por Dr Miguel).","responsavel":"Durval Neto","status":"concluida","dataInicio":"2025-12-16","dataTermino":"2025-12-18","observacoes":""},{"item":51,"acao":"Atualizar lista de membros de cada grupo 5S e confirmar publicação para os participantes.","responsavel":"Durval Neto","status":"concluida","dataInicio":"2025-12-16","dataTermino":"2025-12-26","observacoes":""},{"item":52,"acao":"Atualizar lista de membros de cada grupo 5S e confirmar publicação para os participantes.","responsavel":"George","status":"concluida","dataInicio":"2025-12-16","dataTermino":"2025-12-26","observacoes":""},{"item":53,"acao":"Enviar relatório consolidado de ações (plano de ação) ao grupo e manter atualização contínua no drive/grupo WhatsApp.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-12-16","dataTermino":"2025-12-23","observacoes":""},{"item":54,"acao":"Definir datas finais: auditoria em Janeiro (13–15 jan) e agenda remota prévia; confirmar data do seminário (fev ou final jan).","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2025-12-16","dataTermino":"2025-12-23","observacoes":""},{"item":55,"acao":"Gestão à vista (quadros) - Definir indicadores operacionais por área (Industrial).","responsavel":"Diogo","status":"concluida","dataInicio":"2025-12-23","dataTermino":"2025-12-26","observacoes":""},{"item":56,"acao":"Gestão à vista (quadros) - Definir indicadores operacionais por área (Manutenção).","responsavel":"Hermani Quintela","status":"concluida","dataInicio":"2025-12-23","dataTermino":"2025-12-26","observacoes":""},{"item":57,"acao":"Gestão à vista (quadros) - Decidir alocação dos quadros disponíveis para a Manutenção.","responsavel":"Hermani Quintela","status":"concluida","dataInicio":"2025-12-23","dataTermino":"2026-01-23","observacoes":""},{"item":58,"acao":"Gestão à vista (quadros) - Decidir alocação dos quadros disponíveis para o Industrial.","responsavel":"Diogo","status":"concluida","dataInicio":"2025-12-23","dataTermino":"2026-01-23","observacoes":""},{"item":59,"acao":"Gestão à vista (quadros) - Padronizar layout de murais/painéis, para grupos sem Quadros de Gestão à Vista.","responsavel":"Diogenes","status":"concluida","dataInicio":"2025-12-23","dataTermino":"2026-04-17","observacoes":""},{"item":60,"acao":"Criar e treinar encarregados no uso do checklist dos terceiros.","responsavel":"Durval Neto","status":"concluida","dataInicio":"2025-12-23","dataTermino":"2026-01-05","observacoes":""},{"item":61,"acao":"Realizar 3ª Auditoria dos Grupos do do Departamento de Manutenção.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-01-06","dataTermino":"2026-01-15","observacoes":""},{"item":62,"acao":"Realizar 3ª Auditoria dos Grupos do do Departamento Industrial.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-01-06","dataTermino":"2026-01-15","observacoes":""},{"item":63,"acao":"Alinhar e definir cronograma, com equipe da Engenharia Civil, para serviços na área do Departamento de Manutenção Industrial.","responsavel":"Durval Neto","status":"concluida","dataInicio":"2026-01-15","dataTermino":"2026-01-19","observacoes":""},{"item":64,"acao":"Alinhar e definir cronograma, com equipe da Engenharia Civil, para serviços na área do Departamento Industrial.","responsavel":"George","status":"concluida","dataInicio":"2026-01-15","dataTermino":"2026-01-19","observacoes":""},{"item":65,"acao":"Organizar planejamento de serviços da Engenharia Civil em cronograma GANTT, para acompanhamento do comitê do 5S.","responsavel":"Durval Neto","status":"cancelada","dataInicio":"2026-01-15","dataTermino":"2026-04-17","observacoes":""},{"item":66,"acao":"Confeccionar Quadros de Gestão à Vista para o Departamento Industrial.","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2026-01-15","dataTermino":"2026-01-23","observacoes":""},{"item":67,"acao":"Confeccionar Quadros de Gestão à Vista para o Departamento da Manutenção Industrial.","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2026-01-15","dataTermino":"2026-01-23","observacoes":""},{"item":68,"acao":"Alinhar nova programação para o Ciclo I, com acréscimo de mais 1 mês (preparação das apresentações, treinamento dos líderes para o seminário, auditorias de Fevereiro e Seminário).","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-01-06","dataTermino":"2026-01-15","observacoes":""},{"item":69,"acao":"Construir e apresentar modelo padrão para as apresentações dos grupos do 5S.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-01-15","dataTermino":"2026-01-20","observacoes":""},{"item":70,"acao":"Atualizar arquivos (planilha de gráficos e gerenciador), organizar e subir arquivos no Drive, consolidando os gráficos por líder.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-01-20","dataTermino":"2026-01-22","observacoes":""},{"item":71,"acao":"Coletar fotos dos grupos, preparar três melhorias (antes/depois) e consolidar ações levantadas e concluídas no PAD, para o Departamento Industrial.","responsavel":"George","status":"concluida","dataInicio":"2026-01-20","dataTermino":"2026-02-27","observacoes":""},{"item":72,"acao":"Coletar fotos dos grupos, preparar três melhorias (antes/depois) e consolidar ações levantadas e concluídas no PAD, para o Departamento de Manutenção Industrial.","responsavel":"Durval Neto","status":"concluida","dataInicio":"2026-01-20","dataTermino":"2026-02-27","observacoes":""},{"item":73,"acao":"Criar documento/formulário padrão, para registro e validação das ações de melhorias (produtividade, segurança e/ou redução de custos) dos grupos do 5S.","responsavel":"Diogenes","status":"concluida","dataInicio":"2026-01-20","dataTermino":"2026-02-27","observacoes":""},{"item":74,"acao":"Definir formalmente o facilitador titular do Departamento de Manutenção Industrial","responsavel":"Hermani Quintela","status":"concluida","dataInicio":"2026-03-20","dataTermino":"2026-03-27","observacoes":""},{"item":75,"acao":"Formalizar matriz de backup dos líderes e facilitadores para auditorias, férias e ausências","responsavel":"Hermani Quintela","status":"cancelada","dataInicio":"2026-02-20","dataTermino":"2026-04-10","observacoes":""},{"item":76,"acao":"Revisar e publicar a estrutura final dos grupos do 2º ciclo do Programa 5S","responsavel":"George","status":"concluida","dataInicio":"2026-02-12","dataTermino":"2026-03-20","observacoes":""},{"item":77,"acao":"Consolidar o loteamento final das áreas da Indústria e da Manutenção para o 2º ciclo","responsavel":"George","status":"concluida","dataInicio":"2026-03-15","dataTermino":"2026-03-24","observacoes":""},{"item":78,"acao":"Levantar e registrar evidências fotográficas das áreas de terceiros para criação do padrão visual","responsavel":"Carlos","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-10","observacoes":""},{"item":79,"acao":"Consolidar relatório final das auditorias de 25 e 26/03 com principais evidências e desvios","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-02-12","dataTermino":"2026-03-27","observacoes":""},{"item":80,"acao":"Atualizar todos os PADs com base nas evidências levantadas nas auditorias de março","responsavel":"George","status":"concluida","dataInicio":"2026-02-12","dataTermino":"2026-03-20","observacoes":""},{"item":81,"acao":"Estruturar padrão mínimo 5S para áreas de terceiros e “puxadinhos”","responsavel":"Carlos","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-10","observacoes":""},{"item":82,"acao":"Definir forma de responsabilização dos gestores sobre áreas com atuação de terceiros","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-03-20","dataTermino":"2026-03-26","observacoes":""},{"item":83,"acao":"Preparar conteúdo e materiais do workshop previsto para abril","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-06","observacoes":""},{"item":84,"acao":"Definir lista de participantes do workshop de abril (líderes e posições-chave)","responsavel":"George","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-02","observacoes":""},{"item":85,"acao":"Consolidar versão atual dos organogramas de Indústria e Manutenção com quantitativo por cargo","responsavel":"Hérmane Jasher","status":"no_prazo","dataInicio":"2026-03-26","dataTermino":"2026-07-24","observacoes":""},{"item":86,"acao":"Elaborar versão proposta dos organogramas com ajustes identificados no projeto","responsavel":"Hérmane Jasher","status":"no_prazo","dataInicio":"2026-03-26","dataTermino":"2026-07-24","observacoes":""},{"item":87,"acao":"Iniciar construção dos funcionogramas das funções críticas do Industrial","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-03-26","observacoes":""},{"item":88,"acao":"Iniciar construção dos funcionogramas das funções críticas da Manutenção","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-02","observacoes":""},{"item":89,"acao":"Definir lista priorizada dos processos que terão fluxogramas revisados primeiro","responsavel":"Carlos","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-02","observacoes":""},{"item":90,"acao":"Atualizar os fluxogramas prioritários no modelo padronizado acordado","responsavel":"Carlos","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-10","observacoes":""},{"item":91,"acao":"Converter instruções de trabalho existentes para o modelo POP da Gesteq","responsavel":"Carlos","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-10","observacoes":""},{"item":92,"acao":"Definir lista de POPs prioritários da Indústria para conclusão no curto prazo","responsavel":"Diogo","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-03-26","observacoes":""},{"item":93,"acao":"Definir lista de POPs prioritários da Manutenção para conclusão no curto prazo","responsavel":"Hermani Quintela","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-02","observacoes":""},{"item":94,"acao":"Padronizar critério de uso de fotos e auxílio visual nos POPs","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-02","observacoes":""},{"item":95,"acao":"Estruturar controle mestre dos documentos do projeto (organogramas, funcionogramas, fluxos, POPs e PADs)","responsavel":"Diogenes","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-02","observacoes":""},{"item":96,"acao":"Redefinir uso de quadro de gestão à vista para a entressafra","responsavel":"George","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-02","observacoes":""},{"item":97,"acao":"Definir indicadores operacionais diários por área para gestão à vista da Indústria","responsavel":"George","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-02","observacoes":""},{"item":98,"acao":"Definir indicadores operacionais da Manutenção voltados para PCM e rotina semanal","responsavel":"Jairo","status":"concluida","dataInicio":"2026-02-27","dataTermino":"2026-04-06","observacoes":""},{"item":99,"acao":"Estruturar primeira versão do painel gerencial da Indústria","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-02","observacoes":""},{"item":100,"acao":"Estruturar primeira versão do painel gerencial da Manutenção","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-02","observacoes":""},{"item":101,"acao":"Definir regras de priorização das OS na entressafra","responsavel":"Hermani Quintela","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-10","observacoes":""},{"item":102,"acao":"Criar calendário mensal dos eventos do projeto (5S, GPR, padronização e PCM)","responsavel":"George","status":"atrasada","dataInicio":"2026-03-26","dataTermino":"2026-07-03","observacoes":""},{"item":103,"acao":"Atualizar e compartilhar o Gerenciador do Programa 5S com status das ações","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-03-26","dataTermino":"2026-04-02","observacoes":""},{"item":104,"acao":"Atualizar lista de membros de cada grupo 5S e confirmar publicação para os participantes.","responsavel":"George","status":"concluida","dataInicio":"2026-03-13","dataTermino":"2026-04-06","observacoes":""},{"item":105,"acao":"Elaborar diagnóstico formal do PCM Automotivo.","responsavel":"Gesildo","status":"concluida","dataInicio":"2026-04-29","dataTermino":"2026-05-14","observacoes":""},{"item":106,"acao":"Construir funcionogramas das funções críticas da Garagem (PCM e ADM de apoio, antigo PCM).","responsavel":"Gesildo","status":"concluida","dataInicio":"2026-05-14","dataTermino":"2026-05-27","observacoes":""},{"item":107,"acao":"Consolidar loteamento definitivo da Garagem dos grupos 5S da entressafra.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-05-14","dataTermino":"2026-05-15","observacoes":""},{"item":108,"acao":"Validar líderes responsáveis pelos grupos da Garagem do Programa 5S.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-05-14","dataTermino":"2026-05-15","observacoes":""},{"item":109,"acao":"Realizar treinamento do Programa 5S para líderes da Garagem.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-05-14","dataTermino":"2026-05-15","observacoes":""},{"item":110,"acao":"Atualizar levantamento de necessidade de armários das áreas operacionais com justificativa técnica.","responsavel":"Carlos","status":"concluida","dataInicio":"2026-05-15","dataTermino":"2026-05-22","observacoes":""},{"item":111,"acao":"Definir auditores do Programa 5S para atuação na Garagem.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-05-14","dataTermino":"2026-05-15","observacoes":""},{"item":112,"acao":"Digitalizar loteamento definitivo da Garagem dos grupos 5S da entressafra.","responsavel":"Hermani Quintela","status":"concluida","dataInicio":"2026-05-15","dataTermino":"2026-05-29","observacoes":""},{"item":113,"acao":"Realizar 3ª Auditoria dos Grupos Administrativos.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-05-14","dataTermino":"2026-05-15","observacoes":""},{"item":114,"acao":"Realizar 3ª Auditoria dos Grupos do Departamento de Manutenção Industrial.","responsavel":"Diogenes","status":"concluida","dataInicio":"2026-05-14","dataTermino":"2026-05-20","observacoes":""},{"item":115,"acao":"Realizar 3ª Auditoria dos Grupos do Departamento Industrial.","responsavel":"George","status":"concluida","dataInicio":"2026-05-14","dataTermino":"2026-05-20","observacoes":""},{"item":116,"acao":"Estruturar cronograma macro, atualizado, de acompanhamento das frentes da Civil.","responsavel":"George","status":"concluida","dataInicio":"2026-05-15","dataTermino":"2026-05-22","observacoes":""},{"item":117,"acao":"Concluir registros fotográficos da Garagem.","responsavel":"Junior","status":"concluida","dataInicio":"2026-05-15","dataTermino":"2026-05-19","observacoes":""},{"item":118,"acao":"Realizar construção dos PADs da Garagem.","responsavel":"George","status":"concluida","dataInicio":"2026-05-20","dataTermino":"2026-05-26","observacoes":""},{"item":119,"acao":"Validar PADS da Garagem.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-05-27","dataTermino":"2026-05-28","observacoes":""},{"item":120,"acao":"Realizar um autodiagnóstico sobre o PCM da oficina automotiva.","responsavel":"Junior","status":"concluida","dataInicio":"2026-05-14","dataTermino":"2026-05-22","observacoes":""},{"item":121,"acao":"Realizar leitura de material para esboço da classificação de equipamentos ABC para oficina de frota.","responsavel":"Junior","status":"concluida","dataInicio":"2026-05-14","dataTermino":"2026-05-22","observacoes":""},{"item":122,"acao":"Alinhar agenda de visitas com Hernane (TI) para suporte às ações do projeto.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-05-15","dataTermino":"2026-05-22","observacoes":""},{"item":123,"acao":"Construir planilha inicial de classificação de equipamentos e criticidade da manutenção automotiva","responsavel":"Junior","status":"concluida","dataInicio":"2026-05-14","dataTermino":"2026-05-26","observacoes":""},{"item":124,"acao":"Consolidar diagnóstico e plano de ação do PCM Automotivo","responsavel":"Gesildo","status":"concluida","dataInicio":"2026-05-14","dataTermino":"2026-05-27","observacoes":""},{"item":125,"acao":"Construir PADS dos grupos da Manutenção Mecânica, do Departamento de Manutenção.","responsavel":"Susana","status":"concluida","dataInicio":"2026-05-15","dataTermino":"2026-05-29","observacoes":""},{"item":126,"acao":"Construir PADS dos grupos da Elétrica, do Departamento de Manutenção.","responsavel":"Susana","status":"concluida","dataInicio":"2026-05-15","dataTermino":"2026-05-29","observacoes":""},{"item":127,"acao":"Auxiliar os grupos da Manutenção Mecânica, do Departamento de Manutenção, na preparação para o Seminário do 5S.","responsavel":"Rodrigo","status":"concluida","dataInicio":"2026-05-15","dataTermino":"2026-05-29","observacoes":""},{"item":128,"acao":"Auxiliar os grupos da Elétrica, do Departamento de Manutenção, na preparação para o Seminário do 5S.","responsavel":"Belchior","status":"concluida","dataInicio":"2026-05-15","dataTermino":"2026-05-29","observacoes":""},{"item":129,"acao":"Estruturar cronograma de treinamentos da Gesteq para a Usina Serra Grande.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-05-14","dataTermino":"2026-05-28","observacoes":""},{"item":130,"acao":"Preparar seminário de encerramento do 2º ciclo do Programa 5S.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-05-15","dataTermino":"2026-05-28","observacoes":""},{"item":131,"acao":"Estruturar e realizar treinamento do Programa 5S para líderes e envolvidos da Garagem.","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2026-05-14","dataTermino":"2026-06-04","observacoes":""},{"item":132,"acao":"Realizar 1ª Auditoria dos Grupos Administrativos, do 3º Ciclo.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-06-18","dataTermino":"2026-06-19","observacoes":""},{"item":133,"acao":"Realizar 1ª Auditoria dos Grupos do Departamento de Manutenção Industrial, do 3º Ciclo.","responsavel":"George","status":"concluida","dataInicio":"2026-06-18","dataTermino":"2026-06-26","observacoes":""},{"item":134,"acao":"Realizar 1ª Auditoria dos Grupos do Departamento Industrial, do 3º Ciclo.","responsavel":"Jairo","status":"concluida","dataInicio":"2026-06-18","dataTermino":"2026-06-26","observacoes":""},{"item":135,"acao":"Realizar 1ª Auditoria dos Grupos da Garagem, do 3º Ciclo.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-06-18","dataTermino":"2026-06-19","observacoes":""},{"item":136,"acao":"Levantar critérios e situações, mais vivenciadas pelos auditores, para contemplar o novo formulário do 5S.","responsavel":"Diogenes","status":"concluida","dataInicio":"2026-06-18","dataTermino":"2026-07-03","observacoes":""},{"item":137,"acao":"Incluir itens de infraestrutura (banheiros, áreas comuns e acessibilidade) nas auditorias","responsavel":"Diogenes","status":"concluida","dataInicio":"2026-06-18","dataTermino":"2026-07-03","observacoes":""},{"item":138,"acao":"Revisar e atualizar o formulário oficial das Auditorias 5S, para aumentar o rigos das próximas auditorias","responsavel":"Hérmane Jasher","status":"atrasada","dataInicio":"2026-06-19","dataTermino":"2026-07-08","observacoes":""},{"item":139,"acao":"Realizar apresentação, para todos os líderes, sobre o novo formulário de auditoria do 5S.","responsavel":"Hérmane Jasher","status":"no_prazo","dataInicio":"2026-06-19","dataTermino":"2026-08-27","observacoes":""},{"item":140,"acao":"Implantar rotina de acompanhamento das RARs (tático, supervisão e gerencial).","responsavel":"Hérmane Jasher","status":"no_prazo","dataInicio":"2026-06-19","dataTermino":"2026-08-13","observacoes":""},{"item":141,"acao":"Preparar cronograma de treinamentos conduzidos por Marcos Araújo","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2026-06-19","dataTermino":"2026-07-08","observacoes":""},{"item":142,"acao":"Atualizar cronograma das auditorias do 3º Ciclo do Programa 5S","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-06-19","dataTermino":"2026-06-25","observacoes":""},{"item":143,"acao":"Definir calendário das visitas presenciais de julho","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-06-19","dataTermino":"2026-06-29","observacoes":""},{"item":144,"acao":"Realizar treinamento da Liderança Situacional","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2026-06-19","dataTermino":"2026-07-22","observacoes":""},{"item":145,"acao":"Palestrar no evento de Qualidade.","responsavel":"Marcos Araújo","status":"no_prazo","dataInicio":"2026-07-22","dataTermino":"2026-07-27","observacoes":""},{"item":146,"acao":"Realizar 1ª Auditoria dos Grupos Administrativos, do 3º Ciclo.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-07-22","dataTermino":"2026-07-22","observacoes":""},{"item":147,"acao":"Realizar 1ª Auditoria dos Grupos do Departamento de Manutenção Industrial, do 3º Ciclo.","responsavel":"George","status":"no_prazo","dataInicio":"2026-07-22","dataTermino":"2026-07-30","observacoes":""},{"item":148,"acao":"Realizar 1ª Auditoria dos Grupos do Departamento Industrial, do 3º Ciclo.","responsavel":"Jairo","status":"no_prazo","dataInicio":"2026-07-22","dataTermino":"2026-07-30","observacoes":""},{"item":149,"acao":"Realizar 1ª Auditoria dos Grupos da Garagem, do 3º Ciclo.","responsavel":"Hérmane Jasher","status":"concluida","dataInicio":"2026-07-22","dataTermino":"2026-07-23","observacoes":""},{"item":150,"acao":"Compartilhar  Benchmarking de garagem com Rui, Tenório e Junior.","responsavel":"Marcos Araújo","status":"concluida","dataInicio":"2026-07-23","dataTermino":"2026-07-23","observacoes":""},{"item":151,"acao":"Definir as áreas que serão contempladas com quadros de gestão à vista.","responsavel":"Hérmane Jasher","status":"no_prazo","dataInicio":"2026-07-23","dataTermino":"2026-08-13","observacoes":""}];
/* ================================================================
   CONSTANTES E UTILITÁRIOS
   ================================================================ */
const DEPARTMENTS_META = {
  "Industrial":     { color:"#5D7A34", icon: Factory,      short:"IND" },
  "Manutenção":     { color:"#B67A2E", icon: Wrench,       short:"MNT" },
  "Administrativo": { color:"#3D6B8C", icon: Briefcase,    short:"ADM" },
  "Garagem":        { color:"#8C4A3D", icon: Truck,        short:"GRG" },
};
function deptMeta(name){
  return DEPARTMENTS_META[name] || { color:"#7A7362", icon: Building2, short:(name||"?").slice(0,3).toUpperCase() };
}

const MASTER_STATUS_META = {
  concluida: { label:"Concluída", tone:"green",  icon: CheckCircle2 },
  no_prazo:  { label:"No Prazo",  tone:"amber",  icon: Clock },
  atrasada:  { label:"Atrasada",  tone:"red",    icon: AlertTriangle },
  cancelada: { label:"Cancelada", tone:"gray",   icon: X },
};

const TASK_STATUS_META = {
  concluido:     { label:"Concluído",     tone:"green" },
  em_andamento:  { label:"Em Andamento",  tone:"amber" },
  pendente:      { label:"Pendente",      tone:"gray"  },
};

function uid(prefix){
  return (prefix||"id") + "-" + Math.random().toString(36).slice(2,9) + Date.now().toString(36).slice(-4);
}

function average(nums){
  const valid = nums.filter(n => typeof n === "number" && !isNaN(n));
  if (!valid.length) return null;
  return valid.reduce((a,b)=>a+b,0) / valid.length;
}

function round1(n){ return n == null ? null : Math.round(n*10)/10; }

function scoreTone(score, thresholds){
  if (score == null || isNaN(score)) return "none";
  const th = thresholds || { red:60, yellow:79 };
  if (score <= th.red) return "red";
  if (score <= th.yellow) return "amber";
  return "green";
}

function toneLabel(tone){
  return { green:"No padrão", amber:"Atenção", red:"Crítico", none:"Sem dados" }[tone] || "";
}

function areaAverage(area){
  if (!area || !area.auditorias) return null;
  const vals = Object.values(area.auditorias).map(a => a && typeof a.nota === "number" ? a.nota : null).filter(v=>v!=null);
  return average(vals);
}

function areaOpenItems(area){
  if (!area || !area.itens) return 0;
  return area.itens.filter(i => i.status !== "concluido").length;
}

function areaOverdueItems(area){
  if (!area || !area.itens) return 0;
  const today = new Date(); today.setHours(0,0,0,0);
  return area.itens.filter(i => {
    if (i.status === "concluido") return false;
    if (!i.prazo || i.prazo.type !== "date") return false;
    const d = new Date(i.prazo.value + "T00:00:00");
    return d < today;
  }).length;
}

function isItemOverdue(item){
  if (!item || item.status === "concluido") return false;
  if (!item.prazo || item.prazo.type !== "date") return false;
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(item.prazo.value + "T00:00:00");
  return d < today;
}

function formatDeadline(prazo){
  if (!prazo || prazo.value == null || prazo.value === "") return "Sem prazo definido";
  if (prazo.type === "date"){
    const d = new Date(prazo.value + "T00:00:00");
    if (isNaN(d.getTime())) return prazo.value;
    return d.toLocaleDateString("pt-BR", { day:"2-digit", month:"short", year:"numeric" });
  }
  return prazo.value;
}

function formatDateISO(iso){
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", { day:"2-digit", month:"short", year:"numeric" });
}

function todayISO(){
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
}

function initials(name){
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

function downloadJSON(obj, filename){
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}

function compressImage(file, maxWidth, quality){
  maxWidth = maxWidth || 480; quality = quality || 0.62;
  return new Promise((resolve, reject) => {
    if (!file || !file.type || file.type.indexOf("image/") !== 0){
      reject(new Error("Arquivo não é uma imagem")); return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Falha ao carregar imagem"));
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxWidth){ h = Math.round(h * (maxWidth / w)); w = maxWidth; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function classNames(){
  return Array.prototype.slice.call(arguments).filter(Boolean).join(" ");
}

/* ================================================================
   HOOK DE ARMAZENAMENTO — coleção compartilhada, agora falando com
   nossa própria API (Express + Postgres) em /api/storage/:key em vez
   do window.storage do Claude. Mesmo formato de retorno de antes
   ([data, persist, status, setStatus]), então nenhum outro componente
   do app precisou mudar.
   ================================================================ */
function useCloudCollection(storageKey, seedValue){
  const [data, setDataState] = useState(null);
  const [status, setStatusState] = useState("loading"); // loading | ready | error
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    async function load(){
      try {
        const res = await fetch(`/api/storage/${encodeURIComponent(storageKey)}`);
        if (res.status === 404){
          await fetch(`/api/storage/${encodeURIComponent(storageKey)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: seedValue }),
          });
          if (!cancelled){ setDataState(seedValue); setStatusState("ready"); }
          return;
        }
        if (!res.ok) throw new Error("GET /api/storage failed: " + res.status);
        const json = await res.json();
        if (!cancelled){ setDataState(json.value); setStatusState("ready"); }
      } catch (e){
        if (!cancelled){ setDataState(seedValue); setStatusState("error"); }
      }
    }
    load();
    return () => { cancelled = true; mountedRef.current = false; };
    // eslint-disable-next-line
  }, [storageKey]);

  const persist = useCallback(async (updater) => {
    setDataState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      fetch(`/api/storage/${encodeURIComponent(storageKey)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: next }),
      }).catch(() => { if (mountedRef.current) setStatusState("error"); });
      return next;
    });
  }, [storageKey]);

  return [data, persist, status, setStatusState];
}
/* ================================================================
   COMPONENTES COMPARTILHADOS
   ================================================================ */
function StampBadge({ score, thresholds, size }){
  const tone = scoreTone(score, thresholds);
  const sizeCls = size === "sm" ? "g5-stamp-sm" : size === "lg" ? "g5-stamp-lg" : "";
  return (
    <div className={classNames("g5-stamp", "tone-"+tone, sizeCls)} title={score==null ? "Sem avaliação" : toneLabel(tone)+" — "+round1(score)}>
      <span className="g5-stamp-val">{score==null ? "—" : round1(score)}</span>
      {score!=null && <span className="g5-stamp-unit">PTS</span>}
    </div>
  );
}

function StatusPill({ meta }){
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span className={classNames("g5-pill","tone-"+meta.tone)}>
      {Icon && <Icon size={12} strokeWidth={2.5} />}
      {meta.label}
    </span>
  );
}

function DeptTag({ dept }){
  const m = deptMeta(dept);
  return (
    <span className="g5-dept-tag">
      <span className="g5-dept-dot" style={{ background:m.color }} />
      {dept}
    </span>
  );
}

function StatCard({ label, value, sub, color, icon }){
  const Icon = icon;
  return (
    <div className="g5-stat">
      <div className="g5-stat-bar" style={{ background: color || "var(--cana)" }} />
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div className="g5-stat-label">{label}</div>
        {Icon && <Icon size={15} style={{ color: color || "var(--cana)", flex:"none" }} />}
      </div>
      <div className="g5-stat-value">{value}</div>
      {sub && <div className="g5-stat-sub">{sub}</div>}
    </div>
  );
}

function EmptyState({ icon, title, desc, action }){
  const Icon = icon || ClipboardList;
  return (
    <div className="g5-empty">
      <Icon size={38} strokeWidth={1.4} />
      <h4>{title}</h4>
      {desc && <p>{desc}</p>}
      {action}
    </div>
  );
}

function Modal({ title, onClose, children, footer, wide }){
  const ref = useRef(null);
  useEffect(() => {
    function onKey(e){ if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="g5-overlay" onMouseDown={(e)=>{ if (e.target === e.currentTarget) onClose(); }}>
      <div className="g5-modal" style={wide ? { maxWidth:820 } : undefined} ref={ref}>
        <div className="g5-modal-head">
          <h3 className="g5-modal-title">{title}</h3>
          <button className="g5-btn g5-btn-ghost g5-btn-icon" onClick={onClose} aria-label="Fechar"><X size={18}/></button>
        </div>
        <div className="g5-modal-body">{children}</div>
        {footer && <div className="g5-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }){
  return (
    <div className="g5-overlay" onMouseDown={(e)=>{ if (e.target === e.currentTarget) onCancel(); }}>
      <div className="g5-modal" style={{ maxWidth:420 }}>
        <div className="g5-modal-body" style={{ display:"flex", gap:14, paddingTop:22 }}>
          <div className="g5-confirm-icon"><AlertTriangle size={22}/></div>
          <div>
            <h3 style={{ fontSize:17, textTransform:"uppercase", marginBottom:6 }}>{title}</h3>
            <p style={{ fontSize:13.5, color:"var(--ink-soft)", lineHeight:1.5 }}>{message}</p>
          </div>
        </div>
        <div className="g5-modal-foot">
          <button className="g5-btn g5-btn-outline" onClick={onCancel}>Cancelar</button>
          <button className={classNames("g5-btn", danger ? "g5-btn-danger" : "g5-btn-primary")} onClick={onConfirm}>{confirmLabel || "Confirmar"}</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onDone }){
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="g5-toast"><Check size={15}/> {message}</div>
  );
}

function SyncIndicator({ status }){
  if (status === "error"){
    return <span className="g5-sync" title="Falha ao salvar — última alteração pode não ter sido sincronizada"><WifiOff size={13}/> Falha ao salvar</span>;
  }
  if (status === "nostorage"){
    return <span className="g5-sync" title="Armazenamento indisponível neste momento — os dados existem apenas nesta sessão"><CircleAlert size={13}/> Sessão local</span>;
  }
  if (status === "loading"){
    return <span className="g5-sync"><Loader2 size={13} className="spin" style={{ animation:"g5spin 1s linear infinite" }}/> Carregando</span>;
  }
  return <span className="g5-sync"><Cloud size={13}/> Sincronizado</span>;
}

function PhotoSlot({ label, value, onChange, onRemove }){
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  async function handleFile(e){
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await compressImage(file, 480, 0.62);
      onChange(dataUrl);
    } catch (err){
      // silently ignore unreadable file
    } finally {
      setBusy(false);
    }
  }
  if (value){
    return (
      <div style={{ position:"relative" }}>
        <img src={value} alt={label} className="g5-photo-thumb" />
        <button type="button" onClick={onRemove} title="Remover foto"
          style={{ position:"absolute", top:-6, right:-6, width:20, height:20, borderRadius:"50%", background:"var(--red)", color:"#fff", border:"2px solid var(--paper-3)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <X size={11}/>
        </button>
      </div>
    );
  }
  return (
    <div className="g5-photo-slot" onClick={()=>inputRef.current && inputRef.current.click()}>
      <input ref={inputRef} type="file" accept="image/*" className="g5-visually-hidden" onChange={handleFile} />
      {busy ? <Loader2 size={16} style={{ animation:"g5spin 1s linear infinite" }}/> : <ImagePlus size={16}/>}
      <span>{label}</span>
    </div>
  );
}

function SectionHeading({ eyebrow, title, desc, right }){
  return (
    <div className="g5-page-head">
      <div>
        {eyebrow && <span className="g5-eyebrow">{eyebrow}</span>}
        <h1 className="g5-page-title">{title}</h1>
        {desc && <p className="g5-page-desc">{desc}</p>}
      </div>
      {right && <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{right}</div>}
    </div>
  );
}

function MiniTrend({ values }){
  const nums = values.filter(v => typeof v === "number");
  if (nums.length < 2) return <span style={{ color:"var(--steel-soft-2)" }}><Minus size={14}/></span>;
  const diff = nums[nums.length-1] - nums[0];
  if (Math.abs(diff) < 1) return <span style={{ color:"var(--gray)", display:"inline-flex", alignItems:"center", gap:3, fontSize:11.5 }}><Minus size={13}/> estável</span>;
  if (diff > 0) return <span style={{ color:"var(--green-dark)", display:"inline-flex", alignItems:"center", gap:3, fontSize:11.5, fontWeight:700 }}><TrendingUp size={13}/> +{round1(diff)}</span>;
  return <span style={{ color:"var(--red-dark)", display:"inline-flex", alignItems:"center", gap:3, fontSize:11.5, fontWeight:700 }}><TrendingUp size={13} style={{ transform:"rotate(90deg)" }}/> {round1(diff)}</span>;
}
function Minus(props){
  return <svg width={props.size||14} height={props.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
/* ================================================================
   PAINEL (DASHBOARD)
   ================================================================ */
function DashboardView({ areas, settings, masterPlan, onUpdateAreas, onOpenArea }){
  const [deptFilter, setDeptFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("media");
  const [sortDir, setSortDir] = useState("desc");

  const rounds = settings.rounds || [];
  const thresholds = settings.thresholds || { red:60, yellow:79 };

  const rows = useMemo(() => {
    return areas.map(a => {
      const scores = rounds.map(r => (a.auditorias && a.auditorias[r.id] ? a.auditorias[r.id].nota : null));
      const media = average(scores.filter(s=>s!=null));
      return { area:a, scores, media };
    });
  }, [areas, rounds]);

  const filteredRows = useMemo(() => {
    let r = rows;
    if (deptFilter !== "Todos") r = r.filter(x => x.area.departamento === deptFilter);
    if (search.trim()){
      const q = search.trim().toLowerCase();
      r = r.filter(x => x.area.nome.toLowerCase().includes(q) || (x.area.lider||"").toLowerCase().includes(q));
    }
    const dir = sortDir === "asc" ? 1 : -1;
    r = [...r].sort((a,b) => {
      if (sortKey === "media"){
        const av = a.media==null?-1:a.media, bv = b.media==null?-1:b.media;
        return (av-bv)*dir;
      }
      if (sortKey === "nome") return a.area.nome.localeCompare(b.area.nome)*dir;
      if (sortKey === "departamento") return a.area.departamento.localeCompare(b.area.departamento)*dir;
      if (sortKey === "lider") return (a.area.lider||"").localeCompare(b.area.lider||"")*dir;
      return 0;
    });
    return r;
  }, [rows, deptFilter, search, sortKey, sortDir]);

  const overallAvg = useMemo(() => average(rows.map(r=>r.media).filter(v=>v!=null)), [rows]);
  const toneCounts = useMemo(() => {
    const c = { green:0, amber:0, red:0, none:0 };
    rows.forEach(r => { c[scoreTone(r.media, thresholds)]++; });
    return c;
  }, [rows, thresholds]);
  const totalOpenItems = useMemo(() => areas.reduce((s,a)=>s+areaOpenItems(a),0), [areas]);
  const totalOverdue = useMemo(() => areas.reduce((s,a)=>s+areaOverdueItems(a),0), [areas]);
  const mpClosure = useMemo(() => {
    if (!masterPlan.length) return null;
    const concl = masterPlan.filter(i=>i.status==="concluida").length;
    const notCancelled = masterPlan.filter(i=>i.status!=="cancelada").length || 1;
    return (concl/notCancelled)*100;
  }, [masterPlan]);

  const deptChartData = useMemo(() => {
    return (settings.departments||[]).map(d => {
      const inDept = rows.filter(r => r.area.departamento === d && r.media != null);
      return { departamento:d, media: inDept.length ? round1(average(inDept.map(r=>r.media))) : 0, cor: deptMeta(d).color };
    });
  }, [rows, settings.departments]);

  function updateScore(areaId, roundId, value){
    onUpdateAreas(prev => prev.map(a => {
      if (a.id !== areaId) return a;
      const auditorias = { ...(a.auditorias||{}) };
      if (value === "" || value == null){
        delete auditorias[roundId];
      } else {
        const n = Math.max(0, Math.min(100, Number(value)));
        auditorias[roundId] = { ...(auditorias[roundId]||{}), nota:n };
      }
      return { ...a, auditorias };
    }));
  }

  function toggleSort(key){
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }
  function sortArrow(key){
    if (sortKey !== key) return null;
    return <span className="arrow">{sortDir === "asc" ? "▲" : "▼"}</span>;
  }

  return (
    <div>
      <SectionHeading
        eyebrow={settings.cycleLabel + " · " + settings.cyclePeriod}
        title="Painel Geral"
        desc={"Visão consolidada do Programa 5S — " + settings.millName}
      />

      <div className="g5-stat-grid">
        <StatCard label="Nota Média Geral" value={overallAvg==null ? "—" : round1(overallAvg)} color="var(--cana)" icon={BarChart3}
          sub={overallAvg==null ? "Ainda sem auditorias lançadas" : toneLabel(scoreTone(overallAvg, thresholds))} />
        <StatCard label="Áreas no Padrão" value={toneCounts.green + " / " + areas.length} color="var(--green)" icon={ShieldCheck}
          sub={toneCounts.amber+" em atenção · "+toneCounts.red+" críticas"} />
        <StatCard label="Ações Abertas (PAD)" value={totalOpenItems} color="var(--bagaco)" icon={ClipboardList}
          sub={totalOverdue > 0 ? totalOverdue + " com prazo vencido" : "Nenhuma em atraso"} />
        <StatCard label="Plano Geral Concluído" value={mpClosure==null ? "—" : round1(mpClosure)+"%"} color="var(--cana-dark)" icon={ListChecks}
          sub={masterPlan.length + " ações no plano mestre"} />
      </div>

      <div className="g5-two-col" style={{ marginBottom:20 }}>
        <div className="g5-chart-card">
          <div className="g5-chart-title">Nota Média por Departamento</div>
          <div className="g5-chart-sub">Média das áreas avaliadas em {settings.cycleLabel.toLowerCase()}</div>
          <div style={{ width:"100%", height:230 }}>
            <ResponsiveContainer>
              <BarChart data={deptChartData} margin={{ top:6, right:10, left:-18, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis dataKey="departamento" tick={{ fontSize:11.5, fill:"var(--ink-soft)" }} axisLine={{ stroke:"var(--line)" }} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fontSize:11, fill:"var(--ink-soft)" }} axisLine={false} tickLine={false} />
                <RTooltip formatter={(v)=>[v,"Média"]} contentStyle={{ fontSize:12.5, borderRadius:8, border:"1px solid var(--line)" }} />
                <Bar dataKey="media" radius={[5,5,0,0]}>
                  {deptChartData.map((d,i)=>(<Cell key={i} fill={d.cor} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="g5-chart-card">
          <div className="g5-chart-title">Distribuição por Faixa</div>
          <div className="g5-chart-sub">Classificação das {areas.length} áreas pela média do ciclo</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:18 }}>
            {[["green","No padrão (≥ "+(thresholds.yellow+1)+")"],["amber","Atenção ("+(thresholds.red+1)+"–"+thresholds.yellow+")"],["red","Crítico (≤ "+thresholds.red+")"],["none","Sem avaliação"]].map(([tone,label]) => {
              const count = toneCounts[tone];
              const pct = areas.length ? (count/areas.length)*100 : 0;
              const color = tone==="green"?"var(--green)":tone==="amber"?"var(--amber)":tone==="red"?"var(--red)":"var(--steel-soft-2)";
              return (
                <div key={tone}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5, marginBottom:4 }}>
                    <span style={{ fontWeight:600 }}>{label}</span>
                    <span className="g5-mono" style={{ color:"var(--ink-soft)" }}>{count}</span>
                  </div>
                  <div style={{ height:8, background:"var(--paper-2)", borderRadius:6, overflow:"hidden" }}>
                    <div style={{ width:pct+"%", height:"100%", background:color, borderRadius:6, transition:"width .3s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="g5-toolbar">
        <div className="g5-search">
          <Search size={15}/>
          <input className="g5-input" placeholder="Buscar área ou líder…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="g5-chip-toggle">
          <button className={deptFilter==="Todos"?"active":""} onClick={()=>setDeptFilter("Todos")}>Todos</button>
          {(settings.departments||[]).map(d => (
            <button key={d} className={deptFilter===d?"active":""} onClick={()=>setDeptFilter(d)}>{d}</button>
          ))}
        </div>
      </div>

      <div className="g5-table-wrap">
        <table className="g5-table">
          <thead>
            <tr>
              <th onClick={()=>toggleSort("nome")}>Área {sortArrow("nome")}</th>
              <th onClick={()=>toggleSort("departamento")}>Depto {sortArrow("departamento")}</th>
              <th onClick={()=>toggleSort("lider")}>Líder {sortArrow("lider")}</th>
              {rounds.map(r => <th key={r.id} className="no-sort" style={{ textAlign:"center" }}>{r.label}<br/><span style={{ opacity:0.7, fontWeight:400, textTransform:"none" }}>{r.periodo}</span></th>)}
              <th onClick={()=>toggleSort("media")} style={{ textAlign:"center" }}>Média {sortArrow("media")}</th>
              <th className="no-sort" style={{ textAlign:"center" }}>Tend.</th>
              <th className="no-sort" style={{ textAlign:"center" }}>Selo</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(({area,scores,media}) => (
              <tr key={area.id} className="clickable" onClick={()=>onOpenArea(area.id)}>
                <td style={{ fontWeight:700 }}>{area.nome}</td>
                <td><DeptTag dept={area.departamento} /></td>
                <td>{area.lider || "—"}</td>
                {rounds.map((r,ri) => (
                  <td key={r.id} className="num-cell" onClick={e=>e.stopPropagation()}>
                    <input
                      type="number" min="0" max="100" className="g5-score-input"
                      value={scores[ri]==null ? "" : scores[ri]}
                      placeholder="—"
                      style={ scores[ri]!=null ? { color: scoreTone(scores[ri],thresholds)==="green"?"var(--green-dark)":scoreTone(scores[ri],thresholds)==="amber"?"var(--amber-dark)":"var(--red-dark)" } : undefined }
                      onChange={e => updateScore(area.id, r.id, e.target.value)}
                    />
                  </td>
                ))}
                <td className="num-cell">{media==null ? "—" : round1(media)}</td>
                <td style={{ textAlign:"center" }}><MiniTrend values={scores} /></td>
                <td style={{ textAlign:"center" }}><StampBadge score={media} thresholds={thresholds} size="sm" /></td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr><td colSpan={5+rounds.length} style={{ textAlign:"center", padding:30, color:"var(--ink-soft)" }}>Nenhuma área encontrada para este filtro.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="g5-print-hint" style={{ marginTop:10 }}>Clique em uma linha para abrir o plano de ação da área. As notas de auditoria podem ser editadas diretamente na tabela.</p>
    </div>
  );
}
/* ================================================================
   ÁREAS — LISTAGEM
   ================================================================ */
function AreaFormModal({ initial, departments, onSave, onClose }){
  const [form, setForm] = useState(() => initial || { nome:"", departamento: departments[0] || "Industrial", lider:"", auditor:"" });
  const isEdit = !!initial;
  function set(k,v){ setForm(f => ({ ...f, [k]:v })); }
  function submit(e){
    e.preventDefault();
    if (!form.nome.trim()) return;
    onSave(form);
  }
  return (
    <Modal title={isEdit ? "Editar Área" : "Nova Área"} onClose={onClose}
      footer={<>
        <button className="g5-btn g5-btn-outline" onClick={onClose}>Cancelar</button>
        <button className="g5-btn g5-btn-primary" onClick={submit}><Save size={15}/> Salvar Área</button>
      </>}>
      <form onSubmit={submit}>
        <div className="g5-field">
          <label className="g5-label">Nome da Área</label>
          <input className="g5-input" autoFocus value={form.nome} onChange={e=>set("nome", e.target.value)} placeholder="Ex.: Destilaria" />
        </div>
        <div className="g5-field-row">
          <div className="g5-field">
            <label className="g5-label">Departamento</label>
            <select className="g5-select" value={form.departamento} onChange={e=>set("departamento", e.target.value)}>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="g5-field">
            <label className="g5-label">Líder</label>
            <input className="g5-input" value={form.lider} onChange={e=>set("lider", e.target.value)} placeholder="Nome do líder" />
          </div>
        </div>
        <div className="g5-field">
          <label className="g5-label">Auditor <span className="opt">(opcional)</span></label>
          <input className="g5-input" value={form.auditor||""} onChange={e=>set("auditor", e.target.value)} placeholder="Responsável pela auditoria" />
        </div>
      </form>
    </Modal>
  );
}

function AreasListView({ areas, settings, onUpdateAreas, onOpenArea }){
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("Todos");
  const thresholds = settings.thresholds || { red:60, yellow:79 };

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = areas.filter(a => {
      if (deptFilter !== "Todos" && a.departamento !== deptFilter) return false;
      if (q && !(a.nome.toLowerCase().includes(q) || (a.lider||"").toLowerCase().includes(q))) return false;
      return true;
    });
    const g = {};
    (settings.departments||[]).forEach(d => g[d] = []);
    filtered.forEach(a => { (g[a.departamento] = g[a.departamento]||[]).push(a); });
    return g;
  }, [areas, search, deptFilter, settings.departments]);

  function addArea(form){
    const newArea = {
      id: uid("area"), nome:form.nome.trim(), departamento:form.departamento,
      lider:form.lider.trim(), auditor:form.auditor.trim(), dataFoto:null,
      itens:[], auditorias:{},
    };
    onUpdateAreas(prev => [...prev, newArea]);
    setShowAdd(false);
  }

  const totalAreas = areas.length;

  return (
    <div>
      <SectionHeading
        eyebrow={totalAreas + " áreas cadastradas"}
        title="Áreas do Programa"
        desc="Lotes, setores e grupos 5S — organizados por departamento"
        right={<button className="g5-btn g5-btn-primary" onClick={()=>setShowAdd(true)}><Plus size={15}/> Nova Área</button>}
      />

      <div className="g5-toolbar">
        <div className="g5-search">
          <Search size={15}/>
          <input className="g5-input" placeholder="Buscar área ou líder…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="g5-chip-toggle">
          <button className={deptFilter==="Todos"?"active":""} onClick={()=>setDeptFilter("Todos")}>Todos</button>
          {(settings.departments||[]).map(d => (
            <button key={d} className={deptFilter===d?"active":""} onClick={()=>setDeptFilter(d)}>{d}</button>
          ))}
        </div>
      </div>

      {Object.entries(grouped).every(([,list])=>list.length===0) ? (
        <EmptyState icon={Factory} title="Nenhuma área encontrada" desc="Ajuste os filtros ou cadastre uma nova área para começar." />
      ) : Object.entries(grouped).map(([dept, list]) => {
        if (!list.length) return null;
        const meta = deptMeta(dept);
        const Icon = meta.icon;
        return (
          <div className="g5-dept-section" key={dept}>
            <div className="g5-dept-head">
              <Icon size={18} style={{ color: meta.color }} />
              <h3>{dept}</h3>
              <span className="g5-dept-count">{list.length}</span>
            </div>
            <div className="g5-area-grid">
              {list.map(area => {
                const media = areaAverage(area);
                const open = areaOpenItems(area);
                const overdue = areaOverdueItems(area);
                return (
                  <button key={area.id} className="g5-area-card" onClick={()=>onOpenArea(area.id)}>
                    <div className="g5-area-card-top">
                      <div>
                        <div className="g5-area-card-name">{area.nome}</div>
                        <div className="g5-area-card-leader"><UserRound size={12}/> {area.lider || "Líder não definido"}</div>
                      </div>
                      <StampBadge score={media} thresholds={thresholds} size="sm" />
                    </div>
                    <div className="g5-area-card-foot">
                      <span className="g5-open-count">
                        <ClipboardList size={13}/> {open} {open===1?"pendência":"pendências"}
                      </span>
                      {overdue > 0 && <span className="g5-pill tone-red"><AlertTriangle size={11}/> {overdue} atrasada{overdue>1?"s":""}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {showAdd && (
        <AreaFormModal departments={settings.departments||[]} onClose={()=>setShowAdd(false)} onSave={addArea} />
      )}
    </div>
  );
}
/* ================================================================
   ÁREA — DETALHE (auditorias + PAD)
   ================================================================ */
function ItemFormModal({ initial, defaultResponsavel, onSave, onClose }){
  const isEdit = !!initial;
  const [form, setForm] = useState(() => initial ? { ...initial, prazo: initial.prazo || { type:"date", value:"" } } : {
    problema:"", oQueFazer:"", responsavel: defaultResponsavel || "", status:"pendente",
    prazo: { type:"date", value:"" }, fotoAntes:null, fotoDepois:null,
  });
  function set(k,v){ setForm(f => ({ ...f, [k]:v })); }
  function setPrazo(k,v){ setForm(f => ({ ...f, prazo: { ...f.prazo, [k]:v } })); }
  function submit(e){
    e.preventDefault();
    if (!form.problema.trim()) return;
    onSave(form);
  }
  return (
    <Modal title={isEdit ? "Editar Item do Plano de Ação" : "Novo Item do Plano de Ação"} onClose={onClose} wide
      footer={<>
        <button className="g5-btn g5-btn-outline" onClick={onClose}>Cancelar</button>
        <button className="g5-btn g5-btn-primary" onClick={submit}><Save size={15}/> Salvar Item</button>
      </>}>
      <form onSubmit={submit}>
        <div className="g5-field">
          <label className="g5-label">Problema Identificado</label>
          <textarea className="g5-textarea" autoFocus value={form.problema} onChange={e=>set("problema", e.target.value)} placeholder="Descreva a situação encontrada na auditoria…" />
        </div>
        <div className="g5-field">
          <label className="g5-label">O que fazer? <span className="opt">(uma ação por linha)</span></label>
          <textarea className="g5-textarea" value={form.oQueFazer} onChange={e=>set("oQueFazer", e.target.value)} placeholder={"1. Ação corretiva…\n2. Ação preventiva…"} />
        </div>
        <div className="g5-field-row">
          <div className="g5-field">
            <label className="g5-label">Responsável</label>
            <input className="g5-input" value={form.responsavel} onChange={e=>set("responsavel", e.target.value)} />
          </div>
          <div className="g5-field">
            <label className="g5-label">Situação</label>
            <select className="g5-select" value={form.status} onChange={e=>set("status", e.target.value)}>
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído (OK)</option>
            </select>
          </div>
        </div>
        <div className="g5-field">
          <label className="g5-label">Prazo</label>
          <div style={{ display:"flex", gap:8, marginBottom:8 }}>
            <div className="g5-chip-toggle">
              <button type="button" className={form.prazo.type==="date"?"active":""} onClick={()=>setPrazo("type","date")}>Data específica</button>
              <button type="button" className={form.prazo.type==="text"?"active":""} onClick={()=>setPrazo("type","text")}>Ciclo / texto livre</button>
            </div>
          </div>
          {form.prazo.type === "date" ? (
            <input className="g5-input" type="date" value={form.prazo.value||""} onChange={e=>setPrazo("value", e.target.value)} />
          ) : (
            <input className="g5-input" value={form.prazo.value||""} onChange={e=>setPrazo("value", e.target.value)} placeholder='Ex.: "4º ciclo" ou "Próxima parada"' />
          )}
        </div>
        <div className="g5-field">
          <label className="g5-label">Registro Fotográfico <span className="opt">(opcional)</span></label>
          <div style={{ display:"flex", gap:16 }}>
            <div style={{ textAlign:"center" }}>
              <PhotoSlot label="Antes" value={form.fotoAntes} onChange={v=>set("fotoAntes", v)} onRemove={()=>set("fotoAntes", null)} />
              <div style={{ fontSize:10.5, color:"var(--ink-soft)", marginTop:4 }}>Situação atual</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <PhotoSlot label="Depois" value={form.fotoDepois} onChange={v=>set("fotoDepois", v)} onRemove={()=>set("fotoDepois", null)} />
              <div style={{ fontSize:10.5, color:"var(--ink-soft)", marginTop:4 }}>Ação concluída</div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function ItemCard({ item, onEdit, onDelete, onToggleStatus }){
  const overdue = isItemOverdue(item);
  const done = item.status === "concluido";
  return (
    <div className={classNames("g5-item-card", done && "is-done")}>
      <div className="g5-item-head">
        <span className="g5-item-num">#{item.numero}</span>
        <div className={classNames("g5-item-problem", done && "is-done")}>{item.problema}</div>
        {done ? (
          <StatusPill meta={{ label:"Concluído", tone:"green", icon:CheckCircle2 }} />
        ) : overdue ? (
          <StatusPill meta={{ label:"Atrasado", tone:"red", icon:AlertTriangle }} />
        ) : (
          <StatusPill meta={{ label:"Pendente", tone:"amber", icon:Clock }} />
        )}
      </div>
      {item.oQueFazer && <div className="g5-item-actions-text">{item.oQueFazer}</div>}
      <div className="g5-item-meta">
        <span className="g5-item-meta-i"><UserRound size={13}/> {item.responsavel || "Não atribuído"}</span>
        <span className="g5-item-meta-i"><CalendarDays size={13}/> {formatDeadline(item.prazo)}</span>
        {item.qtdAcoes ? <span className="g5-item-meta-i"><ListChecks size={13}/> {item.qtdAcoes} ação(ões)</span> : null}
      </div>
      {(item.fotoAntes || item.fotoDepois) && (
        <div className="g5-item-photos">
          {item.fotoAntes && <img src={item.fotoAntes} alt="Antes" className="g5-photo-thumb" title="Antes" />}
          {item.fotoDepois && <img src={item.fotoDepois} alt="Depois" className="g5-photo-thumb" title="Depois" />}
        </div>
      )}
      <div className="g5-item-footrow">
        <button className={classNames("g5-btn g5-btn-sm", done ? "g5-btn-outline" : "g5-btn-primary")} onClick={onToggleStatus}>
          {done ? <><RotateCcw size={13}/> Reabrir</> : <><Check size={13}/> Marcar concluído</>}
        </button>
        <div className="g5-item-btns">
          <button className="g5-btn g5-btn-ghost g5-btn-icon" onClick={onEdit} title="Editar"><Pencil size={14}/></button>
          <button className="g5-btn g5-btn-ghost g5-btn-icon" onClick={onDelete} title="Excluir"><Trash2 size={14}/></button>
        </div>
      </div>
    </div>
  );
}

function AreaDetailView({ area, settings, onUpdateArea, onDeleteArea, onBack }){
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [showEditArea, setShowEditArea] = useState(false);
  const [confirmDeleteArea, setConfirmDeleteArea] = useState(false);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");

  const rounds = settings.rounds || [];
  const thresholds = settings.thresholds || { red:60, yellow:79 };
  const media = areaAverage(area);

  const trendData = rounds.map(r => ({
    periodo: r.label.replace("Auditoria ", "Aud. "),
    nota: area.auditorias && area.auditorias[r.id] ? area.auditorias[r.id].nota : null,
  }));

  const filteredItems = useMemo(() => {
    let items = area.itens || [];
    if (statusFilter === "pendentes") items = items.filter(i => i.status !== "concluido");
    if (statusFilter === "concluidos") items = items.filter(i => i.status === "concluido");
    if (statusFilter === "atrasados") items = items.filter(isItemOverdue);
    if (search.trim()){
      const q = search.trim().toLowerCase();
      items = items.filter(i => i.problema.toLowerCase().includes(q));
    }
    return items;
  }, [area.itens, statusFilter, search]);

  function updateScore(roundId, value){
    onUpdateArea(area.id, a => {
      const auditorias = { ...(a.auditorias||{}) };
      if (value === "" || value == null) delete auditorias[roundId];
      else auditorias[roundId] = { ...(auditorias[roundId]||{}), nota: Math.max(0, Math.min(100, Number(value))) };
      return { ...a, auditorias };
    });
  }

  function saveArea(form){
    onUpdateArea(area.id, a => ({ ...a, nome:form.nome.trim(), departamento:form.departamento, lider:form.lider.trim(), auditor:form.auditor.trim() }));
    setShowEditArea(false);
  }

  function saveItem(form){
    const lines = (form.oQueFazer||"").split("\n").filter(l=>l.trim()).length;
    if (editingItem){
      onUpdateArea(area.id, a => ({ ...a, itens: a.itens.map(i => i.id===editingItem.id ? { ...form, id:i.id, numero:i.numero, qtdAcoes: lines || i.qtdAcoes } : i) }));
    } else {
      const nextNum = (area.itens||[]).reduce((m,i)=>Math.max(m,i.numero||0), 0) + 1;
      onUpdateArea(area.id, a => ({ ...a, itens: [...(a.itens||[]), { ...form, id: uid("item"), numero: nextNum, qtdAcoes: lines || null }] }));
    }
    setShowItemForm(false); setEditingItem(null);
  }

  function toggleItemStatus(item){
    onUpdateArea(area.id, a => ({ ...a, itens: a.itens.map(i => i.id===item.id ? { ...i, status: i.status==="concluido" ? "pendente" : "concluido" } : i) }));
  }
  function deleteItem(itemId){
    onUpdateArea(area.id, a => ({ ...a, itens: a.itens.filter(i => i.id!==itemId) }));
    setDeleteItemId(null);
  }

  const openCount = areaOpenItems(area);
  const doneCount = (area.itens||[]).length - openCount;

  return (
    <div>
      <button className="g5-back-link" onClick={onBack}><ArrowLeft size={15}/> Voltar para Áreas</button>

      <div className="g5-detail-header">
        <StampBadge score={media} thresholds={thresholds} size="lg" />
        <div className="g5-detail-header-info">
          <h2>{area.nome}</h2>
          <div className="g5-detail-header-meta">
            <span><DeptTag dept={area.departamento} /></span>
            <span>Líder: <b>{area.lider || "—"}</b></span>
            <span>Auditor: <b>{area.auditor || "—"}</b></span>
            {area.dataFoto && <span>Última auditoria: <b>{formatDateISO(area.dataFoto)}</b></span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="g5-btn g5-btn-outline" onClick={()=>setShowEditArea(true)} style={{ background:"rgba(255,255,255,0.9)" }}><Pencil size={14}/> Editar</button>
          <button className="g5-btn g5-btn-danger" onClick={()=>setConfirmDeleteArea(true)}><Trash2 size={14}/></button>
        </div>
      </div>

      <div className="g5-two-col" style={{ marginBottom:22 }}>
        <div className="g5-chart-card">
          <div className="g5-chart-title">Notas de Auditoria</div>
          <div className="g5-chart-sub">Edite a nota de cada rodada — a média é recalculada automaticamente</div>
          <div className="g5-scoretable">
            {rounds.map(r => {
              const val = area.auditorias && area.auditorias[r.id] ? area.auditorias[r.id].nota : null;
              return (
                <div className="g5-scoretable-col" key={r.id}>
                  <label>{r.label}</label>
                  <div className="per">{r.periodo}</div>
                  <input type="number" min="0" max="100" className="g5-score-input" style={{ width:"100%" }}
                    value={val==null?"":val} placeholder="—" onChange={e=>updateScore(r.id, e.target.value)} />
                </div>
              );
            })}
            <div className="g5-scoretable-col" style={{ background:"var(--panel)", color:"#fff" }}>
              <label style={{ color:"var(--steel-soft)" }}>Média</label>
              <div className="per" style={{ color:"var(--steel-soft)" }}>ciclo</div>
              <div className="g5-mono" style={{ fontWeight:700, fontSize:16, padding:"6px 0" }}>{media==null?"—":round1(media)}</div>
            </div>
          </div>
          {rounds.length >= 2 && (
            <div style={{ width:"100%", height:150, marginTop:16 }}>
              <ResponsiveContainer>
                <LineChart data={trendData} margin={{ top:6, right:10, left:-24, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="periodo" tick={{ fontSize:11, fill:"var(--ink-soft)" }} axisLine={{ stroke:"var(--line)" }} tickLine={false} />
                  <YAxis domain={[0,100]} tick={{ fontSize:11, fill:"var(--ink-soft)" }} axisLine={false} tickLine={false} />
                  <RTooltip contentStyle={{ fontSize:12.5, borderRadius:8, border:"1px solid var(--line)" }} />
                  <Line type="monotone" dataKey="nota" stroke="var(--cana)" strokeWidth={2.5} dot={{ r:4, fill:"var(--cana)" }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="g5-chart-card" style={{ display:"flex", flexDirection:"column", justifyContent:"center", gap:14 }}>
          <div className="g5-chart-title" style={{ marginBottom:0 }}>Plano de Ação (PAD)</div>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1, textAlign:"center", padding:"12px 8px", background:"var(--amber-tint)", borderRadius:10 }}>
              <div className="g5-mono" style={{ fontSize:22, fontWeight:700, color:"var(--amber-dark)" }}>{openCount}</div>
              <div style={{ fontSize:11, color:"var(--ink-soft)" }}>pendentes</div>
            </div>
            <div style={{ flex:1, textAlign:"center", padding:"12px 8px", background:"var(--green-tint)", borderRadius:10 }}>
              <div className="g5-mono" style={{ fontSize:22, fontWeight:700, color:"var(--green-dark)" }}>{doneCount}</div>
              <div style={{ fontSize:11, color:"var(--ink-soft)" }}>concluídos</div>
            </div>
          </div>
          <button className="g5-btn g5-btn-primary g5-btn-block" onClick={()=>{ setEditingItem(null); setShowItemForm(true); }}>
            <Plus size={15}/> Novo Item do Plano de Ação
          </button>
        </div>
      </div>

      <div className="g5-toolbar">
        <div className="g5-search">
          <Search size={15}/>
          <input className="g5-input" placeholder="Buscar problema…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="g5-chip-toggle">
          <button className={statusFilter==="todos"?"active":""} onClick={()=>setStatusFilter("todos")}>Todos ({(area.itens||[]).length})</button>
          <button className={statusFilter==="pendentes"?"active":""} onClick={()=>setStatusFilter("pendentes")}>Pendentes</button>
          <button className={statusFilter==="atrasados"?"active":""} onClick={()=>setStatusFilter("atrasados")}>Atrasados</button>
          <button className={statusFilter==="concluidos"?"active":""} onClick={()=>setStatusFilter("concluidos")}>Concluídos</button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="Nenhum item encontrado"
          desc={(area.itens||[]).length===0 ? "Cadastre o primeiro item do plano de ação direcionado desta área." : "Ajuste os filtros para ver outros itens."}
          action={<button className="g5-btn g5-btn-primary" style={{ marginTop:10 }} onClick={()=>{ setEditingItem(null); setShowItemForm(true); }}><Plus size={15}/> Novo Item</button>} />
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item}
              onEdit={()=>{ setEditingItem(item); setShowItemForm(true); }}
              onDelete={()=>setDeleteItemId(item.id)}
              onToggleStatus={()=>toggleItemStatus(item)} />
          ))}
        </div>
      )}

      {showItemForm && (
        <ItemFormModal initial={editingItem} defaultResponsavel={area.lider}
          onClose={()=>{ setShowItemForm(false); setEditingItem(null); }} onSave={saveItem} />
      )}
      {showEditArea && (
        <AreaFormModal initial={area} departments={settings.departments||[]} onClose={()=>setShowEditArea(false)} onSave={saveArea} />
      )}
      {deleteItemId && (
        <ConfirmDialog title="Excluir item?" message="Esta ação removerá o item do plano de ação permanentemente."
          confirmLabel="Excluir" danger onCancel={()=>setDeleteItemId(null)} onConfirm={()=>deleteItem(deleteItemId)} />
      )}
      {confirmDeleteArea && (
        <ConfirmDialog title={"Excluir " + area.nome + "?"} message="Todos os itens do plano de ação e o histórico de notas desta área serão perdidos permanentemente."
          confirmLabel="Excluir Área" danger onCancel={()=>setConfirmDeleteArea(false)} onConfirm={()=>{ setConfirmDeleteArea(false); onDeleteArea(area.id); }} />
      )}
    </div>
  );
}
/* ================================================================
   PLANO DE AÇÃO GERAL (projeto de implantação do programa)
   ================================================================ */
function MasterItemFormModal({ initial, onSave, onClose }){
  const isEdit = !!initial;
  const [form, setForm] = useState(() => initial || { acao:"", responsavel:"", status:"no_prazo", dataInicio:"", dataTermino:"", observacoes:"" });
  function set(k,v){ setForm(f => ({ ...f, [k]:v })); }
  function submit(e){ e.preventDefault(); if (!form.acao.trim()) return; onSave(form); }
  return (
    <Modal title={isEdit ? "Editar Ação" : "Nova Ação do Plano Geral"} onClose={onClose}
      footer={<>
        <button className="g5-btn g5-btn-outline" onClick={onClose}>Cancelar</button>
        <button className="g5-btn g5-btn-primary" onClick={submit}><Save size={15}/> Salvar</button>
      </>}>
      <form onSubmit={submit}>
        <div className="g5-field">
          <label className="g5-label">Ação (o que fazer?)</label>
          <textarea className="g5-textarea" autoFocus value={form.acao} onChange={e=>set("acao", e.target.value)} />
        </div>
        <div className="g5-field-row">
          <div className="g5-field">
            <label className="g5-label">Responsável</label>
            <input className="g5-input" value={form.responsavel} onChange={e=>set("responsavel", e.target.value)} />
          </div>
          <div className="g5-field">
            <label className="g5-label">Status</label>
            <select className="g5-select" value={form.status} onChange={e=>set("status", e.target.value)}>
              {Object.entries(MASTER_STATUS_META).map(([k,m]) => <option key={k} value={k}>{m.label}</option>)}
            </select>
          </div>
        </div>
        <div className="g5-field-row">
          <div className="g5-field">
            <label className="g5-label">Data de Início</label>
            <input className="g5-input" type="date" value={form.dataInicio||""} onChange={e=>set("dataInicio", e.target.value)} />
          </div>
          <div className="g5-field">
            <label className="g5-label">Data de Término</label>
            <input className="g5-input" type="date" value={form.dataTermino||""} onChange={e=>set("dataTermino", e.target.value)} />
          </div>
        </div>
        <div className="g5-field">
          <label className="g5-label">Observações <span className="opt">(opcional)</span></label>
          <textarea className="g5-textarea" style={{ minHeight:50 }} value={form.observacoes||""} onChange={e=>set("observacoes", e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}

function MasterPlanView({ masterPlan, onUpdate }){
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const total = masterPlan.length;
    const byStatus = { concluida:0, no_prazo:0, atrasada:0, cancelada:0 };
    masterPlan.forEach(i => { byStatus[i.status] = (byStatus[i.status]||0) + 1; });
    const denom = total - byStatus.cancelada || 1;
    const closure = (byStatus.concluida / denom) * 100;
    return { total, byStatus, closure };
  }, [masterPlan]);

  const filtered = useMemo(() => {
    let items = masterPlan;
    if (statusFilter !== "todos") items = items.filter(i => i.status === statusFilter);
    if (search.trim()){
      const q = search.trim().toLowerCase();
      items = items.filter(i => i.acao.toLowerCase().includes(q) || (i.responsavel||"").toLowerCase().includes(q));
    }
    return items;
  }, [masterPlan, statusFilter, search]);

  function addItem(form){
    const nextItem = (masterPlan.reduce((m,i)=>Math.max(m,i.item||0),0)) + 1;
    onUpdate(prev => [...prev, { ...form, item: nextItem }]);
    setShowForm(false);
  }
  function saveEdit(form){
    onUpdate(prev => prev.map(i => i.item === editingItem.item ? { ...form, item:i.item } : i));
    setShowForm(false); setEditingItem(null);
  }
  function deleteItem(itemNum){
    onUpdate(prev => prev.filter(i => i.item !== itemNum));
    setDeleteId(null);
  }
  function quickStatus(itemNum, status){
    onUpdate(prev => prev.map(i => i.item === itemNum ? { ...i, status } : i));
  }

  return (
    <div>
      <SectionHeading eyebrow="Projeto de implantação" title="Plano de Ação Geral"
        desc="Ações estruturantes do Programa 5S — auxílio na implementação do sistema de gestão"
        right={<button className="g5-btn g5-btn-primary" onClick={()=>{ setEditingItem(null); setShowForm(true); }}><Plus size={15}/> Nova Ação</button>} />

      <div className="g5-stat-grid">
        <StatCard label="Total de Ações" value={stats.total} color="var(--ink)" icon={ListChecks} />
        <StatCard label="Concluídas" value={stats.byStatus.concluida} color="var(--green)" icon={CheckCircle2} sub={round1(stats.closure)+"% de fechamento"} />
        <StatCard label="No Prazo" value={stats.byStatus.no_prazo} color="var(--amber)" icon={Clock} />
        <StatCard label="Atrasadas" value={stats.byStatus.atrasada} color="var(--red)" icon={AlertTriangle} sub={stats.byStatus.cancelada+" canceladas"} />
      </div>

      <div className="g5-toolbar">
        <div className="g5-search">
          <Search size={15}/>
          <input className="g5-input" placeholder="Buscar ação ou responsável…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="g5-chip-toggle">
          <button className={statusFilter==="todos"?"active":""} onClick={()=>setStatusFilter("todos")}>Todos</button>
          {Object.entries(MASTER_STATUS_META).map(([k,m]) => (
            <button key={k} className={statusFilter===k?"active":""} onClick={()=>setStatusFilter(k)}>{m.label}</button>
          ))}
        </div>
      </div>

      <div className="g5-table-wrap">
        <table className="g5-table">
          <thead>
            <tr>
              <th className="no-sort" style={{ width:44 }}>#</th>
              <th className="no-sort">Ação</th>
              <th className="no-sort">Responsável</th>
              <th className="no-sort">Status</th>
              <th className="no-sort">Início</th>
              <th className="no-sort">Término</th>
              <th className="no-sort" style={{ width:70 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.item}>
                <td className="num-cell">{item.item}</td>
                <td style={{ minWidth:260 }}>{item.acao}</td>
                <td style={{ whiteSpace:"nowrap" }}>{item.responsavel || "—"}</td>
                <td>
                  <select className="g5-select" style={{ padding:"5px 8px", fontSize:12, width:"auto" }}
                    value={item.status} onChange={e=>quickStatus(item.item, e.target.value)}>
                    {Object.entries(MASTER_STATUS_META).map(([k,m]) => <option key={k} value={k}>{m.label}</option>)}
                  </select>
                </td>
                <td className="g5-mono" style={{ fontSize:12.5, whiteSpace:"nowrap" }}>{formatDateISO(item.dataInicio)}</td>
                <td className="g5-mono" style={{ fontSize:12.5, whiteSpace:"nowrap" }}>{formatDateISO(item.dataTermino)}</td>
                <td>
                  <div style={{ display:"flex", gap:4 }}>
                    <button className="g5-btn g5-btn-ghost g5-btn-icon" onClick={()=>{ setEditingItem(item); setShowForm(true); }}><Pencil size={14}/></button>
                    <button className="g5-btn g5-btn-ghost g5-btn-icon" onClick={()=>setDeleteId(item.item)}><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign:"center", padding:30, color:"var(--ink-soft)" }}>Nenhuma ação encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <MasterItemFormModal initial={editingItem} onClose={()=>{ setShowForm(false); setEditingItem(null); }} onSave={editingItem ? saveEdit : addItem} />
      )}
      {deleteId != null && (
        <ConfirmDialog title="Excluir ação?" message="Esta ação será removida do plano geral permanentemente."
          confirmLabel="Excluir" danger onCancel={()=>setDeleteId(null)} onConfirm={()=>deleteItem(deleteId)} />
      )}
    </div>
  );
}
/* ================================================================
   CRONOGRAMA
   ================================================================ */
function TaskFormModal({ initial, onSave, onClose }){
  const [form, setForm] = useState(() => initial || { nome:"", periodo:"", status:"pendente" });
  function set(k,v){ setForm(f=>({ ...f, [k]:v })); }
  function submit(e){ e.preventDefault(); if (!form.nome.trim()) return; onSave(form); }
  return (
    <Modal title={initial ? "Editar Tarefa" : "Nova Tarefa"} onClose={onClose}
      footer={<><button className="g5-btn g5-btn-outline" onClick={onClose}>Cancelar</button><button className="g5-btn g5-btn-primary" onClick={submit}><Save size={15}/> Salvar</button></>}>
      <form onSubmit={submit}>
        <div className="g5-field"><label className="g5-label">Tarefa</label><input className="g5-input" autoFocus value={form.nome} onChange={e=>set("nome",e.target.value)} /></div>
        <div className="g5-field-row">
          <div className="g5-field"><label className="g5-label">Período</label><input className="g5-input" value={form.periodo} onChange={e=>set("periodo",e.target.value)} placeholder="Ex.: Julho de 2026" /></div>
          <div className="g5-field"><label className="g5-label">Status</label>
            <select className="g5-select" value={form.status} onChange={e=>set("status",e.target.value)}>
              {Object.entries(TASK_STATUS_META).map(([k,m])=><option key={k} value={k}>{m.label}</option>)}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function CronogramaView({ cronograma, onUpdate }){
  const [addingTo, setAddingTo] = useState(null);
  const [editing, setEditing] = useState(null); // {faseId, task}
  const [deleting, setDeleting] = useState(null);

  function addPhase(){
    const nome = window.prompt("Nome da nova fase:");
    if (!nome || !nome.trim()) return;
    onUpdate(prev => [...prev, { id: uid("fase"), fase: nome.trim(), tarefas: [] }]);
  }
  function saveTask(faseId, form){
    if (editing && editing.task){
      onUpdate(prev => prev.map(f => f.id!==faseId ? f : { ...f, tarefas: f.tarefas.map(t => t.id===editing.task.id ? { ...t, ...form } : t) }));
    } else {
      onUpdate(prev => prev.map(f => f.id!==faseId ? f : { ...f, tarefas: [...f.tarefas, { id: uid("tarefa"), ...form }] }));
    }
    setAddingTo(null); setEditing(null);
  }
  function deleteTask(faseId, taskId){
    onUpdate(prev => prev.map(f => f.id!==faseId ? f : { ...f, tarefas: f.tarefas.filter(t=>t.id!==taskId) }));
    setDeleting(null);
  }
  function cycleStatus(faseId, taskId){
    const order = ["pendente","em_andamento","concluido"];
    onUpdate(prev => prev.map(f => f.id!==faseId ? f : { ...f, tarefas: f.tarefas.map(t => {
      if (t.id!==taskId) return t;
      const idx = order.indexOf(t.status);
      return { ...t, status: order[(idx+1)%order.length] };
    })}));
  }

  return (
    <div>
      <SectionHeading eyebrow="Implantação do programa" title="Cronograma"
        desc="Fases preparatória, de capacitação e de execução do Programa 5S"
        right={<button className="g5-btn g5-btn-outline" onClick={addPhase}><Plus size={15}/> Nova Fase</button>} />

      {cronograma.map((fase, fi) => (
        <div className="g5-phase" key={fase.id}>
          <div className="g5-phase-title">
            <span className="g5-phase-num">{fi+1}</span>
            <h3>{fase.fase}</h3>
            <button className="g5-btn g5-btn-ghost g5-btn-sm" onClick={()=>setAddingTo(fase.id)}><Plus size={13}/> Tarefa</button>
          </div>
          {fase.tarefas.length === 0 ? (
            <p style={{ fontSize:12.5, color:"var(--ink-soft)", paddingLeft:36 }}>Nenhuma tarefa cadastrada nesta fase.</p>
          ) : fase.tarefas.map(t => {
            const meta = TASK_STATUS_META[t.status] || TASK_STATUS_META.pendente;
            return (
              <div className="g5-task-row" key={t.id}>
                <button className="g5-btn g5-btn-ghost g5-btn-icon" onClick={()=>cycleStatus(fase.id, t.id)} title="Clique para alternar status">
                  {t.status === "concluido" ? <CheckCircle2 size={17} style={{ color:"var(--green)" }}/> : t.status === "em_andamento" ? <Clock size={17} style={{ color:"var(--amber)" }}/> : <div style={{ width:17, height:17, borderRadius:"50%", border:"2px solid var(--steel-soft-2)" }} />}
                </button>
                <span className="g5-task-name">{t.nome}</span>
                <span className="g5-task-period">{t.periodo}</span>
                <StatusPill meta={meta} />
                <div style={{ display:"flex", gap:2 }}>
                  <button className="g5-btn g5-btn-ghost g5-btn-icon" onClick={()=>{ setEditing({ faseId:fase.id, task:t }); setAddingTo(fase.id); }}><Pencil size={13}/></button>
                  <button className="g5-btn g5-btn-ghost g5-btn-icon" onClick={()=>setDeleting({ faseId:fase.id, taskId:t.id })}><Trash2 size={13}/></button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {addingTo && (
        <TaskFormModal initial={editing && editing.faseId===addingTo ? editing.task : null}
          onClose={()=>{ setAddingTo(null); setEditing(null); }}
          onSave={(form)=>saveTask(addingTo, form)} />
      )}
      {deleting && (
        <ConfirmDialog title="Excluir tarefa?" message="Esta tarefa será removida do cronograma."
          confirmLabel="Excluir" danger onCancel={()=>setDeleting(null)} onConfirm={()=>deleteTask(deleting.faseId, deleting.taskId)} />
      )}
    </div>
  );
}

/* ================================================================
   COMITÊ
   ================================================================ */
function MemberFormModal({ initial, departments, onSave, onClose }){
  const [form, setForm] = useState(() => initial || { nome:"", cargo:"", departamento: departments[0] || "" });
  function set(k,v){ setForm(f=>({ ...f, [k]:v })); }
  function submit(e){ e.preventDefault(); if (!form.nome.trim()) return; onSave(form); }
  return (
    <Modal title={initial ? "Editar Membro" : "Novo Membro do Comitê"} onClose={onClose}
      footer={<><button className="g5-btn g5-btn-outline" onClick={onClose}>Cancelar</button><button className="g5-btn g5-btn-primary" onClick={submit}><Save size={15}/> Salvar</button></>}>
      <form onSubmit={submit}>
        <div className="g5-field"><label className="g5-label">Nome</label><input className="g5-input" autoFocus value={form.nome} onChange={e=>set("nome",e.target.value)} /></div>
        <div className="g5-field-row">
          <div className="g5-field"><label className="g5-label">Cargo / Função</label><input className="g5-input" value={form.cargo} onChange={e=>set("cargo",e.target.value)} placeholder="Ex.: Facilitador — Industrial" /></div>
          <div className="g5-field"><label className="g5-label">Departamento</label>
            <select className="g5-select" value={form.departamento} onChange={e=>set("departamento",e.target.value)}>
              {departments.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function CommitteeView({ committee, settings, onUpdate }){
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  function addMember(form){ onUpdate(prev => [...prev, { id: uid("m"), ...form }]); setShowForm(false); }
  function saveEdit(form){ onUpdate(prev => prev.map(m => m.id===editing.id ? { ...m, ...form } : m)); setShowForm(false); setEditing(null); }
  function deleteMember(id){ onUpdate(prev => prev.filter(m => m.id!==id)); setDeleting(null); }

  return (
    <div>
      <SectionHeading eyebrow="Governança do programa" title="Comitê 5S"
        desc="Coordenação, consultoria e facilitadores responsáveis pelo programa"
        right={<button className="g5-btn g5-btn-primary" onClick={()=>{ setEditing(null); setShowForm(true); }}><Plus size={15}/> Novo Membro</button>} />

      {committee.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum membro cadastrado" desc="Adicione os responsáveis pela coordenação do Programa 5S." />
      ) : (
        <div className="g5-committee-grid">
          {committee.map(m => (
            <div className="g5-member-card" key={m.id}>
              <div className="g5-avatar">{initials(m.nome)}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14.5 }}>{m.nome}</div>
                <div style={{ fontSize:12, color:"var(--ink-soft)" }}>{m.cargo}</div>
                <div style={{ marginTop:4 }}><DeptTag dept={m.departamento} /></div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                <button className="g5-btn g5-btn-ghost g5-btn-icon" onClick={()=>{ setEditing(m); setShowForm(true); }}><Pencil size={13}/></button>
                <button className="g5-btn g5-btn-ghost g5-btn-icon" onClick={()=>setDeleting(m.id)}><Trash2 size={13}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <MemberFormModal initial={editing} departments={settings.departments||[]} onClose={()=>{ setShowForm(false); setEditing(null); }} onSave={editing ? saveEdit : addMember} />
      )}
      {deleting && (
        <ConfirmDialog title="Remover membro?" message="Este membro será removido do comitê." confirmLabel="Remover" danger
          onCancel={()=>setDeleting(null)} onConfirm={()=>deleteMember(deleting)} />
      )}
    </div>
  );
}
/* ================================================================
   CONFIGURAÇÕES
   ================================================================ */
function SettingsView({ settings, onUpdateSettings, areas, masterPlan, committee, cronograma, onImportAll, onResetAll }){
  const [local, setLocal] = useState(settings);
  const [newDept, setNewDept] = useState("");
  const [newRoundLabel, setNewRoundLabel] = useState("");
  const [newRoundPeriodo, setNewRoundPeriodo] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [importError, setImportError] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
  const fileRef = useRef(null);

  useEffect(()=>{ setLocal(settings); }, [settings]);

  function set(k,v){ setLocal(f => ({ ...f, [k]:v })); }
  function setThreshold(k,v){ setLocal(f => ({ ...f, thresholds: { ...f.thresholds, [k]: Number(v) } })); }

  function saveGeneral(){
    onUpdateSettings(local);
    setSavedFlash(true);
    setTimeout(()=>setSavedFlash(false), 1800);
  }

  function addDept(){
    const d = newDept.trim();
    if (!d || local.departments.includes(d)) return;
    const next = { ...local, departments:[...local.departments, d] };
    setLocal(next); onUpdateSettings(next); setNewDept("");
  }
  function removeDept(d){
    const next = { ...local, departments: local.departments.filter(x=>x!==d) };
    setLocal(next); onUpdateSettings(next);
  }
  function addRound(){
    if (!newRoundLabel.trim()) return;
    const next = { ...local, rounds:[...local.rounds, { id: uid("round"), label:newRoundLabel.trim(), periodo:newRoundPeriodo.trim() }] };
    setLocal(next); onUpdateSettings(next); setNewRoundLabel(""); setNewRoundPeriodo("");
  }
  function removeRound(id){
    const next = { ...local, rounds: local.rounds.filter(r=>r.id!==id) };
    setLocal(next); onUpdateSettings(next);
  }

  function exportAll(){
    downloadJSON({ areas, masterPlan, committee, cronograma, settings, exportadoEm: new Date().toISOString() },
      "programa-5s-" + settings.millName.toLowerCase().replace(/\s+/g,"-") + "-" + todayISO() + ".json");
  }

  function handleImportFile(e){
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed || typeof parsed !== "object") throw new Error("Formato inválido");
        onImportAll(parsed);
      } catch (err){
        setImportError("Não foi possível importar este arquivo. Verifique se é um JSON exportado por esta plataforma.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <SectionHeading eyebrow="Administração" title="Configurações" desc="Parâmetros do programa, departamentos, ciclos de auditoria e dados." />

      <div className="g5-card g5-card-pad" style={{ marginBottom:18, background:"var(--cana-tint)", borderColor:"var(--cana)" }}>
        <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
          <Users size={18} style={{ color:"var(--cana-dark)", flex:"none", marginTop:2 }} />
          <p style={{ fontSize:13, color:"var(--cana-dark)", lineHeight:1.5 }}>
            Esta plataforma usa <b>armazenamento compartilhado</b>: todas as pessoas que abrirem este link
            veem e editam os mesmos dados, como um quadro de gestão à vista digital. Não guarde aqui informações
            que não devam ser vistas por toda a equipe do programa.
          </p>
        </div>
      </div>

      <div className="g5-settings-section">
        <h3>Identificação do Programa</h3>
        <div className="g5-field-row">
          <div className="g5-field">
            <label className="g5-label">Nome da Unidade</label>
            <input className="g5-input" value={local.millName} onChange={e=>set("millName", e.target.value)} />
          </div>
          <div className="g5-field">
            <label className="g5-label">Nome do Programa</label>
            <input className="g5-input" value={local.programName} onChange={e=>set("programName", e.target.value)} />
          </div>
        </div>
        <div className="g5-field-row">
          <div className="g5-field">
            <label className="g5-label">Ciclo Atual</label>
            <input className="g5-input" value={local.cycleLabel} onChange={e=>set("cycleLabel", e.target.value)} placeholder='Ex.: "3º Ciclo"' />
          </div>
          <div className="g5-field">
            <label className="g5-label">Período do Ciclo</label>
            <input className="g5-input" value={local.cyclePeriod} onChange={e=>set("cyclePeriod", e.target.value)} placeholder="Ex.: Junho a Agosto de 2026" />
          </div>
        </div>
        <button className="g5-btn g5-btn-primary" onClick={saveGeneral}>{savedFlash ? <><Check size={15}/> Salvo</> : <><Save size={15}/> Salvar Alterações</>}</button>
      </div>

      <div className="g5-settings-section">
        <h3>Departamentos</h3>
        <div className="g5-tag-row">
          {local.departments.map(d => (
            <span className="g5-tag-editable" key={d}>{d}<button onClick={()=>removeDept(d)}><X size={12}/></button></span>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, marginTop:12, maxWidth:340 }}>
          <input className="g5-input" placeholder="Novo departamento" value={newDept} onChange={e=>setNewDept(e.target.value)} onKeyDown={e=>e.key==="Enter" && addDept()} />
          <button className="g5-btn g5-btn-outline" onClick={addDept}><Plus size={14}/></button>
        </div>
      </div>

      <div className="g5-settings-section">
        <h3>Rodadas de Auditoria do Ciclo</h3>
        <p className="g5-help" style={{ marginBottom:10 }}>Estas colunas aparecem no Painel e em cada área. Adicione uma nova rodada quando um novo ciclo começar.</p>
        <div className="g5-table-wrap" style={{ marginBottom:12 }}>
          <table className="g5-table">
            <thead><tr><th className="no-sort">Rótulo</th><th className="no-sort">Período</th><th className="no-sort" style={{ width:50 }}></th></tr></thead>
            <tbody>
              {local.rounds.map(r => (
                <tr key={r.id}><td>{r.label}</td><td>{r.periodo}</td>
                  <td><button className="g5-btn g5-btn-ghost g5-btn-icon" onClick={()=>removeRound(r.id)}><Trash2 size={14}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="g5-field-row" style={{ maxWidth:520 }}>
          <input className="g5-input" placeholder='Rótulo (ex.: "Auditoria 1")' value={newRoundLabel} onChange={e=>setNewRoundLabel(e.target.value)} />
          <div style={{ display:"flex", gap:8 }}>
            <input className="g5-input" placeholder='Período (ex.: "Setembro/2026")' value={newRoundPeriodo} onChange={e=>setNewRoundPeriodo(e.target.value)} />
            <button className="g5-btn g5-btn-outline" onClick={addRound}><Plus size={14}/></button>
          </div>
        </div>
      </div>

      <div className="g5-settings-section">
        <h3>Faixas de Classificação (Selo)</h3>
        <p className="g5-help" style={{ marginBottom:10 }}>Define as cores usadas nos selos e na tabela de resultados.</p>
        <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <StampBadge score={local.thresholds.red} thresholds={local.thresholds} size="sm" />
            <span style={{ fontSize:12.5 }}>Crítico até</span>
            <input className="g5-input" type="number" style={{ width:70 }} value={local.thresholds.red} onChange={e=>setThreshold("red", e.target.value)} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <StampBadge score={local.thresholds.yellow} thresholds={local.thresholds} size="sm" />
            <span style={{ fontSize:12.5 }}>Atenção até</span>
            <input className="g5-input" type="number" style={{ width:70 }} value={local.thresholds.yellow} onChange={e=>setThreshold("yellow", e.target.value)} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <StampBadge score={100} thresholds={local.thresholds} size="sm" />
            <span style={{ fontSize:12.5 }}>No padrão acima disso</span>
          </div>
        </div>
        <button className="g5-btn g5-btn-primary" style={{ marginTop:14 }} onClick={saveGeneral}>{savedFlash ? <><Check size={15}/> Salvo</> : <><Save size={15}/> Salvar Faixas</>}</button>
      </div>

      <div className="g5-settings-section">
        <h3>Dados do Programa</h3>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:10 }}>
          <button className="g5-btn g5-btn-outline" onClick={exportAll}><FileDown size={15}/> Exportar tudo (JSON)</button>
          <button className="g5-btn g5-btn-outline" onClick={()=>fileRef.current && fileRef.current.click()}><FileUp size={15}/> Importar backup (JSON)</button>
          <input ref={fileRef} type="file" accept="application/json" className="g5-visually-hidden" onChange={handleImportFile} />
        </div>
        {importError && <p style={{ fontSize:12.5, color:"var(--red-dark)" }}>{importError}</p>}
        <p className="g5-help">A exportação inclui áreas, planos de ação, plano geral, comitê, cronograma e configurações — use como backup periódico.</p>
      </div>

      <div className="g5-settings-section">
        <h3>Zona de Risco</h3>
        <div className="g5-danger-zone">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:14, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>Restaurar dados originais do 3º Ciclo</div>
              <p style={{ fontSize:12.5, color:"var(--red-dark)", marginTop:2 }}>Apaga todas as alterações feitas na plataforma e retorna aos dados extraídos da planilha original. Não pode ser desfeito.</p>
            </div>
            <button className="g5-btn g5-btn-danger" onClick={()=>setConfirmReset(true)}><RotateCcw size={15}/> Restaurar</button>
          </div>
        </div>
      </div>

      {confirmReset && (
        <ConfirmDialog title="Restaurar dados originais?" message="Todas as áreas, itens do plano de ação, plano geral, comitê e cronograma serão substituídos pelos dados originais do 3º Ciclo. Esta ação não pode ser desfeita."
          confirmLabel="Restaurar dados originais" danger onCancel={()=>setConfirmReset(false)} onConfirm={()=>{ setConfirmReset(false); onResetAll(); }} />
      )}
    </div>
  );
}
/* ================================================================
   NAVEGAÇÃO / SHELL
   ================================================================ */
const TABS = [
  { id:"dashboard",   label:"Painel",        icon:LayoutDashboard },
  { id:"areas",       label:"Áreas",         icon:Factory },
  { id:"masterplan",  label:"Plano Geral",   icon:ListChecks },
  { id:"cronograma",  label:"Cronograma",    icon:CalendarRange },
  { id:"committee",   label:"Comitê",        icon:Users },
  { id:"settings",    label:"Configurações", icon:SettingsIcon },
];

function AppHeader({ settings, syncStatus, activeTab, onSelectTab, cicloView, onChangeCiclo, ciclosDisponiveis }){
  const isHistorico = cicloView !== "4";
  return (
    <header className="g5-header">
      <div className="g5-header-row">
        <div className="g5-brand">
          <div className="g5-brand-mark"><ShieldCheck size={22} strokeWidth={2.2}/></div>
          <div className="g5-brand-text">
            <div className="g5-brand-title">{settings.programName || "Programa 5S"}</div>
            <div className="g5-brand-sub">{settings.millName}</div>
          </div>
        </div>
        <div className="g5-header-right">
          <SyncIndicator status={syncStatus} />
          {ciclosDisponiveis && (
            <div className="g5-ciclo-switch" title="Ver outro ciclo">
              {ciclosDisponiveis.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={classNames("g5-ciclo-switch-btn", cicloView === c.id && "active")}
                  onClick={() => onChangeCiclo(c.id)}
                >{c.label}</button>
              ))}
            </div>
          )}
          <span className="g5-cycle-chip"><span className="g5-cycle-dot" /><span className="g5-cycle-text">{settings.cycleLabel}{settings.cyclePeriod ? " · " + settings.cyclePeriod : ""}</span></span>
          {isHistorico && <span className="g5-historico-badge">Histórico</span>}
        </div>
      </div>
      <nav className="g5-tabbar" style={{ margin:"12px -20px -14px", background:"transparent", borderBottom:"none" }}>
        <div className="g5-tabbar-row" style={{ padding:0 }}>
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} className={classNames("g5-tab", activeTab===t.id && "active")} onClick={()=>onSelectTab(t.id)}>
                <Icon size={15} strokeWidth={2.2}/> {t.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

/* ================================================================
   APP RAIZ
   ================================================================ */
const CICLOS_DISPONIVEIS = [
  { id: "1", label: "1º" },
  { id: "2", label: "2º" },
  { id: "3", label: "3º" },
  { id: "4", label: "4º" },
];

/* ----------------------------------------------------------------
   Compatibilidade com dados já salvos no banco em formato antigo
   (de antes do suporte a múltiplos ciclos): normaliza para o novo
   formato em toda leitura E toda escrita, então funciona não importa
   o que já esteja gravado, sem precisar de migração manual no banco.
   ---------------------------------------------------------------- */
function normalizeSettingsRaw(raw){
  if (!raw) return raw;
  if (raw.ciclos) return raw; // já no formato novo
  const seedCiclos = SEED_SETTINGS.ciclos;
  return {
    millName: raw.millName, programName: raw.programName, thresholds: raw.thresholds,
    departments: raw.departments, developedNote: raw.developedNote,
    cicloAtual: "4",
    ciclos: {
      "1": seedCiclos["1"],
      "2": seedCiclos["2"],
      "3": { label: raw.cycleLabel || seedCiclos["3"].label, period: raw.cyclePeriod || seedCiclos["3"].period, rounds: raw.rounds || seedCiclos["3"].rounds },
      "4": seedCiclos["4"],
    },
  };
}
function normalizeAreasByCycle(raw){
  if (!raw) return raw;
  if (!Array.isArray(raw)) return raw; // já no formato novo (objeto por ciclo)
  const c4 = raw.map(a => ({ id:a.id, nome:a.nome, departamento:a.departamento, lider:a.lider, auditor:a.auditor, dataFoto:null, itens:[], auditorias:{} }));
  return {
    "1": SEED_AREAS_BY_CYCLE["1"],
    "2": SEED_AREAS_BY_CYCLE["2"],
    "3": raw,
    "4": c4,
  };
}

export default function App(){
  const [areasByCycle, persistAreasByCycle, statusAreas] = useCloudCollection("g5s:areas", SEED_AREAS_BY_CYCLE);
  const [masterPlan, persistMasterPlan, statusMP] = useCloudCollection("g5s:masterplan", SEED_MASTERPLAN);
  const [committee, persistCommittee, statusCommittee] = useCloudCollection("g5s:committee", SEED_COMMITTEE);
  const [cronograma, persistCronograma, statusCronograma] = useCloudCollection("g5s:cronograma", SEED_CRONOGRAMA);
  const [settingsRaw, persistSettingsRaw, statusSettings] = useCloudCollection("g5s:settings", SEED_SETTINGS);

  // Ciclo sendo visualizado no momento (1º a 4º). Começa no 4º (o ciclo
  // corrente), mas pode ser trocado no cabeçalho para navegar o histórico.
  const [cicloView, setCicloView] = useState("4");

  // "areas" e "settings" abaixo são "fatias" derivadas do ciclo em
  // visualização — todo o resto do app (Painel, Área, Configurações etc.)
  // continua enxergando as mesmas formas de sempre (array de áreas com
  // itens/auditorias, e settings.cycleLabel/cyclePeriod/rounds), sem
  // precisar saber que agora existem 4 ciclos por trás.
  const areas = areasByCycle ? (normalizeAreasByCycle(areasByCycle)[cicloView] || []) : null;
  const settings = settingsRaw ? (() => {
    const norm = normalizeSettingsRaw(settingsRaw);
    return {
      ...norm,
      cycleLabel: norm.ciclos[cicloView].label,
      cyclePeriod: norm.ciclos[cicloView].period,
      rounds: norm.ciclos[cicloView].rounds,
    };
  })() : null;

  const persistAreas = useCallback((updater) => {
    persistAreasByCycle(prev => {
      const prevNorm = normalizeAreasByCycle(prev) || {};
      const prevForCycle = prevNorm[cicloView] || [];
      const nextForCycle = typeof updater === "function" ? updater(prevForCycle) : updater;
      return { ...prevNorm, [cicloView]: nextForCycle };
    });
  }, [persistAreasByCycle, cicloView]);

  const persistSettings = useCallback((updater) => {
    persistSettingsRaw(prev => {
      const prevNorm = normalizeSettingsRaw(prev);
      const prevView = {
        ...prevNorm,
        cycleLabel: prevNorm.ciclos[cicloView].label,
        cyclePeriod: prevNorm.ciclos[cicloView].period,
        rounds: prevNorm.ciclos[cicloView].rounds,
      };
      const nextView = typeof updater === "function" ? updater(prevView) : updater;
      const { cycleLabel, cyclePeriod, rounds, ciclos, ...rest } = nextView;
      return {
        ...prevNorm,
        ...rest,
        ciclos: { ...prevNorm.ciclos, [cicloView]: { label: cycleLabel, period: cyclePeriod, rounds } },
      };
    });
  }, [persistSettingsRaw, cicloView]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (settings && settings.millName){
      document.title = (settings.programName||"Programa 5S") + " · " + settings.millName;
    }
  }, [settings]);

  const allLoaded = areas && masterPlan && committee && cronograma && settings;
  const overallStatus = [statusAreas, statusMP, statusCommittee, statusCronograma, statusSettings].includes("error")
    ? "error"
    : [statusAreas, statusMP, statusCommittee, statusCronograma, statusSettings].includes("nostorage")
    ? "nostorage"
    : [statusAreas, statusMP, statusCommittee, statusCronograma, statusSettings].every(s => s === "ready")
    ? "ready" : "loading";

  function selectTab(tabId){
    setActiveTab(tabId);
    if (tabId !== "areas") setSelectedAreaId(null);
  }
  function openArea(id){
    setSelectedAreaId(id);
    setActiveTab("areas");
  }
  function updateArea(areaId, fn){
    persistAreas(prev => prev.map(a => a.id === areaId ? fn(a) : a));
  }
  function deleteArea(areaId){
    persistAreas(prev => prev.filter(a => a.id !== areaId));
    setSelectedAreaId(null);
  }

  function importAll(parsed){
    if (parsed.areasByCycle && typeof parsed.areasByCycle === "object") persistAreasByCycle(() => parsed.areasByCycle);
    else if (Array.isArray(parsed.areas)) persistAreas(() => parsed.areas);
    if (Array.isArray(parsed.masterPlan)) persistMasterPlan(() => parsed.masterPlan);
    if (Array.isArray(parsed.committee)) persistCommittee(() => parsed.committee);
    if (Array.isArray(parsed.cronograma)) persistCronograma(() => parsed.cronograma);
    if (parsed.settingsRaw && typeof parsed.settingsRaw === "object") persistSettingsRaw(() => parsed.settingsRaw);
    else if (parsed.settings && typeof parsed.settings === "object") persistSettings(() => parsed.settings);
    setToast("Backup importado com sucesso");
  }
  function resetAll(){
    persistAreasByCycle(() => SEED_AREAS_BY_CYCLE);
    persistMasterPlan(() => SEED_MASTERPLAN);
    persistCommittee(() => SEED_COMMITTEE);
    persistCronograma(() => SEED_CRONOGRAMA);
    persistSettingsRaw(() => SEED_SETTINGS);
    setSelectedAreaId(null);
    setToast("Dados originais restaurados (todos os ciclos)");
  }

  if (!allLoaded){
    return (
      <div className="g5-loading-screen">
        <style>{STYLES}{STYLES_B}</style>
        <Loader2 size={30} className="spin" />
        <div style={{ fontFamily:"var(--font-mono)", fontSize:13, letterSpacing:"0.05em", textTransform:"uppercase" }}>Carregando Programa 5S…</div>
      </div>
    );
  }

  const selectedArea = selectedAreaId ? areas.find(a => a.id === selectedAreaId) : null;

  return (
    <div className="g5-root">
      <style>{STYLES}{STYLES_B}</style>
      <AppHeader settings={settings} syncStatus={overallStatus} activeTab={activeTab} onSelectTab={selectTab}
        cicloView={cicloView} onChangeCiclo={setCicloView} ciclosDisponiveis={CICLOS_DISPONIVEIS} />
      <main className="g5-main">
        {activeTab === "dashboard" && (
          <DashboardView areas={areas} settings={settings} masterPlan={masterPlan} onUpdateAreas={persistAreas} onOpenArea={openArea} />
        )}
        {activeTab === "areas" && (
          selectedArea ? (
            <AreaDetailView area={selectedArea} settings={settings} onUpdateArea={updateArea} onDeleteArea={deleteArea} onBack={()=>setSelectedAreaId(null)} />
          ) : (
            <AreasListView areas={areas} settings={settings} onUpdateAreas={persistAreas} onOpenArea={openArea} />
          )
        )}
        {activeTab === "masterplan" && (
          <MasterPlanView masterPlan={masterPlan} onUpdate={persistMasterPlan} />
        )}
        {activeTab === "cronograma" && (
          <CronogramaView cronograma={cronograma} onUpdate={persistCronograma} />
        )}
        {activeTab === "committee" && (
          <CommitteeView committee={committee} settings={settings} onUpdate={persistCommittee} />
        )}
        {activeTab === "settings" && (
          <SettingsView settings={settings} onUpdateSettings={persistSettings} areas={areas} masterPlan={masterPlan}
            committee={committee} cronograma={cronograma} onImportAll={importAll} onResetAll={resetAll} />
        )}
      </main>
      {toast && <Toast message={toast} onDone={()=>setToast(null)} />}
    </div>
  );
}
