export const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";
export const demoUserId = process.env.EXPO_PUBLIC_DEMO_USER_ID ?? "hanako_map";
let authToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  authToken = token;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": authToken ?? demoUserId,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export type HealthResponse = {
  status: string;
  service: string;
};

export type ProfileResponse = {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  profile_image_url?: string;
  map_count: number;
  saved_map_count: number;
};

export type FollowResponse = {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  recent_public_map_title?: string | null;
};

export type MapSummary = {
  id: string;
  title: string;
  visibility?: string;
  is_default?: boolean;
  type?: string;
  tags?: string[];
};

export type SpotSummary = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  formatted_address?: string;
  source_type: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    user_id: string;
    display_name: string;
  };
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export type SignUpResponse = {
  signup_session_id: string;
  email: string;
  verification_required: boolean;
};

export type VerificationResponse = {
  signup_session_id: string;
  verified: boolean;
  onboarding_required: boolean;
};

export type OnboardingResponse = LoginResponse & {
  default_maps: { id: string; title: string }[];
};

export type UserProfileResponse = {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  is_following: boolean;
  public_maps: MapSummary[];
};

export type MapDetailResponse = {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  visibility: string;
  is_saved: boolean;
  is_liked: boolean;
  like_count: number;
  owner: {
    id: string;
    user_id: string;
    display_name: string;
  } | null;
  tags: string[];
  spots: SpotSummary[];
};

export type SpotDetailResponse = {
  id: string;
  name: string;
  comment?: string;
  source_type: string;
  google_place_id?: string;
  formatted_address?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  tags: string[];
  map: {
    id: string;
    title: string;
  };
  owner: {
    id: string;
    user_id: string;
    display_name: string;
  } | null;
};

export type CreateMapInput = {
  title: string;
  description?: string;
  cover_image_url?: string;
  tags?: string[];
  visibility: "public" | "private";
};

export type CreateSpotInput = {
  map_id: string;
  source_type: "google_place" | "manual";
  google_place_id?: string;
  name: string;
  comment?: string;
  formatted_address?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  tags?: string[];
};

export type UploadResponse = {
  upload_url: string;
  file_url: string;
};

export type SearchResponse = {
  maps: { id: string; title: string }[];
  spots: { id: string; name: string }[];
  users: { id: string; user_id: string; display_name: string }[];
  page: number;
  per_page: number;
};

export type BlockResponse = {
  blocks: { user_id: string }[];
};

export type PlaceSearchResult = {
  id: string;
  google_place_id: string;
  name: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
};

export function getHealth() {
  return apiFetch<HealthResponse>("/health");
}

export function signUp(email: string, password: string) {
  return apiFetch<SignUpResponse | ApiErrorResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function confirmVerification(signupSessionId: string, code: string) {
  return apiFetch<VerificationResponse | ApiErrorResponse>("/auth/verification/confirm", {
    method: "POST",
    body: JSON.stringify({
      signup_session_id: signupSessionId,
      code
    })
  });
}

export function completeOnboarding(input: {
  signup_session_id: string;
  last_name: string;
  first_name: string;
  birth_date: string;
  user_id: string;
  display_name: string;
  profile_image_url?: string;
}) {
  return apiFetch<OnboardingResponse | ApiErrorResponse>("/auth/onboarding", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function login(email: string, password: string) {
  return apiFetch<LoginResponse | ApiErrorResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function getMe() {
  return apiFetch<ProfileResponse>("/me");
}

export function getMyMaps() {
  return apiFetch<MapSummary[]>("/me/maps");
}

export function getFollows() {
  return apiFetch<FollowResponse[]>("/me/follows");
}

export function getUserProfile(userId: string) {
  return apiFetch<UserProfileResponse>(`/users/${userId}`);
}

export function getMapSpots() {
  return apiFetch<SpotSummary[]>("/map/spots");
}

export function getMapDetail(mapId: string) {
  return apiFetch<MapDetailResponse>(`/maps/${mapId}`);
}

export function createMap(input: CreateMapInput) {
  return apiFetch<MapSummary>("/maps", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateMap(mapId: string, input: Partial<CreateMapInput>) {
  return apiFetch<MapSummary>(`/maps/${mapId}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function saveMap(mapId: string) {
  return apiFetch<{ map_id: string; saved: boolean }>(`/maps/${mapId}/save`, {
    method: "POST"
  });
}

export function toggleLikeMap(mapId: string, liked: boolean) {
  return apiFetch<{ map_id: string; liked: boolean }>(`/maps/${mapId}/like`, {
    method: liked ? "DELETE" : "POST"
  });
}

export function getSpotDetail(spotId: string) {
  return apiFetch<SpotDetailResponse>(`/spots/${spotId}`);
}

export function createSpot(input: CreateSpotInput) {
  return apiFetch<{ id: string; map_id: string; name: string }>("/spots", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateSpot(spotId: string, input: Partial<CreateSpotInput>) {
  return apiFetch<{ id: string; name: string }>(`/spots/${spotId}`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export async function createUpload(resourceType: "map_cover" | "spot_image" | "profile_image") {
  return apiFetch<UploadResponse>("/uploads", {
    method: "POST",
    body: JSON.stringify({ resource_type: resourceType })
  });
}

export async function uploadImageFromUri(
  uri: string,
  resourceType: "map_cover" | "spot_image" | "profile_image"
) {
  const upload = await createUpload(resourceType);

  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    await fetch(upload.upload_url, {
      method: "PUT",
      body: blob
    });
  } catch {
    // Keep the generated file URL even when using the mock upload endpoint.
  }

  return upload.file_url;
}

export function copySpot(spotId: string, targetMapId: string) {
  return apiFetch<{ created_spot_id: string }>(`/spots/${spotId}/copy`, {
    method: "POST",
    body: JSON.stringify({ target_map_id: targetMapId })
  });
}

export function followUser(userId: string, following: boolean) {
  return apiFetch<{ followed: boolean; user_id: string }>(`/users/${userId}/follow`, {
    method: following ? "DELETE" : "POST"
  });
}

export function getBlocks() {
  return apiFetch<BlockResponse>("/me/blocks");
}

export function setBlockedUser(userId: string, blocked: boolean) {
  return apiFetch<{ blocked: boolean; user_id: string }>(`/me/blocks${blocked ? `/${userId}` : ""}`, {
    method: blocked ? "DELETE" : "POST",
    ...(blocked ? {} : { body: JSON.stringify({ user_id: userId }) })
  });
}

export function searchMaps(query = "") {
  return apiFetch<SearchResponse>(`/search?q=${encodeURIComponent(query)}`);
}

export function searchPlaces(query: string) {
  return apiFetch<{ results: PlaceSearchResult[]; source: string }>(
    `/places/search?q=${encodeURIComponent(query)}`
  );
}
