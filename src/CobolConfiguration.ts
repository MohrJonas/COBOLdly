export type CobolConfiguration = {
    validation: {
        rules: Array<string> | undefined
    } | undefined,
    copybooks: {
        directories: Array<string> | undefined,
        ignoreMissing: Array<string> | boolean | undefined
    } | undefined,
    wow: {
        handles: Array<string> | undefined
    } | undefined,
    file: string
}