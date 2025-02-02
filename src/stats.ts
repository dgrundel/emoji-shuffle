import { persist } from "./persisted";


export const stats = persist({
    bestStreak: 0,
    bestTime: 0,
}, 'game-stats');