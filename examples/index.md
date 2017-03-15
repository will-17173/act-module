# Demo

---

## Normal usage
````html
<div id="act_module"></div>
<!-- <div id="SOHUCS" sid="10161313_1_10009"></div> -->
<div data-widget="comment" data-widget-sid="s_201611112"></div>
````


````javascript
var Actmodule = require('index');

new Actmodule({
  "element":"#act_module",
  "collectInfo": 0,
  "needComment":0,
  "actId":"5048",
  "lotteryId":"172",
  "fieldSetId":"39",
  "needInfo": 0,
  "dev": 1,
  "v2": 1,
  "commentTip":"一句话证明你是问道老玩家",
  "style":"2",
  "showImg":0
});

````
