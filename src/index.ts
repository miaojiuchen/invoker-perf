import * as cp from "child_process";
import * as os from "os";
import * as path from "path";
import * as yargsParser from "yargs-parser";

var argv = yargsParser(process.argv.slice(2), {
    default: {
        perCpucoreRequests: 2000,
        wsAddress: "ws://192.168.1.149:7788/invoker/client/wstty",
        targetTps: 500
    }
});

const { perCpucoreRequests, wsAddress, targetTps } = argv;
console.log("perCpucoreRequests:", perCpucoreRequests)
console.log("wsAddress:", wsAddress);
console.log("targetTps:", targetTps);

const processer_count = os.cpus().length;

for (let i = 0; i < processer_count; ++i) {
    const child = cp.fork(path.join(__dirname, 'app.js'));
    child.send({ perCpucoreRequests, wsAddress, processer_count, targetTps })
}
