console.log("%cWelcome developer!", "color: #d4af37; font-size: 60px; font-weight: bold;");

let selectedLanguage = "ja";
let currentPlayingId = null;
let isPlaying = false;
let isFirstFound = false;

// 翻訳データ（変更なし）
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

/**
 * 1. 言語選択とAR起動
 */
function selectLanguage(lang) {
    selectedLanguage = lang;
    
    document.getElementById('language-screen').classList.add('hidden');
    document.getElementById('ui-layer').classList.remove('hidden');

    const sceneEl = document.querySelector('a-scene');
    
    const startAR = () => {
        const arSystem = sceneEl.systems['mindar-image-system'];
        if (arSystem) {
            console.log("MindAR starting...");
            arSystem.start(); 

            // ★【PC・スマホ表示対策】
            // カメラ起動の1秒後にリサイズイベントを強制発火させ、
            // 黒画面や表示ズレを解消します
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 1000);
        }
    };

    if (sceneEl.hasLoaded) {
        startAR();
    } else {
        sceneEl.addEventListener('loaded', startAR);
    }
}

/**
 * 2. マーカー認識と位置固定ロジック
 */
const markerAnchor = document.getElementById('marker-anchor');
const arWorldRoot = document.getElementById('ar-world-root');

if (markerAnchor) {
    markerAnchor.addEventListener("targetFound", event => {
        if (!isFirstFound) {
            console.log("Marker Found! Fixing position...");

            // 現在のマトリックスを最新の状態に更新
            markerAnchor.object3D.updateMatrixWorld();

            const worldPos = new THREE.Vector3();
            const worldQuat = new THREE.Quaternion();
            const worldScale = new THREE.Vector3();

            // マーカーの現在の世界座標・回転・スケールを分解取得
            markerAnchor.object3D.matrixWorld.decompose(worldPos, worldQuat, worldScale);

            // 固定用のルート要素(ar-world-root)に座標をコピー
            arWorldRoot.object3D.position.copy(worldPos);
            arWorldRoot.object3D.quaternion.copy(worldQuat);
            // スケールも合わせる（必要に応じて）
            arWorldRoot.object3D.scale.set(1, 1, 1); 

            // ★【重要】スキャンアニメーションを停止し、再スキャンを防ぐ
            const sceneEl = document.querySelector('a-scene');
            const arSystem = sceneEl.systems['mindar-image-system'];
            if (arSystem) {
                arSystem.stopScanning(); // これで、マーカーが外れてもスキャン画面に戻りません
            }

            isFirstFound = true;
            console.log("AR Content Fixed at:", worldPos);
        }
    });
}

/**
 * 3. オーディオ制御（変更なし）
 */
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
    if (audio) {
        audio.play().catch(e => console.error("Audio play failed:", e));
    }
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

/**
 * 4. UI・モーダル制御（修正済み）
 */
document.getElementById('info-btn').addEventListener('click', () => {
    const body = document.getElementById('modal-body');
    if (currentPlayingId) {
        body.innerHTML = `<h3>${translations[selectedLanguage].songs[currentPlayingId]}</h3><p>${translations[selectedLanguage].chantDesc}</p>`;
    } else {
        body.innerHTML = `<h3>${translations[selectedLanguage].chantTitle}</h3><p>${translations[selectedLanguage].chantDesc}</p>`;
    }
    document.getElementById('modal-overlay').classList.remove('hidden');
    requestAnimationFrame(() => { body.scrollTop = 0; });
});

document.getElementById('credits-btn').addEventListener('click', () => {
    const body = document.getElementById('modal-body');
    body.innerHTML = `<h3>Credits</h3><p>${translations[selectedLanguage].credits}</p>`;
    document.getElementById('modal-overlay').classList.remove('hidden');
    requestAnimationFrame(() => { body.scrollTop = 0; });
});

/**
 * 5. モーダルのスワイプ閉鎖ロジック
 */
const modalWindow = document.getElementById('modal-window');
const modalOverlay = document.getElementById('modal-overlay');
let startY = 0;
let currentY = 0;
let isDragging = false;

function closeModal() {
    modalOverlay.classList.add('hidden');
    modalWindow.style.transform = '';
    currentY = 0;
}

modalWindow.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    modalWindow.classList.add('dragging');
    isDragging = true;
}, {passive: true});

modalWindow.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentY = e.touches[0].clientY - startY;
    if (currentY > 0) {
        modalWindow.style.transform = `translateY(${currentY}px)`;
    }
}, {passive: true});

modalWindow.addEventListener('touchend', () => {
    isDragging = false;
    modalWindow.classList.remove('dragging');
    if (currentY > 80) {
        closeModal();
    } else {
        modalWindow.style.transform = '';
    }
});

// PCでのドラッグ操作
modalWindow.addEventListener('mousedown', (e) => {
    startY = e.clientY;
    modalWindow.classList.add('dragging');
    isDragging = true;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    currentY = e.clientY - startY;
    if (currentY > 0) modalWindow.style.transform = `translateY(${currentY}px)`;
});

window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    modalWindow.classList.remove('dragging');
    if (currentY > 80) closeModal();
    else modalWindow.style.transform = '';
});

modalOverlay.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
});