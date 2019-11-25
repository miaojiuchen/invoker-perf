import { IClientProducer, IClient } from "./abstraction";
import randomClientId from "../utils/id-generator";
import * as Websocket from "ws";

export class TuClient implements IClient {
    id: string;
    target: string;

    connect(url: string) {
        const ws = new Websocket(url);
        ws.on("open", () => {
            // console.log("connected " + this.id);
        })
        ws.onmessage = function (msg) {
            console.log(msg);
        };
        ws.on("error", err => {
            console.log("connected error", err);
        })
        this.ws = ws;
    }

    disconnect() {
        throw new Error("Method not implemented.");
    }

    send() {

    }

    constructor(id: string) {
        this.id = id
    }

    type: string;
    ws: Websocket;
}


export class TuClientProducer implements IClientProducer {
    create(): IClient {
        const id = randomClientId();

        const c = new TuClient(id);

        c.type = "tu";

        return c;
    }
}