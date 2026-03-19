const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.max(1, parseInt(limit) || 10);
    const offset = (parsedPage - 1) * parsedLimit;
    
    // Ensure values are valid integers for MySQL
    const safeLimit = parseInt(parsedLimit);
    const safeOffset = parseInt(offset);
    
    // Validate parameters are valid integers
    if (isNaN(safeLimit) || isNaN(safeOffset) || safeLimit < 1 || safeOffset < 0) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    let query = 'SELECT p.*, u.name as author_name, u.role as author_role, COUNT(DISTINCT c.id) as comments_count, COUNT(DISTINCT pl.id) as likes_count FROM posts p JOIN users u ON p.user_id = u.id LEFT JOIN comments c ON p.id = c.post_id LEFT JOIN post_likes pl ON p.id = pl.post_id';

    const params = [];

    if (category) {
      query += ' WHERE p.category = ?';
      params.push(category);
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    const [posts] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM posts';
    const countParams = [];

    if (category) {
      countQuery += ' WHERE category = ?';
      countParams.push(category);
    }

    const [countResult] = await pool.execute(countQuery, countParams);

    res.json({
      posts,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / parsedLimit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Failed to get posts' });
  }
});

// Get single post with comments
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get post details
    const [posts] = await pool.execute(
      'SELECT p.*, u.name as author_name, u.role as author_role FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?',
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = posts[0];

    // Get comments
    const [comments] = await pool.execute(
      'SELECT c.*, u.name as commenter_name, u.role as commenter_role FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC',
      [id]
    );

    // Get likes count
    const [likesResult] = await pool.execute(
      'SELECT COUNT(*) as likes_count FROM post_likes WHERE post_id = ?',
      [id]
    );

    post.comments = comments;
    post.likes_count = likesResult[0].likes_count;

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Failed to get post' });
  }
});

// Create new post
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('content').trim().isLength({ min: 10 }).withMessage('Content must be at least 10 characters'),
  body('category').optional().trim().isLength({ max: 50 }).withMessage('Category must not exceed 50 characters')
], async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const userId = req.user.id;
    const { title, content, category = 'general' } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO posts (user_id, title, content, category) VALUES (?, ?, ?, ?)',
      [userId, title, content, category]
    );

    res.status(201).json({
      message: 'Post created successfully',
      postId: result.insertId
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// Add comment to post
router.post('/:id/comments', authenticateToken, [
  body('comment').trim().isLength({ min: 1 }).withMessage('Comment cannot be empty')
], async (req, res) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { id: postId } = req.params;
    const userId = req.user.id;
    const { comment } = req.body;

    // Check if post exists
    const [posts] = await pool.execute('SELECT id FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const [result] = await pool.execute(
      'INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)',
      [postId, userId, comment]
    );

    res.status(201).json({
      message: 'Comment added successfully',
      commentId: result.insertId
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

// Like/unlike post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    // Check if post exists
    const [posts] = await pool.execute('SELECT id FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already liked
    const [existingLikes] = await pool.execute(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    if (existingLikes.length > 0) {
      // Unlike
      await pool.execute(
        'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );
      res.json({ message: 'Post unliked', liked: false });
    } else {
      // Like
      await pool.execute(
        'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
        [postId, userId]
      );
      res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to like/unlike post' });
  }
});

module.exports = router;
