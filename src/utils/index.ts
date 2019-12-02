

// 均分资源，多余的n个按次序加入前几组
export function getPerItemValue(total: number, count: number): Array<number> {
    const ans = new Array(count);
    const base = Math.floor(total / count);
    let remain = total - base * count;
    let i = 0;
    while (remain != 0) {
        ans[i++] = base + 1;
        remain--;
    }
    while (i < ans.length) {
        ans[i++] = base;
    }
    return ans;
}