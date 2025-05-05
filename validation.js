/**
 * Form validation utility functions for ECG Competition website
 */

// Email validation using regex
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return {
        valid: emailRegex.test(email),
        message: emailRegex.test(email) ? '' : 'Please enter a valid email address'
    };
}

// Password validation (min 8 chars, at least one number, one uppercase, one lowercase)
function validatePassword(password) {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    
    const valid = minLength && hasNumber && hasUppercase && hasLowercase;
    
    let message = '';
    if (!valid) {
        message = 'Password must be at least 8 characters long and contain at least one number, one uppercase letter, and one lowercase letter';
    }
    
    return { valid, message };
}

// Team name validation (3-30 chars, alphanumeric + spaces)
function validateTeamName(teamName) {
    const teamNameRegex = /^[a-zA-Z0-9 ]{3,30}$/;
    return {
        valid: teamNameRegex.test(teamName),
        message: teamNameRegex.test(teamName) ? '' : 'Team name must be 3-30 characters long and contain only letters, numbers, and spaces'
    };
}

// Algorithm name validation (3-50 chars, alphanumeric + spaces)
function validateAlgorithmName(algorithmName) {
    const algorithmNameRegex = /^[a-zA-Z0-9 ]{3,50}$/;
    return {
        valid: algorithmNameRegex.test(algorithmName),
        message: algorithmNameRegex.test(algorithmName) ? '' : 'Algorithm name must be 3-50 characters long and contain only letters, numbers, and spaces'
    };
}

// File validation
function validateFile(file, expectedType) {
    if (!file) {
        return {
            valid: false,
            message: 'Please select a file'
        };
    }
    
    if (expectedType === 'zip') {
        return {
            valid: file.name.toLowerCase().endsWith('.zip'),
            message: file.name.toLowerCase().endsWith('.zip') ? '' : 'Please upload a .zip file'
        };
    }
    
    if (expectedType === 'mat') {
        return {
            valid: file.name.toLowerCase().endsWith('.mat'),
            message: file.name.toLowerCase().endsWith('.mat') ? '' : 'Please upload a .mat file'
        };
    }
    
    return { valid: true, message: '' };
}

// Display validation errors
function displayValidationError(inputElement, errorMessage) {
    // Remove any existing error message
    const existingError = inputElement.parentElement.querySelector('.validation-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message if one exists
    if (errorMessage) {
        const errorElement = document.createElement('div');
        errorElement.className = 'validation-error';
        errorElement.textContent = errorMessage;
        inputElement.parentElement.appendChild(errorElement);
        inputElement.classList.add('invalid');
    } else {
        inputElement.classList.remove('invalid');
    }
}

// Clear validation errors
function clearValidationErrors(formElement) {
    const errorElements = formElement.querySelectorAll('.validation-error');
    errorElements.forEach(el => el.remove());
    
    const invalidInputs = formElement.querySelectorAll('.invalid');
    invalidInputs.forEach(input => input.classList.remove('invalid'));
}

// Validate form inputs in real-time
function setupLiveValidation(inputElement, validationFunction) {
    // Validate on blur
    inputElement.addEventListener('blur', () => {
        const { valid, message } = validationFunction(inputElement.value);
        displayValidationError(inputElement, valid ? '' : message);
    });
    
    // Clear error on focus
    inputElement.addEventListener('focus', () => {
        const errorElement = inputElement.parentElement.querySelector('.validation-error');
        if (errorElement) {
            errorElement.remove();
        }
        inputElement.classList.remove('invalid');
    });
} 