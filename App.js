import React, { Component } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { WebView } from 'react-native-webview';

const userIdentifier = '<USERNAME>';
const password = '<PASSWORD>';
const transactionPin = '<TRANSACTION_PIN>';
const baseURL = 'https://uatgw.nasswallet.com/payment/';
const authorizationToken = 'Basic <TOKEN>';

class PaymentDemo extends Component {
  state = {
    showWebView: false,
    trnId: '',
    token: '',
    progressBar: false,
  };

  callApi = async (headers, request, endpoint) => {
    try {
      const response = await axios.post(`${baseURL}${endpoint}`, request, { headers, timeout: 90000 });
      return response.data;
    } catch (error) {
      console.error('API call error:', error.message);
      this.setState({ progressBar: false });
    }
  };

  handleLogin = async () => {
    const headers = {
      authorization: authorizationToken,
    };

    const request = {
      data: {
        username: userIdentifier,
        password: password,
        grantType: 'password',
      },
    };

    return this.callApi(headers, request, 'transaction/login');
  };

  handleTransaction = async (accessToken) => {
    const headers = {
      authorization: `Bearer ${accessToken}`,
    };

    const request = {
      data: {
        userIdentifier: userIdentifier,
        transactionPin: transactionPin,
        orderId: '263626',
        amount: '10',
        languageCode: 'en',
      },
    };

    return this.callApi(headers, request, 'transaction/initTransaction');
  };

  onSubmit = async () => {
    this.setState({ progressBar: true });

    const loginResponse = await this.handleLogin();

    if (loginResponse && loginResponse.responseCode === 0) {
      const transactionResponse = await this.handleTransaction(loginResponse.data.access_token);

      if (transactionResponse && transactionResponse.responseCode === 0) {
        this.setState({
          progressBar: false,
          showWebView: true,
          trnId: transactionResponse.data.transactionId,
          token: transactionResponse.data.token,
        });
      } else {
        this.setState({ progressBar: false });
        alert('Transaction failed.');
      }
    } else {
      this.setState({ progressBar: false });
      alert('Login failed.');
    }
  };

  render() {
    const { showWebView, progressBar, trnId, token } = this.state;

    return (
      <View style={{ flex: 1 }}>
        {progressBar && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color="#0000ff" size="large" />
          </View>
        )}

        {!showWebView && !progressBar && (
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 30, textAlign: 'center' }}>REACT NATIVE SAMPLE</Text>
            </View>
            <View style={{ padding: 10, margin: 20 }}>
              <Button
                onPress={this.onSubmit}
                title="SUBMIT"
                color="#841584"
                accessibilityLabel="Learn more about this purple button"
              />
            </View>
          </View>
        )}

        {showWebView && !progressBar && trnId && (
          <WebView
            source={{
              uri: `https://uatcheckout.nasswallet.com/payment-gateway?id=${trnId}&token=${token}&userIdentifier=${userIdentifier}`,
            }}
            style={{ marginTop: 20 }}
          />
        )}
      </View>
    );
  }
}

export default PaymentDemo;
