const BuildOutput = require('./BuildOutput');
const Log = require('./Log');
const path = require('path');
const React = require('react');
const blessed = require('blessed');
const { render } = require('react-blessed');

function Dashboard(props) {
  const { eventEmitter } = props;

  return (
    React.createElement(
      'element',
      {},
      [
        React.createElement(
          BuildOutput,
          {
            key: 'client-compiler',
            bundle: 'client',
            height: '40%',
            label: `Client compiler (:status:)`,
            eventEmitter
          }
        ),
        React.createElement(
          BuildOutput,
          {
            key: 'server-compiler',
            bundle: 'server',
            height: '40%',
            label: `Server compiler (:status:)`,
            eventEmitter,
            top: '40%'
          }
        ),
        React.createElement(
          Log,
          {
            key: 'logs',
            eventEmitter,
            height: '20%',
            top: '80%'
          }
        )
      ]
    )
  );
}

Dashboard.propTypes = {
  eventEmitter: React.PropTypes.shape({
    on: React.PropTypes.func.isRequired
  }).isRequired
};

const screen = blessed.screen({
  autoPadding: true,
  dockBorders: false,
  fullUnicode: true,
  smartCSR: true,
  title: `${path.basename(process.cwd())} - Dashboard`
});

screen.key(['escape', 'q', 'C-c'], (/*ch, key*/) => {
  return process.exit(0);
});


module.exports = function renderDashboard(eventEmitter) {
  render(React.createElement(Dashboard, { eventEmitter }), screen);
};
