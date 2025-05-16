import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Rating from "../models/ratingModel.js";
import { Op } from "sequelize";
import AppError from "../utilities/AppError.js";

const getProductCommentsById = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({ message: "Netinkamas produkto ID" });
    }

    const product = await Product.findOne({ where: { id: productId } });

    if (!product) {
      return res.status(404).json({ message: "Produktas nerastas" });
    }

    const ratings = await Rating.findAll({
      where: { product_id: productId },
    });

    if (ratings.length === 0) {
      return res.status(200).json({
        message: "Komentarų nėra",
        data: [],
        avgRating: 0,
        totalRatings: 0,
      });
    }

    const userIds = [...new Set(ratings.map((rating) => rating.user_id))];

    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
    });

    const userMap = {};
    users.forEach((user) => {
      userMap[user.id] = user;
    });

    let totalStars = 0;

    const comments = ratings
      .map((rating) => {
        totalStars += rating.stars;
        return {
          id: rating.id,
          username: userMap[rating.user_id]?.username || "Nežinomas",
          comment: rating.comment,
          stars: rating.stars,
          timestamp: rating.createdAt,
        };
      })
      .filter((comment) => comment.comment);

    const avgRating = +(totalStars / ratings.length).toFixed(2);

    return res.json({
      avgRating,
      totalRatings: ratings.length,
      data: comments,
    });
  } catch (err) {
    console.error("Klaida gaunant komentarus:", err);
    return res.status(500).json({ message: "Klaida gaunant komentarus" });
  }
};

const createComment = async (req, res, next) => {
  try {
    const { id } = res.locals;
    const { product_id, comment, stars } = req.body;

    const newComment = await Rating.create({
      user_id: id,
      product_id,
      comment,
      stars: parseInt(stars),
    });

    if (!newComment) {
      throw new AppError("Nepavyko sukurti komentaro", 500);
    }

    res.status(201).json({
      status: "success",
      data: newComment.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

const editComment = async (req, res, next) => {
  try {
    const { id } = res.locals;
    const { commentId } = req.params;
    const { product_id, comment, stars, image_url } = req.body;
    const foundComment = await Rating.findByPk(commentId);
    if (!foundComment) {
      throw new AppError("Comment not found", 404);
    }
    if (foundComment.user_id !== id) {
      throw new AppError("Forbidden to edit other user's comments", 403);
    }
    foundComment.product_id = product_id || foundComment.product_id;
    foundComment.comment = comment || foundComment.comment;
    foundComment.stars =
      stars !== undefined ? parseInt(stars) : foundComment.stars;
    foundComment.image_url = image_url || foundComment.image_url;
    await foundComment.save();
    res.status(200).json({
      status: "success",
      message: "Comment updated successfully",
      data: foundComment.dataValues,
    });
  } catch (error) {
    next(error);
  }
};

const getUserComments = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (!userId) {
      return res.status(400).json({ message: "Neteisingas vartotojo ID" });
    }

    const comments = await Rating.findAll({
      where: { user_id: userId },
    });

    if (comments.length === 0) {
      return res
        .status(200)
        .json({ message: "Komentarų šiam vartotojui nerasta" });
    }

    return res.json({ data: comments });
  } catch (error) {
    console.error("Klaida gaunant vartotojo komentarus:", error);
    return res.status(500).json({ message: "Serverio klaida" });
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { id } = res.locals;
    const { commentId } = req.params;

    const comment = await Rating.findByPk(commentId);

    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    if (comment.user_id !== id) {
      throw new AppError(
        "Forbidden: You cannot delete another user's comment",
        403
      );
    }

    await comment.destroy();

    res.status(200).json({
      status: "success",
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  getProductCommentsById,
  createComment,
  getUserComments,
  editComment,
  deleteComment,
};
