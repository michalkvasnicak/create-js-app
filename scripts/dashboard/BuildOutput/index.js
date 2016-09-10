const blessed = require('blessed');
const React = require('react');

const friendlySyntaxErrorLabel = 'Syntax error:';

function isLikelyASyntaxError(message) {
  return message.indexOf(friendlySyntaxErrorLabel) !== -1;
}

function formatMessage(message) {
  return message
  // Make some common errors shorter:
    .replace(
      // Babel syntax error
      'Module build failed: SyntaxError:',
      friendlySyntaxErrorLabel
    )
    .replace(
      // Webpack file not found error
      /Module not found: Error: Cannot resolve 'file' or 'directory'/,
      'Module not found:'
    )
    // Internal stacks are generally useless so we strip them
    .replace(/^\s*at\s.*:\d+:\d+[\s\)]*\n/gm, '') // at ... ...:x:y
    // Webpack loader names obscure CSS filenames
    .replace('./~/css-loader!./~/postcss-loader!', '');
}

class BuildOutput extends React.Component {
  constructor(props, context) {
    super(props, context);

    const { eventEmitter, bundle } = props;

    this.handleDone = this.handleDone.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleProgress = this.handleProgress.bind(this);

    eventEmitter.on(`${bundle}-done`, this.handleDone);
    eventEmitter.on(`${bundle}-progress`, this.handleProgress);
    eventEmitter.on(`${bundle}-error`, this.handleError);

    this.state = {
      filesData: [],
      hasErrors: false,
      hasWarnings: false,
      status: 'Compiling...',
      output: null
    };
  }

  handleDone(stats) {
    const hasErrors = stats && stats.hasErrors() ? true : false;
    const hasWarnings = stats && stats.hasWarnings() ? true : false;

    let messages = [];

    const json = stats.toJson({}, true);

    if (hasErrors || hasWarnings) {
      messages = json.errors.map(message => `Error in ${formatMessage(message)}`);

      let formattedWarnings = json.warnings.map(message => `Warning in ${formatMessage(message)}`);

      // show just syntax errors if there are any
      if (messages.some(isLikelyASyntaxError)) {
        messages = messages.filter(isLikelyASyntaxError);
      } else if (hasWarnings) {
        // show warnings only if there aren't syntax errors
        messages = [].concat(messages, formattedWarnings)
      }
    } else {
      messages = '';
    }

    this.setState({
      hasErrors: stats.hasErrors(),
      hasWarnings: stats.hasWarnings(),
      output: messages,
      status: stats.hasErrors()
        ? 'Build failed'
        : (stats.hasWarnings()
          ? 'Compiled with warnings'
          : 'Compiled successfully')
    });
  }

  handleError(error) {
    this.setState({
      hasErrors: true,
      hasWarnings: false,
      status: 'Compilation successful, error staring server',
      output: error.toString()
    });
  }

  handleProgress(progress) {
    this.setState({
      hasErrors: false,
      hasWarnings: false,
      status: `Compiling ${Math.round(progress * 100)}%`,
      output: null
    });
  }

  render() {
    const { filesData, hasErrors, hasWarnings, output, status } = this.state;
    let toRender = output;

    const props = {
      border: {
        type: 'line'
      },
      height: '50%',
      style: {
        border: {
          fg: hasErrors ? 'red' : (hasWarnings ? 'yellow' : 'green')
        }
      },
      width: '100%'
    };

    if (!toRender && (!hasErrors && !hasWarnings)) {
      // todo show bundles and assets
      toRender = React.createElement('table', {
        align: 'left',
        alwaysScroll: true,
        data: [["Name", "Size"]].concat(filesData),
        height: '100%-5',
        keys: true,
        mouse: true,
        pad: 1,
        scrollable: true,
        scrollbar: {
          ch: " ",
          inverse: true
        },
        vi: true,
        width: '100%-5'
      });
    }

    return (
      React.createElement(
        'box',
        Object.assign({}, props, this.props, { label: this.props.label.replace(':status:', status)}),
        toRender
      )
    );
  }
}

BuildOutput.propTypes = {
  bundle: React.PropTypes.string.isRequired,
  eventEmitter: React.PropTypes.shape({
    on: React.PropTypes.func.isRequired
  }).isRequired
};

module.exports = BuildOutput;
