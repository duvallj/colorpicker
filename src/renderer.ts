import { spawn, Worker, Pool, FunctionThread } from "threads";
import { IDrawable } from "./types";
// @ts-expect-error it don't want .ts
// eslint-disable-next-line import/no-webpack-loader-syntax
import workerUrl from 'threads-plugin/dist/loader?name=worker!./renderer_worker.ts';

export class Renderer implements IDrawable {
    private pool: Pool<FunctionThread>;
    private numWorkers: number;
    private ctx: CanvasRenderingContext2D;
    private img: ImageData;

    private width: number;
    private height: number;

    private drawScheduled: boolean;
    private drawFull: boolean;

    public view: string;

    constructor(canvas: HTMLCanvasElement, numWorkers: number, view: string) {
        this.ctx = canvas.getContext("2d");
        this.pool = Pool(
            () => spawn(new Worker(workerUrl)),
            { size: numWorkers }
        ) as Pool<FunctionThread>;
        this.numWorkers = numWorkers;
        this.view = view;
    }

    public resize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.img = this.ctx.createImageData(width, height);
        this.notifyDrawFull();
    }

    public draw(ctx: CanvasRenderingContext2D, _wFactor: number, _hFactor: number) {
        this.ctx = ctx;
        this.redraw();
    }

    render() {
        createImageBitmap(this.img).then((img) => {
            const ctx = this.ctx;
            const inp = [0.5, 0.5, 0.5];
            const cursorX = inp[0] * this.width;
            const cursorY = (1.0 - inp[1]) * this.height;

            ctx.clearRect(0, 0, this.width, this.height);
            ctx.save();
            ctx.drawImage(img, 0, 0);
            ctx.restore();

            ctx.strokeStyle = "white";
            ctx.beginPath();
            ctx.arc(cursorX, cursorY, 4, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.arc(cursorX, cursorY, 5, 0, 2 * Math.PI);
            ctx.stroke();
        });

        this.drawScheduled = false;
        this.drawFull = false;
    }

    async redraw() {
        if (this.drawScheduled) {
            return;
        }
        this.drawScheduled = true;

        // Synchronise with repaints
        await (new Promise(window.requestAnimationFrame));

        if (this.drawFull) {
            console.time("redraw");
            const inpZ = 0.5;
            const maxChroma = 100;
            const blockHeight = Math.ceil(this.height / this.numWorkers);
            const promises: Promise<void>[] = [];
            for (let yBegin = 0; yBegin < this.height; yBegin += blockHeight) {
                var yEnd = yBegin + blockHeight;
                if (yEnd > this.height) {
                    yEnd = this.height;
                }
                const promise: Promise<void> = ((yBegin, yEnd) => {
                    return this.pool.queue(async renderPortion => {
                        return renderPortion(
                            this.width, this.height, yBegin, yEnd,
                            maxChroma, inpZ, this.view
                        );
                    }).then((result: unknown) => {
                        const data = result as Uint8ClampedArray;
                        this.img.data.set(data, 4 * this.width * yBegin);
                    });
                })(yBegin, yEnd);
                promises.push(promise);
            }

            await Promise.all(promises);
            console.timeEnd("redraw");
        }

        this.render();
    }

    public notifyDrawFull() {
        this.drawFull = true;
    }
}
