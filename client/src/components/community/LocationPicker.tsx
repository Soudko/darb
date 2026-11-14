import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, Check, Pencil } from 'lucide-react';
import { useT } from '../../strings';

export interface Pos { lat: number; lng: number }
export const KUWAIT_BOUNDS = { latMin: 28.4, latMax: 30.2, lngMin: 46.4, lngMax: 48.7 };
export const insideKuwait = (p: Pos) =>
  p.lat >= KUWAIT_BOUNDS.latMin && p.lat <= KUWAIT_BOUNDS.latMax && p.lng >= KUWAIT_BOUNDS.lngMin && p.lng <= KUWAIT_BOUNDS.lngMax;

const DOT = L.divIcon({ className: 'cm-marker', html: '<span></span>', iconSize: [34, 34], iconAnchor: [17, 34] });

interface Props { pos: Pos | null; confirmed: boolean; onPos: (p: Pos) => void; onConfirm: (v: boolean) => void }

export function LocationPicker({ pos, confirmed, onPos, onConfirm }: Props) {
  const t = useT();
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const onPosRef = useRef(onPos);
  onPosRef.current = onPos;
  const lockRef = useRef(confirmed);
  lockRef.current = confirmed;
  const [msg, setMsg] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, { attributionControl: false }).setView([29.3759, 47.9774], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m);
    L.control.attribution({ prefix: false, position: 'bottomleft' }).addAttribution('© OpenStreetMap contributors').addTo(m);
    m.on('click', (e: L.LeafletMouseEvent) => { if (!lockRef.current) onPosRef.current({ lat: e.latlng.lat, lng: e.latlng.lng }); });
    map.current = m;
    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(el.current);
    return () => { ro.disconnect(); m.remove(); map.current = null; marker.current = null; };
  }, []);

  // Keep the marker and the typed numbers in step with the chosen position.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (!pos) { marker.current?.remove(); marker.current = null; return; }
    if (!marker.current) {
      marker.current = L.marker([pos.lat, pos.lng], { icon: DOT, draggable: true, keyboard: true, title: t('add.sec.location') }).addTo(m);
      marker.current.on('dragend', () => {
        const ll = marker.current!.getLatLng();
        onPosRef.current({ lat: ll.lat, lng: ll.lng });
      });
      m.setView([pos.lat, pos.lng], Math.max(m.getZoom(), 15));
    } else {
      marker.current.setLatLng([pos.lat, pos.lng]);
    }
    marker.current.dragging?.[confirmed ? 'disable' : 'enable']();
    setLat(pos.lat.toFixed(5));
    setLng(pos.lng.toFixed(5));
  }, [pos, confirmed]); // eslint-disable-line react-hooks/exhaustive-deps

  function useMyLocation() {
    if (!('geolocation' in navigator)) return setMsg(t('add.loc.gps_failed'));
    setMsg(t('add.loc.gps_busy'));
    navigator.geolocation.getCurrentPosition(
      (g) => { setMsg(''); onPos({ lat: g.coords.latitude, lng: g.coords.longitude }); },
      () => setMsg(t('add.loc.gps_failed')),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  }

  function typed(nextLat: string, nextLng: string) {
    setLat(nextLat);
    setLng(nextLng);
    const a = Number(nextLat), b = Number(nextLng);
    if (nextLat.trim() && nextLng.trim() && Number.isFinite(a) && Number.isFinite(b)) onPos({ lat: a, lng: b });
  }

  const outside = pos ? !insideKuwait(pos) : false;
  return (
    <div className="cm-loc">
      <p className="small">{t('add.loc.hint')}</p>
      <div className="cm-map" ref={el} role="application" aria-label={t('add.loc.map')} />
      <div className="cm-row">
        <button type="button" className="btn btn-secondary" disabled={confirmed} onClick={useMyLocation}>
          <LocateFixed size={20} aria-hidden="true" /> {t('add.loc.gps')}
        </button>
      </div>
      <div className="cm-row">
        <label className="cm-grow">
          <span className="small">{t('add.loc.lat')}</span>
          <input className="field" inputMode="decimal" dir="ltr" value={lat} disabled={confirmed} onChange={(e) => typed(e.target.value, lng)} />
        </label>
        <label className="cm-grow">
          <span className="small">{t('add.loc.lng')}</span>
          <input className="field" inputMode="decimal" dir="ltr" value={lng} disabled={confirmed} onChange={(e) => typed(lat, e.target.value)} />
        </label>
      </div>
      {msg && <p role="status" className="small">{msg}</p>}
      {!pos && <p className="small">{t('add.loc.none')}</p>}
      {outside && <p role="alert" className="cm-error">{t('add.loc.outside')}</p>}
      {confirmed ? (
        <div className="cm-row">
          <span className="cm-ok" role="status"><Check size={18} aria-hidden="true" /> {t('add.loc.confirmed')}</span>
          <button type="button" className="btn btn-secondary" onClick={() => onConfirm(false)}>
            <Pencil size={18} aria-hidden="true" /> {t('add.loc.change')}
          </button>
        </div>
      ) : (
        <button type="button" className="btn btn-primary" disabled={!pos || outside} onClick={() => onConfirm(true)}>
          <Check size={20} aria-hidden="true" /> {t('add.loc.confirm')}
        </button>
      )}
    </div>
  );
}
