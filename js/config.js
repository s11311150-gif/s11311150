/**
 * 遊戲全局配置與常數定義
 */

export const CANVAS_CONFIG = {
    WIDTH: 448,
    HEIGHT: 496,
};

export const GRID_CONFIG = {
    CELL_SIZE: 20,
    OFFSET_X: 14,
    OFFSET_Y: 18,
};

// 圖塊代碼：0: 普通豆子, 1: 牆壁, 2: 空地, 3: 能量豆
export const TILE_TYPES = {
    PELLET: 0,
    WALL: 1,
    EMPTY: 2,
    POWER_PELLET: 3,
};

// 原始地圖矩陣 (23 列 x 21 行)
export const MAP_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,3,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,3,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1,1],
    [2,2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2,2],
    [1,1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1,1],
    [2,2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2,2],
    [1,1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1,1],
    [2,2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2,2],
    [1,1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,3,0,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,0,3,1],
    [1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// 方向定義與角度映射
export const DIRECTIONS = {
    NONE: { x: 0, y: 0, angle: 0 },
    UP: { x: 0, y: -1, angle: 1.5 * Math.PI },
    DOWN: { x: 0, y: 1, angle: 0.5 * Math.PI },
    LEFT: { x: -1, y: 0, angle: Math.PI },
    RIGHT: { x: 1, y: 0, angle: 0 },
};

// 玩家屬性配置
export const PLAYER_CONFIG = {
    START_GRID_X: 10,
    START_GRID_Y: 18,
    SPEED: 2,
    RADIUS_OFFSET: 2, // CELL_SIZE / 2 - RADIUS_OFFSET
    MOUTH_INITIAL_ANGLE: 0.2,
    MOUTH_MIN_ANGLE: 0.05,
    MOUTH_MAX_ANGLE: 0.4,
    MOUTH_SPEED: 0.02,
    COLOR: '#ffff00',
};

// 幽靈敵方配置
export const GHOST_CONFIGS = [
    { name: 'Blinky', color: '#ff0000', startGridX: 9, startGridY: 9 },
    { name: 'Pinky', color: '#ffb8ff', startGridX: 10, startGridY: 9 },
    { name: 'Inky', color: '#00ffff', startGridX: 9, startGridY: 10 },
    { name: 'Clyde', color: '#ffb852', startGridX: 10, startGridY: 10 },
];

export const GHOST_CONSTANTS = {
    SPEED_NORMAL: 1.5,
    SPEED_FRIGHTENED_FACTOR: 0.6,
    FRIGHTENED_DURATION: 300, // 300 ticks (~5 秒 @ 60 FPS)
    FLASH_THRESHOLD: 100,
    COLOR_FRIGHTENED: '#0000ff',
    COLOR_FLASH: '#ffffff',
};

// 分數配置
export const SCORES = {
    PELLET: 10,
    POWER_PELLET: 50,
    GHOST: 200,
};

// 地圖繪製配色
export const MAP_COLORS = {
    WALL_FILL: '#1919a6',
    WALL_STROKE: '#000000',
    PELLET: '#ffb8ae',
    PELLET_RADIUS: 3,
    POWER_PELLET_RADIUS: 6,
};

export const STORAGE_KEYS = {
    HIGH_SCORE: 'pacman_high_score',
};
