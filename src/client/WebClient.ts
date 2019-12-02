import { IClientProducer, IClient } from "./abstraction";
import * as Websocket from "ws";
import { getPerItemValue } from "../utils";
import * as _ from "lodash";

export class WebClient implements IClient {
    readonly id: string;
    ws: Websocket;

    target: string;
    data?: ArrayBuffer;
    md5?: string;
    speed?: number; // byte send per second

    showSentLog: boolean;
    pid: number;

    constructor(id: string, target: string) {
        this.id = id;
        this.target = target;
    }

    begin = () => {
        this.send({ cmd: "start", byteLength: this.data.byteLength });
    }

    connect = async (url: string) => {
        await new Promise((resolve, reject) => {
            const ws = new Websocket(url + `?target=${this.target}`);
            ws.on("open", () => { resolve(); })
            ws.onmessage = this.handleMessage;
            ws.on("error", err => {
                console.error("connected error", err);
                reject(err);
            })
            this.ws = ws;
        });
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
            try {
                const payload = JSON.parse(msg);

                const { cmd } = payload;

                if (cmd === "start_ack") {
                    // console.log("start ack, trasfering data......");
                    this.startTransfer();
                    return;
                }

                if (cmd === "finish_ack") {
                    console.log("receive md5check:", payload.md5check);
                    return;
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    startTransfer = async () => {
        const packetSize = this.speed;
        const packetCount = Math.ceil(this.data.byteLength / packetSize);

        let i = 0;
        let ticker_print;
        if (this.showSentLog) {
            ticker_print = setInterval(() => { console.log(`worker ${this.pid} packet sent: ${i}/${packetCount}`); }, 5000);
        }

        const ticker = setInterval(() => {
            if (i >= packetCount) {
                this.send({ cmd: "finish" });
                ticker && clearInterval(ticker);
                ticker_print && clearInterval(ticker_print);
                return;
            }
            const start = i * packetSize;
            const end = start + packetSize;
            const buf = this.data.slice(start, end);
            this.sendBytes(buf);
            i++;
        }, 1000)
    }
}

export class WebClientProducer implements IClientProducer {
    create(id: string, options?: any): IClient {
        if (!options.target) {
            throw new Error("You must specify WebClient's target");
        }

        const c = new WebClient(id, options.target)
        c.data = options.data;
        c.md5 = options.md5;
        c.speed = options.speed;
        c.showSentLog = !!options.showSentLog;
        c.pid = options.pid;

        return c;
    }
}