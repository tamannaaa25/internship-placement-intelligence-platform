const authService = require("../services/auth.service");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

const register = async (req, res, next) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);

    const result = await authService.register(
      validatedData.name,
      validatedData.email,
      validatedData.password
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    const result = await authService.login(
      validatedData.email,
      validatedData.password
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
