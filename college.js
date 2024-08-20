const mongoose = require('mongoose');


const collegeSchema = new mongoose.Schema({
    'College Name': String,
    'Campus Size': String,
    'Total Student Enrollments': String,
    'Total Faculty': String,
    'Established Year': String,
    'Rating': String,
    'University': String,
    'Courses': [String],
    'Facilities': [String],
    'City': String,
    'State': String,
    'Country': String,
    'College Type': String,
    'Average Fees': String,
});


const College = mongoose.model('College', collegeSchema);

module.exports = College;
