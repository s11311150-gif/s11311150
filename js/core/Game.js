/**
 * 遊戲主核心模組 (Game)
 * 協調整合地圖渲染、實體生命週期、物理系統、粒子特效與 UI 狀態機
 */

import { 
    CANVAS_CONFIG, 
    GRID_CONFIG, 
    MAP_TEMPLATE, 
    TILE_TYPES, 
    GHOST_CONFIGS, 
    SCORES, 
    MAP_COLORS 
} from '../config.js';
import { Player } from '../entities/Player.js';
import { Ghost } from '../entities/Ghost.js';
import { Physics, COLLISION_EVENTS } from '../systems/Physics.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { HUD } from '../ui/HUD.js';
import { InputHandler } from './InputHandler.js';

export class Game {
    /**
     * @param {HTMLCanvasElement} canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 確保畫布尺寸與配置一致
        this.canvas.width = CANVAS_CONFIG.WIDTH;
        this.canvas.height = CANVAS_CONFIG.HEIGHT;

        // 核心子系統實例化
        this.hud = new HUD();
        this.particles = new ParticleSystem();
        this.inputHandler = new InputHandler();

        // 實體初始化
        this.player = new Player();
        this.ghosts = GHOST_CONFIGS.map(cfg => 
            new Ghost(cfg.color, cfg.startGridX, cfg.startGridY, cfg.name)
        );

        // 遊戲狀態
        this.map = [];
        this.score = 0;
        this.totalPellets = 0;
        this.gameOver = false;
        this.gameWon = false;

        this.setupEventHandlers();
        this.initGame();
    }

    /**
     * 綁定輸入事件
     */
    setupEventHandlers() {
        // 方向輸入
        this.inputHandler.onDirectionChanged = (dir) => {
            this.player.setNextDirection(dir);
        };

        // 空白鍵重新開始
        this.inputHandler.onRestartRequested = () => {
            if (this.gameOver || this.gameWon) {
                this.initGame();
            }
        };
    }

    /**
     * 初始化或重新開始整場遊戲
     */
    initGame() {
        this.score = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.totalPellets = 0;

        this.hud.updateScore(this.score);
        this.particles.clear();

        // 深拷貝地圖模板並統計豆子總數
        this.map = JSON.parse(JSON.stringify(MAP_TEMPLATE));
        for (let r = 0; r < this.map.length; r++) {
            for (let c = 0; c < this.map[r].length; c++) {
                const tile = this.map[r][c];
                if (tile === TILE_TYPES.PELLET || tile === TILE_TYPES.POWER_PELLET) {
                    this.totalPellets++;
                }
            }
        }

        // 實體重置至初始位置
        this.player.reset();
        this.ghosts.forEach(ghost => ghost.reset());
    }

    /**
     * 影格狀態更新
     * @param {number} dt 
     * @param {number} dtFactor 
     */
    update(dt, dtFactor) {
        if (!this.gameOver && !this.gameWon) {
            // 更新吃豆人
            this.player.update(dt, dtFactor, this.map);

            // 吃豆判定
            this.player.checkPelletEat(this.map, (type, gx, gy, wx, wy) => {
                if (type === TILE_TYPES.PELLET) {
                    this.score += SCORES.PELLET;
                    this.totalPellets--;
                    this.particles.emitPelletSpark(wx, wy);
                } else if (type === TILE_TYPES.POWER_PELLET) {
                    this.score += SCORES.POWER_PELLET;
                    this.totalPellets--;
                    this.ghosts.forEach(g => g.makeFrightened());
                    this.particles.emitPowerBurst(wx, wy);
                }

                this.hud.updateScore(this.score);

                if (this.totalPellets === 0) {
                    this.gameWon = true;
                }
            });

            // 更新幽靈 AI
            this.ghosts.forEach(ghost => {
                ghost.update(dt, dtFactor, this.map, this.player);
            });

            // 物理碰撞檢測
            const collisionEvents = Physics.checkPlayerGhostCollisions(this.player, this.ghosts);
            for (const event of collisionEvents) {
                if (event.type === COLLISION_EVENTS.GHOST_EATEN) {
                    this.score += SCORES.GHOST;
                    this.hud.updateScore(this.score);
                    this.particles.emitGhostEaten(event.ghost.x, event.ghost.y, event.ghost.color);
                    event.ghost.reset();
                } else if (event.type === COLLISION_EVENTS.PLAYER_DEAD) {
                    this.gameOver = true;
                    break;
                }
            }
        }

        // 粒子效果更新
        this.particles.update();
    }

    /**
     * 繪製迷宮地圖與豆子
     */
    drawMap() {
        const { CELL_SIZE, OFFSET_X, OFFSET_Y } = GRID_CONFIG;
        const ctx = this.ctx;

        for (let r = 0; r < this.map.length; r++) {
            for (let c = 0; c < this.map[r].length; c++) {
                const x = c * CELL_SIZE + OFFSET_X;
                const y = r * CELL_SIZE + OFFSET_Y;
                const tile = this.map[r][c];

                if (tile === TILE_TYPES.WALL) {
                    ctx.fillStyle = MAP_COLORS.WALL_FILL;
                    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                    ctx.strokeStyle = MAP_COLORS.WALL_STROKE;
                    ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
                } else if (tile === TILE_TYPES.PELLET) {
                    ctx.fillStyle = MAP_COLORS.PELLET;
                    ctx.beginPath();
                    ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, MAP_COLORS.PELLET_RADIUS, 0, Math.PI * 2);
                    ctx.fill();
                } else if (tile === TILE_TYPES.POWER_PELLET) {
                    ctx.fillStyle = MAP_COLORS.PELLET;
                    ctx.beginPath();
                    ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, MAP_COLORS.POWER_PELLET_RADIUS, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    /**
     * 主畫面渲染繪製
     */
    render() {
        // 清空畫布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 繪製地圖與豆子
        this.drawMap();

        // 繪製粒子特效
        this.particles.draw(this.ctx);

        // 繪製玩家實體
        this.player.draw(this.ctx);

        // 繪製敵方幽靈
        this.ghosts.forEach(ghost => ghost.draw(this.ctx));

        // 繪製結束與過關遮罩
        if (this.gameOver) {
            this.hud.drawGameOver(this.ctx, this.canvas);
        } else if (this.gameWon) {
            this.hud.drawGameWon(this.ctx, this.canvas);
        }
    }
}
