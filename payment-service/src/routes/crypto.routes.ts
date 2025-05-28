import { Router } from 'express';

const router = Router();

/**
 * Get payment details for crypto subscription
 */
router.post('/payment-details', (req, res) => {
  try {
    type Tier = 'basic' | 'premium' | 'enterprise';
    type TokenSymbol = 'ETH' | 'USDC';

    const { tier, tokenSymbol } = req.body as {
      tier: Tier;
      tokenSymbol: TokenSymbol;
    };

    const paymentAmounts: Record<Tier, Record<TokenSymbol, string>> = {
      basic: { ETH: '0.005', USDC: '9.99' },
      premium: { ETH: '0.015', USDC: '29.99' },
      enterprise: { ETH: '0.05', USDC: '99.99' }
    };

    res.status(200).json({
      success: true,
      data: {
        paymentAddress: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        amount: paymentAmounts[tier][tokenSymbol],
        tokenSymbol,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payment details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Verify crypto payment
 */
router.post('/verify-payment', (req, res) => {
  try {
    const { txHash, tier } = req.body;
    
    // Mock verification process
    const isVerified = txHash && txHash.startsWith('0x') && txHash.length === 66;
    
    if (isVerified) {
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          subscriptionId: `crypto_${Date.now()}`,
          tier,
          status: 'active',
          txHash
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid transaction hash',
        error: 'Transaction could not be verified'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get transaction status
 */
router.get('/transaction/:txHash', (req, res) => {
  try {
    const { txHash } = req.params;
    
    res.status(200).json({
      success: true,
      data: {
        txHash,
        status: 'confirmed',
        confirmations: 12,
        blockNumber: 12345678
      }
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const cryptoRouter = router;
