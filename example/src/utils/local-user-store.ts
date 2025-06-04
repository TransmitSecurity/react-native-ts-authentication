import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalUserStore {

    private kUserStoreStorageKey = 'rn-ts-authentication__local-user-store';
    private store: { 
        userIDs: string[]; 
        pinStatus: { [userID: string]: boolean } 
    } = { userIDs: [], pinStatus: {} };

    constructor() {
        this.loadUserStore();
    }

    public addUserID(userID: string): void {
        if (!this.store.userIDs.includes(userID)) {
            this.store.userIDs.push(userID);
            this.updateUserStore();
        }
    }

    public removeUserID(userID: string): void {
        this.store.userIDs = this.store.userIDs.filter((id) => id !== userID);
        delete this.store.pinStatus[userID];
        this.updateUserStore();
    }

    public isUserIDStored(userID: string): boolean {
        return this.store.userIDs.includes(userID);
    }

    public setHasRegisteredPIN = (userID: string, hasRegisteredPIN: boolean): void => {
        this.store.pinStatus[userID] = hasRegisteredPIN;
        this.updateUserStore();
    }

    public hasRegisteredPIN = (userID: string): boolean => {
        return !!this.store.pinStatus[userID];
    }

    // Private methods

    private loadUserStore = async (): Promise<void> => {
        const userStore = await AsyncStorage.getItem(this.kUserStoreStorageKey);
        if (userStore) {
            this.store = JSON.parse(userStore);
            if (Array.isArray(this.store)) {
                this.store = { userIDs: this.store as string[], pinStatus: {} };
            }
        } else {
            this.updateUserStore();
        }
    }

    private updateUserStore = async (): Promise<void> => {
        try {
            let storeJson = JSON.stringify(this.store);
            await AsyncStorage.setItem(this.kUserStoreStorageKey, storeJson);
        } catch (e) {
            console.log('Error saving user store', e);
        }
    }
}
export default new LocalUserStore();