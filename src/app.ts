
import { ClientType, ClientFactory, IClient } from "./client";
import * as _ from "lodash";
import randomClientId from './utils/id-generator';
import * as SparkMD5 from "spark-md5";

const factory = ClientFactory.instance;

process.on("message", async msg => {
    const { worker_id, connectionCount, wsAddress, rps } = msg;
    const connectionDelay = Math.ceil(1000 / rps);

    console.log(`worker ${worker_id} connection count:`, connectionCount);
    console.log(`worker ${worker_id} rps:`, rps);
    console.log(`worker ${worker_id} delay during connections:`, connectionDelay, "ms");

    const { filedata, md5 } = fakeFile(worker_id);
    console.log(`worker ${worker_id} fake file md5:`, md5);

    const tu_clients = _.range(connectionCount).map(() => factory.create(ClientType.Tu, randomClientId(), { md5 }));

    const web_clients = tu_clients.map(tuc => factory.create(ClientType.Web, "", { target: tuc.id, data: filedata, md5 }));

    await registerTuClients(tu_clients, wsAddress, connectionDelay);
    await registerWebClients(web_clients, wsAddress, connectionDelay);

    web_clients.forEach(wc => wc.begin());
})

async function registerTuClients(clients: Array<IClient>, wsAddress: string, connectionDelay: number) {
    for (let i = 0; i < clients.length; ++i) {
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

function fakeFile(seed: number): any {
    const filedata = new ArrayBuffer(10 * 1024 * 1024); // 100mb
    const dataView = new DataView(filedata);
    for (let i = 0; i < dataView.byteLength; ++i) {
        dataView.setUint8(i, (i + seed) % 10);
    }
    const spark = new SparkMD5.ArrayBuffer();
    spark.append(filedata);
    const md5 = spark.end();

    return { filedata, md5 };
}