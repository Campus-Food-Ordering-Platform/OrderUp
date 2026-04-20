import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import pool from './db';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: '/api/auth/google/callback'
},
async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
    try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const google_id = profile.id;

        // check if vendor already exists in the database
        let vendor = await pool.query(
            'SELECT * FROM vendors WHERE google_id = $1',
            [google_id]
        );

        if (vendor.rows.length === 0) {
            // first time logging in — create the vendor account
            vendor = await pool.query(
                `INSERT INTO vendors (name, email, google_id)
                 VALUES ($1, $2, $3) RETURNING *`,
                [name, email, google_id]
            );
        }

        return done(null, vendor.rows[0]);
    } catch (err) {
        return done(err as Error);
    }
}));

// save vendor id to session after login
passport.serializeUser((user: Express.User, done: (err: unknown, id?: number) => void) => {
    done(null, (user as any).id);
});

// fetch vendor from database on every request using session id
passport.deserializeUser(async (id: number, done: (err: unknown, user?: Express.User | false | null) => void) => {
    try {
        const result = await pool.query(
            'SELECT * FROM vendors WHERE id = $1',
            [id]
        );
        done(null, result.rows[0]);
    } catch (err) {
        done(err);
    }
});

export default passport;

console.log('CLIENT ID:', process.env.GOOGLE_CLIENT_ID);