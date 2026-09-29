/**
 * 背景音效與音樂管理器 (AudioManager)
 * 負責載入農場背景音樂、處理瀏覽器自動播放限制、音量控制與靜音切換
 */

export class AudioManager {
    constructor() {
        this.bgm = new Audio('./assets/audio/farm_bgm.mp3');
        this.bgm.loop = true;
        this.bgm.volume = 0.35; // 舒適柔和的背景音量
        this.isMuted = false;
        this.hasInteracted = false;
        this.onMuteChanged = null;

        try {
            const savedMute = localStorage.getItem('pacman_farm_muted');
            if (savedMute === 'true') {
                this.isMuted = true;
                this.bgm.muted = true;
            }
        } catch {
            // ignore
        }
    }

    /**
     * 在使用者第一次進行遊戲操作時啟動音樂 (因應瀏覽器 Autoplay 規範)
     */
    triggerPlayOnInteraction() {
        if (!this.hasInteracted) {
            this.hasInteracted = true;
            this.play();
        }
    }

    play() {
        if (this.isMuted) return;
        this.bgm.play().catch(() => {
            // 等候下一次使用者手動觸發
        });
    }

    pause() {
        this.bgm.pause();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.bgm.muted = this.isMuted;

        try {
            localStorage.setItem('pacman_farm_muted', this.isMuted.toString());
        } catch {
            // ignore
        }

        if (!this.isMuted) {
            this.play();
        }

        if (this.onMuteChanged) {
            this.onMuteChanged(this.isMuted);
        }

        return this.isMuted;
    }
}
