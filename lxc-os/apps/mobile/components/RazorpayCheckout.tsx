import React, { useEffect, useRef, useState, useMemo } from 'react';
import { NativeModules, Modal, View, StyleSheet, TouchableOpacity, ActivityIndicator, Linking, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import RazorpayLib from 'react-native-razorpay';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface RazorpayCheckoutProps {
  visible: boolean;
  orderId: string;
  keyId: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  onSuccess: (data: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  onFailure: (error: any) => void;
  onClose: () => void;
}

/**
 * RazorpayCheckout Component (Native + WebView Fallback)
 * 
 * Automatically detects if the native Razorpay module is available.
 * If not (e.g., in Expo Go), it falls back to a WebView implementation.
 */
const RazorpayCheckoutView: React.FC<RazorpayCheckoutProps> = ({
  visible,
  orderId,
  keyId,
  amount,
  currency,
  name,
  description,
  prefill,
  notes,
  onSuccess,
  onFailure,
  onClose,
}) => {
  const isProcessing = useRef(false);
  // Detect if native module exists
  const isNativeSupported = !!NativeModules.RNRazorpayCheckout;
  const [webViewVisible, setWebViewVisible] = useState(false);

  console.log("RazorpayCheckout Rendered - Visible:", visible, "NativeSupported:", isNativeSupported);

  useEffect(() => {
    if (visible && isNativeSupported && !isProcessing.current) {
      isProcessing.current = true;
      console.log("Opening Native Razorpay Checkout:", orderId);

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: name,
        description: description,
        order_id: orderId,
        prefill: {
          name: prefill?.name || "",
          email: prefill?.email || "",
          contact: prefill?.contact ? prefill.contact.replace(/\D/g, '') : "",
        },
        notes: notes || {},
        theme: { color: COLORS.primary },
      };

      RazorpayLib.open(options)
        .then((data: any) => {
          isProcessing.current = false;
          onSuccess(data);
        })
        .catch((error: any) => {
          isProcessing.current = false;
          // error.code 2 = user cancelled
          if (error.code === 2) {
            onClose();
          } else {
            console.error("Native Razorpay Error:", error);
            onFailure(error);
          }
        });
    } else if (visible && !isNativeSupported) {
      // Show WebView for Expo Go/Missing native builds
      console.log("Switching to Razorpay WebView Fallback:", orderId);
      setWebViewVisible(true);
    }
  }, [visible, orderId, keyId, amount, currency, name, description, prefill, notes, isNativeSupported]);

  // Handle WebView closing when the modal visibility changes
  useEffect(() => {
    if (!visible) {
      setWebViewVisible(false);
    }
  }, [visible]);

  // Generate HTML for Razorpay Web Checkout
  const webCheckoutHtml = useMemo(() => {
    const config = {
      key: keyId,
      amount: amount,
      currency: currency,
      name: name,
      description: description,
      order_id: orderId,
      prefill: prefill || {},
      notes: notes || {},
      theme: { color: COLORS.primary },
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
          <style>
            body { margin: 0; padding: 0; background-color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: -apple-system, sans-serif; }
            .loader { border: 3px solid #f3f3f3; border-top: 3px solid ${COLORS.primary}; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            #status { position: fixed; bottom: 10px; font-size: 10px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="loader"></div>
          <div id="status">Initializing...</div>
          <script src="https://checkout.razorpay.com/v1/checkout.js" onload="onLibLoad()" onerror="onLibError()"></script>
          <script>
            function log(msg) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                event: 'LOG',
                message: msg
              }));
            }

            function onLibError() {
              log("Failed to load Razorpay script");
              window.ReactNativeWebView.postMessage(JSON.stringify({
                event: 'FAILURE',
                error: { description: 'Razorpay script failed to load' }
              }));
            }

            function onLibLoad() {
              log("Razorpay script loaded successfully");
              try {
                var options = ${JSON.stringify(config)};
                log("Initializing Razorpay for order: " + options.order_id);
                
                options.handler = function(response) {
                  log("Payment successful: " + response.razorpay_payment_id);
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    event: 'SUCCESS',
                    data: response
                  }));
                };
                
                options.modal = {
                  ondismiss: function() {
                    log("Modal dismissed");
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      event: 'CLOSE'
                    }));
                  },
                  escape: true,
                  backdropclose: false
                };

                var rzp = new Razorpay(options);
                
                rzp.on('payment.failed', function (response) {
                  log("Payment failed: " + response.error.description);
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    event: 'FAILURE',
                    error: response.error
                  }));
                });

                log("Opening Razorpay...");
                document.getElementById('status').innerText = 'Opening Checkout...';
                rzp.open();
              } catch (e) {
                log("Error during initialization: " + e.message);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  event: 'FAILURE',
                  error: { description: e.message }
                }));
              }
            }
          </script>
        </body>
      </html>
    `;
  }, [keyId, amount, currency, name, description, orderId, prefill, notes]);

  if (isNativeSupported) return null;

  return (
    <Modal
      visible={webViewVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.webViewHeader}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
      <WebView
        source={{ html: webCheckoutHtml }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        onMessage={(event) => {
          try {
            const result = JSON.parse(event.nativeEvent.data);
            if (result.event === 'LOG') {
              console.log("WebView Log:", result.message);
            } else if (result.event === 'SUCCESS') {
              onSuccess(result.data);
              setWebViewVisible(false);
            } else if (result.event === 'FAILURE') {
              onFailure(result.error);
              setWebViewVisible(false);
            } else if (result.event === 'CLOSE') {
              onClose();
              setWebViewVisible(false);
            }
          } catch (e) {
            console.error("WebView message parse error:", e);
          }
        }}
        onShouldStartLoadWithRequest={(request) => {
          // Handle UPI intents (upi://)
          if (request.url.startsWith('upi://') ||
            request.url.startsWith('whatsapp://') ||
            request.url.startsWith('teZ://') ||
            request.url.startsWith('phonepe://') ||
            request.url.startsWith('paytmmp://')) {
            Linking.canOpenURL(request.url).then(supported => {
              if (supported) {
                Linking.openURL(request.url);
              } else {
                console.warn("App not installed for URL:", request.url);
                // Optionally inject a script or just let WebView swallow it gently
              }
            }).catch(err => {
              console.error("UPI Link Error:", err);
            });
            return false;
          }
          return true;
        }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  webViewHeader: {
    height: Platform.OS === 'ios' ? 90 : 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  }
});

// Export as the expected name for FeesPage
export { RazorpayCheckoutView as RazorpayCheckout };
