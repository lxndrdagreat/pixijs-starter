import "./style.css";
import Game from "@/core/game";
import { ExampleSceneLoader } from "@/scenes/example.scene";

document.addEventListener("DOMContentLoaded", () => {
	const frame = document.getElementById("frame");
	if (!frame) {
		throw new Error("Could not find #frame element.");
	}

	Game.create({
		frame,
		initialScene: new ExampleSceneLoader(),
	}).catch(console.error);
});
