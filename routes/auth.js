import { Router } from "express";
import { createUser, checkUser } from "../data/users.js";
const router = Router();
import { users } from "../config/mongoCollections.js";
import { isAuth, validId, validStr, validStrArr, validNumber, validAddress, validState, validZip, validTime, validTimeInRange, validEmail, validExpLevel, validDate, validImageUrl, checkPassword} from "../validation.js";

router
  .route("/login")
  .get(async (req, res) => {
    return res.render("login", {error: false, message: ""});
  })
  .post(async (req, res) => {
    let emailAddress, password;
    try {
      emailAddress = validStr(
        req.body.emailAddressInput,
        "Email"
      ).toLowerCase();
      password = validStr(req.body.passwordInput, "Password");
      if (password.length != req.body.passwordInput.length)
        throw "Password must not contain whitespace.";
      if (password.length < 8)
        throw "Password must be at least 8 characters long";
      if (
        !/^[a-z0-9]+([._\-][a-z0-9]+)*@[a-z0-9]+(-[a-z0-9]+)*[a-z0-9]*\.[a-z0-9]+[a-z0-9]+$/.test(
          emailAddress
        ) ||
        emailAddress.length > 320
      )
        throw "Invalid email address format";
      let passUpper = false;
      let passNumber = false;
      let passSpecial = false;
      for (let i of password) {
        if (i == " ") throw "Password must not contain spaces";
        if (/[A-Z]/.test(i)) passUpper = true;
        else if (/[0-9]/.test(i)) passNumber = true;
        else if (/[!@#$%^&*\(\)-_+=\[\]\{\}\\\|;:'",<.>\/?]/.test(i))
          passSpecial = true;
        else if (!/[a-z]/.test(i)) throw "Password contains invalid characters";
      }
      if (!passUpper || !passNumber || !passSpecial)
        throw "Password must contain an uppercase character, number, and special character";
    } catch (e) {
      return res
        .status(400)
        .render("login", { auth: false, message: e, error: true });
    }

    try {
      let user = await checkUser(emailAddress, password);
      req.session.user = user;

      if (req.session.user.owner === true) {
        return res.redirect("/");
      } else {
        return res.redirect("/");
      }
    } catch (e) {
      return res
        .status(400)
        .render("login", { message: e, error: true, auth: false });
    }
  });

router.route("/register")
  .get(async (req, res) => {
    return res.render("register", { auth: false, bad: "" });
  })
  .post(async (req, res) => {
    let firstName = req.body.firstNameInput;
    let lastName = req.body.lastNameInput;
    let username = req.body.usernameInput;
    let password = req.body.passwordInput;
    let age = parseInt(req.body.ageInput);
    let city = req.body.cityInput;
    let state = req.body.stateInput;
    let zip = req.body.zipInput;
    let email = req.body.emailAddressInput;
    let experience_level = req.body.levelInput;
    // let ownerString = req.body.ownerInput;
    // let owner;
    // if (ownerString.charAt(0) === "Y") {
    //   owner = true;
    // }
    // else {
    //   owner = false;
    // }
    let errors = "";
    let hasErrors = false;

    if (
      !firstName ||
      !lastName ||
      !username ||
      !password ||
      !age ||
      !city ||
      !state ||
      !zip ||
      !email
      // !experience_level
    ) 
    {
      errors += "All inputs must be provided";
    }

    try {
      firstName = validStr(firstName, "First name");
      lastName = validStr(lastName, "Last name");
      username = validStr(username, "Username");
      city = validStr(city, "City");
      age = validNumber(age, "Age");
      state = validState(state);
      zip = validZip(zip);
      email = validEmail(email);
      experience_level = validExpLevel(experience_level);
      password = checkPassword(password);
    }
    catch (e) {
      errors += ' - ' + e;
    }

    const usersCollection = await users();
    // check if username already exists
    const checkUsername = await usersCollection.findOne({
      username: new RegExp("^" + username, "i"),
    });
    if (checkUsername !== null) {
      errors += "- another user has this username.";
    }
    //check email doesn't exist
    const checkEmail = await usersCollection.findOne({
      email: new RegExp("^" + email.toLowerCase(), "i"),
    });
    if (checkEmail !== null) {
      errors += " - this email is already associated with an account";
    }

    if (hasErrors) {
      return res.render("register", {auth: false, bad: errors});
    }

    try {
      //make update
      const newUser = await createUser(
        firstName,
        lastName,
        username,
        password,
        age,
        city,
        state,
        zip,
        email,
        experience_level
        // owner
      );
      if (newUser) {
        return res.redirect('login');      
      }
      else {
        //if it did not error but didn't work:
        res.status(500).render('error', {error: "Internal Server Error"});
      }
    }
    catch (e) {
      // console.log(e)
      res.render('register', {auth: false, bad: e});
    }
  });

router.route("/logout").get(async (req, res) => {
  req.session.destroy();
  return res.render("logout", { auth: false });
});

export default router;
