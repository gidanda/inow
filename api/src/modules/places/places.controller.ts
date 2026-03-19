import { Controller, Get, Query } from "@nestjs/common";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().min(1)
});

type PlaceSearchResult = {
  id: string;
  google_place_id: string;
  name: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
};

@Controller("places")
export class PlacesController {
  @Get("search")
  async searchPlaces(@Query() query: Record<string, string>) {
    const parsed = querySchema.safeParse(query);

    if (!parsed.success) {
      return {
        error: {
          code: "VALIDATION_ERROR",
          message: "Search query is required"
        }
      };
    }

    const keyword = parsed.data.q;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return {
        results: this.getFallbackResults(keyword),
        source: "fallback"
      };
    }

    try {
      const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location"
        },
        body: JSON.stringify({
          textQuery: keyword,
          languageCode: "ja"
        })
      });

      if (!response.ok) {
        return {
          results: this.getFallbackResults(keyword),
          source: "fallback"
        };
      }

      const data = (await response.json()) as {
        places?: Array<{
          id?: string;
          displayName?: { text?: string };
          formattedAddress?: string;
          location?: { latitude?: number; longitude?: number };
        }>;
      };

      const results: PlaceSearchResult[] = (data.places ?? []).map((place) => ({
        id: place.id ?? "",
        google_place_id: place.id ?? "",
        name: place.displayName?.text ?? "Unknown place",
        formatted_address: place.formattedAddress ?? "",
        latitude: place.location?.latitude ?? 0,
        longitude: place.location?.longitude ?? 0
      }));

      return {
        results,
        source: "google"
      };
    } catch {
      return {
        results: this.getFallbackResults(keyword),
        source: "fallback"
      };
    }
  }

  private getFallbackResults(keyword: string): PlaceSearchResult[] {
    return [
      {
        id: "mock_place_1",
        google_place_id: "mock_place_1",
        name: `${keyword} サンプル1`,
        formatted_address: "東京都武蔵野市吉祥寺本町1-1-1",
        latitude: 35.703,
        longitude: 139.579
      },
      {
        id: "mock_place_2",
        google_place_id: "mock_place_2",
        name: `${keyword} サンプル2`,
        formatted_address: "東京都渋谷区渋谷1-1-1",
        latitude: 35.659,
        longitude: 139.703
      }
    ];
  }
}

