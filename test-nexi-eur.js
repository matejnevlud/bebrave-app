// Test with EUR currency as shown in documentation examples

const testEurOrder = async () => {
    console.log('💳 Testing with EUR currency (as in docs)...');

    const testBaseUrl = 'https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1';
    const testApiKey = process.env.NEXI_API_KEY;

    // Use exact structure from documentation
    const orderData = {
        paymentSession: {
            actionType: 'PAY',
            amount: '3545',
            language: 'ENG',
            resultUrl: 'https://bebrave.studio/payment/success',
            cancelUrl: 'https://bebrave.studio/payment/cancel',
            notificationUrl: 'https://bebrave.studio/api/payment/webhook'
        },
        order: {
            orderId: 'btid' + Date.now(),
            amount: '3545',
            currency: 'EUR',
            description: 'TV LG 3423',
            customField: 'weekend promotion',
            customerInfo: {
                cardHolderName: 'Mauro Morandi',
                cardHolderEmail: 'mauro.morandi@nexi.it',
                mobilePhone: '3280987654',
                mobilePhoneCountryCode: 39,
                billingAddress: {
                    name: 'Mario Rossi',
                    street: 'Piazza Maggiore, 1',
                    city: 'Bologna',
                    postCode: '40124',
                    province: 'BO',
                    country: 'ITA'
                }
            }
        }
    };

    try {
        console.log('📤 EUR Order:', JSON.stringify(orderData, null, 2));

        const response = await fetch(`${testBaseUrl}/orders/hpp`, {
            method: 'POST',
            headers: {
                'X-API-KEY': testApiKey,
                'Content-Type': 'application/json',
                'Correlation-Id': 'eur-test-' + Date.now()
            },
            body: JSON.stringify(orderData)
        });

        console.log('📡 EUR Response Status:', response.status);
        console.log('📡 EUR Response Headers:', Object.fromEntries(response.headers));

        const responseText = await response.text();
        console.log('📡 EUR Raw Response:', responseText);

        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log('✅ EUR ORDER SUCCESS!');
            console.log('🔗 Hosted Page:', data.hostedPage);
            console.log('🔐 Security Token:', data.securityToken);
        } else {
            console.log('❌ EUR Order Failed');
            if (responseText) {
                try {
                    const errorData = JSON.parse(responseText);
                    console.log('Error details:', errorData);
                } catch {
                    console.log('Raw error:', responseText);
                }
            }
        }

    } catch (error) {
        console.error('❌ EUR Test Error:', error.message);
    }
};

// Test with different API key
const testAlternativeKey = async () => {
    console.log('\n🔑 Testing with alternative API key...');

    const testBaseUrl = 'https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1';
    const altApiKey = process.env.NEXI_EXPLICIT_API_KEY;

    const simpleOrder = {
        paymentSession: {
            actionType: 'PAY',
            amount: '1000',
            language: 'ENG',
            resultUrl: 'https://bebrave.studio/payment/success',
            cancelUrl: 'https://bebrave.studio/payment/cancel'
        },
        order: {
            orderId: 'alt-' + Date.now(),
            amount: '1000',
            currency: 'EUR',
            description: 'Test Payment'
        }
    };

    try {
        const response = await fetch(`${testBaseUrl}/orders/hpp`, {
            method: 'POST',
            headers: {
                'X-API-KEY': altApiKey,
                'Content-Type': 'application/json',
                'Correlation-Id': 'alt-' + Date.now()
            },
            body: JSON.stringify(simpleOrder)
        });

        console.log('📡 Alt Key Status:', response.status);
        const responseText = await response.text();
        console.log('📡 Alt Key Response:', responseText);

    } catch (error) {
        console.error('❌ Alt Key Error:', error.message);
    }
};

// Run both tests
const runEurTests = async () => {
    console.log('🚀 Testing with EUR Currency and Alternative Keys\n');

    await testEurOrder();
    await testAlternativeKey();

    console.log('\n🔍 Analysis:');
    console.log('- Trying exact structure from documentation');
    console.log('- Using EUR currency (more common in examples)');
    console.log('- Testing both available API keys');
    console.log('- May need to contact Nexi support for working credentials');
};

if (typeof window === 'undefined') {
    runEurTests();
}
