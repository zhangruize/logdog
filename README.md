Parse input lines using custom patterns and output more readable and helpful lines.

## Install

`npm install -g linecat`

## Usage

- `linecat -p=pattern_path`

pattern_path is the custom pattern json file. Example patterns json files are listed in src/example-patterns.

## Pattern json file

| field        | require | note                                                                       |
| ------------ | ------- | -------------------------------------------------------------------------- |
| id           | no      | the id of current pattern, which can be referenced in `outputFormat` field |
| line         | no      | regular expression for whole line content                                  |
| outputFormat | no      | specific output line format. Available env variables are listed below.     |

Many env variables are available in `outputFormat` field:

| Env var name           | note                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| id                     | current pattern id                                                                              |
| line                   | whole line                                                                                      |
| content                | whole line except other tokens                                                                  |
| level                  | log level if available                                                                          |
| month                  | month of current line if available                                                              |
| day                    | date of current line if available                                                               |
| hours                  | hours of current line if available                                                              |
| minutes                | minute of current line if available                                                             |
| seconds                | seconds of current line if available                                                            |
| ms                     | ms of current line if avaiilable                                                                |
| timediff               | time diff from current line.                                                                    |
| last-\[id\|line]-{...} | last matched line of specific id or any matched line for fields above. eg: `last-line-timediff` |

You can also check example patterns in `src/example-patterns` to know more usage.