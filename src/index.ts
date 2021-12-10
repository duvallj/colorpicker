import { Renderer } from "./renderer";
import { RCanvas } from "./resizeable";
function init() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const rcanvas = new RCanvas(canvas, 255, 255);
    const renderer = new Renderer(canvas, navigator.hardwareConcurrency || 4, "LAB");
    rcanvas.drawables.push(renderer); 
    rcanvas.resize();

    window.onresize = (_ev): any => {
        rcanvas.resize();
    }
}
// Used to export functions to be visible in the HTML
declare global {
    var init: () => void;
}

global.init = init;
