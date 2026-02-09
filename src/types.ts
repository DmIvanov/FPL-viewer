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
