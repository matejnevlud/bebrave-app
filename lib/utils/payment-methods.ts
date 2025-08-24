// Helper function to parse allowed payment methods string
export function parseAllowedPaymentMethods(allowedPaymentMethods: string | null): {
  allowCreditCard: boolean;
  allowQr: boolean;
  allowOnsite: boolean;
  allowCredit: boolean;
} {
  if (!allowedPaymentMethods) {
    // Default: allow all payment methods
    return {
      allowCreditCard: true,
      allowQr: true,
      allowOnsite: true,
      allowCredit: false, // Customer credit is disabled by default
    };
  }

  const methods = allowedPaymentMethods.split(',').map(m => m.trim());

  return {
    allowCreditCard: methods.includes('credit_card'),
    allowQr: methods.includes('qr'),
    allowOnsite: methods.includes('osobne'),
    allowCredit: methods.includes('kredit'),
  };
}

// Helper function to create allowed payment methods string
export function createAllowedPaymentMethodsString(methods: {
  allowCreditCard: boolean;
  allowQr: boolean;
  allowOnsite: boolean;
  allowCredit: boolean;
}): string {
  const allowedMethods: string[] = [];

  if (methods.allowCreditCard) allowedMethods.push('credit_card');
  if (methods.allowQr) allowedMethods.push('qr');
  if (methods.allowOnsite) allowedMethods.push('osobne');
  if (methods.allowCredit) allowedMethods.push('kredit');

  return allowedMethods.join(',');
}