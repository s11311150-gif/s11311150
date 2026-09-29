/**
 * 集中式輸入事件管理器 (InputHandler)
 * 監聽鍵盤方向鍵、WASD 及空白鍵重開操作
 */

import { DIRECTIONS } from '../config.js';

export class InputHandler {
    constructor() {
        this.currentRequestedDir = DIRECTIONS.NONE;
        this.onDirectionChanged = null;
        this.onRestartRequested = null;
        this.onMuteRequested = null;
        this.onUserInteraction = null;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.init();
    }

    init() {
        window.addEventListener('keydown', this.handleKeyDown);
    }

    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
    }

    /**
     * @param {KeyboardEvent} e
     */
    handleKeyDown(e) {
        let dir = null;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                dir = DIRECTIONS.UP;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                dir = DIRECTIONS.DOWN;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                dir = DIRECTIONS.LEFT;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                dir = DIRECTIONS.RIGHT;
                break;
            case ' ':
                if (this.onRestartRequested) {
                    this.onRestartRequested();
                }
                break;
            case 'm':
            case 'M':
                if (this.onMuteRequested) {
                    this.onMuteRequested();
                }
                break;
            default:
                return;
        }

        if (this.onUserInteraction) {
            this.onUserInteraction();
        }

        if (dir) {
            this.currentRequestedDir = dir;
            if (this.onDirectionChanged) {
                this.onDirectionChanged(dir);
            }
        }
    }
}
