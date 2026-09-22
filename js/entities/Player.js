/**
 * 吃豆人玩家實體 (Player)
 * 繼承自 Entity，負責玩家移動、牆壁檢測、嘴巴張合與點數吃取判定
 */

import { Entity } from './Entity.js';
import { 
    DIRECTIONS, 
    GRID_CONFIG, 
    PLAYER_CONFIG, 
    TILE_TYPES 
} from '../config.js';

export class Player extends Entity {
    constructor() {
        super();
        this.nextDir = DIRECTIONS.NONE;
        this.mouthAngle = PLAYER_CONFIG.MOUTH_INITIAL_ANGLE;
        this.mouthSpeed = PLAYER_CONFIG.MOUTH_SPEED;
        this.reset();
    }

    /**
     * 重置玩家座標與狀態至初始關卡位置
     */
    reset() {
        const { CELL_SIZE, OFFSET_X, OFFSET_Y } = GRID_CONFIG;
        this.x = PLAYER_CONFIG.START_GRID_X * CELL_SIZE + CELL_SIZE / 2 + OFFSET_X;
        this.y = PLAYER_CONFIG.START_GRID_Y * CELL_SIZE + CELL_SIZE / 2 + OFFSET_Y;
        this.speed = PLAYER_CONFIG.SPEED;
        this.radius = CELL_SIZE / 2 - PLAYER_CONFIG.RADIUS_OFFSET;
        this.dir = DIRECTIONS.NONE;
        this.nextDir = DIRECTIONS.NONE;
        this.mouthAngle = PLAYER_CONFIG.MOUTH_INITIAL_ANGLE;
        this.mouthSpeed = PLAYER_CONFIG.MOUTH_SPEED;
    }

    /**
     * 設定下一次預備轉向之方向
     * @param {Object} dir 
     */
    setNextDirection(dir) {
        this.nextDir = dir;
    }

    /**
     * 檢驗指定方向是否受牆壁阻擋
     * @param {Object} dir 
     * @param {number[][]} map 
     * @returns {boolean}
     */
    canMove(dir, map) {
        if (!dir || dir === DIRECTIONS.NONE) return false;

        const newX = this.x + dir.x * this.speed;
        const newY = this.y + dir.y * this.speed;

        // 檢查 Pac-Man 邊界四個角是否碰撞牆壁
        const r = this.radius - 1;
        const checkPoints = [
            { x: newX - r, y: newY - r },
            { x: newX + r, y: newY - r },
            { x: newX - r, y: newY + r },
            { x: newX + r, y: newY + r }
        ];

        const { CELL_SIZE, OFFSET_X, OFFSET_Y } = GRID_CONFIG;

        return checkPoints.every(pt => {
            const gridX = Math.floor((pt.x - OFFSET_X) / CELL_SIZE);
            const gridY = Math.floor((pt.y - OFFSET_Y) / CELL_SIZE);
            if (gridY >= 0 && gridY < map.length && gridX >= 0 && gridX < map[0].length) {
                return map[gridY][gridX] !== TILE_TYPES.WALL; // 非牆壁即可通行
            }
            return true;
        });
    }

    /**
     * 更新位置、轉向、嘴巴動畫與管道穿越
     * @param {number} dt 
     * @param {number} dtFactor 
     * @param {number[][]} map 
     */
    update(dt, dtFactor, map) {
        // 嘗試應用轉向緩衝
        if (this.nextDir !== DIRECTIONS.NONE && this.canMove(this.nextDir, map)) {
            this.dir = this.nextDir;
        }

        // 沿當前方向移動
        if (this.canMove(this.dir, map)) {
            this.x += this.dir.x * this.speed;
            this.y += this.dir.y * this.speed;

            // 嘴巴動畫進展
            this.mouthAngle += this.mouthSpeed;
            if (
                this.mouthAngle > PLAYER_CONFIG.MOUTH_MAX_ANGLE || 
                this.mouthAngle < PLAYER_CONFIG.MOUTH_MIN_ANGLE
            ) {
                this.mouthSpeed = -this.mouthSpeed;
            }
        }

        // 穿過管道 (左右兩側傳送)
        this.handleTunnelWrap();
    }

    /**
     * 檢驗並吃取目前座標格點的豆子
     * @param {number[][]} map 
     * @param {Function} onEat (tileType, gridX, gridY, worldX, worldY) => void
     */
    checkPelletEat(map, onEat) {
        const { gridX, gridY } = this.getGridPosition();

        if (gridY >= 0 && gridY < map.length && gridX >= 0 && gridX < map[0].length) {
            const tile = map[gridY][gridX];
            if (tile === TILE_TYPES.PELLET || tile === TILE_TYPES.POWER_PELLET) {
                map[gridY][gridX] = TILE_TYPES.EMPTY; // 標記為空地
                if (onEat) {
                    onEat(tile, gridX, gridY, this.x, this.y);
                }
            }
        }
    }

    /**
     * 繪製吃豆人
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.fillStyle = PLAYER_CONFIG.COLOR;
        ctx.beginPath();

        const rotation = this.dir.angle || 0;
        const startAngle = rotation + this.mouthAngle;
        const endAngle = rotation + (2 * Math.PI - this.mouthAngle);

        ctx.arc(this.x, this.y, this.radius, startAngle, endAngle);
        ctx.lineTo(this.x, this.y);
        ctx.fill();
        ctx.closePath();
    }
}
