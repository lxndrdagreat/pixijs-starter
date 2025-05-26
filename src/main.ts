import "./style.css";
import Game from "@/core/game";
import { ExampleScene } from "@/scenes/example.scene";

document.addEventListener("DOMContentLoaded", () => {
	const frame = document.getElementById("frame");
	if (!frame) {
		throw new Error("Could not find #frame element.");
	}

	Game.create({
		frame,
		initialScene: ExampleScene,
	}).catch(console.error);
});
