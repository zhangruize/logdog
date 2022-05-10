export type SettingsFile = {
    varPatterns: {
        id: string;
        regex: string;
    }[];
    linePatterns: {
        inputFormat: string;
        regex?: RegExp;
    }[];
    defaultOutputFormat: string;
    autoInsertLineBreak: boolean;
    warnings: {
        unrecoginizedLine: boolean;
    };
};

export type PatternsFile = {
    patterns: {
        id?: string;
        line: string;
        comment?: string;
        outputFormat?: string;
        regex?: RegExp;
    }[];
};
