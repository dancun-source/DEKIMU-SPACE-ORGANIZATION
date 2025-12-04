const mongoose = require('mongoose');
const User = require('./server/models/User');
const dotenv = require('dotenv');

dotenv.config();

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'admin@dekimu.org';
        let user = await User.findOne({ email });

        if (!user) {
            console.log('Admin user not found, creating a new one...');
            user = await User.create({
                name: 'Dekimu Admin',
                email,
                phone: '0700000000',
                password: 'Dekimu@2025',
                role: 'admin'
            });
            console.log('Admin user created.');
        } else {
            // Ensure this user is admin and reset password to a known value
            user.role = 'admin';
            user.password = 'Dekimu@2025';
            await user.save();
            console.log(`${user.name} is now an Admin and password has been reset.`);
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

makeAdmin();
