/**
 * React Native - Identity Verification example
 * Transmit Security, https://github.com/TransmitSecurity
 *
 * @format
 */

import React, { type ReactElement } from 'react';
import { View, StyleSheet, Text, TextInput, Alert, TouchableOpacity } from 'react-native';

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

    private verticalSpaceBetweenButtons: number = 12;

    constructor(props: Props) {
        super(props);
        this.state = {
            username: '',
        };
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.sectionTitle}>Authentication SDK</Text>
                <View style={styles.card}>
                    {this.renderUsernameInputField()}
                    <View style={styles.buttonGroup}>
                        {this.renderStartAuthenticationButton()}
                        {this.renderNativeBiometricsButton()}
                        {this.renderApprovalWebAuthnButton()}
                        {this.renderApprovalWebAuthnWithDataButton()}
                        {this.renderApprovalNativeBiometricsButton()}
                    </View>
                    {this.renderStatusLabel()}
                </View>
            </View>
        );
    }

    private renderUsernameInputField(): ReactElement {
        return (
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => this.setState({ username: text })}
                    value={this.state.username}
                    placeholder="Type your username here"
                    autoFocus={true}
                    placeholderTextColor="#aaa"
                />
            </View>
        )
    }

    private renderStatusLabel(): ReactElement {
        if (!this.props.errorMessage) return <></>;
        return (
            <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>{this.props.errorMessage}</Text>
            </View>
        )
    }

    private renderButton(title: string, onPress: () => void): ReactElement {
        return (
            <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={onPress}>
                <Text style={styles.buttonText}>{title}</Text>
            </TouchableOpacity>
        );
    }

    private renderStartAuthenticationButton(): ReactElement {
        return (
            <View style={{ marginTop: this.verticalSpaceBetweenButtons }}>
                {this.renderButton('Start Authentication', () => this.props.onStartAuthentication(this.state.username))}
            </View>
        )
    }

    private renderNativeBiometricsButton(): ReactElement {
        return (
            <View style={{ marginTop: this.verticalSpaceBetweenButtons }}>
                {this.renderButton('Native Biometrics', () => this.props.onStartNativeBiometrics(this.state.username))}
            </View>
        )
    }

    private renderApprovalWebAuthnButton(): ReactElement {
        return (
            <View style={{ marginTop: this.verticalSpaceBetweenButtons }}>
                {this.renderButton('Approval WebAuthn', () => this.props.onApprovalWebAuthn(this.state.username, { "somekey": "some value" }))}
            </View>
        )
    }

    private renderApprovalWebAuthnWithDataButton(): ReactElement {
        return (
            <View style={{ marginTop: this.verticalSpaceBetweenButtons }}>
                {this.renderButton('Approval WebAuthn With Data', () => { this.handlePressApprovalWebAuthndata() })}
            </View>
        )
    }

    private renderApprovalNativeBiometricsButton(): ReactElement {
        return (
            <View style={{ marginTop: this.verticalSpaceBetweenButtons }}>
                {this.renderButton('Approval with Native Biometrics', () => { this.handlePressApprovalNativeBiometrics() })}
            </View>
        )
    }

    private handlePressApprovalWebAuthndata = () => {
        if (!this.state.username || this.state.username === '') {
            Alert.alert("Error", "Please enter a username");
            return 
        }

        const userData = {
            id: "b7e2c1a2-4e3d-4b7a-9c2e-1f8e6a7d5c3b",
            name: this.state.username,
            displayName: this.state.username
        };

        const optionsData = {
            challenge: "some challenge string",
            allowCredentials: null,
            userVerification: "some user verification string",
            rpId: "the relying party id string",
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f6fa',
        padding: 16,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        color: '#222',
        marginBottom: 24,
        letterSpacing: 0.5,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#555',
        marginBottom: 12, // increased from 6 to 12 for more vertical spacing
        marginLeft: 4,
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: '#d1d8e0',
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 16,
        backgroundColor: '#fafbfc',
        color: '#222',
    },
    buttonGroup: {
        marginTop: 8,
        marginBottom: 8,
    },
    statusContainer: {
        marginTop: 18,
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        color: '#e74c3c',
        backgroundColor: '#fdecea',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginTop: 8,
    },
    button: {
        backgroundColor: '#4f8cff',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginVertical: 6,
        alignItems: 'center',
        shadowColor: '#4f8cff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
});