# policy


### Usage

```
const Policy = require('@hotelflex/policy')

const policy = new Policy()
  .allowRoot()
  .allowHotelier('MEMBER')
```

Supported methods

* allowPublic
* allowRoot
* allowAccountOwner
* allowSessionOwner
* allowHotelier
* allowHotelflex