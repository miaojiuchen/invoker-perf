
import { ClientType, ClientFactory, IClient } from "./client";
import * as _ from "lodash";
import randomClientId from './utils/id-generator';

const factory = ClientFactory.instance;

process.on("message", async msg => {
    const { worker_id, connectionCount, wsAddress, rps } = msg;
    const connectionDelay = Math.ceil(1000 / rps);

    console.log(`worker ${worker_id} connection count:`, connectionCount);
    console.log(`worker ${worker_id} rps:`, rps);
    console.log(`worker ${worker_id} delay during connections:`, connectionDelay, "ms");

    const tu_clients = _.range(connectionCount).map(() => factory.create(ClientType.Tu, randomClientId()));

    const web_clients = tu_clients.map(tuc => factory.create(ClientType.Web, "", { target: tuc.id }));

    await registerTuClients(tu_clients, wsAddress, connectionDelay);
    await registerWebClients(web_clients, wsAddress, connectionDelay);

    web_clients.forEach(wc => {
        const packet = new ArrayBuffer(1024*1024);
        wc.send(packet);
    });
})

async function registerTuClients(clients: Array<IClient>, wsAddress: string, connectionDelay: number) {
    for (let i = 0; i < clients.length; ++i) {
        const client = clients[i];
        clients[i].connect(`${wsAddress}/client/wstty`);

        await new Promise(resolve => setTimeout(resolve, connectionDelay));
    }
}

async function registerWebClients(clients: Array<IClient>, wsAddress: string, connectionDelay: number) {
    for (let i = 0; i < clients.length; ++i) {
        const client = clients[i];
        clients[i].connect(`${wsAddress}/wstty`);

        await new Promise(resolve => setTimeout(resolve, connectionDelay));
    }
}