import ts = require('typescript')
import { TsFileMap } from './ts-file-map'

export interface Result<T> {
  result: T | null
  errors: string[]
}

export class LanguageService {
  private files = new TsFileMap()
  private tsService: ts.LanguageService

  constructor (rootFileNames: string[], private options: ts.CompilerOptions) {
    rootFileNames.forEach(file => {
      this.files.updateFile(file)
    })

    const serviceHost = this.makeServiceHost(options)
    this.tsService = ts.createLanguageService(serviceHost, ts.createDocumentRegistry())
  }

  updateFile (fileName: string): void {
    this.files.updateFile(fileName)
  }

  getVueFile(fileName: string): string | undefined {
    return this.files.getVueFile(fileName)
  }

  hasFile(fileName: string): boolean {
    return this.files.hasFile(fileName)
  }

  unlinkFile(fileName: string): void {
    this.files.unlinkFile(fileName)
  }

  getDts (fileName: string): Result<string> {
    fileName = normalize(fileName)

    // Unsupported files or not found
    if (!this.files.canEmit(fileName)) {
      return {
        result: null,
        errors: []
      }
    }

    const output = this.tsService.getEmitOutput(fileName, true)

    if (!output.emitSkipped) {
      const result = output.outputFiles
        .filter(file => /\.d\.ts$/.test(file.name))[0].text

      return {
        result,
        errors: []
      }
    }

    return {
      result: null,
      errors: this.collectErrorMessages(fileName)
    }
  }

  private makeServiceHost (options: ts.CompilerOptions): ts.LanguageServiceHost {
    return {
      getScriptFileNames: () => this.files.fileNames,
      getScriptVersion: fileName => this.files.getVersion(fileName),
      getScriptSnapshot: fileName => {
        const src = this.files.getSrc(fileName)
        return src && ts.ScriptSnapshot.fromString(src)
      },
      getCurrentDirectory: () => process.cwd(),
      getCompilationSettings: () => options,
      getDefaultLibFileName: options => ts.getDefaultLibFilePath(options)
    } as ts.LanguageServiceHost
  }

  private collectErrorMessages (fileName: string): string[] {
    const allDiagnostics = this.tsService.getCompilerOptionsDiagnostics()
      .concat(this.tsService.getSyntacticDiagnostics(fileName))
      .concat(this.tsService.getSemanticDiagnostics(fileName))

    return allDiagnostics.map(diagnostic => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')

      if (diagnostic.file) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
        return `[${line + 1},${character + 1}] ${message}`
      }
      return message
    })
  }
}

// .ts suffix is needed since the compiler skips compile
// if the file name seems to be not supported types
function normalize (fileName: string): string {
  if (/\.vue$/.test(fileName)) {
    return fileName + '.ts'
  }
  return fileName
}
