/* @flow */
import convert from 'koa-convert';
import Koa from 'koa';
import React from 'react';
import staticCache from 'koa-static-cache';

import App from '../shared/App';
import renderHtml from './renderHtml';
import { ASSETS_DIR, PUBLIC_DIR, SERVER_PORT } from './config';

const app = new Koa();

// serve static files
app.use(convert(staticCache(
  PUBLIC_DIR, {
    buffer: true,
    gzip: true,
    usePrecompiledGzip: true,
    prefix: '/public',
    dynamic: true,
  }
)));
app.use(convert(staticCache(
  ASSETS_DIR, {
    buffer: true,
    gzip: false,
    usePrecompiledGzip: true,
    prefix: '/',
    dynamic: true,
  }
)));

// render app
app.use(
  async (ctx: Object, next: () => Promise<any>) => {
    ctx.status = 200; // eslint-disable-line no-param-reassign
    ctx.body = renderHtml(<App />); // eslint-disable-line no-param-reassign

    return next();
  }
);

const listener = app.listen(SERVER_PORT);

export default listener;
