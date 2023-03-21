import { EOL } from "os";
import { listenerCount } from "process";
import { Diagnostic, DiagnosticSeverity, DocumentSymbol } from "vscode";
import NotNullArray from "../utils/NotNullArray";
import { trimMultipleWhitespaces } from "../utils/Utils";
import Division from "./Division";
import Parsable from "./Parsable";
import ProcedureSection from "./procedure/ProcedureSection";
import Section from "./Section";
import { ConfigurationSection, FileSection, InputOutputSection, LinkageSection, LocalStorageSection, WorkingStorageSection } from "./Sections";

export class IdentificationDivision extends Division implements Parsable<DocumentSymbol> {

    parse(t: DocumentSymbol): Diagnostic[] {
        return [];
    }

}

export class EnvironmentDivision extends Division implements Parsable<DocumentSymbol> {

    configurationSection: ConfigurationSection | undefined;
    inputOutputSection: InputOutputSection | undefined;

    parse(symbol: DocumentSymbol): Diagnostic[] {
        const diagnostics = new NotNullArray<Array<Diagnostic>>();
        symbol.children.map((symbol) => {
            const trimmedName = trimMultipleWhitespaces(symbol.name);
            if (/configuration section/i.test(trimmedName)) {
                if (this.configurationSection) {
                    diagnostics.push([new Diagnostic(
                        symbol.range,
                        `Duplicate section ${trimmedName}`,
                        DiagnosticSeverity.Error
                    )]);
                }
                else {
                    this.configurationSection = new ConfigurationSection(this.program);
                    diagnostics.push(this.configurationSection.parse(symbol));
                }
            }
            else if (/input\-output section/i.test(trimmedName)) {
                if (this.inputOutputSection) {
                    diagnostics.push([new Diagnostic(
                        symbol.range,
                        `Duplicate section ${trimmedName}`,
                        DiagnosticSeverity.Error
                    )]);
                }
                else {
                    this.inputOutputSection = new InputOutputSection(this.program);
                    diagnostics.push(this.inputOutputSection.parse(symbol));
                }
            }
            else {
                diagnostics.push([new Diagnostic(
                    symbol.range,
                    `Unexpected section ${trimmedName}`,
                    DiagnosticSeverity.Error
                )]);
            }
        });
        return diagnostics.asArray().flat();
    }
}

export class DataDivision extends Division implements Parsable<DocumentSymbol> {

    workingStorageSection: WorkingStorageSection | undefined;
    localStorageSection: LocalStorageSection | undefined;
    linkageSection: LinkageSection | undefined;
    fileSection: FileSection | undefined;

    parse(symbol: DocumentSymbol): Diagnostic[] {
        const diagnostics = new NotNullArray<Array<Diagnostic>>();
        symbol.children.map((symbol) => {
            const trimmedName = trimMultipleWhitespaces(symbol.name);
            if (/working\-storage section/i.test(trimmedName)) {
                if (this.workingStorageSection) {
                    diagnostics.push([new Diagnostic(
                        symbol.range,
                        `Duplicate section ${trimmedName}`,
                        DiagnosticSeverity.Error
                    )]);
                }
                else {
                    this.workingStorageSection = new WorkingStorageSection(this.program);
                    diagnostics.push(this.workingStorageSection.parse(symbol));
                }
            }
            else if (/local\-output section/i.test(trimmedName)) {
                if (this.localStorageSection) {
                    diagnostics.push([new Diagnostic(
                        symbol.range,
                        `Duplicate section ${trimmedName}`,
                        DiagnosticSeverity.Error
                    )]);
                }
                else {
                    this.localStorageSection = new LocalStorageSection(this.program);
                    diagnostics.push(this.localStorageSection.parse(symbol));
                }
            }
            else if (/linkage section/i.test(trimmedName)) {
                if (this.linkageSection) {
                    diagnostics.push([new Diagnostic(
                        symbol.range,
                        `Duplicate section ${trimmedName}`,
                        DiagnosticSeverity.Error
                    )]);
                }
                else {
                    this.linkageSection = new LinkageSection(this.program);
                    diagnostics.push(this.linkageSection.parse(symbol));
                }
            }
            else if (/file section/i.test(trimmedName)) {
                if (this.fileSection) {
                    diagnostics.push([new Diagnostic(
                        symbol.range,
                        `Duplicate section ${trimmedName}`,
                        DiagnosticSeverity.Error
                    )]);
                }
                else {
                    this.fileSection = new FileSection(this.program);
                    diagnostics.push(this.fileSection.parse(symbol));
                }
            }
            else {
                diagnostics.push([new Diagnostic(
                    symbol.range,
                    `Unexpected section ${trimmedName}`,
                    DiagnosticSeverity.Error
                )]);
            }
        });
        return diagnostics.asArray().flat();
    }
}

export class ProcedureDivision extends Division implements Parsable<DocumentSymbol> {

    sections: Array<ProcedureSection> = [];

    parse(symbol: DocumentSymbol): Diagnostic[] {
        const lines = this.program.document.getText().split(EOL);
        symbol.children.forEach((child) => {
            const section = new ProcedureSection(this.program);
            section.name = child.name;
            let i = 0;
            while(true) {
                const line = lines[child.range.start.line - 1 - i]?.trimStart();
                if(!line || !line.startsWith("*")) {
                    break;
                }
                if(line.startsWith("*")) {
                    section.annotations.push(trimMultipleWhitespaces(line.substring(1).trim()));
                }
                i++;
            }
            this.sections.push(section);
        });
        return [];
    }
}