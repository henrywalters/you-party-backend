import User from '../../DataLayer/Domain/User';
export default interface IUserController {
    checkUsernameExists(username: string, cb: {(boolean): void});
    checkEmailExists(email: string, cb: {(boolean): void});
    newUser(username: string, email: string, password: string, cb: {(error, user): void}): void;
    validateUser(usernameOrEmail: string, password: string, cb: {(error, user: User): void}): void;
    changePassword(usernameOrEmail: string, password: string, newPassword: string, cb: {(error, user): void});
    deleteUser(index: string): void;
}