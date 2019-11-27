
export interface IClient {
    readonly id: string

    connect(url: string)
    disconnect()
    send(msg: string | ArrayBuffer)
}

export interface IClientProducer {
    create(id: string, args: any): IClient
}

export enum ClientType {
    Tu,
    Web
}