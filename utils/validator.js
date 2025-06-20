const Joi = require('joi');

const userValidationSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .trim()
        .messages({
            'string.empty': 'Name cannot be empty',
            'string.min': 'Name should have at least 2 characters',
            'string.max': 'Name cannot be longer than 50 characters'
        }),

    fullname: Joi.string()
        .min(10)
        .max(80)
        .required()
        .trim()
        .messages({
            'string.pattern.base': 'Full name can only contain letters and spaces',
            'string.empty': 'Full name cannot be empty',
            'string.min': 'Full name should have at least 10 characters',
            'string.max': 'Full name cannot be longer than 80 characters'
        }),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: true } })
        .required()
        .lowercase()
        .trim()
        .messages({
            'string.email': 'Please enter a valid email address',
            'string.empty': 'Email cannot be empty'
        }),

    password: Joi.string()
        .min(8)
        .max(50)
        .required()
        .messages({
          
            'string.empty': 'Password cannot be empty',
            'string.min': 'Password should have at least {#limit} characters',
            'string.max': 'Password cannot be longer than {#limit} characters'
        }),

    roles: Joi.string()
        .required()
        .messages({
            'string.empty': 'roles cannot be empty',
        }),

    department: Joi.string()
    .required()
    .messages({
        'string.empty': 'department cannot be empty',
    }),
       gender: Joi.string()
    .required()
    .messages({
        'string.empty': 'Gender cannot be empty',
    })
});

const patientregister = Joi.object({
    name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .trim()
    .messages({
        'string.empty': 'Name cannot be empty',
        'string.min': 'Name should have at least 2 characters',
        'string.max': 'Name cannot be longer than 50 characters'
    }),

fullname: Joi.string()
    .min(10)
    .max(80)
    .required()
    .trim()
    .messages({
        'string.pattern.base': 'Full name can only contain letters and spaces',
        'string.empty': 'Full name cannot be empty',
        'string.min': 'Full name should have at least 10 characters',
        'string.max': 'Full name cannot be longer than 80 characters'
    }),

email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: true } })
    .required()
    .lowercase()
    .trim()
    .messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email cannot be empty'
    }),

password: Joi.string()
    .min(5)
    .max(50)
    .required()
    .messages({
      
        'string.empty': 'Password cannot be empty',
        'string.min': 'Password should have at least {#limit} characters',
        'string.max': 'Password cannot be longer than {#limit} characters'
    }),

roles: Joi.string()
    .required()
    .messages({
        'string.empty': 'roles cannot be empty',
    }),
    gender: Joi.string()
    .required()
    .messages({
        'string.empty': 'Gender cannot be empty',
    })


}) 


module.exports = {userValidationSchema,patientregister}; 