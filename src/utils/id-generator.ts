// 生成随机id
import * as uuid from "uuid";

export default function randomClientId(): string {
    return uuid.v4();
}