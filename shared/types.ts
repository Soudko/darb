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
  community?: CommunityInfo; // present only for places submitted by users
}

// Community submissions: always shown as unverified until a moderator reviews them.
export type Verification = 'pending' | 'unverified' | 'verified' | 'rejected';
export type Answer = 'yes' | 'no' | 'unknown';
export const QUESTION_KEYS = [
  'wheelchair_entrance', 'ramp', 'elevator', 'accessible_parking', 'accessible_toilets', 'seating',
  'wide_doors', 'step_free', 'signage', 'visual_aids', 'hearing_aids', 'quiet_space',
] as const;
export type QuestionKey = (typeof QUESTION_KEYS)[number];
export const CATEGORY_KEYS = ['mall', 'restaurant', 'hospital', 'government', 'education', 'park', 'entertainment', 'other'] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];
export const PHOTO_KINDS = ['entrance', 'ramp', 'elevator', 'parking', 'restroom', 'seating', 'other'] as const;
export type PhotoKind = (typeof PHOTO_KINDS)[number];

export interface CommunityInfo {
  verification: Verification;
  category: CategoryKey;
  governorate: string;
  area: string;
  address: string;
  description: string;
  answers: Partial<Record<QuestionKey, Answer>>;
  answers_note: string;
  photos: { id: string; kind: PhotoKind; url: string }[];
  created_at: string;
}

// POST /api/community/places
export interface SubmitPlaceRequest {
  name: string;
  category: CategoryKey;
  governorate?: string;
  area?: string;
  address?: string;
  description?: string;
  lat: number;
  lng: number;
  answers: Partial<Record<QuestionKey, Answer>>;
  answers_note?: string;
  photos?: { kind: PhotoKind; data_url: string }[]; // data:image/jpeg|png|webp;base64,...
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

// A button the screens may offer under a reply. The server only sends actions it has checked; nothing runs on its own.
export type AssistantAction =
  | { type: 'open_add_place' }
  | { type: 'open_map'; place_id?: string }
  | { type: 'open_place'; place_id: string };

export type AssistantResponse =
  | { kind: 'medical' }
  | { kind: 'no_data' }
  | { kind: 'answer'; reply: string; reply_lang: Lang; places: AssistantPlacePick[]; model: string; action?: AssistantAction };

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
  | 'forbidden'
  | 'unavailable'
  | 'not_found'
  | 'server_error';

export interface ApiError {
  error: { code: ErrorCode; message: string };
}
