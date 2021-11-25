/**
 *  given the email and database return
 *  the user if exists otherwise return null;
 */

const getUserByEmail = function (email, database) {
  const user = {};
  for (const key in database) {
    if (email === database[key].email) {
      user.id = database[key].id;
      user.email = database[key].email;
      user.password = database[key].password;
      return user;
    }
  }
  return null;
}

/**
 *  given the id from the cookie session 
 *  the user if exists otherwise return null;
 */

const getUserById = function (id, database) {
  const user = {};
  for (const key in database) {
    if (id === database[key].id) {
      user.id = database[key].id;
      user.email = database[key].email;
      user.password = database[key].password;
      return user;
    }
  }
  return null;
}

module.exports = { getUserByEmail, getUserById };
