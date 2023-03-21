export function trimMultipleWhitespaces(toTrim: string): string {
    return toTrim.replace(/\s{2,}/g, " ");
}