import { find } from 'lodash';
import { EOL } from 'os';
import { commands, Diagnostic, DocumentSymbol, ExtensionContext, extensions, Hover, languages, MarkdownString, ProviderResult, TextDocument, window, workspace } from 'vscode';
import Group from './processing/data/Group';
import Table from './processing/data/Table';
import Variable from './processing/data/Variable';
import Program from './processing/Program';

let program: Program | undefined;

export function activate(context: ExtensionContext) {
    languages.registerHoverProvider("COBOL", {
        provideHover(document, position, token): ProviderResult<Hover> {
            const variables = program?.programId?.dataDivision?.workingStorageSection?.variables;
            const sections = program?.programId?.procedureDivision?.sections;
            const hoveredWord = document.getWordRangeAtPosition(position);
            if (!variables || !hoveredWord || !hoveredWord.isSingleLine) {
                return undefined;
            }
            const variable = find(variables, (variable) => {
                const hoveredText = document.getText(hoveredWord);
                return variable.name === hoveredText;
            });
            const section = find(sections, (section) => {
                const hoveredText = document.getText(hoveredWord);
                return section.name === hoveredText;
            });
            const contents: Array<MarkdownString> = [];
            if (variable) {
                let prettifiedLevel: string = "";
                if (variable.level) {
                    prettifiedLevel = variable.level < 10 ? `0${variable.level}` : variable.level.toString();
                }
                if (variable instanceof Table) {
                    contents.push(new MarkdownString(`$(symbol-field) ${prettifiedLevel} ${variable.name} ($(array) *${variable.occurs})`, true));
                }
                else if (variable instanceof Group) {
                    contents.push(new MarkdownString(`$(symbol-field) ${prettifiedLevel} ${variable.name} ($(type-hierarchy-sub) +${variable.children.length})`, true));
                }
                else if (variable instanceof Variable) {
                    contents.push(new MarkdownString(`$(symbol-field) ${prettifiedLevel} ${variable.name} ${variable.type}`, true));
                }
            }
            if (section) {
                contents.push(new MarkdownString(`$(symbol-method) ${section.name}`, true));
            }
            return contents.length === 0 ? undefined : { contents: contents };
        },
    });
    if (!workspace.workspaceFolders) {
        window.showWarningMessage("No workspace folder open, only minimal highlighting is supported");
    }
    if (extensions.getExtension("bitlang.cobol")) {
        const diagnostics = languages.createDiagnosticCollection("COBOLdly");
        context.subscriptions.push(window.onDidChangeActiveTextEditor((editor) => {
            if (editor?.document && editor?.document?.languageId === "COBOL") {
                parseDocument(editor.document).then((diagnostic) => { diagnostics.set(editor.document.uri, diagnostic); });
            }
        }));
        context.subscriptions.push(workspace.onDidChangeTextDocument((document) => {
            if (document.document.languageId === "COBOL") {
                parseDocument(document.document).then((diagnostic) => { diagnostics.set(document.document.uri, diagnostic); });
            }
        }));
        context.subscriptions.push(
            workspace.onDidOpenTextDocument((document) => {
                if (document.languageId === "COBOL") {
                    parseDocument(document).then((diagnostic) => { diagnostics.set(document.uri, diagnostic); });
                }
            })
        );
        context.subscriptions.push(
            workspace.onDidCloseTextDocument((document) => {
                diagnostics.set(document.uri, undefined);
            })
        );
        if (window.activeTextEditor && window.activeTextEditor.document && window.activeTextEditor.document.languageId === "COBOL") {
            parseDocument(window.activeTextEditor.document).then((diagnostic) => { diagnostics.set(window.activeTextEditor!.document.uri, diagnostic); });
        }
    }
    else {
        window.showErrorMessage("COBOLdly didn't find the extension bitlang.cobol, which is required");
    }
}

async function parseDocument(document: TextDocument): Promise<Array<Diagnostic>> {
    const symbols = await commands.executeCommand<Array<DocumentSymbol>>("vscode.executeDocumentSymbolProvider", document.uri);
    program = new Program(symbols, document);
    const lines = document.getText().split(EOL);
    const diagnostics = program.parse();
    return diagnostics.filter((diagnostic) => { return !lines[diagnostic.range.start.line].includes("*> @cbl-ignore"); });
}

export function deactivate() { }