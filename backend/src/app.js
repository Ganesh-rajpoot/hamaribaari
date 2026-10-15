// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const { FRONTEND_URL } = require('./config/env');
// const routes = require('./routes');
// const { errorHandler, notFoundHandler } = require('./middleware/error');

// const app = express();

// app.use(helmet());
// app.use(cors({
//   origin: [FRONTEND_URL],
//   credentials: false,
// }));
// app.use(express.json({ limit: '200kb' }));

// app.use(rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 300,
//   standardHeaders: true,
//   legacyHeaders: false,
// }));

// app.use('/api/v1', routes);

// app.use(notFoundHandler);
// app.use(errorHandler);

// module.exports = app;


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { FRONTEND_URL, NODE_ENV } = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/error');
const { requestId } = require('./middleware/requestId');

const app = express();
// const isTest = NODE_ENV === 'test';
app.set('trust proxy', 1);




app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", FRONTEND_URL],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
    },
  } : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Apne allowed domains ki list yahan define karein
const allowedOrigins = [
  'https://hamaribaari.my99store.com',
  'https://hamaribaari-cbhw.vercel.app',
  FRONTEND_URL // Agar env variable se bhi aa raha hai
].filter(Boolean); // Undefined values ko hatane ke liye

app.use(cors({
  origin: function (origin, callback) {
    // Postman ya server-to-server requests ke liye jinka origin nahi hota
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: false,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  maxAge: 600,
}));
// app.use(cors({
//   origin: [FRONTEND_URL],
//   credentials: false,
//   methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
//   maxAge: 600,
// }));

app.use(express.json({ limit: '100kb' }));
app.use(requestId);

// General limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests' } },
}));

// Stricter limiter on auth endpoints
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'AUTH_TOO_MANY', message: 'Too many auth attempts, try again later' } },
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;