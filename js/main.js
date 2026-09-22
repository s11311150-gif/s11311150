/**
 * 應用程式進入點 (main.js)
 * 負責實例化 Game 與 GameLoop，並啟動遊戲主循環
 */

import { Game } from './core/Game.js';
import { GameLoop } from './core/GameLoop.js';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('找不到 #gameCanvas 元素，請檢查 HTML 結構。');
        return;
    }

    // 實例化遊戲主引擎
    const game = new Game(canvas);

    // 建立 GameLoop，傳遞 update 與 render
    const loop = new GameLoop(
        (dt, dtFactor) => game.update(dt, dtFactor),
        () => game.render()
    );

    // 啟動主循環
    loop.start();

    // 掛載至 window 便於除錯測試 (可選)
    window.__PACMAN_GAME__ = game;
    window.__PACMAN_LOOP__ = loop;
});
