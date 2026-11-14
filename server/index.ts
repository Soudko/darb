import { createApp } from './app';
import { getPlaces } from './places';
import { listenHost } from './host';

const host = listenHost();
const port = Number(process.env.PORT) || 3101;

getPlaces(); // load the places once at start
createApp().listen(port, host, () => {
  console.log(`Darb server listening on http://${host}:${port}`);
});
