import * as cp from "child_process";
import * as os from "os";

const processer_count = os.cpus().length;

for (let i = 0; i < processer_count; ++i) {
    cp.fork("dist/app.js");
}