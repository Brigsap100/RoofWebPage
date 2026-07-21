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
    { key:"pipeline",  label:"Pipeline",   href:"pipeline.html",  icon:'<path d="M3 6h18M6 12h12M10 18h4"/>' },
    { key:"accounts",  label:"Accounts",   href:"accounts.html",  icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>' },
    { key:"projects",  label:"Projects",   href:"projects.html",  icon:'<path d="M3 7h18v13H3z"/><path d="M8 7V4h8v3"/>' },
    { key:"estimates", label:"Estimates",  href:"estimates.html", icon:'<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>' },
    { key:"activities",label:"Activities", href:"activities.html",icon:'<path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/>' }
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
      '<div class="foot">Signed in · demo<br><a href="../index.html">← Back to website</a></div>';
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
