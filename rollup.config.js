/* rollup.config.js */
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import terser from '@rollup/plugin-terser';

//original
//const TEST_VAULT = 'test-vault/.obsidian/plugins/note-refactor-obisidian';

//fork
const TEST_VAULT = 'C:/Users/agodi/OneDrive/OBSIDIAN/Woody/.obsidian/plugins/note-refactor-fork';

const isProd = process.env.NODE_ENV === 'production';

export default {
  input: 'src/main.ts',
  output: {
    file: 'main.js',
    format: 'cjs',
    exports: 'default',
    sourcemap: isProd ? true : 'inline'
  },
  /* do not include these libraries, they are already used by Obsidian */
  external: ['obsidian', 'os', 'fs', 'js-yaml', 'moment'],
  plugins: [
    typescript(),
    /* Obsidian runs inside a Electron brownser */
    nodeResolve({ browser: true }),
    commonjs(),
    /* mimify ONLY in production */
    ...(isProd ? [terser()] : []),
    copy({
      targets: [
        { src: 'main.js', dest: TEST_VAULT },
        { src: ['manifest.json', 'styles.css'], dest: TEST_VAULT }
      ],
      flatten: true
    })
  ]
};
/* EOF */