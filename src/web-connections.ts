import * as WebSocket from "ws";

console.log(WebSocket.Server);
const invokerWSEndpoint = "ws://localhost:7788/invoker";

const ws = new WebSocket(invokerWSEndpoint, { perMessageDeflate: false });

