const bcrypt = require("bcrypt");
const { hashPassword, validateEmailFormat } = require("../helper/auth");
const Employee = require("../models/Employee");

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await hashPassword(password);

    const emailRegex = /[A-Za-z0-9._%+-]+@nmu.edu$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format. Must be @nmu.edu email",
      });
    }

    const isDuplicate = await Employee.checkDuplicateEmail(email);
    if (isDuplicate) {
      return res.status(400).json({
        message: "Email already in use.",
        registered: false,
      });
    } else {
      await Employee.createEmployee(
        name,
        email,
        hashedPassword,
      );
      res.status(201).json({
        message: "Created User Successfully",
        user: { name, email },
        redirectUrl: "/",
        registered: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Creating User", error: error.message });
  }
};


exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if the email has a valid format
    if (!validateEmailFormat(email)) {
      res.status(400).json({
        message: "Invalid Email Format!",
        redirectUrl: "index.html",
      });
      return;
    }

    //Uses Destructuring to access properties of the User object
    const [row] = await Employee.authenticateUser(email);
    if (row.length && (await bcrypt.compareSync(password, row[0].hashed_password))) {
      req.session.userId = row[0].id;
      const userId = req.session.userId;
      req.session.loggedIn = true;
      res.status(201).json({
        message: "Logged User In Successfully",
        sessionId: userId,
        loggedIn: true,
        redirectUrl: "dashboard",
      });
    } else {
      res.status(400).json({
        message: "Invalid Password!",
        redirectUrl: "index.html",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error Logging In User", error });
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const user = await Employee.findByID(userId);
    res.status(200).json({ id: userId, name: user.name, email: user.email });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' + error });
  }
};

exports.logOutUser = async (req, res, next) => {
  try {
    req.session.destroy();
    res.status(200).json({
      redirectUrl: "index.html",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error logging out user",
      error: error,
    });
  }
};

exports.searchUser = async (req, res, next) => {
  try {
    const query = req.query.query;
    const users = await Employee.searchUsers(query);
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
}
