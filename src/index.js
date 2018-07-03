const PolicyError = require('./PolicyError')

class Policy {
  constructor(policy) {
    this.policy = policy
    return this.exec.bind(this)
  }

  exec() {
    if (!this.policy(...arguments)) {
      throw new PolicyError()
    }
  }
}

Policy.PolicyError = PolicyError

module.exports = Policy
