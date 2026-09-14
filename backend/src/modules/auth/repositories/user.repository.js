const User = require("../../../shared/models/User");

const findByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase().trim() });
};

const findById = async (id) => {
  return User.findById(id).select("name email role department graduationYear cgpa studentId createdAt updatedAt");
};

const create = async (userData) => {
  return User.create({
    name: userData.name,
    email: userData.email.toLowerCase().trim(),
    password: userData.password,
    role: userData.role || "STUDENT",
    department: userData.department || "Computer Science & Engineering",
    graduationYear: userData.graduationYear || 2025,
    cgpa: userData.cgpa || 0.0,
  });
};

module.exports = {
  findByEmail,
  findById,
  create,
};
