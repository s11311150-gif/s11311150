/**
 * 物理系統 (Physics)
 * 集中處理實體間的距離測量、碰撞檢測與事件判定
 */

import { GRID_CONFIG } from '../config.js';

export const COLLISION_EVENTS = {
    GHOST_EATEN: 'GHOST_EATEN',
    PLAYER_DEAD: 'PLAYER_DEAD',
};

export class Physics {
    /**
     * 檢測兩點或實體之間的歐幾里得距離
     * @param {{x: number, y: number}} a 
     * @param {{y: number, x: number}} b 
     * @returns {number}
     */
    static getDistance(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    /**
     * 檢驗吃豆人與幽靈集合之間的碰撞情況
     * @param {Object} player 
     * @param {Array<Object>} ghosts 
     * @returns {Array<{ ghost: Object, type: string }>} 碰撞事件列表
     */
    static checkPlayerGhostCollisions(player, ghosts) {
        const events = [];
        const collisionThreshold = (GRID_CONFIG.CELL_SIZE / 2);

        for (const ghost of ghosts) {
            const dist = Physics.getDistance(player, ghost);
            // 保留原本 CELL_SIZE / 2 + ghost.speed 的判定閾值
            if (dist < collisionThreshold + ghost.speed) {
                if (ghost.isFrightened) {
                    events.push({
                        ghost,
                        type: COLLISION_EVENTS.GHOST_EATEN,
                    });
                } else {
                    events.push({
                        ghost,
                        type: COLLISION_EVENTS.PLAYER_DEAD,
                    });
                }
            }
        }

        return events;
    }
}
