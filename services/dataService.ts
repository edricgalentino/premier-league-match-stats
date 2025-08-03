import Papa from "papaparse";
import { MatchData } from "../utils/statistics";

export const loadMatchData = async (): Promise<{
  totalMatches: number;
  totalGoals: number;
  totalHomeGoals: number;
  totalAwayGoals: number;
  totalDraws: number;
  totalHomeWins: number;
  totalAwayWins: number;
  fileInfo: {
    FileName: string;
    FileSize: number;
    FileType: string;
    FileLastModified: Date;
    FileCreated: Date;
    FileUpdated: Date;
  };
  processedData: MatchData[];
}> => {
  try {
    const response = await fetch("/csv/premier-league-matches-2020-2023.csv");
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        delimiter: ";",
        dynamicTyping: true,
        complete: (results) => {
          const data = results.data as MatchData[];
          const fileInfo = {
            FileName: "premier-league-matches-2020-2023.csv",
            FileSize: 1000,
            FileType: "csv",
            FileLastModified: new Date(),
            FileCreated: new Date(),
            FileUpdated: new Date(),
          };
          const totalMatches = data.length;
          let totalGoals = 0;
          let totalHomeGoals = 0;
          let totalAwayGoals = 0;
          let totalDraws = 0;
          let totalHomeWins = 0;
          let totalAwayWins = 0;

          const processedData = data.map((match) => {
            totalGoals += match.HomeGoals + match.AwayGoals;
            totalHomeGoals += match.HomeGoals;
            totalAwayGoals += match.AwayGoals;
            totalDraws += match.FTR === "D" ? 1 : 0;
            totalHomeWins += match.FTR === "H" ? 1 : 0;
            totalAwayWins += match.FTR === "A" ? 1 : 0;
            return {
              ...match,
              TotalGoals: match.HomeGoals + match.AwayGoals,
            };
          });
          resolve({
            ...fileInfo,
            totalMatches,
            totalGoals,
            totalHomeGoals,
            totalAwayGoals,
            totalDraws,
            totalHomeWins,
            totalAwayWins,
            fileInfo,
            processedData,
          });
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("Error loading match data:", error);
    throw error;
  }
};
