// Test Nexi XPay Order Creation - Working Version
// Based on official API documentation

const createWorkingNexiOrder = async () => {
    console.log('💳 Creating Nexi XPay Order with Proper Structure...');

    // Sandbox environment
    const testBaseUrl = 'https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1';
    const testApiKey = process.env.NEXI_API_KEY;

    // Generate unique IDs
    const orderId = 'bebrave-' + Date.now();
    const correlationId = 'corr-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    // Complete order structure based on official documentation
    const orderData = {
        paymentSession: {
            actionType: 'PAY',
            amount: '10000', // 100 CZK in cents (string format)
            language: 'CES',
            resultUrl: 'https://bebrave.studio/payment/success',
            cancelUrl: 'https://bebrave.studio/payment/cancel',
            notificationUrl: 'https://bebrave.studio/api/payment/webhook',
            captureType: 'IMPLICIT'
        },
        order: {
            orderId: orderId,
            amount: '10000', // 100 CZK in cents (string format)
            currency: 'CZK',
            description: 'BeBrave Studio Fitness Class',
            customField: 'fitness-class-reservation',
            customerInfo: {
                cardHolderName: 'Test Customer',
                cardHolderEmail: 'test@bebrave.studio',
                mobilePhone: '123456789',
                mobilePhoneCountryCode: 420,
                billingAddress: {
                    name: 'Test Customer',
                    street: 'Test Street 1',
                    city: 'Prague',
                    postCode: '10000',
                    country: 'CZE'
                }
            }
        }
    };

    try {
        console.log('📤 Sending order:', JSON.stringify(orderData, null, 2));

        const response = await fetch(`${testBaseUrl}/orders/hpp`, {
            method: 'POST',
            headers: {
                'X-API-KEY': testApiKey,
                'Content-Type': 'application/json',
                'Correlation-Id': correlationId,
                'x-plugin-name': 'BeBrave Studio'
            },
            body: JSON.stringify(orderData)
        });

        console.log('📡 Response Status:', response.status);
        console.log('📡 Response Headers:', Object.fromEntries(response.headers));

        const responseText = await response.text();
        console.log('📡 Raw Response:', responseText);

        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                console.log('✅ SUCCESS! Order Created:');
                console.log('🔗 Hosted Page URL:', data.hostedPage);
                console.log('🔐 Security Token:', data.securityToken);
                console.log('📋 Order ID:', data.orderId);
                console.log('💰 Amount:', data.amount);
                console.log('💱 Currency:', data.currency);

                // Save for integration
                console.log('\n📝 Integration Data:');
                console.log('- Redirect user to:', data.hostedPage);
                console.log('- Store security token:', data.securityToken);
                console.log('- Order reference:', data.orderId);

                return data;
            } catch (parseError) {
                console.log('⚠️ JSON Parse Error:', parseError.message);
                console.log('Raw response:', responseText);
            }
        } else {
            console.log('❌ Request Failed:', response.status, response.statusText);
            try {
                const errorData = JSON.parse(responseText);
                console.log('🔍 Error Details:');
                console.log(JSON.stringify(errorData, null, 2));
            } catch {
                console.log('Raw error response:', responseText);
            }
        }

    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
};

// Test minimal working order
const createMinimalWorkingOrder = async () => {
    console.log('🔧 Testing Minimal Working Order...');

    const testBaseUrl = 'https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1';
    const testApiKey = process.env.NEXI_API_KEY;

    const minimalOrder = {
        paymentSession: {
            actionType: 'PAY',
            amount: '5000', // 50 CZK
            language: 'CES',
            resultUrl: 'https://bebrave.studio/payment/success',
            cancelUrl: 'https://bebrave.studio/payment/cancel'
        },
        order: {
            orderId: 'minimal-' + Date.now(),
            amount: '5000',
            currency: 'CZK',
            description: 'Test Payment'
        }
    };

    try {
        const response = await fetch(`${testBaseUrl}/orders/hpp`, {
            method: 'POST',
            headers: {
                'X-API-KEY': testApiKey,
                'Content-Type': 'application/json',
                'Correlation-Id': 'minimal-' + Date.now()
            },
            body: JSON.stringify(minimalOrder)
        });

        console.log('📡 Minimal Order Status:', response.status);
        const responseText = await response.text();

        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('✅ Minimal Order SUCCESS!');
            console.log('🔗 Hosted Page:', data.hostedPage);
        } else {
            console.log('❌ Minimal Order Failed:', responseText);
        }

    } catch (error) {
        console.error('❌ Minimal Order Error:', error.message);
    }
};

// Run tests
const runWorkingTests = async () => {
    console.log('🚀 Testing Working Nexi XPay Order Creation\n');

    // Test 1: Minimal order
    await createMinimalWorkingOrder();

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 2: Complete order
    await createWorkingNexiOrder();

    console.log('\n📋 Summary:');
    console.log('- Using correct JSON structure from official docs');
    console.log('- Amount as string in smallest currency unit');
    console.log('- Proper headers including Correlation-Id');
    console.log('- Customer info for better processing');
    console.log('- Ready for BeBrave Studio integration');
};

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {createWorkingNexiOrder, createMinimalWorkingOrder};
}

// Run if called directly
if (typeof window === 'undefined') {
    runWorkingTests();
}
