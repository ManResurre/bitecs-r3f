import { createFileRoute } from "@tanstack/react-router";
import { Game } from "../views/components/Game";
import {loadLevelData} from "../utils/levelLoader.ts";

export const Route = createFileRoute("/")({
  component: Game,
  loader: async () => {
    const levelData = await loadLevelData();
    return { levelData };
  },
});
