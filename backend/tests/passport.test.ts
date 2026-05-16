// passport.test.ts
// Tests for passport.ts — Google OAuth strategy, serializeUser, deserializeUser

jest.mock('../src/config/db', () => ({
   __esModule: true, 
  default: { query: jest.fn() },
}));

jest.mock('passport-google-oauth20', () => {
  const MockStrategy = jest.fn().mockImplementation((_opts: any, verify: Function) => {
    return { name: 'google', _verify: verify };
    
  });
  return { Strategy: MockStrategy };
});

jest.mock('passport', () => {
  const callbacks: Record<string, Function> = {};
  const mock = {
    use: jest.fn(),
    serializeUser: jest.fn((fn: Function) => { callbacks['serialize'] = fn; }),
    deserializeUser: jest.fn((fn: Function) => { callbacks['deserialize'] = fn; }),
    _callbacks: callbacks,
  };
  return {
    __esModule: true,
    default: mock,
    ...mock,  
  };
});

import passport from 'passport';
import pool from '../src/config/db';
import '../src/config/passport'; // run the file so passport.use / serialize / deserialize are registered

const mockQuery = pool.query as jest.Mock;
const mockPassport = passport as any;

// Helper: grab the Google verify callback that was passed to new GoogleStrategy(...)
const getVerifyCallback = () => {
  const { Strategy } = require('passport-google-oauth20');
  if (!Strategy.mock.calls[0]) {
    throw new Error('GoogleStrategy was never instantiated — check mock hoisting');
  }
  return Strategy.mock.calls[0][1] as Function;
};

const makeProfile = (overrides: Partial<{ id: string; displayName: string; emails: { value: string }[] }> = {}) => ({
  id: 'google-id-123',
  displayName: 'Test User',
  emails: [{ value: 'test@example.com' }],
  ...overrides,
});

beforeEach(() => {
  mockQuery.mockReset();
});

// ─────────────────────────────────────────────
// Google Strategy — verify callback
// ─────────────────────────────────────────────
describe('Google OAuth Strategy — verify callback', () => {
  it('returns existing vendor when google_id is already in the database', async () => {
    const existingVendor = { id: 1, name: 'Test User', email: 'test@example.com', google_id: 'google-id-123' };
    mockQuery.mockResolvedValueOnce({ rows: [existingVendor] }); // SELECT finds a match

    const done = jest.fn();
    await getVerifyCallback()('accessToken', 'refreshToken', makeProfile(), done);

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0][0]).toMatch(/SELECT/);
    expect(done).toHaveBeenCalledWith(null, existingVendor);
  });

  it('creates a new vendor on first login and returns it', async () => {
    const newVendor = { id: 2, name: 'New User', email: 'new@example.com', google_id: 'google-id-999' };
    mockQuery
      .mockResolvedValueOnce({ rows: [] })         // SELECT — no match
      .mockResolvedValueOnce({ rows: [newVendor] }); // INSERT — returns new row

    const done = jest.fn();
    await getVerifyCallback()('accessToken', 'refreshToken', makeProfile({ id: 'google-id-999', displayName: 'New User', emails: [{ value: 'new@example.com' }] }), done);

    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(mockQuery.mock.calls[1][0]).toMatch(/INSERT/);
    expect(done).toHaveBeenCalledWith(null, newVendor);
  });

  it('calls done with error if the database throws', async () => {
    const dbError = new Error('DB connection failed');
    mockQuery.mockRejectedValueOnce(dbError);

    const done = jest.fn();
    await getVerifyCallback()('accessToken', 'refreshToken', makeProfile(), done);

    expect(done).toHaveBeenCalledWith(dbError);
    expect(done).not.toHaveBeenCalledWith(null, expect.anything());
  });

  it('handles a profile with no emails gracefully (email is undefined)', async () => {
    const vendor = { id: 3, name: 'No Email', email: undefined, google_id: 'google-id-456' };
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [vendor] });

    const done = jest.fn();
    await getVerifyCallback()('accessToken', 'refreshToken', makeProfile({ emails: [] }), done);

    expect(done).toHaveBeenCalledWith(null, vendor);
  });
});

// ─────────────────────────────────────────────
// serializeUser
// ─────────────────────────────────────────────
describe('serializeUser', () => {
  it('serializes the user id into the session', () => {
    const done = jest.fn();
    const serializeFn = mockPassport._callbacks['serialize'];

    serializeFn({ id: 42 }, done);

    expect(done).toHaveBeenCalledWith(null, 42);
  });
});

// ─────────────────────────────────────────────
// deserializeUser
// ─────────────────────────────────────────────
describe('deserializeUser', () => {
  it('fetches and returns the vendor from the database using the session id', async () => {
    const vendor = { id: 42, name: 'Test User', email: 'test@example.com' };
    mockQuery.mockResolvedValueOnce({ rows: [vendor] });

    const done = jest.fn();
    const deserializeFn = mockPassport._callbacks['deserialize'];
    await deserializeFn(42, done);

    expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM vendors WHERE id = $1', [42]);
    expect(done).toHaveBeenCalledWith(null, vendor);
  });

  it('returns undefined if no vendor is found for the session id', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const done = jest.fn();
    await mockPassport._callbacks['deserialize'](999, done);

    expect(done).toHaveBeenCalledWith(null, undefined);
  });

  it('calls done with error if the database throws during deserialization', async () => {
    const dbError = new Error('DB error');
    mockQuery.mockRejectedValueOnce(dbError);

    const done = jest.fn();
    await mockPassport._callbacks['deserialize'](1, done);

    expect(done).toHaveBeenCalledWith(dbError);
  });
});