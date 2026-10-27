/* Hero background: animated wireframe wave (three.js).
   Falls back to the existing <video> when WebGL is unavailable
   or the visitor prefers reduced motion. */
(function () {
   var header = document.getElementById('home');
   var canvas = document.getElementById('hero-canvas');
   if (!header || !canvas || typeof THREE === 'undefined') return;
   if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

   var renderer;
   try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
   } catch (e) {
      return;
   }

   var COLS = 90, ROWS = 50, SPACING = 0.5;
   var scene = new THREE.Scene();
   var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
   camera.position.set(0, 4.2, 9);
   camera.lookAt(0, 0, 0);

   var count = COLS * ROWS;
   var positions = new Float32Array(count * 3);
   for (var i = 0, x, z; i < count; i++) {
      x = (i % COLS - COLS / 2) * SPACING;
      z = (Math.floor(i / COLS) - ROWS / 2) * SPACING;
      positions[i * 3] = x;
      positions[i * 3 + 2] = z;
   }
   var geometry = new THREE.BufferGeometry();
   geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
   var indices = [];
   for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
         var n = r * COLS + c;
         if (c < COLS - 1) indices.push(n, n + 1);
         if (r < ROWS - 1) indices.push(n, n + COLS);
      }
   }
   geometry.setIndex(indices);
   var material = new THREE.LineBasicMaterial({
      color: 0x4d8fdc, transparent: true, opacity: 0.35, depthWrite: false
   });
   scene.add(new THREE.LineSegments(geometry, material));

   var mouseX = 0, mouseY = 0, visible = true;

   function resize() {
      var w = header.clientWidth, h = header.clientHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
   }
   window.addEventListener('resize', resize);
   header.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
   });
   if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
         visible = entries[0].isIntersecting;
      }).observe(header);
   }

   function frame(t) {
      requestAnimationFrame(frame);
      if (!visible) return;
      var time = t * 0.0006, p = geometry.attributes.position.array;
      for (var i = 0, x, z; i < count; i++) {
         x = p[i * 3]; z = p[i * 3 + 2];
         p[i * 3 + 1] = Math.sin(x * 0.45 + time) * 0.55 +
                        Math.cos(z * 0.5 + time * 1.3) * 0.45 +
                        Math.sin((x + z) * 0.25 + time * 0.7) * 0.3;
      }
      geometry.attributes.position.needsUpdate = true;
      camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.04;
      camera.position.y += (4.2 - mouseY * 0.6 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
   }

   resize();
   header.classList.add('has-webgl');
   requestAnimationFrame(frame);
})();
