/* Kodiak site — shared behavior: sticky header, mobile menu,
   scroll reveals, animated counters */
(function () {
  var hdr = document.querySelector('header.site');
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('scrolled', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.querySelector('nav.main');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // Scroll reveal
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // Animated counters (elements with data-count)
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var dur = 1400, start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var val = Math.floor((0.5 - Math.cos(p * Math.PI) / 2) * target);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(step); else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  // Lead intake — POST submissions to the CRM, then always show the
  // confirmation note (never block the user, even if the request fails).
  function val(id) { var el = document.getElementById(id); return el ? el.value : ''; }

  function submitLead(payload) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 4000);
    return fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    }).finally(function () { clearTimeout(timer); });
  }

  function wireLeadForm(formId, noteId, buildPayload) {
    var form = document.getElementById(formId);
    if (!form) return;
    var inFlight = false;
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (inFlight) return; // ignore double submits (e.g. a second Enter press)
      inFlight = true;
      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      var settle = function () {
        inFlight = false;
        if (btn) btn.disabled = false;
      };
      var done = function () {
        var note = document.getElementById(noteId);
        if (note) note.style.display = 'block';
        form.reset();
      };
      try {
        submitLead(buildPayload()).then(done, done).finally(settle);
      } catch (e) {
        done();
        settle();
      }
    });
  }

  // Contact form → CRM lead intake
  wireLeadForm('quoteForm', 'formNote', function () {
    return {
      source: 'website-contact',
      name: val('name'),
      company: val('company'),
      email: val('email'),
      phone: val('phone'),
      service: val('service'),
      position: '',
      message: val('message')
    };
  });

  // Careers application → CRM lead intake
  wireLeadForm('careersForm', 'careersNote', function () {
    return {
      source: 'careers-application',
      name: val('name'),
      company: '',
      email: val('email'),
      phone: val('phone'),
      service: '',
      position: val('position'),
      message: val('message')
    };
  });
})();
