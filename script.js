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

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
gef_fild08.gif gef_fild07.gif geffen.gif gef_fild00.gif prt_fild00.gif mjolnir_09.gif prt_fild01.gif prt_fild02.gif prt_fild03.gif
. gef_fild13.gif gef_fild09.gif gef_fild01.gif prt_fild04.gif gef_fild05.gif prontera.gif prt_fild06.gif . . . . izlu2dun.gif
. . gef_fild10.gif gef_fild03.gif gef_fild02.gif prt_fild07.gif prt_fild08.gif izlude.gif . pay_arche.gif
. . . . prt_fild10.gif prt_fild09.gif moc_fild01.gif pay_fild04.gif .  payon.gif pay_fild08.gif pay_fild09.gif
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
      {
        title: "NPC Custom",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
      {
        title: "NPC Custom",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
      {
        title: "NPC Custom",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
      {
        title: "NPC Custom",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
      {
        title: "NPC Custom",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
      {
        title: "NPC Custom",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
      },
    ],
  },
  alb2trea: {
    name: "Navio Fantasma",
    region: "",
    description: "Entrada para o calabouço de um navio naufragado.",
                descriptionEntries: [
      {
        title: "Navio fantasma",
        images: [
          {
            src: "assets/alb2trealarge.gif",
          },
        ],
        text: "Entrada para o calabouço de um navio naufragado.",
      },
      {
        title: "NPC Custom",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
      {
        title: "NPC Custom",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
      },
    ],
  },
  glast_01: {
    name: "Glast Heim Exterior",
    region: "Ruínas Assombradas",
    description: "Os portões do castelo amaldiçoado. Cavaleiros corrompidos e mortos-vivos patrulham cada corredor em ruínas.",
                        descriptionEntries: [
      {
        title: "Glast Heim Exterior",
        images: [
          {
            src: "assets/glast_01large.gif",
          },
        ],
        text: "Os portões do castelo amaldiçoado. Cavaleiros corrompidos e mortos-vivos patrulham cada corredor em ruínas.",
      },
      {
        title: "NPC Custom",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
      },
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
      {
        title: "NPC Custom",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
      },
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
      },
    ],
    
  },
    gef_fild00: {
    region: "Campos de Geffen",
    description: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
    descriptionEntries: [
      {
        title: "Campos de Geffen 00",
        images: [
          {
            src: "assets/gef_fild00large.gif",
          },
        ],
        text: "Planícies férteis tingidas de magia. Goblins, orcs e flora arcana cercam as rotas que ligam Geffen à capital.",
      },
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
      },
    ], 
  },
    prt_fild00: { 
    region: "Campos de Prontera",
    description: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
    descriptionEntries: [
      {
        title: "Campos de Prontera 00",
        images: [
          {
            src: "assets/prt_fild00large.gif",
          },
        ],
        text: "Pastos tranquilos que fazem a transição entre Prontera e seus vilarejos vizinhos, ideais para os primeiros passos de aventura.",
      },
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
      },
    ], 
  },
    moc_fild19: {
    region: "Deserto de Sograt",
    description: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
     descriptionEntries: [
      {
        title: "Deserto de Sograt 19.",
        images: [
          {
            src: "assets/moc_fild19large.gif",
          },
        ],
        text: "Os arredores áridos de Morroc misturam dunas, ruínas e criaturas acostumadas ao calor extremo do deserto.",
      },
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
            {
        title: "Monstros",
        images: [
          {
            src: "",
            alt: "",
            description:
              "",
          },
          {
            src: "",
            alt: "",
            description:
              "",
          },
        ],
        text: "",
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
        figure.tabIndex = 0;

        const img = document.createElement("img");
        img.src = image.src;
        img.alt = image.alt || "";
        img.loading = "lazy";

        figure.appendChild(img);

        const previewImg = img.cloneNode(true);
        previewImg.classList.add("explore-map-details__entry-image-preview");
        previewImg.setAttribute("aria-hidden", "true");
        previewImg.alt = "";
        previewImg.loading = "lazy";
        figure.appendChild(previewImg);

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
}

const PAGES = {
  home: {
    title: "Bem-vindo ao Was Rag",
    html: `
   <p class="lead">
          Este é a database oficial do servidor
        <strong>Was Rag</strong>, um Ragnarok Online evolutivo que começa no
        <span class="tag-episode">Episódio 1</span> e avança a cada temporada o conteúdo oficial. </p>

      <div class="cards-grid">
        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"><img src=""></div>
          <div class="info-card-content">
            <h3>Filosofia do Servidor</h3>
            <p>
              O foco é <strong>explorar</strong>, não só rushar level.
              Teleportes e bônus da conta são desbloqueados fazendo missões nos
              mapas. Jogar abre caminhos. Literalmente.
            </p>
          </div>
        </div>

        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"><img src=""></div>
          <div class="info-card-content">
            <h3>Progressão em Episódios</h3>
            <p>
              Começamos puro no Episódio 1. Novos episódios são liberados de
              forma progressiva, trazendo mapas, itens e MVPs clássicos — sem
              pular etapas.
            </p>
          </div>
        </div>

        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"><img src=""></div>
          <div class="info-card-content">
            <h3>Temporadas de Dificuldade</h3>
            <p>
              Cada conta escolhe uma dificuldade por temporada
              (<span class="txt-high">Fácil</span>,
              <span class="txt-high">Normal</span>,
              <span class="txt-high">Difícil</span>,
              <span class="txt-high">Impossível</span>).
              Dificuldades maiores: mobs batem mais forte, mas o drop aumenta.
            </p>
          </div>
        </div>

        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"><img src=""></div>
          <div class="info-card-content">
            <h3>Temporada, de 2 meses, com missões</h3>
            <p>
              Toda temporada tem um desafio mundial com prazo real. Completar
              prova que você jogou “de verdade” naquela dificuldade e garante
              recompensas de prestígio.
            </p>
          </div>
        </div>
      </div>

      <hr class="divider" />

      <section class="quick-links">
        <a
          class="quick-card"
          href="https://wasrag.com"
          target="_blank"
          rel="noopener noreferrer"
        >
            <div class="quick-card-badge" aria-hidden="true">
            <img src="">
            </div>
          <h4 class="quick-card-title">Site</h4>
        </a>
        <a
          class="quick-card"
          href="https://wasrag.com/download"
          target="_blank"
          rel="noopener noreferrer"
        >
           <div class="quick-card-badge" aria-hidden="true">
             <img src="">
            </div>
          <h4 class="quick-card-title">Download</h4>
        </a>
        <a
          class="quick-card"
          href="https://discord.gg/wasrag"
          target="_blank"
          rel="noopener noreferrer"
        >
<div class="quick-card-badge" aria-hidden="true">
             <img src="">
            </div>
            <h4 class="quick-card-title">Discord</h4>
        </a>
      </section>
    `
  },

  rules: {
    title: "Regras",
    html: `
      <p class="lead">
        O Was Rag é uma comunidade nostálgica, construída sobre respeito, honestidade e paixão por um Ragnarok autêntico. Nosso foco é reviver a experiência clássica, com maturidade e cooperação — não apenas grindar, mas criar histórias.
      </p>

      <div class="rules-grid">
        <section class="rules-section">
          <h3>1. Respeito</h3>
          <p><span class="bullet-rune"></span>Trate todos com respeito, dentro e fora do jogo.</p>
          <p><span class="bullet-rune"></span>
            Insultos, humilhações, ironias ofensivas, assédio, racismo,
            homofobia ou qualquer tipo de preconceito resultam em punição
            imediata.
          </p>
          <p><span class="bullet-rune"></span>Discussões acaloradas são normais — ataques pessoais, não.</p>
          <p><span class="bullet-rune"></span>
            Respeite staff, moderadores e GMs — mesmo que discorde, mantenha
            civilidade.
          </p>
        </section>

        <section class="rules-section">
          <h3>2. Comunicação e Convivência</h3>
          <p><span class="bullet-rune"></span>Evite flood, spam e CAPS LOCK excessivo.</p>
          <p><span class="bullet-rune"></span>Proibido divulgar outros servidores.</p>
          <p><span class="bullet-rune"></span>Linguagem sexual explícita, política ou religiosa é proibida.</p>
          <p><span class="bullet-rune"></span>
            Denúncias devem ser feitas em privado, com provas (prints, vídeos,
            etc.).
          </p>
        </section>

        <section class="rules-section">
          <h3>3. Jogo Justo</h3>
          <p><span class="bullet-rune"></span>Proibido uso de bots, macros, exploits, cheats e afins.</p>
          <p><span class="bullet-rune"></span>Proibido o uso de bugs — relatar imediatamente à staff.</p>
          <p><span class="bullet-rune"></span>Proibido venda de itens ou contas por dinheiro real.</p>
          <p><span class="bullet-rune"></span>(Isso destrói a economia e causa golpes.)</p>
        </section>

        <section class="rules-section">
          <h3>4. Comércio e Economia</h3>
          <p><span class="bullet-rune"></span>Negociações devem ocorrer dentro do jogo — sem uso de intermediários externos.</p>
          <p><span class="bullet-rune"></span>Não existe reembolso de trocas feitas sem atenção do jogador.</p>
          <p><span class="bullet-rune"></span>Não existe devolução de itens perdidos por descuido ou golpe entre jogadores.</p>
          <p><span class="bullet-rune"></span>(O servidor não se responsabiliza por falta de cautela.)</p>
          <p><span class="bullet-rune"></span>Golpes intencionais.</p>
        </section>

        <section class="rules-section">
          <h3>5. Nomes e Aparência</h3>
          <p><span class="bullet-rune"></span>Nicknames, nomes de pets, lojas e guildas ofensivos ou obscenos são proibidos.</p>
          <p><span class="bullet-rune"></span>Evite se passar por membros da staff (ex: “GM”, “Admin”, “Helper”).</p>
          <p><span class="bullet-rune"></span>Nomes enganosos ou idênticos a outros jogadores para aplicar golpes resultam em ban.</p>
        </section>

        <section class="rules-section">
          <h3>6. GMs</h3>
          <p><span class="bullet-rune"></span>GMs não participam de guildas nem eventos competitivos.</p>
          <p><span class="bullet-rune"></span>Não existe GM amigo — tratamento igual a todos.</p>
          <p><span class="bullet-rune"></span>
            Denúncias contra membros da staff devem ser feitas de forma formal no
            Discord, com provas.
          </p>
          <p><span class="bullet-rune"></span>
            Desrespeito à equipe em público pode resultar em silenciamento ou
            suspensão.
          </p>
          <p><span class="bullet-rune"></span>
            Decisões da staff são finais, mas podem ser revisadas mediante
            recurso bem fundamentado.
          </p>
        </section>

        <section class="rules-section">
          <h3>7. Eventos e Participação</h3>
          <p><span class="bullet-rune"></span>Em eventos, as regras específicas publicadas valem acima das gerais.</p>
          <p><span class="bullet-rune"></span>Explorar falhas em eventos, usar bots ou sabotagem = desclassificação e ban.</p>
          <p><span class="bullet-rune"></span>Premiações são intransferíveis e não substituíveis.</p>
        </section>
      </div>

      <div class="rules-table-wrapper">
        <table class="rules-penalties" aria-label="Tabela de penalidades por infração">
          <thead>
            <tr>
              <th scope="col">Tipo de Infração</th>
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
    `
  },
  server: {
    title: "Sobre o Servidor",
    html: `
      <section class="server-section">
        <h3 class="section-title">Informações Gerais</h3>
        <div class="cards-grid cards-grid--six">
          <div class="info-card">
            <div class="info-card-content">
              <h3>Episódio:</h3>
              <p>
                1 — Evolutivo
              </p>
            </div>
          </div>
          <div class="info-card">
            <div class="info-card-content">
              <h3>Tipo:</h3>
              <p>
                Pré-Renewall
              </p>
            </div>
          </div>
           <div class="info-card">
            <div class="info-card-content">
              <h3>Nível Máximo:</h3>
              <p>
                99
              </p>
            </div>
          </div>
           <div class="info-card">
            <div class="info-card-content">
              <h3>Classe Máxima:</h3>
              <p>
                50
              </p>
            </div>
          </div>
                  <div class="info-card">
            <div class="info-card-content">
              <h3>ASPD Máxima:</h3>
              <p>
                190
              </p>
            </div>
          </div>
                  <div class="info-card">
            <div class="info-card-content">
              <h3>Status Máximo:</h3>
              <p>
                99
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="server-section">
        <h3 class="section-title">Rates do Servidor</h3>
        <div class="cards-grid cards-grid--six">
          <div class="info-card">
            <div class="info-card-content">
              <h3>Rate de Nível</h3>
              <p>
                1x
              </p>
            </div>
          </div>
          <div class="info-card">
            <div class="info-card-content">
              <h3>Rate de Clase</h3>
              <p>
                1x
              </p>
            </div>
          </div>
                  <div class="info-card">
            <div class="info-card-content">
              <h3>Rate de Quest</h3>
              <p>
                1x
              </p>
            </div>
          </div>
                  <div class="info-card">
            <div class="info-card-content">
              <h3>Rate de Drop</h3>
              <p>
                1x
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="server-section">
        <h3 class="section-title">Dificuldade de Temporada — Buff e Debuff não se aplicam a PVP.</h3>
        <div class="cards-grid">
          <div class="info-card">
            <div class="info-card-content">
              <h3>Fácil</h3>
              <p>
                <span class="bullet-rune"></span> Debuff: Não dropa nenhuma carta de monstro normal e loot de Mini-boss e MVP.<br>
                <span class="bullet-rune"></span> Debuff: Não participa da temporada.<br>
                <span class="bullet-rune"></span> Buff: Inflige 30% a mais de dano em todos os monstros.<br>
                <span class="bullet-rune"></span> Buff: Recebe 30% a menos de dano de todo os monstros.<br>
              </p>
            </div>
          </div>
          <div class="info-card">
            <div class="info-card-content">
              <h3>Médio</h3>
              <p>
                <span class="bullet-rune"></span> Nenhum Buff ou Debuff aplicado<br>
              </p>
            </div>
          </div>
              <div class="info-card">
            <div class="info-card-content">
              <h3>Difícil</h3>
              <p>
                <span class="bullet-rune"></span> Buff: 10% de Bonus de Drop.<br>
                <span class="bullet-rune"></span> Debuff: Inflige 20% a menos de dano em todos os monstros.<br>
                <span class="bullet-rune"></span> Debuff: Recebe 20% a mais de dano de todo os monstros.<br>
              </p>
            </div>
          </div>
              <div class="info-card">
            <div class="info-card-content">
              <h3>Impossível</h3>
              <p>
                <span class="bullet-rune"></span> Buff: 25% de Bonus de Drop.<br>
                <span class="bullet-rune"></span> Debuff: Inflige 50% a menos de dano em todos os monstros.<br>
                <span class="bullet-rune"></span> Debuff: Recebe 50% a mais de dano de todo os monstros.<br>
              </p>
            </div>
          </div>
        </div>
      </section>
    `
  },

  roadmap: {
    title: "RoadMap",
    html: `
      <p class="lead">
        Visão geral do que está sendo planejado para o Was RAG. As datas podem mudar, mas a direção deixa claro como o servidor vai evoluir.
      </p>
      <div class="cards-grid">
        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"></div>
          <div class="info-card-content">
            <h3></h3>
            <p>
              ...
            </p>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"></div>
          <div class="info-card-content">
            <h3>...</h3>
            <ul class="feature-list">
              <li><span class="bullet-rune"></span> </li>
              <li><span class="bullet-rune"></span> </li>
              <li><span class="bullet-rune"></span> </li>
            </ul>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"></div>
          <div class="info-card-content">
            <h3>...</h3>
            <p>
            </p>
          </div>
        </div>
      </div>
    `
  },

  changelog: {
    title: "Changelog",
    html: `
      <p class="lead">
        Histórico das atualizações aplicadas ao servidor. Use como
        referência para saber o que mudou desde sua última visita.
      </p>
      <div class="cards-grid">
        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"></div>
          <div class="info-card-content">
            <h3>...</h3>
            <ul class="feature-list">
              <li><span class="bullet-rune"></span> </li>
              <li><span class="bullet-rune"></span> </li>
              <li><span class="bullet-rune"></span> </li>
            </ul>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"></div>
          <div class="info-card-content">
            <h3>...</h3>
            <ul class="feature-list">
              <li><span class="bullet-rune"></span> </li>
              <li><span class="bullet-rune"></span> </li>
              <li><span class="bullet-rune"></span> </li>
            </ul>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"></div>
          <div class="info-card-content">
            <h3>...</h3>
            <p>
            
            </p>
          </div>
        </div>
      </div>
    `
  },

  faq: {
    title: "FAQ",
    html: `
      <div class="cards-grid">
        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"></div>
          <div class="info-card-content">
            <h3>O servidor é pay to win?</h3>
            <p>
              A ideia é longe disso. O foco é progressão jogando, não comprar
              atalho que quebra o que foi pensado e desenvolvido com tanto carinho.
            </p>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"></div>
          <div class="info-card-content">
            <h3>Vai ter wipe?</h3>
            <p>
              Faremos de tudo para que não seja necessário. Existirão apenas <strong>temporadas</strong> mas você mantém sua conta e progresso.
            </p>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"></div>
          <div class="info-card-content">
            <h3>Tem grupo oficial?</h3>
            <p>
              (Colocar link do Discord depois)
            </p>
          </div>
        </div>
      </div>
    `
  },

  teleport: {
    title: "Sistema de Teleporte",
    html: `
      <p class="lead">
        Teleporte não é dado de graça. Você conquista.
      </p>
      <div class="cards-grid">
        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"></div>
          <div class="info-card-content">
            <h3>Como funciona</h3>
            <p>
              Faça missões específicas em uma região para desbloquear o Teleporter
              daquela região. Depois disso sua CONTA inteira pode pular pra lá.
            </p>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-media" aria-hidden="true"></div>
          <div class="info-card-content">
            <h3>Benefícios</h3>
            <p>
              Mobilidade transforma rotas de farm, MVP race e logística de grupo.
            </p>
          </div>
        </div>
      </div>
    `
  },

  seasons: {
    title: "Sistema de Temporada",
    html: `
      <p class="lead">
        Cada temporada dura ~3 meses e exige completar uma missão global.
        Você escolhe a dificuldade pra sua conta:
        Normal, Difícil ou Impossível.
      </p>
      <ul class="feature-list">
        <li><span class="bullet-rune"></span> Normal: experiência clássica.</li>
        <li><span class="bullet-rune"></span> Difícil: mobs batem mais, drop aumenta.</li>
        <li><span class="bullet-rune"></span> Impossível: dor e glória. Recompensas cosméticas de respeito eterno.</li>
      </ul>
      <div class="callout-glow">
        <h4>Por que isso existe?</h4>
        <p>
          Pra você não precisar criar 30 chars novos só pra “recomeçar o jogo”.
          A dificuldade é por conta, por temporada.
        </p>
      </div>
    `
  },

  explore: {
    title: "Sistema de Exploração",
    html: `
      <p class="lead">
        O drop base é clássico, mas certas dificuldades de temporada aplicam
        bônus no loot para recompensar o risco.
      </p>
      <div class="callout-glow">
        <h4>Explorar dá acesso ao mundo</h4>
        <p>
          Faça missões nas regiões para desbloquear teletransportes, bônus de conta e
          descobrir histórias exclusivas. Consulte as seções de
          <strong>Cidades e Campos</strong> e <strong>Calabouços</strong> para ver o
          mosaico de mapas e os calabouços disponíveis.
        </p>
      </div>
    `
  },
class: {
    title: "Classes",
    html: `
    `
},
field: {
    title: "Cidades e Campos",
    html: `
      <p class="lead">
        O mosaico abaixo mostra as cidades e campos liberados. Clique em um tile
        para visualizar detalhes sobre cada região.
      </p>
      <div class="explore-variant-panel" id="exploreVariantPanel" role="region" aria-label="Mosaico de cidades e campos">
        <div class="explore-fields" id="exploreFieldsView">
          <h3 class="explore-subtitle" id="exploreFieldsSubtitle">Cidades e Campos</h3>
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
            </div>
          </div>
        </div>
      </div>
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
    `
},
};


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
    });
  }

  if (pageKey === "teleport") {
    window.requestAnimationFrame(() => {
      initTeleportMap();
    });
  }

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
