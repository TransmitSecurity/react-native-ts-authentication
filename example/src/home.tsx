/**
 * React Native - Identity Verification example
 * Transmit Security, https://github.com/TransmitSecurity
 *
 * @format
 */

import React, { type ReactElement } from 'react';
import { View, StyleSheet, Text, TextInput, Alert, TouchableOpacity, Keyboard, Modal, Pressable } from 'react-native';
import type { TSAuthenticationSDK } from 'react-native-ts-authentication';
import localUserStore from './utils/local-user-store';

export type Props = {
    onStartAuthentication: (username: string) => void;
    onStartNativeBiometrics: (username: string) => void;
    onApprovalWebAuthn: (username: string, approvalData: { [key: string]: string; }) => void;
    onApprovalWebAuthnWithData: (rawAuthenticationData: TSAuthenticationSDK.WebAuthnAuthenticationData ) => void;
    onApprovalNativeBiometrics: (username: string) => void;
    errorMessage: string;
};

export type State = {
    username: string;
    hasRegisteredPIN: boolean;
    showPinDialog?: boolean;
    pinInput?: string;
    pinError?: string;
};

export default class HomeScreen extends React.Component<Props, State> {

    private verticalSpaceBetweenButtons: number = 10;
    private defaultUsername: string = 'shachar';

    constructor(props: Props) {
        super(props);
        this.state = {
            username: this.defaultUsername,
            hasRegisteredPIN: localUserStore.hasRegisteredPIN(this.defaultUsername),
            showPinDialog: false,
            pinInput: '',
            pinError: '',
        };
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.card}>
                    {this.renderUsernameInputField()}
                    <View style={styles.buttonGroup}>
                        {this.renderStartAuthenticationButton()}
                        {this.renderNativeBiometricsButton()}
                        {this.renderApprovalWebAuthnButton()}
                        {this.renderApprovalWebAuthnWithDataButton()}
                        {this.renderApprovalNativeBiometricsButton()}
                        {this.renderPINButton()}
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
                    autoFocus={false} // prevent keyboard from opening on load
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
            <TouchableOpacity
                style={styles.button}
                activeOpacity={0.85}
                onPress={() => {
                    Keyboard.dismiss();
                    onPress();
                }}
            >
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

    private renderPINButton(): ReactElement {
        return (
            <>
                <View style={{ marginTop: this.verticalSpaceBetweenButtons }}>
                    {!this.state.hasRegisteredPIN
                        ? this.renderButton('Register PIN', () => this.handlePressRegisterPin())
                        : this.renderButton('Authenticate with PIN', () => Alert.alert('PIN Auth', 'Authenticate with PIN pressed'))}
                </View>
                {this.renderPinDialog()}
            </>
        );
    }

    private renderPinDialog(): ReactElement {
        return (
            <Modal
                visible={!!this.state.showPinDialog}
                transparent
                animationType="fade"
                onRequestClose={this.handlePinDialogCancel}
            >
                <View style={styles.pinDialogOverlay}>
                    <View style={styles.pinDialogCard}>
                        <Text style={{ fontSize: 40, marginBottom: 12 }}>🔒</Text>
                        <Text style={styles.pinDialogTitle}>Register PIN</Text>
                        <Text style={styles.pinDialogSubtitle}>Enter a 4-digit PIN</Text>
                        <TextInput
                            style={styles.pinInput}
                            value={this.state.pinInput}
                            onChangeText={this.handlePinInputChange}
                            keyboardType="number-pad"
                            maxLength={4}
                            secureTextEntry
                            placeholder="••••"
                            placeholderTextColor="#bbb"
                            autoFocus
                        />
                        {this.state.pinError ? (
                            <Text style={styles.pinError}>{this.state.pinError}</Text>
                        ) : null}
                        <View style={styles.pinDialogActions}>
                            <Pressable style={styles.pinDialogCancel} onPress={this.handlePinDialogCancel}>
                                <Text style={{ fontSize: 22, color: '#e74c3c' }}>✖️</Text>
                                <Text style={styles.pinDialogCancelText}>Cancel</Text>
                            </Pressable>
                            <Pressable style={styles.pinDialogDone} onPress={this.handlePinDialogDone}>
                                <Text style={{ fontSize: 22, color: '#27ae60' }}>✔️</Text>
                                <Text style={styles.pinDialogDoneText}>Done</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    private handlePressApprovalWebAuthndata = () => {
        if (!this.state.username || this.state.username === '') {
            Alert.alert("Error", "Please enter a username");
            return 
        }

        const approvalData: TSAuthenticationSDK.WebAuthnAuthenticationData = {
            webauthnSessionId: "some-web-authn-session-id",
            credentialRequestOptions: {
                challenge: "some-challenge-string",
                rawChallenge: "some-raw-challenge-string",
                allowCredentials: [
                    {
                        id: "credential-id-123",
                        name: "mock-credential",
                        displayName: "Mock Credential",
                        type: "public-key",
                        transports: null
                    }
                ],
                userVerification: "preferred",
                transports: null,
                rpId: "mock-rp-id",
                userData: {
                    id: this.state.username,
                    name: this.state.username,
                    displayName: this.state.username
                },
                attestation: "direct"
            }
        };

        this.props.onApprovalWebAuthnWithData(approvalData)
    }

    private handlePressApprovalNativeBiometrics = () => {
        if (!this.state.username || this.state.username === '') {
            Alert.alert("Error", "Please enter a username");
            return 
        }

        this.props.onApprovalNativeBiometrics(this.state.username)
    }

    // PIN Authentication methods

    private handlePressRegisterPin = () => {
        this.setState({ showPinDialog: true, pinInput: '', pinError: '' });
    }

    private handlePinInputChange = (text: string) => {
        // Only allow numbers
        if (/^\d{0,4}$/.test(text)) {
            this.setState({ pinInput: text, pinError: '' });
        }
    }

    private handlePinDialogCancel = () => {
        this.setState({ showPinDialog: false, pinInput: '', pinError: '' });
    }

    private handlePinDialogDone = () => {
        const { pinInput } = this.state;
        if (!pinInput || pinInput.length !== 4) {
            this.setState({ pinError: 'Please enter a 4-digit PIN.' });
            return;
        }
        this.setState({ showPinDialog: false, pinError: '' });
        this.onPinRegistered(pinInput!);
    }

    private onPinRegistered = (pin: string) => {
        // Here you can handle the PIN registration logic
        console.log('Registered PIN:', pin);
        // Optionally, update state or localUserStore here
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start', // align card to top
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
    pinDialogOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'flex-start', // align dialog to top
        alignItems: 'center',
        paddingTop: 80, // add top padding to move dialog down a bit from the very top
    },
    pinDialogCard: {
        width: 320,
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 8,
    },
    pinDialogTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#222',
        marginBottom: 4,
    },
    pinDialogSubtitle: {
        fontSize: 15,
        color: '#555',
        marginBottom: 18,
    },
    pinInput: {
        width: 120,
        height: 48,
        borderWidth: 1.5,
        borderColor: '#4f8cff',
        borderRadius: 10,
        fontSize: 28,
        color: '#222',
        textAlign: 'center',
        letterSpacing: 12,
        backgroundColor: '#f5f8ff',
        marginBottom: 8,
    },
    pinError: {
        color: '#e74c3c',
        fontSize: 14,
        marginBottom: 6,
    },
    pinDialogActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 12,
    },
    pinDialogCancel: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    pinDialogCancelText: {
        color: '#e74c3c',
        fontWeight: '600',
        marginLeft: 4,
        fontSize: 16,
    },
    pinDialogDone: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    pinDialogDoneText: {
        color: '#27ae60',
        fontWeight: '600',
        marginLeft: 4,
        fontSize: 16,
    },
});