
import { ClientType, ClientFactory, IClient } from "./client";
import * as _ from "lodash";
import randomClientId from './utils/id-generator';
import * as SparkMD5 from "spark-md5";
import { getPerItemValue } from "./utils":

const factory = ClientFactory.instance;

const fakeFileMd5Cache = [
    "2f282b84e7e608d5852449ed940bfc51",
    "5b1143c9f8ffa4a5915435c66840e989",
    "69a07a2dbe3a0358f8416dc9fa73d7be",
    "dde1ee3626271ceea05e8c5d8cda97f7",
    "a778b55f315a7aedf842698256c8f426",
    "c180350efd7198c2aa025aee49f75de7",
    "facb20623821399b6a647bcd5da3c500",
    "002f64f4cea1c65641643749ba4eab68",
    "ba1898e3c14611e4213044426574067e",
    "5c496c1870849f7cb11e7110407066f2",
    "5d7a768b255b713c39b24d30893a427d",
    "eaaf0ac60135a5be955966fe5947c503"
]

process.on("message", async msg => {
    const { worker_id, connectionCount, wsAddress, rps, fileSize, speed } = msg;
    const connectionDelay = Math.ceil(1000 / rps);
    const connectionSpeedList = getPerItemValue(speed, connectionCount);

    console.log(`worker ${worker_id} connection count:`, connectionCount);
    console.log(`worker ${worker_id} rps:`, rps);
    console.log(`worker ${worker_id} total speed:`, speed, "byte/s");

    let { filedata, md5 } = fakeFile(worker_id, fileSize);
    console.log(`worker ${worker_id} fake file md5:`, md5);

    const tu_clients = _.range(connectionCount).map(() => factory.create(ClientType.Tu, randomClientId(), { md5 }));

    const web_clients = tu_clients.map((tuc, i) => factory.create(ClientType.Web, "" /* unnecessary */, {
        target: tuc.id,
        data: filedata, md5,
        speed: connectionSpeedList[i],
        showSentLog: i === 0,
        pid: worker_id
    }));

    await registerTuClients(tu_clients, wsAddress, connectionDelay);
    await registerWebClients(web_clients, wsAddress, connectionDelay);

    web_clients.forEach((wc, i) => setTimeout(() => wc.begin(), i * 10));
})

async function registerTuClients(clients: Array<IClient>, wsAddress: string, connectionDelay: number) {
    const tasks: Array<Promise<any>> = [];
    for (let i = 0; i < clients.length; ++i) {
        tasks.push(clients[i].connect(`${wsAddress}/client/wstty`));
        await new Promise(resolve => setTimeout(resolve, connectionDelay));
    }
    await Promise.all(tasks);
}

async function registerWebClients(clients: Array<IClient>, wsAddress: string, connectionDelay: number) {
    const tasks: Array<Promise<any>> = [];
    for (let i = 0; i < clients.length; ++i) {
        tasks.push(clients[i].connect(`${wsAddress}/wstty`));
        await new Promise(resolve => setTimeout(resolve, connectionDelay));
    }
    await Promise.all(tasks);
}

function fakeFile(seed: number, size: number): any {
    const filedata = new ArrayBuffer(size);
    const dataView = new DataView(filedata);
    dataView.setInt32(0, seed);

    const spark = new SparkMD5.ArrayBuffer();
    spark.append(filedata);
    const md5 = spark.end();

    return { filedata, md5 };
}