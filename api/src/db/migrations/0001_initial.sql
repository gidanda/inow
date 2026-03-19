create table if not exists users (
  id varchar(64) primary key,
  user_id varchar(50) not null unique,
  email varchar(255) not null unique,
  password_digest varchar(255) not null,
  last_name varchar(50) not null,
  first_name varchar(50) not null,
  birth_date date not null,
  display_name varchar(30) not null,
  profile_image_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists auth_signup_sessions (
  id varchar(64) primary key,
  email varchar(255) not null,
  password_digest varchar(255) not null,
  verification_code varchar(20) not null,
  is_verified boolean not null default false,
  verified_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists maps (
  id varchar(64) primary key,
  user_id varchar(64) not null references users(id) on delete cascade,
  title varchar(100) not null,
  description text,
  cover_image_url text,
  visibility varchar(20) not null,
  is_default boolean not null default false,
  default_type varchar(30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists spots (
  id varchar(64) primary key,
  map_id varchar(64) not null references maps(id) on delete cascade,
  created_by varchar(64) not null references users(id) on delete cascade,
  source_spot_id varchar(64),
  source_type varchar(20) not null,
  google_place_id varchar(255),
  formatted_address text,
  name varchar(100) not null,
  comment text,
  latitude double precision not null,
  longitude double precision not null,
  image_url text,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tags (
  id varchar(64) primary key,
  name varchar(50) not null unique,
  tag_type varchar(20),
  created_at timestamptz not null default now()
);

create table if not exists map_tags (
  map_id varchar(64) not null references maps(id) on delete cascade,
  tag_id varchar(64) not null references tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (map_id, tag_id)
);

create table if not exists spot_tags (
  spot_id varchar(64) not null references spots(id) on delete cascade,
  tag_id varchar(64) not null references tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (spot_id, tag_id)
);

create table if not exists map_saves (
  id varchar(64) primary key,
  user_id varchar(64) not null references users(id) on delete cascade,
  map_id varchar(64) not null references maps(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists map_likes (
  id varchar(64) primary key,
  user_id varchar(64) not null references users(id) on delete cascade,
  map_id varchar(64) not null references maps(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists follows (
  id varchar(64) primary key,
  follower_user_id varchar(64) not null references users(id) on delete cascade,
  followee_user_id varchar(64) not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists user_blocks (
  id varchar(64) primary key,
  blocker_user_id varchar(64) not null references users(id) on delete cascade,
  blocked_user_id varchar(64) not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_maps_user_id on maps(user_id);
create index if not exists idx_spots_map_id on spots(map_id);
create index if not exists idx_spots_created_by on spots(created_by);
create index if not exists idx_map_saves_user_id on map_saves(user_id);
create index if not exists idx_map_likes_map_id on map_likes(map_id);
create index if not exists idx_follows_follower on follows(follower_user_id);
create index if not exists idx_user_blocks_blocker on user_blocks(blocker_user_id);
