# 2026 美国中期选举实时画面

全屏选举画面，结构参照选举夜大屏：倒计时、提前投票地图、参议院 / 众议院 / 州长。

数据：

- 提前票来自 [佛罗里达大学选举实验室](https://election.lab.ufl.edu/early-vote/2026-early-voting/) 的州汇总。党籍是选民登记，不是候选人得票。
- 控院概率和候选人价格来自 [Polymarket](https://polymarket.com/midterms) 成交价。
- 画面约每分钟刷新。连不上时继续显示仓库里的快照。

## 本地

```bash
npm install
npm run dev
```

键盘：`1` 总览，`2` 参议院，`3` 众议院，`4` 州长，`R` 立即刷新。

更新快照：

```bash
node --experimental-strip-types scripts/build-snapshot.mjs
node scripts/build-map.mjs
```
