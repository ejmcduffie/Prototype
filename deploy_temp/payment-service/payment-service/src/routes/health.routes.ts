import { Router } from 'express';

const router = Router();

/**
 * Health check endpoint for the payment service
 * Used by Docker health checks and monitoring
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'payment-service'
  });
});

export const healthRouter = router;
