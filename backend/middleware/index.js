// backend/middleware/index.js
export { protect } from './auth.js';
export { adminOnly } from './roleMiddleware.js';
export { errorHandler } from './errorHandler.js';