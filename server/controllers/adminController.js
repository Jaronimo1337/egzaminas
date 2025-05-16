import User from '../models/userModel.js';
import Secret from '../models/userSecretModel.js';
import { sha256 } from 'js-sha256';
import { sha1 } from 'js-sha1';

// Gauti visus naudotojus + vaidmenis
export const getAllUsersWithRoles = async (req, res) => {
    try {
        const users = await User.findAll();

        const usersWithRoles = await Promise.all(
            users.map(async (user) => {
                const secret = await Secret.findOne({
                    where: { userId: user.id },
                });
                return {
                    ...user.dataValues,
                    role: secret?.role || 'unknown',
                };
            })
        );

        res.status(200).json({
            status: 'success',
            data: usersWithRoles,
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
// Uždrausti naudotoją
export const banUser = async (req, res) => {
    const { id } = req.params;
    const secret = await Secret.findOne({ where: { userId: id } });
    if (!secret) return res.status(404).json({ error: 'User not found' });

    secret.role = 'banned';
    await secret.save();

    res.status(200).json({ message: `Vartotojui ${id} uždrausta` });
};
// Ištrinti naudotoją
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await Event.destroy({ where: { user_id: id } });
        await Secret.destroy({ where: { userId: id } });
        await User.destroy({ where: { id } });

        res.status(204).send();
    } catch (err) {
        console.error('Klaida tryniant naudotoją:', err);
        res.status(500).json({ error: 'Nepavyko ištrinti naudotojo' });
    }
};

// Naudotojo vaidmens keitimas
export const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const secret = await Secret.findOne({ where: { userId: id } });
    if (!secret) return res.status(404).json({ error: 'User not found' });

    secret.role = role;
    await secret.save();

    res.status(200).json({
        message: `Vartotojo vaidmuo atnaujintas į "${role}"`,
    });
};
// Naujo naudotojo kūrimas
export const createUser = async (req, res) => {
    const { username, password, email, contacts, role } = req.body;
    const now = new Date();
    const salt = sha256(sha1(now.toString() + username));
    const hashedPassword = sha256(sha1(password + salt));

    const user = await User.create({
        username: username,
        email: email,
        contacts: contacts,
    });

    await Secret.create({
        userId: user.id,
        password: `${hashedPassword}:${salt}`,
        role: role,
    });

    await Event.create({
        user_id: user.id,
        product_id: null,
        type_id: 1,
        target_id: 1,
        description: `Sukurtas vartotojas: ${username}`,
    });

    res.status(201).json({
        status: 'success',
        data: user,
    });
};
// Naudotojo duomenų redagavimas
export const updateUserData = async (req, res, next) => {
    const { id } = req.params;
    const { username, email, contacts } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'Vartotojas nerastas' });
        }

        const existing = await User.findOne({ where: { username } });
        if (existing && existing.id !== Number(id)) {
            return res
                .status(400)
                .json({ error: 'Toks naudotojo vardas jau egzistuoja.' });
        }

        user.username = username || user.username;
        user.email = email || user.email;
        user.contacts = contacts || user.contacts;
        await user.save();

        res.status(200).json({
            message: 'Naudotojas sėkmingai atnaujintas',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.findAll({
            include: [
                { association: 'eventType' },
                { association: 'eventTarget' },
                { association: 'user' },
            ],
            order: [['timestamp', 'DESC']],
        });

        res.status(200).json(events);
    } catch (error) {
        console.error('Klaida gaunant įvykius:', error);
        res.status(500).json({ message: 'Nepavyko gauti įvykių' });
    }
};
