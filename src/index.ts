import "./style.css";

import { Renderer } from "./renderer";
import { RCanvas } from "./resizeable";
import { ColorSpace } from "./types";
import { IntField, Slider, Swatch, HexField, StateManager } from "./controls";

const field1 = new IntField("field1-label", "field1", 0);
const field2 = new IntField("field2-label", "field2", 1);
const field3 = new IntField("field3-label", "field3", 2);
const slider = new Slider("slider");
const swatch = new Swatch("swatch");
const hex = new HexField("rgbhex");

const stateManager = new StateManager();
stateManager.addInput(field1);
stateManager.addInput(field2);
stateManager.addInput(field3);
stateManager.addInput(slider);
stateManager.addInput(swatch);
stateManager.addInput(hex);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const rcanvas = new RCanvas(canvas, 255, 255);
const renderer = new Renderer(
    canvas,
    navigator.hardwareConcurrency || 4,
    stateManager,
);
rcanvas.drawables.push(renderer); 
rcanvas.resize();

window.onresize = (_ev): any => {
    rcanvas.resize();
}
