/* ============================================================
   Watch Anime 06 — script.js
   Vanilla JS: data, rendering, filtering, modal + player
   ============================================================ */

const ANILIST_API = 'https://graphql.anilist.co';
const PLAYER_BASE = 'https://megavid.buzz'; // third-party embed: /ani/{anilistId}/{episode}/{sub|dub}
const GENRES = ['All', 'Action', 'Adventure', 'Fantasy', 'Romance', 'Comedy', 'Drama', 'Sci-Fi', 'Slice of Life', 'Sports', 'Mystery'];
const VIEWS = ['Discover', 'Browse', 'My List'];
const PAGE_SIZE = 24;

/* ---------------- Icons (inline SVG) ---------------- */
const ICON_PATHS = {
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  menu: '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-down': '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  shuffle: '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
  sliders: '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  clapperboard: '<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
};

function icon(name, size = 20, fill = false) {
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="${fill ? 3 : 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;
}

/* ---------------- Fallback catalog (used when API unavailable) ---------------- */
const FALLBACK_NAMES = `Attack on Titan|Death Note|Fullmetal Alchemist: Brotherhood|One Piece|Naruto|Naruto: Shippuden|Demon Slayer: Kimetsu no Yaiba|Jujutsu Kaisen|Chainsaw Man|My Hero Academia|Hunter x Hunter|One Punch Man|Mob Psycho 100|Tokyo Ghoul|Sword Art Online|Spy x Family|Blue Lock|Haikyu!!|Dr. Stone|Black Clover|Bleach|Dragon Ball Z|Dragon Ball Super|Code Geass|Steins;Gate|Cowboy Bebop|Neon Genesis Evangelion|Vinland Saga|Solo Leveling|Frieren: Beyond Journey's End|The Apothecary Diaries|Bungo Stray Dogs|JoJo's Bizarre Adventure|The Promised Neverland|Parasyte: The Maxim|Re:ZERO -Starting Life in Another World-|KonoSuba|Overlord|That Time I Got Reincarnated as a Slime|Mushoku Tensei: Jobless Reincarnation|The Rising of the Shield Hero|No Game No Life|Fate/Zero|Fate/stay night: Unlimited Blade Works|Fate/stay night: Heaven's Feel|Violet Evergarden|Your Lie in April|A Silent Voice|Your Name.|Weathering With You|Suzume|Spirited Away|Howl's Moving Castle|Princess Mononoke|My Neighbor Totoro|Kiki's Delivery Service|Ponyo|The Boy and the Heron|Akira|Ghost in the Shell|Cyberpunk: Edgerunners|Psycho-Pass|86 Eighty-Six|Gurren Lagann|Kill la Kill|Darling in the Franxx|Made in Abyss|Puella Magi Madoka Magica|Erased|Monster|Pluto|Odd Taxi|The Tatami Galaxy|Samurai Champloo|Trigun|Trigun Stampede|Hellsing Ultimate|Berserk|Claymore|Dororo|Golden Kamuy|Kingdom|Ranking of Kings|To Your Eternity|The Ancient Magus' Bride|Noragami|Fire Force|Soul Eater|Fairy Tail|The Seven Deadly Sins|Magi: The Labyrinth of Magic|Assassination Classroom|Classroom of the Elite|Kaguya-sama: Love Is War|Horimiya|Toradora!|Clannad|Fruits Basket|Nana|Komi Can't Communicate|My Dress-Up Darling|Oshi no Ko|Bocchi the Rock!|K-On!|Sound! Euphonium|Banana Fish|Given|Yuri!!! on Ice|SK8 the Infinity|Free!|Kuroko's Basketball|Slam Dunk|Hajime no Ippo|Baki|The Disastrous Life of Saiki K.|Gintama|Nichijou|The Devil is a Part-Timer!|Food Wars!|Beastars|Dorohedoro|Devilman Crybaby|Castlevania|Great Pretender|Carole & Tuesday|Vivy: Fluorite Eye's Song|Lycoris Recoil|The Eminence in Shadow|The Dangers in My Heart|Delicious in Dungeon|Kaiju No. 8|Wind Breaker|Hell's Paradise|Undead Unluck|Mashle: Magic and Muscles|Zom 100: Bucket List of the Dead|Blue Exorcist|D.Gray-man|Inuyasha|Rurouni Kenshin|Yu Yu Hakusho|The Quintessential Quintuplets|Rent-a-Girlfriend|The Angel Next Door Spoils Me Rotten|Skip and Loafer|A Sign of Affection|The Case Study of Vanitas|The Garden of Words|5 Centimeters per Second|The Girl Who Leapt Through Time|Paprika|Perfect Blue`;

const FALLBACK_ANIME = FALLBACK_NAMES.split('|').map((name, index) => ({
  id: -(index + 1),
  title: { romaji: name },
  averageScore: 77 + (index % 17),
  genres: [['Action', 'Adventure', 'Fantasy', 'Drama', 'Romance', 'Comedy', 'Sci-Fi'][index % 7]],
  format: index % 9 === 0 ? 'MOVIE' : 'TV',
  seasonYear: 2024 - (index % 22),
}));

/* ---------------- State ---------------- */
const state = {
  anime: FALLBACK_ANIME,
  loading: true,
  search: '',
  genre: 'All',
  sort: 'Popular',
  view: 'Discover',
  visible: PAGE_SIZE,
  trendingOffset: 0,
  savedIds: loadSaved(),
  selected: null,
  tab: 'episodes',
  episode: 1,
  audio: 'sub',
};

function loadSaved() {
  try { return JSON.parse(localStorage.getItem('wa06-list') || '[]'); } catch { return []; }
}
function persistSaved() { localStorage.setItem('wa06-list', JSON.stringify(state.savedIds)); }

/* ---------------- Helpers ---------------- */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const titleOf = (anime) => anime.title.english || anime.title.romaji;
const posterOf = (anime) => anime.coverImage?.extraLarge || anime.coverImage?.large || '';
const stripHtml = (text) => text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const isSaved = (id) => state.savedIds.includes(id);
const findAnime = (id) => state.anime.find((item) => item.id === id);
const formatLabel = (anime) => (anime.format === 'MOVIE' ? 'Movie' : anime.episodes ? `${anime.episodes} eps` : anime.format || 'Series');

/* ---------------- Data ---------------- */
const QUERY = `query ($page: Int) {
  Page(page: $page, perPage: 50) {
    media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
      id title { romaji english } coverImage { extraLarge large } bannerImage
      description(asHtml: false) averageScore genres episodes format seasonYear
      trailer { id site thumbnail } externalLinks { site url type }
    }
  }
}`;

async function fetchPage(page) {
  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { page } }),
  });
  if (!response.ok) throw new Error('Catalog unavailable');
  const result = await response.json();
  if (result.errors) throw new Error('Catalog unavailable');
  return result.data.Page.media;
}

async function loadCatalog() {
  const results = await Promise.allSettled([fetchPage(1), fetchPage(2), fetchPage(3)]);
  const fetched = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  if (fetched.length) {
    const unique = Array.from(new Map(fetched.map((item) => [item.id, item])).values());
    if (unique.length >= 100) {
      state.anime = unique;
    } else {
      const known = new Set(unique.flatMap((item) => [item.title.romaji, item.title.english].filter(Boolean).map((t) => t.toLowerCase())));
      state.anime = [...unique, ...FALLBACK_ANIME.filter((item) => !known.has(item.title.romaji.toLowerCase()))];
    }
  }
  state.loading = false;
  renderTrending();
  renderCatalog();
}

/* ---------------- Reveal-on-scroll animation ---------------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const index = Number(el.dataset.index || 0);
    el.style.transitionDelay = `${Math.min(index % 6, 5) * 45}ms`;
    el.classList.add('show');
    revealObserver.unobserve(el);
  });
}, { rootMargin: '-40px 0px' });

function observeReveals(root) {
  $$('.poster-item', root).forEach((el) => revealObserver.observe(el));
}

/* ---------------- Templates ---------------- */
function posterTemplate(anime, index) {
  const title = escapeHtml(titleOf(anime));
  const poster = posterOf(anime);
  const saved = isSaved(anime.id);
  const art = poster
    ? `<img src="${escapeHtml(poster)}" alt="${title} poster" loading="lazy" />`
    : `<div class="poster-placeholder poster-tone-${Math.abs(anime.id) % 6}"><span>${title}</span></div>`;
  const rating = anime.averageScore ? `<span class="poster-rating">${icon('star', 11, true)} ${(anime.averageScore / 10).toFixed(1)}</span>` : '';
  return `
    <article class="poster-item" data-index="${index}">
      <button class="poster-art" data-action="open" data-id="${anime.id}" aria-label="View ${title}">
        ${art}
        <span class="poster-shade"></span>
        <span class="poster-play">${icon('play', 21, true)}</span>
        ${rating}
      </button>
      <div class="poster-info">
        <button class="poster-title" data-action="open" data-id="${anime.id}" title="${title}">${title}</button>
        <button class="poster-save ${saved ? 'is-saved' : ''}" data-action="save" data-id="${anime.id}" aria-label="${saved ? 'Remove' : 'Add'} ${title} ${saved ? 'from' : 'to'} My List">${icon('bookmark', 17, saved)}</button>
      </div>
      <p class="poster-meta">${anime.seasonYear || 'Anime'} <span>·</span> ${formatLabel(anime)}</p>
    </article>`;
}

/* ---------------- Rendering ---------------- */
function getFiltered() {
  const needle = state.search.trim().toLowerCase();
  let result = state.anime.filter((item) =>
    (state.view !== 'My List' || isSaved(item.id)) &&
    (state.genre === 'All' || item.genres?.includes(state.genre)) &&
    (!needle || `${item.title.romaji} ${item.title.english || ''}`.toLowerCase().includes(needle)));
  if (state.sort === 'Top rated') result = [...result].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
  if (state.sort === 'Newest') result = [...result].sort((a, b) => (b.seasonYear || 0) - (a.seasonYear || 0));
  if (state.sort === 'A to Z') result = [...result].sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
  return result;
}

function renderTrending() {
  const grid = $('#trending-grid');
  const items = state.anime.slice(state.trendingOffset, state.trendingOffset + 8);
  grid.innerHTML = items.map(posterTemplate).join('');
  observeReveals(grid);
  $('#trend-prev').disabled = state.trendingOffset === 0;
  $('#trend-next').disabled = state.trendingOffset >= state.anime.length - 8;
}

function renderGenres() {
  $('#genre-scroll').innerHTML = GENRES.map((g) => `<button data-action="genre" data-genre="${g}" class="${state.genre === g ? 'genre-active' : ''}">${g}</button>`).join('');
}

function renderCatalog() {
  const filtered = getFiltered();
  const heading = $('#catalog-heading');
  const description = $('#catalog-description');
  if (state.view === 'My List') {
    heading.textContent = 'Your list.';
    description.textContent = 'All the stories you saved for later.';
  } else if (state.search.trim()) {
    heading.textContent = 'Search results.';
    description.textContent = `Showing matches for "${state.search.trim()}"`;
  } else {
    heading.textContent = 'Find your next favorite.';
    description.textContent = 'From all-time classics to your next obsession.';
  }
  $('#catalog-count').textContent = `${filtered.length}${state.loading ? '+' : ''} TITLES`;

  const body = $('#catalog-body');
  if (!filtered.length) {
    const mine = state.view === 'My List';
    body.innerHTML = `
      <div class="empty-state">
        ${icon('heart', 32)}
        <h3>${mine ? 'Your list is waiting.' : 'No anime found.'}</h3>
        <p>${mine ? 'Save titles you love with the bookmark icon and find them here.' : 'Try another search or genre to find your next story.'}</p>
        <button data-action="reset">Explore anime ${icon('arrow-right', 16)}</button>
      </div>`;
    return;
  }
  const shown = filtered.slice(0, state.visible);
  body.innerHTML = `
    <div class="catalog-grid">${shown.map(posterTemplate).join('')}</div>
    ${state.visible < filtered.length ? `
      <div class="load-more">
        <button data-action="load-more">Explore more anime ${icon('arrow-down', 17)}</button>
        <span>SHOWING ${shown.length} OF ${filtered.length}</span>
      </div>` : ''}`;
  observeReveals(body);
}

function renderNav() {
  $$('#desktop-nav button').forEach((btn) => btn.classList.toggle('nav-active', btn.dataset.view === state.view));
}

function updateSaveButtons(id) {
  const saved = isSaved(id);
  const anime = findAnime(id);
  const title = anime ? titleOf(anime) : '';
  $$(`.poster-save[data-id="${id}"]`).forEach((btn) => {
    btn.classList.toggle('is-saved', saved);
    btn.innerHTML = icon('bookmark', 17, saved);
    btn.setAttribute('aria-label', `${saved ? 'Remove' : 'Add'} ${title} ${saved ? 'from' : 'to'} My List`);
  });
  const detailBtn = $('.detail-save');
  if (detailBtn && state.selected?.id === id) {
    detailBtn.classList.toggle('is-saved', saved);
    detailBtn.innerHTML = `${icon(saved ? 'check' : 'bookmark', 17)} ${saved ? 'Added to My List' : 'Add to My List'}`;
  }
}

/* ---------------- Modal / Player ---------------- */
function openModal(anime) {
  state.selected = anime;
  state.tab = anime.id > 0 ? 'episodes' : 'preview';
  state.episode = 1;
  state.audio = 'sub';
  document.body.classList.add('modal-open');
  renderModal();
}

function closeModal() {
  const backdrop = $('.modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.add('closing');
  const finish = () => {
    $('#modal-root').innerHTML = '';
    document.body.classList.remove('modal-open');
    state.selected = null;
  };
  backdrop.addEventListener('animationend', finish, { once: true });
  setTimeout(finish, 300);
}

function playerPanel(anime) {
  const art = anime.bannerImage || posterOf(anime) || '/images/hero-anime.jpg';
  const title = escapeHtml(titleOf(anime));

  if (state.tab === 'episodes') {
    const total = anime.episodes || 0;
    const src = `${PLAYER_BASE}/ani/${anime.id}/${state.episode}/${state.audio}?color=%23a777f0`;
    return `
      <div class="player-panel">
        <div class="episode-toolbar">
          <span>EPISODE <strong>${state.episode}</strong>${total ? ` / ${total}` : ''}</span>
          <div class="audio-switch">
            <button data-action="audio" data-audio="sub" class="${state.audio === 'sub' ? 'active' : ''}">SUB</button>
            <button data-action="audio" data-audio="dub" class="${state.audio === 'dub' ? 'active' : ''}">DUB</button>
          </div>
        </div>
        <div class="video-frame">
          <iframe src="${src}" title="${title} episode ${state.episode} ${state.audio}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen referrerpolicy="no-referrer"></iframe>
        </div>
        <div class="episode-navigation">
          <button data-action="ep-prev" ${state.episode === 1 ? 'disabled' : ''}>${icon('arrow-left', 16)} Previous episode</button>
          <button data-action="ep-next" ${total && state.episode >= total ? 'disabled' : ''}>Next episode ${icon('arrow-right', 16)}</button>
        </div>
        <p class="player-note">Episode playback is supplied by an independent third-party embed and may not be available for every title or region. If it does not load, try the trailer or watch options.</p>
      </div>`;
  }

  if (state.tab === 'preview') {
    const hasTrailer = anime.trailer?.site?.toLowerCase() === 'youtube' && anime.trailer.id;
    const inner = hasTrailer
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(anime.trailer.id)}?rel=0" title="${title} official trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`
      : `<div class="video-empty" style="background-image:linear-gradient(0deg, rgba(10,9,17,.92), rgba(10,9,17,.4)), url('${escapeHtml(art)}')">
           ${icon('clapperboard', 34)}
           <strong>Trailer not available</strong>
           <span>Explore viewing options for this title.</span>
           <button data-action="tab" data-tab="watch">Watch options ${icon('arrow-right', 15)}</button>
         </div>`;
    return `<div class="player-panel"><div class="video-frame">${inner}</div><p class="player-note">Trailers are embedded from YouTube. Streaming availability varies by provider and region.</p></div>`;
  }

  const links = (anime.externalLinks || []).filter((l) => l.type === 'STREAMING' || /crunchyroll|netflix|hulu|disney|youtube|prime video|hidive|bilibili|tubi/i.test(l.site));
  const providers = links.length
    ? `<div class="provider-list">${links.map((l) => `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer"><span>${icon('play', 15)} ${escapeHtml(l.site)}</span>${icon('external-link', 16)}</a>`).join('')}</div>`
    : `<div class="no-provider">No streaming provider is listed for this title. <a href="https://www.justwatch.com/us/search?q=${encodeURIComponent(titleOf(anime))}" target="_blank" rel="noopener noreferrer">Search on JustWatch ${icon('external-link', 14)}</a></div>`;
  return `
    <div class="player-panel">
      <div class="watch-options">
        <p>Streaming availability depends on your region. Continue on a provider's website to watch full episodes.</p>
        ${providers}
      </div>
      <p class="player-note">Trailers are embedded from YouTube. Streaming availability varies by provider and region.</p>
    </div>`;
}

function renderModal() {
  const anime = state.selected;
  if (!anime) return;
  const title = escapeHtml(titleOf(anime));
  const art = anime.bannerImage || posterOf(anime) || '/images/hero-anime.jpg';
  const saved = isSaved(anime.id);
  const summary = anime.description
    ? stripHtml(anime.description).slice(0, 360) + (anime.description.length > 360 ? '...' : '')
    : `Discover ${titleOf(anime)} and find your next favorite story.`;
  const tabs = [
    anime.id > 0 ? ['episodes', 'Episodes'] : null,
    ['preview', 'Trailer'],
    ['watch', 'Watch options'],
  ].filter(Boolean);

  $('#modal-root').innerHTML = `
    <div class="modal-backdrop" data-action="modal-close">
      <div class="detail-modal" role="dialog" aria-modal="true" aria-label="${title}">
        <button class="modal-close" data-action="modal-close" aria-label="Close details">${icon('x', 22)}</button>
        <div class="detail-visual" style="background-image:linear-gradient(90deg, #111018 4%, rgba(17,16,24,.65) 50%, rgba(17,16,24,.12)), linear-gradient(0deg, #111018, transparent 55%), url('${escapeHtml(art)}')">
          <div class="detail-visual-content">
            <span class="detail-kicker">WATCH ANIME 06 / THE COLLECTION</span>
            <h2>${title}</h2>
            <div class="detail-meta">
              <span class="score">${icon('star', 14, true)} ${anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A'}</span>
              <span>${anime.seasonYear || 'Anime'}</span>
              <span>${anime.format === 'MOVIE' ? 'Movie' : anime.format || 'Series'}</span>
              ${anime.episodes ? `<span>${anime.episodes} episodes</span>` : ''}
            </div>
            <div class="detail-genres">${escapeHtml(anime.genres?.slice(0, 3).join('  /  ') || 'Anime series')}</div>
          </div>
        </div>
        <div class="detail-body">
          <div class="detail-copy">
            <p>${escapeHtml(summary)}</p>
            <button class="detail-save ${saved ? 'is-saved' : ''}" data-action="save" data-id="${anime.id}">${icon(saved ? 'check' : 'bookmark', 17)} ${saved ? 'Added to My List' : 'Add to My List'}</button>
          </div>
          <div class="player-section">
            <div class="player-header">
              <h3>Watch & discover</h3>
              <div class="player-tabs">${tabs.map(([key, label]) => `<button data-action="tab" data-tab="${key}" class="${state.tab === key ? 'active' : ''}">${label}</button>`).join('')}</div>
            </div>
            <div id="player-panel">${playerPanel(anime)}</div>
          </div>
        </div>
      </div>
    </div>`;
}

function updatePlayer() {
  const panel = $('#player-panel');
  if (!panel || !state.selected) return;
  $$('.player-tabs button').forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === state.tab));
  panel.innerHTML = playerPanel(state.selected);
}

/* ---------------- Navigation helpers ---------------- */
function scrollToCatalog() { $('#catalog').scrollIntoView({ behavior: 'smooth' }); }

function setView(view) {
  state.view = view;
  state.visible = PAGE_SIZE;
  closeMobileMenus();
  renderNav();
  renderCatalog();
  if (view === 'Discover') window.scrollTo({ top: 0, behavior: 'smooth' });
  else setTimeout(scrollToCatalog, 60);
}

function closeMobileMenus() {
  $('#mobile-nav').hidden = true;
  $('#menu-icon').innerHTML = icon('menu', 23);
  $('#header-search').classList.remove('mobile-search-open');
}

function setSearch(value) {
  state.search = value;
  state.visible = PAGE_SIZE;
  $('#clear-search').hidden = !value;
  if (value && state.view === 'Discover') { state.view = 'Browse'; renderNav(); }
  renderCatalog();
}

/* ---------------- Events ---------------- */
document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  // Backdrop click closes only when the click is on the backdrop itself
  if (target.classList.contains('modal-backdrop') && event.target !== target) return;
  const { action } = target.dataset;
  const id = Number(target.dataset.id);

  switch (action) {
    case 'open': { const anime = findAnime(id); if (anime) openModal(anime); break; }
    case 'save': {
      state.savedIds = isSaved(id) ? state.savedIds.filter((x) => x !== id) : [...state.savedIds, id];
      persistSaved();
      updateSaveButtons(id);
      if (state.view === 'My List') renderCatalog();
      break;
    }
    case 'nav': setView(target.dataset.view); break;
    case 'genre': state.genre = target.dataset.genre; state.visible = PAGE_SIZE; renderGenres(); renderCatalog(); break;
    case 'trend-prev': state.trendingOffset = Math.max(0, state.trendingOffset - 4); renderTrending(); break;
    case 'trend-next': state.trendingOffset = Math.min(Math.max(0, state.anime.length - 8), state.trendingOffset + 4); renderTrending(); break;
    case 'load-more': state.visible += PAGE_SIZE; renderCatalog(); break;
    case 'scroll-catalog': scrollToCatalog(); break;
    case 'surprise': openModal(state.anime[Math.floor(Math.random() * state.anime.length)]); break;
    case 'reset': {
      state.search = ''; $('#search-input').value = ''; $('#clear-search').hidden = true;
      state.genre = 'All'; if (state.view === 'My List') state.view = 'Browse';
      renderNav(); renderGenres(); renderCatalog(); break;
    }
    case 'clear-search': $('#search-input').value = ''; setSearch(''); $('#search-input').focus(); break;
    case 'mobile-search': {
      const box = $('#header-search');
      $('#mobile-nav').hidden = true; $('#menu-icon').innerHTML = icon('menu', 23);
      box.classList.toggle('mobile-search-open');
      if (box.classList.contains('mobile-search-open')) setTimeout(() => $('#search-input').focus(), 80);
      break;
    }
    case 'mobile-menu': {
      const nav = $('#mobile-nav');
      $('#header-search').classList.remove('mobile-search-open');
      nav.hidden = !nav.hidden;
      $('#menu-icon').innerHTML = icon(nav.hidden ? 'menu' : 'x', 23);
      break;
    }
    case 'modal-close': closeModal(); break;
    case 'tab': state.tab = target.dataset.tab; updatePlayer(); break;
    case 'audio': state.audio = target.dataset.audio; updatePlayer(); break;
    case 'ep-prev': state.episode = Math.max(1, state.episode - 1); updatePlayer(); break;
    case 'ep-next': state.episode = Math.min(state.selected?.episodes || 999, state.episode + 1); updatePlayer(); break;
  }
});

$('#search-input').addEventListener('input', (event) => setSearch(event.target.value));
$('#search-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') { scrollToCatalog(); $('#header-search').classList.remove('mobile-search-open'); }
});
$('#sort-select').addEventListener('change', (event) => { state.sort = event.target.value; renderCatalog(); });

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { closeModal(); closeMobileMenus(); return; }
  const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement;
  if (event.key === '/' && !typing) {
    event.preventDefault();
    if (window.innerWidth <= 650) $('#header-search').classList.add('mobile-search-open');
    $('#search-input').focus();
  }
});

/* ---------------- Init ---------------- */
function hydrateStaticIcons() {
  $$('[data-icon]').forEach((el) => {
    el.innerHTML = icon(el.dataset.icon, Number(el.dataset.size || 15), el.dataset.fill === 'true' || el.classList.contains('brand-mark'));
  });
}

hydrateStaticIcons();
renderGenres();
renderTrending();
renderCatalog();
loadCatalog();
