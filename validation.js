import { ObjectId } from "mongodb";
import moment from "moment";
import NodeGeocoder from "node-geocoder";

const options = {
  provider: 'openstreetmap'
  //provider: 'google',
  //apiKey: 'TODO'
};

const geocoder = NodeGeocoder(options);

const isAuth = (session) => {
  let isAuth;
  if (session) {
    isAuth = true;
  } else {
    isAuth = false;
  }
  return isAuth;
};

const isAuth3 = (session) => {
  let isAuth;
  if (session) {
    isAuth = true;
  } else {
    isAuth = false;
  }
  return isAuth;
};

const isAuth2 = (session) => {
  let isAuth;
  if (session) {
    isAuth = true;
  } else {
    isAuth = false;
  }
  return isAuth;
};

const validId = (id, varName) => {
  /*
  Validates and trims an id.

  id = Variable
  varName = String (variable name)
  
  Returns String
  */
  let idName = varName || "id variable";
  if (!id) throw `Error: ${idName} not provided.`;
  if (typeof id !== "string" || id.trim().length === 0)
    throw `Error: ${idName} must be a non-empty string.`;
  id = id.trim();
  if (!ObjectId.isValid(id)) throw `Error: ${idName} is not a valid ObjectId`;
  return id;
};

const validStr = (str, varName) => {
  /* 
  Validates and trims a string.

  str = Variable
  varName = String (variable name)
  
  Returns String
  */
  let strName = varName || "String variable";
  if (!str) throw `Error: ${strName} not provided`;
  if (typeof str !== "string" || str.trim().length === 0)
    throw `Error: ${strName} must be a non-empty string.`;
  str = str.trim();
  return str;
};

export const checkName = (name, stringName) => {
  name = validStr(name, "Name");
  if (!/^[a-zA-Z]+/.test(name)) {
    throw `Error: ${stringName} cannot contain any spaces or numbers`;
  }
  if (name.length < 2 || name.length > 25) {
    throw `Error: ${stringName} cannot be less than 2 or greater than 25 characters`;
  }
  return name;
};

const validStrArr = (arr, varName) => {
  /* 
  Validates a string array and trims each element.

  arr = Variable
  varName = String (variable name)
  
  Returns Array of Strings
  */
  let arrName = varName || "String array";
  if (!arrName) throw `Error: ${arrName} not provided`;
  if (!Array.isArray) throw `Error: ${arrName} must be an array`;
  for (let elem of arr) {
    if (typeof elem !== "string" || elem.trim().length === 0)
      throw `Error: ${arrName} must contain only non-empty string elements`;
    elem = elem.trim();
  }
  return arr;
};

const validNumber = (num, varName, isInteger, rangeLow, rangeHigh) => {
  /* 
  Validates a number and returns it.

  num = Variable
  varName = String (variable name)
  isInteger = Boolean
  rangeLow = Number
  rangeHigh = Number

  Returns Number
  */
  let numName = varName || "Number variable";
  if (num === undefined) throw `Error: ${numName} not provided`;
  if (
    typeof num !== "number" ||
    isNaN(num) ||
    num == Infinity ||
    num == -Infinity
  )
    throw `Error: ${numName} must be a real number`;
  if (isInteger && Math.floor(num) != num)
    throw `Error: ${numName} must be a whole number`;
  if (rangeLow !== undefined) {
    if (num < rangeLow)
      throw `Error: ${numName} must be greater than ${rangeLow}.`;
  }
  if (rangeHigh !== undefined) {
    if (num > rangeHigh)
      throw `Error: ${numName} must be less than ${rangeHigh}.`;
  }
  return num;
};

const validAddressLine = (line) => {
  line = validStr(line, "Adress line");
  let newLine = line.split(" ");
  let num = newLine[0];
  num = validNumber(parseInt(num.trim()), "Street number", true, 0, 99999);
  return line;
}

const validAddress = async (addressLine, city, state, zip/*, key*/) => {
  if (addressLine != "") {
    addressLine = validAddressLine(addressLine);
  }
  else {
    addressLine = "";
  }
  city = validStr(city, "City");
  state = validState(state);
  zip = validZip(zip);

  let address = addressLine + " " + city + " " + state + " " + zip;
  // console.log(address)

  try {
    //console.log("A");
    const result = await geocoder.geocode(address);
    //console.log(result)
    if (result.length === 0) {
      // console.log("inner");
      return false;
    }
    //console.log("MIDDLE");
    const { latitude, longitude } = result[0];
    //console.log(`The latitude and longitude of ${address} are: ${latitude}, ${longitude}`);
  }
  catch (e) {
    //console.log(result);
    //console.log("Caught in validaddress");
    //console.log(e);
    //console.error(e);
    return false;
  }
  return true;
};

const validState = (state) => {
  /*
  Validates a 2 letter state abbreviation and returns it trimmed.
  */
  state = validStr(state, "State"); //check and trim string
  if (state.length != 2) {
    throw `Error: State must be its 2 letter abbreviation.`;
  }
  state = state.toUpperCase();

  let states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "DC",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];
  if (!states.includes(state)) {
    throw `Error: State must be valid state.`;
  }
  return state;
};

const validZip = (zip) => {
  /*
  Verifies that a given U.S. zip code is valid
  */
  validStr(zip, "Zip");
  zip = zip.trim();
  let isValid = /^\d{5}(?:[-\s]\d{4})?$/.test(zip);
  if (!isValid) {
    throw "Error: Invalid US Zip Code";
  }
  return zip;
};

const validTime = (time, isEndTime) => {
  /*
  (string, boolean)
  Verifies the time is a string in HH:MM format (military time)
  isEndTime boolean -> 24:00 is only valid if it is a closing time or booking end time
    true if courtClosing time or if endTime
    false if anything else
  */
  time = validStr(time, "time");
  let timeArr = time.split(":");

  if (timeArr.length !== 2) {
    throw `Error: ${time} has incorrect number of :'s in ${time}`;
  }
  if (timeArr[0].length !== 2) {
    throw `Error: ${timeArr[0]} hour string has length ${timeArr[0].length}`;
  }
  if (timeArr[1].length !== 2) {
    throw `Error: ${timeArr[1]} minute string has length ${timeArr[1].length}`;
  }

  //check a number is at each location after splitting
  for (let i = 0; i < timeArr[0].length; i++) {
    if (timeArr[0].charCodeAt(i) < 48 || timeArr[0].charCodeAt(i) > 57) {
      throw `Error: ${timeArr[0][i]} is not a number`;
    }
  }
  for (let i = 0; i < timeArr[1].length; i++) {
    if (timeArr[1].charCodeAt(i) < 48 || timeArr[1].charCodeAt(i) > 57) {
      throw `Error: ${timeArr[1][i]} is not a number`;
    }
  }

  let timeHourString = timeArr[0];
  let timeMinuteString = timeArr[1];

  let timeHourInt = parseInt(timeHourString);
  let timeMinuteInt = parseInt(timeMinuteString);

  if (isNaN(timeHourInt) === true || isNaN(timeMinuteInt) === true) {
    throw "Error: HH:MM has converted to not a number";
  }

  //24:00 will only be a valid closingTime or endTime
  //00:00 converts to 24:00 if end time
  if (timeHourInt == 0 && timeMinuteInt == 0 && isEndTime == true) {
    timeHourInt = 24;
    timeMinuteInt = 0;
    time = "24:00";
  }
  if (timeHourInt < 0 || timeHourInt > 24) {
    throw `Error: ${timeHourInt} out of range 0 to 24`;
  }
  if (timeMinuteInt < 0 || timeMinuteInt > 59) {
    throw `Error: ${timeMinuteInt} out of range 0 to 59`;
  }
  if (
    !(
      timeMinuteInt == 0 ||
      timeMinuteInt == 15 ||
      timeMinuteInt == 30 ||
      timeMinuteInt == 45
    )
  ) {
    throw `Error: ${timeMinuteInt} not in typical 15 minute intervals`;
  }
  if (timeHourInt == 24 && timeMinuteInt > 0) {
    throw `Error: ${time} out of range`;
  }
  if (isEndTime == false && timeHourInt == 24 && timeMinuteInt == 0) {
    throw `Error: ${time} is only a valid time if it is a closingTime`;
  }
  return time;
};

const validTimeInRange = (startTime, endTime, courtOpening, courtClosing) => {
  /*
  valid time format is a string in HH:MM format (military time)
  startTime, endTime, courtOpening, courtClosing are received as strings in valid time format
  validTime must be called on these params before calling this function
  */

  let startTimeArr = startTime.split(":");
  let startTimeHourString = startTimeArr[0];
  let startTimeMinuteString = startTimeArr[1];
  let endTimeArr = endTime.split(":");
  let endTimeHourString = endTimeArr[0];
  let endTimeMinuteString = endTimeArr[1];

  let openingArr = courtOpening.split(":");
  let openingHourString = openingArr[0];
  let openingMinuteString = openingArr[1];
  let closingArr = courtClosing.split(":");
  let closingHourString = closingArr[0];
  let closingMinuteString = closingArr[1];

  let startTimeHourInt = parseInt(startTimeHourString);
  let startTimeMinuteInt = parseInt(startTimeMinuteString);
  let endTimeHourInt = parseInt(endTimeHourString);
  let endTimeMinuteInt = parseInt(endTimeMinuteString);

  let openingHourInt = parseInt(openingHourString);
  let openingMinuteInt = parseInt(openingMinuteString);
  let closingHourInt = parseInt(closingHourString);
  let closingMinuteInt = parseInt(closingMinuteString);

  if (startTimeHourInt > endTimeHourInt) {
    throw `Error: start time (${startTime}) should be before end time (${endTime})`;
  }
  if (
    openingHourInt > startTimeHourInt ||
    startTimeHourInt > endTimeHourInt ||
    endTimeHourInt > closingHourInt
  ) {
    throw `Error: Reservation must start and end between ${courtOpening} and ${courtClosing}`;
    //throw `Error: hours ${openingHourInt}, ${startTimeHourInt}, ${endTimeHourInt}, ${closingHourInt} are not in nondecreasing order`;
  }
  if (openingHourInt == startTimeHourInt) {
    if (openingMinuteInt > startTimeMinuteInt) {
      throw `Error: Reservation must start and end between ${courtOpening} and ${courtClosing}`;
      //throw `Error: ${courtOpening} minute is greater than ${startTime} minute`;
    }
  }
  if (startTimeHourInt == endTimeHourInt) {
    if (startTimeMinuteInt >= endTimeMinuteInt) {
      throw `Error: start time (${startTime}) should be before end time (${endTime})`;
      //throw `Error: ${startTime} minute is greater than or equal to ${endTime} minute`;
    }
  }
  if (endTimeHourInt == closingHourInt) {
    if (endTimeMinuteInt > closingMinuteInt) {
      throw `Error: Reservation must start and end between ${courtOpening} and ${courtClosing}`;
      //throw `Error: ${endTime} minute is greater than ${courtClosing} minute`;
    }
  }
  return true;
};

const validEmail = (email) => {
  validStr(email, "Email");
  email = email.trim();
  let isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValid) {
    throw "Error: Invalid email address";
  }
  return email;
};

const validExpLevel = (level) => {
  validStr(level, "Level");
  level = level.trim().toLowerCase();
  if (
    level !== "beginner" &&
    level !== "intermediate" &&
    level !== "advanced"
  ) {
    throw "Error: invalid experience level";
  }
  return level;
};

const validDate = (date) => {
  //does not account for leap years or months with under 31 days
  //Format: MM/DD/YYYY

  date = validStr(date, "Date");
  if (typeof date !== "string") {
    throw `Error: ${date} is not a string`;
  }
  let dateArr = date.split("/");
  if (dateArr.length !== 3) {
    throw "Error: weird number of /'s";
  }
  if (dateArr[0].length !== 2) {
    throw "Error: month string length too big or small";
  }
  if (dateArr[1].length !== 2) {
    throw "Error: day string length too big or small";
  }
  if (dateArr[2].length !== 4) {
    throw "Error: year string length too big or small";
  }
  //check a number is at each location
  for (let i = 0; i < dateArr[0].length; i++) {
    if (dateArr[0].charCodeAt(i) < 48 || dateArr[0].charCodeAt(i) > 57) {
      throw `Error: ${dateArr[0][i]} is not a number`;
    }
  }
  for (let i = 0; i < dateArr[1].length; i++) {
    if (dateArr[1].charCodeAt(i) < 48 || dateArr[1].charCodeAt(i) > 57) {
      throw `Error: ${dateArr[1][i]} is not a number`;
    }
  }
  for (let i = 0; i < dateArr[2].length; i++) {
    if (dateArr[2].charCodeAt(i) < 48 || dateArr[2].charCodeAt(i) > 57) {
      throw `Error: ${dateArr[2][i]} is not a number`;
    }
  }

  let monthString = dateArr[0];
  let dayString = dateArr[1];
  let yearString = dateArr[2];

  let monthInt = parseInt(monthString);
  let dayInt = parseInt(dayString);
  let yearInt = parseInt(yearString);

  if (
    isNaN(monthInt) === true ||
    isNaN(dayInt) === true ||
    isNaN(yearInt) === true
  ) {
    throw "Error: MM/DD/YYYY has converted to not a number";
  }

  if (monthInt < 0 || monthInt > 12) {
    throw "Error: month out of range";
  }
  if (dayInt < 1 || dayInt > 31) {
    throw "Error: day out of range";
  }
  if (yearInt < 2000 || yearInt > 2024) {
    throw "Error: year out of range";
  }
  //uses moment package
  if (moment(date, "MM/DD/YYYY", "en", true).isValid() == false) {
    throw `Error: ${date} does not exist (via moment package)`;
  }
  return date;
};

const validImageUrl = (url) => {
  const imageExtensions = /(jpg|png|gif)$/i;
  if (imageExtensions.test(url) === false) {
    throw "Error: not a valid image url";
  }
  return url.trim();
};

const checkPassword = (password) => {
  validStr(password, "Password");

  if (password.split(" ").length > 1) {
    throw `Error: Password cannot contain spaces`;
  }
  if (password.length < 8) {
    throw `Error: Password length must be at least 8`;
  }
  if (!/[A-Z]/.test(password)) {
    throw `Error: Password must contain at least one uppercase character`;
  }
  if (!/\d/.test(password)) {
    throw `Error: Password must contain at least one number`;
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    throw `Error: Password must contain at least one special character`;
  }
  return password;
};

const validSport = (sport) => {
  sport = validStr(sport, "Sport").toLowerCase();
  if (sport == "n/a") throw "Select a Sport";

  let sports = ["basketball", "tennis", "pickleball", "volleyball"];
  if (!sports.includes(sport)) throw "Invalid Sport";

  return sport;
};

const validUsername = (username) => {
  username = validStr(username, "Username");
  if (username.length < 6) {
    throw 'Username must be at least 6 characters'
  }
  return username;
};

const militaryToStandard = (militaryTime) => {
  let arr = militaryTime.split(':');
  let hours = parseInt(arr[0]);
  let minutes = arr[1];
  let amPm = (hours < 12) ? "AM" : "PM";

  if (hours === 0) {
    hours = 12;
  }
  else if (hours > 12) {
    hours -= 12;
  }

  let standard = hours + ':' + minutes + ' ' + amPm;
  return standard;
}

export {
  isAuth,
  validId,
  validStr,
  validStrArr,
  validNumber,
  validAddressLine,
  validAddress,
  validState,
  validZip,
  validTime,
  validTimeInRange,
  validEmail,
  validExpLevel,
  validDate,
  validImageUrl,
  checkPassword,
  validSport,
  validUsername,
  militaryToStandard
};
// console.log(await validAddress("not existing 15 Drive", "do not care", "MOO", "10309", 'AIzaSyA4UJGUMNxXEATNsR9D7tBQspRyLwTdHBY'));
// console.log(validAddressLine("kdjfn   washINGton   street"))

// console.log(await validAddress("this is terrible 100 Washington Street", "Hoboken", "HI", "07030", 'AIzaSyA4UJGUMNxXEATNsR9D7tBQspRyLwTdHBY'));

// console.log(await validAddress("100 Washington Street", "Hoboken", "NJ", "07030"));
