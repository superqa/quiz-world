module.exports = {
  passwordMatch: function (password, confirmationPassword) {
    if (password && confirmationPassword && password === confirmationPassword) {
      return true;
    }
    return false;
  },

  validateEmail: function (email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },

  verifyPassword: function (password) {
    // check the format of password
  }
}