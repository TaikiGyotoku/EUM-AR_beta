// State management
let selectedLanguage = null;
let currentPlayingId = null;
let isPlaying = false;
let isInfoOpen = false;
let isCreditsOpen = false;
let currentInfoContentId = null;

let isArInitialized = false;

// Audio context and tracking
let audioCtx = null;
let audioBuffers = {};
let currentSource = null;
let audioStartTime = 0;

// Localization data
const dict = {
    "ja": {
        "info_title": "INFO",
        "credits": "プロジェクトチーム\n制作・開発: [ダミーテキスト]\n\n各種SNSやWebサイト\nhttps://example.com",
        "content_gregorian": "グレゴリオ聖歌は、西欧カトリック教会の単旋律の聖歌です。ネウマ譜と呼ばれる特有の記譜法で記されています。",
        "content_kyrie": "キリエ（Kyrie）は、憐れみを乞う祈りです。「主よ、憐れみたまえ」という意味を持ちます。",
        "content_gloria": "グロリア（Gloria）は、神の栄光を讃える賛歌です。",
        "content_credo": "クレド（Credo）は、信仰宣言です。ニケア・コンスタンティノープル信条に基づく長大なテキストが特徴です。",
        "content_sanctus": "サンクトゥス（Sanctus）は、感謝の賛歌であり「聖なるかな」と神を讃美します。",
        "content_agnusdei": "アニュス・デイ（Agnus Dei）は、「神の小羊」を意味する平和を願う祈りです。",
        "content_avemaria": "アヴェ・マリア（Ave Maria）は、聖母マリアへの祈りであり、受胎告知の言葉から始まります。"
    },
    "en": {
        "info_title": "INFO",
        "credits": "Project Team\nProduction & Development: [Dummy Text]\n\nLinks & SNS\nhttps://example.com",
        "content_gregorian": "Gregorian chant is the central tradition of Western plainchant, a form of monophonic, unaccompanied sacred song of the western Roman Catholic Church.",
        "content_kyrie": "Kyrie is a traditional prayer of gathering or penitence, meaning 'Lord, have mercy'.",
        "content_gloria": "Gloria is a celebratory hymn of praise to God.",
        "content_credo": "Credo is a profession of faith, based on the Niceno-Constantinopolitan Creed.",
        "content_sanctus": "Sanctus is a hymn of thanksgiving, exclaiming 'Holy, Holy, Holy'.",
        "content_agnusdei": "Agnus Dei means 'Lamb of God', and it is a prayer for peace and mercy.",
        "content_avemaria": "Ave Maria is a traditional Catholic prayer asking for the intercession of the Blessed Virgin Mary."
    }
};

// --- ダミー設定データ (現地調整用) ---
// すべての座標、サイズ、回転情報をここに集約しています。
// x, y, zなど自由に設定可能です。
const sharedConfig = {
    fixedRect: { color: '#888888', opacity: 0.5 },
    playRect: { color: '#FFD700', opacity: 0.6 }
};

const songsConfig = [
    { 
        id: 'kyrie', file: 'assets/audio/Kyrie.m4a', icon: 'assets/icons/icon_play1.png', stopIcon: 'assets/icons/icon_stop.png', 
        parentPos: '-1 1.2 0', parentRot: '0 0 0', parentScale: '1 1 1',
        btnPos: '0 0.4 0', btnRot: '0 0 0', btnScale: '0.3 0.3 1',
        fixedRects: [ { pos: '0 -0.1 -0.01', rot: '0 0 0', scale: '0.8 0.15 1' } ],
        patterns: [1,2,1,2,1,2,1,2,1,1,1], patternDuration: 2.0, playRectBasePos: {x: 0, y: -0.1, z: 0.01}, playRectScale: '0.7 0.12 1'
    },
    { 
        id: 'gloria', file: 'assets/audio/Gloria.m4a', icon: 'assets/icons/icon_play2.png', stopIcon: 'assets/icons/icon_stop.png',
        parentPos: '0 1.2 0', parentRot: '0 0 0', parentScale: '1 1 1',
        btnPos: '0 0.4 0', btnRot: '0 0 0', btnScale: '0.3 0.3 1',
        fixedRects: [ { pos: '0 -0.1 -0.01', rot: '0 0 0', scale: '0.8 0.15 1' } ],
        patterns: [1,2,1,1,2,1,1,1,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1,2,1,1,2,1], patternDuration: 2.0, playRectBasePos: {x: 0, y: -0.1, z: 0.01}, playRectScale: '0.7 0.12 1'
    },
    { 
        id: 'credo', file: 'assets/audio/Credo.m4a', icon: 'assets/icons/icon_play3.png', stopIcon: 'assets/icons/icon_stop.png',
        parentPos: '1 1.2 0', parentRot: '0 0 0', parentScale: '1 1 1',
        btnPos: '0 0.4 0', btnRot: '0 0 0', btnScale: '0.3 0.3 1',
        fixedRects: [ { pos: '0 -0.1 -0.01', rot: '0 0 0', scale: '0.8 0.15 1' }, { pos: '0 -0.3 -0.01', rot: '0 0 0', scale: '0.8 0.15 1' } ],
        patterns: [1,1,1,1,2,1,1,1,2,1,1,1,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,2,1,1,1,2,1,2,1,1,2,1,1], patternDuration: 2.0, playRectBasePos: {x: 0, y: -0.1, z: 0.01}, playRectScale: '0.7 0.12 1'
    },
    { 
        id: 'sanctus', file: 'assets/audio/Sanctus.m4a', icon: 'assets/icons/icon_play4.png', stopIcon: 'assets/icons/icon_stop.png',
        parentPos: '-1 0.2 0', parentRot: '0 0 0', parentScale: '1 1 1',
        btnPos: '0 0.4 0', btnRot: '0 0 0', btnScale: '0.3 0.3 1',
        fixedRects: [ { pos: '0 -0.1 -0.01', rot: '0 0 0', scale: '0.8 0.15 1' } ],
        patterns: [1,1,1,2,1,2,1,2,1,2,1], patternDuration: 2.0, playRectBasePos: {x: 0, y: -0.1, z: 0.01}, playRectScale: '0.7 0.12 1'
    },
    { 
        id: 'agnusdei', file: 'assets/audio/AgnusDei.m4a', icon: 'assets/icons/icon_play5.png', stopIcon: 'assets/icons/icon_stop.png',
        parentPos: '0 0.2 0', parentRot: '0 0 0', parentScale: '1 1 1',
        btnPos: '0 0.4 0', btnRot: '0 0 0', btnScale: '0.3 0.3 1',
        fixedRects: [ { pos: '0 -0.1 -0.01', rot: '0 0 0', scale: '0.8 0.15 1' } ],
        patterns: [1,1,2,1,1,2,1,2,1,1,2], patternDuration: 2.0, playRectBasePos: {x: 0, y: -0.1, z: 0.01}, playRectScale: '0.7 0.12 1'
    },
    { 
        id: 'avemaria', file: 'assets/audio/AveMaria.m4a', icon: 'assets/icons/icon_play6.png', stopIcon: 'assets/icons/icon_stop.png',
        parentPos: '1 0.2 0', parentRot: '0 0 0', parentScale: '1 1 1',
        btnPos: '0 0.4 0', btnRot: '0 0 0', btnScale: '0.3 0.3 1',
        fixedRects: [ { pos: '0 -0.1 -0.01', rot: '0 0 0', scale: '0.8 0.15 1' } ],
        patterns: [1,1,1,2,2,1,2,1], patternDuration: 2.0, playRectBasePos: {x: 0, y: -0.1, z: 0.01}, playRectScale: '0.7 0.12 1'
    }
];

// --- ユーティリティ関数 ---
function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<a href="${url}" target="_blank" style="color: #0066cc;">${url}</a>`;
    });
}

document.addEventListener('DOMContentLoaded', () => {

    const langScreen = document.getElementById('lang-screen');
    const btnJa = document.getElementById('btn-lang-ja');
    const btnEn = document.getElementById('btn-lang-en');
    
    const mainUi = document.getElementById('main-ui');
    const btnInfo = document.getElementById('btn-info');
    const btnCredits = document.getElementById('btn-credits');
    
    const modalInfo = document.getElementById('modal-info');
    const infoTitle = document.getElementById('info-title');
    const infoText = document.getElementById('info-text');
    
    const modalCredits = document.getElementById('modal-credits');
    const creditsText = document.getElementById('credits-text');

    const sceneEl = document.querySelector('a-scene');
    const arTarget = document.getElementById('ar-target');
    const arContainer = document.getElementById('ar-container');

    function setupAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            loadAudioFiles();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    async function loadAudioFiles() {
        for (const song of songsConfig) {
            try {
                const response = await fetch(song.file);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    audioBuffers[song.id] = await audioCtx.decodeAudioData(arrayBuffer);
                } else {
                    console.warn("Could not load", song.file);
                }
            } catch (e) {
                console.warn("Failed to decode", song.file, e);
            }
        }
    }

    const selectLang = (lang) => {
        selectedLanguage = lang;
        langScreen.classList.add('hidden');
        mainUi.classList.remove('hidden');
        setupAudio();
        
        let creditsHtmlRaw = dict[lang]["credits"].replace(/\n/g, "<br>");
        creditsText.innerHTML = linkify(creditsHtmlRaw);
        
        infoTitle.innerText = dict[lang]["info_title"];

        if (sceneEl.systems && sceneEl.systems["mindar-image-system"]) {
            sceneEl.systems["mindar-image-system"].start();
        } else {
            sceneEl.addEventListener('loaded', () => {
                setTimeout(() => {
                    if (sceneEl.systems["mindar-image-system"]) {
                        sceneEl.systems["mindar-image-system"].start();
                    }
                }, 500);
            });
        }
    };

    btnJa.addEventListener('click', () => selectLang('ja'));
    btnEn.addEventListener('click', () => selectLang('en'));

    const toggleInfo = (e) => {
        e.stopPropagation();
        if (isCreditsOpen) closeModal(modalCredits, () => isCreditsOpen = false);
        if (!isInfoOpen) {
            currentInfoContentId = isPlaying && currentPlayingId ? "content_" + currentPlayingId : "content_gregorian";
            infoText.innerText = dict[selectedLanguage][currentInfoContentId];
            
            modalInfo.classList.remove('hidden'); // Ensure DOM rendering is ready
            // small delay to allow CSS transition to apply correctly
            setTimeout(() => modalInfo.classList.add('open'), 10);
            isInfoOpen = true;
        } else {
            closeModal(modalInfo, () => isInfoOpen = false);
        }
    };

    const toggleCredits = (e) => {
        e.stopPropagation();
        if (isInfoOpen) closeModal(modalInfo, () => isInfoOpen = false);
        if (!isCreditsOpen) {
            modalCredits.classList.remove('hidden');
            setTimeout(() => modalCredits.classList.add('open'), 10);
            isCreditsOpen = true;
        } else {
            closeModal(modalCredits, () => isCreditsOpen = false);
        }
    };

    const closeModal = (modal, stateSetter) => {
        modal.classList.remove('open');
        stateSetter();
        // optionally transition end event to add hidden back, if needed
        setTimeout(() => {
            if (!modal.classList.contains('open')) {
                modal.classList.add('hidden');
            }
        }, 300); // match CSS transition duration
    };

    btnInfo.addEventListener('click', toggleInfo);
    btnCredits.addEventListener('click', toggleCredits);

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (modal.id === 'modal-info') closeModal(modalInfo, () => isInfoOpen = false);
                if (modal.id === 'modal-credits') closeModal(modalCredits, () => isCreditsOpen = false);
            }
        });
    });

    // --- ARエンティティの生成 ---
    songsConfig.forEach(song => {
        const sEntity = document.createElement('a-entity');
        sEntity.setAttribute('position', song.parentPos);
        sEntity.setAttribute('rotation', song.parentRot);
        sEntity.setAttribute('scale', song.parentScale);
        
        const btn = document.createElement('a-image');
        btn.setAttribute('src', song.icon);
        btn.setAttribute('position', song.btnPos);
        btn.setAttribute('rotation', song.btnRot);
        btn.setAttribute('scale', song.btnScale);
        btn.classList.add('clickable');
        
        btn.addEventListener('click', () => handleSongClick(song));
        sEntity.appendChild(btn);
        song.btnEntity = btn;

        song.fixedRects.forEach(rectData => {
            const fRect = document.createElement('a-plane');
            fRect.setAttribute('color', sharedConfig.fixedRect.color);
            fRect.setAttribute('opacity', sharedConfig.fixedRect.opacity);
            fRect.setAttribute('position', rectData.pos);
            fRect.setAttribute('rotation', rectData.rot);
            fRect.setAttribute('scale', rectData.scale);
            fRect.setAttribute('material', 'transparent: true');
            sEntity.appendChild(fRect);
        });

        // 再生囲いの生成
        song.playPatterns = [];
        let timerStart = 0;
        song.patterns.forEach((count, patternIdx) => {
            const patData = {
                startTime: timerStart,
                endTime: timerStart + song.patternDuration,
                entities: []
            };
            
            for(let i=0; i<count; i++) {
                // ダミーでの自動配置計算 (並べて配置)
                const offsetX = (i - (count-1)/2) * 0.75;
                const offsetY = - (patternIdx % 3) * 0.2; // 少しずつずらすダミー
                
                const pRect = document.createElement('a-plane');
                pRect.setAttribute('color', sharedConfig.playRect.color);
                pRect.setAttribute('opacity', sharedConfig.playRect.opacity);
                pRect.setAttribute('position', `${song.playRectBasePos.x + offsetX} ${song.playRectBasePos.y + offsetY} ${song.playRectBasePos.z}`);
                pRect.setAttribute('scale', song.playRectScale);
                pRect.setAttribute('rotation', '0 0 0');
                pRect.setAttribute('visible', 'false');
                pRect.setAttribute('material', 'transparent: true');
                
                sEntity.appendChild(pRect);
                patData.entities.push(pRect);
            }
            song.playPatterns.push(patData);
            timerStart += song.patternDuration;
        });

        arContainer.appendChild(sEntity);
    });

    // --- 初期位置マーカー検出 ---
    arTarget.addEventListener('targetFound', () => {
        if (!isArInitialized) {
            isArInitialized = true;
            const pos = new THREE.Vector3();
            const quat = new THREE.Quaternion();
            const scale = new THREE.Vector3();
            arTarget.object3D.matrixWorld.decompose(pos, quat, scale);

            arContainer.object3D.position.copy(pos);
            arContainer.object3D.quaternion.copy(quat);
            arContainer.object3D.scale.copy(scale);
            
            arContainer.setAttribute('visible', 'true');
        }
    });

    // --- 制御処理 ---
    function stopSong() {
        if (currentSource) {
            try { currentSource.stop(); } catch(e){}
            currentSource = null;
        }
        
        if (currentPlayingId) {
            const song = songsConfig.find(s => s.id === currentPlayingId);
            if (song) {
                song.btnEntity.setAttribute('src', song.icon);
                song.playPatterns.forEach(pat => pat.entities.forEach(en => en.setAttribute('visible', 'false')));
            }
        }
        
        isPlaying = false;
        currentPlayingId = null;
    }

    function handleSongClick(clickedSong) {
        if (!audioCtx) return;

        if (isPlaying && currentPlayingId === clickedSong.id) {
            stopSong(); 
            return;
        }

        if (isPlaying) {
            stopSong(); 
        }

        currentPlayingId = clickedSong.id;
        isPlaying = true;
        
        clickedSong.btnEntity.setAttribute('src', clickedSong.stopIcon); 
        
        if (audioBuffers[clickedSong.id]) {
            currentSource = audioCtx.createBufferSource();
            currentSource.buffer = audioBuffers[clickedSong.id];
            currentSource.connect(audioCtx.destination);
            currentSource.onended = () => { stopSong(); }; 
            currentSource.start(0);
            audioStartTime = audioCtx.currentTime;
        } else {
            console.warn("Audio buffer missing, simulating playback for testing: " + clickedSong.id);
            audioStartTime = audioCtx.currentTime;
            
            // Dummy playback length tracking
            const totalDuration = clickedSong.patterns.length * clickedSong.patternDuration;
            setTimeout(() => {
                if(currentPlayingId === clickedSong.id) stopSong();
            }, totalDuration * 1000);
        }
    }

    // --- 同期ループ ---
    AFRAME.registerComponent('ar-playback-sync', {
        tick: function() {
            if (!isPlaying || !currentPlayingId) return;
            const song = songsConfig.find(s => s.id === currentPlayingId);
            if (!song) return;
            
            const timeElapsed = audioCtx ? (audioCtx.currentTime - audioStartTime) : 0;
            
            song.playPatterns.forEach(pat => {
                const isActive = (timeElapsed >= pat.startTime && timeElapsed < pat.endTime);
                pat.entities.forEach(en => {
                    if (en.getAttribute('visible') !== isActive) {
                        en.setAttribute('visible', isActive);
                    }
                });
            });
        }
    });

    sceneEl.setAttribute('ar-playback-sync', '');
});
