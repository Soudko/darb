import { Building2, Coffee, MapPin, ShoppingBag, Trees, Utensils } from 'lucide-react';
import type { PlaceType } from '../../../../shared/types';

export const TYPE_ICON = {
  mall: ShoppingBag,
  restaurant: Utensils,
  cafe: Coffee,
  park: Trees,
  service: Building2,
  other: MapPin,
} as const satisfies Record<PlaceType, unknown>;
