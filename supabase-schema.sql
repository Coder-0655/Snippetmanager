-- Supabase Schema for Snippet Manager
-- Note: auth.users table is managed by Supabase and has RLS enabled by default

-- Create users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Create snippets table
create table public.snippets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  code text not null,
  language text not null,
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tags table (for better querying and autocomplete)
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.snippets enable row level security;
alter table public.tags enable row level security;

-- Create RLS policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create RLS policies for snippets
create policy "Users can view own snippets"
  on public.snippets for select
  using (auth.uid() = user_id);

create policy "Users can insert own snippets"
  on public.snippets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own snippets"
  on public.snippets for update
  using (auth.uid() = user_id);

create policy "Users can delete own snippets"
  on public.snippets for delete
  using (auth.uid() = user_id);

-- Create RLS policies for tags (read-only for all users, insert for authenticated)
create policy "Anyone can view tags"
  on public.tags for select
  using (true);

create policy "Authenticated users can create tags"
  on public.tags for insert
  to authenticated
  with check (true);

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to automatically update tags table when snippets are created/updated
create or replace function public.update_tags_from_snippet()
returns trigger as $$
declare
  tag_name text;
begin
  -- Insert new tags from the snippet
  if NEW.tags is not null then
    foreach tag_name in array NEW.tags
    loop
      insert into public.tags (name)
      values (lower(trim(tag_name)))
      on conflict (name) do nothing;
    end loop;
  end if;
  
  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger to update tags when snippets are inserted or updated
create trigger update_tags_on_snippet_change
  after insert or update on public.snippets
  for each row execute procedure public.update_tags_from_snippet();

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = timezone('utc'::text, now());
  return NEW;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_snippets_updated_at
  before update on public.snippets
  for each row execute procedure public.update_updated_at_column();

-- Create indexes for better performance
create index idx_snippets_user_id on public.snippets(user_id);
create index idx_snippets_language on public.snippets(language);
create index idx_snippets_tags on public.snippets using gin(tags);
create index idx_snippets_created_at on public.snippets(created_at desc);
create index idx_snippets_search on public.snippets using gin(to_tsvector('english', title || ' ' || code));

-- Enable real-time subscriptions (optional)
alter publication supabase_realtime add table public.snippets;
alter publication supabase_realtime add table public.tags;