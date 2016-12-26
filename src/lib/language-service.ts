import * as ts from 'typescript'

interface File {
  version: number
  text: string | null
}

export class LanguageService {
  private files = {} as ts.Map<File>
  private tsService: ts.LanguageService

  constructor (private options: ts.CompilerOptions) {
    const serviceHost = this.makeServiceHost(options)
    this.tsService = ts.createLanguageService(serviceHost, ts.createDocumentRegistry())
  }

  updateSrcScript (fileName: string, text: string): void {
    fileName = normalize(fileName)

    if (!this.files[fileName]) {
      this.files[fileName] = { version: 0, text: null }
    }

    const file = this.files[fileName]
    file.version += 1
    file.text = text
  }

  getDts (fileName: string): string {
    fileName = normalize(fileName)

    const output = this.tsService.getEmitOutput(fileName, true)
    return output.outputFiles
      .filter(file => /\.d\.ts$/.test(file.name))[0].text
  }

  private makeServiceHost (options: ts.CompilerOptions): ts.LanguageServiceHost {
    return {
      getScriptFileNames: () => Object.keys(this.files),
      getScriptVersion: fileName => this.files[fileName] && this.files[fileName].version.toString(),
      getScriptSnapshot: fileName => {
        if (!this.files[fileName]) return undefined

        const file = this.files[fileName]
        if (file.text === null) return undefined

        return ts.ScriptSnapshot.fromString(file.text)
      },
      getCurrentDirectory: () => process.cwd(),
      getCompilationSettings: () => options,
      getDefaultLibFileName: options => ts.getDefaultLibFilePath(options)
    } as ts.LanguageServiceHost
  }
}

function normalize (fileName: string): string {
  if (!/\.ts$/.test(fileName)) {
    return fileName + '.ts'
  }
  return fileName
}