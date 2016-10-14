/* @flow */
import assets from './assets';
import Helmet from 'react-helmet';
import { renderToString } from 'react-dom/server';

function styleTags(styles: Array<string>) {
  return styles
    .map(style =>
      `<link href="${style}" media="screen, projection" rel="stylesheet" type="text/css" />`
    )
    .join('\n');
}

function scriptTags(scripts: Array<string>) {
  return scripts
    .map(script =>
      `<script type="text/javascript" src="${script}"></script>`
    )
    .join('\n');
}

const styles = styleTags(assets().styles);
const scripts = scriptTags(assets().scripts);

export default function renderHtml(element: ?Object, initialState: ?Object): string {
  const reactRenderString = element
    ? renderToString(element)
    : null;

  const helmet = element
    ? Helmet.rewind()
    : null;

  return `<!DOCTYPE html>
    <html ${helmet ? helmet.htmlAttributes.toString() : ''}>
      <head>
        <meta charSet='utf-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta httpEquiv='Content-Language' content='en' />
        <link rel='shortcut icon' type='image/x-icon' href='/public/favicon.ico' />
        ${helmet ? helmet.title.toString() : ''}
        ${helmet ? helmet.meta.toString() : ''}
        ${helmet ? helmet.link.toString() : ''}

        ${styles}
        ${helmet ? helmet.style.toString() : ''}
      </head>
      <body>
        <div id='app'>${reactRenderString || ''}</div>

        <script type='text/javascript'>${
          initialState
            ? `window.APP_STATE=${JSON.stringify(initialState)};`
            : ''
        }</script>

        ${scripts}
        ${helmet ? helmet.script.toString() : ''}
      </body>
    </html>`;
}
