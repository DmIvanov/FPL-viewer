// ===== VIEW MODELS BUILDER =====
// Processes raw H2H match data into separate view models for each League subsection
import { ChartProcessor } from './chartProcessor.js';
/**
 * Builds view models from H2H standings data (fast path)
 * Only builds standings, matches and charts require separate data
 */
export function buildStandingsOnlyViewModel(standings) {
    return {
        standings: buildStandingsFromAPIStandings(standings)
    };
}
/**
 * Builds all view models from raw match data (full data path)
 * This is the single source of truth for processing match data
 */
export function buildLeagueViewModels(matches) {
    return {
        standings: buildStandingsFromMatches(matches),
        matches: buildMatchesViewModel(matches),
        charts: buildChartsViewModel(matches)
    };
}
/**
 * Builds the Standings view model from H2H API standings endpoint (fast path)
 * Directly converts API standings data to view model format
 */
function buildStandingsFromAPIStandings(standings) {
    const standingsViewModel = standings.map(entry => ({
        playerName: entry.player_name,
        teamName: entry.entry_name,
        leaguePoints: entry.total, // Total league points (W=3, D=1)
        totalPoints: entry.points_for, // Total FPL points
        wins: entry.matches_won,
        draws: entry.matches_drawn,
        losses: entry.matches_lost
    }));
    console.log('✅ Built standings from API for', standingsViewModel.length, 'managers');
    return standingsViewModel;
}
/**
 * Builds the Standings view model from H2H matches (computed from match data)
 * Calculates league points (W=3, D=1, L=0) and aggregates match statistics
 */
function buildStandingsFromMatches(matches) {
    const managersMap = new Map();
    // Process each match
    matches.forEach(match => {
        // Initialize entry 1 if not exists
        if (!managersMap.has(match.entry_1_name)) {
            managersMap.set(match.entry_1_name, {
                playerName: match.entry_1_player_name,
                teamName: match.entry_1_name,
                leaguePoints: 0,
                totalPoints: 0,
                wins: 0,
                draws: 0,
                losses: 0
            });
        }
        // Initialize entry 2 if not exists
        if (!managersMap.has(match.entry_2_name)) {
            managersMap.set(match.entry_2_name, {
                playerName: match.entry_2_player_name,
                teamName: match.entry_2_name,
                leaguePoints: 0,
                totalPoints: 0,
                wins: 0,
                draws: 0,
                losses: 0
            });
        }
        const manager1 = managersMap.get(match.entry_1_name);
        const manager2 = managersMap.get(match.entry_2_name);
        // Add total FPL points
        manager1.totalPoints += match.entry_1_points;
        manager2.totalPoints += match.entry_2_points;
        // Determine match result and update league stats
        if (match.entry_1_points > match.entry_2_points) {
            // Entry 1 wins
            manager1.wins++;
            manager1.leaguePoints += 3;
            manager2.losses++;
        }
        else if (match.entry_2_points > match.entry_1_points) {
            // Entry 2 wins
            manager2.wins++;
            manager2.leaguePoints += 3;
            manager1.losses++;
        }
        else if (match.entry_1_points > 0 && match.entry_2_points > 0) {
            // Draw (only if both have played - non-zero points)
            manager1.draws++;
            manager1.leaguePoints += 1;
            manager2.draws++;
            manager2.leaguePoints += 1;
        }
    });
    // Convert to array and sort by league points (descending), then by total points
    const standings = Array.from(managersMap.values()).sort((a, b) => {
        if (b.leaguePoints !== a.leaguePoints) {
            return b.leaguePoints - a.leaguePoints;
        }
        return b.totalPoints - a.totalPoints;
    });
    console.log('✅ Built standings for', standings.length, 'managers');
    return standings;
}
/**
 * Builds the Matches view model
 * Transforms raw API matches into display-ready format
 */
function buildMatchesViewModel(matches) {
    const matchViewModels = matches.map(match => {
        // Determine result
        // Match is finished if:
        // 1. finished field is explicitly true, OR
        // 2. Both teams have non-zero scores (0-0 draws shouldn't happen in FPL)
        const hasScores = typeof match.entry_1_points === 'number' && typeof match.entry_2_points === 'number';
        const isReallyFinished = match.finished === true ||
            (hasScores && (match.entry_1_points > 0 || match.entry_2_points > 0));
        let result;
        if (!isReallyFinished) {
            result = 'pending';
        }
        else if (match.entry_1_points > match.entry_2_points) {
            result = 'win1';
        }
        else if (match.entry_2_points > match.entry_1_points) {
            result = 'win2';
        }
        else {
            result = 'draw';
        }
        return {
            gameWeek: match.event,
            manager1Entry: match.entry_1_entry,
            manager1Name: match.entry_1_player_name,
            manager1TeamName: match.entry_1_name,
            manager1Points: match.entry_1_points,
            manager2Entry: match.entry_2_entry,
            manager2Name: match.entry_2_player_name,
            manager2TeamName: match.entry_2_name,
            manager2Points: match.entry_2_points,
            result
        };
    });
    // Sort by gameweek (descending - most recent first)
    matchViewModels.sort((a, b) => b.gameWeek - a.gameWeek);
    console.log('✅ Built', matchViewModels.length, 'match view models');
    return matchViewModels;
}
/**
 * Builds the Charts view model
 * Processes matches through ChartProcessor to generate chart data
 */
function buildChartsViewModel(matches) {
    const processor = new ChartProcessor(matches);
    const chartData = processor.process();
    return {
        absoluteManagers: chartData.absoluteManagers.map(m => ({
            id: m.id,
            name: m.name,
            gwValues: [...m.gwValues], // Create a copy
            color: m.color
        })),
        relativeManagers: chartData.relativeManagers.map(m => ({
            id: m.id,
            name: m.name,
            gwValues: [...m.gwValues], // Create a copy
            color: m.color
        }))
    };
}
//# sourceMappingURL=viewModels.js.map