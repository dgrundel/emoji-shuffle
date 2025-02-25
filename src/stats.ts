import { persist } from "./persisted";


export const stats = persist({
    currentStreak: 0,
    bestStreak: 0,
    bestTime: 0,
}, 'game-stats');