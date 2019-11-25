
import { ClientType, ClientFactory, TuClient, /* WebClient,*/ IClient } from "./client";
import * as _ from "lodash";
import * as os from "os";

const factory = ClientFactory.instance;

const tu_clients: Array<IClient> = _.range(1666).map(i => {
    return factory.create(ClientType.Tu);
});

const processer_count = os.cpus().length;
const targetTPS = 500;
const connectionDelay = 1000 / (targetTPS / processer_count);
console.log("worker delay during connections:", connectionDelay, "ms");

async function tps(arr: Array<IClient>) {
    for (let i = 0; i < arr.length; ++i) {
        const client = arr[i];
        arr[i].connect("ws://localhost:7788/invoker/client/wstty?id=" + client.id)
        await new Promise(resolve => setTimeout(resolve, connectionDelay));
    }
}

tps(tu_clients);
