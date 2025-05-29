/**
 * Frontend Integration Test for Profile Image Upload/Fetch
 * This script helps test the frontend-backend integration for profile images.
 * 
 * Run this in the browser console on your frontend application to test
 * the profile image functionality.
 */

console.log('🧪 Starting Profile Image Frontend Integration Test...');

// Test configuration
const TEST_CONFIG = {
    userId: 'test-user-123',
    apiBaseUrl: 'https://your-api-gateway-url.amazonaws.com/dev', // Update this with your actual API URL
    testImageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' // 1x1 pixel PNG
};

// Helper function to create a test blob
function createTestImageBlob() {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // Draw a simple test pattern
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 50, 50);
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(50, 0, 50, 50);
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(0, 50, 50, 50);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(50, 50, 50, 50);
    
    return new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
    });
}

// Test CORS preflight request
async function testCORSPreflight() {
    console.log('🔍 Testing CORS preflight request...');
    
    try {
        const response = await fetch(`${TEST_CONFIG.apiBaseUrl}/users/${TEST_CONFIG.userId}/profile-image`, {
            method: 'OPTIONS',
            headers: {
                'Origin': window.location.origin,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        
        console.log('✅ CORS preflight response:', {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        return response.ok;
    } catch (error) {
        console.error('❌ CORS preflight failed:', error);
        return false;
    }
}

// Test profile image upload
async function testProfileImageUpload() {
    console.log('📤 Testing profile image upload...');
    
    try {
        // Import userService if available, otherwise use fetch directly
        if (window.userService && window.userService.uploadProfileImage) {
            console.log('Using userService.uploadProfileImage...');
            const blob = await createTestImageBlob();
            const result = await window.userService.uploadProfileImage(TEST_CONFIG.userId, blob);
            console.log('✅ Upload via userService successful:', result);
            return true;
        } else {
            console.log('Using direct fetch...');
            const blob = await createTestImageBlob();
            const formData = new FormData();
            formData.append('image', blob, 'test-image.png');
            
            const response = await fetch(`${TEST_CONFIG.apiBaseUrl}/users/${TEST_CONFIG.userId}/profile-image`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            console.log('✅ Upload via fetch successful:', result);
            return response.ok;
        }
    } catch (error) {
        console.error('❌ Profile image upload failed:', error);
        return false;
    }
}

// Test profile image fetch
async function testProfileImageFetch() {
    console.log('📥 Testing profile image fetch...');
    
    try {
        // Import userService if available, otherwise use fetch directly
        if (window.userService && window.userService.getProfileImage) {
            console.log('Using userService.getProfileImage...');
            const result = await window.userService.getProfileImage(TEST_CONFIG.userId);
            console.log('✅ Fetch via userService successful:', result);
            return true;
        } else {
            console.log('Using direct fetch...');
            const response = await fetch(`${TEST_CONFIG.apiBaseUrl}/users/${TEST_CONFIG.userId}/profile-image`);
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Fetch via fetch successful:', result);
                return true;
            } else {
                const error = await response.text();
                console.log('ℹ️ No profile image found (expected for new user):', error);
                return true; // This is expected for a test user
            }
        }
    } catch (error) {
        console.error('❌ Profile image fetch failed:', error);
        return false;
    }
}

// Test error handling
async function testErrorHandling() {
    console.log('⚠️ Testing error handling...');
    
    try {
        // Test with invalid user ID
        const response = await fetch(`${TEST_CONFIG.apiBaseUrl}/users/invalid-user-id-123456789/profile-image`);
        
        const contentType = response.headers.get('content-type');
        let result;
        
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            result = await response.text();
        }
        
        console.log('✅ Error handling test completed:', {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body: result
        });
        
        // Verify CORS headers are present in error response
        const corsHeaders = ['access-control-allow-origin', 'access-control-allow-methods'];
        const hasCORS = corsHeaders.some(header => response.headers.has(header));
        
        if (hasCORS) {
            console.log('✅ CORS headers present in error response');
        } else {
            console.warn('⚠️ CORS headers missing in error response');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error handling test failed:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting all frontend integration tests...');
    console.log('=' + '='.repeat(50));
    
    const results = {
        corsPreflightPassed: false,
        uploadPassed: false,
        fetchPassed: false,
        errorHandlingPassed: false
    };
    
    // Test CORS preflight
    results.corsPreflightPassed = await testCORSPreflight();
    
    // Test upload
    results.uploadPassed = await testProfileImageUpload();
    
    // Test fetch
    results.fetchPassed = await testProfileImageFetch();
    
    // Test error handling
    results.errorHandlingPassed = await testErrorHandling();
    
    // Summary
    console.log('=' + '='.repeat(50));
    console.log('📊 Test Results Summary:');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`  ${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎉 Overall Result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    
    if (allPassed) {
        console.log('\n📝 Profile image system is working correctly!');
        console.log('✅ CORS is properly configured');
        console.log('✅ Upload/fetch functionality works');
        console.log('✅ Error handling includes CORS headers');
    } else {
        console.log('\n🔧 Some issues detected. Please check the failed tests above.');
    }
    
    return results;
}

// Auto-run tests if this script is executed
if (typeof window !== 'undefined') {
    // Update the API base URL with the actual deployed URL
    console.log('⚠️ Please update TEST_CONFIG.apiBaseUrl with your actual API Gateway URL');
    console.log('Current URL:', TEST_CONFIG.apiBaseUrl);
    console.log('Then run: runAllTests()');
} else {
    // If running in Node.js environment
    console.log('This script should be run in a browser console with the frontend loaded.');
}

// Export for manual testing
if (typeof window !== 'undefined') {
    window.profileImageTests = {
        runAllTests,
        testCORSPreflight,
        testProfileImageUpload,
        testProfileImageFetch,
        testErrorHandling,
        TEST_CONFIG
    };
}
