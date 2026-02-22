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

// H2H Standings response (faster, single API call)
export interface H2HStandingEntry {
    id: number;
    division: number;
    entry: number;
    player_name: string;
    rank: number;
    last_rank: number;
    rank_sort: number;
    total: number; // League points (W=3, D=1, L=0)
    entry_name: string;
    matches_played: number;
    matches_won: number;
    matches_drawn: number;
    matches_lost: number;
    points_for: number; // Total FPL points
}

export interface H2HStandingsResponse {
    standings: {
        has_next: boolean;
        page: number;
        results: H2HStandingEntry[];
    };
    league: FPLLeague;
    new_entries?: {
        has_next: boolean;
        page: number;
        results: any[];
    };
    last_updated_data?: string | null;
}

export interface LeagueDataModel {
    matches?: H2HMatch[]; // Optional - lazy loaded
    standings?: H2HStandingEntry[]; // Optional - from standings endpoint
    totalMatches?: number;
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

// ===== MATCH DETAILS TYPES =====

export interface PickElement {
    element: number;
    position: number;
    multiplier: number;
    is_captain: boolean;
    is_vice_captain: boolean;
}

export interface AutomaticSub {
    entry: number;
    element_in: number;
    element_out: number;
    event: number;
}

export interface EntryHistory {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    rank_sort: number;
    overall_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
}

export interface ManagerPicks {
    active_chip: string | null;
    automatic_subs: AutomaticSub[];
    entry_history: EntryHistory;
    picks: PickElement[];
}

export interface PlayerStats {
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    goals_conceded: number;
    own_goals: number;
    penalties_saved: number;
    penalties_missed: number;
    yellow_cards: number;
    red_cards: number;
    saves: number;
    bonus: number;
    bps: number;
    influence: string;
    creativity: string;
    threat: string;
    ict_index: string;
    starts: number;
    expected_goals: string;
    expected_assists: string;
    expected_goal_involvements: string;
    expected_goals_conceded: string;
    total_points: number;
    in_dreamteam: boolean;
}

export interface LivePlayerElement {
    id: number;
    stats: PlayerStats;
    explain: any[];
}

export interface LiveGameweekData {
    elements: LivePlayerElement[];
}

export interface PlayerInfo {
    id: number;
    web_name: string;
    team: number;
    element_type: number;
    now_cost: number;
}

export interface MatchDetailsData {
    manager1Entry: number;
    manager1Name: string;
    manager1TeamName: string;
    manager1Picks: ManagerPicks;
    manager1Points: number;
    manager2Entry: number;
    manager2Name: string;
    manager2TeamName: string;
    manager2Picks: ManagerPicks;
    manager2Points: number;
    gameweek: number;
    liveData: LiveGameweekData;
    playerInfo: Map<number, PlayerInfo>;
}