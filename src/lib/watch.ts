import ts = require('typescript')
import chokidar = require('chokidar')
import { writeFile, unlink } from './file-util'
import { LanguageService } from './language-service'
import { logEmitted, logRemoved, logError } from './logger'

export function watch (
  dirs: string[],
  compilerOptions: ts.CompilerOptions = {},
  usePolling: boolean = false
): chokidar.FSWatcher {
  const watcher = chokidar.watch(dirs, {
    usePolling
  })

  const service = new LanguageService([], {
    ...compilerOptions,
    noEmitOnError: true
  })

  watcher
    .on('add', onlyVue(file => {
      service.updateFile(file)
      saveDts(file, service)
    }, service, 'add'))
    .on('change', onlyVue(file => {
      service.updateFile(file)
      saveDts(file, service)
    }, service, 'change'))
    .on('unlink', onlyVue(file => {
      //service.updateFile(file)
      removeDts(file)
    }, service, 'unlink'))

  return watcher
}

function saveDts (fileName: string, service: LanguageService): void {
  const dts = service.getDts(fileName)
  const dtsName = fileName + '.d.ts'

  if (dts.errors.length > 0) {
    logError(dtsName, dts.errors)
    return
  }

  if (dts.result === null) return

  writeFile(dtsName, dts.result)
    .then(
      () => logEmitted(dtsName),
      err => logError(dtsName, [err.message])
    )
}

function removeDts (fileName: string): void {
  const dtsName = fileName + '.d.ts'
  unlink(dtsName)
    .then(
      () => logRemoved(dtsName),
      err => logError(dtsName, [err.message])
    )
}

function onlyVue (fn: (fileName: string) => void, service: LanguageService, mode: string): (fileName: string) => void {
  return fileName => {
    switch (mode){
      case 'change':
        if (service.hasFile(fileName)) {
          service.updateFile(fileName)
        }
        break
      case 'unlink':
        service.unlinkFile(fileName)
        break
      default:
        break
    }
    fileName = mode !== 'unlink' && service.getVueFile(fileName) || fileName
    if (!/\.vue$/.test(fileName)) return
    fn(fileName)
  }
}
