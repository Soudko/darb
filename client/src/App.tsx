// Which screen shows for which address. Owned by the lead builder.
import { useRoute } from './lib/nav';
import { getPrefs } from './state/prefs';
import { Splash } from './screens/Splash';
import { Onboarding } from './screens/Onboarding';
import { Needs } from './screens/Needs';
import { Home } from './screens/Home';
import { Settings } from './screens/Settings';
import { Coming } from './screens/Coming';
import { About } from './screens/About';
import { MapScreen } from './screens/MapScreen';
import { PlaceDetails } from './screens/PlaceDetails';
import { Assistant } from './screens/Assistant';

export function App() {
  const route = useRoute();
  switch (route.screen) {
    case 'splash': return <Splash />;
    case 'onboarding': return <Onboarding />;
    case 'needs': return <Needs />;
    case 'home': return <Home />;
    case 'settings': return <Settings />;
    case 'about': return <About />;
    case 'map': return <MapScreen focus={route.query.get('focus') ?? undefined} />;
    case 'place': return <PlaceDetails id={route.param ?? ''} />;
    case 'assistant': return <Assistant initialQuestion={route.query.get('q') ?? undefined} />;
    case 'alerts': return <Coming name="alerts" />;
    case 'coming': return <Coming name={route.param ?? ''} />;
    default: return getPrefs().onboarded ? <Home /> : <Splash />;
  }
}
