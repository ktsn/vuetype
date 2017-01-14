declare module 'vue-template-compiler' {
  interface CompilerOptions {
    pad?: boolean
  }

  interface SFCBlock {
    type: string
    content: string
    start?: number
    end?: number
    lang?: string
    src?: string
    scoped?: boolean
    module?: string | boolean
  }

  interface SFCDescriptor {
    template: SFCBlock | null | undefined
    script: SFCBlock | null | undefined
    styles: SFCBlock[]
  }

  interface TemplateCompiler {
    parseComponent (file: string, options?: CompilerOptions): SFCDescriptor
  }

  const compiler: TemplateCompiler
  export = compiler
}
