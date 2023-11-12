const bcrypt = require("bcrypt");

const hashPassword = async password => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, 10);
};

const validateEmailFormat = email => {
  const emailRegex = /[A-Za-z0-9._%+-]+@nmu.edu$/;
  // Test the email against the regex pattern
  return emailRegex.test(email);
}

module.exports = {
  hashPassword,
  validateEmailFormat,
};