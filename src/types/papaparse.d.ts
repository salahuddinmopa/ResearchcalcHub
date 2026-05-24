// Declarations for external modules without TypeScript types
declare module 'papaparse' {
  interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: any;
  }
  interface ParseConfig<T> {
    header?: boolean;
    dynamicTyping?: boolean;
    skipEmptyLines?: boolean;
    complete?: (result: ParseResult<T>) => void;
    error?: (error: any) => void;
  }
  export function parse<T = any>(file: File | string, config: ParseConfig<T>): void;
  export default { parse };
}
