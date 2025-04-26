const User = require('../models/User');

const updateInterests = async (req, res) => {
    const { email, interest } = req.body;
    try {
        const user = await User.findOne({ email });

        user.interests.push(interest);
        await user.save();
        console.log(user.interests);
        return res.status(200).json({ message: `Interest ${interest} updated successfully` });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const getInterests = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        console.log(user.interests);
        return res.status(200).json({ interests: user.interests });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const deleteInterests = async (req, res) => {
    const { email, interest } = req.body;
    try {
        const user = await User.findOne({ email });
        const interests = user.interests;
        const updatedInterests = interests.filter((item) => item !== interest);
        user.interests = updatedInterests;
        console.log(updatedInterests);
        await user.save();
        return res.status(200).json({ message: `Interest ${interest} deleted successfully`, interests: updatedInterests });
    }
    catch (err) {
        console.log(err);
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { updateInterests, getInterests, deleteInterests };