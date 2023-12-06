/**
 * React Native - Identity Verification example
 * Transmit Security, https://github.com/TransmitSecurity
 *
 * @format
 */

import React, { type ReactElement } from 'react';
import { View, StyleSheet, Text, Button, TextInput } from 'react-native';

export type Props = {
    onStartAuthentication: (username: string) => void;
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
                {this.renderStatusLabel()}
            </View>
        );
    }

    private renderUsernameInputField(): ReactElement {
        return (
            <View style={{ marginTop: 24 }}>
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
            <View style={{ marginTop: 24 }}>
                <Text style={styles.statusLabel}>{this.props.errorMessage}</Text>
            </View>
        )
    }

    private renderStartAuthenticationButton(): ReactElement {
        return (
            <View style={{ marginTop: 24 }}>
                <Button
                    title="Start Authentication"
                    onPress={() => this.props.onStartAuthentication(this.state.username)}
                />
            </View>
        )
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