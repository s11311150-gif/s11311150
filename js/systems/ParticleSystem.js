/**
 * 粒子效果系統 (ParticleSystem)
 * 提供街機復古霓虹粒子發射器，為拾取能量豆、消滅幽靈及勝利狀態提供視覺強化
 */

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    /**
     * 發射粒子群
     * @param {number} x 發射中心 X
     * @param {number} y 發射中心 Y
     * @param {string} color 粒子色碼
     * @param {number} count 粒子數量
     * @param {number} baseSpeed 初速度
     * @param {number} maxLife 存活影格數
     */
    emit(x, y, color, count = 12, baseSpeed = 2, maxLife = 30) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = baseSpeed * (0.6 + Math.random() * 0.8);
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                radius: 1.5 + Math.random() * 1.5,
                alpha: 1,
                life: maxLife,
                maxLife,
            });
        }
    }

    /**
     * 吃能量豆時的強烈爆發特效
     */
    emitPowerBurst(x, y) {
        this.emit(x, y, '#ffff00', 16, 3, 35);
        this.emit(x, y, '#00ffff', 12, 2, 25);
    }

    /**
     * 吃掉驚嚇幽靈時的計分爆炸特效
     */
    emitGhostEaten(x, y, color = '#0000ff') {
        this.emit(x, y, '#ffffff', 14, 3.5, 40);
        this.emit(x, y, color, 14, 2.5, 30);
    }

    /**
     * 吃普通豆子時的微弱光點
     */
    emitPelletSpark(x, y) {
        this.emit(x, y, '#ffb8ae', 4, 1.2, 15);
    }

    /**
     * 更新所有粒子狀態
     */
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.alpha = Math.max(0, p.life / p.maxLife);

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * 繪製所有活動中之粒子
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        if (this.particles.length === 0) return;

        ctx.save();
        for (const p of this.particles) {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    /**
     * 清空目前所有粒子
     */
    clear() {
        this.particles = [];
    }
}
