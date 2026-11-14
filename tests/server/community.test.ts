import { describe, expect, it } from 'vitest';
import { createApp } from '../../server/app';
import { call } from './helper';

describe('community body limits', () => {
  it('a report larger than 10 kB is refused before any database work', async () => {
    const res = await call(createApp(), 'POST', '/api/community/places/c-1/report', { message: 'x'.repeat(20_000) });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('too_long');
  });
  it('the sixth submission in an hour is refused before the upload is read', async () => {
    const app = createApp();
    let last = 0;
    for (let i = 0; i < 6; i++) last = (await call(app, 'POST', '/api/community/places', { name: '' })).status;
    expect(last).toBe(429);
  });
});
