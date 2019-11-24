import TuClientProducer from "./TuClient";
// import WebClientProducer from "./WebClient";

import { ClientType, IClient, IClientProducer } from "./abstraction";

class ClientFactory {
    private static _instance: ClientFactory;
    private clientTypeMapper: Map<ClientType, IClientProducer>;

    constructor() {
        this.clientTypeMapper.set(ClientType.Tu, new TuClientProducer());
        // this.clientTypeMapper.set(ClientType.Web, new WebClientProducer());
    }

    public static get instance() {
        if (!this._instance) {
            this._instance = new ClientFactory();
        }

        return this._instance;
    }

    create(type: ClientType): IClient {
        if (this.clientTypeMapper.has(type)) {
            return this.clientTypeMapper.get(type).create();
        }

        throw new Error("unknown client type");
    }
}

export {
    
    ClientType, 

    IClient, 
    IClientProducer,

    ClientFactory,
}