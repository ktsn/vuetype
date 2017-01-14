export function logEmitted (filePath: string): void {
  console.log('Emitted: '.green + filePath)
}

export function logRemoved (filePath: string): void {
  console.log('Removed: '.green + filePath)
}

export function logError (filePath: string, messages: string[]): void {
  const errors = [
    'Emit Failed: '.red + filePath,
    ...messages.map(m => '  ' + 'Error: '.red + m)
  ]
  console.error(errors.join('\n'))
}