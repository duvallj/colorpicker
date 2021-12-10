import { Vector3D } from "ciebase-ts";

export class ColorResult<T>{
  inGamut: boolean;
  val: T;
}

export interface IDrawable {
  resize(width: number, height: number): void;
  draw(ctx: CanvasRenderingContext2D, wFactor: number, hFactor: number): void;
}

export interface RenderConfig {
  transform(inp: Vector3D, maxChroma: number): Vector3D;
  untransform(rep: Vector3D, maxChroma: number): Vector3D;
  toSrgb(rep: Vector3D): ColorResult<Vector3D>;
  fromSrgb(rgb: Vector3D): ColorResult<Vector3D>;
}

export interface RenderMap {
  [key: string]: RenderConfig;
}
