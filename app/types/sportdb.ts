// types/sportdb.ts
export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  status: string; // "live", "finished", etc.
  start_time: string;
}

export interface LiveScoresResponse {
  matches: Match[];
}