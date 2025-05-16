const zalgoRegex = new RegExp(process.env.ZALGO_REGEX);

const validateSearchQuery = (req, res, next) => {
    const { q } = req.query;
    const trimmed = q?.trim().toLowerCase();

    const isInvalid =
        !trimmed ||
        trimmed.length < 3 ||
        trimmed.length > 30 ||
        zalgoRegex.test(trimmed) ||
        !/^[a-zA-Z0-9 ]+$/.test(trimmed);

    if (isInvalid) {
        return res.status(400).json({ error: 'Invalid search query.' });
    }
    next();
};

export default validateSearchQuery;
