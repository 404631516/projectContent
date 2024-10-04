import { defineConfig } from 'windicss/helpers';

export default defineConfig({
  attributify: true,
  plugins: [require('windicss/plugin/aspect-ratio')],
  shortcuts: {
    blueGradient: 'bg-gradient-to-b from-[#1AE5DE] to-[#2FAFF9]',
    yellowGradient: 'bg-gradient-to-t from-[#FF8330] to-[#FFB92D]',
  },
  theme: {
    extend: {
      boxShadow: {
        default: '0px 3px 6px #00000029',
      },
      textShadow: {
        black: '2px 2px 0 #000, -2px -2px 0 #000',
        lightDefault: '0px 2px 4px #000000A6',
      },
    },
  },
});
