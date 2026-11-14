// Which screen shows for which address. Owned by the lead builder.
import { useRoute } from './lib/nav';
import { getPrefs } from './state/prefs';
import { Splash } from './screens/Splash';
import { Onboarding } from './screens/Onboarding';
import { Needs } from './screens/Needs';
import { Home } from './screens/Home';
import { Settings } from './screens/Settings';
import { Coming } from './screens/Coming';
import { GovServices } from './screens/GovServices';
import { Directory, isDirectoryPage } from './screens/Directory';
import { About } from './screens/About';
import { MapScreen } from './screens/MapScreen';
import { PlaceDetails } from './screens/PlaceDetails';
import { Assistant } from './screens/Assistant';
import { AddPlace } from './screens/AddPlace';

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
    case 'add': return <AddPlace />;
    case 'assistant': return <Assistant initialQuestion={route.query.get('q') ?? undefined} />;
    case 'gov': return <GovServices id={route.param} />;
    case 'alerts': return <Coming name="alerts" />;
    case 'coming': return isDirectoryPage(route.param) ? <Directory page={route.param} /> : <Coming name={route.param ?? ''} />;
    default: return getPrefs().onboarded ? <Home /> : <Splash />;
  }
}
