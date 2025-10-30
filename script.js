// Single-page navigation + gallery + objects modal + contact form
(() => {
  // elementy nagłówka (do offsetu przy scroll)
  const header = document.getElementById('siteHeader');
  function getHeaderHeight(){ return header ? header.offsetHeight : 72; }

  // ---- smooth scroll z uwzględnieniem stałego nagłówka ----
  document.querySelectorAll('.main-nav a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.getAttribute('href').replace('#','');
      const el = document.getElementById(id);
      if(!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - getHeaderHeight() + 2;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---- aktywacja linków w nav podczas scrollowania ----
  const sections = Array.from(document.querySelectorAll('.section'));
  const navLinks = Array.from(document.querySelectorAll('.main-nav a'));

  function onScroll(){
    const mid = window.scrollY + window.innerHeight / 2;
    let current = sections[0];
    for(const s of sections){
      if(s.offsetTop - getHeaderHeight() <= mid) current = s;
    }
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#'+current.id));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // ---- GAMES: przyciski zmieniają preview z łagodnym fade ----
  const gameButtons = Array.from(document.querySelectorAll('.thumb-btn'));
  const preview = document.getElementById('preview');
  if(preview && gameButtons.length){
    // przygotuj przejście
    preview.style.transition = 'opacity 180ms ease';
    function setActive(btn){
      if(!btn) return;
      gameButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const newSrc = btn.dataset.src;
      if(!newSrc) return;
      // fade: ustaw opacity 0, zmień obraz po załadowaniu nowego źródła
      preview.style.opacity = 0;
      const tmp = new Image();
      tmp.onload = () => {
        preview.src = newSrc;
        // małe opóźnienie by obraz miał czas się ustawić
        requestAnimationFrame(()=> requestAnimationFrame(()=> preview.style.opacity = 1));
      };
      tmp.src = newSrc;
    }
    gameButtons.forEach(b => b.addEventListener('click', () => setActive(b)));
  }

  // ---- OBJECTS: modal z możliwością przewijania wielu zdjęć ----
  const objs = Array.from(document.querySelectorAll('.obj'));
  const modal = document.getElementById('objModal');
  const modalImage = document.getElementById('modalImage');
  const modalCaption = document.getElementById('modalCaption');
  const modalClose = document.getElementById('modalClose');
  const modalPrev = document.getElementById('modalPrev');
  const modalNext = document.getElementById('modalNext');

  let gallery = [];
  let idx = 0;

  function openModal(images, start=0){
    gallery = Array.isArray(images) ? images.slice() : [];
    if(!gallery.length) return;
    idx = Math.max(0, Math.min(start, gallery.length-1));
    modalImage.style.opacity = 0;
    // preload then show
    const tmp = new Image();
    tmp.onload = () => {
      modalImage.src = gallery[idx];
      modalCaption.textContent = `${idx+1} / ${gallery.length}`;
      modal.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(()=> requestAnimationFrame(()=> modalImage.style.opacity = 1));
    };
    tmp.src = gallery[idx];
  }

  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  function showIndex(i){
    if(!gallery.length) return;
    idx = (i + gallery.length) % gallery.length;
    modalImage.style.opacity = 0;
    const tmp = new Image();
    tmp.onload = () => {
      modalImage.src = gallery[idx];
      modalCaption.textContent = `${idx+1} / ${gallery.length}`;
      requestAnimationFrame(()=> requestAnimationFrame(()=> modalImage.style.opacity = 1));
    };
    tmp.src = gallery[idx];
  }

  // attach click on each object
  objs.forEach(o => {
    o.addEventListener('click', () => {
      const raw = o.dataset.images || '';
      const imgs = raw.split(',').map(s => s.trim()).filter(Boolean);
      if(!imgs.length) return;
      openModal(imgs, 0);
    });
  });

  // modal controls (safety checks)
  if(modalClose) modalClose.addEventListener('click', closeModal);
  if(modalPrev) modalPrev.addEventListener('click', () => showIndex(idx - 1));
  if(modalNext) modalNext.addEventListener('click', () => showIndex(idx + 1));

  // keyboard navigation
  document.addEventListener('keydown', (e) => {
    if(!modal || modal.getAttribute('aria-hidden') === 'true') return;
    if(e.key === 'ArrowLeft') showIndex(idx - 1);
    if(e.key === 'ArrowRight') showIndex(idx + 1);
    if(e.key === 'Escape') closeModal();
  });

  // click outside content closes modal
  if(modal){
    modal.addEventListener('click', (e) => {
      if(e.target === modal) closeModal();
    });
  }

  // ---- prosty handler formularza (symulacja) ----
  const form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // jeśli chcesz - podmień poniższy fragment na fetch('/endpoint', {method:'POST', body:...})
      const submitBtn = form.querySelector('button[type="submit"]');
      if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Wysyłanie...';
      }
      setTimeout(()=>{
        alert('Dziękuję — wiadomość została wysłana (symulacja).');
        form.reset();
        if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = 'Wyślij'; }
      }, 700);
    });
  }

  // update header-offset-aware stuff when resizing
  window.addEventListener('resize', () => {
    // nothing to recalc right now besides onScroll
    onScroll();
  });

})();
