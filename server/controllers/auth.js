import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../logger.js";
// import elasticClient from "../elastic-client.js";


/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });
    const savedUser = await newUser.save();
    var message = `User ${savedUser.email}: registered.`;
    logger.info(message);

    // const result = await elasticClient.index({
    //   index: "users",
    //   document: {
    //     userId: savedUser._id,
    //     firstName: savedUser.firstName,
    //     lastName: savedUser.lastName,
    //     location: savedUser.location,
    //     occupation: savedUser.occupation,
    //     viewedProfile: savedUser.viewedProfile,
    //     impressions: savedUser.impressions,
    //   },
    // });

    // console.log(result)
    res.status(201).json(savedUser);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    var message = `User ${user.email}: logged in.`
    logger.info(message);

    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

