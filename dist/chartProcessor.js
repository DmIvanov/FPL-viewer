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
        // Track match points per week (3 for win, 1 for draw, 0 for loss)
        const matchPointsWeekly = new Map();
        // Track cumulative absolute FPL points per week
        const absolutePointsWeekly = new Map();
        // Process each match
        for (const match of happenedMatches) {
            // Add managers to map (prevents duplicates by ID)
            this.managers.set(match.manager1.id, match.manager1);
            this.managers.set(match.manager2.id, match.manager2);
            // === MATCH POINTS ===
            const man1MatchPoints = matchPointsWeekly.get(match.manager1.id) || [];
            const man2MatchPoints = matchPointsWeekly.get(match.manager2.id) || [];
            const man1LastMatchValue = man1MatchPoints[man1MatchPoints.length - 1] || 0;
            const man2LastMatchValue = man2MatchPoints[man2MatchPoints.length - 1] || 0;
            // Calculate new match points
            if (match.draw) {
                man1MatchPoints.push(man1LastMatchValue + 1);
                man2MatchPoints.push(man2LastMatchValue + 1);
            }
            else {
                if (match.winnerId === match.manager1.id) {
                    man1MatchPoints.push(man1LastMatchValue + 3);
                    man2MatchPoints.push(man2LastMatchValue);
                }
                else {
                    man1MatchPoints.push(man1LastMatchValue);
                    man2MatchPoints.push(man2LastMatchValue + 3);
                }
            }
            matchPointsWeekly.set(match.manager1.id, man1MatchPoints);
            matchPointsWeekly.set(match.manager2.id, man2MatchPoints);
            // === ABSOLUTE POINTS ===
            const man1AbsolutePoints = absolutePointsWeekly.get(match.manager1.id) || [];
            const man2AbsolutePoints = absolutePointsWeekly.get(match.manager2.id) || [];
            const man1LastAbsoluteValue = man1AbsolutePoints[man1AbsolutePoints.length - 1] || 0;
            const man2LastAbsoluteValue = man2AbsolutePoints[man2AbsolutePoints.length - 1] || 0;
            // Calculate cumulative absolute points
            man1AbsolutePoints.push(man1LastAbsoluteValue + match.manager1Points);
            man2AbsolutePoints.push(man2LastAbsoluteValue + match.manager2Points);
            absolutePointsWeekly.set(match.manager1.id, man1AbsolutePoints);
            absolutePointsWeekly.set(match.manager2.id, man2AbsolutePoints);
        }
        // === RELATIVE POSITIONS ===
        const relativeWeekly = new Map();
        const weekCount = Array.from(matchPointsWeekly.values())[0]?.length || 0;
        for (let week = 0; week < weekCount; week++) {
            // Get all managers' points for this week
            const weekPositions = [];
            for (const manager of this.managers.values()) {
                const matchPoints = matchPointsWeekly.get(manager.id)?.[week] || 0;
                const absolutePoints = absolutePointsWeekly.get(manager.id)?.[week] || 0;
                weekPositions.push({
                    managerId: manager.id,
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
            // Assign positions
            weekPositions.forEach((entry, position) => {
                const managerArray = relativeWeekly.get(entry.managerId) || [];
                managerArray.push(position + 1);
                relativeWeekly.set(entry.managerId, managerArray);
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