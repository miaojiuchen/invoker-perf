
import { ClientType, ClientFactory } from "./client";
import * as _ from "lodash";

export function start() {
    const factory = ClientFactory.instance;

    const tu_clients = _.range(10000).map(i => {
        const client = factory.create(ClientType.Tu);

        return client;
    });
}

