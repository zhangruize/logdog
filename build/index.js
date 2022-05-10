"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const process = __importStar(require("process"));
const process_1 = require("process");
const readline = __importStar(require("readline"));
let inject = (str, obj) => str.replace(/\${(.*?)}/g, (x, g) => obj[g]);
function prepareSettings(settingsFile) {
    let varEnv = {};
    settingsFile.varPatterns.forEach(vp => {
        varEnv[vp.id] = `(${vp.regex})`;
    });
    settingsFile.linePatterns.forEach((lp) => {
        lp.regex = new RegExp(inject(lp.inputFormat, varEnv));
    });
    return settingsFile;
}
function preparePatterns(patternsFile) {
    patternsFile.patterns.forEach(p => {
        if (p.line) {
            p.regex = new RegExp(p.line);
        }
        else {
            console.warn("Not a valid pattern:", p);
        }
    });
}
let settings = JSON.parse(fs.readFileSync(path.resolve(__dirname, "settings.json"), { encoding: "utf-8" }));
prepareSettings(settings);
let patternFilePath = undefined;
process.argv.forEach(function (val) {
    if (val.startsWith("-p=")) {
        patternFilePath = val.substring(val.indexOf('=') + 1);
    }
});
if (!patternFilePath) {
    console.error("No valid pattern file. Please specific pattern file by: '-p=your_pattern.json'");
    (0, process_1.exit)();
}
let userPatterns = JSON.parse(fs.readFileSync(path.resolve("./", patternFilePath), { encoding: "utf-8" }));
preparePatterns(userPatterns);
if (!userPatterns.patterns || !Array.isArray(userPatterns.patterns) || userPatterns.patterns.length <= 0) {
    console.error("No valid pattern file. Please specific pattern file by: '-p=your_pattern.json'");
    (0, process_1.exit)();
}
let input = process.stdin;
let output = process.stdout;
let rl = readline.createInterface({
    input,
    output,
});
let env = {};
rl.on("line", line => {
    let lineEnv = { line };
    let matchedPattern = settings.linePatterns.find(linePattern => {
        if (linePattern.regex && linePattern.regex.test(line)) {
            let results = linePattern.regex.exec(line);
            if (results != null) {
                let i = 1;
                linePattern.inputFormat.replace(/\${(.*?)}/g, (x, g) => i < results.length ? lineEnv[g] = results[i++] : "");
                lineEnv.time = new Date(2000, parseInt(lineEnv['month']), parseInt(lineEnv['day']), parseInt(lineEnv['hours']), parseInt(lineEnv['minutes']), parseInt(lineEnv['seconds']), parseInt(lineEnv['ms']));
                return true;
            }
        }
    });
    let matchedUserPatternId = undefined;
    if (matchedPattern) {
        let matchedUserPattern = userPatterns.patterns.find(p => {
            if (p.regex && p.regex.test(line)) {
                // prepare user pattern var env.
                let userEnv = {};
                if (p.comment) {
                    userEnv.comment = p.comment;
                }
                Object.entries(env).forEach(entry => {
                    if (entry[0].endsWith("-time")) {
                        userEnv[entry[0] + 'diff'] = lineEnv['time'] - entry[1];
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
    }
    else {
        if (settings.warnings.unrecoginizedLine) {
            console.warn(`No pattern matched for line: ${line}`);
        }
    }
});
