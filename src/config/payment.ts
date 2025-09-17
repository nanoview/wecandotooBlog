// Payment Configuration
// Update these settings with your actual payment account details

export const PAYMENT_CONFIG = {
  // Buy Me a Coffee settings
  buyMeACoffee: {
    username: 'nanoview', // Replace with your actual Buy Me a Coffee username
    baseUrl: 'https://buymeacoffee.com',
  },
  
  // PayPal settings (alternative payment method)
  paypal: {
    email: 'your-paypal@email.com', // Replace with your PayPal email
    businessId: '', // Optional: Your PayPal business ID
    baseUrl: 'https://paypal.me',
    username: 'nanoview', // Replace with your PayPal.me username if you have one
  },
  
  // Default pricing
  defaultPrice: {
    amount: 5.00,
    currency: 'EUR',
  },
  
  // Payment messages
  messages: {
    premium: 'Unlock premium content',
    coffee: 'Support our work',
    thankYou: 'Thank you for your support!',
  }
};

// Helper functions
export const getBuyMeCoffeeUrl = (options: {
  amount?: number;
  description?: string;
  buyerEmail?: string;
}) => {
  const { amount = PAYMENT_CONFIG.defaultPrice.amount, description, buyerEmail } = options;
  const params = new URLSearchParams();
  
  if (amount) params.append('amount', amount.toString());
  if (description) params.append('description', description);
  if (buyerEmail) params.append('buyer_email', buyerEmail);
  
  const queryString = params.toString();
  return `${PAYMENT_CONFIG.buyMeACoffee.baseUrl}/${PAYMENT_CONFIG.buyMeACoffee.username}${queryString ? `?${queryString}` : ''}`;
};

export const getPayPalUrl = (options: {
  amount?: number;
  description?: string;
  currency?: string;
}) => {
  const { amount = PAYMENT_CONFIG.defaultPrice.amount, currency = PAYMENT_CONFIG.defaultPrice.currency } = options;
  
  if (PAYMENT_CONFIG.paypal.username) {
    return `${PAYMENT_CONFIG.paypal.baseUrl}/${PAYMENT_CONFIG.paypal.username}/${amount}${currency}`;
  }
  
  // Fallback to PayPal email if no username
  const params = new URLSearchParams({
    cmd: '_xclick',
    business: PAYMENT_CONFIG.paypal.email,
    item_name: options.description || PAYMENT_CONFIG.messages.premium,
    amount: amount.toString(),
    currency_code: currency,
  });
  
  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
};
