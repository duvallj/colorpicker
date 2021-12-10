import * as ciebase from "ciebase-ts";
import { Vector3D } from "ciebase-ts";
import * as ciecam02 from "ciecam02-ts";
import * as cielab from "./cielab";
import { RCanvas, RRect, RImg } from "./resizeable";

function init() {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const rcanvas = new RCanvas(canvas, 255, 255);
    const image = new Image();
    image.src = "https://pbs.twimg.com/profile_images/1447001302467321856/bV1ZRbKx_400x400.jpg";
    rcanvas.drawables.push(new RImg(10, 10, 50, 50, image)); 
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
