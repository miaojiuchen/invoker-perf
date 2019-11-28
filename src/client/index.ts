
import { ClientType, IClient, IClientProducer } from "./abstraction";
import { TuClient, TuClientProducer } from "./TuClient";
import { WebClient, WebClientProducer } from "./WebClient";

class ClientFactory {
    private static _instance: ClientFactory;
    private clientTypeMapper: Map<ClientType, IClientProducer>;

    constructor() {
        this.clientTypeMapper = new Map<ClientType, IClientProducer>();
        this.clientTypeMapper.set(ClientType.Tu, new TuClientProducer());
        this.clientTypeMapper.set(ClientType.Web, new WebClientProducer());
    }

    public static get instance() {
        if (!this._instance) {
            this._instance = new ClientFactory();
        }

        return this._instance;
    }

    create(type: ClientType, id: string, options?: any): IClient {
        if (this.clientTypeMapper.has(type)) {
            return this.clientTypeMapper.get(type).create(id, options);
        }

        throw new Error("unknown client type");
    }
}

export {
    ClientType,

    IClient,
    IClientProducer,

    ClientFactory,

    TuClient,
    WebClient
}