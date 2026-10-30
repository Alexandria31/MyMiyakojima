/* Shared visitor details reuse information already published in the guide. */
const islandAreas = {
  hirara: ["Hirara", "平良"],
  shimoji: ["Shimoji", "下地"],
  gusukube: ["Gusukube", "城辺"],
  ueno: ["Ueno / Shigira", "上野・シギラ"],
  north: ["Karimata / Ikema", "狩俣・池間方面"],
  island: ["Check location with the business", "所在地は事業者へご確認ください"]
};
const islandListingDetails = {
  "pizza-doraku.html": { area: "hirara" },
  "captain-marian.html": { area: "hirara", facts: [["Parking available", "駐車場あり"]] },
  "hirochan.html": { area: "ueno", facts: [["Call ahead for current hours", "営業時間はお電話でご確認ください"]] },
  "gare-385.html": { area: "hirara", facts: [["Weekend sales at MUGI; 24-hour frozen sweets vending machine", "MUGIでの週末販売・24時間の冷凍スイーツ自販機"]] },
  "caldo-de-cana.html": { area: "north", facts: [["Mobile stand: check Instagram for today's location", "キッチンカーのため、出店場所はInstagramでご確認ください"]] },
  "tonkatsu-ichiban-miyakojima.html": { area: "hirara" },
  "para-jiro.html": { area: "hirara" },
  "burwood-donuts.html": { area: "hirara" },
  "nii-marine.html": { area: "island", facts: [["Confirm the meeting point when booking", "予約時に集合場所をご確認ください"]] },
  "toppuri.html": { area: "gusukube", facts: [["6 rooms: villas and domes · sauna by advance reservation", "ヴィラとドームの全6室・サウナは事前予約制"]] },
  "umioto-log.html": { area: "gusukube" },
  "maho-terraces.html": { area: "hirara", facts: [["Private rooms and dorms · shared bathrooms", "個室とドミトリー・バスとトイレは共用"]] },
  "coral-rent.html": { area: "hirara" },
  "pine-rentacar.html": { area: "hirara", facts: [["Confirm airport pickup arrangements directly", "空港での受け渡しは直接ご確認ください"]] },
  "lomilomi-pono.html": { area: "shimoji", facts: [["Reservation required · English available", "完全予約制・英語対応可"]] },
  "ggs.html": { area: "island", facts: [["No standalone shop; sold through stockists", "実店舗はなく、委託販売店でお取り扱い"]] },
  "guruguru-glass.html": { area: "island", facts: [["Workshops by reservation via DM or phone", "ワークショップはDMまたは電話での予約制"]] },
  "laso-laso.html": { area: "hirara" },
  "miyakojima-tours.html#ilove-miyakojima": { area: "north", facts: [["Book directly · up to 10 guests", "直接予約・最大10名まで"]] }
};

function islandPair(en, ja) {
  const span = document.createElement("span");
  span.textContent = en;
  const jp = document.createElement("span");
  jp.lang = "ja";
  jp.textContent = ja;
  span.appendChild(jp);
  return span;
}

function islandCard(listing) {
  const a = document.createElement("a");
  a.className = "island-discovery-card";
  a.href = listing.href;
  const img = document.createElement("img");
  img.src = listing.image;
  img.alt = `${listing.name} / ${listing.nameJp}`;
  img.loading = "lazy";
  img.width = 480;
  img.height = 320;
  a.append(img, islandPair(listing.name, listing.nameJp));
  return a;
}

function initializeAreaBrowser() {
  const host = document.getElementById("islandAreaBrowser");
  if (!host) return;
  const select = host.querySelector("select");
  const results = host.querySelector(".area-browser-results");
  const status = host.querySelector(".area-browser-status");
  function render() {
    results.replaceChildren();
    if (!select.value) {
      status.replaceChildren(islandPair("Choose an area to see places in the guide.", "エリアを選ぶと、掲載中の場所が表示されます。"));
      return;
    }
    const matches = curatedListings.filter(listing => {
      const detail = islandListingDetails[listing.href];
      return detail && (!select.value || detail.area === select.value);
    });
    matches.forEach(listing => results.appendChild(islandCard(listing)));
    status.replaceChildren(islandPair(`${matches.length} places in the guide`, `掲載中の場所：${matches.length}件`));
  }
  const requestedArea = new URLSearchParams(location.search).get("area");
  if (requestedArea && Object.hasOwn(islandAreas, requestedArea)) select.value = requestedArea;
  select.addEventListener("change", render);
  render();
}

function initializeVisitorDetails() {
  const file = getCurrentPageName();
  const listing = curatedListings.find(item => item.href === file);
  const detail = islandListingDetails[file];
  // Portrait pages stay editorial; business information belongs to business pages.
  if (!listing || !detail || file.startsWith("creative-")) return;
  const heading = document.querySelector("h1");
  if (!heading) return;
  const summary = document.createElement("aside");
  summary.className = "visitor-summary";
  summary.setAttribute("aria-label", "Visitor essentials / ご利用のポイント");
  const title = document.createElement("h2");
  title.appendChild(islandPair("Before you visit", "訪れる前に"));
  summary.append(title, islandPair(...islandAreas[detail.area]));
  (detail.facts || []).forEach(fact => summary.appendChild(islandPair(...fact)));
  const labels = { hours: ["Listed hours", "掲載営業時間"], parking: ["Parking", "駐車場"], price: ["Listed price", "掲載料金"] };
  let publishedFacts = 0;
  document.querySelectorAll(".location-card .info-grid > div").forEach(row => {
    if (publishedFacts >= 2) return;
    const key = row.querySelector("strong")?.textContent.trim().toLowerCase();
    const label = labels[key];
    const english = row.querySelector("span:not(.jp)")?.textContent.trim();
    const japanese = row.querySelector(".jp")?.textContent.trim();
    if (!label || !english || !japanese) return;
    summary.appendChild(islandPair(`${label[0]}: ${english}`, `${label[1]}：${japanese}`));
    publishedFacts++;
  });
  const actions = document.createElement("div");
  actions.className = "visitor-summary-actions";
  const contactLinks = [...document.querySelectorAll(".location-card a[href], .contact-link-grid a[href], .toppuri-contact a[href]")];
  const phone = contactLinks.find(a => a.getAttribute("href").startsWith("tel:"));
  const map = contactLinks.find(a => /maps\.google|google\..*maps|maps\.app/.test(a.href));
  const web = contactLinks.find(a => a.href.startsWith("http") && !/google.*maps|maps\.app|instagram|facebook/.test(a.href));
  const instagram = contactLinks.find(a => /instagram\.com/.test(a.href));
  [[phone, "Call the business", "電話する"], [web || instagram, "Contact & latest details", "お問い合わせ・最新情報"], [map, "Open map", "地図を見る"]].forEach(([source, en, ja]) => {
    if (!source) return;
    const a = document.createElement("a");
    a.href = source.href;
    if (source.target === "_blank") { a.target = "_blank"; a.rel = "noopener"; }
    a.appendChild(islandPair(en, ja));
    actions.appendChild(a);
  });
  if (!actions.children.length) {
    const contact = document.querySelector("#contact-info, #location, .location-section");
    if (contact) {
      if (!contact.id) contact.id = "visitor-contact";
      const a = document.createElement("a");
      a.href = `#${contact.id}`;
      a.appendChild(islandPair("Visit & contact details", "利用情報・お問い合わせ"));
      actions.appendChild(a);
    }
  }
  summary.appendChild(actions);
  heading.insertAdjacentElement("afterend", summary);
}

function initializeRelatedDiscoveries() {
  const file = getCurrentPageName();
  const current = curatedListings.find(item => item.href === file);
  const isPortrait = file.startsWith("creative-");
  if (!current && !isPortrait) return;
  const host = document.querySelector("main") || document.querySelector("footer");
  if (!host) return;
  const area = islandListingDetails[file]?.area;
  const choices = curatedListings.filter(item => item.href !== file && !item.href.startsWith("creative-"))
    .map(item => ({item, score: (area && area !== "island" && islandListingDetails[item.href]?.area === area ? 4 : 0) + (item.category === current?.category ? 2 : 0)}))
    .sort((a, b) => b.score - a.score).slice(0, 3);
  const section = document.createElement("section");
  section.className = "related-discoveries";
  const title = document.createElement("h2");
  title.appendChild(islandPair("Continue exploring", "ほかのおすすめも見る"));
  const grid = document.createElement("div");
  grid.className = "island-discovery-grid";
  choices.forEach(({item}) => grid.appendChild(islandCard(item)));
  section.append(title, grid);
  if (host.tagName === "FOOTER") host.before(section); else host.appendChild(section);
}

function initializeIslandFinds() {
  const host = document.getElementById("islandFinds");
  if (!host) return;
  const selections = [
    ["Colour, craft, and a little sweetness", "島の色と手仕事、甘いひと息", ["guruguru-glass.html", "ggs.html", "caldo-de-cana.html"]],
    ["An unhurried island day", "ゆっくり楽しむ島の一日", ["hirochan.html", "lomilomi-pono.html", "toppuri.html"]],
    ["Meet the island through its flavours", "島の味から始まる出会い", ["para-jiro.html", "burwood-donuts.html", "caldo-de-cana.html"]]
  ];
  const week = Math.floor(Date.now() / (7 * 86400000));
  const [en, ja, hrefs] = selections[week % selections.length];
  host.querySelector("h2").replaceChildren(islandPair(en, ja));
  const grid = host.querySelector(".island-discovery-grid");
  hrefs.map(getListingByHref).filter(Boolean).forEach(listing => grid.appendChild(islandCard(listing)));
  document.querySelector(".mm25-business")?.before(host);
}

function initializeVisitorMeasurement() {
  document.addEventListener("click", event => {
    const a = event.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    let action;
    if (href.startsWith("tel:")) action = "business_call";
    else if (/maps\.google|maps\.app|google\..*maps/.test(href)) action = "business_map";
    else if (a.closest(".location-card, .contact-link-grid, .visitor-summary, .tour-guide-actions, .guruguru-contact, .toppuri-contact") && /^https?:/.test(href)) action = "business_contact_click";
    if (action && typeof gtag === "function") {
      // Record the listed page and action, never inquiry text or personal details.
      gtag("event", action, { listing_page: getCurrentPageName(), transport_type: "beacon" });
    }
  });
}

initializeAreaBrowser();
initializeVisitorDetails();
initializeRelatedDiscoveries();
initializeIslandFinds();
initializeVisitorMeasurement();

function initializeIslandFilms() {
  const homepageFilm = document.getElementById("islandFilm");
  if (homepageFilm) document.querySelector(".mm25-island-now")?.after(homepageFilm);
  function pauseOtherFilms(active) {
    document.querySelectorAll("video").forEach(video => { if (video !== active) video.pause(); });
    document.querySelectorAll("[data-youtube-film] iframe").forEach(frame => {
      frame.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), "https://www.youtube-nocookie.com");
    });
  }
  document.querySelectorAll("[data-island-film]").forEach(player => {
    const video = player.querySelector("video");
    if (!video) return;
    video.muted = true;
    const play = document.createElement("button");
    play.type = "button";
    play.className = "island-film-play";
    play.innerHTML = '<span aria-hidden="true">▶</span>Play film<span lang="ja">動画を再生</span>';
    play.addEventListener("click", async () => {
      play.disabled = true;
      try { await video.play(); play.hidden = true; }
      catch { play.disabled = false; }
    });
    video.addEventListener("play", () => {
      play.hidden = true;
      pauseOtherFilms(video);
      if (typeof gtag === "function") gtag("event", "island_video_play", { listing_page: getCurrentPageName() });
    });
    video.addEventListener("ended", () => { play.hidden = false; play.disabled = false; });
    video.addEventListener("error", () => {
      if (player.nextElementSibling?.classList.contains("island-film-status")) return;
      const status = document.createElement("p");
      status.className = "island-film-status";
      status.setAttribute("role", "status");
      status.appendChild(islandPair("This film could not load. Please try again later.", "動画を読み込めませんでした。時間をおいて再度お試しください。"));
      player.after(status);
      play.disabled = false;
    });
    player.appendChild(play);
  });
  document.querySelectorAll("[data-youtube-film]").forEach(player => {
    player.querySelector("button")?.addEventListener("click", () => {
      pauseOtherFilms(null);
      const frame = document.createElement("iframe");
      frame.src = `https://www.youtube-nocookie.com/embed/${player.dataset.youtubeFilm}?autoplay=1&mute=1&playsinline=1&rel=0&enablejsapi=1`;
      frame.title = "Masa music video / Masaのミュージックビデオ";
      frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      frame.allowFullscreen = true;
      player.replaceChildren(frame);
      frame.focus();
    }, { once: true });
  });
}
initializeIslandFilms();

const tourCard = document.getElementById("ilove-miyakojima");
if (tourCard) {
  const listing = getListingByHref("miyakojima-tours.html#ilove-miyakojima");
  if (listing) {
    createSavedDrawer();
    tourCard.querySelector(".tour-guide-actions").appendChild(createSaveButton(listing));
    updateSavedPlaceUi();
  }
}

document.querySelectorAll(".area-guide-grid article").forEach((article, index) => {
  const area = ["hirara", "shimoji", null, "ueno", "gusukube"][index];
  // No listed Irabu address has been confirmed yet; keep that guide informational.
  if (!area) return;
  const a = document.createElement("a");
  a.className = "area-browse-link";
  a.href = `recommended.html?area=${area}#islandAreaBrowser`;
  a.appendChild(islandPair("Explore this area", "このエリアを見る"));
  article.appendChild(a);
});
