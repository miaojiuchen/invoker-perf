
import { ClientType, ClientFactory, TuClient, /* WebClient,*/ IClient } from "./client";
import * as _ from "lodash";

const factory = ClientFactory.instance;

const tu_clients: Array<IClient> = _.range(5000).map(i => {
    return factory.create(ClientType.Tu);
});

tu_clients.forEach((c: TuClient) => {
    c.connect("ws://localhost:7788/invoker/client/wstty?id="+c.id)
});
console.log("all emitted")

