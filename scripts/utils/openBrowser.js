/* @flow */
const execSync = require('child_process').execSync;
const opn /*: Function */ = require('opn');

module.exports = function openBrowser(url /*: string */) /*: void */ {
  if (process.platform === 'darwin') {
    try {
      // Try our best to reuse existing tab
      // on OS X Google Chrome with AppleScript
      execSync('ps cax | grep "Google Chrome"');
      execSync(
        `osascript chrome.applescript ${url}/`,
        { cwd: __dirname, stdio: ['ignore', 'ignore', 'ignore'], encoding: 'buffer' }
      );
      return;
    } catch (err) {
      // Ignore errors.
    }
  }
  // Fallback to opn
  // (It will always open new tab)
  opn(`${url}/`);
};
