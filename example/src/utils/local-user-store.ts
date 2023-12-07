import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalUserStore {

    private kUserStoreStorageKey = 'rn-ts-authentication__local-user-store';
    private userIDsStore: string[] = [];

    constructor() {
        this.loadUserStore();
    }

    public addUserID(userID: string): void {
        this.userIDsStore.push(userID);
        this.updateUserStore();
    }

    public removeUserID(userID: string): void {
        this.userIDsStore = this.userIDsStore.filter((id) => id !== userID);
        this.updateUserStore();
    }

    public isUserIDStored(userID: string): boolean {
        return this.userIDsStore.includes(userID);
    }

    // Private methods

    private loadUserStore = async (): Promise<void> => {
        const userStore = await AsyncStorage.getItem(this.kUserStoreStorageKey);
        if (userStore) {
            this.userIDsStore = JSON.parse(userStore);
        } else {
            this.updateUserStore();
        }
    }

    private updateUserStore = async (): Promise<void> => {
        try {
            let storeJson = JSON.stringify(this.userIDsStore);
            await AsyncStorage.setItem(this.kUserStoreStorageKey, storeJson);
        } catch (e) {
            console.log('Error saving user store', e);
        }
    }
}
export default new LocalUserStore();