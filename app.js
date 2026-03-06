console.log("%cWelcome developer!", "color: #d4af37; font-size: 60px; font-weight: bold;");

let selectedLanguage = "ja";
let currentPlayingId = null;
let isPlaying = false;
let isFirstFound = false;

const translations = {
    ja: {
        chantTitle: "グレゴリオ聖歌について",
        chantDesc: "1行目：グレゴリオ聖歌は中世の単旋律聖歌です。<br>2行目：西欧音楽の源流とも言われています。<br>3行目：ネウマ譜と呼ばれる特殊な記号で記されます。<br>4行目：このARではガラスに刻まれた譜面を読み取ります。<br>5行目：修道士たちが神に捧げた祈りの声を感じてください。<br>6行目：当時の響きを現代の技術で再現しています。<br>7行目：音の高さや長さが独特なリズムを生み出します。<br>8行目：空間全体が共鳴するような体験を目指しています。<br>9行目：ゆっくりとガラス壁を眺めてみてください。<br>10行目：スクロールして最後まで読めればテスト成功です。",
        credits: "1行目：【制作チーム】<br>2行目：EUM Glass AR Project<br>3行目：ディレクション：Taiki G.<br>4行目：エンジニアリング協力：AIアシスタント<br>5行目：音源提供：聖歌隊アーカイブ<br>6行目：デザイン協力：デザイン賞受賞チーム<br>7行目：技術：MindAR & A-Frame<br>8行目：公開プラットフォーム：Cloudflare Pages<br>9行目：Copyright 2024 EUM Project<br>10行目：全ての権利は制作チームに帰属します。",
        songs: {
            kyrie: "Kyrie: 憐れみの賛歌",
            gloria: "Gloria: 栄光の賛歌",
            credo: "Credo: 信仰宣言",
            sanctus: "Sanctus: 感謝の賛歌",
            agnus: "Agnus Dei: 神の小羊",
            ave: "Ave Maria: 聖母マリアへの祈り"
        }
    },
    en: {
        chantTitle: "About Gregorian Chant",
        chantDesc: "Line 1: Gregorian chant is central to Western music history.<br>Line 2: It is a monophonic, unaccompanied sacred song.<br>Line 3: The notation used here is called Neumatic notation.<br>Line 4: This AR project enhances the glass-etched chants.<br>Line 5: Listen to the prayers offered by medieval monks.<br>Line 6: Experience the fusion of ancient art and modern AR.<br>Line 7: The melodies are based on eight church modes.<br>Line 8: Please feel the resonance within this space.<br>Line 9: Take your time to explore each musical notation.<br>Line 10: Scroll down to ensure you can read this final line.",
        credits: "Line 1: [Production Team]<br>Line 2: EUM Glass AR Project<br>3rd line: Directed by Taiki G.<br>4th line: Engineering by AI Assistant<br>5th line: Audio by Schola Cantorum<br>6th line: Design by Award-winning team<br>7th line: Built with MindAR & A-Frame<br>8th line: Hosted on Cloudflare Pages<br>9th line: Copyright 2024 EUM Project<br>10th line: All rights reserved.",
        songs: {
            kyrie: "Kyrie: Lord, have mercy",
            gloria: "Gloria: Glory to God",
            credo: "Credo: I believe",
            sanctus: "Sanctus: Holy, Holy",
            agnus: "Agnus Dei: Lamb of God",
            ave: "Ave Maria: Hail Mary"
        }
    }
};

function selectLanguage(lang) {
    selectedLanguage = lang;
    document.getElementById('language-screen').classList.add('hidden');
    document.getElementById('ui-layer').classList.remove('hidden');
    const sceneEl = document.querySelector('a-scene');
    sceneEl.systems['mindar-image-system'].start();
}

const markerAnchor = document.getElementById('marker-anchor');
const arWorldRoot = document.getElementById('ar-world-root');

if (markerAnchor) {
    markerAnchor.addEventListener("targetFound", event => {
        if (!isFirstFound) {
            const worldPos = new THREE.Vector3();
            const worldQuat = new THREE.Quaternion();
            const worldScale = new THREE.Vector3();
            markerAnchor.object3D.matrixWorld.decompose(worldPos, worldQuat, worldScale);
            arWorldRoot.object3D.position.copy(worldPos);
            arWorldRoot.object3D.quaternion.copy(worldQuat);
            isFirstFound = true;
        }
    });
}

function handlePlayControl(id) {
    if (currentPlayingId === id) {
        stopAll();
    } else {
        playSong(id);
    }
}

function playSong(id) {
    stopAll();
    currentPlayingId = id;
    isPlaying = true;
    const audio = document.getElementById(`audio-${id}`);
    if (audio) audio.play();
    requestAnimationFrame(updateFrameSync);
}

function stopAll() {
    const audios = document.querySelectorAll('audio');
    audios.forEach(a => {
        a.pause();
        a.currentTime = 0;
    });
    isPlaying = false;
    currentPlayingId = null;
}

function updateFrameSync() {
    if (!isPlaying) return;
    const audio = document.getElementById(`audio-${currentPlayingId}`);
    if (audio && audio.ended) {
        stopAll();
        return;
    }
    requestAnimationFrame(updateFrameSync);
}

// --- INFOボタンの処理修正 ---
document.getElementById('info-btn').addEventListener('click', () => {
    const body = document.getElementById('modal-body');

    if (currentPlayingId) {
        body.innerHTML = `<h3>${translations[selectedLanguage].songs[currentPlayingId]}</h3><p>${translations[selectedLanguage].chantDesc}</p>`;
    } else {
        body.innerHTML = `<h3>${translations[selectedLanguage].chantTitle}</h3><p>${translations[selectedLanguage].chantDesc}</p>`;
    }
    
    // 先にモーダルを表示する
    document.getElementById('modal-overlay').classList.remove('hidden');

    // ★修正部分：表示された直後（次の画面更新のタイミング）でスクロールをリセット
    requestAnimationFrame(() => {
        body.scrollTop = 0; 
    });
});

// --- CREDITSボタンの処理修正 ---
document.getElementById('credits-btn').addEventListener('click', () => {
    const body = document.getElementById('modal-body');

    body.innerHTML = translations[selectedLanguage].credits;
    
    // 先にモーダルを表示する
    document.getElementById('modal-overlay').classList.remove('hidden');

    // ★修正部分：表示された直後でスクロールをリセット
    requestAnimationFrame(() => {
        body.scrollTop = 0; 
    });
});

document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') {
        document.getElementById('modal-overlay').classList.add('hidden');
    }
});

// --- 21. モーダルのスワイプ閉鎖ロジック ---
const modalWindow = document.getElementById('modal-window');
const modalOverlay = document.getElementById('modal-overlay');
let startY = 0;
let currentY = 0;
let isDragging = false;

// タッチ開始
modalWindow.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    modalWindow.classList.add('dragging');
    isDragging = true;
}, {passive: true});

// タッチ中
modalWindow.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY - startY;
    
    // 下方向にドラッグしている時だけ動かす
    if (currentY > 0) {
        modalWindow.style.transform = `translateY(${currentY}px)`;
    }
}, {passive: true});

// タッチ終了
modalWindow.addEventListener('touchend', () => {
    isDragging = false;
    modalWindow.classList.remove('dragging');
    
    // 80px以上下に引っ張ったら閉じる
    if (currentY > 80) {
        closeModal();
    } else {
        // 足りなければ元に戻す
        modalWindow.style.transform = '';
    }
    currentY = 0;
});

// マウスでのドラッグにも対応させる場合
modalWindow.addEventListener('mousedown', (e) => {
    startY = e.clientY;
    modalWindow.classList.add('dragging');
    isDragging = true;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentY = e.clientY - startY;
    if (currentY > 0) {
        modalWindow.style.transform = `translateY(${currentY}px)`;
    }
});

window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    modalWindow.classList.remove('dragging');
    if (currentY > 80) {
        closeModal();
    } else {
        modalWindow.style.transform = '';
    }
    currentY = 0;
});

// モーダルを閉じる共通処理
function closeModal() {
    modalOverlay.classList.add('hidden');
    modalWindow.style.transform = ''; // 位置をリセットしておく
}

// 既存の「外側クリックで閉じる」も共通処理に書き換え
modalOverlay.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') {
        closeModal();
    }
});