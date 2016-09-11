/* @flow */

declare type CompilerManager = {
  compiler: Object,
  close: () => Promise<any>
}

declare type ServerManager = {
  close: () => Promise<any>
}
