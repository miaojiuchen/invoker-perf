import { IClientProducer, IClient } from "./abstraction";
import * as Websocket from "ws";

export class TuClient implements IClient {
    readonly id: string;
    ws: Websocket;
    
    constructor(id: string) {
        this.id = id
    }

    connect(url: string) {
        const ws = new Websocket(url+`?id=${this.id}`);
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
            this.send("world!");
        }
    }
}

export class TuClientProducer implements IClientProducer {
    create(id: string): IClient {
        return new TuClient(id);
    }
}