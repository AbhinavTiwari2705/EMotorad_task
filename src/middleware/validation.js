export const validateIdentifyInput = (req, res, next) => {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'At least one contact method (email or phoneNumber) is required'
        });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid email format'
        });
    }

    if (phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid phone number format'
        });
    }

    next();
};
