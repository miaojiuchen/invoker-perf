import { IClientProducer, IClient } from "./abstraction";
import * as Websocket from "ws";

export class WebClient implements IClient {
    readonly id: string;
    ws: Websocket;

    target: string;

    constructor(id: string, target: string) {
        this.id = id;
        this.target = target;
    }

    connect(url: string) {
        const ws = new Websocket(url + `?target=${this.target}`);
        ws.on("open", () => {
            
        })
        ws.onmessage = this.handleMessage;
        ws.on("error", err => {
            console.log("connected error", err);
        })
        this.ws = ws;
    }

    disconnect() {
        throw new Error("Method not implemented.");
    }

    send(msg: string | ArrayBuffer) {
        this.ws.send(msg);
    }

    handleMessage(msg: Websocket.MessageEvent) {
        if (msg.data instanceof ArrayBuffer) {
            console.log(msg.data);
        }
        else if (typeof msg.data === "string") {
            console.log(msg.data);
        }
    }
}

export class WebClientProducer implements IClientProducer {
    create(id: string, args: any): IClient {
        if (!args.target) {
            throw new Error("You must specify WebClient's target");
        }
        return new WebClient(id, args.target);
    }
}