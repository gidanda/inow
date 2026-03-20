# inow API 仕様書

- 対象: MVP
- 参照元: `docs/inow_specification.md`
- 想定方式: REST API / JSON

## 1. 基本方針

### 1-1. API 共通仕様
- ベースパスは `/api/v1` とする
- リクエスト、レスポンスは JSON を基本とする
- 画像アップロードは別途アップロード API または署名 URL 方式を想定する
- 認証が必要な API は Bearer Token を利用する
- 検証段階の地図表示はクライアント側で `MapKit` を利用する
- 本格運用時の地図表示および Place 検索には `Google Maps Platform` を利用する
- `inow` の API は業務データのみを扱い、地図描画そのものは担わない

### 1-2. ステータスコード
| コード | 用途 |
| --- | --- |
| 200 | 取得、更新成功 |
| 201 | 作成成功 |
| 204 | 削除成功 |
| 400 | バリデーションエラー |
| 401 | 未認証 |
| 403 | 権限不足 |
| 404 | リソース未存在 |
| 409 | 重複エラー |
| 422 | 業務ルール違反 |
| 500 | サーバーエラー |

### 1-3. エラーレスポンス形式
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "title is required",
    "details": [
      {
        "field": "title",
        "reason": "required"
      }
    ]
  }
}
```

## 2. 認証 API

### 2-1. 新規登録開始
- `POST /auth/signup`

#### request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### response `201`
```json
{
  "signup_session_id": "su_123",
  "email": "user@example.com",
  "verification_required": true
}
```

### 2-2. 認証コード確認
- `POST /auth/verification/confirm`

#### request
```json
{
  "signup_session_id": "su_123",
  "code": "123456"
}
```

#### response `200`
```json
{
  "signup_session_id": "su_123",
  "verified": true,
  "onboarding_required": true
}
```

### 2-3. 認証コード再送
- `POST /auth/verification/resend`

### 2-4. 初回登録完了
- `POST /auth/onboarding`

#### request
```json
{
  "signup_session_id": "su_123",
  "last_name": "田中",
  "first_name": "花子",
  "birth_date": "1998-01-15",
  "user_id": "hanako_map",
  "display_name": "花子",
  "profile_image_url": "https://cdn.example.com/profile/1.jpg"
}
```

#### response `201`
```json
{
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "user": {
    "id": "usr_1",
    "user_id": "hanako_map",
    "display_name": "花子"
  },
  "default_maps": [
    {
      "id": "map_favorite",
      "title": "お気に入り"
    },
    {
      "id": "map_want_to_go",
      "title": "行きたい"
    }
  ]
}
```

### 2-5. ログイン
- `POST /auth/login`

#### request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### response `200`
```json
{
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "user": {
    "id": "usr_1",
    "user_id": "hanako_map",
    "display_name": "花子"
  }
}
```

### 2-6. ログアウト
- `POST /auth/logout`

### 2-7. トークン更新
- `POST /auth/refresh`

## 3. ユーザー API

### 3-1. 自分のプロフィール取得
- `GET /me`

#### response `200`
```json
{
  "id": "usr_1",
  "user_id": "hanako_map",
  "display_name": "花子",
  "bio": "吉祥寺が好き",
  "profile_image_url": "https://cdn.example.com/profile/1.jpg",
  "map_count": 5,
  "saved_map_count": 8,
  "top_areas": ["吉祥寺", "渋谷"],
  "top_tags": ["カフェ", "散歩"]
}
```

### 3-2. 自分のプロフィール更新
- `PATCH /me`

#### request
```json
{
  "display_name": "花子",
  "bio": "吉祥寺が好き",
  "profile_image_url": "https://cdn.example.com/profile/2.jpg"
}
```

### 3-3. 他ユーザープロフィール取得
- `GET /users/{user_id}`

#### response `200`
```json
{
  "id": "usr_2",
  "user_id": "taro_map",
  "display_name": "太郎",
  "bio": "ラーメン探索中",
  "profile_image_url": "https://cdn.example.com/profile/2.jpg",
  "is_following": true,
  "top_areas": ["新宿"],
  "top_tags": ["ラーメン"],
  "public_maps": [
    {
      "id": "map_10",
      "title": "新宿ラーメン"
    }
  ]
}
```

### 3-4. フォロー
- `POST /users/{user_id}/follow`

### 3-5. フォロー解除
- `DELETE /users/{user_id}/follow`

### 3-6. フォロー中一覧
- `GET /me/follows`

## 4. マップ API

### 4-1. 自分のマップ一覧取得
- `GET /me/maps`

#### query
| パラメータ | 用途 |
| --- | --- |
| `type` | `owned`, `saved`, `default`, `all` |

### 4-1b. 他ユーザーの公開マップ一覧取得
- `GET /users/{user_id}/maps`

### 4-2. マップ作成
- `POST /maps`

#### request
```json
{
  "title": "吉祥寺カフェ",
  "description": "落ち着く店を集めた",
  "cover_image_url": "https://cdn.example.com/maps/1.jpg",
  "tags": ["カフェ", "吉祥寺"],
  "visibility": "public"
}
```

#### response `201`
```json
{
  "id": "map_1",
  "title": "吉祥寺カフェ",
  "visibility": "public"
}
```

### 4-3. マップ詳細取得
- `GET /maps/{map_id}`

#### response `200`
```json
{
  "id": "map_1",
  "title": "吉祥寺カフェ",
  "description": "落ち着く店を集めた",
  "cover_image_url": "https://cdn.example.com/maps/1.jpg",
  "visibility": "public",
  "is_saved": false,
  "is_liked": true,
  "like_count": 12,
  "owner": {
    "id": "usr_1",
    "user_id": "hanako_map",
    "display_name": "花子"
  },
  "tags": ["カフェ", "吉祥寺"],
  "spots": [
    {
      "id": "spot_1",
      "name": "喫茶A",
      "latitude": 35.703,
      "longitude": 139.579
    }
  ]
}
```

### 4-4. マップ更新
- `PATCH /maps/{map_id}`

### 4-5. マップ削除
- `DELETE /maps/{map_id}`

### 4-6. マップ保存
- `POST /maps/{map_id}/save`

#### response `201`
```json
{
  "map_id": "map_1",
  "saved": true
}
```

### 4-7. マップ保存解除
- `DELETE /maps/{map_id}/save`

### 4-8. マップいいね
- `POST /maps/{map_id}/like`

### 4-9. マップいいね解除
- `DELETE /maps/{map_id}/like`

## 5. スポット API

### 5-1. スポット詳細取得
- `GET /spots/{spot_id}`

#### response `200`
```json
{
  "id": "spot_1",
  "name": "喫茶A",
  "comment": "静かで落ち着く",
  "source_type": "google_place",
  "google_place_id": "ChIJxxxx",
  "formatted_address": "東京都武蔵野市吉祥寺...",
  "latitude": 35.703,
  "longitude": 139.579,
  "image_url": "https://cdn.example.com/spots/1.jpg",
  "tags": ["カフェ"],
  "map": {
    "id": "map_1",
    "title": "吉祥寺カフェ"
  },
  "owner": {
    "id": "usr_1",
    "user_id": "hanako_map",
    "display_name": "花子"
  }
}
```

### 5-2. スポット作成
- `POST /spots`

#### request
```json
{
  "source_type": "manual",
  "map_id": "map_1",
  "name": "喫茶A",
  "comment": "静かで落ち着く",
  "formatted_address": "東京都武蔵野市吉祥寺...",
  "latitude": 35.703,
  "longitude": 139.579,
  "image_url": "https://cdn.example.com/spots/1.jpg",
  "tags": ["カフェ"]
}
```

#### 備考
- `source_type = google_place` の場合は `google_place_id` を保持する
- `source_type = manual` の場合は `google_place_id` は不要

### 5-3. スポット更新
- `PATCH /spots/{spot_id}`

### 5-4. スポット削除
- `DELETE /spots/{spot_id}`

### 5-5. スポットを自分のマップへ追加
- `POST /spots/{spot_id}/copy`

#### request
```json
{
  "target_map_id": "map_favorite"
}
```

#### response `201`
```json
{
  "source_spot_id": "spot_1",
  "target_map_id": "map_favorite",
  "created_spot_id": "spot_100"
}
```

#### 業務ルール
- `target_map_id` は自分のマップのみ選択可能
- 元スポットの情報を複製して新規スポットとして登録する
- 元スポットへの参照リンクは保持してもよいが、MVP では必須としない

## 6. 検索 API

### 6-1. 総合検索
- `GET /search`

#### query
| パラメータ | 必須 | 用途 |
| --- | --- | --- |
| `q` | 任意 | フリーワード |
| `type` | 任意 | `maps`, `spots`, `users` |
| `area` | 任意 | エリア名 |
| `tag` | 任意 | タグ |
| `category` | 任意 | カテゴリ |
| `lat` | 任意 | 緯度 |
| `lng` | 任意 | 経度 |
| `radius_m` | 任意 | 半径メートル |
| `page` | 任意 | ページ番号 |
| `per_page` | 任意 | 件数 |

#### response `200`
```json
{
  "maps": [
    {
      "id": "map_1",
      "title": "吉祥寺カフェ"
    }
  ],
  "spots": [
    {
      "id": "spot_1",
      "name": "喫茶A"
    }
  ],
  "users": [
    {
      "id": "usr_1",
      "user_id": "hanako_map",
      "display_name": "花子"
    }
  ],
  "page": 1,
  "per_page": 20
}
```

### 6-2. 地図表示用スポット検索
- `GET /map/spots`

#### query
| パラメータ | 必須 | 用途 |
| --- | --- | --- |
| `lat` | 条件付き必須 | 中心緯度 |
| `lng` | 条件付き必須 | 中心経度 |
| `radius_m` | 任意 | 半径 |
| `tag` | 任意 | タグ |

#### 備考
- `Map` 画面のピン描画用 API とする
- 公開マップに属するスポットのみ返す
- Google Place の直接検索はクライアントから Google API を呼び出すか、別のプロキシ API として扱う

## 7. 設定 API

### 7-1. 設定取得
- `GET /me/settings`

### 7-2. 通知設定更新
- `PATCH /me/settings/notifications`

### 7-3. ブロック一覧取得
- `GET /me/blocks`

### 7-4. ブロック追加
- `POST /me/blocks`

### 7-5. ブロック解除
- `DELETE /me/blocks/{user_id}`

## 8. ファイルアップロード API

### 8-1. アップロード URL 発行
- `POST /uploads`

#### request
```json
{
  "resource_type": "map_cover"
}
```

#### response `201`
```json
{
  "upload_url": "https://storage.example.com/upload-signed-url",
  "file_url": "https://cdn.example.com/maps/1.jpg"
}
```

## 9. 権限ルール

### 9-1. 公開マップ
- 未ログインでも取得可能
- 保存、いいね、フォロー、ブロックはログイン必須

### 9-2. 非公開マップ
- 作成者のみ取得可能
- 非公開マップに属するスポットも作成者のみ取得可能

### 9-3. 編集系 API
- マップ、スポットの更新削除は作成者のみ可能
- デフォルトマップは削除不可
- デフォルトマップは名称変更不可、説明文とカバー画像は設定不可

## 10. 未確定事項
- refresh token の失効方式
- 検索の並び順パラメータ詳細
- 画像アップロードの MIME 制限
