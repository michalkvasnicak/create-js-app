/* @flow */
import 'normalize.css';
import Helmet from 'react-helmet';
import React from 'react';
import styles from './App.css';

export default function App(/* props: Object */) {
  return (
    <div>
      <Helmet title="Hello World" />
      <h1 className={styles.red}>Hello World</h1>
    </div>
  );
}
