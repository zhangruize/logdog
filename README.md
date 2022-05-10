logdog 是一个试图简化日志分析的工具。

## Install

`tnpm install -g logdog`

## Usage

- `logdog patterns` 查看所有的 pattern。
- `logdog yourlog -p yourpattern`

## Pattern

| 字段         | 必填/可选 | 说明                                         |
| ------------ | --------- | -------------------------------------------- |
| id           | 可选      | 标识该 Pattern，可在`outputFormat`中间接引用 |
| line         | 可选      | 对整行进行正则匹配                           |
| comment      | 可选      | 备注说明，可在`outputFormat`中间接引用       |
| outputFormat | 可选      | 输出格式，默认`${line}`。                    |

其中`outputFormat`配置项可以引用一些环境变量，包括：

| 环境变量               | 说明                                                                       |
| ---------------------- | -------------------------------------------------------------------------- |
| id                     | 该 Pattern 的 id                                                           |
| line                   | 整行内容                                                                   |
| content                | 除了日志日期、标签、级别的行内容                                           |
| tag                    | 日志标签（不建议依赖）                                                     |
| level                  | 日志级别（不建议依赖）                                                     |
| month                  | 日志中的月份                                                               |
| day                    | 日志中的日                                                                 |
| hours                  | 日志中的小时                                                               |
| minutes                | 日志中的分钟                                                               |
| seconds                | 日志中的秒                                                                 |
| ms                     | 日志中的毫秒                                                               |
| timediff               | 和当前行的日期差(取反），单位 ms                                           |
| last-\[id\|line]-{...} | 查询上一个指定 id 匹配项，或查询上一行的上述字段。比如：last-line-timediff |
