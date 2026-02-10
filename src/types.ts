// ===== TYPE DEFINITIONS =====

export interface FPLManager {
    id: number;
    entry: number;
    entry_name: string;
    player_name: string;
    rank: number;
    last_rank: number;
    rank_sort: number;
    total: number;
    event_total: number;
    has_played?: boolean;
}

export interface FPLLeague {
    id: number;
    name: string;
    created?: string;
    closed?: boolean;
    max_entries?: number | null;
    league_type?: string;
    scoring?: string;
    admin_entry?: number;
    start_event?: number;
    code_privacy?: string;
    has_cup?: boolean;
    cup_league?: number | null;
    rank?: number | null;
}

export interface FPLLeagueStandings {
    standings: {
        results: FPLManager[];
        has_next?: boolean;
        page?: number;
    };
    league: FPLLeague;
    new_entries?: {
        has_next: boolean;
        page: number;
        results: any[];
    };
    last_updated_data?: string;
}

// ===== H2H LEAGUE TYPES =====

export interface H2HMatchEntry {
    id: number;
    entry: number;
    entry_name: string;
    player_name: string;
    points: number;
    win: number;
    draw: number;
    loss: number;
}

export interface H2HMatch {
    id: number;
    event: number;
    finished: boolean;
    started: boolean;
    entry_1_entry: number;
    entry_1_name: string;
    entry_1_player_name: string;
    entry_1_points: number;
    entry_1_win: number;
    entry_1_draw: number;
    entry_1_loss: number;
    entry_1_total: number;
    entry_2_entry: number;
    entry_2_name: string;
    entry_2_player_name: string;
    entry_2_points: number;
    entry_2_win: number;
    entry_2_draw: number;
    entry_2_loss: number;
    entry_2_total: number;
}

export interface H2HMatchesResponse {
    has_next: boolean;
    page: number;
    results: H2HMatch[];
}

export interface LeagueDataModel {
    matches: H2HMatch[];
    totalMatches: number;
    lastUpdated: Date;
    viewModels?: import('./viewModels.js').LeagueViewModels;
}
// ===== CHART TYPES =====

export interface Manager {
    id: string;
    name: string;
    team: string;
}

export interface ProcessedMatch {
    manager1: Manager;
    manager1Points: number;
    manager1ResultPoints: number;
    manager2: Manager;
    manager2Points: number;
    manager2ResultPoints: number;
    gameWeek: number;
    winnerId: string | null;
    draw: boolean;
    happened: boolean;
}

export interface ManagerChartModel {
    id: string;
    name: string;
    gwValues: number[];
    color: string;
}

export interface ChartData {
    absoluteManagers: ManagerChartModel[];
    relativeManagers: ManagerChartModel[];
}

export type ChartType = 'absolute' | 'relative';