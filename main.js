/* ─── Cassette ─── */
    const audio = document.getElementById('bgMusic');
    const cassetteImg = document.getElementById('cassetteImg');
    const nowPlaying = document.getElementById('nowPlaying');
    const npBars = document.getElementById('npBars');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeControl = document.getElementById('volumeControl');
    let isPlaying = false;

    volumeSlider.addEventListener('input', () => { audio.volume = volumeSlider.value / 100; });

    function toggleMusic() {
      const btn = document.getElementById('cassetteBtn');
      squish(btn);
      if (isPlaying) {
        audio.pause();
        cassetteImg.src = 'Images/cassette/cassette_static.png';
        nowPlaying.classList.remove('visible');
        volumeControl.classList.remove('visible');
        npBars.classList.add('paused');
        isPlaying = false;
      } else {
        audio.play().catch(() => { });
        cassetteImg.src = 'Images/cassette/cassette_playing.gif';
        nowPlaying.classList.add('visible');
        volumeControl.classList.add('visible');
        npBars.classList.remove('paused');
        isPlaying = true;
        spawnNotes();
      }
    }

    document.querySelectorAll('.pill-nav a').forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    function spawnNotes() {
      const notes = ['♪', '♫', '♩', '🎵', '🎶'];
      const btn = document.getElementById('cassetteBtn');
      const rect = btn.getBoundingClientRect();
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          const n = document.createElement('div');
          n.className = 'music-note';
          n.textContent = notes[Math.floor(Math.random() * notes.length)];
          const angle = (Math.random() * 160 + 180) * (Math.PI / 180);
          const dist = Math.random() * 70 + 30;
          n.style.setProperty('--nx', Math.cos(angle) * dist + 'px');
          n.style.setProperty('--ny', Math.sin(angle) * dist + 'px');
          n.style.setProperty('--nr', (Math.random() * 60 - 30) + 'deg');
          n.style.left = (rect.left + rect.width / 2) + 'px';
          n.style.top = (rect.top + rect.height / 2) + 'px';
          document.body.appendChild(n);
          setTimeout(() => n.remove(), 1200);
        }, i * 80);
      }
    }

    /* ─── Squish ─── */
    const squishSfx = new Audio('sounds/bubble pop.mp3');
    function squish(obj) {
      squishSfx.currentTime = 0;
      squishSfx.play().catch(() => { });
      obj.classList.remove('squishing');
      void obj.offsetWidth;
      obj.classList.add('squishing');
    }

    /* ─── Data stores ─── */
    let galleriesData = { pixelart: [], mspaint: [] };

    /* ─── INIT: load all JSON files in parallel ─── */
    async function initializeAll() {
      const [imagesRes, reviewsRes, newsRes] = await Promise.allSettled([
        fetch('images.json'),
        fetch('reviews.json'),
        fetch('news.json')
      ]);

      /* images.json */
      if (imagesRes.status === 'fulfilled' && imagesRes.value.ok) {
        try { galleriesData = await imagesRes.value.json(); } catch (e) { }
      }
      renderMasonry('pixelart');
      renderMasonry('mspaint');

      /* reviews.json */
      let reviewsData = [];
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value.ok) {
        try { const d = await reviewsRes.value.json(); reviewsData = d.reviews || []; } catch (e) { }
      }
      renderReviews(reviewsData);

      /* news.json */
      let newsData = [];
      if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
        try { const d = await newsRes.value.json(); newsData = d.news || []; } catch (e) { }
      }
      renderNews(newsData);
    }

    /* ─── Masonry gallery ─── */
    let modalItems = [];   // flat list of { path, caption } for current tab
    let modalIndex = 0;

    function renderMasonry(type) {
      const container = document.getElementById(type + '-tab');
      container.innerHTML = '';
      const items = galleriesData[type] || [];
      if (!items.length) {
        container.innerHTML = '<p class="gallery-empty">No images yet — add them to images.json!</p>';
        return;
      }
      items.forEach((img, idx) => {
        const pin = document.createElement('div'); pin.className = 'pin-item';
        const wrap = document.createElement('div'); wrap.className = 'pin-img-wrap';
        wrap.onclick = () => openModal(type, idx);

        const imgEl = document.createElement('img');
        imgEl.src = img.path; imgEl.alt = img.caption; imgEl.loading = 'lazy';
        imgEl.onerror = () => { pin.style.display = 'none'; };

        const overlay = document.createElement('div'); overlay.className = 'pin-hover-overlay';
        overlay.innerHTML = '<div class="pin-zoom-btn">⤢</div>';

        wrap.appendChild(imgEl); wrap.appendChild(overlay);

        const caption = document.createElement('div'); caption.className = 'pin-caption'; caption.textContent = img.caption;
        const sub = document.createElement('div'); sub.className = 'pin-sub'; sub.textContent = img.type || (type === 'pixelart' ? 'Pixel Art' : 'MS Paint');

        pin.appendChild(wrap); pin.appendChild(caption); pin.appendChild(sub);
        container.appendChild(pin);
      });
    }

    /* ─── Reviews ─── */
    function renderReviews(data) {
      const container = document.getElementById('reviewContainer');
      container.innerHTML = '';
      if (!data.length) {
        container.innerHTML = '<p style="color:#9a8060;padding:1rem">No reviews yet!</p>';
        return;
      }
      data.forEach(review => {
        const card = document.createElement('div'); card.className = 'review-card';
        const header = document.createElement('div'); header.className = 'review-header';
        const avatar = document.createElement('div'); avatar.className = 'reviewer-avatar';
        if (review.avatar && review.avatar.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
          const img = document.createElement('img');
          img.src = review.avatar;
          img.alt = review.name;
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
          img.onerror = () => { avatar.textContent = review.name.charAt(0); }; // fallback to initial
          avatar.appendChild(img);
        } else {
          avatar.textContent = review.avatar || review.name.charAt(0);
        }
        const info = document.createElement('div'); info.className = 'reviewer-info';
        const name = document.createElement('div'); name.className = 'reviewer-name'; name.textContent = review.name;
        const title = document.createElement('div'); title.className = 'reviewer-title'; title.textContent = review.title;
        info.appendChild(name); info.appendChild(title);
        if (review.date) {
          const date = document.createElement('div');
          date.style.cssText = 'font-size:.75rem;color:#b0a090;margin-top:2px;';
          date.textContent = review.date;
          info.appendChild(date);
        }
        header.appendChild(avatar); header.appendChild(info);
        const stars = document.createElement('div'); stars.className = 'review-stars';
        stars.textContent = '★'.repeat(review.stars) + '☆'.repeat(5 - review.stars);
        const text = document.createElement('div'); text.className = 'review-text'; text.textContent = review.text;
        card.appendChild(header); card.appendChild(stars); card.appendChild(text);
        container.appendChild(card);
      });
    }

    /* ─── News ─── */
    function renderNews(data) {
      const list = document.getElementById('newsList');
      list.innerHTML = '';
      if (!data.length) {
        list.innerHTML = '<p style="color:#9a8060;padding:1rem">No news yet!</p>';
        return;
      }
      data.forEach(item => {
        const div = document.createElement('div'); div.className = 'n-item';
        const date = document.createElement('div'); date.className = 'n-date'; date.textContent = item.date;
        const text = document.createElement('div'); text.className = 'n-text';
        const icon = document.createElement('i');
        icon.className = (item.icon || 'fas fa-frog') + ' frog-icon';
        icon.style.color = '#ff6b8a';
        icon.style.marginRight = '6px';
        icon.onmouseenter = function () { squish(this); };
        text.appendChild(icon);
        text.appendChild(document.createTextNode(' ' + item.text));
        div.appendChild(date); div.appendChild(text);
        list.appendChild(div);
      });
    }

    /* ─── Tab switching ─── */
    function switchTab(tabName, btn) {
      document.getElementById('mspaint-tab').style.display = 'none';
      document.getElementById('pixelart-tab').style.display = 'none';
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(tabName + '-tab').style.display = '';
      btn.classList.add('active');
    }

    /* ─── Modal (improved, centered, with arrows) ─── */
    let currentModalType = 'pixelart';

    function openModal(type, index) {
      currentModalType = type;
      modalItems = galleriesData[type] || [];
      modalIndex = index;
      showModalItem();
      document.getElementById('imageModal').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function showModalItem() {
      const item = modalItems[modalIndex];
      if (!item) return;
      const img = document.getElementById('modalImage');
      img.src = item.path;
      img.alt = item.caption || '';
      document.getElementById('modalCaption').textContent = item.caption || '';
      /* show/hide arrows */
      document.getElementById('modalPrev').style.visibility = modalIndex > 0 ? 'visible' : 'hidden';
      document.getElementById('modalNext').style.visibility = modalIndex < modalItems.length - 1 ? 'visible' : 'hidden';
    }

    function shiftModal(dir) {
      const next = modalIndex + dir;
      if (next >= 0 && next < modalItems.length) {
        modalIndex = next;
        showModalItem();
      }
    }

    function closeModal() {
      document.getElementById('imageModal').classList.remove('open');
      document.body.style.overflow = 'auto';
    }

    document.addEventListener('keydown', e => {
      if (!document.getElementById('imageModal').classList.contains('open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') shiftModal(1);
      if (e.key === 'ArrowLeft') shiftModal(-1);
    });

    /* ─── Glitter trail ─── */
    document.addEventListener('mousemove', (e) => {
      if (Math.random() > 0.8) {
        const g = document.createElement('div'); g.className = 'glitter';
        g.innerHTML = '<i class="fas fa-frog" style="color:#ff6b8a;"></i>';
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 60 + 20;
        g.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        g.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        g.style.left = e.clientX + 'px';
        g.style.top = e.clientY + 'px';
        document.body.appendChild(g);
        setTimeout(() => g.remove(), 1500);
      }
    });

    /* ─── Dark theme ─── */
    function toggleTheme() {
      document.body.classList.toggle('dark-theme');
      document.getElementById('themeBtn').textContent =
        document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
    }

    document.addEventListener('DOMContentLoaded', initializeAll);