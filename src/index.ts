import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { exit } from 'process';
import * as readline from 'readline';
import { SettingsFile, PatternsFile } from './types';

let inject = (str: string, obj: any) => str.replace(/\${(.*?)}/g, (x, g) => obj[g]);

function prepareSettings(settingsFile: SettingsFile) {
    let varEnv: { [index: string]: string; } = {};
    settingsFile.varPatterns.forEach(vp => {
        varEnv[vp.id] = `(${vp.regex})`;
    });
    settingsFile.linePatterns.forEach((lp: any) => {
        lp.regex = new RegExp(inject(lp.inputFormat, varEnv));
    });
    return settingsFile;
}

function preparePatterns(patternsFile: PatternsFile) {
    patternsFile.patterns.forEach(p => {
        if (p.line) {
            p.regex = new RegExp(p.line);
        } else {
            console.warn("Not a valid pattern:", p);
        }
    });
}

let settings = JSON.parse(fs.readFileSync(path.resolve(__dirname, "settings.json"), { encoding: "utf-8" })) as SettingsFile;
prepareSettings(settings);

let patternFilePath: string | undefined = undefined;
process.argv.forEach(function (val) {
    if (val.startsWith("-p=")) {
        patternFilePath = val.substring(val.indexOf('=') + 1);
    }
});

if (!patternFilePath) {
    console.error("No valid pattern file. Please specific pattern file by: '-p=your_pattern.json'");
    exit();
}

let userPatterns = JSON.parse(fs.readFileSync(path.resolve(patternFilePath), { encoding: "utf-8" })) as PatternsFile;
preparePatterns(userPatterns);
if (!userPatterns.patterns || !Array.isArray(userPatterns.patterns) || userPatterns.patterns.length <= 0) {
    console.error("No valid pattern file. Please specific pattern file by: '-p=your_pattern.json'");
    exit();
}

let input = process.stdin;
let output = process.stdout;

let rl = readline.createInterface({
    input,
    output,
});

let env: { [index: string]: any; } = {};
rl.on("line", line => {
    let lineEnv: { [index: string]: any; } = { line };
    let matchedPattern = settings.linePatterns.find(linePattern => {
        if (linePattern.regex && linePattern.regex.test(line)) {
            let results = linePattern.regex.exec(line);
            if (results != null) {
                let i = 1;
                linePattern.inputFormat.replace(/\${(.*?)}/g, (x, g) => i < results!.length ? lineEnv[g] = results![i++] : "");
                lineEnv.time = new Date(2000, parseInt(lineEnv['month']), parseInt(lineEnv['day']), parseInt(lineEnv['hours']),
                    parseInt(lineEnv['minutes']), parseInt(lineEnv['seconds']), parseInt(lineEnv['ms']));
                return true;
            }
        }
    });

    let matchedUserPatternId: string | undefined = undefined;
    if (matchedPattern) {
        let matchedUserPattern = userPatterns.patterns.find(p => {
            if (p.regex && p.regex.test(line)) {
                // prepare user pattern var env.
                let userEnv: any = {};
                if (p.comment) {
                    userEnv.comment = p.comment;
                }
                Object.entries(env).forEach(entry => {
                    if (entry[0].endsWith("-time")) {
                        (userEnv as any)[entry[0] + 'diff'] = lineEnv['time'] - entry[1];
                    }
                });
                let outputFormat = p.outputFormat ? p.outputFormat : settings.defaultOutputFormat;
                if (settings.autoInsertLineBreak) {
                    outputFormat += "\n";
                }
                output.write(inject(outputFormat, Object.assign(userEnv, lineEnv, env)));
                return true;
            }
        });

        if (matchedUserPattern) {
            matchedUserPatternId = matchedUserPattern.id;

            Object.entries(lineEnv).forEach(entry => {
                env[`last-line-${entry[0]}`] = entry[1];
                if (matchedUserPatternId) {
                    env[`last-${matchedUserPatternId}-${entry[0]}`] = entry[1];
                }
            });
        }
    } else {
        if (settings.warnings.unrecoginizedLine) {
            console.warn(`No pattern matched for line: ${line}`);
        }
    }
});