const prisma = require("../../../shared/utils/prisma");

const findByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const findById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const create = async (userData) => {
  return prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || "STUDENT",
    },
  });
};

module.exports = {
  findByEmail,
  findById,
  create,
};
