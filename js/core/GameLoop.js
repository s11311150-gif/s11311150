/**
 * 高精度遊戲循環控制器 (GameLoop)
 * 負責計算 Delta Time 並調度 update 與 render
 */

export class GameLoop {
    /**
     * @param {Function} updateFn (dt, dtFactor) => void
     * @param {Function} renderFn () => void
     */
    constructor(updateFn, renderFn) {
        this.updateFn = updateFn;
        this.renderFn = renderFn;
        this.lastTime = 0;
        this.animationFrameId = null;
        this.isRunning = false;
    }

    /**
     * 啟動遊戲循環
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
    }

    /**
     * 停止遊戲循環
     */
    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * 主影格回呼
     * @param {DOMHighResTimeStamp} currentTime
     */
    loop(currentTime) {
        if (!this.isRunning) return;

        // 計算真實 delta time (秒)
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        // 相對 60 FPS 的標準倍率因子 (60 FPS 下為 1.0)
        const dtFactor = dt * 60;

        if (this.updateFn) {
            this.updateFn(dt, dtFactor);
        }

        if (this.renderFn) {
            this.renderFn();
        }

        this.animationFrameId = requestAnimationFrame(this.loop.bind(this));
    }
}
