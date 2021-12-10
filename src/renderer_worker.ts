import { expose } from "threads/worker";
import { srgbToCielab, cielabToSrgb } from "./cielab";
import { srgbToCiecam02, ciecam02ToSrgb, labToJch, jchToLab } from "./ciecam02";
import { Vector3D } from "ciebase-ts";
import { RenderMap } from "./types";

function inpToLab(inp: Vector3D, maxChroma: number): Vector3D {
    return [
        inp[2],
        (2.0 * inp[0] - 1.0) * maxChroma,
        (2.0 * inp[1] - 1.0) * maxChroma,
    ];
}

function labToInp(lab: Vector3D, maxChroma: number): Vector3D {
    return [
        (lab[1] / maxChroma + 1.0) / 2.0,
        (lab[2] / maxChroma + 1.0) / 2.0,
        lab[0],
    ];
}

const VIEWS: RenderMap = {
    LAB: {
        transform: inpToLab,
        untransform: labToInp,
        toSrgb: cielabToSrgb,
        fromSrgb: srgbToCielab,
    },
    CAM02: {
        transform: function(inp: Vector3D, maxChroma: number): Vector3D {
            const jch = labToJch(inpToLab(inp, maxChroma));
            return [jch.J, jch.C, jch.h];
        },
        untransform: function(jch: Vector3D, maxChroma: number): Vector3D {
            return labToInp(jchToLab({ J: jch[0], C: jch[1], h: jch[2] }), maxChroma);
        },
        toSrgb: ciecam02ToSrgb,
        fromSrgb: srgbToCiecam02,
    }
};

expose(function renderPortion(width: number, height: number, yBegin: number, yEnd: number, maxChroma: number, inpZ: number, view: string): Uint8ClampedArray {
    const transform = VIEWS[view].transform;
    const toSrgb = VIEWS[view].toSrgb;
    let inp: Vector3D = [0.0, 0.0, inpZ];
    let data = new Uint8ClampedArray(4 * width * (yEnd - yBegin));
    for (let y = yBegin; y < yEnd; ++y) {
        inp[1] = 1.0 - y / height;
        for (let x = 0; x < width; ++x) {
            inp[0] = x / width;
            const r = toSrgb(transform(inp, maxChroma));
            let rgb = r.val;
            if (!r.inGamut) {
                const desat = 0.5;
                const dim = 0.1;
                const avg = (rgb[0] + rgb[1] + rgb[2]) / 3.0;
                rgb[0] = (rgb[0]) * (1.0 - desat) + avg * desat - dim;
                rgb[1] = (rgb[1]) * (1.0 - desat) + avg * desat - dim;
                rgb[2] = (rgb[2]) * (1.0 - desat) + avg * desat - dim;
            }
            const offset = 4 * (x + width * (y - yBegin));
            data[offset + 0] = 255.0 * rgb[0];
            data[offset + 1] = 255.0 * rgb[1];
            data[offset + 2] = 255.0 * rgb[2];
            data[offset + 3] = 255.0;
        }
    }
    return data;
});
