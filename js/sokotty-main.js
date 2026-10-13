/**
 * Sokotty Voyages — Interactive Enhancements
 */
document.addEventListener('DOMContentLoaded', function () {
  // 1. Language switcher handling
  var switchers = document.querySelectorAll('.lang-switcher');
  switchers.forEach(function (switcher) {
    var toggle = switcher.querySelector('.lang-switcher-toggle');
    if (toggle) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var wasOpen = switcher.classList.contains('open');
        document.querySelectorAll('.lang-switcher.open').forEach(function (el) {
          el.classList.remove('open');
        });
        if (!wasOpen) {
          switcher.classList.add('open');
        }
      });
    }
  });

  document.addEventListener('click', function () {
    document.querySelectorAll('.lang-switcher.open').forEach(function (el) {
      el.classList.remove('open');
    });
  });

  // 2. Header shadow & border enhancement on scroll
  var header = document.querySelector('.header-section');
  if (header) {
    var checkScroll = function () {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
  }

  // 3. Smooth scroll for internal hashes
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href && href.length > 1) {
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // 4. Mount NeonCursor (spring-physics custom cursor)
  (function initNeonCursor() {
    if (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      return;
    }
    if (document.querySelector('.neon-cursor-container')) return;

    var legacyWrap = document.querySelector('.mouse-follower-wrap');
    if (legacyWrap) {
      legacyWrap.style.display = 'none';
    }

    var container = document.createElement('div');
    container.className = 'neon-cursor-container';
    container.setAttribute('aria-hidden', 'true');
    container.style.opacity = '0';

    var glow = document.createElement('div');
    glow.className = 'cursor-glow';

    var trail = document.createElement('div');
    trail.className = 'cursor-trail';

    var main = document.createElement('div');
    main.className = 'cursor-main';

    container.appendChild(glow);
    container.appendChild(trail);
    container.appendChild(main);
    document.body.appendChild(container);

    var targetX = 0;
    var targetY = 0;
    var isClicking = false;
    var isHovering = false;
    var hasMoved = false;

    var mainSpring = { x: 0, y: 0, vx: 0, vy: 0, stiffness: 400, damping: 20, mass: 0.5 };
    var trailSpring = { x: 0, y: 0, vx: 0, vy: 0, stiffness: 200, damping: 30, mass: 0.8 };
    var glowSpring = { x: 0, y: 0, vx: 0, vy: 0, stiffness: 150, damping: 40, mass: 1.0 };

    function stepSpring(s, tx, ty, dt) {
      var fx = -s.stiffness * (s.x - tx) - s.damping * s.vx;
      var ax = fx / s.mass;
      s.vx += ax * dt;
      s.x += s.vx * dt;

      var fy = -s.stiffness * (s.y - ty) - s.damping * s.vy;
      var ay = fy / s.mass;
      s.vy += ay * dt;
      s.y += s.vy * dt;
    }

    var lastTime = performance.now();

    function renderLoop(now) {
      var dt = (now - lastTime) / 1000;
      lastTime = now;
      if (dt > 0.05) dt = 0.05;

      if (hasMoved) {
        stepSpring(mainSpring, targetX, targetY, dt);
        stepSpring(trailSpring, targetX, targetY, dt);
        stepSpring(glowSpring, targetX, targetY, dt);

        var mainScale = isClicking ? 0.8 : (isHovering ? 1.2 : 1);
        main.style.transform = 'translate3d(' + (mainSpring.x - 10).toFixed(2) + 'px,' + (mainSpring.y - 10).toFixed(2) + 'px,0) scale(' + mainScale + ')';

        var trailScale = isHovering ? 1.5 : 1;
        trail.style.transform = 'translate3d(' + (trailSpring.x - 20).toFixed(2) + 'px,' + (trailSpring.y - 20).toFixed(2) + 'px,0) scale(' + trailScale + ')';

        var glowScale = isHovering ? 2 : 1;
        glow.style.transform = 'translate3d(' + (glowSpring.x - 30).toFixed(2) + 'px,' + (glowSpring.y - 30).toFixed(2) + 'px,0) scale(' + glowScale + ')';
      }

      requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);

    function onMouseMove(e) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        mainSpring.x = targetX;
        mainSpring.y = targetY;
        trailSpring.x = targetX;
        trailSpring.y = targetY;
        glowSpring.x = targetX;
        glowSpring.y = targetY;
        container.style.opacity = '1';
      }
    }

    function onMouseDown() {
      isClicking = true;
    }

    function onMouseUp() {
      isClicking = false;
    }

    var interactiveSelector = 'a, button, input, select, textarea, [data-hover="true"], [role="button"], .w-button, .w-nav-link';

    function onMouseOver(e) {
      var target = e.target;
      if (target && (target.matches(interactiveSelector) || target.closest(interactiveSelector))) {
        isHovering = true;
        trail.style.borderColor = 'rgb(255, 150, 50)';
        trail.style.borderWidth = '3px';
        glow.style.opacity = '0.8';
      }
    }

    function onMouseOut(e) {
      var rel = e.relatedTarget;
      if (rel && (rel.matches(interactiveSelector) || rel.closest(interactiveSelector))) {
        return;
      }
      isHovering = false;
      trail.style.borderColor = 'rgb(236, 101, 23)';
      trail.style.borderWidth = '2px';
      glow.style.opacity = '0.4';
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('mouseout', onMouseOut, { passive: true });
    document.addEventListener('mouseleave', function () { container.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { if (hasMoved) container.style.opacity = '1'; });
  })();
});

