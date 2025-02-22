export const sanitizeInput = (req, res, next) => {
    if (req.body.email) {
        req.body.email = req.body.email.toLowerCase().trim();
    }

    if (req.body.phoneNumber) {
        req.body.phoneNumber = req.body.phoneNumber.replace(/[^\d+]/g, '');
    }

    next();
};