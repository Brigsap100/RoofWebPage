/* ============================================================
   Kodiak CRM — shared shell: passcode gate, sidebar, helpers
   Each page sets  <body data-page="dashboard">  and includes
   <aside class="sidebar" id="sidebar"></aside>. This script fills
   the sidebar, marks the active item, wires the mobile toggle,
   and provides a drawer + small chart helpers on window.CRM.
   ============================================================ */
(function () {
  var PASSCODE = "kodiak2027"; // demo internal passcode

  var NAV = [
    { key:"dashboard", label:"Dashboard",  href:"dashboard.html", icon:'<path d="M3 13h8V3H3zM13 21h8V3h-8zM3 21h8v-6H3z"/>' },
    { key:"leads",     label:"Leads",      href:"leads.html",     icon:'<path d="M22 6l-10 7L2 6"/><rect x="2" y="4" width="20" height="16" rx="2"/>' },
    { key:"pipeline",  label:"Pipeline",   href:"pipeline.html",  icon:'<path d="M3 6h18M6 12h12M10 18h4"/>' },
    { key:"accounts",  label:"Accounts",   href:"accounts.html",  icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>' },
    { key:"projects",  label:"Projects",   href:"projects.html",  icon:'<path d="M3 7h18v13H3z"/><path d="M8 7V4h8v3"/>' },
    { key:"service",   label:"Service",    href:"service.html",   icon:'<path d="M14.7 6.3a4 4 0 0 0-5.6 5L3 17.5V21h3.5l6.2-6.1a4 4 0 0 0 5-5.6L14.5 12l-2.5-2.5z"/>' },
    { key:"workorders",label:"Work Orders",href:"workorders.html",icon:'<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M9 11h6M9 15h6"/>' },
    { key:"field",     label:"Field Mode", href:"field.html",     icon:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>' },
    { key:"roofassets",label:"Roof Assets",href:"roofassets.html",icon:'<path d="M12 2l10 6-10 6L2 8z"/><path d="M2 13l10 6 10-6"/>' },
    { key:"contracts", label:"Contracts",  href:"contracts.html", icon:'<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/><path d="M9 15a3 3 0 1 1 6 0v3H9z"/>' },
    { key:"estimates", label:"Estimates",  href:"estimates.html", icon:'<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>' },
    { key:"activities",label:"Activities", href:"activities.html",icon:'<path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/>' },
    { key:"settings",  label:"Settings",   href:"settings.html",  icon:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' }
  ];

  function buildGate() {
    if (sessionStorage.getItem("kodiakCrmAuth") === "1") return;
    var g = document.createElement("div");
    g.className = "gate";
    g.innerHTML =
      '<div class="box">' +
        '<img src="../assets/img/logo-seal.png" alt="Kodiak">' +
        '<h2>Kodiak CRM</h2>' +
        '<p>Internal access only. Enter the team passcode to continue.</p>' +
        '<div class="err" id="gateErr"></div>' +
        '<input id="gateInput" type="password" placeholder="Passcode" autocomplete="off">' +
        '<button class="btn red" id="gateBtn" style="width:100%;justify-content:center;">Enter CRM</button>' +
      '</div>';
    document.body.appendChild(g);
    document.body.style.overflow = "hidden";
    var input = g.querySelector("#gateInput");
    var err = g.querySelector("#gateErr");
    input.focus();
    function tryEnter() {
      if (input.value.trim() === PASSCODE) {
        sessionStorage.setItem("kodiakCrmAuth", "1");
        g.remove(); document.body.style.overflow = "";
      } else { err.textContent = "Incorrect passcode."; input.value = ""; input.focus(); }
    }
    g.querySelector("#gateBtn").addEventListener("click", tryEnter);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") tryEnter(); });
  }

  function buildSidebar() {
    var el = document.getElementById("sidebar");
    if (!el) return;
    var active = document.body.getAttribute("data-page");
    el.innerHTML =
      '<a class="brand" href="dashboard.html">' +
        '<img src="../assets/img/logo.png" alt="Kodiak">' +
        '<span class="n">Kodiak<small>CRM</small></span>' +
      '</a>' +
      '<nav class="nav">' +
        NAV.map(function (n) {
          return '<a class="' + (n.key === active ? "active" : "") + '" href="' + n.href + '">' +
            '<svg viewBox="0 0 24 24">' + n.icon + '</svg>' + n.label + '</a>';
        }).join("") +
      '</nav>' +
      '<div class="foot">Signed in · demo<br><a href="../hr/">HR &amp; Benefits</a> · <a href="../index.html">← Website</a></div>';
  }

  function wireMobile() {
    document.addEventListener("click", function (e) {
      if (e.target.closest(".menu-toggle")) {
        document.getElementById("sidebar").classList.toggle("open");
      } else if (!e.target.closest(".sidebar")) {
        var sb = document.getElementById("sidebar");
        if (sb) sb.classList.remove("open");
      }
    });
  }

  // ---- Public helpers ------------------------------------------------
  var drawerBg, drawer;
  function ensureDrawer() {
    if (drawer) return;
    drawerBg = document.createElement("div"); drawerBg.className = "drawer-bg";
    drawer = document.createElement("div"); drawer.className = "drawer";
    document.body.appendChild(drawerBg); document.body.appendChild(drawer);
    drawerBg.addEventListener("click", closeDrawer);
  }
  function openDrawer(html) {
    ensureDrawer(); drawer.innerHTML = html;
    requestAnimationFrame(function () { drawerBg.classList.add("open"); drawer.classList.add("open"); });
    var xb = drawer.querySelector(".x"); if (xb) xb.addEventListener("click", closeDrawer);
  }
  function closeDrawer() { if (!drawer) return; drawerBg.classList.remove("open"); drawer.classList.remove("open"); }

  window.CRM = {
    openDrawer: openDrawer, closeDrawer: closeDrawer,
    esc: function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;" }[c]; }); }
  };

  document.addEventListener("DOMContentLoaded", function () {
    buildGate(); buildSidebar(); wireMobile();
  });
})();
