
import { ClientType, ClientFactory, TuClient, /* WebClient,*/ IClient } from "./client";
import * as _ from "lodash";

const factory = ClientFactory.instance;

process.on("message", msg => {
    const { perCpucoreRequests, wsAddress, processer_count, targetTps } = msg;
    const connectionDelay = 1000 / (targetTps / processer_count);
    console.log("worker delay during connections:", connectionDelay, "ms");
    const tu_clients: Array<IClient> = _.range(perCpucoreRequests).map(() => factory.create(ClientType.Tu));
    emitConnections(tu_clients, wsAddress, connectionDelay);
})

async function emitConnections(arr: Array<IClient>, wsAddress: string, connectionDelay: number) {
    for (let i = 0; i < arr.length; ++i) {
        const client = arr[i];
        arr[i].connect(`${wsAddress}?id=${client.id}`);

        await new Promise(resolve => setTimeout(resolve, connectionDelay));
    }
}