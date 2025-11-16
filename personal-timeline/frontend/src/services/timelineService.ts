const USE_API = import.meta.env.VITE_USE_API === "true";

import { timelineApiService } from "./timeline.api";
import { timelineService as timelineMockService } from "./timeline.mock";

export const timelineService = USE_API ? timelineApiService : timelineMockService;
