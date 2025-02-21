-- Enable RLS for profiles
alter table profiles enable row level security;

-- Allow public read access to profiles
create policy "Allow public read access for profiles"
on profiles for select
to public
using (true);

-- Allow users to update their own profile
create policy "Allow users to update own profile"
on profiles for update
to authenticated
using (auth.uid()::text = id::text);

-- Allow authenticated users to insert their own profile
create policy "Allow users to insert own profile"
on profiles for insert
to authenticated
with check (auth.uid()::text = id::text); 