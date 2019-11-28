import * as cp from "child_process";
import * as os from "os";
import * as path from "path";
import * as yargsParser from "yargs-parser";

var argv = yargsParser(process.argv.slice(2), {
    default: {
        connectionCount: 10000,
        wsAddress: "ws://192.168.1.149:7788/invoker/client/wstty",
        rps: 500
    }
});

const { connectionCount, wsAddress, rps } = argv;
console.log("connectionCount:", connectionCount)
console.log("wsAddress:", wsAddress);
console.log("rps:", rps);

const processer_count = os.cpus().length;

// 计算均摊到每个核心的 连接数、rps 值
const coreConnectionCountList = getPerCoreValue(connectionCount, processer_count);
const coreRpsList = getPerCoreValue(rps, processer_count);

for (let i = 0; i < processer_count; ++i) {
    if(coreConnectionCountList[i] > 0) {
        const child = cp.fork(path.join(__dirname, 'app.js'));
        child.send({ worker_id: i, connectionCount: coreConnectionCountList[i], wsAddress, rps: coreRpsList[i] });
    }
}

function getPerCoreValue(total: number, coreCount: number): Array<number> {
    const ans = new Array(coreCount);
    const base = Math.floor(total / coreCount);
    let remain = total - base * coreCount;
    let i = 0;
    while (remain != 0) {
        ans[i++] = base + 1;
        remain--;
    }
    while (i < ans.length) {
        ans[i++] = base;
    }
    return ans;
}