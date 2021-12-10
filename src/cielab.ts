/* Apache licensed by Rufflewind 2017, modified by Jack Duvall 2021,
 * originally at https://github.com/Rufflewind/_urandom/blob/master/colorpicker/cielab.js */

import { xyz as XyzConverter, matrix, Matrix3D, Vector3D } from "ciebase-ts";
import { IXyzConverter } from "./types";

const SrgbXyzConverter = XyzConverter();

const WHITE_XYZ: Vector3D = [0.95047, 1.0, 1.08883];
const CIELAB_D = 6.0 / 29.0;
const CIELAB_M = Math.pow(29.0 / 6.0, 2) / 3.0;
const CIELAB_C = 4.0 / 29.0;
const CIELAB_A = 3.0;
const CIELAB_RECIP_A = 1.0 / CIELAB_A;
const CIELAB_POW_D_A = Math.pow(CIELAB_D, CIELAB_A);
const CIELAB_MATRIX: Matrix3D = [
    [ 0.0 ,  1.16,  0.0 ],
    [ 5.0 , -5.0 ,  0.0 ],
    [ 0.0 ,  2.0 , -2.0 ],
];
const CIELAB_MATRIX_INV = matrix.inverse(CIELAB_MATRIX);
 /* [
  * [ 0.86206897,  0.2       ,  0.0       ],
  * [ 0.86206897,  0.0       ,  0.0       ],
  * [ 0.86206897,  0.0       , -0.5       ],
  * ];
  */
const CIELAB_OFFSET = -0.16;

function cielab_from_linear(x: number): number {
    return x <= CIELAB_POW_D_A ?
           CIELAB_M * x + CIELAB_C :
           Math.pow(x, CIELAB_RECIP_A);
}

function cielab_to_linear(y: number): number {
    return y <= CIELAB_D ?
           (y - CIELAB_C) / CIELAB_M :
           Math.pow(y, CIELAB_A);
}

function cielab_to_xyz(lab: Vector3D): Vector3D {
    lab[0] -= CIELAB_OFFSET;
    let xyz = matrix.multiply(CIELAB_MATRIX_INV, lab);
    lab[0] += CIELAB_OFFSET;
    xyz = [
        cielab_to_linear(xyz[0]) * WHITE_XYZ[0],
        cielab_to_linear(xyz[1]) * WHITE_XYZ[1],
        cielab_to_linear(xyz[2]) * WHITE_XYZ[2],
    ];
    return xyz;
}

function cielab_from_xyz(xyz: Vector3D): Vector3D {
    const fxyz: Vector3D = [
        cielab_from_linear(xyz[0] / WHITE_XYZ[0]),
        cielab_from_linear(xyz[1] / WHITE_XYZ[1]),
        cielab_from_linear(xyz[2] / WHITE_XYZ[2])
    ];
    let lab = matrix.multiply(CIELAB_MATRIX, fxyz);
    lab[0] += CIELAB_OFFSET;
    return lab;
}

function clamp(x: number, low: number = 0.0, high: number = 1.0): [boolean, number] {
    if (x < low) {
        return [true, low];
    } else if (x > high) {
        return [true, high];
    } else {
        return [false, x];
    }
}

function clamp_linear(xyz: Vector3D): [boolean, Vector3D] {
    const [bad_x, x] = clamp(xyz[0]);
    const [bad_y, y] = clamp(xyz[1]);
    const [bad_z, z] = clamp(xyz[2]);
    return [bad_x || bad_y || bad_z, [x, y, z]]; 
}

exports.srgbToCielab = function(rgb: Vector3D): [boolean, Vector3D] {
    const xyz = SrgbXyzConverter.fromRgb(rgb);
    const lab = cielab_from_xyz(xyz);
    return [false, lab];
};

exports.cielabToSrgb = function(lab: Vector3D): [boolean, Vector3D] {
    const xyz = cielab_to_xyz(lab);
    const [bad, xyz_clamped] = clamp_linear(xyz);
    const rgb = SrgbXyzConverter.toRgb(xyz_clamped);
    return [bad, rgb];
};