/**
 * NeonCursor — Smooth physics-based custom cursor matching the motion/react component
 *
 * Main Dot:   x - 10, y - 10 | spring(damping: 20, stiffness: 400, mass: 0.5)
 * Trail Ring: x - 20, y - 20 | spring(damping: 30, stiffness: 200, mass: 0.8)
 * Glow Aura:  x - 30, y - 30 | spring(damping: 40, stiffness: 150, mass: 1.0)
 */
(function initNeonCursor() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Don't mount cursor follower on touch / pointer:coarse devices
  if (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    return;
  }

  function mountCursor() {
    // Avoid double mounting
    if (document.querySelector('.neon-cursor-container')) return;

    // Remove or neutralize legacy follower wrap
    var legacyWrap = document.querySelector('.mouse-follower-wrap');
    if (legacyWrap) {
      legacyWrap.style.display = 'none';
    }

    var container = document.createElement('div');
    container.className = 'neon-cursor-container';
    container.setAttribute('aria-hidden', 'true');
    container.style.opacity = '0'; // Hidden until first mouse move

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

    // Harmonic spring oscillators (damping, stiffness, mass)
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
      if (dt > 0.05) dt = 0.05; // Guard against large deltas (e.g. background tab)

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
        return; // Still within an interactive element
      }
      isHovering = false;
      trail.style.borderColor = 'rgb(236, 101, 23)';
      trail.style.borderWidth = '2px';
      glow.style.opacity = '0.4';
    }

    function onMouseLeaveDoc() {
      container.style.opacity = '0';
    }

    function onMouseEnterDoc() {
      if (hasMoved) {
        container.style.opacity = '1';
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('mouseout', onMouseOut, { passive: true });
    document.addEventListener('mouseleave', onMouseLeaveDoc);
    document.addEventListener('mouseenter', onMouseEnterDoc);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCursor);
  } else {
    mountCursor();
  }
})();
