const Errors = require('./Errors')

class Policy {
  constructor() {
    this.exec = this.exec.bind(this)
    this.exec.allowRoot = this.allowRoot.bind(this)
    this.exec.allowPublic = this.allowPublic.bind(this)
    this.exec.allowHotelflexRole = this.allowHotelflexRole.bind(this)
    this.exec.allowHotelierRole = this.allowHotelierRole.bind(this)

    this._allowRoot = false
    this._allowPublic = false
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

  allowHotelflexRole(role) {
    this._hotelflexRoles.push(role)
    return this.exec
  }

  allowHotelierRole(role) {
    this._hotelierRoles.push(role)
    return this.exec
  }

  exec(session, opts = {}) {
    if (this._allowPublic) return

    if (!session) throw new Errors.Unauthorized()

    if (this._allowRoot && session.isRoot) return

    for (let i = 0; i < this._hotelflexRoles.length; i++) {
      const role = this._hotelflexRoles[i]
      const matches = session.permissions.filter(
        p =>
          p.entityId === opts.hotelId &&
          p.type === 'HOTELFLEX' &&
          p.role === role,
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

    throw new Errors.Unauthorized()
  }
}

Policy.Errors = Errors

module.exports = Policy
