// Shared contract between the server and the screens. Change only with the lead builder's OK.

export type YesNoUnknown = 'yes' | 'no' | 'unknown';
export type FacilityKey = 'entrances' | 'parking' | 'lifts' | 'toilets' | 'seating';
export const FACILITY_KEYS: FacilityKey[] = ['entrances', 'parking', 'lifts', 'toilets', 'seating'];

export type PlaceType = 'mall' | 'restaurant' | 'cafe' | 'park' | 'service' | 'other';
export type PointKind = 'entrance' | 'parking' | 'seating' | 'rest_area' | 'quiet_area';
export type AccessStatus = 'full' | 'partial' | 'unknown';

export type Need = 'mobility' | 'visual' | 'hearing' | 'speech' | 'cognitive' | 'elderly' | 'temporary';
export const NEEDS: Need[] = ['mobility', 'visual', 'hearing', 'speech', 'cognitive', 'elderly', 'temporary'];

export interface Facility {
  available: YesNoUnknown;
  count?: number;
  note_ar?: string;
  note_en?: string;
  source: string; // for example "Darb team visit" or "venue's website"
  date: string; // YYYY-MM-DD
}

export interface Point {
  id: string;
  kind: PointKind;
  name_ar: string;
  name_en: string;
  lat: number;
  lng: number;
  accessible: boolean;
  quiet: boolean;
}

export interface Place {
  id: string;
  name_ar: string;
  name_en: string;
  type: PlaceType;
  lat: number;
  lng: number;
  photo: string; // a file name in client/public/places/, or ""
  is_sample?: boolean;
  facilities: Partial<Record<FacilityKey, Facility>>;
  points: Point[];
}

// What GET /api/places returns for each place: the stored place plus its worked-out status.
export interface PlaceView extends Place {
  status: AccessStatus;
}

export type Lang = 'ar' | 'en';

// POST /api/assistant
// One earlier message of this conversation, kept on the phone and sent back for follow-up questions.
export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string; // user: up to 500 characters; assistant: up to 2500
}

export interface AssistantRequest {
  question: string; // 1 to 500 characters
  needs: Need[];
  lang: Lang; // the screen language; the reply follows the language the user writes in
  device_id: string;
  history?: ChatTurn[]; // the last messages, oldest first, at most 12
  simple?: boolean; // simplified interface or the largest text: short, step-by-step answers
}

export interface AssistantPlacePick {
  place_id: string;
  why: string; // in the reply's language
  facts: string[]; // facility keys or point ids that back the reason, all checked by the server
}

export type AssistantResponse =
  | { kind: 'medical' }
  | { kind: 'no_data' }
  | { kind: 'answer'; reply: string; reply_lang: Lang; places: AssistantPlacePick[]; model: string };

// Every error from the server has this shape.
export type ErrorCode =
  | 'bad_request'
  | 'too_long'
  | 'rate_limited'
  | 'ai_not_set_up'
  | 'ai_no_answer'
  | 'ai_auth_failed'
  | 'ai_quota'
  | 'ai_model'
  | 'not_found'
  | 'server_error';

export interface ApiError {
  error: { code: ErrorCode; message: string };
}
