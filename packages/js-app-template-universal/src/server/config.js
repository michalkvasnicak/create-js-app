/* @flow */

function notEmpty(value: ?string): string {
  if (value == null) {
    throw new Error('Has to be nonempty string');
  }

  return value;
}

export const ASSETS_PATH: string = notEmpty(process.env.ASSETS_PATH);
export const ASSETS_DIR: string = notEmpty(process.env.ASSETS_DIR);
export const PUBLIC_DIR: string = notEmpty(process.env.PUBLIC_DIR);
export const SERVER_PORT: number = parseInt(notEmpty(process.env.SERVER_PORT), 10);
