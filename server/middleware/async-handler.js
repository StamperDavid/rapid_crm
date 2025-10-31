/**
 * Async Handler Middleware
 *
 * Wraps route handlers to automatically catch async errors and pass them to the error handler.
 * Eliminates the need for try/catch blocks in every route.
 *
 * Usage:
 * app.get('/api/companies', asyncHandler(async (req, res) => {
 *   const companies = await runQuery('SELECT * FROM companies');
 *   res.json(companies);
 * }));
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
