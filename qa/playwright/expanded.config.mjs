import config from './playwright.config.mjs';
// Read-only deployed-sandbox discovery, responsive and automated accessibility audit.
// Run with: npx playwright test --config=expanded.config.mjs
export default {...config,
 reporter:[['list'],['json',{outputFile:'artifacts/expanded-results.json'}],['html',{outputFolder:'artifacts/expanded-html',open:'never'}]],
 outputDir:'artifacts/expanded-test-results',
 use:{...config.use,trace:'off',video:'off'},
 projects:[
  {name:'expanded-chromium',testMatch:['desktop-route-accessibility.spec.mjs','discovery-species.spec.mjs'],use:{browserName:'chromium'}},
  {name:'expanded-mobile-webkit',testMatch:['desktop-route-accessibility.spec.mjs','discovery-species.spec.mjs'],use:{browserName:'webkit',viewport:{width:390,height:844},isMobile:true,hasTouch:true}},
 ],
};
