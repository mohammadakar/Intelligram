const asyncHandler = require("express-async-handler");
const { validateRegisterUser, User, validateLoginUser } = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const SendEmail = require("../utils/SendEmail");
const { VerificationToken } = require("../Models/VerificationToken");

// Euclidean distance function
function euclideanDistance(a, b) {
    if (a.length !== b.length) return Infinity;
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
}

// Normalization helper: converts an embedding to a unit vector.
function normalize(embedding) {
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (norm === 0) return embedding;
    return embedding.map(val => val / norm);
}

// Register new account
module.exports.RegisterUser = asyncHandler(async (req, res) => {
    const { error } = validateRegisterUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        faceEmbeddings: req.body.faceEmbeddings, // Should be an array of numbers
    });
    await user.save();

    const verificationToken = new VerificationToken({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
    });
    await verificationToken.save();

    const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;

    const htmlTemplate = `
        <div>
          <p>Click on the link below to verify your email</p>
          <a href="${link}">Verify</a>
        </div>
    `;

    await SendEmail(user.email, "Verify Your Email", htmlTemplate);

    res.status(201).json({ message: "We sent to you an email, please verify your email address" });
});

// Login with email and password
module.exports.loginUser = asyncHandler(async (req, res) => {
    const { error } = validateLoginUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password!" });
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid email or password!" });
    }

    if (!user.isAccountVerified) {
        let verificationToken = await VerificationToken.findOne({ userId: user._id });
        if (!verificationToken) {
            verificationToken = new VerificationToken({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            });
            await verificationToken.save();
        }

        const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;

        const htmlTemplate = `
          <div>
              <p>Click on the link below to verify your email</p>
              <a href="${link}">Verify</a>
          </div>
        `;

        await SendEmail(user.email, "Verify Your Email", htmlTemplate);

        return res.status(400).json({ message: "We sent to you an email, please verify your email address" });
    }

    const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '3h' }
    );

    res.status(200).json({
        _id: user._id,
        isAdmin: user.isAdmin,
        profilePhoto: user.profilePhoto,
        token,
        username: user.username,
        following: user.following,
        followers: user.followers,
        bio: user.bio,
    });
});

// Login with your face id
module.exports.FaceIdLogin = asyncHandler(async (req, res) => {
    try {
        const { embedding } = req.body; // Expect a plain array from the client
        if (!embedding || !Array.isArray(embedding)) {
            return res.status(400).json({ message: "Invalid embedding provided" });
        }
        console.log("Received embedding (length):", embedding.length);

        // Normalize the received embedding
        const normalizedReceived = normalize(embedding);

        const users = await User.find();
        let matchedAccounts = [];

        for (let user of users) {
            let storedEmbedding = user.faceEmbeddings;
            if (!storedEmbedding) {
                console.log("Skipping user (no embedding stored)");
                continue;
            }
            // If storedEmbedding is not an array, try to parse it
            if (!Array.isArray(storedEmbedding)) {
                try {
                    storedEmbedding = JSON.parse(storedEmbedding);
                } catch (err) {
                    console.log("Skipping user due to invalid stored embedding format");
                    continue;
                }
            }
            // If storedEmbedding is an array with one element and that element is a string, try to parse that element
            if (storedEmbedding.length === 1 && typeof storedEmbedding[0] === "string") {
                try {
                    let fixed = storedEmbedding[0].replace(/'/g, '"');
                    let parsed = JSON.parse(fixed);
                    if (Array.isArray(parsed) && parsed.length === normalizedReceived.length) {
                        storedEmbedding = parsed;
                    } else if (Array.isArray(parsed) && parsed.length === 1 && typeof parsed[0] === "object") {
                        // In case parsed is like [ { '0': ..., '1': ..., ... } ]
                        let newEmbedding = [];
                        for (let i = 0; i < normalizedReceived.length; i++) {
                            newEmbedding.push(Number(parsed[0][i]));
                        }
                        storedEmbedding = newEmbedding;
                    } else {
                        console.log("Skipping user due to unexpected parsed structure");
                        continue;
                    }
                } catch (e) {
                    console.log("Skipping user due to invalid stored embedding string format", e);
                    continue;
                }
            }
            // If storedEmbedding is still an array with one element but that element is an object,
            // then attempt to convert it.
            if (storedEmbedding.length === 1 && typeof storedEmbedding[0] === "object") {
                const obj = storedEmbedding[0];
                let newEmbedding = [];
                for (let i = 0; i < normalizedReceived.length; i++) {
                    newEmbedding.push(Number(obj[i]));
                }
                storedEmbedding = newEmbedding;
            }

            // Now storedEmbedding should be a plain array of numbers.
            if (!Array.isArray(storedEmbedding) || storedEmbedding.length !== normalizedReceived.length) {
                console.log(
                    "Skipping user due to invalid stored embedding length:",
                    Array.isArray(storedEmbedding) ? storedEmbedding.length : "not an array",
                    "expected:", normalizedReceived.length
                );
                continue;
            }
            console.log("Stored embedding length:", storedEmbedding.length, "vs. Received embedding length:", normalizedReceived.length);

            const normalizedStored = normalize(storedEmbedding);
            const distance = euclideanDistance(normalizedStored, normalizedReceived);
            console.log("Computed Euclidean distance:", distance);

            // Use a strict threshold; adjust this value based on your data
            if (distance < 0.3) {
                if (!user.isAccountVerified) {
                    let verificationToken = await VerificationToken.findOne({ userId: user._id });
                    if (!verificationToken) {
                        verificationToken = new VerificationToken({
                            userId: user._id,
                            token: crypto.randomBytes(32).toString("hex")
                        });
                        await verificationToken.save();
                    }
                    const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;
                    const htmlTemplate = `
                        <div>
                          <p>Click on the link below to verify your email</p>
                          <a href="${link}">Verify</a>
                        </div>
                    `;
                    await SendEmail(user.email, "Verify Your Email", htmlTemplate);
                    return res.status(400).json({ message: "We sent to you an email, please verify your email address" });
                }
                matchedAccounts.push(user);
            }
        }

        if (matchedAccounts.length === 0) {
            return res.status(401).json({ message: "Face not recognized" });
        } else if (matchedAccounts.length === 1) {
            const user = matchedAccounts[0];
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "3h" });
            return res.status(200).json({ 
                _id: user._id,
                isAdmin: user.isAdmin,
                profilePhoto: user.profilePhoto,
                token,
                username: user.username,
                following: user.following,
                followers: user.followers,
                bio: user.bio,
                multiple: false
            });
        } else {
            const accounts = matchedAccounts.map(user => ({
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePhoto: user.profilePhoto
            }));
            return res.status(200).json({
                multiple: true,
                accounts: accounts
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during face login" });
    }
});




// Verify your account after registration
module.exports.verifyUserAccountCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
        return res.status(400).json({ message: "Invalid link" });
    }

    const verificationToken = await VerificationToken.findOne({
        userId: user._id,
        token: req.params.token,
    });

    if (!verificationToken) {
        return res.status(400).json({ message: "Invalid link" });
    }

    user.isAccountVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ _id: verificationToken._id });

    res.status(200).json({ message: "Your account verified" });
});

// Select account you want to login if you have more than one with the same face id
module.exports.selectAccount = asyncHandler(async (req, res) => {
    const { accountId } = req.body;
    if (!accountId) {
        return res.status(400).json({ message: "Account ID is required" });
    }
    const user = await User.findById(accountId);
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    if (!user.isAccountVerified) {
        return res.status(400).json({ message: "Account is not verified" });
    }
    const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    res.status(200).json({
        _id: user._id,
        isAdmin: user.isAdmin,
        profilePhoto: user.profilePhoto,
        token,
        username: user.username,
    });
});
