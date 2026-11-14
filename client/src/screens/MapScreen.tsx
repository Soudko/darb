// The map «الخريطة»: Leaflet used directly (no wrapper library), filters, list switch, near me.
import { useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { List, Map as MapIcon, LocateFixed, SlidersHorizontal, X, Check } from 'lucide-react';
import type { PlaceView } from '../../../shared/types';
import { Screen } from '../components/Screen';
import { PlaceCard } from '../components/place/PlaceCard';
import { STATUS_ICON } from '../components/place/StatusBadge';
import { TYPE_ICON } from '../components/place/typeIcon';
import { usePlaces } from '../components/place/usePlaces';
import { distanceM } from '../lib/geo';
import {
  ADVANCED_KEYS, advancedCount, applyFilters, noAdvanced,
  type Advanced, type Quick,
} from '../lib/placeFilters';
import { usePrefs } from '../state/prefs';
import { useT } from '../strings';
import '../styles/places.css';

const KUWAIT: L.LatLngTuple = [29.3759, 47.9774];
const EMPTY: PlaceView[] = [];
const QUICK: Quick[] = ['all', 'accessible', 'parking', 'food'];

function pinHtml(place: PlaceView): string {
  const Type = TYPE_ICON[place.type] ?? TYPE_ICON.other;
  const Mark = STATUS_ICON[place.status];
  return (
    `<div class="pin pin-${place.status}">` +
    `<span class="pin-type">${renderToStaticMarkup(<Type size={20} strokeWidth={2} />)}</span>` +
    `<span class="pin-mark">${renderToStaticMarkup(<Mark size={12} strokeWidth={3} />)}</span>` +
    `</div>`
  );
}

export function MapScreen({ focus }: { focus?: string }) {
  const t = useT();
  const { lang, theme, highContrast } = usePrefs();
  const [state, retry] = usePlaces();
  const [quick, setQuick] = useState<Quick>('all');
  const [adv, setAdv] = useState<Advanced>(noAdvanced);
  const [sheet, setSheet] = useState(false);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The phone's position lives only in this component's memory: never sent, never stored.
  const [here, setHere] = useState<L.LatLngTuple | null>(null);
  const [nearMsg, setNearMsg] = useState<string>('');

  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const pins = useRef<L.LayerGroup | null>(null);
  const youMarker = useRef<L.CircleMarker | null>(null);

  const all = state.status === 'ready' ? state.places : EMPTY;
  const filtered = useMemo(() => applyFilters(all, quick, adv), [all, quick, adv]);
  const distances = useMemo(() => {
    const out = new Map<string, number>();
    if (here) all.forEach((p) => out.set(p.id, distanceM({ lat: here[0], lng: here[1] }, p)));
    return out;
  }, [all, here]);
  const sorted = useMemo(
    () => (here ? [...filtered].sort((a, b) => (distances.get(a.id) ?? 0) - (distances.get(b.id) ?? 0)) : filtered),
    [filtered, here, distances],
  );
  const selected = filtered.find((p) => p.id === selectedId) ?? null;
  const sheetCount = applyFilters(all, quick, adv).length;

  // Create the map once; clean up on unmount.
  useEffect(() => {
    if (!mapEl.current) return;
    const m = L.map(mapEl.current, { zoomControl: true, attributionControl: false }).setView(KUWAIT, 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m);
    L.control.attribution({ prefix: false, position: 'bottomleft' }).addAttribution('© OpenStreetMap contributors').addTo(m);
    m.zoomControl.setPosition('topright');
    pins.current = L.layerGroup().addTo(m);
    m.on('click', () => setSelectedId(null));
    map.current = m;
    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(mapEl.current);
    requestAnimationFrame(() => m.invalidateSize());
    return () => {
      ro.disconnect();
      m.remove();
      map.current = null;
      pins.current = null;
      youMarker.current = null;
    };
  }, []);

  // Redraw pins when the filtered places, selection or language change.
  useEffect(() => {
    const layer = pins.current;
    if (!layer) return;
    layer.clearLayers();
    filtered.forEach((p) => {
      const name = lang === 'ar' ? p.name_ar : p.name_en;
      const marker = L.marker([p.lat, p.lng], {
        keyboard: true,
        title: name,
        icon: L.divIcon({
          className: `darb-pin${p.id === selectedId ? ' is-selected' : ''}`,
          html: pinHtml(p),
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        }),
      });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedId(p.id);
        map.current?.panTo([p.lat, p.lng]);
      });
      marker.addTo(layer);
      const el = marker.getElement();
      if (el) {
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', `${name}, ${t(`status.${p.status}`)}`);
      }
    });
  }, [filtered, selectedId, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // Open the place named in the address.
  useEffect(() => {
    if (!focus || state.status !== 'ready') return;
    const p = state.places.find((x) => x.id === focus);
    if (p) {
      setQuick('all');
      setAdv(noAdvanced);
      setView('map');
      setSelectedId(p.id);
      map.current?.setView([p.lat, p.lng], 16);
    }
  }, [focus, state]);

  // Show the phone's position (on the phone only).
  useEffect(() => {
    const m = map.current;
    if (!m || !here) return;
    youMarker.current?.remove();
    youMarker.current = L.circleMarker(here, { radius: 8, color: '#ffffff', weight: 3, fillColor: '#00a8ab', fillOpacity: 1 }).addTo(m);
    youMarker.current.bindTooltip(t('map.you'));
    m.setView(here, 14);
  }, [here]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (view === 'map') setTimeout(() => map.current?.invalidateSize(), 50);
  }, [view]);

  function nearMe() {
    if (!('geolocation' in navigator)) return setNearMsg(t('map.near.failed'));
    setNearMsg(t('map.near.busy'));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHere([pos.coords.latitude, pos.coords.longitude]);
        setNearMsg(t('map.near.ok'));
        setView('map');
      },
      () => setNearMsg(t('map.near.failed')),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  const dark = theme === 'dark' && !highContrast;
  const active = advancedCount(adv);
  const emptyKey = all.length === 0 ? 'map.empty.none' : 'map.empty.filtered';

  return (
    <Screen title={t('map.title')} footer={false}>
      <div className="places-map">
        <div className="map-toolbar">
          <div className="map-chips" role="group" aria-label={t('map.title')}>
            {QUICK.map((q) => (
              <button key={q} type="button" className="chip" aria-pressed={quick === q} onClick={() => setQuick(q)}>
                {quick === q && <Check size={14} aria-hidden="true" />} {t(`map.chip.${q}`)}
              </button>
            ))}
          </div>
          <div className="map-actions">
            <button type="button" className="chip map-action" onClick={() => setSheet(true)} aria-pressed={active > 0}>
              <SlidersHorizontal size={16} aria-hidden="true" /> {t('map.filter')}
              {active > 0 && <span className="map-badge">{active}</span>}
            </button>
            <button type="button" className="chip map-action" onClick={nearMe}>
              <LocateFixed size={16} aria-hidden="true" /> {t('map.near')}
            </button>
            <div className="map-seg" role="group" aria-label={t('map.view.label')}>
              <button type="button" className="chip" aria-pressed={view === 'map'} onClick={() => setView('map')}>
                <MapIcon size={16} aria-hidden="true" /> {t('map.view.map')}
              </button>
              <button type="button" className="chip" aria-pressed={view === 'list'} onClick={() => setView('list')}>
                <List size={16} aria-hidden="true" /> {t('map.view.list')}
              </button>
            </div>
          </div>
          {nearMsg && <p className="small map-note" role="status">{nearMsg}</p>}
        </div>

        <div className={`map-wrap${dark ? ' map-dark' : ''}`} hidden={view !== 'map'}>
          <div ref={mapEl} className="map-canvas" role="region" aria-label={t('map.area')} />
          {state.status === 'loading' && <p className="glass map-status" role="status">{t('map.loading')}</p>}
          {state.status === 'error' && (
            <div className="glass map-status" role="alert">
              <p>{t('error.generic')}</p>
              <button type="button" className="btn btn-primary" onClick={retry}>{t('ai.try_again')}</button>
            </div>
          )}
          {state.status === 'ready' && filtered.length === 0 && (
            <p className="glass map-status" role="status">{t(emptyKey)}</p>
          )}
          {selected && (
            <div className="glass-strong map-card">
              <button type="button" className="icon-btn map-card-close" aria-label={t('map.close')} onClick={() => setSelectedId(null)}>
                <X size={20} aria-hidden="true" />
              </button>
              <PlaceCard place={selected} distanceM={distances.get(selected.id)} />
            </div>
          )}
        </div>

        {view === 'list' && (
          <div className="place-list">
            {state.status === 'loading' && <p className="glass" role="status">{t('map.loading')}</p>}
            {state.status === 'error' && (
              <div className="glass" role="alert">
                <p>{t('error.generic')}</p>
                <button type="button" className="btn btn-primary" onClick={retry}>{t('ai.try_again')}</button>
              </div>
            )}
            {state.status === 'ready' && sorted.length === 0 && <p className="glass" role="status">{t(emptyKey)}</p>}
            {sorted.map((p) => (
              <PlaceCard key={p.id} place={p} distanceM={distances.get(p.id)} />
            ))}
          </div>
        )}
      </div>

      {sheet && (
        <FilterSheet
          adv={adv}
          count={sheetCount}
          onChange={setAdv}
          onClose={() => setSheet(false)}
          t={t}
        />
      )}
    </Screen>
  );
}

function FilterSheet({ adv, count, onChange, onClose, t }: {
  adv: Advanced; count: number; onChange: (a: Advanced) => void; onClose: () => void; t: (k: string) => string;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="glass-strong sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" aria-hidden="true" />
        <div className="sheet-head">
          <h2 id="sheet-title" ref={titleRef} tabIndex={-1}>{t('map.filter')}</h2>
          <button type="button" className="icon-btn" aria-label={t('map.close')} onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="sheet-rows">
          {ADVANCED_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              role="checkbox"
              aria-checked={adv[k]}
              className={`glass sheet-row${adv[k] ? ' selected' : ''}`}
              onClick={() => onChange({ ...adv, [k]: !adv[k] })}
            >
              <span className="sheet-box" aria-hidden="true">{adv[k] && <Check size={16} strokeWidth={3} />}</span>
              {t(`filter.${k}`)}
            </button>
          ))}
        </div>
        <div className="sheet-actions">
          <button type="button" className="btn btn-primary btn-block" onClick={onClose}>
            {t('filter.show')} ({count})
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => onChange(noAdvanced)}>
            {t('filter.clear')}
          </button>
        </div>
      </div>
    </div>
  );
}
