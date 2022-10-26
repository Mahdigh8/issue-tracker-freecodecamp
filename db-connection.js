const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected To DB');
  })
  .catch((err) => console.log(err));
