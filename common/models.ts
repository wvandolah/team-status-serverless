export interface ResponseError {
  error?: string;
}

export interface StatusQueryOutput extends ResponseError {
  Items?: Status[];
  Count?: number;
}

export interface StatusUpdateOutput extends ResponseError {
  Attributes?: Status;
}

export interface TeamPlayerUpdateOutput extends ResponseError {
  Attributes?: TeamPlayer;
}

export interface TeamPlayerQueryOutput extends ResponseError {
  Items?: TeamPlayer[];
  Count?: number;
}

export interface StatusUpdateInput {
  updateField: string;
  updateValue: string | Player;
  playerId: string;
  teamId: string;
  gameId: string;
}

export interface Status {
  dateTime?: string;
  gameId?: string;
  opponentName?: string;
  players?: { [key: string]: Player } | Player[];
  teamId?: string;
  teamName?: string;
  attendance?: Attendance;
}

export interface TeamPlayer {
  teamId?: string;
  teamName?: string;
  userId?: string;
  players?: Player[];
}

export interface Player {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  sendEmail: boolean;
  sendText: boolean;
  status?: PlayerStatus;
  smsDelivered: boolean;
  type: PlayerTypes;
}
export enum PlayerTypes {
  FULL = 'full',
  SUB = 'sub',
}

export enum PlayerStatus {
  IN = 'In',
  OUT = 'Out',
}

export enum sendStatusTypes {
  NEW_GAME,
  DELETE_GAME,
}

export interface Attendance {
  in: number;
  out: number;
  noResponse: number;
}

export interface ParsedEvent<TBody, TParams> {
  data: TBody;
  queryParams: TParams;
}

export interface CheckedNumbers {
  invalidNumbers: string[];
  validNumbers: string[];
}

export type APIEvent<TParam> = {
  body: string;
  queryStringParameters: TParam;
};

export interface SearchStatuses {
  teamId: string;
  gameId: string;
  historic: string;
}

export interface SearchStatus extends SearchStatuses {
  playerId: string;
}

export interface UpdatePlayerStatusBody extends SearchStatus {
  status: PlayerStatus;
}

export interface StatusUpdateBody extends SearchStatuses {
  players: Player[];
  dateTime?: string;
  teamName?: string;
  opponentName?: string;
  addPlayer?: boolean;
}
