/* @flow */

function getEnvVariable(name: string): string {
  if (process.env[name] === undefined || process.env[name] === null) {
    throw new Error(`process.env.${name} has to be nonempty string`);
  }

  return process.env[name];
}

export const ASSETS_PATH: string = getEnvVariable('ASSETS_PATH');
export const ASSETS_DIR: string = getEnvVariable('ASSETS_DIR');
export const PUBLIC_DIR: string = getEnvVariable('PUBLIC_DIR');
export const SERVER_PORT: number = parseInt(getEnvVariable('SERVER_PORT'), 10);
