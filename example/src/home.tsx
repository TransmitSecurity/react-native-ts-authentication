/**
 * React Native - Identity Verification example
 * Transmit Security, https://github.com/TransmitSecurity
 *
 * @format
 */

import React, { type ReactElement } from 'react';
import { View, StyleSheet, Text, Button, TextInput, Alert } from 'react-native';

export type Props = {
    onStartAuthentication: (username: string) => void;
    onStartNativeBiometrics: (username: string) => void;
    onApprovalWebAuthn: (username: string, approvalData: { [key: string]: string; }) => void;
    onApprovalWebAuthnWithData: (rawAuthenticationData: { [key: string]: any; } ) => void;
    onApprovalNativeBiometrics: (username: string) => void;
    errorMessage: string;
};

export type State = {
    username: string;
};

export default class HomeScreen extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            username: '',
        };
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{ marginTop: 20 }} />
                <Text style={styles.sectionTitle}>{"Authentication SDK"}</Text>
                {this.renderUsernameInputField()}
                {this.renderStartAuthenticationButton()}
                {this.renderNativeBiometricsButton()}
                {this.renderApprovalWebAuthnButton()}
                {this.renderApprovalWebAuthnWithDataButton()}
                {this.renderApprovalNativeBiometricsButton()}
                {this.renderStatusLabel()}
            </View>
        );
    }

    private renderUsernameInputField(): ReactElement {
        return (
            <View style={{ marginTop: 12 }}>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => this.setState({ username: text })}
                    value={this.state.username}
                    placeholder="Type your username here"
                    autoFocus={true}
                />
            </View>
        )
    }

    private renderStatusLabel(): ReactElement {
        return (
            <View style={{ marginTop: 2 }}>
                <Text style={styles.statusLabel}>{this.props.errorMessage}</Text>
            </View>
        )
    }

    private renderStartAuthenticationButton(): ReactElement {
        return (
            <View style={{ marginTop: 2 }}>
                <Button
                    title="Start Authentication"
                    onPress={() => this.props.onStartAuthentication(this.state.username)}
                />
            </View>
        )
    }

    private renderNativeBiometricsButton(): ReactElement {
        return (
            <View style={{ marginTop: 2 }}>
                <Button
                    title="Native Biometrics"
                    onPress={() => this.props.onStartNativeBiometrics(this.state.username)}
                />
            </View>
        )
    }

    private renderApprovalWebAuthnButton(): ReactElement {
        return (
            <View style={{ marginTop: 2 }}>
                <Button
                    title="Approval WebAuthn"
                    onPress={() => this.props.onApprovalWebAuthn(this.state.username, { "somekey": "some value" })}
                />
            </View>
        )
    }

    private renderApprovalWebAuthnWithDataButton(): ReactElement {
        return (
            <View style={{ marginTop: 12 }}>
                <Button
                    title="Approval WebAuthn With Data"
                    onPress={() => { this.handlePressApprovalWebAuthndata() }}
                />
            </View>
        )
    }

   private renderApprovalNativeBiometricsButton(): ReactElement {
        return (
            <View style={{ marginTop: 12 }}>
                <Button
                    title="Approval with Native Biometrics"
                    onPress={() => { this.handlePressApprovalNativeBiometrics() }}
                />
            </View>
        )
    }

    private handlePressApprovalWebAuthndata = () => {
        if (!this.state.username || this.state.username === '') {
            Alert.alert("Error", "Please enter a username");
            return 
        }

        const userData = {
            id: this.state.username,
            name: this.state.username,
            displayName: this.state.username
        };

        const optionsData = {
            challenge: "some challenge string",
            allowCredentials: null,
            userVerification: null,
            rpId: "the relying party id",
            userData
        };

        const approvalData = {
            webauthnSessionId: "some webauthn session id",
            credentialRequestOptions: optionsData
        }

        this.props.onApprovalWebAuthnWithData(approvalData)
    }

    private handlePressApprovalNativeBiometrics = () => {
        if (!this.state.username || this.state.username === '') {
            Alert.alert("Error", "Please enter a username");
            return 
        }

        this.props.onApprovalNativeBiometrics(this.state.username)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 12,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        color: 'red',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        color: 'black',
    },
    sectionDescription: {
        marginTop: 40,
        marginBottom: 10,
        fontSize: 18,
        fontWeight: '400',
        textAlign: 'center',
        color: 'black',
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
    },
});