import { useRef, useState } from 'react';
import { Camera, ImagePlus, Trash2 } from 'lucide-react';
import { PHOTO_KINDS } from '../../../../shared/types';
import type { PhotoKind } from '../../../../shared/types';
import { useT } from '../../strings';

export interface PickedPhoto { id: number; kind: PhotoKind; dataUrl: string }
export const MAX_PHOTOS = 6;
let nextId = 1;

// Shrink the photo in the browser first (long side 1280 px, JPEG): phone photos are far too big to upload as they are.
function shrink(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('bad image'));
    };
    img.src = url;
  });
}

export function PhotoPicker({ photos, onChange }: { photos: PickedPhoto[]; onChange: (p: PickedPhoto[]) => void }) {
  const t = useT();
  const cam = useRef<HTMLInputElement>(null);
  const up = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  async function add(files: FileList | null) {
    if (!files) return;
    setMsg('');
    const out = [...photos];
    for (const f of Array.from(files)) {
      if (out.length >= MAX_PHOTOS) { setMsg(t('add.photos.max')); break; }
      if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(f.type) && !f.type.startsWith('image/')) { setMsg(t('add.photos.bad')); continue; }
      try {
        out.push({ id: nextId++, kind: 'other', dataUrl: await shrink(f) });
      } catch {
        setMsg(t('add.photos.bad'));
      }
    }
    onChange(out);
  }

  return (
    <div className="cm-photos">
      <p className="small">{t('add.photos.hint')}</p>
      <div className="cm-row">
        <button type="button" className="btn btn-secondary" onClick={() => cam.current?.click()}>
          <Camera size={20} aria-hidden="true" /> {t('add.photos.camera')}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => up.current?.click()}>
          <ImagePlus size={20} aria-hidden="true" /> {t('add.photos.upload')}
        </button>
      </div>
      <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { void add(e.target.files); e.target.value = ''; }} />
      <input ref={up} type="file" accept="image/*" multiple hidden onChange={(e) => { void add(e.target.files); e.target.value = ''; }} />
      {msg && <p role="alert" className="cm-error">{msg}</p>}
      <ul className="cm-thumbs">
        {photos.map((p, i) => (
          <li key={p.id} className="glass cm-thumb">
            <img src={p.dataUrl} alt={`${t('add.sec.photos')} ${i + 1}: ${t('photo.' + p.kind)}`} />
            <label className="small" htmlFor={`pk-${p.id}`}>{t('add.photos.kind')}</label>
            <select id={`pk-${p.id}`} className="field" value={p.kind} onChange={(e) => onChange(photos.map((x) => (x.id === p.id ? { ...x, kind: e.target.value as PhotoKind } : x)))}>
              {PHOTO_KINDS.map((k) => <option key={k} value={k}>{t('photo.' + k)}</option>)}
            </select>
            <button type="button" className="btn btn-secondary" onClick={() => onChange(photos.filter((x) => x.id !== p.id))}>
              <Trash2 size={18} aria-hidden="true" /> {t('add.photos.remove')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
