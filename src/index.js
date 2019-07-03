const Boom = require('@hapi/boom')

function normalizeSession(session) {
  if (!session || session !== Object(session)) return { permissions: [] }

  if (!Array.isArray(session.permissions)) {
    session.permissions = []
  }
  return session
}

function secure(config, handler) {
  const policy = new Policy(config)
  return function(ctx, next) {
    policy.load(ctx.request.session).validate()
    return handler(ctx, next, policy)
  }
}

class Policy {
  constructor(config={}) {
    this.from = this.from.bind(this)
    this.load = this.load.bind(this)
    this.apply = this.apply.bind(this)
    this.validate = this.validate.bind(this)

    this.isRoot = false
    this.accountId = null
    this.sessionId = null
    this.hotelPermissions = []
    this.hotelflexPermissions = []

    this._allowRoot = true
    this._allowPublic = false
    this._allowSessionOwner = false
    this._allowAccountOwner = false
    this._hotelflexRoles = []
    this._hotelRoles = []
    this.from(config)
  }
  from(config={}) {
    if(config.hotel) {
      if(typeof config.hotel === 'string') {
        this._hotelRoles.push(config.hotel)
      } else {
        this._hotelRoles.push(...config.hotel)
      }
    }
    if(config.hotelflex) {
      if(typeof config.hotelflex === 'string') {
        this._hotelRoles.push(config.hotelflex)
      } else {
        this._hotelRoles.push(...config.hotelflex)
      }
    }
    if(config.accountOwner !== undefined) {
      this._allowAccountOwner = Boolean(config.accountOwner)
    }
    if(config.sessionOwner !== undefined) {
      this._allowSessionOwner = Boolean(config.sessionOwner)
    }
    if(config.root !== undefined) {
      this._allowRoot = Boolean(config.root)
    }
    if(config.public !== undefined) {
      this._allowPublic = Boolean(config.public)
    }
    return this
  }
  load(session) {
    session = normalizeSession(session)
    this.session = session
    if(this._allowRoot && session.isRoot) {
      this.isRoot = true
    }
    if(this._allowSessionOwner && session.id) {
      this.sessionId = session.id
    }
    if(this._allowAccountOwner && session.accountId) {
      this.accountId = session.accountId
    }
    if(this._hotelRoles.length > 0) {
      this.hotelPermissions = session.permissions
        .filter(p => this._hotelRoles.indexOf(p.role) > -1)
    }
    if(this._hotelflexRoles.length > 0) {
      this.hotelflexPermissions = session.permissions
        .filter(p => this._hotelflexRoles.indexOf(p.role) > -1)
    }
    return this
  }
  validate() {
    if(this._allowPublic) return
    if(!this.session || !this.session.id) 
      throw Boom.unauthorized()
    if(
      !this.isRoot
      && !this.sessionId
      && !this.accountId
      && this.hotelPermissions.length === 0
      && this.hotelflexPermissions.length === 0
    ) throw Boom.forbidden()
    return this
  }
  apply(opts={}) {
    const { sessionId, accountId, hotelId } = opts
    if(this.isRoot) return
    if(this.hotelflexPermissions.length > 0) return
    if(this.sessionId && this.sessionId === sessionId) return
    if(this.accountId && this.accountId === accountId) return
    if(this.hotelPermissions.length > 0 && hotelId) {
      for (var i = this.hotelPermissions.length - 1; i >= 0; i--) {
        const p = this.hotelPermissions[i]
        if(p.entityId === hotelId) return
      }
    }
    throw Boom.forbidden()
  }
}
Policy.secure = secure
module.exports = Policy
