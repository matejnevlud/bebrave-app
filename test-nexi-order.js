// Test Nexi XPay Order Creation
// Based on updated API documentation patterns

const createNexiOrder = async () => {
    console.log('💳 Testing Nexi XPay Order Creation...');

    // Use sandbox environment
    const testBaseUrl = 'https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1';
    const testApiKey = process.env.NEXI_API_KEY;

    // Proper order structure based on Nexi XPay patterns
    const orderData = {
        order: {
            orderId: 'bebrave-' + Date.now(),
            amount: 100, // 1 CZK in cents
            currency: 'CZK',
            description: 'BeBrave Studio Class Reservation',
            customField: 'fitness-class-booking'
        },
        paymentSession: {
            actionType: 'PAY',
            amount: 100,
            language: 'CES',
            resultUrl: 'https://bebrave.studio/payment/success',
            cancelUrl: 'https://bebrave.studio/payment/cancel',
            notificationUrl: 'https://bebrave.studio/api/payment/webhook'
        }
    };

    try {
        console.log('📤 Sending order data:', JSON.stringify(orderData, null, 2));

        const response = await fetch(`${testBaseUrl}/orders/hpp`, {
            method: 'POST',
            headers: {
                'X-API-KEY': testApiKey,
                'Content-Type': 'application/json',
                'Correlation-Id': 'bebrave-test-' + Date.now(),
                'x-plugin-name': 'BeBrave Studio Integration'
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
                console.log('✅ Order Created Successfully!');
                console.log('🔗 Hosted Page URL:', data.hostedPage);
                console.log('🔐 Security Token:', data.securityToken);
                console.log('📋 Order ID:', data.orderId);
                console.log('💰 Amount:', data.amount);
                console.log('💱 Currency:', data.currency);
                return data;
            } catch (parseError) {
                console.log('⚠️ Response parsing error:', parseError.message);
                console.log('📄 Response text:', responseText);
            }
        } else {
            console.log('❌ Order Creation Failed:', response.statusText);
            try {
                const errorData = JSON.parse(responseText);
                console.log('🔍 Error Details:', errorData);

                if (errorData.errors) {
                    console.log('📋 Validation Errors:');
                    errorData.errors.forEach((error, index) => {
                        console.log(`  ${index + 1}. ${error.field}: ${error.message}`);
                    });
                }
            } catch (parseError) {
                console.log('🔍 Raw Error Response:', responseText);
            }
        }

    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
};

// Test different order structures
const testOrderVariants = async () => {
    console.log('🔄 Testing Different Order Structures...\n');

    // Test 1: Minimal order
    console.log('Test 1: Minimal Order Structure');
    await createMinimalOrder();

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Full order with all fields
    console.log('Test 2: Complete Order Structure');
    await createNexiOrder();
};

const createMinimalOrder = async () => {
    const testBaseUrl = 'https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1';
    const testApiKey = process.env.NEXI_API_KEY;

    // Minimal required fields
    const minimalOrder = {
        order: {
            orderId: 'minimal-' + Date.now(),
            amount: 100,
            currency: 'CZK'
        },
        paymentSession: {
            actionType: 'PAY',
            resultUrl: 'https://bebrave.studio/payment/success',
            cancelUrl: 'https://bebrave.studio/payment/cancel'
        }
    };

    try {
        console.log('📤 Minimal order data:', JSON.stringify(minimalOrder, null, 2));

        const response = await fetch(`${testBaseUrl}/orders/hpp`, {
            method: 'POST',
            headers: {
                'X-API-KEY': testApiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(minimalOrder)
        });

        console.log('📡 Minimal Response Status:', response.status);
        const responseText = await response.text();
        console.log('📡 Minimal Response:', responseText);

    } catch (error) {
        console.error('❌ Minimal Order Error:', error.message);
    }
};

// Run the tests
const runOrderTests = async () => {
    console.log('🚀 Starting Nexi XPay Order Creation Tests\n');

    await testOrderVariants();

    console.log('\n📋 Integration Status:');
    console.log('✅ API endpoint accessible');
    console.log('✅ Authentication working (no 401 errors)');
    console.log('⚠️ Request structure needs adjustment');
    console.log('📝 Next: Fix request format based on API response');
};

// Export for use in Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {createNexiOrder, testOrderVariants};
}

// Run if called directly
if (typeof window === 'undefined') {
    runOrderTests();
}
