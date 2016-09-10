'use strict';

const chalk = require('chalk');
const React = require('react');

const formatters = {
  'task-log': ['TASK'],
  'task-log-error': ['TASK', chalk.red],
  'task-log-info': ['TASK', chalk.cyan],
  'task-log-success': ['TASK', chalk.green],
  'task-log-warning': ['TASK', chalk.yellow],
  'client-log': ['CLIENT'],
  'client-log-error': ['CLIENT', chalk.red],
  'client-log-info': ['CLIENT', chalk.cyan],
  'client-log-success': ['CLIENT', chalk.green],
  'client-log-warning': ['CLIENT', chalk.yellow],
  'server-log': ['SERVER'],
  'server-log-error': ['SERVER', chalk.red],
  'server-log-info': ['SERVER', chalk.cyan],
  'server-log-success': ['SERVER', chalk.green],
  'server-log-warning': ['SERVER', chalk.yellow],
};

class Log extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleLog = this.handleLog.bind(this);

    const { eventEmitter } = props;

    this.state = {
      messages: []
    };

    Object.keys(formatters).forEach(eventName => {
      const [prefix, painter = msg => msg] = formatters[eventName];

      eventEmitter.on(eventName, msg => {
        this.handleLog(`[${(new Date).toLocaleTimeString()} ${prefix.toUpperCase()}] - ${painter(msg)}`);
      })
    });
  }

  handleLog(message) {
    this.setState({
      messages: [message].concat(this.state.messages.slice(0, 9))
    });
  }

  render() {
    const props = {
      border: {
        type: 'line'
      },
      label: 'Log',
      style: {
        border: {
          fg: 'white'
        }
      },
    };

    return (
      React.createElement(
        'box',
        Object.assign({}, props, this.props),
        this.state.messages.join("\n")
      )
    );
  }
}

module.exports = Log;
