var VueRuntimeCore = (function (exports) {
  'use strict';

  // createRender
  function createRender(renderOptionDom) {
      return {
          createApp(rootComponent, rootProps) {
              const app = {
                  mount(rootContainer) {
                      // render(rootComponent, rootContainer);
                      console.log("rootComponent", rootContainer, rootComponent, rootProps, renderOptionDom);
                  },
              };
              return app;
          },
      };
  }

  exports.createRender = createRender;

  return exports;

})({});
//# sourceMappingURL=runtime-core.global.js.map
