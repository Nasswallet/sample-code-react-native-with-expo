import React, { Component } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { WebView } from 'react-native-webview'


const userIdentifier = "";
const password = "";
const transactionPin = "";

class PaymentDemo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showWebView: false,
            trnId: '',
            token: '',
            progressBar: false
        };
    }

    callApi = async (header, request, methodName) => {
        let baseURL = 'https://uatgw.nasswallet.com/payment/';
        const instance = axios.create({
            baseURL: baseURL,
        });
        instance.defaults.headers.common = header
        var response = await instance.post(baseURL + methodName, request, { timeout: 90000 })
            .catch(error => {
                console.log('error', error.message)
                this.setState({ progressBar: false, })
            });

        return response.data
    }

    
 
onSubmit = async () => {
        this.setState({ progressBar: true })
        let header = {
            "authorization": "Basic TUVSQ0hBTlRfQVBQOk1lcmNoYW50QEFkbWluIzEyMw=="
        }
        let request = {
            data: {
                username: userIdentifier,
                password: password,
                grantType: "password"
            }
        }
        var response = await this.callApi(header, request, 'transaction/login')

        if (typeof response !== 'undefined' && response.responseCode == 0) {
            let trnRequest = {
                "data": {
                    "userIdentifier": userIdentifier,
                    "transactionPin": transactionPin,
                    "orderId": "263626",
                    "amount": "10",
                    "languageCode": "en"
                }
            }
            let trnHeader = {
                "authorization": "Bearer " + response.data.access_token
            }
            var trnResponse = await this.callApi(trnHeader, trnRequest, 'transaction/initTransaction')
            if (typeof trnResponse !== 'undefined' && trnResponse.responseCode == 0) {

                this.setState({
                    progressBar: false,
                    showWebView: true,
                    trnId: trnResponse.data.transactionId,
                    token: trnResponse.data.token
                })
            }
        }
    }

    
 
render() {
        return (
            <View style={{ flex: 1 }}>
                {
                    this.state.progressBar &&
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator color="#0000ff" size={'large'} />
                    </View>
                }
                {
                    !this.state.showWebView && !this.state.progressBar &&
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
                }

                {
                    this.state.showWebView && !this.state.progressBar && this.state.trnId !== '' &&
                    <WebView
                        source={{
                            uri: 'https://uatcheckout.nasswallet.com/payment-gateway?id=' + this.state.trnId + '&token=' + this.state.token + '&userIdentifier=' + '7503491464'
                        }}
                        style={{ marginTop: 20 }}
                    />
                }
            </View>
        );
    }
}

export default PaymentDemo;
