// The frame of every main screen: glass header, centred content, honesty footer, bottom bar.
import type { ReactNode } from 'react';
import { Header } from './shell/Header';
import { BottomBar } from './shell/BottomBar';
import { useT } from '../strings';
import '../styles/shell.css';

export interface ScreenProps { title?: string; back?: boolean; bottomBar?: boolean; footer?: boolean; children: ReactNode; }

export function Screen({ title, back, bottomBar = true, footer = true, children }: ScreenProps) {
  const t = useT();
  return (
    <div className="sh-app">
      <Header title={title} showBack={back} />
      <main className={'sh-main' + (bottomBar ? ' has-bar' : '')}>
        {children}
        {footer && <p className="small sh-center sh-footer">{t('honest.footer')}</p>}
      </main>
      {bottomBar && <BottomBar />}
    </div>
  );
}
