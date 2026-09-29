/**
 * 農夫吃豆人玩家實體 (Player)
 * 繼承自 Entity，負責玩家平滑過彎輔助、牆壁檢測、農夫造型與嘴巴張合動畫
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
        this.lastValidAngle = 0; // 記住最後移動角度，靜止時也能正確面向
        this.reset();
    }

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
        this.lastValidAngle = 0;
    }

    setNextDirection(dir) {
        this.nextDir = dir;
    }

    /**
     * 檢驗指定座標與方向是否可行進 (未撞牆)
     */
    canMoveAt(x, y, dir, map, step = this.speed) {
        if (!dir || dir === DIRECTIONS.NONE) return false;

        const newX = x + dir.x * step;
        const newY = y + dir.y * step;

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
                return map[gridY][gridX] !== TILE_TYPES.WALL;
            }
            return true;
        });
    }

    canMove(dir, map, step = this.speed) {
        return this.canMoveAt(this.x, this.y, dir, map, step);
    }

    /**
     * 拐彎輔助與轉向吸附 (Cornering Assist)
     * 當玩家在路口附近提前按轉彎時，自動對齊走道中線並完成平滑轉彎，大幅增進操作手感！
     */
    tryCornering(map, step) {
        if (!this.nextDir || this.nextDir === DIRECTIONS.NONE) return false;
        if (this.nextDir === this.dir) return false;

        // 反向操作直接允許轉身，不卡頓
        if (this.nextDir.x === -this.dir.x && this.nextDir.y === -this.dir.y) {
            this.dir = this.nextDir;
            this.nextDir = DIRECTIONS.NONE;
            return true;
        }

        const { CELL_SIZE, OFFSET_X, OFFSET_Y } = GRID_CONFIG;
        const tolerance = PLAYER_CONFIG.CORNERING_TOLERANCE || 7;

        // 當前沿著水平方向移動 (LEFT/RIGHT)，想轉垂直方向 (UP/DOWN)
        if (this.dir.x !== 0 && this.nextDir.y !== 0) {
            const nearestCol = Math.round((this.x - OFFSET_X - CELL_SIZE / 2) / CELL_SIZE);
            const targetCenterX = nearestCol * CELL_SIZE + CELL_SIZE / 2 + OFFSET_X;
            const dist = Math.abs(this.x - targetCenterX);

            if (dist <= tolerance) {
                // 檢查對齊該走道中心後，是否能往目標方向走
                if (this.canMoveAt(targetCenterX, this.y, this.nextDir, map, step)) {
                    this.x = targetCenterX; // 平滑吸附至走道中線
                    this.dir = this.nextDir;
                    this.nextDir = DIRECTIONS.NONE;
                    return true;
                }
            }
        }

        // 當前沿著垂直方向移動 (UP/DOWN)，想轉水平方向 (LEFT/RIGHT)
        if (this.dir.y !== 0 && this.nextDir.x !== 0) {
            const nearestRow = Math.round((this.y - OFFSET_Y - CELL_SIZE / 2) / CELL_SIZE);
            const targetCenterY = nearestRow * CELL_SIZE + CELL_SIZE / 2 + OFFSET_Y;
            const dist = Math.abs(this.y - targetCenterY);

            if (dist <= tolerance) {
                if (this.canMoveAt(this.x, targetCenterY, this.nextDir, map, step)) {
                    this.y = targetCenterY; // 平滑吸附至走道中線
                    this.dir = this.nextDir;
                    this.nextDir = DIRECTIONS.NONE;
                    return true;
                }
            }
        }

        // 若完全靜止時，只要可行就轉向
        if (this.dir === DIRECTIONS.NONE) {
            if (this.canMove(this.nextDir, map, step)) {
                this.dir = this.nextDir;
                this.nextDir = DIRECTIONS.NONE;
                return true;
            }
        }

        return false;
    }

    /**
     * 更新位置、轉向、嘴巴動畫與管道穿越
     */
    update(dt, dtFactor, map) {
        // 動態步進計算 (支援可變刷新率，防卡頓)
        const factor = Math.max(0.6, Math.min(1.4, dtFactor || 1.0));
        const moveStep = this.speed * factor;

        // 優先嘗試過彎吸附與轉向
        this.tryCornering(map, moveStep);

        // 如果當前方向仍可行進
        if (this.canMove(this.dir, map, moveStep)) {
            this.x += this.dir.x * moveStep;
            this.y += this.dir.y * moveStep;

            if (this.dir !== DIRECTIONS.NONE) {
                this.lastValidAngle = this.dir.angle;
            }

            // 嘴巴張合動畫
            this.mouthAngle += this.mouthSpeed * factor;
            if (
                this.mouthAngle > PLAYER_CONFIG.MOUTH_MAX_ANGLE || 
                this.mouthAngle < PLAYER_CONFIG.MOUTH_MIN_ANGLE
            ) {
                this.mouthSpeed = -this.mouthSpeed;
            }
        } else {
            // 撞牆時微微閉口
            this.mouthAngle = Math.max(0.08, this.mouthAngle * 0.95);
        }

        // 穿過地圖通道
        this.handleTunnelWrap();
    }

    /**
     * 檢驗並吃取目前座標格點的豆子
     */
    checkPelletEat(map, onEat) {
        const { gridX, gridY } = this.getGridPosition();

        if (gridY >= 0 && gridY < map.length && gridX >= 0 && gridX < map[0].length) {
            const tile = map[gridY][gridX];
            if (tile === TILE_TYPES.PELLET || tile === TILE_TYPES.POWER_PELLET) {
                map[gridY][gridX] = TILE_TYPES.EMPTY;
                if (onEat) {
                    onEat(tile, gridX, gridY, this.x, this.y);
                }
            }
        }
    }

    /**
     * 繪製農夫造型吃豆人 (Farmer Pac-Man)
     * 具有：黃色本體、農夫草帽 (寬帽簷+紅絲帶)、藍色工裝吊帶褲、金鈕扣、粉紅害羞臉頰、口銜麥穗
     */
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const rotation = (this.dir !== DIRECTIONS.NONE ? this.dir.angle : this.lastValidAngle) || 0;

        // 1. 繪製吃豆人本體 (黃色 + 嘴巴張合)
        ctx.save();
        ctx.rotate(rotation);

        // 主體
        ctx.fillStyle = PLAYER_CONFIG.COLOR;
        ctx.beginPath();
        const startAngle = this.mouthAngle;
        const endAngle = 2 * Math.PI - this.mouthAngle;
        ctx.arc(0, 0, this.radius, startAngle, endAngle);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.closePath();

        // 藍色工裝吊帶褲 (包覆下半身)
        ctx.fillStyle = PLAYER_CONFIG.OVERALLS;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, Math.PI * 0.35, Math.PI * 0.65);
        ctx.arc(0, 0, this.radius * 0.55, Math.PI * 0.65, Math.PI * 0.35, true);
        ctx.closePath();
        ctx.fill();

        // 吊帶背帶金鈕扣
        ctx.fillStyle = PLAYER_CONFIG.BUTTONS;
        ctx.beginPath();
        ctx.arc(-this.radius * 0.3, this.radius * 0.45, 1.2, 0, Math.PI * 2);
        ctx.arc(this.radius * 0.1, this.radius * 0.45, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // 口銜小麥穗 (隨行前進飄動)
        if (this.mouthAngle > 0.15) {
            ctx.strokeStyle = '#fbc02d';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(this.radius * 0.5, 0);
            ctx.quadraticCurveTo(this.radius * 1.1, -this.radius * 0.3, this.radius * 1.3, -this.radius * 0.5);
            ctx.stroke();

            // 麥穗小顆粒
            ctx.fillStyle = '#ffe082';
            ctx.beginPath();
            ctx.arc(this.radius * 1.3, -this.radius * 0.5, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // 眼睛 (農夫炯炯有神的眼珠)
        const eyeX = this.radius * 0.2;
        const eyeY = -this.radius * 0.5;
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, 1.8, 0, Math.PI * 2);
        ctx.fill();
        // 眼睛高光
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX - 0.5, eyeY - 0.5, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // 可愛紅潤腮紅
        ctx.fillStyle = PLAYER_CONFIG.CHEEKS;
        ctx.beginPath();
        ctx.ellipse(-this.radius * 0.2, -this.radius * 0.1, 2.2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore(); // 結束隨前進方向旋轉的層級

        // 2. 繪製農夫草帽 (微傾戴在吃豆人頭上，保持經典辨識度)
        ctx.save();
        // 微跟隨旋轉角度但保持帽子朝上，生動又立體
        const tilt = Math.sin(rotation) * 0.2;
        ctx.rotate(tilt);

        const hatY = -this.radius * 0.85;

        // 草帽帽簷 (底層微陰影)
        ctx.fillStyle = '#b78125';
        ctx.beginPath();
        ctx.ellipse(0, hatY + 1, this.radius * 1.15, this.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // 草帽帽簷主色
        ctx.fillStyle = PLAYER_CONFIG.HAT_BRIM;
        ctx.beginPath();
        ctx.ellipse(0, hatY, this.radius * 1.1, this.radius * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();

        // 草帽頂部 (圓弧梯形頂冠)
        ctx.fillStyle = PLAYER_CONFIG.HAT_COLOR;
        ctx.beginPath();
        ctx.moveTo(-this.radius * 0.55, hatY);
        ctx.quadraticCurveTo(-this.radius * 0.5, hatY - this.radius * 0.8, 0, hatY - this.radius * 0.85);
        ctx.quadraticCurveTo(this.radius * 0.5, hatY - this.radius * 0.8, this.radius * 0.55, hatY);
        ctx.closePath();
        ctx.fill();

        // 草帽紅色飾帶 (Red Ribbon Band)
        ctx.fillStyle = PLAYER_CONFIG.HAT_BAND;
        ctx.beginPath();
        ctx.ellipse(0, hatY - 1, this.radius * 0.58, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 草帽編織木紋裝飾線
        ctx.strokeStyle = '#c48924';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-this.radius * 0.35, hatY - this.radius * 0.45);
        ctx.lineTo(this.radius * 0.35, hatY - this.radius * 0.45);
        ctx.stroke();

        ctx.restore();
        ctx.restore();
    }
}
