/**
 * 幽靈敵方實體 (Ghost)
 * 繼承自 Entity，包含巡航 AI、路口決策、平滑移動、受驚嚇狀態與農場造型動畫
 */

import { Entity } from './Entity.js';
import { 
    DIRECTIONS, 
    GRID_CONFIG, 
    GHOST_CONSTANTS, 
    TILE_TYPES 
} from '../config.js';

export class Ghost extends Entity {
    /**
     * @param {string} color 幽靈代表顏色
     * @param {number} startGridX 起始網格 X
     * @param {number} startGridY 起始網格 Y
     * @param {string} name 幽靈名稱
     */
    constructor(color, startGridX, startGridY, name = 'Ghost') {
        super();
        this.color = color;
        this.startGridX = startGridX;
        this.startGridY = startGridY;
        this.name = name;
        this.isFrightened = false;
        this.frightenedTimer = 0;
        this.reset();
    }

    /**
     * 重置位置至出生點
     */
    reset() {
        const { CELL_SIZE, OFFSET_X, OFFSET_Y } = GRID_CONFIG;
        this.x = this.startGridX * CELL_SIZE + CELL_SIZE / 2 + OFFSET_X;
        this.y = this.startGridY * CELL_SIZE + CELL_SIZE / 2 + OFFSET_Y;
        this.speed = GHOST_CONSTANTS.SPEED_NORMAL;
        this.radius = CELL_SIZE / 2 - 2;
        this.dir = DIRECTIONS.UP;
        this.isFrightened = false;
        this.frightenedTimer = 0;
    }

    /**
     * 啟動驚嚇模式 (吃豆人吃到能量豆時觸發)
     */
    makeFrightened() {
        this.isFrightened = true;
        this.frightenedTimer = GHOST_CONSTANTS.FRIGHTENED_DURATION;
    }

    /**
     * 更新幽靈 AI 狀態與位置 (支援動態影格補償)
     */
    update(dt, dtFactor, map, target) {
        if (this.isFrightened) {
            this.frightenedTimer--;
            if (this.frightenedTimer <= 0) {
                this.isFrightened = false;
            }
        }

        const factor = Math.max(0.6, Math.min(1.4, dtFactor || 1.0));
        const currentSpeed = (this.isFrightened 
            ? this.speed * GHOST_CONSTANTS.SPEED_FRIGHTENED_FACTOR 
            : this.speed) * factor;

        const { CELL_SIZE, OFFSET_X, OFFSET_Y } = GRID_CONFIG;
        const currentGridX = Math.floor((this.x - OFFSET_X) / CELL_SIZE);
        const currentGridY = Math.floor((this.y - OFFSET_Y) / CELL_SIZE);
        const centerX = currentGridX * CELL_SIZE + CELL_SIZE / 2 + OFFSET_X;
        const centerY = currentGridY * CELL_SIZE + CELL_SIZE / 2 + OFFSET_Y;

        // 當處於格子中心 (容許誤差在當前步長內) 時重新選擇前進方向
        if (Math.abs(this.x - centerX) <= Math.max(currentSpeed, 1.5) && 
            Math.abs(this.y - centerY) <= Math.max(currentSpeed, 1.5)) {
            this.x = centerX;
            this.y = centerY;
            this.dir = this.chooseNextDirection(currentGridX, currentGridY, map, target);
        }

        this.x += this.dir.x * currentSpeed;
        this.y += this.dir.y * currentSpeed;

        // 管道邊界穿越
        this.handleTunnelWrap();
    }

    /**
     * AI 路徑轉向決策
     */
    chooseNextDirection(gx, gy, map, target) {
        const candidateDirs = [
            DIRECTIONS.UP,
            DIRECTIONS.DOWN,
            DIRECTIONS.LEFT,
            DIRECTIONS.RIGHT,
        ];

        const possibleDirs = candidateDirs.filter(d => {
            if (d.x === -this.dir.x && d.y === -this.dir.y) return false;
            const nextGx = gx + d.x;
            const nextGy = gy + d.y;
            return map[nextGy] && map[nextGy][nextGx] !== TILE_TYPES.WALL;
        });

        if (possibleDirs.length === 0) {
            return { x: -this.dir.x, y: -this.dir.y };
        }

        // 驚嚇狀態：隨機漫遊
        if (this.isFrightened) {
            const randomIndex = Math.floor(Math.random() * possibleDirs.length);
            return possibleDirs[randomIndex];
        }

        // 正常追蹤：選擇距離目標最近的方向
        const { CELL_SIZE, OFFSET_X, OFFSET_Y } = GRID_CONFIG;
        let bestDir = possibleDirs[0];
        let minDistance = Infinity;

        possibleDirs.forEach(d => {
            const nextX = (gx + d.x) * CELL_SIZE + CELL_SIZE / 2 + OFFSET_X;
            const nextY = (gy + d.y) * CELL_SIZE + CELL_SIZE / 2 + OFFSET_Y;
            const dist = Math.hypot(target.x - nextX, target.y - nextY);
            if (dist < minDistance) {
                minDistance = dist;
                bestDir = d;
            }
        });

        return bestDir;
    }

    /**
     * 繪製幽靈造型 (農場稻草人幽靈風格)
     */
    draw(ctx) {
        ctx.save();

        const r = this.radius;

        // 驚嚇狀態與瀕臨結束時的閃爍效果
        if (this.isFrightened) {
            const isFlashing = this.frightenedTimer < GHOST_CONSTANTS.FLASH_THRESHOLD && 
                               Math.floor(this.frightenedTimer / 10) % 2 === 0;
            ctx.fillStyle = isFlashing ? GHOST_CONSTANTS.COLOR_FLASH : GHOST_CONSTANTS.COLOR_FRIGHTENED;
        } else {
            ctx.fillStyle = this.color;
        }

        ctx.beginPath();
        // 幽靈頭部半圓
        ctx.arc(this.x, this.y - 2, r, Math.PI, 0, false);
        // 幽靈下半身裙擺波浪 (輕柔起伏)
        ctx.lineTo(this.x + r, this.y + r);
        ctx.lineTo(this.x + r * 0.5, this.y + r - 3);
        ctx.lineTo(this.x, this.y + r);
        ctx.lineTo(this.x - r * 0.5, this.y + r - 3);
        ctx.lineTo(this.x - r, this.y + r);
        ctx.closePath();
        ctx.fill();

        // 農場迷你小草帽飾品 (頭頂可愛小配件)
        if (!this.isFrightened) {
            ctx.fillStyle = '#e0a948';
            ctx.beginPath();
            ctx.ellipse(this.x, this.y - r - 2, r * 0.6, 2, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#f5c563';
            ctx.beginPath();
            ctx.arc(this.x, this.y - r - 3.5, 3, Math.PI, 0);
            ctx.fill();

            // 眼睛
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x - 4, this.y - 3, 3, 0, Math.PI * 2);
            ctx.arc(this.x + 4, this.y - 3, 3, 0, Math.PI * 2);
            ctx.fill();

            // 瞳孔
            ctx.fillStyle = '#212121';
            ctx.beginPath();
            ctx.arc(this.x - 4 + this.dir.x * 1.2, this.y - 3 + this.dir.y * 1.2, 1.5, 0, Math.PI * 2);
            ctx.arc(this.x + 4 + this.dir.x * 1.2, this.y - 3 + this.dir.y * 1.2, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // 驚嚇狀態：嚇到發抖的表情
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x - 3.5, this.y - 2, 2, 0, Math.PI * 2);
            ctx.arc(this.x + 3.5, this.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();

            // 顫抖波浪小嘴
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(this.x - 5, this.y + 4);
            ctx.lineTo(this.x - 2.5, this.y + 2);
            ctx.lineTo(this.x, this.y + 4);
            ctx.lineTo(this.x + 2.5, this.y + 2);
            ctx.lineTo(this.x + 5, this.y + 4);
            ctx.stroke();
        }

        ctx.restore();
    }
}
