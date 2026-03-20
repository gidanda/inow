# inow 技術選定書

- 対象: MVP
- 作成日: 2026-03-19
- 参照元: `docs/inow_specification.md`, `docs/inow_api_specification.md`, `docs/inow_db_er.md`, `docs/inow_extension_rules.md`
- 目的: MVP 実装に採用する技術と、その採用理由・採用しない技術・将来拡張時の判断基準を明確にする

## 1. 結論

`inow` の MVP では、以下の構成を採用する。

- モバイルアプリ: `Expo SDK 55` + `React Native` + `TypeScript`
- ルーティング: `Expo Router`
- 地図表示: 検証段階は `react-native-maps` + `MapKit`
- 現在地取得: `expo-location`
- 画像選択: `expo-image-picker`
- 認証トークン保存: `expo-secure-store`
- クライアントの非同期データ管理: `TanStack Query`
- バックエンド API: `NestJS` + `TypeScript`
- DB: `PostgreSQL` + `PostGIS`
- ORM / クエリ層: `Drizzle ORM`
- バリデーション: `Zod`
- 画像ストレージ: `Supabase Storage`
- 本格運用時の地図 / Place 検索基盤: `Google Maps Platform`
- デプロイ: API は `Google Cloud Run`
- CI/CD: `GitHub Actions`
- テスト: `Vitest` + `Playwright`
- モバイルビルド / 配布: `EAS Build`

## 2. 選定方針

### 2-1. 最優先条件
- モバイルファーストで iOS / Android を同時に進められること
- 地図体験を最優先に実装できること
- 検証段階から本格運用への移行が現実的であること
- Google Maps Platform との相性がよいこと
- MVP 開発速度を優先しつつ、将来の拡張で破綻しないこと
- DB / API / 画面責務を明確に分けられること

### 2-2. 今回避けるもの
- 初期から複数クライアントを別実装する構成
- 地図基盤と業務ロジックが混ざる構成
- PostGIS を使いにくい OR M中心設計
- MVP から過剰なマイクロサービス分割

## 3. 採用技術

### 3-1. モバイルアプリ

#### 採用
- `Expo SDK 55`
- `React Native`
- `TypeScript`
- `Expo Router`

#### 採用理由
- Expo 公式は新規プロジェクト作成に `create-expo-app` を推奨している
- Expo Router は Expo 公式が Expo プロジェクト向けの推奨ルーティングとして案内している
- ファイルベースルーティングで画面構成書と実装構造を対応づけやすい
- EAS Build まで含めて、ネイティブ配布の導線が一貫している

#### 実装ルール
- アプリは Expo 管理下で開始する
- 画面構成は `app/` 配下の route ベースで組む
- 型定義は `TypeScript strict` 前提にする

### 3-2. 地図・位置情報

#### 採用
- 地図表示: 検証段階は `react-native-maps` + `MapKit`
- 現在地: `expo-location`
- Place 検索: `Google Maps Platform Places API (New)`

#### 採用理由
- Expo 公式ドキュメント上で `react-native-maps` は最新 SDK 向けに案内されている
- 検証段階では iOS ネイティブの `MapKit` ベースで素早く地図 UI を確認できる
- `expo-maps` は Expo docs 上で alpha 扱いのため、MVP の安定性を優先して採用しない
- `expo-location` は Expo 公式の標準的な位置情報取得手段
- Google Places API (New) は `Text Search`, `GetPlace`, `Autocomplete` など Place 検索に必要な機能を提供する

#### 実装ルール
- 検証段階の地図描画は `react-native-maps` を通して `MapKit` ベースで行う
- 本格運用時は Google Maps API 連携へ切り替える前提で責務を分離しておく
- Google Place の検索結果はそのまま業務データにせず、`inow` の `spot` に変換して保存する
- `google_place_id` と `formatted_address` は保持する

### 3-3. クライアント状態管理

#### 採用
- サーバー状態: `TanStack Query`
- 画面内ローカル状態: React 標準 state

#### 採用理由
- TanStack Query は React Native で利用可能で、キャッシュ・再取得・ミューテーション管理が安定している
- `inow` はサーバー状態中心のアプリであり、重いグローバル状態管理を初期導入する必要が薄い
- 不要なグローバルストアを避けることで責務が明確になる

#### 実装ルール
- API 取得結果は TanStack Query に集約する
- 認証ユーザーやトークン以外の永続グローバル状態は安易に導入しない

### 3-4. 認証トークン・端末機能

#### 採用
- トークン保存: `expo-secure-store`
- 画像選択: `expo-image-picker`
- 通知: `expo-notifications` を将来導入前提で準備

#### 採用理由
- `expo-secure-store` は Expo 公式の暗号化ローカル保存手段
- `expo-image-picker` はプロフィール画像、スポット画像追加に必要
- 通知は MVP 後半以降の拡張候補だが、Expo ベースで自然に追加できる

### 3-5. バックエンド API

#### 採用
- `NestJS`
- `TypeScript`

#### 採用理由
- NestJS は TypeScript 前提で、モジュール分割と責務分離がしやすい
- 認証、ユーザー、マップ、スポット、検索、ブロックのような業務単位を module で切りやすい
- テスト手法が公式に整備されている

#### 実装ルール
- モジュールは `auth`, `users`, `maps`, `spots`, `search`, `blocks`, `uploads` 単位で切る
- Google Maps Platform を直接返す API を業務 API に混ぜない
- DTO だけで完結させず、domain/service/repository の責務を分ける

### 3-6. DB

#### 採用
- `PostgreSQL`
- `PostGIS`

#### 採用理由
- 地図系アプリで必要な座標検索、範囲検索、距離検索に適している
- PostGIS は位置情報を型・インデックス・関数レベルで扱える
- 将来の「地図範囲内スポット検索」「半径検索」「おすすめ候補抽出」に拡張しやすい

#### 実装ルール
- MVP 時点でも位置情報は PostGIS 前提で設計する
- 単純な `lat/lng decimal` のみで運用を固定しない
- `spots` は表示用の `latitude`, `longitude` と、検索用の geography/geometry を併用してよい

### 3-7. ORM / クエリ層

#### 採用
- `Drizzle ORM`

#### 採用理由
- Drizzle は PostgreSQL 接続を公式にサポートしている
- SQL に近い書き方で制御でき、PostGIS や将来の拡張 SQL と相性がよい
- Prisma よりも SQL 主導で設計しやすく、地理空間クエリや拡張機能の導入時に逃げ道が多い

#### 実装ルール
- 単純 CRUD は Drizzle の schema/query で扱う
- 地理空間クエリや複雑検索は raw SQL を許可する
- ORM の制約に DB 設計を引っ張られない

### 3-8. バリデーション

#### 採用
- `Zod`

#### 採用理由
- TypeScript と相性がよく、厳密な入力バリデーションを定義しやすい
- クライアントと API の入力仕様を揃えやすい
- strict mode 前提で扱いやすい

#### 実装ルール
- リクエスト境界の入力検証に使う
- DB 制約の代替ではなく、API 境界の検証として使う

### 3-9. 画像ストレージ

#### 採用
- `Supabase Storage`

#### 採用理由
- Supabase 公式は Storage をユーザー生成コンテンツ向けストレージとして案内している
- S3 互換アクセスもあり、将来の移行性がある
- 画像 CDN 配信、オブジェクト保存を MVP で素早く扱える

#### 採用方針
- 認証は Supabase Auth を使わない
- DB と Storage は Supabase、認証と業務 API は自前で持つ

### 3-10. インフラ / デプロイ

#### 採用
- API 実行基盤: `Google Cloud Run`
- ソース管理 / CI: `GitHub` + `GitHub Actions`
- モバイルビルド: `EAS Build`

#### 採用理由
- Cloud Run はコンテナを HTTP サービスとして運用しやすく、Node/Nest API と相性がよい
- Google Maps Platform と同じ GCP 系で運用上の相性がよい
- GitHub Actions は CI/CD を標準化しやすい
- EAS Build は Expo アプリのビルド配布に最短

## 4. 採用しない技術

### 4-1. `expo-maps`
- 理由: Expo docs 上で alpha 扱い
- 判断: MVP では不採用。安定化後に再評価

### 4-2. `Supabase Auth`
- 理由: 現在の仕様は独自の認証フロー、独自 onboarding、独自デフォルトマップ生成を前提としている
- 判断: 認証責務を分散させないため不採用

### 4-3. `Firebase / Firestore`
- 理由: 地理空間検索、リレーショナル整合性、マップ主導の検索に対して PostgreSQL + PostGIS の方が自然
- 判断: 不採用

### 4-4. `Prisma`
- 理由: 通常 CRUD には強いが、PostGIS や拡張 SQL 中心の設計では Drizzle の方が扱いやすい
- 判断: MVP では不採用

### 4-5. 重いグローバル状態管理ライブラリ
- 対象例: Redux Toolkit など
- 理由: MVP ではサーバー状態中心であり、React state + TanStack Query で十分
- 判断: 不採用

## 5. ディレクトリ方針

### 5-1. モバイル
```text
mobile/
  app/
  components/
  features/
  lib/
  services/
  hooks/
  types/
```

### 5-2. API
```text
api/
  src/
    modules/
      auth/
      users/
      maps/
      spots/
      search/
      blocks/
      uploads/
    common/
    config/
    db/
```

## 6. 技術別ルール

### 6-1. 地図基盤
- 検証段階の地図表示は `MapKit` を使う
- 本格運用時の Place 検索は Google に任せる
- `inow` の業務データは自前 DB に保存する
- Google Place 情報を主キーとして扱わない

### 6-2. DB
- PostGIS を有効化する
- 近傍検索や範囲検索は SQL / PostGIS 関数で解決する
- 検索性能が必要な箇所は先に index 戦略を決める

### 6-3. API
- 既存レスポンス互換を壊さない
- 新規機能は module と endpoint の追加で拡張する
- 保存 API と複製 API を混同しない

### 6-4. モバイル
- 画面ルーティングは Expo Router に統一する
- 画面責務は `inow_extension_rules.md` に従う
- API クライアントは一箇所に集約する

## 7. 将来拡張に対する相性

### 7-1. 相性が良い拡張
- 通知機能
- レコメンド機能
- 高度な地理検索
- 共同編集
- 限定公開
- Web 版の簡易閲覧画面

### 7-2. 将来注意が必要な拡張
- リアルタイム共同編集
- オフライン完全対応
- 画像の複数枚・動画対応
- 高度な全文検索

## 8. 実装開始時の初期セットアップ

### 8-1. 先に作るもの
1. `mobile/` Expo プロジェクト
2. `api/` NestJS プロジェクト
3. PostgreSQL + PostGIS 環境
4. Drizzle schema / migration 基盤
5. MapKit 検証方針と Google Maps Platform API キー管理
6. Supabase Storage バケット
7. GitHub Actions の CI

### 8-2. MVP 初期スコープの優先順
1. 認証
2. Map 画面
3. マップ作成
4. スポット追加
5. Search
6. Profile / User Profile
7. 保存 / フォロー / ブロック

## 9. 決定事項

- モバイルは `Expo` を採用する
- 地図表示は検証段階で `react-native-maps` + `MapKit` を採用する
- 本格運用時の地図 / Place 基盤は `Google Maps Platform` とする
- Place 検索は Google、業務データは自前 API / DB
- API は `NestJS`
- DB は `PostgreSQL + PostGIS`
- ORM は `Drizzle ORM`
- 画像は `Supabase Storage`
- コメント機能は MVP から外す
- ブロック機能は MVP に含む

## 10. 保留事項

- PostgreSQL の提供先を `Supabase Postgres` に寄せるか、別マネージド PostgreSQL にするか
- Cloud Run から DB へ接続する方式
- 画像変換やサムネイル生成の実装方式
- 検索の並び順詳細
- Push 通知を MVP 後すぐ入れるか

## 11. 推奨ソース

- Expo create project: https://docs.expo.dev/get-started/create-a-project/
- Expo Router: https://docs.expo.dev/router/introduction/
- Expo navigation recommendation: https://docs.expo.dev/develop/app-navigation/
- react-native-maps on Expo: https://docs.expo.dev/versions/latest/sdk/map-view/
- expo-location: https://docs.expo.dev/versions/latest/sdk/location/
- expo-image-picker: https://docs.expo.dev/tutorial/image-picker/
- expo-secure-store: https://docs.expo.dev/versions/latest/sdk/securestore/
- Expo notifications: https://docs.expo.dev/versions/latest/sdk/notifications
- EAS Build: https://docs.expo.dev/build/introduction/
- EAS overview: https://docs.expo.dev/eas/
- Google Places API overview: https://developers.google.com/maps/documentation/places/web-service/op-overview
- Google Text Search (New): https://developers.google.com/maps/documentation/places/web-service/text-search
- Google Maps pricing: https://developers.google.com/maps/billing-and-pricing/pricing
- NestJS first steps: https://docs.nestjs.com/first-steps
- NestJS testing: https://docs.nestjs.com/fundamentals/testing
- Drizzle PostgreSQL: https://orm.drizzle.team/docs/get-started-postgresql
- Drizzle with Supabase: https://orm.drizzle.team/docs/connect-supabase
- PostgreSQL with Prisma reference: https://docs.prisma.io/docs/v6/orm/overview/databases/postgresql
- PostGIS official: https://postgis.net/
- Supabase extensions overview: https://supabase.com/docs/guides/database/extensions
- Supabase PostGIS: https://supabase.com/docs/guides/database/extensions/postgis
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase Storage S3 compatibility: https://supabase.com/docs/guides/storage/s3/compatibility
- Cloud Run overview: https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run
- GitHub Actions: https://docs.github.com/en/actions/
- TanStack Query React Native: https://tanstack.com/query/v5/docs/react/react-native
- Zod: https://zod.dev/
- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/docs/intro
