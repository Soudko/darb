import { Accessibility, PersonStanding } from 'lucide-react';
import { go } from '../lib/nav';
import { useT } from '../strings';
import { Skyline } from '../components/shell/Skyline';
import '../styles/shell.css';

export function Onboarding(_props: {}) {
  const t = useT();
  return (
    <div className="sh-stage">
      <Skyline />
      <div className="sh-stage-body">
        <section className="glass sh-center" style={{ marginTop: 24, width: '100%' }}>
          <div className="sh-art" aria-hidden="true">
            <div className="glass sh-circle"><Accessibility /></div>
            <div className="glass sh-circle"><PersonStanding /></div>
          </div>
          <h1>{t('onb.title')}</h1>
          <p>{t('onb.body')}</p>
          <div className="sh-dots" aria-hidden="true"><i className="on" /><i /><i /></div>
        </section>
      </div>
      <div className="sh-actions">
        <div className="sh-row">
          <button type="button" className="btn btn-secondary" onClick={() => go('needs')}>{t('onb.skip')}</button>
          <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => go('needs')}>{t('onb.next')}</button>
        </div>
      </div>
    </div>
  );
}
