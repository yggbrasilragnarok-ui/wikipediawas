// Conteúdo básico das páginas da wiki.
// A ideia: você pode registrar novas páginas aqui sem mexer no HTML.
// Depois, no futuro, dá pra trocar isso por fetch() em arquivos .md externos.

// ===== Efeito de entrada "dobra temporal" =====
function initTimeWarpEffect() {
  const overlay = document.getElementById("timeWarpOverlay");
  const canvas = document.getElementById("timeWarpCanvas");

  if (!overlay || !canvas) {
    return null;
  }

  const prefersReducedMotion = window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .matches;

  const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
  const hasMobileUserAgent = /Mobi|Android|iPhone|iPad|iPod/i.test(
    navigator.userAgent || ""
  );
  const isMobileExperience = isMobileViewport || hasMobileUserAgent;

  if (isMobileExperience) {
    overlay.remove();
    return null;
  }

  if (prefersReducedMotion) {
    overlay.classList.add("is-fading");
    overlay.addEventListener(
      "transitionend",
      () => {
        overlay.remove();
      },
      { once: true }
    );

    window.setTimeout(() => {
      if (overlay.parentElement) {
        overlay.remove();
      }
    }, 400);

    return null;
  }

  const ctx = canvas.getContext("2d", { alpha: true });

  if (!ctx) {
    overlay.classList.add("is-fading");
    overlay.addEventListener(
      "transitionend",
      () => {
        overlay.remove();
      },
      { once: true }
    );
    return null;
  }

  const PARTICLE_COUNT = 160;
  const particles = [];

  let width = 0;
  let height = 0;
  let centerX = 0;
  let centerY = 0;
  let dpr = window.devicePixelRatio || 1;

  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    centerX = width / 2;
    centerY = height / 2;
  }

  function createParticle() {
    return {
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * 12,
      speed: 0.6 + Math.random() * 1.6,
      angularVelocity: 0.04 + Math.random() * 0.08,
      opacity: 0.4 + Math.random() * 0.45,
      size: 1 + Math.random() * 2.4,
    };
  }

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    particles.push(createParticle());
  }

  resizeCanvas();

  const TIME_WARP_DURATION = 3200;
  let hasFaded = false;
  let animationFrameId = null;
  const startTime = performance.now();

  function cleanupOverlay() {
    window.removeEventListener("resize", resizeCanvas);
    if (overlay.parentElement) {
      overlay.remove();
    }
  }

  function scheduleFadeOut() {
    overlay.classList.add("is-fading");
    overlay.addEventListener(
      "transitionend",
      () => {
        cleanupOverlay();
      },
      { once: true }
    );
    window.setTimeout(() => {
      cleanupOverlay();
    }, 1500);
  }

  function render(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / TIME_WARP_DURATION, 1);

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(4, 12, 24, 0.32)";
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowBlur = 18;
    ctx.shadowColor = "rgba(110, 228, 255, 0.75)";

    const spiralAmplifier = 1 + progress * 1.8;
    const outwardForce = 1 + progress * 2.1;

    for (let index = 0; index < particles.length; index += 1) {
      const particle = particles[index];

      particle.radius += particle.speed * outwardForce;
      particle.angle += particle.angularVelocity * spiralAmplifier;

      const spiralRadius = particle.radius * (1 + progress * 0.75);
      const x = centerX + Math.cos(particle.angle) * spiralRadius;
      const y = centerY + Math.sin(particle.angle) * spiralRadius * 0.9;

      const fadeTail = progress > 0.72 ? Math.max(0, 1 - (progress - 0.72) / 0.28) : 1;

      ctx.globalAlpha = particle.opacity * fadeTail;
      ctx.beginPath();
      ctx.arc(x, y, particle.size * (1 + progress * 1.4), 0, Math.PI * 2);
      ctx.fillStyle = "#8cf3ff";
      ctx.fill();

      if (spiralRadius > Math.max(width, height) * 0.75) {
        particles[index] = createParticle();
        particles[index].radius = 0;
      }
    }

    ctx.shadowBlur = 0;
    ctx.shadowColor = "transparent";
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    if (elapsed >= TIME_WARP_DURATION && !hasFaded) {
      hasFaded = true;
      animationFrameId = null;
      scheduleFadeOut();
      return;
    }

    animationFrameId = window.requestAnimationFrame(render);
  }

  animationFrameId = window.requestAnimationFrame(render);

  window.addEventListener("resize", resizeCanvas);

  return () => {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }
    cleanupOverlay();
  };
}

function initAmbientParticles() {
  const canvas = document.getElementById("particleCanvas");

  if (!canvas) {
    return null;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    canvas.remove();
    return null;
  }

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const particles = [];

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;
  let animationFrameId = null;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function createParticle(startY = Math.random() * height) {
    return {
      x: Math.random() * width,
      y: startY,
      size: 0.6 + Math.random() * 1.6,
      speed: 0.35 + Math.random() * 1.1,
      vx: (Math.random() - 0.5) * 0.6,
      wander: 0.04 + Math.random() * 0.05,
      opacity: 0.2 + Math.random() * 0.4,
    };
  }

  function syncParticleCount() {
    const target = Math.min(220, Math.floor((width * height) / 6000));

    if (particles.length > target) {
      particles.length = target;
      return;
    }

    while (particles.length < target) {
      particles.push(createParticle(Math.random() * height));
    }
  }

  function resetParticle(particle) {
    const offset = 40 + Math.random() * 40;
    particle.x = Math.random() * width;
    particle.y = height + offset;
    particle.size = 0.6 + Math.random() * 1.6;
    particle.speed = 0.35 + Math.random() * 1.1;
    particle.vx = (Math.random() - 0.5) * 0.6;
    particle.wander = 0.04 + Math.random() * 0.05;
    particle.opacity = 0.2 + Math.random() * 0.4;
  }

  resize();
  syncParticleCount();

  let lastTimestamp = performance.now();

  function render(now) {
    const delta = Math.min(64, now - lastTimestamp);
    lastTimestamp = now;

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(2, 11, 24, 0.16)";
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "lighter";

    const deltaFactor = delta / 16.666;

    for (let index = 0; index < particles.length; index += 1) {
      const particle = particles[index];

      particle.vx += (Math.random() - 0.5) * particle.wander;
      particle.vx = Math.max(Math.min(particle.vx, 1.4), -1.4);
      particle.vx *= 0.96;

      const verticalVariation = (Math.random() - 0.5) * particle.wander * 10;
      const upwardSpeed = Math.max(0.1, particle.speed + verticalVariation);

      particle.x += particle.vx * deltaFactor * 12;
      particle.y -= upwardSpeed * deltaFactor;

      if (particle.x < -20 || particle.x > width + 20 || particle.y < -20) {
        resetParticle(particle);
        continue;
      }

      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 5
      );
      gradient.addColorStop(0, `rgba(11, 223, 255, ${Math.min(1, particle.opacity + 0.2)})`);
      gradient.addColorStop(1, "rgba(11, 223, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    animationFrameId = window.requestAnimationFrame(render);
  }

  animationFrameId = window.requestAnimationFrame(render);

  function handleResize() {
    resize();
    syncParticleCount();
  }

  window.addEventListener("resize", handleResize);

  return () => {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }
    window.removeEventListener("resize", handleResize);
  };
}

const KINETIC_CARD_SELECTORS = [
  ".server-general-card",
  ".hero-card",
  ".hero-card__highlight",
  ".feature-card",
  ".wiki-panel",
  ".portal-card",
  ".rules-pillar",
  ".rules-guideline",
  ".server-hero__rate",
  ".server-season__card",
  ".server-quality__card",
  ".server-cta-card",
  ".nostalgia-card",
  ".server-stat",
  ".table-card",
  ".rules-penalties-card",
  ".dungeon-select-card",
  ".monster-card__header"
];

const kineticPointerQuery = window.matchMedia("(pointer: fine)");
const kineticReduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function shouldEnableKineticHover() {
  return kineticPointerQuery.matches && !kineticReduceMotionQuery.matches;
}

function enhanceKineticHover(scope = document) {
  if (!scope) {
    return;
  }

  const elements = scope.querySelectorAll(KINETIC_CARD_SELECTORS.join(", "));

  elements.forEach(card => {
    if (card.classList.contains("hero-card--static")) {
      return;
    }

    if (card.dataset.kineticPrepared) {
      return;
    }

    card.dataset.kineticPrepared = "true";
    card.setAttribute("data-kinetic-card", "");
    card.style.setProperty("--card-mouse-x", 0.5);
    card.style.setProperty("--card-mouse-y", 0.5);

    if (!shouldEnableKineticHover()) {
      return;
    }

    const updatePointer = event => {
      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const clampedX = Math.min(Math.max(x, 0), 1);
      const clampedY = Math.min(Math.max(y, 0), 1);

      card.style.setProperty("--card-mouse-x", clampedX.toFixed(4));
      card.style.setProperty("--card-mouse-y", clampedY.toFixed(4));
    };

    const resetPointer = () => {
      card.style.setProperty("--card-mouse-x", 0.5);
      card.style.setProperty("--card-mouse-y", 0.5);
    };

    card.addEventListener("pointerenter", updatePointer);
    card.addEventListener("pointermove", updatePointer);
    card.addEventListener("pointerleave", resetPointer);
    card.addEventListener("pointercancel", resetPointer);
  });
}

// ===== Sistema de Exploração - layouts dos mapas =====
const EXPLORE_MAP_VARIANTS = {
  fields: createExploreMapVariant({
    key: "fields",
    label: "Campos",
    layout: `
. . . . . . mjolnir_12.gif
. . . . . . . .
. . mjolnir_01.gif mjolnir_02.gif mjolnir_03.gif mjolnir_04.gif mjolnir_05.gif . . . .
gef_fild06.gif gef_fild05.gif gef_fild04.gif mjolnir_06.gif mjolnir_07.gif mjolnir_08.gif mjolnir_10.gif mjolnir_11.gif
gef_fild08.gif gef_fild07.gif geffen.gif . . mjolnir_09.gif prt_fild01.gif prt_fild02.gif prt_fild03.gif
. gef_fild13.gif gef_fild09.gif gef_fild01.gif prt_fild04.gif gef_fild05.gif prontera.gif prt_fild06.gif . . . . izlu2dun.gif
. . gef_fild10.gif gef_fild03.gif gef_fild02.gif prt_fild07.gif prt_fild08.gif izlude.gif . pay_arche.gif
. . gef_fild11.gif prt_fild11.gif prt_fild10.gif prt_fild09.gif moc_fild01.gif pay_fild04.gif .  payon.gif pay_fild08.gif pay_fild09.gif
. . . . . moc_ruins.gif moc_fild07.gif  moc_fild02.gif moc_fild03.gif pay_fild01.gif pay_fild07.gif pay_fild10.gif
. . . . . . morocc.gif moc_fild13.gif  pay_fild11.gif pay_fild02.gif pay_fild03.gif alberta.gif . .
. . . . . . moc_fild12.gif moc_fild11.gif  . . 
. . . . .  . moc_fild17.gif moc_fild16.gif  pay_fild05.gif pay_fild06.gif
    `,
  }),
  dungeons: createExploreMapVariant({
    key: "dungeons",
    label: "Calabouço",
    layout: "",
  }),
};

const EXPLORE_DEFAULT_VARIANT = "fields";

const EXPLORE_DUNGEON_VARIANT_KEY = "dungeons";
const EXPLORE_DUNGEON_ORDER = [
  "prt_sewb1",
  "pay_dun00",
  "gef_dun00",
  "moc_pryd01",
  "iz_dun00",
  "treasure1",
];

const EXPLORE_DUNGEON_BACKGROUNDS = {
  prt_sewb1: "",
  pay_dun00: "",
  gef_dun00: "",
  prt_maze01: "",
  moc_pryd01: "",
  iz_dun00: "",
  treasure1: "",
};

let hasInitializedExploreDungeons = false;
let activeDungeonSlug = null;

const EXPLORE_ROUTE_VARIANT_KEY = "fields";
const EXPLORE_ROUTE_COLORS = [
  { key: "up", label: "Rota de Up", color: "#32b7ff" },
  { key: "drop", label: "Caça a Drops", color: "#f9b64b" },
  { key: "elite", label: "Rotas Desafiadoras", color: "#ff5f7a" },
  { key: "farm", label: "Farm Seguro", color: "#4bd08a" },
];

const exploreRouteState = {
  selectedColorKey: EXPLORE_ROUTE_COLORS[0]?.key || "up",
  selections: [],
  selectionIndex: new Map(),
  monsterIntelCache: new Map(),
};

let currentRouteIntelRequestId = 0;

function createExploreMapVariant({ key, label, layout }) {
  const normalizedLayout = (layout || "").trim();
  const rows = normalizedLayout
    ? normalizedLayout.split("\n").map(row => row.trim().split(/\s+/).filter(Boolean))
    : [];

  const dimensions = {
    rows: rows.length,
    cols: rows.length ? Math.max(...rows.map(row => row.length)) : 0,
  };

  return { key, label, layout: normalizedLayout, rows, dimensions };
}

const EXPLORE_MAP_NAME_OVERRIDES = {
  prt_sewb1: "Esgotos de Prontera",
  pay_dun00: "Caverna de Payon",
  gef_dun00: "Torre de Geffen",
  moc_pryd01: "Pirâmides de Morroc",
  iz_dun01: "Caverna Submarina de Byalan",
  orc_dun01: "Navio Fantasma",
};

const EXPLORE_MAP_DETAILS = {
  prontera: {
    name: "Prontera",
    region: "Capital de Rune-Midgard",
    description: "Coração político e comercial do reino. Aqui ficam a Catedral, as guildas iniciais e a maioria dos serviços urbanos.",
    descriptionEntries: [
      {
        title: "Centro da capital",
        images: [
          {
            src: "assets/pronteralarge.gif",
          },
        ],
        text: "Coração político e comercial do reino. Aqui ficam a Catedral, as guildas iniciais e a maioria dos serviços urbanos.",
      },
        
    ],
  },
  geffen: {
    name: "Geffen",
    region: "Cidade dos Magos",
    description: "Centro do conhecimento arcano, dominado pela Torre dos Magos e pelos mercados de encantamentos.",
        descriptionEntries: [
      {
        title: "Cidade dos Magos",
        images: [
          {
            src: "assets/geffenlarge.gif",
          },
        ],
        text: "Centro do conhecimento arcano, dominado pela Torre dos Magos e pelos mercados de encantamentos.",
      },
        
    ],
  },
  payon: {
    name: "Payon",
    region: "Vilarejo na Montanha",
    description: "Vilarejo pacato escondido nas florestas. Berço da Guilda dos Arqueiros e ponto de partida para as cavernas ancestrais.",
            descriptionEntries: [
      {
        title: "Vila dos arqueiros",
        images: [
          {
            src: "assets/payonlarge.gif",
          },
        ],
        text: "Vilarejo pacato escondido nas florestas. Berço da Guilda dos Arqueiros e ponto de partida para as cavernas ancestrais.",
      },
        
    ],
  },
  morocc: {
    name: "Morroc",
    region: "Deserto de Sograt",
    description: "Cidade mercante cravada na areia escaldante. Serve de base para explorar os campos áridos e as ruínas demoníacas.",
            descriptionEntries: [
      {
        title: "Deserto de Sograt",
        images: [
          {
            src: "assets/morocclarge.gif",
          },
        ],
        text: "Cidade mercante cravada na areia escaldante. Serve de base para explorar os campos áridos e as ruínas demoníacas.",
      },
        
    ],
  },
  izlude: {
    name: "Izlude",
    region: "Porto de Prontera",
    description: "Pequena cidade portuária administrada pela Ordem dos Espadachins. Porta de entrada para a Ilha de Byalan.",
            descriptionEntries: [
      {
        title: "Cidade Portuaria",
        images: [
          {
            src: "assets/izludelarge.gif",
          },
        ],
        text: "Pequena cidade portuária administrada pela Ordem dos Espadachins. Porta de entrada para a Ilha de Byalan.",
      },
        
    ],
  },
  alberta: {
    name: "Alberta",
    region: "Porto Comercial",
    description: "Principal centro mercante de Rune-Midgard. Navios partem daqui rumo aos arquipélagos e às expedições marítimas.",
            descriptionEntries: [
      {
        title: "Porto Comercial",
        images: [
          {
            src: "assets/albertalarge.gif",
          },
        ],
        text: "Principal centro mercante de Rune-Midgard. Navios partem daqui rumo aos arquipélagos e às expedições marítimas.",
      },
        
    ],
  },
  pay_arche: {
    name: "Guilda dos Arqueiros de Payon",
    region: "Treinamento de Arqueiros",
    description: "Campo de treino onde aprendizes dominam arco e flecha antes de seguir para as missões ao redor de Payon.",
                    descriptionEntries: [
      {
        title: "Navio fantasma",
        images: [
          {
            src: "assets/pay_archelarge.gif",
          },
        ],
        text: "Campo de treino onde aprendizes dominam arco e flecha antes de seguir para as missões ao redor de Payon.",
      },
        
    ],
  },
  moc_ruins: {
    name: "Ruínas de Morroc",
    region: "Vestígios Demoníacos",
    description: "Vestígios da antiga cidade destruída pelo despertar de Satan Morroc. Energia maligna vaza por cada corredor.",
descriptionEntries: [
      {
        title: "Ruínas de Morroc",
        images: [
          {
            src: "assets/moc_ruinslarge.gif",
          },
        ],
        text: "Vestígios da antiga cidade destruída pelo despertar de Satan Morroc. Energia maligna vaza por cada corredor.",
      },
        
            
    ],
    
  },
    
    gef_fild01: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
    descriptionEntries: [
      {
        title: "Campos de Geffen 01",
        images: [
          {
            src: "assets/gef_fild01large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            
    ],    
  },
    gef_fild02: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
    descriptionEntries: [
      {
        title: "Campos de Geffen 02",
        images: [
          {
            src: "assets/gef_fild02large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            
    ],
    },
    gef_fild03: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
    descriptionEntries: [
      {
        title: "Campos de Geffen 03",
        images: [
          {
            src: "assets/gef_fild03large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            
    ], 
  },
    gef_fild04: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
    descriptionEntries: [
      {
        title: "Campos de Geffen 04",
        images: [
          {
            src: "assets/gef_fild04large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            
    ], 
  },
    gef_fild05: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
     descriptionEntries: [
      {
        title: "Campos de Geffen 05",
        images: [
          {
            src: "assets/gef_fild05large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            
    ],
  },
    gef_fild06: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
    descriptionEntries: [
      {
        title: "Campos de Geffen 06",
        images: [
          {
            src: "assets/gef_fild06large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            
    ],
  },
    gef_fild07: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
     descriptionEntries: [
      {
        title: "Campos de Geffen 07",
        images: [
          {
            src: "assets/gef_fild07large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            
    ],
  },
    gef_fild08: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
    descriptionEntries: [
      {
        title: "Campos de Geffen 08",
        images: [
          {
            src: "assets/gef_fild08large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            
    ],  
  },
    gef_fild09: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
    descriptionEntries: [
      {
        title: "Campos de Geffen 09",
        images: [
          {
            src: "assets/gef_fild09large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            
    ], 
  },
    gef_fild10: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
    descriptionEntries: [
      {
        title: "Campos de Geffen 10",
        images: [
          {
            src: "assets/gef_fild10large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            
    ], 
  },
    gef_fild11: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
    descriptionEntries: [
      {
        title: "Campos de Geffen 11",
        images: [
          {
            src: "assets/gef_fild11large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            
    ],  
  },
    gef_fild12: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",    descriptionEntries: [
      {
        title: "Campos de Geffen 12",
        images: [
          {
            src: "assets/gef_fild12large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            
    ],
 
  },
    gef_fild13: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
    descriptionEntries: [
      {
        title: "Campos de Geffen 13",
        images: [
          {
            src: "assets/gef_fild13large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            
    ], 
  },
    gef_fild14: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
    descriptionEntries: [
      {
        title: "Campos de Geffen 14",
        images: [
          {
            src: "assets/gef_fild14large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            
    ], 
  },
  prt_fild01: { 
    region: "Campos de Prontera",
    description: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
    descriptionEntries: [
      {
        title: "Campos de Prontera 01",
        images: [
          {
            src: "assets/prt_fild01large.gif",
          },
        ],
        text: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
      },
            
    ], 
  },
  prt_fild02: { 
    region: "Campos de Prontera",
    description: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
    descriptionEntries: [
      {
        title: "Campos de Prontera 02",
        images: [
          {
            src: "assets/prt_fild02large.gif",
          },
        ],
        text: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
      },
      
    ], 
  },
  prt_fild03: { 
    region: "Campos de Prontera",
    description: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
    descriptionEntries: [
      {
        title: "Campos de Prontera 03",
        images: [
          {
            src: "assets/prt_fild03large.gif",
          },
        ],
        text: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
      },
          
    ], 
  },
  prt_fild04: { 
    region: "Campos de Prontera",
    description: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
    descriptionEntries: [
      {
        title: "Campos de Prontera 04",
        images: [
          {
            src: "assets/prt_fild04large.gif",
          },
        ],
        text: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
      },
          
    ], 
  },
  prt_fild05: { 
    region: "Campos de Prontera",
    description: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
    descriptionEntries: [
      {
        title: "Campos de Prontera 05",
        images: [
          {
            src: "assets/prt_fild05large.gif",
          },
        ],
        text: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
      },
          
    ], 
  },
  prt_fild06: { 
    region: "Campos de Prontera",
    description: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
    descriptionEntries: [
      {
        title: "Campos de Prontera 06",
        images: [
          {
            src: "assets/prt_fild06large.gif",
          },
        ],
        text: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
      },
         
    ], 
  },
  prt_fild07: { 
    region: "Campos de Prontera",
    description: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
    descriptionEntries: [
      {
        title: "Campos de Prontera 07",
        images: [
          {
            src: "assets/prt_fild07large.gif",
          },
        ],
        text: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
      },
      
    ], 
  },
  prt_fild08: { 
    region: "Campos de Prontera",
    description: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
    descriptionEntries: [
      {
        title: "Campos de Prontera 08",
        images: [
          {
            src: "assets/prt_fild08large.gif",
          },
        ],
        text: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
      },
      
    ], 
  },
  prt_fild09: { 
    region: "Campos de Prontera",
    description: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
    descriptionEntries: [
      {
        title: "Campos de Prontera 09",
        images: [
          {
            src: "assets/prt_fild09large.gif",
          },
        ],
        text: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
      },
           
    ], 
  },
  prt_fild10: { 
    region: "Campos de Prontera",
    description: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
    descriptionEntries: [
      {
        title: "Campos de Prontera 10",
        images: [
          {
            src: "assets/prt_fild10large.gif",
          },
        ],
        text: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
      },
        
    ], 
  },
    prt_fild11: { 
    region: "Campos de Prontera",
    description: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
    descriptionEntries: [
      {
        title: "Campos de Prontera 11",
        images: [
          {
            src: "assets/prt_fild11large.gif",
          },
        ],
        text: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
      },
          
    ], 
  },
    pay_fild01: {
    region: "Campos de Payon",
    description: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
    descriptionEntries: [
      {
        title: "Campos de Payon 01",
        images: [
          {
            src: "assets/pay_fild01large.gif",
          },
        ],
        text: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
      },
        
    ], 
  },
     pay_fild02: {
    region: "Campos de Payon",
    description: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
    descriptionEntries: [
      {
        title: "Campos de Payon 02",
        images: [
          {
            src: "assets/pay_fild02large.gif",
          },
        ],
        text: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
      },
           
    ], 
  },
     pay_fild03: {
    region: "Campos de Payon",
    description: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
    descriptionEntries: [
      {
        title: "Campos de Payon 03",
        images: [
          {
            src: "assets/pay_fild03large.gif",
          },
        ],
        text: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
      },
          
    ], 
  },
     pay_fild04: {
    region: "Campos de Payon",
    description: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
    descriptionEntries: [
      {
        title: "Campos de Payon 04",
        images: [
          {
            src: "assets/pay_fild04large.gif",
          },
        ],
        text: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
      },
         
    ], 
  },
     pay_fild05: {
    region: "Campos de Payon",
    description: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
    descriptionEntries: [
      {
        title: "Campos de Payon 05",
        images: [
          {
            src: "assets/pay_fild05large.gif",
          },
        ],
        text: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
      },
     
    ], 
  },
     pay_fild06: {
    region: "Campos de Payon",
    description: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
    descriptionEntries: [
      {
        title: "Campos de Payon 06",
        images: [
          {
            src: "assets/pay_fild06large.gif",
          },
        ],
        text: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
      },
   
    ], 
  },
     pay_fild07: {
    region: "Campos de Payon",
    description: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
    descriptionEntries: [
      {
        title: "Campos de Payon 07",
        images: [
          {
            src: "assets/pay_fild07large.gif",
          },
        ],
        text: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
      },
      
    ], 
  },
     pay_fild08: {
    region: "Campos de Payon",
    description: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
    descriptionEntries: [
      {
        title: "Campos de Payon 08",
        images: [
          {
            src: "assets/pay_fild08large.gif",
          },
        ],
        text: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
      },

    ], 
  },
     pay_fild09: {
    region: "Campos de Payon",
    description: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
    descriptionEntries: [
      {
        title: "Campos de Payon 09",
        images: [
          {
            src: "assets/pay_fild09large.gif",
          },
        ],
        text: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
      },
   
    ], 
  },
     pay_fild10: {
    region: "Campos de Payon",
    description: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
    descriptionEntries: [
      {
        title: "Campos de Payon 10",
        images: [
          {
            src: "assets/pay_fild10large.gif",
          },
        ],
        text: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
      },
    
    ], 
  },
     pay_fild11: {
    region: "Campos de Payon",
    description: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
    descriptionEntries: [
      {
        title: "Campos de Payon 11",
        images: [
          {
            src: "assets/pay_fild11large.gif",
          },
        ],
        text: "Florestas densas e úmidas onde lobos, kobolds e espíritos da montanha testam a mira de caçadores iniciantes.",
      },
 
    ], 
  },
    moc_fild01: {
    region: "Deserto de Sograt",
    description: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
    descriptionEntries: [
      {
        title: "Deserto de Sograt 01.",
        images: [
          {
            src: "assets/moc_fild01large.gif",
          },
        ],
        text: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
      },
        
    ], 
  },
    moc_fild02: {
    region: "Deserto de Sograt",
    description: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
     descriptionEntries: [
      {
        title: "Deserto de Sograt 02.",
        images: [
          {
            src: "assets/moc_fild02large.gif",
          },
        ],
        text: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
      },
         
    ], 
  },
    moc_fild03: {
    region: "Deserto de Sograt",
    description: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
     descriptionEntries: [
      {
        title: "Deserto de Sograt 03.",
        images: [
          {
            src: "assets/moc_fild03large.gif",
          },
        ],
        text: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
      },
        
    ], 
  },
    moc_fild07: {
    region: "Deserto de Sograt",
    description: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
     descriptionEntries: [
      {
        title: "Deserto de Sograt 07.",
        images: [
          {
            src: "assets/moc_fild07large.gif",
          },
        ],
        text: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
      },
    ], 
  },
    moc_fild11: {
    region: "Deserto de Sograt",
    description: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
     descriptionEntries: [
      {
        title: "Deserto de Sograt 11.",
        images: [
          {
            src: "assets/moc_fild11large.gif",
          },
        ],
        text: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
      },
        
    ], 
  },
    moc_fild12: {
    region: "Deserto de Sograt",
    description: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
     descriptionEntries: [
      {
        title: "Deserto de Sograt 12.",
        images: [
          {
            src: "assets/moc_fild12large.gif",
          },
        ],
        text: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
      },
         
    ], 
  },
    moc_fild13: {
    region: "Deserto de Sograt",
    description: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
     descriptionEntries: [
      {
        title: "Deserto de Sograt 13.",
        images: [
          {
            src: "assets/moc_fild13large.gif",
          },
        ],
        text: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
      },
          
    ], 
  },
    moc_fild16: {
    region: "Deserto de Sograt",
    description: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
     descriptionEntries: [
      {
        title: "Deserto de Sograt 16.",
        images: [
          {
            src: "assets/moc_fild16large.gif",
          },
        ],
        text: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
      },
          
    ], 
  },
    moc_fild17: {
    region: "Deserto de Sograt",
    description: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
     descriptionEntries: [
      {
        title: "Deserto de Sograt 17.",
        images: [
          {
            src: "assets/moc_fild17large.gif",
          },
        ],
        text: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
      },
          
    ], 
  },
    moc_fild18: {
    region: "Deserto de Sograt",
    description: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
     descriptionEntries: [
      {
        title: "Deserto de Sograt 18",
        images: [
          {
            src: "assets/moc_fild18large.gif",
          },
        ],
        text: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
      },
            
    ], 
  },
    mjolnir_01:{
    region: "Monte Mjolnir",
    description: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
    descriptionEntries: [
      {
        title: "Monte Mjolnir 01.",
        images: [
          {
            src: "assets/mjolnir_01large.gif",
          },
        ],
        text: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
      },
            
    ], 
  },
   mjolnir_02:{
    region: "Monte Mjolnir",
    description: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
    descriptionEntries: [
      {
        title: "Monte Mjolnir 02.",
        images: [
          {
            src: "assets/mjolnir_02large.gif",
          },
        ],
        text: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
      },
            
    ], 
  },
   mjolnir_03:{
    region: "Monte Mjolnir",
    description: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
    descriptionEntries: [
      {
        title: "Monte Mjolnir 03.",
        images: [
          {
            src: "assets/mjolnir_03large.gif",
          },
        ],
        text: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
      },
            
    ], 
  },
   mjolnir_04:{
    region: "Monte Mjolnir",
    description: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
 descriptionEntries: [
      {
        title: "Monte Mjolnir 04.",
        images: [
          {
            src: "assets/mjolnir_04large.gif",
          },
        ],
        text: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
      },
            
    ], 
  },
   mjolnir_05:{
    region: "Monte Mjolnir",
    description: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
    descriptionEntries: [
      {
        title: "Monte Mjolnir 05.",
        images: [
          {
            src: "assets/mjolnir_05large.gif",
          },
        ],
        text: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
      },
            
    ], 
  },
   mjolnir_06:{
    region: "Monte Mjolnir",
    description: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
    descriptionEntries: [
      {
        title: "Monte Mjolnir 06.",
        images: [
          {
            src: "assets/mjolnir_06large.gif",
          },
        ],
        text: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
      },
            
    ], 
  },
   mjolnir_07:{
    region: "Monte Mjolnir",
    description: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
    descriptionEntries: [
      {
        title: "Monte Mjolnir 07.",
        images: [
          {
            src: "assets/mjolnir_07large.gif",
          },
        ],
        text: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
      },
            
    ], 
  },
   mjolnir_08:{
    region: "Monte Mjolnir",
    description: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
    descriptionEntries: [
      {
        title: "Monte Mjolnir 08.",
        images: [
          {
            src: "assets/mjolnir_08large.gif",
          },
        ],
        text: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
      },
            
    ], 
  },
   mjolnir_09:{
    region: "Monte Mjolnir",
    description: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
    descriptionEntries: [
      {
        title: "Monte Mjolnir 09.",
        images: [
          {
            src: "assets/mjolnir_09large.gif",
          },
        ],
        text: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
      },
            
    ], 
  },
   mjolnir_10:{
    region: "Monte Mjolnir",
    description: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
    descriptionEntries: [
      {
        title: "Monte Mjolnir 10.",
        images: [
          {
            src: "assets/mjolnir_10large.gif",
          },
        ],
        text: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
      },
            
    ], 
  },
   mjolnir_11:{
    region: "Monte Mjolnir",
    description: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
    descriptionEntries: [
      {
        title: "Monte Mjolnir 11.",
        images: [
          {
            src: "assets/mjolnir_11large.gif",
          },
        ],
        text: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
      },
            
    ], 
  },
   mjolnir_12:{
    region: "Monte Mjolnir",
    description: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
    descriptionEntries: [
      {
        title: "Monte Mjolnir 12.",
        images: [
          {
            src: "assets/mjolnir_12large.gif",
          },
        ],
        text: "Encostas rochosas marcadas por tempestades. Kobolds, Golems e minérios raros aguardam os exploradores destemidos.",
      },
            
    ], 
  },
    izlu2dun: {
    name:"Arquipélago de Byalan",
    region: "Arquipélago de Byalan",
    description: "Conjunto de ilhas e cavernas submersas. Monstros aquáticos protegem o acesso às profundezas marinhas.",
    descriptionEntries: [
      {
        title: "Arquipélago Byalan.",
        images: [
          {
            src: "assets/izlu2dunlarge.gif",
          },
        ],
        text: "Conjunto de ilhas e cavernas submersas. Monstros aquáticos protegem o acesso às profundezas marinhas.",
      },
            
    ], 
  },
  prt_sewb1: {
    name: "Esgotos de Prontera",
    region: "Subterrâneo de Prontera",
    description:
      "Primeiro nível da rede de esgotos da capital. Iniciantes enfrentam Ratts, Tarântulas e ladrões que se escondem nas sombras.",
    descriptionEntries: [
      {
        title: "Entrada pelos bueiros",
        images: [
          {
            src: "",
          },
        ],
        text:
          "Bueiros espalhados pela capital levam aos túneis. É uma área recomendada para aprendizes treinarem antes das cavernas mais perigosas.",
      },
    ],
  },
  pay_dun00: {
    name: "Caverna de Payon",
    region: "Florestas de Payon",
    description:
      "Galerias escavadas na montanha onde os habitantes veneram os espíritos ancestrais. Morcegos e zumbis vagam pelos corredores.",
    descriptionEntries: [
      {
        title: "Salões ancestrais",
        images: [
          {
            src: "",
          },
        ],
        text:
          "O primeiro andar apresenta corredores amplos com armadilhas simples. A expedição exige tochas e cura para enfrentar mortos-vivos.",
      },
    ],
  },
  gef_dun00: {
    name: "Torre de Geffen",
    region: "Cidade dos Magos",
    description:
      "Entrada da torre amaldiçoada. Aprendizes testam suas magias contra Verits e Kobolds enquanto descem os pavimentos.",
    descriptionEntries: [
      {
        title: "Base da torre",
        images: [
          {
            src: "",
          },
        ],
        text:
          "A torre fica no coração de Geffen. Portais mágicos controlam o acesso entre os andares e permitem treinos supervisionados.",
      },
    ],
  },
  moc_pryd01: {
    name: "Pirâmides de Morroc",
    region: "Deserto de Sograt",
    description:
      "Ruínas antigas erguidas pelo povo do deserto. Múmias e soldados amaldiçoados protegem tesouros enterrados sob Morroc.",
    descriptionEntries: [
      {
        title: "Salões arenosos",
        images: [
          {
            src: "",
          },
        ],
        text:
          "Escadarias escondidas levam aos níveis inferiores. O calor seco mistura-se com energia mística deixada pelos antigos guardiões.",
      },
    ],
  },
  iz_dun00: {
    name: "Caverna Submarina de Byalan",
    region: "Arquipélago de Byalan",
    description:
      "Passagens inundadas conectam as grutas da ilha. Hidras e criaturas aquáticas protegem o caminho para o interior do calabouço.",
    descriptionEntries: [
      {
        title: "Corredores alagados",
        images: [
          {
            src: "",
          },
        ],
        text:
          "O primeiro nível mistura plataformas secas e poças profundas. Armas elementais e acessórios contra Água ajudam a sobrevivência.",
      },
    ],
  },
  treasure1: {
    name: "Navio Fantasma",
    region: "....",
    description:
      ".....",
    descriptionEntries: [
      {
        title: "Acampamento orc",
        images: [
          {
            src: "",
          },
        ],
        text:
          ".........",
      },
    ],
  },

};

const EXPLORE_MAP_IMAGE_FALLBACKS = {
  "alb2trea": "assets/alb2trealarge.gif",
  "alberta": "assets/albertalarge.gif",
  "gef_dun00": "assets/gef_dun00large.gif",
  "gef_dun01": "assets/gef_dun01large.gif",
  "gef_dun02": "assets/gef_dun02large.gif",
  "gef_fild00": "assets/gef_fild00large.gif",
  "gef_fild01": "assets/gef_fild01large.gif",
  "gef_fild02": "assets/gef_fild02large.gif",
  "gef_fild03": "assets/gef_fild03large.gif",
  "gef_fild04": "assets/gef_fild04large.gif",
  "gef_fild05": "assets/gef_fild05large.gif",
  "gef_fild06": "assets/gef_fild06large.gif",
  "gef_fild07": "assets/gef_fild07large.gif",
  "gef_fild08": "assets/gef_fild08large.gif",
  "gef_fild09": "assets/gef_fild09large.gif",
  "gef_fild10": "assets/gef_fild10large.gif",
  "gef_fild11": "assets/gef_fild11large.gif",
  "gef_fild12": "assets/gef_fild12large.gif",
  "gef_fild13": "assets/gef_fild13large.gif",
  "gef_fild14": "assets/gef_fild14large.gif",
  "geffen": "assets/geffenlarge.gif",
  "glast_01": "assets/glast_01large.gif",
  "iz_dun00": "assets/iz_dun00large.gif",
  "iz_dun01": "assets/iz_dun01large.gif",
  "iz_dun02": "assets/iz_dun02large.gif",
  "iz_dun03": "assets/iz_dun03large.gif",
  "iz_dun04": "assets/iz_dun04large.gif",
  "izlu2dun": "assets/izlu2dunlarge.gif",
  "izlude": "assets/izludelarge.gif",
  "mjolnir_01": "assets/mjolnir_01large.gif",
  "mjolnir_02": "assets/mjolnir_02large.gif",
  "mjolnir_03": "assets/mjolnir_03large.gif",
  "mjolnir_04": "assets/mjolnir_04large.gif",
  "mjolnir_05": "assets/mjolnir_05large.gif",
  "mjolnir_06": "assets/mjolnir_06large.gif",
  "mjolnir_07": "assets/mjolnir_07large.gif",
  "mjolnir_08": "assets/mjolnir_08large.gif",
  "mjolnir_09": "assets/mjolnir_09large.gif",
  "mjolnir_10": "assets/mjolnir_10large.gif",
  "mjolnir_11": "assets/mjolnir_11large.gif",
  "mjolnir_12": "assets/mjolnir_12large.gif",
  "moc_fild01": "assets/moc_fild01large.gif",
  "moc_fild02": "assets/moc_fild02large.gif",
  "moc_fild03": "assets/moc_fild03large.gif",
  "moc_fild07": "assets/moc_fild07large.gif",
  "moc_fild11": "assets/moc_fild11large.gif",
  "moc_fild12": "assets/moc_fild12large.gif",
  "moc_fild13": "assets/moc_fild13large.gif",
  "moc_fild16": "assets/moc_fild16large.gif",
  "moc_fild17": "assets/moc_fild17large.gif",
  "moc_fild18": "assets/moc_fild18large.gif",
  "moc_fild19": "assets/moc_fild19large.gif",
  "moc_pryd01": "assets/moc_pryd01large.gif",
  "moc_pryd02": "assets/moc_pryd02large.gif",
  "moc_pryd03": "assets/moc_pryd03large.gif",
  "moc_pryd04": "assets/moc_pryd04large.gif",
  "moc_ruins": "assets/moc_ruinslarge.gif",
  "morocc": "assets/morocclarge.gif",
  "pay_arche": "assets/pay_archelarge.gif",
  "pay_dun00": "assets/pay_dun00large.gif",
  "pay_dun01": "assets/pay_dun01large.gif",
  "pay_dun02": "assets/pay_dun02large.gif",
  "pay_dun03": "assets/pay_dun03large.gif",
  "pay_dun04": "assets/pay_dun04large.gif",
  "pay_fild01": "assets/pay_fild01large.gif",
  "pay_fild02": "assets/pay_fild02large.gif",
  "pay_fild03": "assets/pay_fild03large.gif",
  "pay_fild04": "assets/pay_fild04large.gif",
  "pay_fild05": "assets/pay_fild05large.gif",
  "pay_fild06": "assets/pay_fild06large.gif",
  "pay_fild07": "assets/pay_fild07large.gif",
  "pay_fild08": "assets/pay_fild08large.gif",
  "pay_fild09": "assets/pay_fild09large.gif",
  "pay_fild10": "assets/pay_fild10large.gif",
  "pay_fild11": "assets/pay_fild11large.gif",
  "payon": "assets/payonlarge.gif",
  "prontera": "assets/pronteralarge.gif",
  "prt_fild00": "assets/prt_fild00large.gif",
  "prt_fild01": "assets/prt_fild01large.gif",
  "prt_fild02": "assets/prt_fild02large.gif",
  "prt_fild03": "assets/prt_fild03large.gif",
  "prt_fild04": "assets/prt_fild04large.gif",
  "prt_fild05": "assets/prt_fild05large.gif",
  "prt_fild06": "assets/prt_fild06large.gif",
  "prt_fild07": "assets/prt_fild07large.gif",
  "prt_fild08": "assets/prt_fild08large.gif",
  "prt_fild09": "assets/prt_fild09large.gif",
  "prt_fild10": "assets/prt_fild10large.gif",
  "prt_fild11": "assets/prt_fild11large.gif",
  "prt_sewb1": "assets/prt_sewb1large.gif",
  "prt_sewb2": "assets/prt_sewb2large.gif",
  "prt_sewb3": "assets/prt_sewb3large.gif",
  "prt_sewb4": "assets/prt_sewb4large.gif",
  "treasure01": "assets/treasure01large.gif",
  "treasure02": "assets/treasure02large.gif",
};

const EXPLORE_MAP_DEFAULT_DETAIL = {
  title: "Detalhes do mapa",
  description:
    "Clique em um campo do mosaico para visualizar a descrição completa daquela região.",
  slugText: "Nenhum mapa selecionado.",
  entries: [
    {
      text: "Clique em um tile para ver a descrição daquela área.",
      images: [],
    },
  ],
};

let activeExploreTile = null;
let currentExploreMapVariant = EXPLORE_DEFAULT_VARIANT;

function getRouteColorOption(colorKey) {
  const normalized = typeof colorKey === "string" ? colorKey.trim().toLowerCase() : "";
  const fallback = EXPLORE_ROUTE_COLORS[0];
  if (!normalized) {
    return fallback;
  }

  return EXPLORE_ROUTE_COLORS.find(option => option.key === normalized) || fallback;
}

function rebuildRouteSelectionIndex() {
  exploreRouteState.selectionIndex.clear();
  exploreRouteState.selections.forEach((entry, index) => {
    if (!entry || !entry.slug) {
      return;
    }
    exploreRouteState.selectionIndex.set(String(entry.slug).toLowerCase(), index);
  });
}

function updateRoutePlannerAddButtonLabel(button, colorOption) {
  if (!button) {
    return;
  }

  const option = colorOption || getRouteColorOption(exploreRouteState.selectedColorKey);
  const baseLabel = "Adicionar à trilha";
  if (option) {
    button.textContent = `${baseLabel} (${option.label})`;
  } else {
    button.textContent = baseLabel;
  }
}

function setActiveRouteColor(colorKey) {
  const option = getRouteColorOption(colorKey);
  exploreRouteState.selectedColorKey = option.key;

  const container = document.getElementById("exploreRouteColorOptions");
  if (container) {
    Array.from(container.querySelectorAll(".route-color-chip")).forEach(button => {
      const isActive = button.dataset.colorKey === option.key;
      button.classList.toggle("is-selected", isActive);
      if (isActive) {
        button.setAttribute("aria-pressed", "true");
      } else {
        button.setAttribute("aria-pressed", "false");
      }
    });
  }

  const addBtn = document.getElementById("exploreRouteAddBtn");
  updateRoutePlannerAddButtonLabel(addBtn, option);
}

function renderRouteColorOptions(container) {
  if (!container) {
    return;
  }

  container.innerHTML = "";

  EXPLORE_ROUTE_COLORS.forEach(option => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "route-color-chip";
    button.dataset.colorKey = option.key;
    button.style.setProperty("--chip-color", option.color);
    button.textContent = option.label;
    button.setAttribute("role", "button");
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      setActiveRouteColor(option.key);
    });
    container.appendChild(button);
  });
}

function initExploreRoutePlanner() {
  const planner = document.getElementById("exploreRoutePlanner");
  const track = document.getElementById("exploreRouteTrack");

  if (!planner || !track) {
    return;
  }

  const colorContainer = document.getElementById("exploreRouteColorOptions");
  renderRouteColorOptions(colorContainer);
  setActiveRouteColor(exploreRouteState.selectedColorKey);

  const addBtn = document.getElementById("exploreRouteAddBtn");
  if (addBtn && !addBtn.dataset.routeBound) {
    addBtn.addEventListener("click", handleAddActiveTileToRoute);
    addBtn.dataset.routeBound = "true";
  }

  renderExploreRouteCards();

  if (currentExploreMapVariant === EXPLORE_ROUTE_VARIANT_KEY && activeExploreTile) {
    const slug = activeExploreTile.dataset.map;
    if (slug) {
      updateRoutePlannerSelection(slug, activeExploreTile.getAttribute("aria-label") || formatExploreMapLabel(slug));
    }
  } else {
    resetRoutePlannerSelection();
  }

  toggleRoutePlannerVisibility(currentExploreMapVariant === EXPLORE_ROUTE_VARIANT_KEY);
}

function toggleRoutePlannerVisibility(shouldShow) {
  const planner = document.getElementById("exploreRoutePlanner");
  const track = document.getElementById("exploreRouteTrack");

  [planner, track].forEach(element => {
    if (!element) {
      return;
    }
    if (shouldShow) {
      element.hidden = false;
      element.setAttribute("aria-hidden", "false");
    } else {
      element.hidden = true;
      element.setAttribute("aria-hidden", "true");
    }
  });
}

function resetRoutePlannerSelection() {
  const statusEl = document.getElementById("exploreRouteStatus");
  const intelEl = document.getElementById("exploreRouteIntel");
  const addBtn = document.getElementById("exploreRouteAddBtn");

  if (statusEl) {
    statusEl.textContent = "Selecione um mapa no mosaico para começar.";
  }

  if (intelEl) {
    intelEl.hidden = true;
    intelEl.innerHTML = "";
  }

  if (addBtn) {
    addBtn.disabled = true;
  }
}

function renderRoutePlannerIntel(intel) {
  const intelEl = document.getElementById("exploreRouteIntel");
  if (!intelEl) {
    return;
  }

  intelEl.hidden = false;
  intelEl.innerHTML = "";

  const title = document.createElement("h5");
  title.textContent = "Monstropédia";
  intelEl.appendChild(title);

  if (intel && intel.error) {
    const paragraph = document.createElement("p");
    paragraph.textContent = intel.recommendedLevelText || "Não foi possível consultar os dados de monstros.";
    intelEl.appendChild(paragraph);
    return;
  }

  if (!intel || !Array.isArray(intel.monsters) || intel.monsters.length === 0) {
    const paragraph = document.createElement("p");
    paragraph.textContent = "Ainda não foram encontrados monstros catalogados para este mapa.";
    intelEl.appendChild(paragraph);
    return;
  }

  const levelParagraph = document.createElement("p");
  levelParagraph.innerHTML = `<strong>Nível recomendado:</strong> ${intel.recommendedLevelText}`;
  intelEl.appendChild(levelParagraph);

  if (intel.dominantMonster) {
    const dominantParagraph = document.createElement("p");
    const raceText = intel.dominantMonster.race && intel.dominantMonster.race !== "—"
      ? ` • Classe ${intel.dominantMonster.race}`
      : "";
    dominantParagraph.innerHTML = `<strong>Monstro predominante:</strong> ${intel.dominantMonster.name} • ${intel.dominantMonster.levelText} • ${intel.dominantMonster.baseExpText}${raceText}`;
    intelEl.appendChild(dominantParagraph);
  }

  const listIntro = document.createElement("p");
  listIntro.textContent = "Monstros identificados:";
  intelEl.appendChild(listIntro);

  const list = document.createElement("ul");
  list.className = "explore-route-monster-list";
  intel.monsters.forEach(monster => {
    list.appendChild(createRouteMonsterListItem(monster));
  });

  intelEl.appendChild(list);
}

function updateRoutePlannerSelection(slug, label) {
  if (currentExploreMapVariant !== EXPLORE_ROUTE_VARIANT_KEY) {
    return;
  }

  const statusEl = document.getElementById("exploreRouteStatus");
  const addBtn = document.getElementById("exploreRouteAddBtn");
  const intelEl = document.getElementById("exploreRouteIntel");

  if (!slug) {
    resetRoutePlannerSelection();
    return;
  }

  if (statusEl) {
    statusEl.textContent = `Mapa selecionado: ${label}`;
  }

  if (addBtn) {
    addBtn.disabled = false;
  }

  if (intelEl) {
    intelEl.hidden = false;
    intelEl.innerHTML = "<p>Consultando banco de monstros...</p>";
  }

  const requestId = ++currentRouteIntelRequestId;

  resolveMapMonsterIntel(slug, label)
    .then(intel => {
      if (requestId !== currentRouteIntelRequestId) {
        return;
      }
      renderRoutePlannerIntel(intel);
    })
    .catch(() => {
      if (requestId !== currentRouteIntelRequestId) {
        return;
      }
      if (intelEl) {
        intelEl.hidden = false;
        intelEl.innerHTML = "<p>Não foi possível consultar os dados de monstros agora.</p>";
      }
    });
}

function createRouteCard(entry, index) {
  const card = document.createElement("article");
  card.className = "explore-route-card";
  card.setAttribute("role", "listitem");
  card.style.setProperty("--route-color", entry.color);

  const header = document.createElement("header");
  header.className = "explore-route-card__header";

  const step = document.createElement("p");
  step.className = "explore-route-card__step";
  step.textContent = `Etapa ${index + 1}`;
  header.appendChild(step);

  const title = document.createElement("h4");
  title.className = "explore-route-card__title";
  title.textContent = entry.name;
  header.appendChild(title);

  const badge = document.createElement("span");
  badge.className = "explore-route-card__badge";
  badge.textContent = entry.colorLabel;
  header.appendChild(badge);

  card.appendChild(header);

  const media = document.createElement("div");
  media.className = "explore-route-card__media";



  const body = document.createElement("div");
  body.className = "explore-route-card__body";

  const meta = document.createElement("div");
  meta.className = "explore-route-card__meta";


  const levelSpan = document.createElement("span");
  meta.appendChild(levelSpan);

 

  body.appendChild(meta);

  const summary = document.createElement("p");
  summary.className = "explore-route-card__intel";
  const hasMonsterIntel = Array.isArray(entry.monsters) && entry.monsters.length > 0;
  
  body.appendChild(summary);

  if (hasMonsterIntel) {
    const list = document.createElement("ul");
    list.className = "explore-route-card__monsters explore-route-monster-list";
    entry.monsters.forEach(monster => {
      list.appendChild(createRouteMonsterListItem(monster));
    });
    body.appendChild(list);
  }

  media.appendChild(body);
  card.appendChild(media);

  const footer = document.createElement("footer");
  footer.className = "explore-route-card__footer";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "btn-secondary explore-route-card__remove";
  removeBtn.textContent = "Remover da trilha";
  removeBtn.addEventListener("click", () => {
    removeRouteSelection(entry.slug);
  });

  footer.appendChild(removeBtn);
  card.appendChild(footer);

  return card;
}

function renderExploreRouteCards() {
  const container = document.getElementById("exploreRouteCards");
  const emptyStateEl = document.getElementById("exploreRouteEmpty");

  if (!container) {
    return;
  }

  const entries = exploreRouteState.selections.filter(entry => entry && entry.variant === EXPLORE_ROUTE_VARIANT_KEY);

  container.innerHTML = "";

  if (!entries.length) {
    if (emptyStateEl) {
      emptyStateEl.hidden = false;
    }
    return;
  }

  if (emptyStateEl) {
    emptyStateEl.hidden = true;
  }

  entries.forEach((entry, index) => {
    const card = createRouteCard(entry, index);
    container.appendChild(card);
  });
}

function syncExploreRouteHighlights() {
  const gridEl = document.getElementById("exploreMapGrid");
  if (!gridEl) {
    return;
  }

  const highlightedTiles = gridEl.querySelectorAll(".explore-map__tile--route");
  highlightedTiles.forEach(tile => {
    tile.classList.remove("explore-map__tile--route");
    tile.style.removeProperty("--route-color");
  });

  exploreRouteState.selections.forEach(entry => {
    if (!entry || entry.variant !== EXPLORE_ROUTE_VARIANT_KEY) {
      return;
    }

    const tile = gridEl.querySelector(`.explore-map__tile[data-map="${entry.slug}"]`);
    if (!tile) {
      return;
    }

    tile.classList.add("explore-map__tile--route");
    tile.style.setProperty("--route-color", entry.color);
  });
}

function addOrUpdateRouteSelection(entry) {
  if (!entry || !entry.slug) {
    return;
  }

  const normalizedSlug = String(entry.slug).toLowerCase();
  if (exploreRouteState.selectionIndex.has(normalizedSlug)) {
    const currentIndex = exploreRouteState.selectionIndex.get(normalizedSlug);
    exploreRouteState.selections.splice(currentIndex, 1);
  }

  exploreRouteState.selections.push(entry);
  rebuildRouteSelectionIndex();
}

function removeRouteSelection(slug) {
  const normalizedSlug = typeof slug === "string" ? slug.toLowerCase() : "";
  if (!normalizedSlug) {
    return;
  }

  if (!exploreRouteState.selectionIndex.has(normalizedSlug)) {
    return;
  }

  const index = exploreRouteState.selectionIndex.get(normalizedSlug);
  exploreRouteState.selections.splice(index, 1);
  rebuildRouteSelectionIndex();
  renderExploreRouteCards();
  syncExploreRouteHighlights();
}

async function handleAddActiveTileToRoute() {
  if (!activeExploreTile || currentExploreMapVariant !== EXPLORE_ROUTE_VARIANT_KEY) {
    return;
  }

  const slug = activeExploreTile.dataset.map;
  if (!slug) {
    return;
  }

  const detail = resolveExploreMapDetail(slug);
  const label = detail?.name || formatExploreMapLabel(slug);
  const colorOption = getRouteColorOption(exploreRouteState.selectedColorKey);
  const addBtn = document.getElementById("exploreRouteAddBtn");
  const originalLabel = addBtn ? addBtn.textContent : "";

  try {
    if (addBtn) {
      addBtn.disabled = true;
      addBtn.textContent = "Adicionando...";
    }

    const entry = await buildRouteEntry(slug, label, colorOption, activeExploreTile);
    addOrUpdateRouteSelection(entry);
    renderExploreRouteCards();
    syncExploreRouteHighlights();
  } catch (error) {
    console.error("Não foi possível adicionar o mapa à trilha:", error);
  } finally {
    if (addBtn) {
      addBtn.disabled = false;
      addBtn.textContent = originalLabel || "Adicionar à trilha";
      updateRoutePlannerAddButtonLabel(addBtn, colorOption);
    }
  }
}

async function buildRouteEntry(slug, label, colorOption, tile) {
  const variant = currentExploreMapVariant;
  const detail = resolveExploreMapDetail(slug, label);
  const intel = await resolveMapMonsterIntel(slug, label);
  const tileImage = tile?.querySelector("img");
  const resolvedImage = resolveExploreMapImage(slug) || tileImage?.src || "";

  return {
    slug,
    name: detail?.name || label,
    region: detail?.region || "",
    color: colorOption.color,
    colorKey: colorOption.key,
    colorLabel: colorOption.label,
    image: resolvedImage,
    variant,
    recommendedLevel: intel?.recommendedLevelText || "Dados indisponíveis",
    dominantMonster: intel?.dominantMonster || null,
    monsters: intel?.monsters || [],
  };
}

async function resolveMapMonsterIntel(slug, label) {
  const normalizedSlug = String(slug || "").trim().toLowerCase();

  if (!normalizedSlug) {
    return {
      slug: normalizedSlug,
      label: label || "",
      monsters: [],
      recommendedLevelText: "Dados indisponíveis",
      dominantMonster: null,
    };
  }

  if (exploreRouteState.monsterIntelCache.has(normalizedSlug)) {
    return exploreRouteState.monsterIntelCache.get(normalizedSlug);
  }

  let database;
  try {
    database = await fetchMonsterDatabase();
  } catch (error) {
    console.warn("Falha ao consultar o banco de monstros:", error);
    return {
      slug: normalizedSlug,
      label: label || "",
      monsters: [],
      recommendedLevelText: "Não foi possível consultar os monstros.",
      dominantMonster: null,
      error: true,
    };
  }

  const monsters = Array.isArray(database?.monsters) ? database.monsters : [];
  const matches = monsters.filter(monster => {
    if (!monster) {
      return false;
    }
    const spawnList = Array.isArray(monster.spawn) ? monster.spawn : [];
    return spawnList.some(spawn => String(spawn?.map || "").trim().toLowerCase() === normalizedSlug);
  });

  const intelMonsters = matches.map(monster => {
    const level = typeof monster.level === "number" && !Number.isNaN(monster.level) ? monster.level : null;
    const baseExp = Number(monster?.stats?.baseExp ?? 0);
    const jobExp = Number(monster?.stats?.jobExp ?? 0);

    return {
      id: monster.id,
      name: monster.name || `Monstro ${monster.id || "?"}`,
      level,
      levelText: level !== null ? `Nv. ${level}` : "Nível não informado",
      baseExp,
      baseExpText: baseExp > 0 ? `${formatNumberForLocale(baseExp)} EXP Base` : "EXP Base —",
      jobExp,
      jobExpText: jobExp > 0 ? `${formatNumberForLocale(jobExp)} EXP Classe` : "",
      race: monster.race || "—",
      image: resolveMonsterImage(monster),
    };
  });

  intelMonsters.sort((a, b) => {
    const levelA = typeof a.level === "number" ? a.level : Number.MAX_SAFE_INTEGER;
    const levelB = typeof b.level === "number" ? b.level : Number.MAX_SAFE_INTEGER;

    if (levelA !== levelB) {
      return levelA - levelB;
    }

    const expA = Number.isFinite(a.baseExp) ? a.baseExp : 0;
    const expB = Number.isFinite(b.baseExp) ? b.baseExp : 0;
    if (expA !== expB) {
      return expB - expA;
    }

    return a.name.localeCompare(b.name, "pt-BR");
  });

  const levelValues = intelMonsters
    .map(monster => monster.level)
    .filter(level => typeof level === "number" && !Number.isNaN(level));

  let recommendedLevelText = "Dados de nível indisponíveis";
  let levelRange = null;

  if (levelValues.length) {
    const minLevel = Math.min(...levelValues);
    const maxLevel = Math.max(...levelValues);
    levelRange = { min: minLevel, max: maxLevel };
    recommendedLevelText = minLevel === maxLevel ? `Nv. ${minLevel}` : `Nv. ${minLevel} - ${maxLevel}`;
  }

  let dominantMonster = null;
  if (intelMonsters.length) {
    dominantMonster = intelMonsters.slice().sort((a, b) => {
      const expDiff = (b.baseExp || 0) - (a.baseExp || 0);
      if (expDiff !== 0) {
        return expDiff;
      }

      const levelDiff = (b.level || 0) - (a.level || 0);
      if (levelDiff !== 0) {
        return levelDiff;
      }

      return a.name.localeCompare(b.name, "pt-BR");
    })[0];
  }

  const intel = {
    slug: normalizedSlug,
    label: label || "",
    monsters: intelMonsters,
    recommendedLevelText,
    levelRange,
    dominantMonster,
  };

  exploreRouteState.monsterIntelCache.set(normalizedSlug, intel);
  return intel;
}

function formatRouteMonsterSummary(monster) {
  if (!monster) {
    return "Monstro desconhecido";
  }

  const name = monster.name || "Monstro desconhecido";
  const details = [];
  if (monster.levelText) {
    details.push(monster.levelText);
  }
  if (monster.baseExpText) {
    details.push(monster.baseExpText);
  }
  if (monster.jobExpText) {
    details.push(monster.jobExpText);
  }

  const detailSuffix = details.length ? ` • ${details.join(" • ")}` : "";
  const raceSuffix = monster.race && monster.race !== "—" ? ` • ${monster.race}` : "";

  return `${name}${detailSuffix}${raceSuffix}`;
}

function createRouteMonsterListItem(monster) {
  const item = document.createElement("li");
  item.className = "explore-route-monster";

  const iconWrapper = document.createElement("span");
  iconWrapper.className = "explore-route-monster__icon";

  if (monster && monster.image) {
    const iconImage = document.createElement("img");
    iconImage.className = "explore-route-monster__icon-image";
    iconImage.src = monster.image;
    iconImage.alt = "";
    iconImage.loading = "lazy";
    iconImage.decoding = "async";
    iconWrapper.appendChild(iconImage);
  } else {
    const fallbackLetter = monster && monster.name ? monster.name.charAt(0).toUpperCase() : "?";
    iconWrapper.textContent = fallbackLetter;
    iconWrapper.classList.add("explore-route-monster__icon--placeholder");
    iconWrapper.setAttribute("aria-hidden", "true");
  }

  item.appendChild(iconWrapper);

  const text = document.createElement("span");
  text.className = "explore-route-monster__text";
  text.textContent = formatRouteMonsterSummary(monster);
  item.appendChild(text);

  return item;
}

function getExploreMapVariant(variantKey = currentExploreMapVariant) {
  if (variantKey && Object.prototype.hasOwnProperty.call(EXPLORE_MAP_VARIANTS, variantKey)) {
    return EXPLORE_MAP_VARIANTS[variantKey];
  }

  return EXPLORE_MAP_VARIANTS[EXPLORE_DEFAULT_VARIANT];
}

function getExploreVariantLabel(variantKey = currentExploreMapVariant) {
  const variant = getExploreMapVariant(variantKey);
  return variant && variant.label ? variant.label : "";
}

function updateExploreTabs(activeVariant, { focusTab = false } = {}) {
  const tabs = Array.from(document.querySelectorAll(".explore-tab"));
  let activeTabEl = null;

  tabs.forEach(tab => {
    const variantKey = tab.dataset.variant;
    const isActive = variantKey === activeVariant;

    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
    tab.tabIndex = isActive ? 0 : -1;

    if (!tab.getAttribute("role")) {
      tab.setAttribute("role", "tab");
    }
    if (!tab.getAttribute("aria-controls")) {
      tab.setAttribute("aria-controls", "exploreVariantPanel");
    }

    if (!tab.id) {
      const safeKey = (variantKey || `tab-${Math.random().toString(36).slice(2)}`).replace(/[^a-z0-9_-]/gi, "");
      tab.id = `exploreTab-${safeKey}`;
    }

    if (isActive) {
      activeTabEl = tab;
    }
  });

  if (focusTab && activeTabEl) {
    activeTabEl.focus();
  }

  const panel = document.getElementById("exploreVariantPanel");
  if (panel) {
    if (!panel.getAttribute("role")) {
      panel.setAttribute("role", "tabpanel");
    }
    if (activeTabEl && activeTabEl.id) {
      panel.setAttribute("aria-labelledby", activeTabEl.id);
    }
  }

  return activeTabEl;
}

function toggleExploreVariantViews(activeVariantKey) {
  const fieldsView = document.getElementById("exploreFieldsView");
  const dungeonsView = document.getElementById("exploreDungeonsView");

  const isDungeons = activeVariantKey === EXPLORE_DUNGEON_VARIANT_KEY;

  if (fieldsView) {
    const showFields = !isDungeons;
    fieldsView.hidden = !showFields;
    fieldsView.setAttribute("aria-hidden", showFields ? "false" : "true");
  }

  if (dungeonsView) {
    dungeonsView.hidden = !isDungeons;
    dungeonsView.setAttribute("aria-hidden", isDungeons ? "false" : "true");
  }

  toggleRoutePlannerVisibility(!isDungeons);
  if (isDungeons) {
    resetRoutePlannerSelection();
  }
}

function activateExploreVariant(variantKey, options = {}) {
  const variant = getExploreMapVariant(variantKey);
  if (!variant) {
    return;
  }

  currentExploreMapVariant = variant.key;
  toggleExploreVariantViews(variant.key);

  if (variant.key === EXPLORE_DUNGEON_VARIANT_KEY) {
    initExploreDungeons();
  } else {
    renderExploreMap(variant.key);
    if (variant.key === EXPLORE_ROUTE_VARIANT_KEY) {
      initExploreRoutePlanner();
    }
  }

  updateExploreTabs(variant.key, options);
}

function getDungeonPreviewImage(slug, detail) {
  if (EXPLORE_DUNGEON_BACKGROUNDS[slug]) {
    return EXPLORE_DUNGEON_BACKGROUNDS[slug];
  }

  if (detail && Array.isArray(detail.entries)) {
    for (const entry of detail.entries) {
      if (!entry || !Array.isArray(entry.images)) {
        continue;
      }

      const imageWithSource = entry.images.find(image => image && image.src);
      if (imageWithSource) {
        return imageWithSource.src;
      }
    }
  }

  return "";
}

function getAvailableDungeonSlugs() {
  return EXPLORE_DUNGEON_ORDER.filter(slug => Boolean(EXPLORE_MAP_DETAILS[slug]));
}

function updateDungeonDetails(slug, { empty = false } = {}) {
  const titleEl = document.getElementById("dungeonDetailsTitle");
  const regionEl = document.getElementById("dungeonDetailsRegion");
  const descriptionEl = document.getElementById("dungeonDetailsDescription");
  const imageEl = document.getElementById("dungeonPreviewImage");
  const placeholderEl = document.getElementById("dungeonPreviewPlaceholder");
  const detailsContainer = document.getElementById("dungeonDetails");

  if (!titleEl || !regionEl || !descriptionEl || !imageEl || !placeholderEl) {
    return;
  }

  if (!slug) {
    const defaultTitle = empty ? "Sem calabouços disponíveis" : "Selecione um calabouço";
    const defaultDescription = empty
      ? "Assim que novos calabouços forem liberados, eles aparecerão aqui."
      : "Escolha um calabouço na lista para ver suas informações principais.";

    titleEl.textContent = defaultTitle;
    regionEl.textContent = "";
    regionEl.hidden = true;
    descriptionEl.textContent = defaultDescription;

    imageEl.hidden = true;
    imageEl.removeAttribute("src");
    imageEl.alt = "";

    placeholderEl.hidden = false;
    placeholderEl.textContent = empty
      ? "Nenhum calabouço disponível no momento."
      : "Selecione um calabouço para ver detalhes.";

    if (detailsContainer) {
      detailsContainer.setAttribute("aria-hidden", empty ? "true" : "false");
    }

    return;
  }

  const detail = resolveExploreMapDetail(slug);
  const previewSrc = getDungeonPreviewImage(slug, detail);

  titleEl.textContent = detail.name || formatExploreMapLabel(slug);

  if (detail.region) {
    regionEl.textContent = `Região: ${detail.region}`;
    regionEl.hidden = false;
  } else {
    regionEl.textContent = "";
    regionEl.hidden = true;
  }

  descriptionEl.textContent = detail.description || "";

  if (previewSrc) {
    imageEl.hidden = false;
    imageEl.src = previewSrc;
    imageEl.alt = detail.name || formatExploreMapLabel(slug);
    placeholderEl.hidden = true;
  } else {
    imageEl.hidden = true;
    imageEl.removeAttribute("src");
    imageEl.alt = "";
    placeholderEl.hidden = false;
    placeholderEl.textContent = "Imagem em breve.";
  }

  if (detailsContainer) {
    detailsContainer.setAttribute("aria-hidden", "false");
  }
}

function setActiveDungeonSlug(slug, { focus = false } = {}) {
  const availableSlugs = getAvailableDungeonSlugs();

  if (!availableSlugs.length) {
    activeDungeonSlug = null;
    updateDungeonDetails(null, { empty: true });
    return;
  }

  if (!slug || !availableSlugs.includes(slug)) {
    slug = availableSlugs[0];
  }

  activeDungeonSlug = slug;

  const buttons = Array.from(document.querySelectorAll(".dungeon-select-button"));
  let focusTarget = null;

  buttons.forEach(button => {
    const isActive = button.dataset.slug === slug;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.tabIndex = isActive ? 0 : -1;

    if (isActive) {
      focusTarget = button;
    }
  });

  if (focus && focusTarget) {
    focusTarget.focus();
  }

  updateDungeonDetails(slug);
}

function renderExploreDungeons() {
  const listEl = document.getElementById("dungeonList");
  const emptyStateEl = document.getElementById("dungeonEmptyState");

  if (!listEl || !emptyStateEl) {
    return;
  }

  listEl.innerHTML = "";

  const availableSlugs = getAvailableDungeonSlugs();

  if (!availableSlugs.length) {
    listEl.hidden = true;
    emptyStateEl.hidden = false;
    setActiveDungeonSlug(null);
    return;
  }

  listEl.hidden = false;
  emptyStateEl.hidden = true;

  const fragment = document.createDocumentFragment();

  availableSlugs.forEach(slug => {
    const detail = resolveExploreMapDetail(slug);
    const item = document.createElement("li");
    item.className = "dungeon-select-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "dungeon-select-button";
    button.dataset.slug = slug;
    button.textContent = detail.name || formatExploreMapLabel(slug);
    button.setAttribute("role", "option");
    button.tabIndex = -1;

    button.addEventListener("click", () => {
      setActiveDungeonSlug(slug);
    });

    button.addEventListener("keydown", event => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
      }

      event.preventDefault();

      const currentIndex = availableSlugs.indexOf(slug);
      if (currentIndex === -1) {
        return;
      }

      if (event.key === "ArrowDown") {
        const nextSlug = availableSlugs[(currentIndex + 1) % availableSlugs.length];
        setActiveDungeonSlug(nextSlug, { focus: true });
      } else if (event.key === "ArrowUp") {
        const prevSlug =
          availableSlugs[(currentIndex - 1 + availableSlugs.length) % availableSlugs.length];
        setActiveDungeonSlug(prevSlug, { focus: true });
      }
    });

    item.appendChild(button);
    fragment.appendChild(item);
  });

  listEl.appendChild(fragment);

  setActiveDungeonSlug(activeDungeonSlug);
}

function initExploreDungeons() {
  if (hasInitializedExploreDungeons) {
    renderExploreDungeons();
    return;
  }

  renderExploreDungeons();
  hasInitializedExploreDungeons = true;
}

function initExploreMap() {
  currentExploreMapVariant = EXPLORE_DEFAULT_VARIANT;

  const tabButtons = Array.from(document.querySelectorAll(".explore-tab"));
  const panel = document.getElementById("exploreVariantPanel");
  const hasMapGrid = Boolean(document.getElementById("exploreMapGrid"));
  const hasDungeonView = Boolean(document.getElementById("dungeonList"));

  if (panel && !panel.getAttribute("role")) {
    panel.setAttribute("role", "tabpanel");
  }

  if (tabButtons.length) {
    const focusByIndex = index => {
      if (!tabButtons.length) {
        return;
      }
      const normalizedIndex = (index + tabButtons.length) % tabButtons.length;
      const targetTab = tabButtons[normalizedIndex];
      if (targetTab) {
        activateExploreVariant(targetTab.dataset.variant, { focusTab: true });
      }
    };

    tabButtons.forEach((tab, index) => {
      if (!tab.dataset.variant) {
        tab.dataset.variant = index === 0 ? EXPLORE_DEFAULT_VARIANT : "";
      }

      if (!tab.id) {
        const variantKey = tab.dataset.variant || `tab-${index}`;
        tab.id = `exploreTab-${variantKey}`;
      }

      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "exploreVariantPanel");

      tab.addEventListener("click", () => {
        activateExploreVariant(tab.dataset.variant, { focusTab: false });
      });

      tab.addEventListener("keydown", event => {
        switch (event.key) {
          case "ArrowLeft":
            event.preventDefault();
            focusByIndex(index - 1);
            break;
          case "ArrowRight":
            event.preventDefault();
            focusByIndex(index + 1);
            break;
          case "Home":
            event.preventDefault();
            focusByIndex(0);
            break;
          case "End":
            event.preventDefault();
            focusByIndex(tabButtons.length - 1);
            break;
          case " ":
          case "Enter":
            event.preventDefault();
            activateExploreVariant(tab.dataset.variant, { focusTab: true });
            break;
          default:
            break;
        }
      });
    });

    const initialActiveTab = tabButtons.find(tab => tab.classList.contains("is-active"));
    const initialVariant = getExploreMapVariant(
      initialActiveTab?.dataset.variant || tabButtons[0].dataset.variant || EXPLORE_DEFAULT_VARIANT,
    );

    currentExploreMapVariant = initialVariant.key;
    activateExploreVariant(initialVariant.key);
  } else {
    if (hasMapGrid) {
      renderExploreMap(EXPLORE_DEFAULT_VARIANT);
      initExploreRoutePlanner();
    }

    if (hasDungeonView) {
      initExploreDungeons();
    }
  }
}

function normalizeExploreEntryImages(rawImages, fallbackAlt = "") {
  if (rawImages === undefined || rawImages === null) {
    return [];
  }

  const rawList = Array.isArray(rawImages) ? rawImages : [rawImages];

  return rawList
    .map(imageItem => {
      if (!imageItem) {
        return null;
      }

      if (typeof imageItem === "string") {
        return { src: imageItem, alt: fallbackAlt, caption: "" };
      }

     if (typeof imageItem === "object") {
        const src = imageItem.src || imageItem.url || imageItem.path || imageItem.image;
        if (!src) {
          return null;
        }

        return {
          src,
          alt: imageItem.alt ?? imageItem.caption ?? fallbackAlt,
          caption: imageItem.caption ?? "",
        };
      }

      return null;
    })
    .filter(Boolean);
}

function normalizeExploreDescriptionEntry(entry, fallbackText) {
  if (!entry) {
    return null;
  }

  if (typeof entry === "string") {
    return { text: entry, images: [], title: "" };
  }

  const text = entry.text || entry.description || fallbackText;
  const title = entry.title || entry.name || "";
  const fallbackAlt = entry.alt || title || "";
  const images = normalizeExploreEntryImages(entry.images ?? entry.image ?? [], fallbackAlt);

  return {
    text,
    images,
    title,
  };
}

function resolveExploreMapDetail(slug, label) {
  const normalizedLabel = label || formatExploreMapLabel(slug);
  const direct = EXPLORE_MAP_DETAILS[slug];

  if (direct) {
    const descriptionText =
      direct.description || `Descrição em construção para ${normalizedLabel}.`;
    const entries = [];

    if (Array.isArray(direct.descriptionEntries)) {
      direct.descriptionEntries.forEach(rawEntry => {
        const normalizedEntry = normalizeExploreDescriptionEntry(rawEntry, descriptionText);
        if (normalizedEntry) {
          entries.push(normalizedEntry);
        }
      });
    }

    if (!entries.length) {
      const descriptionImages = normalizeExploreEntryImages(
        direct.descriptionImages ?? direct.descriptionImage ?? [],
        direct.descriptionImageAlt ?? "",
      );

      if (descriptionImages.length) {
        entries.push({ text: descriptionText, images: descriptionImages, title: "" });
      } else {
        entries.push({ text: descriptionText, images: [], title: "" });
      }
    }

    return {
      name: direct.name || normalizedLabel,
      region: direct.region,
      description: descriptionText,
      entries,
    };
  }

  const fallbackText = `Descrição em construção para ${normalizedLabel}.`;
  return {
    name: normalizedLabel,
    description: fallbackText,
    entries: [
      {
        text: fallbackText,
        images: [],
        title: "",
      },
    ],
  };
}

const EXPLORE_MAP_IMAGE_CACHE = new Map();

function resolveExploreMapImage(slug) {
  const normalizedSlug = normalizeStringValue(slug).toLowerCase();

  if (!normalizedSlug) {
    return "";
  }

  if (EXPLORE_MAP_IMAGE_CACHE.has(normalizedSlug)) {
    return EXPLORE_MAP_IMAGE_CACHE.get(normalizedSlug);
  }

  let imageSrc = "";
  const detail = resolveExploreMapDetail(normalizedSlug);

  if (detail && Array.isArray(detail.entries)) {
    for (const entry of detail.entries) {
      if (!entry || !Array.isArray(entry.images)) {
        continue;
      }

      const firstImage = entry.images.find(image => image && image.src);
      if (firstImage) {
        imageSrc = firstImage.src;
        break;
      }
    }
  }

  if (!imageSrc) {
    const fallback = EXPLORE_MAP_IMAGE_FALLBACKS[normalizedSlug];
    if (fallback) {
      imageSrc = ensureAssetPath(fallback);
    }
  }

  EXPLORE_MAP_IMAGE_CACHE.set(normalizedSlug, imageSrc);
  return imageSrc;
}

function setActiveExploreTile(tile) {
  if (activeExploreTile === tile) {
    return;
  }

  if (activeExploreTile) {
    activeExploreTile.classList.remove("is-active");
    activeExploreTile.setAttribute("aria-selected", "false");
  }

  activeExploreTile = tile;

  if (activeExploreTile) {
    activeExploreTile.classList.add("is-active");
    activeExploreTile.setAttribute("aria-selected", "true");
  }
}

function renderExploreDetailEntries(container, detail) {
  if (!container || !detail) {
    return;
  }

  container.innerHTML = "";

  const entries = Array.isArray(detail.entries)
    ? detail.entries.filter(
        entry =>
          entry &&
          (entry.text || (Array.isArray(entry.images) && entry.images.length)),
      )
    : [];

  if (!entries.length) {
    const paragraph = document.createElement("p");
    paragraph.className = "explore-map-details__empty";
    paragraph.textContent =
      detail.description || `Descrição em construção para ${detail.name || "este mapa"}.`;
    container.appendChild(paragraph);
    return;
  }

  entries.forEach(entry => {
    const entryEl = document.createElement("article");
    entryEl.className = "explore-map-details__entry";

    const entryTitle = typeof entry.title === "string" ? entry.title.trim() : "";
    const isMonsterEntry = entryTitle.toLowerCase().includes("monst");

    if (isMonsterEntry) {
      entryEl.classList.add("explore-map-details__entry--monsters");
    }

    if (entry.title) {
      const titleEl = document.createElement("h5");
      titleEl.className = "explore-map-details__entry-title";
      titleEl.textContent = entry.title;
      entryEl.appendChild(titleEl);
    }

    if (Array.isArray(entry.images) && entry.images.length) {
      const mediaWrapper = document.createElement("div");
      mediaWrapper.className = "explore-map-details__entry-media";

      entry.images.forEach(image => {
        if (!image || !image.src) {
          return;
        }

        const figure = document.createElement("figure");
        figure.className = "explore-map-details__entry-figure";

        if (isMonsterEntry) {
          figure.classList.add("explore-map-details__entry-figure--icon");
          figure.tabIndex = -1;
        } else {
          figure.tabIndex = 0;
        }

        const img = document.createElement("img");
        img.src = image.src;
        img.alt = image.alt || "";
        img.loading = "lazy";

        figure.appendChild(img);

        if (!isMonsterEntry) {
          const previewImg = img.cloneNode(true);
          previewImg.classList.add("explore-map-details__entry-image-preview");
          previewImg.setAttribute("aria-hidden", "true");
          previewImg.alt = "";
          previewImg.loading = "lazy";
          figure.appendChild(previewImg);
        }

        if (image.caption) {
          const caption = document.createElement("figcaption");
          caption.textContent = image.caption;
          figure.appendChild(caption);
        }

        mediaWrapper.appendChild(figure);
      });

      entryEl.appendChild(mediaWrapper);
    }

    if (entry.text) {
      const textWrapper = document.createElement("div");
      textWrapper.className = "explore-map-details__entry-text";

      const paragraph = document.createElement("p");
      paragraph.textContent = entry.text;
      textWrapper.appendChild(paragraph);

      entryEl.appendChild(textWrapper);
    }

    container.appendChild(entryEl);
  });
}

function resetExploreMapDetails() {
  const container = document.getElementById("exploreMapDetails");
  if (!container) {
    return;
  }

  const titleEl = container.querySelector("#exploreMapDetailsTitle");
  const descriptionEl = container.querySelector("#exploreMapDetailsDescription");
  const slugEl = container.querySelector("#exploreMapDetailsSlug");

  if (titleEl) {
    titleEl.textContent = EXPLORE_MAP_DEFAULT_DETAIL.title;
  }
  if (descriptionEl) {
    renderExploreDetailEntries(descriptionEl, EXPLORE_MAP_DEFAULT_DETAIL);
  }
  if (slugEl) {
    const parts = [EXPLORE_MAP_DEFAULT_DETAIL.slugText];
    const variantLabel = getExploreVariantLabel();
    if (variantLabel) {
      parts.push(`Visualizando: ${variantLabel}`);
    }
    slugEl.textContent = parts.join(" • ");
  }
  setActiveExploreTile(null);
  if (currentExploreMapVariant === EXPLORE_ROUTE_VARIANT_KEY) {
    resetRoutePlannerSelection();
  }
}

function updateExploreMapDetails(slug, label) {
  const container = document.getElementById("exploreMapDetails");
  if (!container) {
    return;
  }

  const detail = resolveExploreMapDetail(slug, label);
  const titleEl = container.querySelector("#exploreMapDetailsTitle");
  const descriptionEl = container.querySelector("#exploreMapDetailsDescription");
  const slugEl = container.querySelector("#exploreMapDetailsSlug");

  if (titleEl) {
    titleEl.textContent = detail.name;
  }
  if (descriptionEl) {
    renderExploreDetailEntries(descriptionEl, detail);
  }
  if (slugEl) {
    const parts = [];
    if (detail.region) {
      parts.push(detail.region);
    }
    parts.push(`Código: ${slug}`);
    const variantLabel = getExploreVariantLabel();
    if (variantLabel) {
      parts.push(variantLabel);
    }
    slugEl.textContent = parts.join(" • ");
  }
}

function handleExploreTileSelection(tile, slug, label) {
  setActiveExploreTile(tile);
  updateExploreMapDetails(slug, label);
  if (currentExploreMapVariant === EXPLORE_ROUTE_VARIANT_KEY) {
    updateRoutePlannerSelection(slug, label);
  }
}

function formatExploreMapLabel(slug) {
  const override = EXPLORE_MAP_NAME_OVERRIDES[slug];
  if (override) {
    return override;
  }

  const cleaned = slug
    .replace(/_/g, " ")
    .replace(/(\d+)/g, " $1")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned
    .split(" ")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function renderExploreMap(variantKey = currentExploreMapVariant) {
  const variant = getExploreMapVariant(variantKey);
  if (!variant) {
    return;
  }

  currentExploreMapVariant = variant.key;

  const gridEl = document.getElementById("exploreMapGrid");
  if (!gridEl) {
    return;
  }

  resetExploreMapDetails();
  gridEl.innerHTML = "";
  gridEl.dataset.variant = variant.key;
  gridEl.style.setProperty("--explore-cols", variant.dimensions.cols);
  gridEl.style.setProperty("--explore-rows", variant.dimensions.rows);
  gridEl.setAttribute("aria-rowcount", String(variant.dimensions.rows));
  gridEl.setAttribute("aria-colcount", String(variant.dimensions.cols));
  gridEl.setAttribute("aria-label", `Mosaico de ${variant.label}`);

  variant.rows.forEach((row, rowIndex) => {
    row.forEach((token, colIndex) => {
      if (!token || token === ".") {
        return;
      }

      let tileToken = token;
      let customImage = null;

      if (token.includes("::")) {
        const [rawToken, rawImage] = token.split("::");
        tileToken = rawToken || "";
        customImage = rawImage || null;
      }

      if (!tileToken) {
        return;
      }

      const baseName = tileToken.replace(/\.[^.]+$/, "");
      const label = formatExploreMapLabel(baseName);

      const imageFile = customImage || (tileToken.includes(".") ? tileToken : `${baseName}.gif`);
      let imageSrc = imageFile;

      if (!/^https?:/i.test(imageFile) && !imageFile.startsWith("data:")) {
        imageSrc = imageFile.startsWith("assets/") ? imageFile : `assets/${imageFile}`;
      }

      const tile = document.createElement("div");
      tile.className = "explore-map__tile";
      tile.style.setProperty("--row", String(rowIndex + 1));
      tile.style.setProperty("--col", String(colIndex + 1));
      tile.dataset.map = baseName;
      tile.dataset.variant = variant.key;
      tile.setAttribute("role", "gridcell");
      tile.setAttribute("aria-label", label);
      tile.setAttribute("aria-selected", "false");
      tile.tabIndex = 0;

      const img = document.createElement("img");
      img.src = imageSrc;
      img.alt = label;
      img.title = label;

      tile.appendChild(img);
      tile.addEventListener("click", () => {
        handleExploreTileSelection(tile, baseName, label);
      });
      tile.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          tile.click();
        }
      });
      gridEl.appendChild(tile);
    });
  });

  if (variant.key === EXPLORE_ROUTE_VARIANT_KEY) {
    syncExploreRouteHighlights();
  }
}

const PAGES = {
  home: {
    title: " ",
    html: `
      <section class="server-section server-section--general hero-section" aria-labelledby="heroTitle">
        <div class="server-general-card hero-card hero-card--static">
          <div class="hero-card__background" aria-hidden="true">
            <img src="assets/mapraganrok.jpg" alt="" loading="lazy" decoding="async" />
            <div class="hero-card__background-overlay"></div>
          </div>

          <header class="hero-card__content">
            <h2 class="page-title rune-text hero-card__title" id="heroTitle">
              O retorno a Rune-Midgard começa aqui
            </h2>
            <p class="hero-card__lede">
              Respire o ar nostálgico de <strong>Ragnarok Online</strong> com um toque moderno.
              Monte seu grupo, reviva Prontera ao luar e acompanhe cada passo do servidor em um único lugar.
            </p>

             <div class="hero-card__actions">
                <a class="btn-glow" href="https://wasrag.com.br" target="_blank" rel="noopener noreferrer">Entre no Site</a>
                <a class="btn-secondary" href="https://discord.gg/wasrag" target="_blank" rel="noopener noreferrer">
                   Entre no Discord
                </a>
                <a class="btn-glow" href="https://download" target="_blank" rel="noopener noreferrer">Faça o Download</a>

              </div>
          </header>

          <dl class="hero-card__highlight-grid">
            <div class="hero-card__highlight">
              <dt>Episódio atual</dt>
              <dd>
                <span class="hero-card__highlight-value">Episódio 1</span>
                <span class="hero-card__highlight-note">Prontera renasce e abre as portas da aventura</span>
              </dd>
            </div>
            <div class="hero-card__highlight">
              <dt>Estilo de progressão</dt>
              <dd>
                <span class="hero-card__highlight-value">Temporadas escaláveis</span>
                <span class="hero-card__highlight-note">Do casual ao impossível, escolha seu desafio</span>
              </dd>
            </div>
            <div class="hero-card__highlight">
              <dt>Missões do mundo</dt>
              <dd>
                <span class="hero-card__highlight-value">Eventos em tempo real</span>
                <span class="hero-card__highlight-note">Reviva raids clássicas com recompensas inéditas</span>
              </dd>
            </div>
          </dl>

         
        </div>
      </section>

 

      <section class="server-section" aria-labelledby="wikiHighlightsTitle">
        <div class="section-header">
          <h3 class="section-title" id="wikiHighlightsTitle">O que você encontrará aqui...</h3>
        </div>

        <div class="feature-grid" role="list">
          <article class="feature-card" role="listitem">
            <span class="feature-card__icon" aria-hidden="true">✨</span>
            <h4 class="feature-card__title"></h4>
            <p class="feature-card__description">
            </p>
          </article>
          <article class="feature-card" role="listitem">
            <span class="feature-card__icon" aria-hidden="true">📚</span>
            <h4 class="feature-card__title"></h4>
            <p class="feature-card__description">
            </p>
          </article>
          <article class="feature-card" role="listitem">
            <span class="feature-card__icon" aria-hidden="true">🛡️</span>
            <h4 class="feature-card__title"></h4>
            <p class="feature-card__description">
            </p>
          </article>
          <article class="feature-card" role="listitem">
            <span class="feature-card__icon" aria-hidden="true">🎵</span>
            <h4 class="feature-card__title"></h4>
            <p class="feature-card__description">
            </p>
          </article>
        </div>
      </section>
    `
  },

  rules: {
    title: " ",
    html: `
      <section class="server-section server-section--general hero-section rules-hero" aria-labelledby="rulesHeroTitle">
        <div class="hero-card rules-hero-card hero-card--static">
          <div class="hero-card__background" aria-hidden="true">
            <img src="assets/unnamed.jpg" alt="Guardião do código de conduta" loading="lazy" decoding="async" />
            <div class="hero-card__background-overlay"></div>
          </div>

          <header class="hero-card__content">
            <h2 class="page-title rune-text hero-card__title" id="rulesHeroTitle">
              Respeito em primeiro lugar
            </h2>
            <p class="hero-card__lede">
              Construa memórias épicas em Rune-Midgard mantendo o ambiente acolhedor para todo aventureiro.
              Este guia une a comunidade em torno de empatia, jogo limpo e responsabilidade coletiva.
            </p>

            <div class="hero-card__actions">
              <a class="btn-glow" href="https://discord.gg/wasrag" target="_blank" rel="noopener noreferrer">Canal de denúncias</a>
            </div>
          </header>

          <dl class="hero-card__highlight-grid">
            <div class="hero-card__highlight">
              <dt>Comunidade</dt>
              <dd>
                <span class="hero-card__highlight-value">Zero toxicidade</span>
                <span class="hero-card__highlight-note">Empatia acima de qualquer disputa</span>
              </dd>
            </div>
            <div class="hero-card__highlight">
              <dt>Justiça</dt>
              <dd>
                <span class="hero-card__highlight-value">Sem trapaças</span>
                <span class="hero-card__highlight-note">Bots, exploits e abusos não passam</span>
              </dd>
            </div>
            <div class="hero-card__highlight">
              <dt>Proteção</dt>
              <dd>
                <span class="hero-card__highlight-value">Staff acessível</span>
                <span class="hero-card__highlight-note">Canais oficiais para denúncias seguras</span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="server-section rules-pillars" aria-labelledby="rulesPillarsTitle">
        <div class="section-header">
          <h3 class="section-title" id="rulesPillarsTitle">Essência da nossa comunidade</h3>
          <p class="section-subtitle">Três pilares guiam cada interação dentro e fora do jogo.</p>
        </div>
        <div class="rules-pillars__grid" role="list">
          <article class="rules-pillar" role="listitem">
            <span class="rules-pillar__icon" aria-hidden="true">🤝</span>
            <h4 class="rules-pillar__title">Convivência</h4>
            <p class="rules-pillar__description">
              Respeite todos dentro e fora do jogo. Discussões são naturais, ataques pessoais não fazem parte do nosso universo.
            </p>
          </article>
          <article class="rules-pillar" role="listitem">
            <span class="rules-pillar__icon" aria-hidden="true">⚖️</span>
            <h4 class="rules-pillar__title">Jogo limpo</h4>
            <p class="rules-pillar__description">
              Nada de bots, exploits ou vantagens indevidas. A vitória mais memorável é aquela conquistada na raça.
            </p>
          </article>
          <article class="rules-pillar" role="listitem">
            <span class="rules-pillar__icon" aria-hidden="true">🌟</span>
            <h4 class="rules-pillar__title">Comunidade ativa</h4>
            <p class="rules-pillar__description">
              Ajude, compartilhe e denuncie com responsabilidade. O servidor evolui quando cada aventureiro cuida do próximo.
            </p>
          </article>
        </div>
      </section>

      <section class="server-section" aria-labelledby="rulesGuidelinesTitle">
        <div class="section-header">
          <h3 class="section-title" id="rulesGuidelinesTitle">Diretrizes do servidor</h3>
          <p class="section-subtitle">Categorias para navegar rapidamente pelo que é esperado de cada jogador.</p>
        </div>

        <div class="rules-guidelines" role="list">
          <article class="rules-guideline" role="listitem">
            <header class="rules-guideline__header">
              <span class="rules-guideline__icon" aria-hidden="true">🛡️</span>
              <h4 class="rules-guideline__title">Respeito</h4>
            </header>
            <ul class="rules-guideline__list">
              <li><span class="rules-guideline__bullet"></span>Trate todos com respeito, mesmo em desacordos.</li>
              <li><span class="rules-guideline__bullet"></span>Insultos, humilhações, assédio ou preconceito geram punição imediata.</li>
              <li><span class="rules-guideline__bullet"></span>Respeite staff, moderadores e GMs — discordar faz parte, falta de civilidade não.</li>
            </ul>
          </article>

          <article class="rules-guideline" role="listitem">
            <header class="rules-guideline__header">
              <span class="rules-guideline__icon" aria-hidden="true">💬</span>
              <h4 class="rules-guideline__title">Comunicação</h4>
            </header>
            <ul class="rules-guideline__list">
              <li><span class="rules-guideline__bullet"></span>Evite flood, spam e uso excessivo de CAPS LOCK.</li>
              <li><span class="rules-guideline__bullet"></span>É proibido divulgar outros servidores.</li>
              <li><span class="rules-guideline__bullet"></span>Conteúdos sexualmente explícitos, políticos ou religiosos não são permitidos.</li>
              <li><span class="rules-guideline__bullet"></span>Denúncias devem ser feitas em privado com provas (prints, vídeos, etc.).</li>
            </ul>
          </article>

          <article class="rules-guideline" role="listitem">
            <header class="rules-guideline__header">
              <span class="rules-guideline__icon" aria-hidden="true">🎯</span>
              <h4 class="rules-guideline__title">Jogo justo</h4>
            </header>
            <ul class="rules-guideline__list">
              <li><span class="rules-guideline__bullet"></span>É proibido usar bots, macros, exploits ou qualquer tipo de cheat.</li>
              <li><span class="rules-guideline__bullet"></span>Encontrou bug? Reporte imediatamente à staff.</li>
              <li><span class="rules-guideline__bullet"></span>Venda de itens ou contas por dinheiro real é proibida e gera banimento.</li>
            </ul>
          </article>

          <article class="rules-guideline" role="listitem">
            <header class="rules-guideline__header">
              <span class="rules-guideline__icon" aria-hidden="true">💰</span>
              <h4 class="rules-guideline__title">Comércio e economia</h4>
            </header>
            <ul class="rules-guideline__list">
              <li><span class="rules-guideline__bullet"></span>Negociações acontecem dentro do jogo, sem intermediários externos.</li>
              <li><span class="rules-guideline__bullet"></span>Não há reembolso para trocas feitas sem atenção do jogador.</li>
              <li><span class="rules-guideline__bullet"></span>Perdas por descuido ou golpe entre jogadores não são reembolsadas.</li>
              <li><span class="rules-guideline__bullet"></span>Golpes intencionais resultam em ban permanente.</li>
            </ul>
          </article>

          <article class="rules-guideline" role="listitem">
            <header class="rules-guideline__header">
              <span class="rules-guideline__icon" aria-hidden="true">🏷️</span>
              <h4 class="rules-guideline__title">Nomes e aparência</h4>
            </header>
            <ul class="rules-guideline__list">
              <li><span class="rules-guideline__bullet"></span>Nomes de personagens, pets, lojas ou guildas ofensivos ou obscenos são proibidos.</li>
              <li><span class="rules-guideline__bullet"></span>Não se passe por staff ("GM", "Admin", "Helper"...).</li>
              <li><span class="rules-guideline__bullet"></span>Nomes enganosos para aplicar golpes resultam em banimento.</li>
            </ul>
          </article>

          <article class="rules-guideline" role="listitem">
            <header class="rules-guideline__header">
              <span class="rules-guideline__icon" aria-hidden="true">🎟️</span>
              <h4 class="rules-guideline__title">Equipe GM e eventos</h4>
            </header>
            <ul class="rules-guideline__list">
              <li><span class="rules-guideline__bullet"></span>GMs não participam de guildas ou eventos competitivos.</li>
              <li><span class="rules-guideline__bullet"></span>Tratamento igual para todos — não existe “GM amigo”.</li>
              <li><span class="rules-guideline__bullet"></span>Denúncias contra staff devem ser formais no Discord, com provas.</li>
              <li><span class="rules-guideline__bullet"></span>Regras específicas dos eventos se sobrepõem às gerais.</li>
              <li><span class="rules-guideline__bullet"></span>Explorar falhas, usar bots ou sabotar garante desclassificação e ban.</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="server-section rules-callout-section" aria-labelledby="rulesCalloutTitle">
        <div class="rules-callout" role="note">
          <div class="rules-callout__icon" aria-hidden="true">📣</div>
          <div class="rules-callout__content">
            <h4 class="rules-callout__title" id="rulesCalloutTitle">Como denunciar</h4>
            <p>
              Reúna evidências (prints, vídeos ou IDs) e acesse o canal indicado no Discord. A equipe responde dentro de 24 horas
              e mantém seus dados confidenciais.
            </p>
          </div>
        </div>
      </section>

      <section class="server-section rules-penalties-section">
        <div class="section-header">
          <h3 class="section-title">Penalidades padrão</h3>
          <p class="section-subtitle">Infrações graves podem resultar em banimento imediato, independente da coluna “Primeira ocorrência”.</p>
        </div>
        <div class="rules-table-wrapper">
          <div class="table-card rules-penalties-card">
            <table class="rules-penalties" aria-label="Tabela de penalidades por infração">
              <thead>
                <tr>
                  <th scope="col">Tipo de infração</th>
                  <th scope="col">Primeira ocorrência</th>
                  <th scope="col">Reincidência</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Flood / Spam</th>
                  <td>Aviso / Mute 15 min</td>
                  <td>Mute 24h</td>
                </tr>
                <tr>
                  <th scope="row">Ofensas leves</th>
                  <td>Aviso</td>
                  <td>Ban 3 dias</td>
                </tr>
                <tr>
                  <th scope="row">Discurso de ódio / assédio</th>
                  <td>Ban 7 dias</td>
                  <td>Ban permanente</td>
                </tr>
                <tr>
                  <th scope="row">Uso de bot / macro / cheat</th>
                  <td>Ban permanente</td>
                  <td>—</td>
                </tr>
                <tr>
                  <th scope="row">Bug abuse</th>
                  <td>Ban 7 dias + perda de itens</td>
                  <td>Ban permanente</td>
                </tr>
                <tr>
                  <th scope="row">Golpe comercial</th>
                  <td>Ban permanente</td>
                  <td>—</td>
                </tr>
                <tr>
                  <th scope="row">Venda por dinheiro real</th>
                  <td>Ban permanente</td>
                  <td>—</td>
                </tr>
                <tr>
                  <th scope="row">Fake GM / fraude</th>
                  <td>Ban permanente</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `
  },
  server: {
    title: " ",
    html: `
      <section class="server-section server-hero" aria-labelledby="serverHeroTitle">
        <div class="server-hero__background" aria-hidden="true">
          <img src="assets/pronteralarge.gif" alt="" loading="lazy" decoding="async" />
          <div class="server-hero__background-overlay"></div>
        </div>
        <div class="server-hero__layout">
          <div class="server-hero__content">
            <h2 class="server-hero__title" id="serverHeroTitle">Rune-Midgard reimaginada para temporadas</h2>
            <p class="server-hero__description">
              Reviva o pré-renewal com <strong>progressão sazonal</strong>, sistemas autorais e equilíbrio que respeita a nostalgia.
              Prepare sua guilda para caçadas, guerras e descobertas colaborativas.
            </p>
            <ul class="server-hero__meta">
              <li>Conteúdo acompanha o ritmo da comunidade</li>
              <li>Season pass narrativo com recompensas permanentes</li>
              <li>Economia monitorada e sem pay-to-win</li>
            </ul>
          </div>
          <aside class="server-hero__rates" aria-labelledby="serverRatesTitle">
            <h3 class="server-hero__rates-title" id="serverRatesTitle">Rates oficiais</h3>
            <dl class="server-hero__rate-list">
              <div class="server-hero__rate">
                <dt>Experiência Base</dt>
                <dd>1x</dd>
              </div>
              <div class="server-hero__rate">
                <dt>Experiência de Classe</dt>
                <dd>1x</dd>
              </div>
              <div class="server-hero__rate">
                <dt>Quests</dt>
                <dd>1x</dd>
              </div>
              <div class="server-hero__rate">
                <dt>Drop comum</dt>
                <dd>1x</dd>
              </div>
              <div class="server-hero__rate">
                <dt>Drop de cartas</dt>
                <dd>1x</dd>
              </div>
              <div class="server-hero__rate">
                <dt>Drop de MVP</dt>
                <dd>1x</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section class="server-section" aria-labelledby="serverCoreTitle">
        <div class="section-header">
          <h3 class="section-title" id="serverCoreTitle">Essenciais do episódio</h3>
          <p class="section-subtitle">Resumo técnico do servidor para você saber exatamente o que espera da temporada atual.</p>
        </div>
        <div class="server-overview__grid" role="list">
          <dl class="server-stat" role="listitem">
            <dt>Episódio</dt>
            <dd>
              <span class="server-stat__value">Episódio 1</span>
              <p class="server-stat__description">Conteúdo avança com a comunidade a cada temporada.</p>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Tipo</dt>
            <dd>
              <span class="server-stat__value">Pré-renewal</span>
              <p class="server-stat__description">Atmosfera clássica com sistemas customizados.</p>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Base Máxima</dt>
            <dd>
              <span class="server-stat__value">Lv. 99</span>
              <p class="server-stat__description">Progressão tradicional com endgame cooperativo.</p>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Classe Máxima</dt>
            <dd>
              <span class="server-stat__value">Job 50</span>
              <p class="server-stat__description">Distribua pontos suficientes para builds variadas.</p>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>ASPD Máxima</dt>
            <dd>
              <span class="server-stat__value">190</span>
              <p class="server-stat__description">Ritmo clássico preservado para PVE e MVP.</p>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Status Máximo</dt>
            <dd>
              <span class="server-stat__value">99</span>
              <p class="server-stat__description">Metas alcançáveis sem grind infinito.</p>
            </dd>
          </dl>
        </div>
      </section>

      <section class="server-section" aria-labelledby="seasonModesTitle">
        <div class="server-season" role="list">
          <article class="server-season__card" role="listitem">
            <header class="server-season__header">
              <h3 class="section-title" id="seasonModesTitle">Modos de temporada</h3>
              <p class="section-subtitle">Escolha a dificuldade que combina com o seu clã. Os modificadores afetam apenas conteúdos PVE.</p>
            </header>
            <ul class="server-season__modes">
              <li>
                <h4>Fácil</h4>
                <p>+30% de dano em monstros, -30% de dano recebido, mas sem drops raros nem acesso à ranqueada.</p>
              </li>
              <li>
                <h4>Médio</h4>
                <p>Experiência clássica, sem modificadores adicionais. Ideal para reviver a jornada original.</p>
              </li>
              <li>
                <h4>Difícil</h4>
                <p>+10% de bônus de drop, porém -20% de dano causado e +20% de dano recebido.</p>
              </li>
              <li>
                <h4>Impossível</h4>
                <p>+25% de drop, -50% de dano causado e +50% de dano recebido. Desafio para líderes lendários.</p>
              </li>
            </ul>
          </article>
          <article class="server-season__card" role="listitem">
            <h3 class="section-title"> Was, O Rag que já foi e agora é.</h3>
            <img src="assets/prt_fild01large.gif">
          </article>
        </div>
      </section>

      <section class="server-section" aria-labelledby="qualityTitle">
        <div class="section-header">
          <h3 class="section-title" id="qualityTitle">Qualidade de vida e filosofia</h3>
          <p class="section-subtitle">Todo sistema é pensado para dar propósito às suas horas em Rune-Midgard, sem apelar para cash shop.</p>
        </div>
        <div class="server-quality__grid" role="list">
          <article class="server-quality__card" role="listitem">
            <h4>Progressão sem reset</h4>
            <p>Temporadas não apagam seu legado. Personagens, conquistas e teletransportes continuam com você.</p>
          </article>
          <article class="server-quality__card" role="listitem">
            <h4>Economia monitorada</h4>
            <p>Drop tables auditadas e eventos controlam inflação para que toda carta tenha valor real de conquista.</p>
          </article>
          <article class="server-quality__card" role="listitem">
            <h4>Conteúdo colaborativo</h4>
            <p>Exploração por regiões libera buffs permanentes na conta e ativa narrativas inéditas para a comunidade.</p>
          </article>
          <article class="server-quality__card" role="listitem">
            <h4>Suporte ativo</h4>
            <p>Discord oficial com feedback constante, anúncios diários e staff presente em campo.</p>
          </article>
        </div>
      </section>
    `
  },

  roadmap: {
    title: " ",
    html: `
      <section class="server-section server-section--general">
        <div class="">
          

          <div class="server-general-card__grid" role="list">
            <dl class="server-stat" role="listitem">
              <dt>Estado atual</dt>
              <dd>
                <p class="server-stat__description">...</p>
              </dd>
            </dl>
            <dl class="server-stat" role="listitem">
              <dt>Próxima entrega</dt>
              <dd>
                <p class="server-stat__description">...</p>
              </dd>
            </dl>
            <dl class="server-stat" role="listitem">
              <dt>Visão de longo prazo</dt>
              <dd>
                <p class="server-stat__description">...</p>
              </dd>
            </dl>
          </div>
        </div>
      </section>

      <section class="server-section">
        <h3 class="section-title">Linha do tempo</h3>
        <div class="stat-grid" role="list">
          <dl class="server-stat" role="listitem">
            <dt>Temporada 1 · Episódio 1</dt>
            <dd>
              <ul class="stat-list">
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
              </ul>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Temporada 2 · Episódio 2</dt>
            <dd>
              <ul class="stat-list">
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
              </ul>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Temporada 3 · Evolução contínua</dt>
            <dd>
              <ul class="stat-list">
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
              </ul>
            </dd>
          </dl>
        </div>
      </section>
    `
  },

  changelog: {
    title: " ",
    html: `
      <section class="server-section server-section--general">
        <div class="">
          
        </div>
      </section>

      <section class="server-section">
        <h3 class="section-title">Versões</h3>
        <div class="stat-grid" role="list">
          <dl class="server-stat" role="listitem">
            <dt>v1.0.2 · Ajustes iniciais</dt>
            <dd>
              <ul class="stat-list">
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
              </ul>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>v1.0.1 · Lançamento da temporada</dt>
            <dd>
              <ul class="stat-list">
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
              </ul>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Pré-temporada</dt>
            <dd>
              <ul class="stat-list">
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
              </ul>
            </dd>
          </dl>
        </div>
      </section>
    `
  },

  faq: {
    title: " ",
    html: `
  

      <section class="server-section">
        <div class="stat-grid" role="list">
          <dl class="server-stat" role="listitem">
            <dt>O servidor é pay to win?</dt>
            <dd>
              <p class="server-stat__description">Não. A progressão é conquistada jogando: teleporte, bônus de conta e recompensas vêm de missões e temporadas.</p>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Vai ter wipe?</dt>
            <dd>
              <p class="server-stat__description">A proposta é evitar wipes. Trabalhamos com temporadas — você mantém conta, personagens e conquistas.</p>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Como falo com a comunidade?</dt>
            <dd>
              <p class="server-stat__description">Nosso Discord oficial concentra anúncios, suporte, grupos e feedback. O link está nos <strong>Links rápidos</strong> do menu inicial.</p>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Posso contribuir com a wiki?</dt>
            <dd>
              <p class="server-stat__description">Sim! Envie feedback, correções ou novos guias no canal apropriado do Discord — damos crédito à comunidade.</p>
            </dd>
          </dl>
        </div>
      </section>
    `
  },

  teleport: {
    title: " ",
    html: `

      <section class="server-section">
        <div class="stat-grid" role="list">
          <dl class="server-stat" role="listitem">
            <dt>Como funciona</dt>
            <dd>
              <p class="server-stat__description">...</p>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Benefícios</dt>
            <dd>
              <p class="server-stat__description">...</p>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Progressão</dt>
            <dd>
              <p class="server-stat__description">...</p>
            </dd>
          </dl>
        </div>
      </section>
    `
  },

  seasons: {
    title: " ",
    html: `
      

      <section class="server-section">
        <h3 class="section-title">Como funciona</h3>
        <div class="stat-grid" role="list">
          <dl class="server-stat" role="listitem">
            <dt>..</dt>
            <dd>
              <p class="server-stat__description">...</p>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>...</dt>
            <dd>
              <p class="server-stat__description">C...</p>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>...</dt>
            <dd>
              <p class="server-stat__description">...</p>
            </dd>
          </dl>
        </div>
      </section>

      <section class="server-section">
        <h3 class="section-title">Dificuldades disponíveis</h3>
        <div class="stat-grid" role="list">
          <dl class="server-stat" role="listitem">
            <dt>Normal</dt>
            <dd>
              <ul class="stat-list">
               <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
              </ul>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Difícil</dt>
            <dd>
              <ul class="stat-list">
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
              </ul>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Impossível</dt>
            <dd>
              <ul class="stat-list">
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
                <li><span class="bullet-rune"></span>...</li>
              </ul>
            </dd>
          </dl>
        </div>
      </section>

      <section class="server-section">
        <div class="stat-grid" role="list">
          <dl class="server-stat" role="listitem">
            <dt>Por que temporadas?</dt>
            <dd>
              <p class="server-stat__description">...</p>
            </dd>
          </dl>
        </div>
      </section>
    `
  },

  explore: {
    title: " ",
    html: `
      

      <section class="server-section">
        <div class="stat-grid" role="list">
          <dl class="server-stat" role="listitem">
            <dt>Missões regionais</dt>
            <dd>
              <p class="server-stat__description">...</p>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Bônus de conta</dt>
            <dd>
              <p class="server-stat__description">...</p>
            </dd>
          </dl>
          <dl class="server-stat" role="listitem">
            <dt>Sinergia com temporadas</dt>
            <dd>
              <p class="server-stat__description">...</p>
            </dd>
          </dl>
        </div>
      </section>
    `
  },
class: {
    title: " ",
    html: `
    `
},
field: {
    title: " ",
    html: `
      
      <div class="explore-variant-panel" id="exploreVariantPanel" role="region" aria-label="Mosaico de cidades e campos">
        <div class="explore-fields" id="exploreFieldsView">
          <h3 class="explore-subtitle" id="exploreFieldsSubtitle">Atlas de Midgard</h3>
          <div class="explore-map-wrapper">
            <div class="explore-map-scroll">
              <div
                class="explore-map"
                id="exploreMapGrid"
                role="grid"
                aria-label="Mosaico de cidades e campos"
              ></div>
            </div>
            <div
              class="callout-glow explore-map-legend"
              id="exploreMapDetails"
              aria-live="polite"
            >
              <div class="explore-map-details__text">
                <h4 id="exploreMapDetailsTitle">${EXPLORE_MAP_DEFAULT_DETAIL.title}</h4>
                <div class="explore-map-details__description" id="exploreMapDetailsDescription"></div>
                <p class="small" id="exploreMapDetailsSlug">${EXPLORE_MAP_DEFAULT_DETAIL.slugText}</p>
              </div>
              <div
                class="explore-map-legend__actions explore-route-planner"
                id="exploreRoutePlanner"
                role="group"
                aria-label="Adicionar mapas à trilha"
              >
                <div class="explore-map-legend__status-row">
                  <p class="explore-route-planner__status" id="exploreRouteStatus">
                    Selecione um mapa no mosaico para começar.
                  </p>
                  <button
                    class="btn-glow explore-map-legend__add explore-route-planner__add"
                    id="exploreRouteAddBtn"
                    type="button"
                    disabled
                  >
                    Adicionar à trilha
                  </button>
                </div>
                <div
                  class="explore-route-planner__colors explore-map-legend__colors"
                  id="exploreRouteColorOptions"
                  role="list"
                ></div>
                <div class="explore-route-planner__intel" id="exploreRouteIntel" hidden></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section class="server-section explore-route-track" id="exploreRouteTrack" aria-live="polite">
        <div class="explore-route-track__chat" role="group" aria-label="Trilha planejada em formato de chat">
          <header class="explore-route-track__header">
            <h3 class="explore-route-track__title">Trilha planejada</h3>
          </header>
          <div class="explore-route-track__body">
            <p class="explore-route-track__empty" id="exploreRouteEmpty">
              Nenhuma rota planejada ainda. Adicione mapas para montar sua jornada.
            </p>
            <div class="explore-route-track__list" id="exploreRouteCards" role="list"></div>
          </div>
        </div>
      </section>
    `
},
dungeon: {
    title: "Calabouços",
    html: `
      <p class="lead">
        Veja abaixo os calabouços atualmente disponíveis e descubra o que esperar de cada um.
      </p>
      <div class="explore-dungeons" id="exploreDungeonsView">
        <h3 class="explore-subtitle" id="exploreDungeonsSubtitle">Calabouços</h3>
        <div class="dungeon-select-card" id="dungeonSelectCard">
          <div class="dungeon-select-card__list">
            <h4 class="dungeon-select-title">Calabouços disponíveis</h4>
            <p class="dungeon-select-empty" id="dungeonEmptyState" hidden>Nenhum calabouço disponível.</p>
            <ul
              class="dungeon-select-list"
              id="dungeonList"
              role="listbox"
              aria-label="Calabouços disponíveis"
            ></ul>
          </div>
          <div class="dungeon-select-card__details" id="dungeonDetails" aria-live="polite">
            <div class="dungeon-select-details__media">
              <img id="dungeonPreviewImage" alt="" hidden />
              <div class="dungeon-select-details__placeholder" id="dungeonPreviewPlaceholder">
                Selecione um calabouço para ver detalhes.
              </div>
            </div>
            <div class="dungeon-select-details__text">
              <h4 class="dungeon-select-details__title" id="dungeonDetailsTitle">Selecione um calabouço</h4>
              <p class="dungeon-select-details__region" id="dungeonDetailsRegion"></p>
              <p class="dungeon-select-details__description" id="dungeonDetailsDescription">
                Escolha um calabouço na lista para ver suas informações principais.
              </p>
            </div>
          </div>
        </div>
      </div>
    `
},

loot: {
    title: "Itens",
    html: `
    `
},
monster: {
    title: "Monstros",
    html: `
      <section class="monster-database">
        <header class="monster-database__header">
          <dl class="monster-database__meta">
            <div class="monster-database__meta-item">
              <dt>Episódio</dt>
              <dd>Episódio 1</dd>
            </div>
            <div class="monster-database__meta-item">
              <dt>Atualizado em</dt>
              <dd id="monsterMetadataUpdated">—</dd>
            </div>
            <div class="monster-database__meta-item">
              <dt>Total catalogado</dt>
              <dd id="monsterMetadataTotal">—</dd>
            </div>
          </dl>
        </header>

        <form class="monster-database__filters" id="monsterFilters" autocomplete="off">
          <label class="monster-filter">
            <span class="monster-filter__label">Buscar</span>
            <input
              type="search"
              id="monsterSearchInput"
              placeholder="Nome"
              aria-label="Buscar monstros por nome"
            />
          </label>

          <label class="monster-filter">
            <span class="monster-filter__label">Tipo de mapa</span>
            <select id="monsterMapTypeFilter" aria-label="Filtrar por tipo de mapa">
              <option value="all">Todos os tipos</option>
            </select>
          </label>

          <label class="monster-filter">
            <span class="monster-filter__label">Ordenar EXP Base</span>
            <select id="monsterBaseSortFilter" aria-label="Ordenar lista de monstros por EXP Base">
              <option value="default">Padrão (nível)</option>
              <option value="base-desc">EXP Base (maior → menor)</option>
              <option value="base-asc">EXP Base (menor → maior)</option>
            </select>
          </label>

          <label class="monster-filter">
            <span class="monster-filter__label">Ordenar EXP Classe</span>
            <select id="monsterJobSortFilter" aria-label="Ordenar lista de monstros por EXP Classe">
              <option value="default">Padrão (nível)</option>
              <option value="job-desc">EXP Classe (maior → menor)</option>
              <option value="job-asc">EXP Classe (menor → maior)</option>
            </select>
          </label>

          <label class="monster-filter">
            <span class="monster-filter__label">Raça</span>
            <select id="monsterRaceFilter" aria-label="Filtrar por raça">
              <option value="all">Todas as raças</option>
            </select>
          </label>

          <label class="monster-filter">
            <span class="monster-filter__label">Elemento</span>
            <select id="monsterElementFilter" aria-label="Filtrar por elemento">
              <option value="all">Todos os elementos</option>
            </select>
          </label>
        </form>

        <div class="monster-database__summary">
          <p class="monster-database__count" id="monsterResultCount" aria-live="polite">
            Aplique um filtro ou pesquise um monstro para começar.
          </p>
          <p class="monster-database__source">Fonte: cronologia oficial kRO (pré-Renewal).</p>
        </div>

        <div class="monster-database__layout" id="monsterLayout">
          <aside class="monster-database__list-panel">
            <div class="monster-database__status" id="monsterLoadingStatus" role="status" aria-live="assertive">
              Carregando bestiário do Episódio 1...
            </div>
            <ul class="monster-list" id="monsterList" hidden></ul>
          </aside>
          <article class="monster-database__details" id="monsterDetails" aria-live="polite">
            <div class="monster-placeholder">
              <h3 class="monster-placeholder__title">Encontre um monstro</h3>
              <p class="monster-placeholder__description">
                Use a busca ou os filtros para listar as criaturas disponíveis no Episódio 1.
              </p>
            </div>
          </article>
        </div>
      </section>
    `
},
};


const MONSTER_DATA_URL = "assets/data/monsters-episode1.json";
let monsterDataCache = null;
let monsterDataPromise = null;

async function fetchMonsterDatabase() {
  if (monsterDataCache) {
    return monsterDataCache;
  }

  if (monsterDataPromise) {
    return monsterDataPromise;
  }

  monsterDataPromise = window
    .fetch(MONSTER_DATA_URL, { cache: "no-store" })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Falha ao carregar dados de monstros: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      monsterDataCache = data;
      return data;
    })
    .catch(error => {
      monsterDataPromise = null;
      throw error;
    });

  return monsterDataPromise;
}

function formatNumberForLocale(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return value.toLocaleString("pt-BR");
}

function formatDateForLocale(dateString) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function normalizeStringValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtmlAttribute(value) {
  const text = normalizeStringValue(value);
  if (!text) {
    return "";
  }

  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeFilterValue(value) {
  return normalizeStringValue(value).toLowerCase() || "all";
}

function createOptionHtml({ value, label }) {
  return `<option value="${value}">${label}</option>`;
}

function populateSelectOptions(selectEl, placeholderLabel, options) {
  if (!selectEl) return;

  const optionHtml = [`<option value="all">${placeholderLabel}</option>`].concat(
    options.map(createOptionHtml)
  );

  selectEl.innerHTML = optionHtml.join("");
}

function collectMonsterFilters(monsters) {
  const raceMap = new Map();
  const elementMap = new Map();
  const typeMap = new Map();

  monsters.forEach(monster => {
    const raceLabel = normalizeStringValue(monster.race);
    if (raceLabel) {
      const key = raceLabel.toLowerCase();
      if (!raceMap.has(key)) {
        raceMap.set(key, raceLabel);
      }
    }

    const elementLabel = normalizeStringValue(monster.element);
    if (elementLabel) {
      const key = elementLabel.toLowerCase();
      if (!elementMap.has(key)) {
        elementMap.set(key, elementLabel);
      }
    }

    const spawnList = Array.isArray(monster.spawn) ? monster.spawn : [];
    spawnList.forEach(spawn => {
      const typeLabel = normalizeStringValue(spawn.type);
      if (typeLabel) {
        const key = typeLabel.toLowerCase();
        if (!typeMap.has(key)) {
          typeMap.set(key, typeLabel);
        }
      }
    });
  });

  const sorter = (a, b) => a.label.localeCompare(b.label, "pt-BR");

  return {
    races: Array.from(raceMap, ([value, label]) => ({ value, label })).sort(sorter),
    elements: Array.from(elementMap, ([value, label]) => ({ value, label })).sort(sorter),
    mapTypes: Array.from(typeMap, ([value, label]) => ({ value, label })).sort(sorter),
  };
}

function applyMonsterFilters(monsters, filters) {
  const term = normalizeStringValue(filters.term).toLowerCase();
  const mapType = normalizeFilterValue(filters.mapType);
  const race = normalizeFilterValue(filters.race);
  const element = normalizeFilterValue(filters.element);
  const normalizeSortValue = value => {
    const normalized = normalizeStringValue(value).toLowerCase();
    return normalized || "default";
  };
  const baseSort = normalizeSortValue(filters.baseSort);
  const jobSort = normalizeSortValue(filters.jobSort);

  const filtered = monsters.filter(monster => {
    if (race !== "all" && normalizeStringValue(monster.race).toLowerCase() !== race) {
      return false;
    }

    if (element !== "all" && normalizeStringValue(monster.element).toLowerCase() !== element) {
      return false;
    }

    const spawnList = Array.isArray(monster.spawn) ? monster.spawn : [];
    if (mapType !== "all") {
      const hasType = spawnList.some(spawn => normalizeStringValue(spawn.type).toLowerCase() === mapType);
      if (!hasType) {
        return false;
      }
    }

    if (term) {
      const monsterName = normalizeStringValue(monster.name).toLowerCase();

      if (!monsterName || !monsterName.includes(term)) {
        return false;
      }
    }

    return true;
  });

  const getBaseExp = monster => {
    const stats = monster.stats ?? {};
    return typeof stats.baseExp === "number" ? stats.baseExp : 0;
  };

  const getJobExp = monster => {
    const stats = monster.stats ?? {};
    return typeof stats.jobExp === "number" ? stats.jobExp : 0;
  };

  return filtered.sort((a, b) => {
    if (baseSort === "base-desc" || baseSort === "base-asc") {
      const baseA = getBaseExp(a);
      const baseB = getBaseExp(b);

      if (baseA !== baseB) {
        return baseSort === "base-desc" ? baseB - baseA : baseA - baseB;
      }
    }

    if (jobSort === "job-desc" || jobSort === "job-asc") {
      const jobA = getJobExp(a);
      const jobB = getJobExp(b);

      if (jobA !== jobB) {
        return jobSort === "job-desc" ? jobB - jobA : jobA - jobB;
      }
    }

    const levelA = typeof a.level === "number" ? a.level : Number.MAX_SAFE_INTEGER;
    const levelB = typeof b.level === "number" ? b.level : Number.MAX_SAFE_INTEGER;

    if (levelA !== levelB) {
      return levelA - levelB;
    }

    return normalizeStringValue(a.name).localeCompare(normalizeStringValue(b.name), "pt-BR");
  });
}

function ensureAssetPath(src) {
  if (!src) {
    return "";
  }

  if (/^(?:https?:|data:)/i.test(src)) {
    return src;
  }

  if (src.startsWith("/")) {
    return src;
  }

  return src.startsWith("assets/") ? src : `assets/${src}`;
}

function resolveMonsterImage(monster) {
  if (!monster) {
    return "";
  }

  const direct = ensureAssetPath(normalizeStringValue(monster.image));
  if (direct) {
    return direct;
  }

  const id = typeof monster.id === "number" ? String(monster.id) : normalizeStringValue(monster.id);
  if (!id) {
    return "";
  }

  return ensureAssetPath(`assets/data/${id}.gif`);
}

function resolveSpawnMapImage(mapCode) {
  const normalizedMap = normalizeStringValue(mapCode);
  if (!normalizedMap) {
    return "";
  }

  return resolveExploreMapImage(normalizedMap);
}

function getMonsterId(monster) {
  if (!monster) {
    return "";
  }

  if (monster.id != null) {
    return String(monster.id);
  }

  return normalizeStringValue(monster.name) || "";
}

function createMonsterMapChip(spawn) {
  const mapCode = normalizeStringValue(spawn?.map);
  const name = normalizeStringValue(spawn?.name) || mapCode;
  const region = normalizeStringValue(spawn?.region);
  const type = normalizeStringValue(spawn?.type);

  const mapImageSrc = resolveSpawnMapImage(mapCode);
  const mapAltLabel = name && mapCode ? `${name} (${mapCode})` : name || mapCode || "Mapa";

  const titleParts = [];
  if (region) titleParts.push(region);
  if (type) titleParts.push(type);
  if (mapCode) titleParts.push(mapCode);

  const title = escapeHtmlAttribute(titleParts.join(" • "));

  const attributes = [];

  if (title) {
    attributes.push(`title="${title}"`);
  }

  if (mapCode) {
    attributes.push(`data-map-code="${escapeHtmlAttribute(mapCode)}"`);
  }

  if (name) {
    attributes.push(`data-map-name="${escapeHtmlAttribute(name)}"`);
  }

  return `
    <button type="button" class="monster-map-chip"${attributes.length ? ` ${attributes.join(" ")}` : ""}>
      <span class="monster-map-chip__media">
        ${mapImageSrc
          ? `<img src="${mapImageSrc}" alt="${mapAltLabel}" loading="lazy" decoding="async" />`
          : `<span class="monster-map-chip__placeholder" aria-hidden="true">${(mapCode || mapAltLabel || "?")
              .toString()
              .slice(0, 2)
              .toUpperCase()}</span>`}
      </span>
      <span class="monster-map-chip__content u-visually-hidden">
        <span class="monster-map-chip__name">${name || "—"}</span>
        ${mapCode ? `<span class="monster-map-chip__code">${mapCode}</span>` : ""}
      </span>
    </button>
  `;
}

function createMonsterListItem(monster, id, isActive) {
  const imageSrc = resolveMonsterImage(monster);
  const monsterName = normalizeStringValue(monster.name) || "Monstro desconhecido";
  const monsterInitial = monsterName.charAt(0) || "?";
  const monsterImageAlt = `Retrato de ${monsterName}`;
  const levelLabel = typeof monster.level === "number" ? `Nv. ${monster.level}` : null;
  const raceLabel = normalizeStringValue(monster.race);
  const elementLabel = normalizeStringValue(monster.element);

  const metaParts = [levelLabel, raceLabel, elementLabel].filter(Boolean);

  return `
    <li class="monster-list__row">
      <button type="button" class="monster-list__item${isActive ? " is-active" : ""}" data-monster-id="${id}">
        <span class="monster-list__media">
          ${imageSrc
            ? `<img src="${imageSrc}" alt="${monsterImageAlt}" loading="lazy" decoding="async" />`
            : `<span class="monster-list__media-placeholder" aria-hidden="true">${monsterInitial}</span>`}
        </span>
        <span class="monster-list__content">
          <span class="monster-list__name">${monsterName}</span>
          ${metaParts.length ? `<span class="monster-list__meta">${metaParts.join(" • ")}</span>` : ""}
        </span>
      </button>
    </li>
  `;
}

function renderMonsterDetails(monster, context = {}) {
  const detailsEl = document.getElementById("monsterDetails");
  if (!detailsEl) {
    return;
  }

  if (!monster) {
    let title = "Encontre um monstro";
    let description = "Use a busca ou os filtros para listar as criaturas disponíveis no Episódio 1.";

    if (context.reason === "empty") {
      title = "Nenhum resultado";
      description = "Nenhum monstro atende aos filtros atuais. Ajuste os critérios e tente novamente.";
    } else if (context.reason === "error") {
      title = "Erro ao carregar";
      description = "Não foi possível carregar os detalhes do monstro. Tente novamente mais tarde.";
    }

    detailsEl.innerHTML = `
      <div class="monster-placeholder">
        <h3 class="monster-placeholder__title">${title}</h3>
        <p class="monster-placeholder__description">${description}</p>
      </div>
    `;
    return;
  }

  const monsterName = normalizeStringValue(monster.name) || "Monstro desconhecido";
  const monsterInitial = monsterName.charAt(0) || "?";
  const imageSrc = resolveMonsterImage(monster);
  const monsterImageAlt = `Retrato de ${monsterName}`;
  const badges = [];

  if (monster.isMvp) {
    badges.push('<span class="monster-badge monster-badge--mvp">MVP</span>');
  }

  const stats = monster.stats ?? {};
  const hpLabel = stats?.hp != null ? formatNumberForLocale(stats.hp) : "—";
  const baseExpLabel = stats?.baseExp != null ? formatNumberForLocale(stats.baseExp) : "—";
  const jobExpLabel = stats?.jobExp != null ? formatNumberForLocale(stats.jobExp) : "—";
  const levelLabel = typeof monster.level === "number" ? monster.level : "—";

  const infoBlocks = [
    { label: "Nível", value: levelLabel },
    { label: "HP", value: hpLabel },
    { label: "Raça", value: monster.race ?? "—" },
    { label: "Elemento", value: monster.element ?? "—" },
    { label: "Tamanho", value: monster.size ?? "—" },
    { label: "EXP Base", value: baseExpLabel },
    { label: "EXP Classe", value: jobExpLabel },
  ];

  const spawnList = Array.isArray(monster.spawn) ? monster.spawn : [];
  const spawnHtml = spawnList.length
    ? `
        <div class="monster-card__maps" data-monster-map-list>
          ${spawnList.map(createMonsterMapChip).join("")}
        </div>
        <p class="monster-card__map-message" data-monster-map-message hidden aria-live="polite"></p>
      `
    : '<p class="monster-card__empty">Nenhum mapa de aparição registrado.</p>';

  const notesHtml = normalizeStringValue(monster.notes)
    ? `<p class="monster-card__notes">${monster.notes}</p>`
    : "";

  detailsEl.innerHTML = `
    <div class="monster-card">
      <header class="monster-card__header">
        <div class="monster-card__media">
          ${imageSrc
            ? `<img src="${imageSrc}" alt="${monsterImageAlt}" loading="lazy" decoding="async" />`
            : `<span class="monster-card__media-placeholder" aria-hidden="true">${monsterInitial}</span>`}
        </div>
        <div class="monster-card__header-content">
          <h3 class="monster-card__title">${monsterName}</h3>
          ${badges.length ? `<div class="monster-card__badges">${badges.join("")}</div>` : ""}
          ${notesHtml}
        </div>
      </header>

      <section class="monster-card__section" aria-label="Informações gerais do monstro">
        <h4 class="monster-card__section-title">Informações gerais</h4>
        <div class="monster-card__stats">
          ${infoBlocks
            .map(
              block => `
                <div class="monster-card__stat">
                  <span class="monster-card__stat-label">${block.label}</span>
                  <span class="monster-card__stat-value">${block.value}</span>
                </div>
              `
            )
            .join("")}
        </div>
      </section>

      <section class="monster-card__section" aria-label="Locais de aparição">
        <h4 class="monster-card__section-title">Mapas de aparição</h4>
        ${spawnHtml}
      </section>
    </div>
  `;

  setupMonsterMapChipInteractions(detailsEl);
  enhanceKineticHover(detailsEl);
}

function setupMonsterMapChipInteractions(container) {
  if (!container) {
    return;
  }

  const messageEl = container.querySelector("[data-monster-map-message]");
  const chips = Array.from(container.querySelectorAll(".monster-map-chip"));

  if (!messageEl || chips.length === 0) {
    return;
  }

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(item => item.classList.remove("is-selected"));
      chip.classList.add("is-selected");

      const mapCode = normalizeStringValue(chip.dataset.mapCode);
      const mapName = normalizeStringValue(chip.dataset.mapName);
      const hasDistinctName = mapName && mapName !== mapCode;

      let messageBase = "Mapa selecionado.";

      if (mapCode && hasDistinctName) {
        messageBase = `${mapName} — comando /where: ${mapCode}`;
      } else if (mapCode) {
        messageBase = `Comando /where: ${mapCode}`;
      } else if (mapName) {
        messageBase = `Mapa selecionado: ${mapName}`;
      }

      messageEl.textContent = messageBase;
      messageEl.hidden = false;

      if (mapCode) {
        messageEl.dataset.activeMapCode = mapCode;
      } else {
        delete messageEl.dataset.activeMapCode;
      }

      const canUseClipboard =
        mapCode &&
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function";

      if (canUseClipboard) {
        navigator.clipboard.writeText(mapCode).then(
          () => {
            if (messageEl.dataset.activeMapCode === mapCode) {
              messageEl.textContent = `${messageBase} (copiado)`;
            }
          },
          () => {}
        );
      }
    });
  });
}

function renderMonsterExplorer(monsters, context) {
  const listEl = document.getElementById("monsterList");
  const statusEl = document.getElementById("monsterLoadingStatus");
  const countEl = document.getElementById("monsterResultCount");

  if (!listEl || !statusEl || !countEl) {
    return;
  }

  if (context?.showPrompt) {
    statusEl.hidden = false;
    statusEl.textContent = "Aplique um filtro ou pesquise um monstro.";
    listEl.hidden = true;
    listEl.innerHTML = "";
    countEl.textContent = "Aplique um filtro ou pesquise um monstro para começar.";
    renderMonsterDetails(null, { reason: "prompt" });
    return;
  }

  const total = typeof context?.total === "number" ? context.total : context?.fallbackTotal;

  if (monsters.length === 0) {
    statusEl.hidden = false;
    statusEl.textContent = "Nenhum monstro encontrado com os filtros atuais.";
    listEl.hidden = true;
    listEl.innerHTML = "";
    countEl.textContent = "Nenhum monstro encontrado com os filtros atuais.";
    renderMonsterDetails(null, { reason: "empty" });
    return;
  }

  statusEl.hidden = true;
  listEl.hidden = false;

  const items = monsters.map(monster => ({ monster, id: getMonsterId(monster) })).filter(item => item.id);

  let activeId = context?.selectedMonsterId ? String(context.selectedMonsterId) : "";
  if (!activeId || !items.some(item => item.id === activeId)) {
    activeId = items[0]?.id ?? "";
    if (activeId && activeId !== context?.selectedMonsterId && typeof context?.onSelectedChange === "function") {
      context.onSelectedChange(activeId);
      return;
    }
  }

  listEl.innerHTML = items
    .map(({ monster, id }) => createMonsterListItem(monster, id, id === activeId))
    .join("");

  listEl
    .querySelectorAll(".monster-list__item")
    .forEach(button => {
      button.addEventListener("click", () => {
        const clickedId = button.dataset.monsterId || "";
        if (typeof context?.onSelectedChange === "function") {
          context.onSelectedChange(clickedId);
        }
      });
    });

  const activeMonster = items.find(item => item.id === activeId)?.monster ?? null;
  renderMonsterDetails(activeMonster);

  if (total != null) {
    const filteredCount = monsters.length;
    const filteredLabel = filteredCount === 1 ? "monstro" : "monstros";
    const totalLabel = total === 1 ? "monstro" : "monstros";
    countEl.textContent = `${filteredCount} ${filteredLabel} exibido(s) de ${total} ${totalLabel} do Episódio 1.`;
  } else {
    countEl.textContent = `${monsters.length} monstros encontrados.`;
  }
}

function handleMonsterFetchError(error) {
  const statusEl = document.getElementById("monsterLoadingStatus");
  const listEl = document.getElementById("monsterList");
  const countEl = document.getElementById("monsterResultCount");

  if (statusEl) {
    statusEl.hidden = false;
    statusEl.textContent = "Não foi possível carregar o bestiário agora. Tente novamente mais tarde.";
  }

  if (listEl) {
    listEl.hidden = true;
    listEl.innerHTML = "";
  }

  if (countEl) {
    countEl.textContent = "Erro ao carregar a lista de monstros.";
  }

  renderMonsterDetails(null, { reason: "error" });

  // eslint-disable-next-line no-console
  console.error(error);
}

function initMonsterDatabase() {
  const filtersForm = document.getElementById("monsterFilters");
  if (filtersForm) {
    filtersForm.addEventListener("submit", event => {
      event.preventDefault();
    });
  }

  const loadingStatus = document.getElementById("monsterLoadingStatus");
  const listEl = document.getElementById("monsterList");
  if (loadingStatus) {
    loadingStatus.hidden = false;
    loadingStatus.textContent = "Carregando bestiário do Episódio 1...";
  }
  if (listEl) {
    listEl.hidden = true;
    listEl.innerHTML = "";
  }

  fetchMonsterDatabase()
    .then(data => {
      const monsters = Array.isArray(data?.monsters) ? data.monsters : [];
      const metadata = data?.metadata ?? {};
      const totals = {
        total: typeof metadata.total === "number" ? metadata.total : null,
        fallbackTotal: monsters.length,
      };

      const updatedEl = document.getElementById("monsterMetadataUpdated");
      const totalEl = document.getElementById("monsterMetadataTotal");

      if (updatedEl) {
        updatedEl.textContent = formatDateForLocale(metadata.updatedAt);
      }

      const totalValue = totals.total ?? totals.fallbackTotal;
      if (totalEl) {
        const totalLabel = totalValue === 1 ? "1 monstro" : `${totalValue} monstros`;
        totalEl.textContent = totalLabel;
      }

      const filters = collectMonsterFilters(monsters);

      populateSelectOptions(
        document.getElementById("monsterMapTypeFilter"),
        "Todos os tipos",
        filters.mapTypes
      );

      populateSelectOptions(
        document.getElementById("monsterRaceFilter"),
        "Todas as raças",
        filters.races
      );

      populateSelectOptions(
        document.getElementById("monsterElementFilter"),
        "Todos os elementos",
        filters.elements
      );

      const filterState = {
        term: "",
        mapType: "all",
        race: "all",
        element: "all",
        baseSort: "default",
        jobSort: "default",
      };

      let selectedMonsterId = "";

      const updateExplorer = () => {
        const filtered = applyMonsterFilters(monsters, filterState);
        renderMonsterExplorer(filtered, {
          ...totals,
          showPrompt: false,
          selectedMonsterId,
          onSelectedChange(id) {
            if (id !== selectedMonsterId) {
              selectedMonsterId = id;
              updateExplorer();
            }
          },
        });
      };

      const searchInput = document.getElementById("monsterSearchInput");
      if (searchInput) {
        searchInput.value = "";
        searchInput.addEventListener("input", event => {
          filterState.term = event.target.value;
          selectedMonsterId = "";
          updateExplorer();
        });
      }

      const typeSelect = document.getElementById("monsterMapTypeFilter");
      if (typeSelect) {
        typeSelect.value = "all";
        typeSelect.addEventListener("change", event => {
          filterState.mapType = event.target.value;
          selectedMonsterId = "";
          updateExplorer();
        });
      }

      const baseSortSelect = document.getElementById("monsterBaseSortFilter");
      const jobSortSelect = document.getElementById("monsterJobSortFilter");

      if (baseSortSelect) {
        baseSortSelect.value = "default";
        baseSortSelect.addEventListener("change", event => {
          filterState.baseSort = event.target.value;
          if (filterState.baseSort !== "default") {
            filterState.jobSort = "default";
            if (jobSortSelect && jobSortSelect.value !== "default") {
              jobSortSelect.value = "default";
            }
          }
          selectedMonsterId = "";
          updateExplorer();
        });
      }

      if (jobSortSelect) {
        jobSortSelect.value = "default";
        jobSortSelect.addEventListener("change", event => {
          filterState.jobSort = event.target.value;
          if (filterState.jobSort !== "default") {
            filterState.baseSort = "default";
            if (baseSortSelect && baseSortSelect.value !== "default") {
              baseSortSelect.value = "default";
            }
          }
          selectedMonsterId = "";
          updateExplorer();
        });
      }

      const raceSelect = document.getElementById("monsterRaceFilter");
      if (raceSelect) {
        raceSelect.value = "all";
        raceSelect.addEventListener("change", event => {
          filterState.race = event.target.value;
          selectedMonsterId = "";
          updateExplorer();
        });
      }

      const elementSelect = document.getElementById("monsterElementFilter");
      if (elementSelect) {
        elementSelect.value = "all";
        elementSelect.addEventListener("change", event => {
          filterState.element = event.target.value;
          selectedMonsterId = "";
          updateExplorer();
        });
      }

      updateExplorer();
    })
    .catch(error => {
      handleMonsterFetchError(error);
    });
}



const TELEPORT_MAP_CONFIG = {
  rows: 8,
  cols: 10,
};


const TELEPORT_STATUS_LABELS = {
  unlocked: "Desbloqueado",
  progress: "Em progresso",
  locked: "Bloqueado",
};

function getTeleportCellKey(row, col) {
  return `${row}-${col}`;
}

function getTeleportCellLabel(row, col) {
  return `${String.fromCharCode(65 + row)}${col + 1}`;
}

function getTeleportCellData(row, col) {
  return TELEPORT_SPECIALS[getTeleportCellKey(row, col)] ?? null;
}

function describeTeleportCell(info, label) {
  if (info) {
    return info;
  }

  return {
    name: `Quadrante ${label}`,
    status: "locked",
    requirement: "Complete as missões locais para registrar este ponto no Teleporter.",
    reward: "Liberação de um novo ponto de salto na rede de teleporte.",
    description: "Nenhuma equipe completou as missões desta área ainda.",
  };
}

function selectTeleportCell(button, info, label) {
  const titleEl = document.getElementById("teleportInfoTitle");
  const statusEl = document.getElementById("teleportInfoStatus");
  const requirementEl = document.getElementById("teleportInfoRequirement");
  const rewardEl = document.getElementById("teleportInfoReward");
  const descriptionEl = document.getElementById("teleportInfoDescription");

  if (!titleEl || !statusEl || !requirementEl || !rewardEl || !descriptionEl) {
    return;
  }

  document
    .querySelectorAll(".teleport-map__cell.is-selected")
    .forEach(cell => cell.classList.remove("is-selected"));

  button.classList.add("is-selected");

  const data = describeTeleportCell(info, label);

  titleEl.textContent = data.name;
  statusEl.textContent = TELEPORT_STATUS_LABELS[data.status] ?? TELEPORT_STATUS_LABELS.locked;
  requirementEl.textContent = data.requirement;
  rewardEl.textContent = data.reward;
  descriptionEl.textContent = data.description;
}

function renderTeleportMap() {
  const gridEl = document.getElementById("teleportGrid");
  if (!gridEl) return;

  gridEl.innerHTML = "";
  gridEl.style.setProperty("--teleport-cols", TELEPORT_MAP_CONFIG.cols);
  gridEl.style.setProperty("--teleport-rows", TELEPORT_MAP_CONFIG.rows);
  gridEl.setAttribute("aria-rowcount", TELEPORT_MAP_CONFIG.rows);
  gridEl.setAttribute("aria-colcount", TELEPORT_MAP_CONFIG.cols);

  for (let row = 0; row < TELEPORT_MAP_CONFIG.rows; row += 1) {
    for (let col = 0; col < TELEPORT_MAP_CONFIG.cols; col += 1) {
      const label = getTeleportCellLabel(row, col);
      const info = getTeleportCellData(row, col);
      const status = info?.status ?? "locked";

      const cellButton = document.createElement("button");
      cellButton.type = "button";
      cellButton.className = "teleport-map__cell";
      cellButton.dataset.row = String(row);
      cellButton.dataset.col = String(col);
      cellButton.dataset.label = label;
      cellButton.dataset.status = status;
      cellButton.classList.add(`is-${status}`);
      cellButton.setAttribute("role", "gridcell");
      cellButton.setAttribute("aria-label", info ? `${info.name} (${label})` : `Quadrante ${label}`);

      const labelSpan = document.createElement("span");
      labelSpan.className = "teleport-map__cell-label";
      labelSpan.textContent = label;

      cellButton.appendChild(labelSpan);

      cellButton.addEventListener("click", () => {
        selectTeleportCell(cellButton, info, label);
      });

      gridEl.appendChild(cellButton);
    }
  }

  const defaultSelection =
    gridEl.querySelector(".teleport-map__cell.is-unlocked") ||
    gridEl.querySelector(".teleport-map__cell.is-progress") ||
    gridEl.firstElementChild;

  if (defaultSelection && typeof defaultSelection.click === "function") {
    defaultSelection.click();
  }
}

function initTeleportMap() {
  renderTeleportMap();
}


// ===== Navegação lateral =====
const navItems = document.querySelectorAll(".nav-item");
const pageContent = document.getElementById("pageContent");
const sidebar = document.getElementById("sidebarNavigation");
const menuToggle = document.getElementById("menuToggle");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");
const body = document.body;

const MOBILE_BREAKPOINT = 800;

function isMobileView() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function openSidebar() {
  if (!sidebar || !isMobileView()) return;
  sidebar.classList.add("open");
  body.classList.add("sidebar-open");
  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "true");
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.hidden = false;
  }
}

function closeSidebar() {
  if (!sidebar) return;
  sidebar.classList.remove("open");
  body.classList.remove("sidebar-open");
  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.hidden = true;
  }
}

function toggleSidebar() {
  if (!sidebar || !isMobileView()) return;
  const isOpen = sidebar.classList.contains("open");
  if (isOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    toggleSidebar();
  });
}

if (sidebarBackdrop) {
  sidebarBackdrop.addEventListener("click", () => {
    closeSidebar();
  });
}

function loadPage(pageKey) {
  const page = PAGES[pageKey];
  if (!page) return;

  // título principal
  const titleEl = `
    <h2 class="page-title rune-text">${page.title}</h2>
  `;

  // conteúdo
  pageContent.innerHTML = titleEl + page.html;

  if (["explore", "field", "dungeon"].includes(pageKey)) {
    window.requestAnimationFrame(() => {
      initExploreMap();
      enhanceKineticHover(pageContent);
    });
  }

  if (pageKey === "teleport") {
    window.requestAnimationFrame(() => {
      initTeleportMap();
      enhanceKineticHover(pageContent);
    });
  }

  if (pageKey === "monster") {
    window.requestAnimationFrame(() => {
      initMonsterDatabase();
      enhanceKineticHover(pageContent);
    });
  }

  window.requestAnimationFrame(() => {
    enhanceKineticHover(pageContent);
  });

  // highlight ativo no menu
  navItems.forEach(item => {
    if (item.dataset.page === pageKey) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // scroll pro topo ao trocar de página
  document.querySelector(".content-area").scrollTop = 0;
}

navItems.forEach(item => {
  item.addEventListener("click", () => {
    const targetPage = item.dataset.page;
    loadPage(targetPage);
    if (isMobileView()) {
      closeSidebar();
    }
  });
});

document.addEventListener("click", event => {
  const link = event.target.closest('a[data-page]');
  if (!link) {
    return;
  }

  const pageKey = link.dataset.page;
  if (!pageKey) {
    return;
  }

  event.preventDefault();
  loadPage(pageKey);
  if (isMobileView()) {
    closeSidebar();
  }
});

window.addEventListener("resize", () => {
  if (!isMobileView()) {
    closeSidebar();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && sidebar && sidebar.classList.contains("open")) {
    closeSidebar();
  }
});

// ===== Busca básica =====
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

function searchWiki() {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) return;

  // procura termo em título ou html de cada página
  const results = Object.entries(PAGES)
    .filter(([key, data]) => {
      const haystack = (data.title + " " + data.html)
        .replace(/<[^>]+>/g,"") // remove tags
        .toLowerCase();
      return haystack.includes(term);
    })
    .map(([key, data]) => {
      return `<li class="result-item" data-goto="${key}">
        <strong>${data.title}</strong>
        <span>- clique para abrir</span>
      </li>`;
    });

  if (results.length === 0) {
    pageContent.innerHTML = `
      <h2 class="page-title rune-text">Busca: "${term}"</h2>
      <p class="lead">Nada encontrado.</p>
    `;
  } else {
    pageContent.innerHTML = `
      <h2 class="page-title rune-text">Busca: "${term}"</h2>
      <ul class="feature-list">
        ${results.join("")}
      </ul>
    `;

    // tornar itens clicáveis
    pageContent.querySelectorAll(".result-item").forEach(li => {
      li.addEventListener("click", () => {
        loadPage(li.dataset.goto);
        if (isMobileView()) {
          closeSidebar();
        }
      });
    });
  }

  // remove highlight no menu lateral porque agora é página de busca
  navItems.forEach(i => i.classList.remove("active"));
  document.querySelector(".content-area").scrollTop = 0;

  window.requestAnimationFrame(() => {
    enhanceKineticHover(pageContent);
  });
}

searchBtn.addEventListener("click", searchWiki);
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    searchWiki();
  }
});

// efeito de entrada
initTimeWarpEffect();
initAmbientParticles();

// carrega página inicial na abertura
loadPage("home");
