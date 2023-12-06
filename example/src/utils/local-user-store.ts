
class LocalUserStore {

    // private kUserStoreStorageKey = 'rn-ts-authentication__local-user-store';
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
    
    private loadUserStore(): void {
        // const userStore = localStorage.getItem(this.kUserStoreStorageKey);
        // if (userStore) {
        //     this.userIDsStore = JSON.parse(userStore);
        // } else {
        //     this.updateUserStore();
        // }
    } 

    private updateUserStore(): void {
        // localStorage.setItem(this.kUserStoreStorageKey, JSON.stringify(this.userIDsStore));
    }
}
export default new LocalUserStore();