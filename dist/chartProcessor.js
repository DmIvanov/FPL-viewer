// ===== CHART DATA PROCESSOR =====
// Translates H2H matches into chart-ready data
// Based on iOS ResponseProcessor logic
export class ChartProcessor {
    constructor(h2hMatches) {
        Object.defineProperty(this, "matches", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "managers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // Changed from Set to Map
        // Color palette matching iOS implementation
        Object.defineProperty(this, "colors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [
                'rgb(227, 26, 28)', // Red
                'rgb(56, 125, 184)', // Blue
                'rgb(77, 175, 74)', // Green
                'rgb(255, 127, 0)', // Orange
                'rgb(152, 78, 163)', // Purple
                'rgb(255, 217, 47)', // Yellow
                'rgb(166, 86, 40)', // Brown
                'rgb(33, 179, 171)', // Teal
                'rgb(140, 140, 140)', // Gray
                'rgb(250, 128, 114)', // Salmon
                'rgb(102, 59, 184)', // Indigo
                'rgb(0, 189, 212)', // Cyan
                'rgb(252, 3, 153)', // Magenta
                'rgb(0, 0, 0)' // Black
            ]
        });
        this.matches = this.convertMatches(h2hMatches);
        this.managers = new Map(); // Initialize as Map
    }
    /**
     * Convert H2H API matches to ProcessedMatch format
     */
    convertMatches(h2hMatches) {
        return h2hMatches.map(match => {
            const manager1 = {
                id: String(match.entry_1_entry),
                name: match.entry_1_name,
                team: match.entry_1_player_name
            };
            const manager2 = {
                id: String(match.entry_2_entry),
                name: match.entry_2_name,
                team: match.entry_2_player_name
            };
            // Determine match result
            const entry1Win = match.entry_1_win || 0;
            const entry2Win = match.entry_2_win || 0;
            const entryDraw = match.entry_1_draw || 0;
            let draw;
            let winnerId;
            let man1res;
            let man2res;
            let happened;
            // Use the finished flag from API and check if both have points
            const hasFinished = match.finished && (match.entry_1_points > 0 || match.entry_2_points > 0);
            if (entry1Win === 1) {
                winnerId = manager1.id;
                man1res = 3;
                man2res = 0;
                draw = false;
                happened = true;
            }
            else if (entry2Win === 1) {
                winnerId = manager2.id;
                man1res = 0;
                man2res = 3;
                draw = false;
                happened = true;
            }
            else if (entryDraw === 1) {
                winnerId = null;
                man1res = 1;
                man2res = 1;
                draw = true;
                happened = true;
            }
            else if (hasFinished) {
                // Match is finished but win/draw flags might not be set
                // Determine winner based on points
                if (match.entry_1_points > match.entry_2_points) {
                    winnerId = manager1.id;
                    man1res = 3;
                    man2res = 0;
                    draw = false;
                }
                else if (match.entry_2_points > match.entry_1_points) {
                    winnerId = manager2.id;
                    man1res = 0;
                    man2res = 3;
                    draw = false;
                }
                else {
                    winnerId = null;
                    man1res = 1;
                    man2res = 1;
                    draw = true;
                }
                happened = true;
            }
            else {
                // Match hasn't happened yet
                winnerId = null;
                man1res = 0;
                man2res = 0;
                draw = false;
                happened = false;
            }
            return {
                manager1,
                manager1Points: match.entry_1_points,
                manager1ResultPoints: man1res,
                manager2,
                manager2Points: match.entry_2_points,
                manager2ResultPoints: man2res,
                gameWeek: match.event,
                winnerId,
                draw,
                happened
            };
        });
    }
    /**
     * Process matches and generate chart data
     * Returns both absolute and relative chart models
     */
    process() {
        // Filter only matches that have happened
        const happenedMatches = this.matches.filter(m => m.happened);
        // Sort matches by gameweek
        happenedMatches.sort((a, b) => a.gameWeek - b.gameWeek);
        // Collect all managers and find min/max gameweeks
        let minGameWeek = Infinity;
        let maxGameWeek = -Infinity;
        for (const match of happenedMatches) {
            this.managers.set(match.manager1.id, match.manager1);
            this.managers.set(match.manager2.id, match.manager2);
            minGameWeek = Math.min(minGameWeek, match.gameWeek);
            maxGameWeek = Math.max(maxGameWeek, match.gameWeek);
        }
        // Track cumulative match points by actual gameweek number
        const matchPointsByGW = new Map();
        // Track cumulative absolute FPL points by actual gameweek number
        const absolutePointsByGW = new Map();
        // Initialize for all managers
        for (const manager of this.managers.values()) {
            matchPointsByGW.set(manager.id, new Map());
            absolutePointsByGW.set(manager.id, new Map());
        }
        // Process each match and build cumulative points by actual gameweek
        for (const match of happenedMatches) {
            const gw = match.gameWeek;
            // Get previous cumulative values (from previous gameweek)
            const man1MatchMap = matchPointsByGW.get(match.manager1.id);
            const man2MatchMap = matchPointsByGW.get(match.manager2.id);
            const man1AbsMap = absolutePointsByGW.get(match.manager1.id);
            const man2AbsMap = absolutePointsByGW.get(match.manager2.id);
            // Find the last gameweek before this one where each manager played
            let man1PrevMatch = 0;
            let man2PrevMatch = 0;
            let man1PrevAbs = 0;
            let man2PrevAbs = 0;
            for (let prevGW = gw - 1; prevGW >= minGameWeek; prevGW--) {
                if (man1PrevMatch === 0 && man1MatchMap.has(prevGW)) {
                    man1PrevMatch = man1MatchMap.get(prevGW);
                    man1PrevAbs = man1AbsMap.get(prevGW);
                }
                if (man2PrevMatch === 0 && man2MatchMap.has(prevGW)) {
                    man2PrevMatch = man2MatchMap.get(prevGW);
                    man2PrevAbs = man2AbsMap.get(prevGW);
                }
                if (man1PrevMatch !== 0 && man2PrevMatch !== 0)
                    break;
            }
            // Calculate new match points for this gameweek
            let man1NewMatchPoints = man1PrevMatch;
            let man2NewMatchPoints = man2PrevMatch;
            if (match.draw) {
                man1NewMatchPoints += 1;
                man2NewMatchPoints += 1;
            }
            else if (match.winnerId === match.manager1.id) {
                man1NewMatchPoints += 3;
            }
            else {
                man2NewMatchPoints += 3;
            }
            // Store cumulative points for this gameweek
            man1MatchMap.set(gw, man1NewMatchPoints);
            man2MatchMap.set(gw, man2NewMatchPoints);
            man1AbsMap.set(gw, man1PrevAbs + match.manager1Points);
            man2AbsMap.set(gw, man2PrevAbs + match.manager2Points);
        }
        // === BUILD ARRAYS FOR CHARTS (with all gameweeks) ===
        const matchPointsWeekly = new Map();
        const absolutePointsWeekly = new Map();
        const relativeWeekly = new Map();
        // Track which managers have started playing
        const activeManagers = new Set();
        // For each gameweek, calculate positions
        for (let gw = minGameWeek; gw <= maxGameWeek; gw++) {
            // First, check which managers played in this specific gameweek
            for (const manager of this.managers.values()) {
                const matchMap = matchPointsByGW.get(manager.id);
                if (matchMap.has(gw)) {
                    activeManagers.add(manager.id);
                }
            }
            const weekPositions = [];
            // Get all managers who have played by this gameweek
            for (const managerId of activeManagers) {
                const matchMap = matchPointsByGW.get(managerId);
                const absMap = absolutePointsByGW.get(managerId);
                // Find the most recent gameweek <= current gw where this manager played
                let matchPoints = 0;
                let absolutePoints = 0;
                for (let searchGW = gw; searchGW >= minGameWeek; searchGW--) {
                    if (matchMap.has(searchGW)) {
                        matchPoints = matchMap.get(searchGW);
                        absolutePoints = absMap.get(searchGW);
                        break;
                    }
                }
                weekPositions.push({
                    managerId,
                    matchPoints,
                    absolutePoints
                });
            }
            // Sort by match points, then by absolute points (descending)
            weekPositions.sort((a, b) => {
                if (a.matchPoints === b.matchPoints) {
                    return b.absolutePoints - a.absolutePoints;
                }
                return b.matchPoints - a.matchPoints;
            });
            // Assign positions and build arrays for ALL active managers
            weekPositions.forEach((entry, position) => {
                // Add to match points array
                const matchArray = matchPointsWeekly.get(entry.managerId) || [];
                matchArray.push(entry.matchPoints);
                matchPointsWeekly.set(entry.managerId, matchArray);
                // Add to absolute points array
                const absArray = absolutePointsWeekly.get(entry.managerId) || [];
                absArray.push(entry.absolutePoints);
                absolutePointsWeekly.set(entry.managerId, absArray);
                // Add to relative positions array
                const relArray = relativeWeekly.get(entry.managerId) || [];
                relArray.push(position + 1);
                relativeWeekly.set(entry.managerId, relArray);
            });
        }
        // === CREATE CHART MODELS ===
        const absoluteManagers = [];
        const relativeManagers = [];
        let colorIndex = 0;
        for (const manager of this.managers.values()) {
            const matchPoints = matchPointsWeekly.get(manager.id) || [];
            const relativePositions = relativeWeekly.get(manager.id) || [];
            const colorValue = this.colors[colorIndex % this.colors.length];
            absoluteManagers.push({
                id: manager.id,
                name: manager.name,
                gwValues: matchPoints,
                color: colorValue
            });
            relativeManagers.push({
                id: manager.id,
                name: manager.name,
                gwValues: relativePositions,
                color: colorValue
            });
            colorIndex++;
        }
        return {
            absoluteManagers,
            relativeManagers
        };
    }
}
//# sourceMappingURL=chartProcessor.js.map