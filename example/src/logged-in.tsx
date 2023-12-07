/**
 * React Native - Identity Verification example
 * Transmit Security, https://github.com/TransmitSecurity
 *
 * @format
 */

import React, { type ReactElement } from 'react';
import { View, StyleSheet, Text, Button, TextInput } from 'react-native';

export type Props = {
    username: string;
    isNewlyRegistered: boolean;
    onLogout: () => void;
};

export type State = {};

export default class LoggedIn extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
    }

    render() {
        const stateText = (this.props.isNewlyRegistered) ? "Newly registered" : "Authenticated";
        return (
            <View style={styles.container}>
                <View style={{ marginTop: 20 }} />
                <Text style={styles.sectionTitle}>
                    {`Hello ${this.props.username}. You are authenticated. Your user status is: ${stateText}`}
                </Text>
                {this.renderLogoutButton()}
            </View>
        );
    }

    private renderLogoutButton(): ReactElement {
        return (
            <View style={{ marginTop: 24 }}>
                <Button
                    title="Logout"
                    onPress={() => this.props.onLogout()}
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