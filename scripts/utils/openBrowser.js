const execSync = require('child_process').execSync;
const opn = require('opn');

module.exports = function openBrowser(url) {
  if (process.platform === 'darwin') {
    try {
      // Try our best to reuse existing tab
      // on OS X Google Chrome with AppleScript
      execSync('ps cax | grep "Google Chrome"');
      execSync(
        `osascript chrome.applescript ${url}/`,
        { cwd: __dirname, stdio: 'ignore' }
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
