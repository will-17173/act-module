# 17173通用活动组件actmodule 


## Install

```
$ spm install actmodule --save
```

## Usage
组件基于pandora.js开发，请确保页面上在组件调用代码前引用了pandora.js  
```html
<script src="http://ue.17173cdn.com/a/lib/pandora.js"></script>
```

在需要调用组件的地方插入组件调用代码
```html
<div id="act_module"></div>
<script>
  pandora.use(['actmodule'], function(ActModule) {
      new ActModule({
          "element":"#act_module",
          "needComment":true,
          "actId":"7123",
          "lotteryId":"89",
          "commentTip":"一句话证明你是问道老玩家",
          "style":"2",
          "showImg":true
      })
  });
</script>
```
