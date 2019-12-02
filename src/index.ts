import * as cp from "child_process";
import * as os from "os";
import * as path from "path";
import * as yargsParser from "yargs-parser";
import { getPerItemValue } from "./utils";

const mb = 1024 * 1024;

var argv = yargsParser(process.argv.slice(2), {
    default: {
        connectionCount: 1,
        wsAddress: "ws://192.168.1.149:7788/invoker/client/wstty",
        rps: 500,
        fileSize: 100,
        speed: 10, // total network speed limit default 10mb
    }
});

const { connectionCount, wsAddress, rps, speed, fileSize } = argv;
console.log("connectionCount:", connectionCount)
console.log("wsAddress:", wsAddress);
console.log("rps:", rps);
console.log("fileSize:", fileSize);
console.log("speed:", speed);

const processer_count = os.cpus().length;

// 计算均摊到每个核心的 连接数、rps 值
const coreConnectionCountList = getPerItemValue(connectionCount, processer_count);
const coreRpsList = getPerItemValue(rps, processer_count);
const coreSpeedList = getPerItemValue(speed * mb, processer_count);

for (let i = 0; i < processer_count; ++i) {
    if (coreConnectionCountList[i] > 0) {
        const child = cp.fork(path.join(__dirname, 'app.js'));
        child.send({ worker_id: i, connectionCount: coreConnectionCountList[i], wsAddress, rps: coreRpsList[i], fileSize: fileSize * mb, speed: coreSpeedList[i] });
    }
}
