const PolicyError = require('./PolicyError')

class Policy {
  constructor(policy) {
    this.policy = policy || this.validate.bind(this)
    this.allowRoot = false
    this.allowHotelierRoles = []
    this.allowHotelflexRoles = []
    this.exec = this.exec.bind(this)

    this.exec.allowRoot = (function() { 
      this.allowRoot = true
      return this.exec 
    }).bind(this)

    this.exec.allowHotelier = (function(role) { 
      this.allowHotelierRoles.push(role)
      return this.exec
    }).bind(this)

    this.exec.allowHotelflex = (function(role) { 
      this.allowHotelflexRoles.push(role)
      return this.exec
    }).bind(this)
    
    return this.exec
  }
  validate(session, hotelId) {
    var allowRoot = this.allowRoot
    var allowHotelierRoles = this.allowHotelierRoles
    var allowHotelflexRoles = this.allowHotelflexRoles
    return (allowRoot && session.isRoot)
      //check hotelflex roles
      || (allowHotelflexRoles.length > 0
        && session.permissions.filter(function(p) {
          return p.type === 'HOTELFLEX'
            && allowHotelflexRoles.indexOf(p.role) > -1
        }).length > 0)
      //check hotelier roles
      || (allowHotelierRoles.length > 0
        && session.permissions.filter(function(p) {
          return p.type === 'HOTELIER'
            && p.entityId === hotelId
            && allowHotelierRoles.indexOf(p.role) > -1
        }).length > 0)
  }
  exec() {
    if(!this.policy(...arguments)) {
      throw new PolicyError()
    }
  }
}

Policy.PolicyError = PolicyError

module.exports = Policy