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

// 玩家屬性配置 (農夫吃豆人)
export const PLAYER_CONFIG = {
    START_GRID_X: 10,
    START_GRID_Y: 18,
    SPEED: 2.2, // 提升至 2.2 增加靈活度
    CORNERING_TOLERANCE: 7, // 拐彎輔助吸附容許範圍 (像素)，大幅增進轉彎流暢度
    RADIUS_OFFSET: 2, // CELL_SIZE / 2 - RADIUS_OFFSET
    MOUTH_INITIAL_ANGLE: 0.2,
    MOUTH_MIN_ANGLE: 0.05,
    MOUTH_MAX_ANGLE: 0.42,
    MOUTH_SPEED: 0.03,
    COLOR: '#fbc02d',
    HAT_COLOR: '#f0c058',
    HAT_BRIM: '#d99b32',
    HAT_BAND: '#d32f2f',
    OVERALLS: '#1976d2',
    BUTTONS: '#ffd700',
    CHEEKS: 'rgba(255, 110, 110, 0.5)',
};

// 幽靈敵方配置 (農場搗蛋小動物)
export const GHOST_CONFIGS = [
    { name: 'Blinky', color: '#e53935', startGridX: 9, startGridY: 9 },
    { name: 'Pinky', color: '#f06292', startGridX: 10, startGridY: 9 },
    { name: 'Inky', color: '#26c6da', startGridX: 9, startGridY: 10 },
    { name: 'Clyde', color: '#ffa726', startGridX: 10, startGridY: 10 },
];

export const GHOST_CONSTANTS = {
    SPEED_NORMAL: 1.5,
    SPEED_FRIGHTENED_FACTOR: 0.6,
    FRIGHTENED_DURATION: 300, // 300 ticks (~5 秒 @ 60 FPS)
    FLASH_THRESHOLD: 100,
    COLOR_FRIGHTENED: '#3f51b5',
    COLOR_FLASH: '#ffffff',
};

// 分數配置
export const SCORES = {
    PELLET: 10,
    POWER_PELLET: 50,
    GHOST: 200,
};

// 農場風格地圖繪製配色
export const MAP_COLORS = {
    GROUND_BG: '#182413',        // 農場深色草地泥土背景
    PATH_COLOR: '#2a1f16',       // 泥土小徑
    WALL_WOOD_BASE: '#744a27',   // 鄉村木柵欄主色
    WALL_WOOD_LIGHT: '#8d5d33',  // 木柵欄亮面木紋
    WALL_WOOD_DARK: '#543317',   // 木柵欄陰影與縫隙
    WALL_VINE: '#43a047',        // 蔓延在柵欄上的綠色藤蔓
    WALL_FLOWER: '#f48fb1',      // 藤蔓小花
    PELLET_CORN: '#ffca28',      // 金黃玉米顆粒
    PELLET_LEAF: '#66bb6a',      // 玉米嫩綠小芽
    POWER_APPLE: '#e53935',      // 豐收大紅蘋果 (能量豆)
    POWER_LEAF: '#43a047',       // 蘋果綠葉
    PELLET_RADIUS: 3.5,
    POWER_PELLET_RADIUS: 6.5,
};

export const STORAGE_KEYS = {
    HIGH_SCORE: 'pacman_high_score',
};
