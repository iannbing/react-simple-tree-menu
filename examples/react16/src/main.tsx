// React 16.14 uses ReactDOM.render (the legacy root API). This file exists
// mostly to prove the peer floor: if this mounts cleanly, the library's
// automatic JSX runtime + hooks usage is compatible with the oldest React
// we support.

import ReactDOM from 'react-dom';
import { App } from './App';
import 'react-simple-tree-menu/styles';
import './styles.css';

ReactDOM.render(<App />, document.getElementById('root'));
