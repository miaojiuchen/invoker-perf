import { IClientProducer, IClient } from "./abstraction";
import * as Websocket from "ws";
import * as _ from "lodash";
import * as SparkMD5 from "spark-md5";

export class TuClient implements IClient {
    readonly id: string;
    ws: Websocket;

    md5?: string;
    size?: number;
    dataReceiver: Array<ArrayBuffer>;

    constructor(id: string) {
        this.id = id
    }

    begin() {
        throw new Error("Method not implemented.");
    }

    connect(url: string) {
        const ws = new Websocket(url + `?id=${this.id}`);
        ws.on("open", () => { });
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
        if (msg instanceof Buffer) {
            this.dataReceiver.push(msg);
        }
        else if (typeof msg === "string") {
            const payload = JSON.parse(msg);
            const { cmd } = payload;
            if (cmd === "start") {
                const byteLength = parseInt(payload.byteLength);
                this.dataReceiver = [];
                this.size = byteLength;
                this.send({ cmd: "start_ack" });
                return;
            }

            if (cmd === "finish") {
                const correct = this.handleFinish();
                this.send({ cmd: "finish_ack", md5check: correct });
                return;
            }
        } else {
            console.log("unrecognized message:", msg);
        }
    }

    handleFinish(): boolean {
        const spark = new SparkMD5.ArrayBuffer();
        this.dataReceiver.forEach(ar => spark.append(ar));
        const md5 = spark.end()
        console.log("md5check:", md5, this.md5);
        return md5 === this.md5;
    }
}

export class TuClientProducer implements IClientProducer {
    create(id: string, options?: any): IClient {
        const c = new TuClient(id)
        c.md5 = options.md5;
        return c;
    }
}