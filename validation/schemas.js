const joi = require('joi');

const registerSchema = joi.object({
  name: joi.string().required().trim(),
  email: joi.string().email().required().trim().lowercase(),
  phoneNumber: joi.string().required().trim(),
  gender: joi.string().required().valid('Male', 'Female', 'Other'),
  monthlyIncome: joi.number().optional().allow(null),
  password: joi.string().min(6).required(),
  confirmPassword: joi.string().valid(joi.ref('password')).required()
});

const loginSchema = joi.object({
  email: joi.string().email().required().trim().lowercase(),
  password: joi.string().required()
});

const phoneSchema = joi.object({
  phoneName: joi.string().required().trim(),
  price: joi.number().required(),
  isIOS: joi.boolean().optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  phoneSchema
};
