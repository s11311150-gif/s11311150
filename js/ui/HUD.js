/**
 * 遊戲抬頭顯示器與介面管理器 (HUD)
 * 負責 DOM 分數面板更新、最高分持久化，以及畫布遊戲結束/通關遮罩繪製
 */

import { STORAGE_KEYS } from '../config.js';

export class HUD {
    constructor() {
        this.scoreEl = document.getElementById('score');
        this.highScoreEl = document.getElementById('high-score');

        this.highScore = this.loadHighScore();
        this.updateHighScore(this.highScore);
    }

    /**
     * 從 localStorage 讀取最高分數
     * @returns {number}
     */
    loadHighScore() {
        try {
            const val = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
            return val ? parseInt(val, 10) || 0 : 0;
        } catch {
            return 0;
        }
    }

    /**
     * 更新當前得分至 DOM
     * @param {number} score 
     */
    updateScore(score) {
        if (this.scoreEl) {
            this.scoreEl.innerText = score;
        }

        if (score > this.highScore) {
            this.highScore = score;
            this.updateHighScore(this.highScore);
            try {
                localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, this.highScore.toString());
            } catch {
                // 忽略在無權限環境下的 localStorage 寫入錯誤
            }
        }
    }

    /**
     * 更新最高分顯示
     * @param {number} highScore 
     */
    updateHighScore(highScore) {
        if (this.highScoreEl) {
            this.highScoreEl.innerText = highScore;
        }
    }

    /**
     * 繪製遮罩層 (Overlay)
     * @param {CanvasRenderingContext2D} ctx 
     * @param {HTMLCanvasElement} canvas 
     * @param {string} title 
     * @param {string} color 
     * @param {string} subtitle 
     */
    drawOverlay(ctx, canvas, title, color, subtitle = '按下 [ 空白鍵 ] 重新開始') {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = color;
        ctx.font = 'bold 32px "Courier New", Courier, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 20);

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px "Courier New", Courier, monospace';
        ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 30);
        ctx.restore();
    }

    /**
     * 繪製 Game Over
     */
    drawGameOver(ctx, canvas) {
        this.drawOverlay(ctx, canvas, '🌾 農場遭遇襲擊 🌾', '#e53935', '按下 [ 空白鍵 ] 重新耕作');
    }

    /**
     * 繪製 You Win
     */
    drawGameWon(ctx, canvas) {
        this.drawOverlay(ctx, canvas, '🌽 農場大豐收！ 🌽', '#ffeb3b', '按下 [ 空白鍵 ] 再次挑戰');
    }
}
