/**
 * シンプルタイムツール
 * @description ストップウォッチ、タイマー、デジタル時計の機能を提供するWebアプリケーション
 * @version 1.0.0
 */

// タブ切り替え用のクラス
class TabManager {
    constructor() {
        this.tabs = document.querySelectorAll('.tab-button');
        this.contents = document.querySelectorAll('.tab-content');
        this.init();
    }

    init() {
        // 初期状態ではすべてのコンテンツを非表示
        this.contents.forEach(content => {
            content.style.display = 'none';
        });

        // 最初のタブを表示
        const firstTab = this.tabs[0];
        const firstContent = document.getElementById(firstTab.dataset.tab);
        firstTab.classList.add('active');
        firstContent.style.display = 'block';

        // タブクリックイベントの設定
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab);
            });
        });
    }

    switchTab(selectedTab) {
        // すべてのタブとコンテンツから active クラスを削除
        this.tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        this.contents.forEach(content => {
            content.style.display = 'none';
        });

        // 選択されたタブとそのコンテンツをアクティブにする
        selectedTab.classList.add('active');
        const targetId = selectedTab.dataset.tab;
        const targetContent = document.getElementById(targetId);
        targetContent.style.display = 'block';
    }
}

// ストップウォッチクラス
class Stopwatch {
    constructor() {
        this.display = document.querySelector('#stopwatch .display');
        this.startButton = document.getElementById('startStopwatch');
        this.resetButton = document.getElementById('resetStopwatch');
        
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.isRunning = false;
        
        this.init();
        this.updateDisplay(); // 初期表示を正しく設定
    }

    init() {
        this.startButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => this.reset());
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        if (this.timerInterval) return;
        
        this.isRunning = true;
        this.startTime = Date.now() - this.elapsedTime;
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.updateDisplay();
        }, 10);

        this.startButton.textContent = '一時停止';
        this.startButton.classList.add('running');
    }

    pause() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.isRunning = false;
            this.startButton.textContent = 'スタート';
            this.startButton.classList.remove('running');
        }
    }

    reset() {
        this.pause();
        this.elapsedTime = 0;
        this.updateDisplay();
    }

    updateDisplay() {
        const hours = Math.floor(this.elapsedTime / (1000 * 60 * 60));
        const minutes = Math.floor((this.elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((this.elapsedTime % (1000 * 60)) / 1000);
        const milliseconds = Math.floor((this.elapsedTime % 1000) / 10); // 10で割って2桁に

        this.display.textContent = 
            `${hours.toString().padStart(2, '0')}:` +
            `${minutes.toString().padStart(2, '0')}:` +
            `${seconds.toString().padStart(2, '0')}.` +
            `${milliseconds.toString().padStart(2, '0')}`; // 2桁で0埋め
    }
}

// タイマークラス
class Timer {
    constructor() {
        this.hoursInput = document.getElementById('hoursInput');
        this.minutesInput = document.getElementById('minutesInput');
        this.secondsInput = document.getElementById('secondsInput');
        this.startButton = document.getElementById('startTimer');
        this.resetButton = document.getElementById('resetTimer');
        this.soundToggle = document.getElementById('soundToggle');
        
        this.timerInterval = null;
        this.isRunning = false;
        this.remainingSeconds = 0;
        
        this.init();
    }

    init() {
        this.startButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => this.reset());
        
        // 入力制御
        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('input', (e) => this.handleTimeInput(e));
            input.addEventListener('blur', (e) => this.validateTimeInput(e.target));
        });

        // 上下ボタンの制御
        document.querySelectorAll('.time-control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTimeControl(e));
        });

        // プリセットボタンの制御を追加
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePreset(e));
        });
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        if (this.isRunning || this.remainingSeconds === 0) return;
        
        this.isRunning = true;
        this.startButton.textContent = '一時停止';
        this.startButton.classList.add('running');
        
        this.timerInterval = setInterval(() => {
            this.remainingSeconds--;
            this.updateDisplay();
            
            if (this.remainingSeconds <= 0) {
                this.complete();
            }
        }, 1000);
    }

    pause() {
        if (!this.isRunning) return;
        
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.isRunning = false;
        this.startButton.textContent = 'スタート';
        this.startButton.classList.remove('running');
    }

    reset() {
        this.pause();
        this.setTimeInputs(0, 0, 0);
        this.remainingSeconds = 0;
    }

    complete() {
        this.pause();
        if (this.soundToggle.checked) {
            this.playAlarm();
        }
    }

    handleTimeInput(event) {
        const input = event.target;
        let value = input.value.replace(/[^0-9]/g, '');
        
        // 最大値の制限
        const maxValue = input.id === 'hoursInput' ? 99 : 59;
        if (parseInt(value) > maxValue) value = maxValue.toString();
        
        // 2桁に整形
        input.value = value.padStart(2, '0');
        this.updateRemainingSeconds();
    }

    validateTimeInput(input) {
        let value = parseInt(input.value) || 0;
        const maxValue = input.id === 'hoursInput' ? 99 : 59;
        value = Math.min(Math.max(value, 0), maxValue);
        input.value = value.toString().padStart(2, '0');
        this.updateRemainingSeconds();
    }

    handleTimeControl(event) {
        if (this.isRunning) return;
        
        const button = event.target;
        const input = button.closest('.time-unit').querySelector('.time-input');
        const isUp = button.classList.contains('up');
        const maxValue = input.id === 'hoursInput' ? 99 : 59;
        
        let value = parseInt(input.value);
        value = isUp ? (value + 1) % (maxValue + 1) : (value - 1 + (maxValue + 1)) % (maxValue + 1);
        input.value = value.toString().padStart(2, '0');
        
        this.updateRemainingSeconds();
    }

    updateRemainingSeconds() {
        const hours = parseInt(this.hoursInput.value) || 0;
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;
        
        this.remainingSeconds = hours * 3600 + minutes * 60 + seconds;
    }

    setTimeInputs(hours, minutes, seconds) {
        this.hoursInput.value = hours.toString().padStart(2, '0');
        this.minutesInput.value = minutes.toString().padStart(2, '0');
        this.secondsInput.value = seconds.toString().padStart(2, '0');
        this.updateRemainingSeconds();
    }

    updateDisplay() {
        const hours = Math.floor(this.remainingSeconds / 3600);
        const minutes = Math.floor((this.remainingSeconds % 3600) / 60);
        const seconds = this.remainingSeconds % 60;

        this.hoursInput.value = hours.toString().padStart(2, '0');
        this.minutesInput.value = minutes.toString().padStart(2, '0');
        this.secondsInput.value = seconds.toString().padStart(2, '0');
    }

    playAlarm() {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        
        // デジタルタイマー音を生成
        const playBeep = (frequency, startTime, duration) => {
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.type = 'square';
            oscillator.frequency.value = frequency;
            
            gainNode.gain.setValueAtTime(0.1, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };

        // 3回のビープ音を鳴らす
        for (let i = 0; i < 3; i++) {
            playBeep(1000, context.currentTime + i * 0.3, 0.2);
        }
    }

    // プリセット処理の追加
    handlePreset(event) {
        if (this.isRunning) return;
        
        const seconds = parseInt(event.target.dataset.time);
        const currentHours = parseInt(this.hoursInput.value) || 0;
        const currentMinutes = parseInt(this.minutesInput.value) || 0;
        const currentSeconds = parseInt(this.secondsInput.value) || 0;
        
        let totalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds + seconds;
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;
        
        this.setTimeInputs(hours, minutes, remainingSeconds);
    }
}

// デジタル時計クラス
class DigitalClock {
    constructor() {
        this.dateDisplay = document.querySelector('.date-display');
        this.timeDisplay = document.querySelector('.time-display');
        this.formatToggle = document.getElementById('timeFormatToggle');
        
        this.is24Hour = true;
        this.init();
    }

    init() {
        this.formatToggle.addEventListener('change', () => {
            this.is24Hour = this.formatToggle.checked;
            this.updateDisplay();
            localStorage.setItem('clockFormat', this.is24Hour);
        });

        // 保存された表示形式を復元
        const savedFormat = localStorage.getItem('clockFormat');
        if (savedFormat !== null) {
            this.is24Hour = savedFormat === 'true';
            this.formatToggle.checked = this.is24Hour;
        }

        this.updateDisplay();
        setInterval(() => this.updateDisplay(), 1000);
    }

    updateDisplay() {
        const now = new Date();
        
        // 日付表示
        const dateOptions = { 
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };
        this.dateDisplay.textContent = now.toLocaleDateString('ja-JP', dateOptions);
        
        // 時刻表示
        if (this.is24Hour) {
            // 24時間表示の場合
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            this.timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
        } else {
            // 12時間表示の場合
            const timeOptions = {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            this.timeDisplay.textContent = now.toLocaleTimeString('ja-JP', timeOptions);
        }
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    const tabManager = new TabManager();
    const stopwatch = new Stopwatch();
    const timer = new Timer();
    const clock = new DigitalClock();
}); 