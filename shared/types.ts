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
export interface AssistantRequest {
  question: string; // 1 to 500 characters
  needs: Need[];
  lang: Lang;
  device_id: string;
}

export interface AssistantPlacePick {
  place_id: string;
  why_ar: string;
  why_en: string;
  facts: string[]; // facility keys or point ids that back the reason, all checked by the server
}

export type AssistantResponse =
  | { kind: 'medical' }
  | { kind: 'no_data' }
  | { kind: 'answer'; reply_ar: string; reply_en: string; places: AssistantPlacePick[]; model: string };

// Every error from the server has this shape.
export type ErrorCode =
  | 'bad_request'
  | 'too_long'
  | 'rate_limited'
  | 'ai_not_set_up'
  | 'ai_no_answer'
  | 'not_found'
  | 'server_error';

export interface ApiError {
  error: { code: ErrorCode; message: string };
}
