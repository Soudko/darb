// Where the server listens. On this Mac: localhost only. On Replit (REPL_ID is set) or in
// production: 0.0.0.0, so the published link can reach it. HOST, when set, always wins.
export function listenHost(): string {
  const env = process.env;
  if (env.HOST) return env.HOST;
  return env.REPL_ID || env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
}
