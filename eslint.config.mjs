import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "**/components/{webgl-provider,webgl-portal,webgl-image,webgl-video,webgl-scene,liquid-media,curve-media,lens-media,sphere-gallery,fluid-distortion,pixelated-text,text-scramble,text-bounce,text-split,infinite-gallery,image-trail,pixel-trail,scattered-scroll,pixel-scroll,magnetic-dot-grid,edge-bounce,smooth-scroll}/**",
      "**/components/custom/**",
      "**/components/interior/**",
      "**/components/sections/**",
      "**/hooks/use-{dom-plane,pointer-uv,render,frame-loop}.ts",
      "**/lib/object-fit.ts",
    ],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
