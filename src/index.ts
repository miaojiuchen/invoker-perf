import * as cp from "child_process";
import * as os from "os";

// const processer_count = os.cpus().length;
const processer_count = 4;

for (let i = 0; i < processer_count; ++i) {
    cp.fork("dist/app.js");
}

// if (cluster.isMaster) {
//     if (!processer_count) {
//         processer_count = os.cpus().length;
//     }

//     for (let i = 0; i < processer_count; ++i) {
//         cluster.fork();
//     }

//     cluster.on('exit', (worker, code, signal) => {
//         console.log(`[worker] ${worker.process.pid} died`);
//     });
// } else {
//     console.log("[fork]", cluster.worker.id);

//     app.start();

//     console.log(`[worker] ${cluster.worker.id} start`);
// }