import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: databaseUrl });

try {
  await pool.query("begin");

  const now = new Date().toISOString();
  const hanakoId = "usr_hanako";
  const taroId = "usr_taro";

  await pool.query(
    `
    insert into users (id, user_id, email, password_digest, last_name, first_name, birth_date, display_name, bio, created_at, updated_at)
    values
      ($1, 'hanako_map', 'hanako@example.com', 'password123', '田中', '花子', '1998-01-15', '花子', '吉祥寺が好き', $3, $3),
      ($2, 'taro_map', 'taro@example.com', 'password123', '佐藤', '太郎', '1996-07-08', '太郎', 'ラーメン探索中', $3, $3)
    on conflict (id) do nothing
    `,
    [hanakoId, taroId, now]
  );

  await pool.query(
    `
    insert into maps (id, user_id, title, description, visibility, is_default, default_type, created_at, updated_at)
    values
      ('map_hanako_public', $1, '吉祥寺カフェ', '落ち着く店を集めた', 'public', false, null, $3, $3),
      ('map_hanako_favorite', $1, 'お気に入り', null, 'private', true, 'favorite', $3, $3),
      ('map_hanako_want', $1, '行きたい', null, 'private', true, 'want_to_go', $3, $3),
      ('map_taro_public', $2, '新宿ラーメン', '深夜でも行ける店を中心に', 'public', false, null, $3, $3)
    on conflict (id) do nothing
    `,
    [hanakoId, taroId, now]
  );

  await pool.query(
    `
    insert into spots (id, map_id, created_by, source_type, google_place_id, formatted_address, name, comment, latitude, longitude, sort_order, created_at, updated_at)
    values
      ('spot_1', 'map_hanako_public', $1, 'manual', null, '東京都武蔵野市吉祥寺本町1-1-1', '喫茶A', '静かで落ち着く', 35.703, 139.579, 1, $3, $3),
      ('spot_2', 'map_taro_public', $2, 'google_place', 'ChIJxxxx', '東京都新宿区西新宿1-1-1', '麺処B', '深夜営業', 35.690, 139.700, 1, $3, $3)
    on conflict (id) do nothing
    `,
    [hanakoId, taroId, now]
  );

  await pool.query(
    `
    insert into follows (id, follower_user_id, followee_user_id, created_at)
    values ('follow_seed_1', $1, $2, $3)
    on conflict (id) do nothing
    `,
    [hanakoId, taroId, now]
  );

  await pool.query(
    `
    insert into tags (id, name, created_at)
    values
      ('tag_cafe', 'カフェ', $1),
      ('tag_kichijoji', '吉祥寺', $1),
      ('tag_ramen', 'ラーメン', $1),
      ('tag_shinjuku', '新宿', $1)
    on conflict (id) do nothing
    `,
    [now]
  );

  await pool.query(
    `
    insert into map_tags (map_id, tag_id, created_at)
    values
      ('map_hanako_public', 'tag_cafe', $1),
      ('map_hanako_public', 'tag_kichijoji', $1),
      ('map_taro_public', 'tag_ramen', $1),
      ('map_taro_public', 'tag_shinjuku', $1)
    on conflict do nothing
    `,
    [now]
  );

  await pool.query(
    `
    insert into spot_tags (spot_id, tag_id, created_at)
    values
      ('spot_1', 'tag_cafe', $1),
      ('spot_2', 'tag_ramen', $1)
    on conflict do nothing
    `,
    [now]
  );

  await pool.query("commit");
  console.log("seed completed");
} catch (error) {
  await pool.query("rollback");
  throw error;
} finally {
  await pool.end();
}
