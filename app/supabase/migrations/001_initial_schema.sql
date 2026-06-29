-- ============================================
-- Boring Golf - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    handicap INTEGER,
    home_airport TEXT,
    shirt_size TEXT,
    dietary TEXT,
    shipping_street TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_zip TEXT,
    shipping_country TEXT,
    profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'confirmed', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TRIP MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trip_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('captain', 'operator', 'member', 'guest')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(trip_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_trip_id ON trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_user_id ON trip_members(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to trips
DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
CREATE TRIGGER update_trips_updated_at
    BEFORE UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- TRIPS POLICIES
-- ============================================

-- Users can read trips they created
CREATE POLICY "Users can read own trips"
    ON trips
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can read trips they are members of
CREATE POLICY "Members can read trips"
    ON trips
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trip_members
            WHERE trip_members.trip_id = trips.id
            AND trip_members.user_id = auth.uid()
        )
    );

-- Trip creators can update their trips
CREATE POLICY "Creators can update trips"
    ON trips
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Trip creators can delete their trips
CREATE POLICY "Creators can delete trips"
    ON trips
    FOR DELETE
    USING (auth.uid() = user_id);

-- Authenticated users can create trips
CREATE POLICY "Authenticated users can create trips"
    ON trips
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIP MEMBERS POLICIES
-- ============================================

-- Members can read trip membership for trips they belong to
CREATE POLICY "Members can read trip members"
    ON trip_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trip_members AS tm
            WHERE tm.trip_id = trip_members.trip_id
            AND tm.user_id = auth.uid()
        )
    );

-- Trip creators/captains can add members
CREATE POLICY "Creators can add members"
    ON trip_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM trips
            WHERE trips.id = trip_members.trip_id
            AND trips.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM trip_members AS tm
            WHERE tm.trip_id = trip_members.trip_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('captain', 'operator')
        )
    );

-- Trip creators/captains can remove members
CREATE POLICY "Creators can remove members"
    ON trip_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM trips
            WHERE trips.id = trip_members.trip_id
            AND trips.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM trip_members AS tm
            WHERE tm.trip_id = trip_members.trip_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('captain', 'operator')
        )
        OR auth.uid() = user_id  -- Members can remove themselves
    );

-- Trip creators/captains can update member roles
CREATE POLICY "Creators can update members"
    ON trip_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM trips
            WHERE trips.id = trip_members.trip_id
            AND trips.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM trip_members AS tm
            WHERE tm.trip_id = trip_members.trip_id
            AND tm.user_id = auth.uid()
            AND tm.role IN ('captain', 'operator')
        )
    );

-- ============================================
-- SERVICE ROLE BYPASS (for server-side operations)
-- ============================================

-- Allow service role to bypass RLS for all tables
-- This is handled automatically by Supabase when using service_role key
