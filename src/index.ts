import * as cluster from 'cluster';
import * as os from 'os';
import config from './config';
import * as app from "./app";

let { processer_count } = config;

if (cluster.isMaster) {
    if (!processer_count) {
        processer_count = os.cpus().length;
    }

    for (let i = 0; i < processer_count; ++i) {
        cluster.fork();
    }

    cluster.on('fork', worker => {
        console.log("[fork]", worker.id);

        app.start();

        console.log(`[worker] ${worker.id} start`);
    });

    cluster.on('exit', (worker, code, signal) => {
        console.log(`[worker] ${worker.process.pid} died`);
    });
}