import { IClientProducer, IClient } from "./abstraction";

class TuClient implements IClient {

    id: string;
    target: string;

    connect(url: string) {
        throw new Error("Method not implemented.");
    }

    disconnect() {
        throw new Error("Method not implemented.");
    }

    send() {

    }


    type: string;
}


class TuClientProducer implements IClientProducer {
    create(): IClient {
        const c = new TuClient();

        c.type = "tu";

        return c;
    }
}

export default TuClientProducer;