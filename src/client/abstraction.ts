
export interface IClient {
    readonly id: string

    connect(url: string)
    disconnect()

    begin()
}

export interface IClientProducer {
    create(id: string, args: any): IClient
}

export enum ClientType {
    Tu,
    Web
}