/**
 * 遊戲實體基類 (Entity)
 * 提供座標、速度、方向、邊界穿梭與網格換算基礎
 */

import { DIRECTIONS, CANVAS_CONFIG, GRID_CONFIG } from '../config.js';

export class Entity {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} speed
     * @param {number} radius
     */
    constructor(x = 0, y = 0, speed = 0, radius = 0) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.radius = radius;
        this.dir = DIRECTIONS.NONE;
    }

    /**
     * 取得目前實體中心所在的網格 (Grid) 座標
     */
    getGridPosition() {
        return {
            gridX: Math.floor((this.x - GRID_CONFIG.OFFSET_X) / GRID_CONFIG.CELL_SIZE),
            gridY: Math.floor((this.y - GRID_CONFIG.OFFSET_Y) / GRID_CONFIG.CELL_SIZE),
        };
    }

    /**
     * 地圖左右通道穿越邏輯
     */
    handleTunnelWrap() {
        if (this.x < GRID_CONFIG.OFFSET_X) {
            this.x = CANVAS_CONFIG.WIDTH - GRID_CONFIG.OFFSET_X;
        } else if (this.x > CANVAS_CONFIG.WIDTH - GRID_CONFIG.OFFSET_X) {
            this.x = GRID_CONFIG.OFFSET_X;
        }
    }

    /**
     * 抽象生命週期方法，由衍生類別覆寫
     */
    reset() {}

    /**
     * @param {number} dt 影格間隔秒數
     * @param {number} dtFactor 相對於 60 FPS 的影格倍率
     */
    update(dt, dtFactor) {}

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {}
}
