# policy


### Usage

```
const Policy = require('@hotelflex/policy')

const policy = Policy({
  hotel: ['MEMBER'],
  hotelflex: 'ACCOUNT_MANAGER',
  sessionOwner: true,
  accountOwner: true,
  root: true, //defaults to true
  public: true, //defaults to false
})

policy.load(session)
// => this will boom if session doesn't hold any of the stated permissions

policy.apply(opts)
// => Use this to check specific params against permissions

const opts = {
  hotelId: '123',
  sessionId: 'sess1',
  accountId: 'acc1',
  ...
}

```