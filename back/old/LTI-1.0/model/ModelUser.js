

class ModelUser {
  constructor( id, pwd ) {
    this.id = id;
    this.pwd = pwd;
  }
}


class ModelUsers {
  constructor() {
    this.users = [
      new ModelUser( "hugo.lecler@etu.umontpellier.fr", "pwd" ),
      new ModelUser( "test@moodle.com", "plage" ),
      new ModelUser( "test1@moodle.com", "plage" ),
      new ModelUser( "test.plage@yopmail.com", "plage" )
    ];
    this.findByLogin = this.findByLogin.bind( this );
  }

  findByLogin( id, pwd ) {
    return this.users.find( u => u.id == id && u.pwd == pwd );
  }

  findById( id ) {
    return this.users.find( u => u.id == id );
  }

  add( user ) {
    this.users.push( user );
  }

  remove( id ) {
    this.users = this.users.filter( u => u.id != id );
  }

  update( id, newUser ) {
    this.removeUser( id );
    this.addUser( newUser );
  }
}

module.exports = new ModelUsers();
