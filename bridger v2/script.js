  // ---------- Landing <-> App stage ----------
  const landing = document.getElementById('landing');
  const appStage = document.getElementById('appStage');

  function showToast(msg, ms=3200){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._tm);
    showToast._tm = setTimeout(()=> t.classList.remove('show'), ms);
  }

  document.getElementById('btnPrototype').addEventListener('click', () => {
    landing.classList.add('hidden');
    appStage.classList.remove('hidden');
    gotoView('device');
  });
  document.getElementById('btnBackLanding').addEventListener('click', () => {
    appStage.classList.add('hidden');
    landing.classList.remove('hidden');
  });

  // ---------- View switching inside laptop ----------
  function gotoView(name){
    document.querySelectorAll('.lview').forEach(v => v.classList.toggle('active', v.dataset.view === name));
    document.querySelectorAll('.dots button').forEach(b => b.classList.toggle('active', b.dataset.goto === name));
  }
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => gotoView(el.dataset.goto));
  });

  // device card selection
  const deviceNames = { phone: 'Smartphone', laptop: 'Laptop', tablet: 'Tablet' };
  const deviceNamesEN = { phone: 'Smartphone', laptop: 'Laptop', tablet: 'Tablet' };
  document.querySelectorAll('.device-card-lg').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');

    const selectCard = () => {
      document.querySelectorAll('.device-card-lg').forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-pressed', 'false');
        c.querySelector('.check-badge')?.remove();
      });

      card.classList.add('selected');
      card.setAttribute('aria-pressed', 'true');

      if(!card.querySelector('.check-badge')){
        const b = document.createElement('div');
        b.className = 'check-badge';
        b.textContent = '✓';
        card.prepend(b);
      }

      const deviceType = card.dataset.device;
      const detectedSpan = document.querySelector('.detected-note span');
      if(detectedSpan){
        const names = currentLang === 'id' ? { phone: 'Smartphone', laptop: 'Laptop', tablet: 'Tablet' } : { phone: 'Smartphone', laptop: 'Laptop', tablet: 'Tablet' };
        const prefix = currentLang === 'id' ? 'Perangkat terdeteksi otomatis: ' : 'Detected device: ';
        detectedSpan.textContent = prefix + names[deviceType];
      }
    };

    card.addEventListener('click', selectCard);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectCard();
      }
    });
  });

  // language toggle (all instances stay in sync)
  document.querySelectorAll('[data-lang-toggle]').forEach(group => {
    group.addEventListener('click', (e) => {
      const target = e.target.closest('[data-lang]');
      if(!target) return;
      document.querySelectorAll('[data-lang-toggle] span').forEach(s => s.classList.remove('on'));
      document.querySelectorAll(`[data-lang="${target.dataset.lang}"]`).forEach(s => s.classList.add('on'));
    });
  });

  // ---------- Background star canvas ----------
  function initStars(canvas, mode){
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, stars;

    function resize(){
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = Math.max(rect.width,1) * devicePixelRatio;
      h = canvas.height = Math.max(rect.height,1) * devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      const count = mode === 'meteor'
        ? Math.max(8, Math.round((rect.width * rect.height) / 14000))
        : Math.max(12, Math.round((rect.width * rect.height) / 7000));
      stars = Array.from({length: count}, (_, index) => {
        const star = spawnStar(true);
        if(mode === 'meteor'){
          star.x = ((index + 0.5) / count) * w;
          star.y = Math.random() * h;
        }
        return star;
      });
    }

    function spawnStar(randomY){
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : -10,
        len: mode === 'meteor' ? (Math.random() * 24 + 18) * devicePixelRatio : 0,
        speed: mode === 'meteor' ? (Math.random() * 1.1 + 0.7) * devicePixelRatio : 0,
        size: (Math.random() * 1.1 + 0.6) * devicePixelRatio,
        opacity: Math.random() * 0.5 + 0.5,
        angle: Math.PI / 3.4,
        phase: Math.random() * Math.PI * 2,
        pulse: Math.random() * 1.8 + 1.2
      };
    }

    function tick(){
      ctx.clearRect(0,0,w,h);
      ctx.save();
      for(const star of stars){
        if(mode === 'meteor'){
          star.x += Math.cos(star.angle) * star.speed;
          star.y += Math.sin(star.angle) * star.speed;
          if(star.y > h + 20 || star.x > w + 20) Object.assign(star, spawnStar(false));

          const gradient = ctx.createLinearGradient(star.x, star.y, star.x - Math.cos(star.angle) * star.len, star.y - Math.sin(star.angle) * star.len);
          gradient.addColorStop(0, `rgba(220,240,255,${star.opacity * 0.8})`);
          gradient.addColorStop(1, 'rgba(220,240,255,0)');
          ctx.strokeStyle = gradient;
          ctx.lineWidth = star.size;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(star.x - Math.cos(star.angle) * star.len, star.y - Math.sin(star.angle) * star.len);
          ctx.stroke();
        }

        const twinkle = mode === 'twinkle'
          ? 0.25 + (Math.sin(performance.now() / 1000 * star.pulse + star.phase) + 1) * 0.3
          : star.opacity;
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * (mode === 'twinkle' ? 1.15 : 0.9), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);
    tick();
  }
  initStars(document.getElementById('starsLanding'), 'meteor');
  initStars(document.getElementById('starsDevice'), 'twinkle');
  initStars(document.getElementById('starsDash'), 'twinkle');

  // ---------- Simple i18n strings
  const I18N = {
    id: {
      tagline: '',
      brandmark: '<b>BRIDGER</b> · Prototype Web dan Laptop',
      brandTitle: 'BRIDGER',
      landingDesc: 'Platform cloud computing berbasis AI yang menghadirkan laptop dan PC virtual di server cloud. Jalankan game kelas konsol dan PC serta aplikasi kerja berat pada perangkat apa pun, bahkan saat koneksi seluler tidak stabil.',
      landingHint: 'Prototype ini <b>fleksibel</b>. Dapat dilihat di ponsel, laptop, maupun tablet; kontrol menyesuaikan otomatis dengan perangkat kamu.',
      badgeLaptop: '💻 Laptop',
      badgePhone: '📱 Smartphone',
      badgeTablet: '📟 Tablet',
      badgeAI: '⚡ AI Adaptive Stream',
      devicePhone: 'Smartphone',
      deviceLaptop: 'Laptop',
      deviceTablet: 'Tablet',
      btnDownload: 'Unduh Aplikasi',
      btnPrototype: 'Lihat Prototype',
      detecting: 'Mendeteksi perangkat kamu…',
      deviceTitle: 'Halo, kamu pakai apa?',
      deviceSub: 'Kami sesuaikan kontrolnya otomatis',
      detected: 'Perangkat terdeteksi otomatis: Laptop',
      startSession: 'Mulai Sesi',
      caption: '<b>Prototype interaktif Bridger versi Laptop dan Web.</b> Klik kartu perangkat, tombol "Mulai Sesi", atau salah satu aplikasi atau game untuk berpindah layar. Gunakan titik navigasi di bawah laptop untuk berpindah layar.',
      footerText: 'Bridger · Proyek Inovasi Informatika · Kelas Informatika 1',
      aboutTitle: 'About Us',
      aboutLink: 'Tentang Kami',
      aboutDescription: 'Bridger adalah prototype platform cloud computing berbasis AI yang menghadirkan pengalaman laptop dan PC virtual di cloud, agar pengguna bisa menjalankan aplikasi dan game berat di perangkat apa pun dengan performa yang lebih fleksibel.',
      aboutClose: 'Tutup',
      backToLanding: 'Kembali ke Beranda',
      dashName: 'Bridger',
      navHome: '🏠 Home',
      navLibrary: '📚 Library',
      navSettings: '⚙️ Settings',
      dashGreeting: 'Halo, mau buka apa hari ini?',
      continueSession: 'Lanjutkan Sesi',
      seeAll: 'lihat semua ›',
      appsGames: 'Aplikasi & Game',
      watermarkText: 'Bridger',
      serverStatus: 'Server: Terhubung',
      signalStreaming: 'Sinyal streaming',
      hudBack: 'Kembali',
      conn: 'Koneksi: Stabil',
      moveBind: 'W A S D',
      aimBind: 'Klik Kiri',
      shootBind: 'Klik Kanan',
      jumpBind: 'Spasi',
      crouchBind: 'Ctrl',
      runBind: 'Shift',
      reloadBind: 'R',
      moveKey: 'Bergerak',
      aimKey: 'Membidik',
      shootKey: 'Tembak',
      jumpKey: 'Lompat',
      crouchKey: 'Jongkok',
      runKey: 'Lari',
      reloadKey: 'Reload',
      aiBadge: 'AI diaktifkan: AI Upscaling untuk visual lebih tajam · AI Control Remapping untuk kontrol adaptif · AI Adaptive Compression untuk streaming lebih hemat.',
      installPrompt: 'Buka menu browser lalu pilih "Install App" / "Add to Home Screen" untuk mengunduh Bridger.',
      installSuccess: 'Bridger berhasil diunduh! ✔'
    },
    en: {
      tagline: '',
      brandmark: '<b>BRIDGER</b> · Prototype Web & Laptop',
      brandTitle: 'BRIDGER',
      landingDesc: 'AI powered cloud computing platform providing virtual laptops and PCs in the cloud. Run console grade games and heavy apps on any device, even on unstable mobile connections.',
      landingHint: 'This prototype is <b>flexible</b>. View on phone, laptop, or tablet; controls adapt automatically.',
      badgeLaptop: '💻 Laptop',
      badgePhone: '📱 Smartphone',
      badgeTablet: '📟 Tablet',
      badgeAI: '⚡ AI Adaptive Stream',
      devicePhone: 'Smartphone',
      deviceLaptop: 'Laptop',
      deviceTablet: 'Tablet',
      btnDownload: 'Install App',
      btnPrototype: 'View Prototype',
      detecting: 'Detecting your device…',
      deviceTitle: 'Which device are you using?',
      deviceSub: 'We will adapt controls automatically',
      detected: 'Detected device: Laptop',
      startSession: 'Start Session',
      caption: '<b>Interactive prototype Bridger for Laptop and Web.</b> Click a device card, the "Start Session" button, or any app or game to navigate. Use the dots under the laptop to switch screens.',
      footerText: 'Bridger · Innovation Project · CS Class 1',
      aboutTitle: 'About Us',
      aboutLink: 'About Us',
      aboutDescription: 'Bridger is an AI-powered cloud computing platform prototype that brings a virtual laptop and PC experience to the cloud, allowing users to run demanding apps and games on any device with greater flexibility.',
      aboutClose: 'Close',
      backToLanding: 'Back to Home',
      dashName: 'Bridger',
      navHome: '🏠 Home',
      navLibrary: '📚 Library',
      navSettings: '⚙️ Settings',
      dashGreeting: 'Hello, what do you want to open today?',
      continueSession: 'Continue Session',
      seeAll: 'see all ›',
      appsGames: 'Apps & Games',
      watermarkText: 'Bridger',
      serverStatus: 'Server: Connected',
      signalStreaming: 'Streaming signal',
      hudBack: 'Back',
      conn: 'Connection: Stable',
      moveBind: 'W A S D',
      aimBind: 'Left Click',
      shootBind: 'Right Click',
      jumpBind: 'Space',
      crouchBind: 'Ctrl',
      runBind: 'Shift',
      reloadBind: 'R',
      moveKey: 'Move',
      aimKey: 'Aim',
      shootKey: 'Shoot',
      jumpKey: 'Jump',
      crouchKey: 'Crouch',
      runKey: 'Run',
      reloadKey: 'Reload',
      aiBadge: 'AI enabled: AI Upscaling for sharper visuals · AI Control Remapping for adaptive controls · AI Adaptive Compression for more efficient streaming.',
      installPrompt: 'Open the browser menu and choose "Install App" or "Add to Home Screen" to install Bridger.',
      installSuccess: 'Bridger installed! ✔'
    }
  };

  let currentLang = localStorage.getItem('bridger-lang') || 'id';

  function setLanguage(lang){
    currentLang = lang;
    localStorage.setItem('bridger-lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if(!key) return;
      const txt = (I18N[lang] && I18N[lang][key]) ? I18N[lang][key] : '';
      el.innerHTML = txt;
    });
    // mark toggle
    document.querySelectorAll('[data-lang-toggle] span').forEach(s => s.classList.toggle('on', s.dataset.lang === lang));
  }

  // init language from saved preference or default (ID)
  setLanguage(currentLang);

  // wire footer About link to show about view
  document.querySelectorAll('.js-about-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showAbout();
    });
  });

  // About view creation and navigation
  function showAbout(){
    let about = document.getElementById('aboutView');
    if(!about){
      about = document.createElement('div');
      about.id = 'aboutView';
      about.className = 'about-overlay';
      const t = I18N[currentLang] || I18N['id'];
      about.innerHTML = `
        <div class="about-page">
          <div class="about-header">
            <h2>${t.aboutTitle}</h2>
            <button id="aboutClose" class="about-close" aria-label="Close">✕</button>
          </div>

          <div class="about-section">
            <p data-i18n="aboutDescription">${t.aboutDescription}</p>
            <div class="about-branding" aria-label="Latenzy">
              <img class="about-logo" src="Latenzy_logo.svg" alt="Latenzy logo">
              <img class="about-wordmark" src="Latenzy_txt.svg" alt="Latenzy">
            </div>
          </div>

          <div class="about-section about-names">
            <div class="member-grid">
              <div class="member-card"><img src="johan.svg" alt="Johanes Padmo Tyas Sugiharto"><span>Johanes Padmo Tyas Sugiharto</span></div>
              <div class="member-card"><img src="ael.svg" alt="Jeremy Parasian F. S"><span>Jeremy Parasian F. S</span></div>
              <div class="member-card"><img src="oliver.svg" alt="Oliver Rinaldi"><span>Oliver Rinaldi</span></div>
              <div class="member-card"><img src="ovung.svg" alt="Rafael Bintang P"><span>Rafael Bintang P</span></div>
              <div class="member-card"><img src="zander.svg" alt="Zander Alevy Tangan"><span>Zander Alevy Tangan</span></div>
            </div>
          </div>

          <div class="about-actions">
            <button id="aboutClose2" class="btn-primary-lg" style="padding:10px 18px;">${t.aboutClose}</button>
          </div>
        </div>
      `;
      document.body.appendChild(about);
      document.getElementById('aboutClose').addEventListener('click', () => about.remove());
      document.getElementById('aboutClose2').addEventListener('click', () => about.remove());
    }
  }

  // make language toggles functional (global) - also update detected device text
  document.querySelectorAll('[data-lang-toggle]').forEach(group => {
    group.addEventListener('click', (e) => {
      const target = e.target.closest('[data-lang]');
      if(!target) return;
      const lang = target.dataset.lang;
      setLanguage(lang);
    });
  });

  // ---------- PWA install prompt ----------
  let deferredPrompt;
  let isPWAAvailable = false;
  
  console.log('🔍 PWA Setup: Checking conditions...');
  console.log('📱 User Agent:', navigator.userAgent);
  console.log('🔒 Protocol:', window.location.protocol);
  console.log('🌐 Hostname:', window.location.hostname);
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    isPWAAvailable = true;
    console.log('✅ beforeinstallprompt event fired - PWA is installable!');
    // Make button more prominent when PWA is available
    const btn = document.getElementById('btnDownload');
    if(btn) btn.style.boxShadow = '0 12px 30px rgba(53,214,224,.42)';
  });
  
  // Fallback: Show PWA not available message if timeout
  setTimeout(() => {
    if(!isPWAAvailable){
      console.log('⚠️ PWA not available (timeout). Browser may not support PWA or requirements not met.');
      console.log('📌 Requirements: HTTPS (or localhost) + Service Worker + Manifest + Icons');
    }
  }, 3000);
  
  document.getElementById('btnDownload').addEventListener('click', async () => {
    const t = I18N[currentLang] || I18N['id'];
    
    if(deferredPrompt){
      console.log('💾 Showing PWA install prompt...');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`🎯 User response: ${outcome}`);
      deferredPrompt = null;
      return;
    }
    
    // Fallback: create a downloadable ZIP of core app files
    console.log('📦 Using fallback: Creating downloadable ZIP...');
    try{
      showToast('Preparing download...');
      // load JSZip if not loaded
      if(typeof JSZip === 'undefined'){
        await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js';
          s.onload = res; s.onerror = rej; document.head.appendChild(s);
        });
      }
      const zip = new JSZip();
      const files = ['./index.html','./manifest.json','./sw.js','./BG1.png','./icons/1.svg','./icons/2.svg'];
      for(const f of files){
        try{
          const resp = await fetch(f);
          if(!resp.ok) continue;
          const blob = await resp.blob();
          const name = f.startsWith('./') ? f.slice(2) : f;
          zip.file(name, blob);
        }catch(e){ console.warn(`⚠️ Skipping ${f}:`, e.message); }
      }
      const content = await zip.generateAsync({type:'blob'});
      const url = URL.createObjectURL(content);
      const a = document.createElement('a'); a.href = url; a.download = 'kifusuru-pwa.zip'; document.body.appendChild(a); a.click(); a.remove();
      console.log('✅ ZIP download started');
      showToast(t.installSuccess, 3000);
    }catch(err){
      console.error('❌ Download error:', err);
      showToast(t.installPrompt, 4000);
    }
  });
  
  window.addEventListener('appinstalled', () => { 
    const t = I18N[currentLang] || I18N['id']; 
    console.log('🎉 App installed successfully!');
    showToast(t.installSuccess); 
  });

  // ---------- Service worker registration ----------
  if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then((reg) => {
          console.log('✅ Service Worker registered:', reg);
        })
        .catch((err) => {
          console.error('❌ Service Worker registration failed:', err);
        });
    });
  }

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js', { scope: './' })
    .then(() => console.log('Service Worker Registered'))
    .catch((error) => console.error('Service Worker Error:', error));
}