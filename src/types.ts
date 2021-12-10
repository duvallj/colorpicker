import { Vector3D } from "ciebase-ts";

export interface IXyzConverter {
  fromXyz(xyz: Vector3D): Vector3D;
  toXyz(lab: Vector3D): Vector3D;
}

export interface IDrawable {
  draw(ctx: CanvasRenderingContext2D, wFactor: number, hFactor: number): void;
}
