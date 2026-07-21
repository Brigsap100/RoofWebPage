/* Renders service.html from ?s= param using window.KODIAK_SERVICES */
(function () {
  var data = window.KODIAK_SERVICES || {};
  var params = new URLSearchParams(window.location.search);
  var key = params.get('s');
  var svc = data[key];

  // Unknown / missing service → send back to the services list
  if (!svc) { window.location.replace('services.html'); return; }

  function set(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }

  document.title = svc.title + ' | Kodiak Roofing & Waterproofing';
  set('svcCrumb', svc.title);
  set('svcTitle', svc.title);
  set('svcTagline', svc.tagline);
  set('svcEyebrow', 'Commercial Service');

  var bg = document.getElementById('svcBg');
  if (bg) bg.style.backgroundImage = "url('" + svc.img + "')";
  var media = document.getElementById('svcMedia');
  if (media) media.style.backgroundImage = "url('" + svc.img + "')";

  var body = document.getElementById('svcBody');
  if (body) {
    body.innerHTML = (svc.body || []).map(function (p) {
      return '<p style="color:var(--text-soft);margin-bottom:16px;font-size:1.08rem;">' + p + '</p>';
    }).join('');
  }

  var pts = document.getElementById('svcPoints');
  if (pts) {
    pts.innerHTML = (svc.points || []).map(function (p) { return '<li>' + p + '</li>'; }).join('');
  }

  // "Other services" links
  var other = document.getElementById('svcOther');
  if (other) {
    other.innerHTML = Object.keys(data).filter(function (k) { return k !== key; })
      .map(function (k) {
        return '<li style="margin-bottom:10px;"><a href="service.html?s=' + k +
               '" style="color:var(--text-soft);">' + data[k].title + ' →</a></li>';
      }).join('');
  }
})();
