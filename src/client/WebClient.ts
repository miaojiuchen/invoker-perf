import { IClientProducer, IClient } from "./abstraction";
import * as Websocket from "ws";
const isPlainObject = require("is-plain-object");

const packetSize = 1024 * 1024;

export class WebClient implements IClient {
    readonly id: string;
    ws: Websocket;

    target: string;
    data?: ArrayBuffer;
    md5?: string;

    constructor(id: string, target: string) {
        this.id = id;
        this.target = target;
    }

    begin() {
        this.send({ cmd: "start", byteLength: this.data.byteLength });
    }

    connect(url: string) {
        const ws = new Websocket(url + `?target=${this.target}`);
        ws.on("open", () => { })
        ws.onmessage = this.handleMessage;
        ws.on("error", err => {
            console.error("connected error", err);
        })
        this.ws = ws;
    }

    disconnect() {
        throw new Error("Method not implemented.");
    }

    send(msg: any) {
        this.ws.send(JSON.stringify(msg));
    }

    sendBytes(bytes: ArrayBuffer) {
        this.ws.send(bytes);
    }


    handleMessage = (e: Websocket.MessageEvent) => {
        const msg = e.data;
        if (typeof msg === "string") {
            const payload = JSON.parse(msg);

            const { cmd } = payload;

            if (cmd === "start_ack") {
                console.log("start ack, trasfering data......");
                this.startTransfer();
                return;
            }

            if (cmd === "finish_ack") {
                console.log("receive md5check:", payload.md5check);
                return;
            }
        }
    }

    startTransfer() {
        const packetCount = Math.ceil(this.data.byteLength / packetSize);
        // const dataView = new DataView(this.data)
        for (let i = 0; i < packetCount; ++i) {
            const start = i * packetSize;
            const end = start + packetSize;
            const buf = this.data.slice(start, end);
            console.log("file thrunk size:", buf.byteLength);
            this.sendBytes(buf);
        }
        this.send({ cmd: "finish" });
    }
}

export class WebClientProducer implements IClientProducer {
    create(id: string, options?: any): IClient {
        if (!options.target) {
            throw new Error("You must specify WebClient's target");
        }

        const c = new WebClient(id, options.target)
        if (options.data) {
            c.data = options.data;
            c.md5 = options.md5;
        }

        return c;
    }
}