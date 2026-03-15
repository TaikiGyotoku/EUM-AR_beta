console.log("%cEUM AR ready", "color: #d4af37; font-size: 28px; font-weight: bold;");

const state = {
  selectedLanguage: "ja",
  currentPlayingId: null,
  isPlaying: false,
  isInfoOpen: false,
  isCreditsOpen: false,
  currentInfoContentId: null,
  audioContext: null,
  audioNodes: {},
  rafId: null,
  isFirstFound: false
};

const SONG_ORDER = ["kyrie", "gloria", "credo", "sanctus", "agnus", "ave"];

const SONG_ASSETS = {
  kyrie: { audioId: "audio-kyrie", playIcon: "#icon-play-1" },
  gloria: { audioId: "audio-gloria", playIcon: "#icon-play-2" },
  credo: { audioId: "audio-credo", playIcon: "#icon-play-3" },
  sanctus: { audioId: "audio-sanctus", playIcon: "#icon-play-4" },
  agnus: { audioId: "audio-agnus", playIcon: "#icon-play-5" },
  ave: { audioId: "audio-ave", playIcon: "#icon-play-6" }
};

const ALWAYS_COUNTS = {
  kyrie: 1,
  gloria: 1,
  credo: 2,
  sanctus: 1,
  agnus: 1,
  ave: 1
};

const PATTERN_COUNTS = {
  kyrie: [1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1],
  gloria: [1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
  credo: [1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1],
  sanctus: [1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1],
  agnus: [1, 1, 2, 1, 1, 2, 1, 2, 1, 1, 2],
  ave: [1, 1, 1, 2, 2, 1, 2, 1]
};

const DUMMY_PATTERN_DURATION = 3;

const makeLayout = (x, y, z) => ({
  root: {
    position: [x, y, z],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
  },
  button: {
    position: [-0.35, 0.22, 0.02],
    size: [0.16, 0.16],
    rotation: [0, 0, 0]
  },
  always: {
    count: 1,
    basePosition: [0.12, 0.05, 0],
    spacing: [0, -0.14, 0],
    size: [0.42, 0.1],
    rotation: [0, 0, 0]
  },
  playback: {
    basePosition: [0.12, -0.05, 0.02],
    patternSpacing: 0.09,
    boxSpacing: 0.22,
    boxSize: [0.22, 0.08],
    rotation: [0, 0, 0]
  }
});

const SONG_LAYOUTS = {
  kyrie: makeLayout(-0.9, 0.45, -1),
  gloria: makeLayout(-0.9, -0.25, -1),
  credo: makeLayout(0, 0.45, -1),
  sanctus: makeLayout(0, -0.25, -1),
  agnus: makeLayout(0.9, 0.45, -1),
  ave: makeLayout(0.9, -0.25, -1)
};

SONG_ORDER.forEach((id) => {
  SONG_LAYOUTS[id].always.count = ALWAYS_COUNTS[id];
});

const translations = {
  ja: {
    infoTitle: "INFO",
    creditsTitle: "CREDITS",
    chantTitle: "グレゴリオ聖歌について",
    chantDesc: "グレゴリオ聖歌は中世の単旋律聖歌です。ネウマ譜と呼ばれる記譜法で記され、祈りの声がガラス壁に刻まれています。ARで譜面を拡張し、空間の響きを体験してください。",
    songInfo: {
      kyrie: { title: "Kyrie", desc: "憐れみの賛歌。冒頭のフレーズを辿りながら祈りの旋律を体験します。" },
      gloria: { title: "Gloria", desc: "栄光の賛歌。明るい旋律の流れを追いながら唱和の高揚を感じます。" },
      credo: { title: "Credo", desc: "信仰宣言。長い流れの中で旋律の変化を丁寧に辿ります。" },
      sanctus: { title: "Sanctus", desc: "感謝の賛歌。短いフレーズの連なりを確認できます。" },
      agnus: { title: "Agnus Dei", desc: "神の小羊。静かな祈りの流れを追います。" },
      ave: { title: "Ave Maria", desc: "聖母マリアへの祈り。柔らかな旋律の起伏を体験します。" }
    },
    creditsBody: "制作: EUM Glass AR Project<br>ディレクション: Taiki G.<br>技術: MindAR / A-Frame<br>公式サイト: <a href=\"https://example.com\" target=\"_blank\" rel=\"noopener\">https://example.com</a><br>Instagram: <a href=\"https://instagram.com/example\" target=\"_blank\" rel=\"noopener\">https://instagram.com/example</a>"
  },
  en: {
    infoTitle: "INFO",
    creditsTitle: "CREDITS",
    chantTitle: "About Gregorian Chant",
    chantDesc: "Gregorian chant is a monophonic sacred song from the medieval period. It is written with neumatic notation and carved into the glass wall. This AR layer expands the notation so you can follow the flow of the chant.",
    songInfo: {
      kyrie: { title: "Kyrie", desc: "A prayer for mercy. Trace the opening phrases as the chant unfolds." },
      gloria: { title: "Gloria", desc: "A song of glory. Follow the bright melodic lines across the wall." },
      credo: { title: "Credo", desc: "A declaration of faith. Notice the long-form progression through the phrases." },
      sanctus: { title: "Sanctus", desc: "A hymn of holiness. Short phrases highlight the chant structure." },
      agnus: { title: "Agnus Dei", desc: "Lamb of God. Experience the quiet flow of the melody." },
      ave: { title: "Ave Maria", desc: "Hail Mary. Follow the gentle rises and falls of the chant." }
    },
    creditsBody: "Production: EUM Glass AR Project<br>Direction: Taiki G.<br>Technology: MindAR / A-Frame<br>Official site: <a href=\"https://example.com\" target=\"_blank\" rel=\"noopener\">https://example.com</a><br>Instagram: <a href=\"https://instagram.com/example\" target=\"_blank\" rel=\"noopener\">https://instagram.com/example</a>"
  }
};

const songObjects = {};
const audioElements = {};

const ui = {
  languageScreen: document.getElementById("language-screen"),
  uiLayer: document.getElementById("ui-layer"),
  infoBtn: document.getElementById("info-btn"),
  creditsBtn: document.getElementById("credits-btn"),
  modalOverlay: document.getElementById("modal-overlay"),
  modalTitle: document.getElementById("modal-title"),
  modalBody: document.getElementById("modal-body")
};

const sceneEl = document.querySelector("a-scene");
const markerAnchor = document.getElementById("marker-anchor");
const arWorldRoot = document.getElementById("ar-world-root");

function toAttr(vec) {
  return vec.join(" ");
}

function initAudioContext() {
  if (state.audioContext) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  state.audioContext = new AudioCtx();

  SONG_ORDER.forEach((id) => {
    const audioId = SONG_ASSETS[id].audioId;
    const el = document.getElementById(audioId);
    if (!el) return;
    audioElements[id] = el;
    if (!state.audioNodes[id]) {
      const source = state.audioContext.createMediaElementSource(el);
      source.connect(state.audioContext.destination);
      state.audioNodes[id] = source;
    }

    el.addEventListener("ended", () => {
      if (state.currentPlayingId === id) {
        stopAll();
      }
    });
  });

  state.audioContext.resume();
}

function selectLanguage(lang) {
  state.selectedLanguage = lang;
  document.documentElement.lang = lang;
  ui.languageScreen.classList.add("hidden");
  ui.uiLayer.classList.remove("hidden");
  initAudioContext();
  startMindAR();
}

function startMindAR() {
  const start = () => sceneEl.systems["mindar-image-system"].start();
  if (sceneEl.hasLoaded) {
    start();
  } else {
    sceneEl.addEventListener("loaded", start, { once: true });
  }
}

function setupLanguageButtons() {
  document.getElementById("btn-ja").addEventListener("click", () => selectLanguage("ja"));
  document.getElementById("btn-en").addEventListener("click", () => selectLanguage("en"));
}

function setupMarkerAnchor() {
  if (!markerAnchor) return;
  markerAnchor.addEventListener("targetFound", () => {
    if (state.isFirstFound) return;
    const worldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();
    const worldScale = new THREE.Vector3();
    markerAnchor.object3D.matrixWorld.decompose(worldPos, worldQuat, worldScale);
    arWorldRoot.object3D.position.copy(worldPos);
    arWorldRoot.object3D.quaternion.copy(worldQuat);
    arWorldRoot.object3D.scale.copy(worldScale);
    arWorldRoot.object3D.visible = true;
    arWorldRoot.object3D.updateMatrixWorld(true);
    state.isFirstFound = true;
  });
}

function createFramePlane({ position, size, rotation, color, opacity }) {
  const plane = document.createElement("a-plane");
  plane.setAttribute("position", toAttr(position));
  plane.setAttribute("rotation", toAttr(rotation));
  plane.setAttribute("width", size[0]);
  plane.setAttribute("height", size[1]);
  plane.setAttribute(
    "material",
    `color: ${color}; opacity: ${opacity}; transparent: true; side: double; wireframe: true;`
  );
  plane.setAttribute("visible", true);
  return plane;
}

function createButton({ position, size, rotation }, src) {
  const button = document.createElement("a-image");
  button.setAttribute("position", toAttr(position));
  button.setAttribute("rotation", toAttr(rotation));
  button.setAttribute("width", size[0]);
  button.setAttribute("height", size[1]);
  button.setAttribute("src", src);
  button.setAttribute("class", "clickable");
  return button;
}

function createAlwaysBoxes(layout) {
  const boxes = [];
  for (let i = 0; i < layout.count; i += 1) {
    const position = [
      layout.basePosition[0] + layout.spacing[0] * i,
      layout.basePosition[1] + layout.spacing[1] * i,
      layout.basePosition[2] + layout.spacing[2] * i
    ];
    const plane = createFramePlane({
      position,
      size: layout.size,
      rotation: layout.rotation,
      color: "#9fa3a7",
      opacity: 0.45
    });
    boxes.push(plane);
  }
  return boxes;
}

function createPlaybackPatternBoxes(playback, patternIndex, count) {
  const boxes = [];
  const baseY = playback.basePosition[1] - playback.patternSpacing * patternIndex;
  const startX = playback.basePosition[0] - ((count - 1) * playback.boxSpacing) / 2;

  for (let i = 0; i < count; i += 1) {
    const position = [
      startX + i * playback.boxSpacing,
      baseY,
      playback.basePosition[2]
    ];
    const plane = createFramePlane({
      position,
      size: playback.boxSize,
      rotation: playback.rotation,
      color: "#ffd24d",
      opacity: 0.65
    });
    plane.setAttribute("visible", false);
    boxes.push(plane);
  }
  return boxes;
}

function buildARContent() {
  SONG_ORDER.forEach((id) => {
    const layout = SONG_LAYOUTS[id];
    const group = document.createElement("a-entity");
    group.setAttribute("id", `song-${id}`);
    group.setAttribute("position", toAttr(layout.root.position));
    group.setAttribute("rotation", toAttr(layout.root.rotation));
    group.setAttribute("scale", toAttr(layout.root.scale));

    const button = createButton(layout.button, SONG_ASSETS[id].playIcon);
    button.setAttribute("data-song-id", id);
    group.appendChild(button);

    const alwaysBoxes = createAlwaysBoxes(layout.always);
    alwaysBoxes.forEach((box) => group.appendChild(box));

    const patternCounts = PATTERN_COUNTS[id];
    const patterns = patternCounts.map((count, index) => {
      const boxes = createPlaybackPatternBoxes(layout.playback, index, count);
      boxes.forEach((box) => group.appendChild(box));
      return {
        start: index * DUMMY_PATTERN_DURATION,
        end: (index + 1) * DUMMY_PATTERN_DURATION,
        boxes
      };
    });

    arWorldRoot.appendChild(group);

    songObjects[id] = {
      group,
      button,
      alwaysBoxes,
      patterns,
      currentPatternIndex: null,
      playIcon: SONG_ASSETS[id].playIcon
    };
  });
}

function setupPlayButtons() {
  SONG_ORDER.forEach((id) => {
    const button = songObjects[id].button;
    button.addEventListener("click", () => handlePlayControl(id));
  });
}

function handlePlayControl(id) {
  if (state.currentPlayingId === id && state.isPlaying) {
    stopAll();
  } else {
    playSong(id);
  }
}

function playSong(id) {
  stopAll();
  const audio = audioElements[id];
  if (!audio) return;

  state.currentPlayingId = id;
  state.isPlaying = true;

  if (state.audioContext) {
    state.audioContext.resume();
  }

  audio.currentTime = 0;
  audio.play();

  setButtonIcon(id, true);
  setActivePattern(id, 0);
  startSyncLoop();
}

function stopAll() {
  if (state.rafId) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }

  SONG_ORDER.forEach((id) => {
    const audio = audioElements[id];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setButtonIcon(id, false);
    hideAllPlayback(id);
  });

  state.isPlaying = false;
  state.currentPlayingId = null;
}

function setButtonIcon(id, isPlaying) {
  const song = songObjects[id];
  if (!song) return;
  song.button.setAttribute("src", isPlaying ? "#icon-stop" : song.playIcon);
}

function hideAllPlayback(id) {
  const song = songObjects[id];
  if (!song) return;
  song.patterns.forEach((pattern) => {
    pattern.boxes.forEach((box) => box.setAttribute("visible", false));
  });
  song.currentPatternIndex = null;
}

function setActivePattern(id, patternIndex) {
  const song = songObjects[id];
  if (!song) return;

  if (song.currentPatternIndex !== null && song.patterns[song.currentPatternIndex]) {
    song.patterns[song.currentPatternIndex].boxes.forEach((box) => box.setAttribute("visible", false));
  }

  if (patternIndex === null || patternIndex < 0 || patternIndex >= song.patterns.length) {
    song.currentPatternIndex = null;
    return;
  }

  song.patterns[patternIndex].boxes.forEach((box) => box.setAttribute("visible", true));
  song.currentPatternIndex = patternIndex;
}

function findPatternIndex(id, currentTime) {
  const song = songObjects[id];
  if (!song) return null;
  for (let i = 0; i < song.patterns.length; i += 1) {
    const pattern = song.patterns[i];
    if (currentTime >= pattern.start && currentTime < pattern.end) {
      return i;
    }
  }
  return null;
}

function startSyncLoop() {
  if (state.rafId) {
    cancelAnimationFrame(state.rafId);
  }
  state.rafId = requestAnimationFrame(updateFrameSync);
}

function updateFrameSync() {
  if (!state.isPlaying || !state.currentPlayingId) return;

  const id = state.currentPlayingId;
  const audio = audioElements[id];
  if (!audio) return;

  if (audio.ended) {
    stopAll();
    return;
  }

  const patternIndex = findPatternIndex(id, audio.currentTime);
  if (patternIndex !== songObjects[id].currentPatternIndex) {
    setActivePattern(id, patternIndex);
  }

  state.rafId = requestAnimationFrame(updateFrameSync);
}

function renderInfoContent() {
  const t = translations[state.selectedLanguage];
  ui.modalTitle.textContent = t.infoTitle;

  if (state.currentInfoContentId === "chant") {
    ui.modalBody.innerHTML = `<h3>${t.chantTitle}</h3><p>${t.chantDesc}</p>`;
    return;
  }

  const songInfo = t.songInfo[state.currentInfoContentId];
  if (songInfo) {
    ui.modalBody.innerHTML = `<h3>${songInfo.title}</h3><p>${songInfo.desc}</p>`;
  }
}

function renderCreditsContent() {
  const t = translations[state.selectedLanguage];
  ui.modalTitle.textContent = t.creditsTitle;
  ui.modalBody.innerHTML = t.creditsBody;
}

function openInfoModal() {
  if (state.isInfoOpen) {
    closeModal();
    return;
  }

  state.isInfoOpen = true;
  state.isCreditsOpen = false;
  state.currentInfoContentId = state.currentPlayingId ? state.currentPlayingId : "chant";
  renderInfoContent();
  ui.modalOverlay.classList.remove("hidden");
  ui.modalBody.scrollTop = 0;
}

function openCreditsModal() {
  if (state.isCreditsOpen) {
    closeModal();
    return;
  }

  state.isCreditsOpen = true;
  state.isInfoOpen = false;
  state.currentInfoContentId = null;
  renderCreditsContent();
  ui.modalOverlay.classList.remove("hidden");
  ui.modalBody.scrollTop = 0;
}

function closeModal() {
  ui.modalOverlay.classList.add("hidden");
  state.isInfoOpen = false;
  state.isCreditsOpen = false;
  state.currentInfoContentId = null;
}

function setupModalHandlers() {
  ui.infoBtn.addEventListener("click", openInfoModal);
  ui.creditsBtn.addEventListener("click", openCreditsModal);
  ui.modalOverlay.addEventListener("click", (e) => {
    if (e.target.id === "modal-overlay") {
      closeModal();
    }
  });
}

setupLanguageButtons();
buildARContent();
setupPlayButtons();
setupMarkerAnchor();
setupModalHandlers();
