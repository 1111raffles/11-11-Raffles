// Shared application types

export type { PackageType } from "@/lib/packages";

export interface RafflePublic {
  id:           string;
  title:        string;
  description:  string;
  imageUrl:     string | null;
  totalTickets: number;
  soldTickets:  number;
  ticketPrice:  number;
  drawTime:     string; // ISO string
  status:       "DRAFT" | "ACTIVE" | "DRAWING" | "COMPLETED" | "CANCELLED";
  winnerId:     string | null;
  winnerTicketNum: number | null;
  createdAt:    string;
}

export interface TicketPublic {
  id:           string;
  ticketNumber: number;
  raffleId:     string;
  raffleTitle?: string;
  isWinner:     boolean;
  createdAt:    string;
}

export interface AnnouncementPublic {
  id:        string;
  type:      "WINNER" | "DRAW_STARTING" | "NEW_RAFFLE" | "MILESTONE" | "GENERAL";
  message:   string;
  raffleId?: string | null;
  createdAt: string;
}

export interface UserStats {
  totalTickets:    number;
  totalWins:       number;
  totalSpent:      number;  // in pence
  activeRaffles:   number;
}

export interface LiveDrawState {
  status:          "idle" | "starting" | "drawing" | "complete";
  countdown:       number;
  winnerName?:     string;
  winnerTicket?:   number;
  raffleName?:     string;
}
