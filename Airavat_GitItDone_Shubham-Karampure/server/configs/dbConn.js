const mongoose = require('mongoose')

const dbConn = async () => {
    try {
        // console.log(process.env.DATABASE_URI),
        await mongoose.connect(process.env.DATABASE_URL, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
    }
    catch (err){
        console.log(err);
    }
}

module.exports = dbConn