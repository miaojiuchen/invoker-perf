
export interface IClient {
    readonly id: string
    target: string

    connect(url: string)
    disconnect()

    send(msg: any)
}

export interface IClientProducer {
    create(): IClient
}

export enum ClientType {
    Tu,
    Web
}