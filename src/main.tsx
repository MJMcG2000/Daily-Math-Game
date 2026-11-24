import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'katex/dist/katex.min.css';
import './styles.css';
import App from './App';

const root = createRoot(document.getElementById('root')!);
const gallery = import.meta.env.DEV ? new URLSearchParams(location.search).get('gallery') : null;

if (gallery) {
  Promise.all([
    import('./components/Gallery'),
    import('../data/problems/easy.json'),
    import('../data/problems/medium.json'),
    import('../data/problems/hard.json'),
  ]).then(([{ Gallery }, e, m, h]) => {
    const all = [...e.default, ...m.default, ...h.default] as import('./types').Problem[];
    root.render(<Gallery problems={all} filter={gallery} />);
  });
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
