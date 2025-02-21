-- Enable the uuid extension if not already enabled:
create extension if not exists "uuid-ossp";

-- Profiles table for user details
create table if not exists profiles (
  id uuid primary key,
  username text,
  avatar_url text,
  bio text,
  updated_at timestamp with time zone default now()
);

-- Topics table for discussion topics
create table if not exists topics (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  meeting_link text,
  author_id uuid references profiles(id),
  status text default 'open',
  created_at timestamp with time zone default now()
);

-- Comments table for topic comments
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  topic_id uuid references topics(id),
  content text not null,
  author_id uuid references profiles(id),
  created_at timestamp with time zone default now()
);
