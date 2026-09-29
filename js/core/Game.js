/**
 * 遊戲主核心模組 (Game)
 * 協調整合農場地圖渲染、實體生命週期、物理系統、粒子特效、音樂系統與 UI 狀態機
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
import { AudioManager } from './AudioManager.js';

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
        this.audioManager = new AudioManager();

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
        this.setupAudioControls();
        this.initGame();
    }

    /**
     * 綁定輸入事件
     */
    setupEventHandlers() {
        // 玩家進行任何方向移動或操作時，觸發播放背景音樂 (解決瀏覽器限制)
        this.inputHandler.onUserInteraction = () => {
            this.audioManager.triggerPlayOnInteraction();
        };

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

        // M 鍵靜音切換
        this.inputHandler.onMuteRequested = () => {
            this.audioManager.toggleMute();
        };

        // 點擊畫布也能啟動音樂並聚焦
        this.canvas.addEventListener('click', () => {
            this.audioManager.triggerPlayOnInteraction();
        });
    }

    /**
     * 綁定 DOM 音樂切換按鈕
     */
    setupAudioControls() {
        const toggleBtn = document.getElementById('bgm-toggle');
        if (toggleBtn) {
            const updateBtnText = (muted) => {
                toggleBtn.innerText = muted ? '🔈 音樂: 關' : '🎵 音樂: 開';
                toggleBtn.classList.toggle('muted', muted);
            };

            updateBtnText(this.audioManager.isMuted);

            toggleBtn.addEventListener('click', () => {
                const muted = this.audioManager.toggleMute();
                updateBtnText(muted);
            });

            this.audioManager.onMuteChanged = (muted) => {
                updateBtnText(muted);
            };
        }
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
     */
    update(dt, dtFactor) {
        if (!this.gameOver && !this.gameWon) {
            // 更新農夫吃豆人
            this.player.update(dt, dtFactor, this.map);

            // 吃作物判定
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
     * 繪製農場風格地圖、木質柵欄與作物
     */
    drawMap() {
        const { CELL_SIZE, OFFSET_X, OFFSET_Y } = GRID_CONFIG;
        const ctx = this.ctx;
        const now = performance.now();

        // 1. 繪製農場草地泥土背景
        ctx.fillStyle = MAP_COLORS.GROUND_BG;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. 逐格繪製迷宮小徑與柵欄
        for (let r = 0; r < this.map.length; r++) {
            for (let c = 0; c < this.map[r].length; c++) {
                const x = c * CELL_SIZE + OFFSET_X;
                const y = r * CELL_SIZE + OFFSET_Y;
                const tile = this.map[r][c];

                if (tile !== TILE_TYPES.WALL) {
                    // 繪製泥土小徑底色
                    ctx.fillStyle = MAP_COLORS.PATH_COLOR;
                    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                }

                if (tile === TILE_TYPES.WALL) {
                    // --- 農場木質柵欄 (Wooden Ranch Fence) ---
                    // 檢查鄰近四方是否有相連的牆壁
                    const isUp = r > 0 && this.map[r - 1][c] === TILE_TYPES.WALL;
                    const isDown = r < this.map.length - 1 && this.map[r + 1][c] === TILE_TYPES.WALL;
                    const isLeft = c > 0 && this.map[r][c - 1] === TILE_TYPES.WALL;
                    const isRight = c < this.map[r].length - 1 && this.map[r][c + 1] === TILE_TYPES.WALL;

                    // 木柵欄基底色
                    ctx.fillStyle = MAP_COLORS.WALL_WOOD_BASE;
                    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

                    // 柵欄木質橫條與邊框
                    ctx.fillStyle = MAP_COLORS.WALL_WOOD_LIGHT;
                    ctx.fillRect(x + 2, y + 4, CELL_SIZE - 4, CELL_SIZE - 8);

                    // 木柵欄深色陰影隙縫
                    ctx.fillStyle = MAP_COLORS.WALL_WOOD_DARK;
                    ctx.fillRect(x, y + 9, CELL_SIZE, 2);

                    // 如果是立柱或轉角，繪製中央立柱與金屬鉚釘
                    ctx.fillStyle = MAP_COLORS.WALL_WOOD_BASE;
                    ctx.fillRect(x + 4, y, CELL_SIZE - 8, CELL_SIZE);

                    ctx.fillStyle = '#3e2723';
                    ctx.fillRect(x + CELL_SIZE / 2 - 1, y + 3, 2, 2);
                    ctx.fillRect(x + CELL_SIZE / 2 - 1, y + CELL_SIZE - 5, 2, 2);

                    // 外圍與邊角長出的綠意藤蔓植物
                    if ((r === 0 || c === 0 || r === this.map.length - 1 || c === this.map[0].length - 1) && (r + c) % 3 === 0) {
                        ctx.fillStyle = MAP_COLORS.WALL_VINE;
                        ctx.beginPath();
                        ctx.arc(x + 4, y + 4, 2.5, 0, Math.PI * 2);
                        ctx.arc(x + 7, y + 2, 2, 0, Math.PI * 2);
                        ctx.fill();

                        // 偶爾盛開的小粉花
                        if ((r + c) % 6 === 0) {
                            ctx.fillStyle = MAP_COLORS.WALL_FLOWER;
                            ctx.beginPath();
                            ctx.arc(x + 5, y + 3, 1.5, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }

                    // 柵欄精緻輪廓線
                    ctx.strokeStyle = MAP_COLORS.WALL_WOOD_DARK;
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

                } else if (tile === TILE_TYPES.PELLET) {
                    // --- 金黃玉米粒 (Corn Pellet) ---
                    const cx = x + CELL_SIZE / 2;
                    const cy = y + CELL_SIZE / 2;

                    // 玉米粒本體
                    ctx.fillStyle = MAP_COLORS.PELLET_CORN;
                    ctx.beginPath();
                    ctx.ellipse(cx, cy, MAP_COLORS.PELLET_RADIUS, MAP_COLORS.PELLET_RADIUS * 1.25, 0.2, 0, Math.PI * 2);
                    ctx.fill();

                    // 玉米頂部嫩綠芽
                    ctx.fillStyle = MAP_COLORS.PELLET_LEAF;
                    ctx.beginPath();
                    ctx.arc(cx - 1, cy - MAP_COLORS.PELLET_RADIUS, 1.2, 0, Math.PI * 2);
                    ctx.fill();

                } else if (tile === TILE_TYPES.POWER_PELLET) {
                    // --- 豐收大蘋果 (Power Apple) 呼吸縮放特效 ---
                    const cx = x + CELL_SIZE / 2;
                    const cy = y + CELL_SIZE / 2;
                    const pulse = 1 + Math.sin(now / 150) * 0.15;
                    const rApple = MAP_COLORS.POWER_PELLET_RADIUS * pulse;

                    // 蘋果紅潤主體
                    ctx.fillStyle = MAP_COLORS.POWER_APPLE;
                    ctx.beginPath();
                    ctx.arc(cx - rApple * 0.35, cy, rApple * 0.75, 0, Math.PI * 2);
                    ctx.arc(cx + rApple * 0.35, cy, rApple * 0.75, 0, Math.PI * 2);
                    ctx.arc(cx, cy + rApple * 0.2, rApple * 0.8, 0, Math.PI * 2);
                    ctx.fill();

                    // 蘋果果蒂 (棕色小樹枝)
                    ctx.fillStyle = '#5d4037';
                    ctx.fillRect(cx - 0.8, cy - rApple * 1.1, 1.6, rApple * 0.6);

                    // 蘋果綠葉
                    ctx.fillStyle = MAP_COLORS.POWER_LEAF;
                    ctx.beginPath();
                    ctx.ellipse(cx + 3, cy - rApple * 0.9, 2.8, 1.4, -0.4, 0, Math.PI * 2);
                    ctx.fill();

                    // 蘋果表面高光
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                    ctx.beginPath();
                    ctx.arc(cx - rApple * 0.4, cy - rApple * 0.3, 1.8, 0, Math.PI * 2);
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

        // 繪製農場迷宮地圖與作物
        this.drawMap();

        // 繪製粒子特效
        this.particles.draw(this.ctx);

        // 繪製農夫吃豆人
        this.player.draw(this.ctx);

        // 繪製農場幽靈
        this.ghosts.forEach(ghost => ghost.draw(this.ctx));

        // 繪製結束與過關遮罩
        if (this.gameOver) {
            this.hud.drawGameOver(this.ctx, this.canvas);
        } else if (this.gameWon) {
            this.hud.drawGameWon(this.ctx, this.canvas);
        }
    }
}
