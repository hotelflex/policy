const PolicyError = require('./PolicyError')

function normalizeSession(session) {
  if (!session || session !== Object(session)) return { permissions: [] }

  if (!Array.isArray(session.permissions)) {
    session.permissions = []
  }

  return session
}

class Policy {
  constructor() {
    this.exec = this.exec.bind(this)
    this.exec.allowRoot = this.allowRoot.bind(this)
    this.exec.allowPublic = this.allowPublic.bind(this)
    this.exec.allowSessionOwner = this.allowSessionOwner.bind(this)
    this.exec.allowHotelflex = this.allowHotelflex.bind(this)
    this.exec.allowHotelier = this.allowHotelier.bind(this)

    this._allowRoot = false
    this._allowPublic = false
    this._allowSessionOwner = false
    this._hotelflexRoles = []
    this._hotelierRoles = []

    return this.exec
  }

  allowRoot() {
    this._allowRoot = true
    return this.exec
  }

  allowPublic() {
    this._allowPublic = true
    return this.exec
  }

  allowSessionOwner() {
    this._allowSessionOwner = true
    return this.exec
  }

  allowHotelflex(role) {
    this._hotelflexRoles.push(role)
    return this.exec
  }

  allowHotelier(role) {
    this._hotelierRoles.push(role)
    return this.exec
  }

  exec(session, opts = {}) {
    session = normalizeSession(session)

    if (this._allowPublic) return
    if (this._allowRoot && session.isRoot) return

    if (
      this._allowSessionOwner &&
      session.id === opts.sessionId &&
      opts.sessionId
    )
      return

    for (let i = 0; i < this._hotelflexRoles.length; i++) {
      const role = this._hotelflexRoles[i]
      const matches = session.permissions.filter(
        p => p.type === 'HOTELFLEX' && p.role === role,
      )

      if (matches.length > 0) return
    }

    for (let i = 0; i < this._hotelierRoles.length; i++) {
      const role = this._hotelierRoles[i]
      const matches = session.permissions.filter(
        p =>
          p.entityId === opts.hotelId &&
          p.type === 'HOTELIER' &&
          p.role === role,
      )

      if (matches.length > 0) return
    }

    throw new PolicyError()
  }
}

Policy.Error = PolicyError

module.exports = Policy
