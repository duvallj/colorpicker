import { rgb as rgbhex } from "ciebase-ts";
import { State, IStateUpdater, ColorSpace } from "./types";
import { VIEWS } from "./display";

export class IntField implements IStateUpdater {
    private label: HTMLLabelElement;
    private input: HTMLInputElement;
    private index: number;

    constructor(labelId: string, inputId: string, index: number) {
        this.label = document.getElementById(labelId) as HTMLLabelElement;
        this.input = document.getElementById(inputId) as HTMLInputElement;
        console.log(inputId);
        console.log(this.input);
        this.index = index;
    }

    register(callback: (u: IStateUpdater) => void): void {
        this.input.addEventListener("change", () => callback(this));
    }
  
    sendUpdate(oldState: State): void {
        oldState.rep[this.index] = this.input.valueAsNumber;
    }

    getUpdate(newState: State): void {
        this.label.innerText = VIEWS[newState.view].fieldNames[this.index];
        this.input.valueAsNumber = newState.rep[this.index];
    }
}

export class Slider implements IStateUpdater {
    private slider: HTMLInputElement;

    constructor(sliderId: string) {
        this.slider = document.getElementById(sliderId) as HTMLInputElement;
        console.log(sliderId);
        console.log(this.slider);
    }
    
    register(callback: (u: IStateUpdater) => void): void {
        this.slider.addEventListener("change", () => callback(this));
    }
    
    sendUpdate(oldState: State): void {
        oldState.rep[0] = this.slider.valueAsNumber;
    }

    getUpdate(newState: State): void {
        this.slider.valueAsNumber = newState.rep[0];
    }
}

export class Swatch implements IStateUpdater {
    private swatch: HTMLDivElement;

    constructor(swatchId: string) {
        this.swatch = document.getElementById(swatchId) as HTMLDivElement;
    }

    register(_callback: (_: IStateUpdater) => void): void {
        // nothing to update
    }

    sendUpdate(_oldState: State): void {
        // never called
    }

    getUpdate(newState: State): void {
        const { val: rgb } = VIEWS[newState.view].toSrgb(newState.rep);
        this.swatch.style.backgroundColor =
            `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }
}

export class HexField implements IStateUpdater {
    private input: HTMLInputElement;

    constructor(inputId: string) {
        this.input = document.getElementById(inputId) as HTMLInputElement;
        console.log(inputId);
        console.log(this.input);
    }
    
    register(callback: (u: IStateUpdater) => void): void {
        this.input.addEventListener("change", () => callback(this));
    }
    
    sendUpdate(oldState: State): void {
        const rgb = rgbhex.fromHex(this.input.value);
        const { val: rep } = VIEWS[oldState.view].fromSrgb(rgb);
        oldState.rep = rep;
    }

    getUpdate(newState: State): void {
        const { val: rgb } = VIEWS[newState.view].toSrgb(newState.rep);
        this.input.value = rgbhex.toHex(rgb);
    }
}

export class StateManager {
    private inputs: IStateUpdater[];
    public state: State;

    constructor() {
        this.inputs = [];
        this.state = {
            view: ColorSpace.LAB,
            rep: [50, 0, 0],
        };
    }

    processUpdate(u: IStateUpdater) {
        u.sendUpdate(this.state);
        for (const other of this.inputs) {
            other.getUpdate(this.state);
        }
    }

    public addInput(u: IStateUpdater) {
        u.register(this.processUpdate);
        this.inputs.push(u);
    }
}
