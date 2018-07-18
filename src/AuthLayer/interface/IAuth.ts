export default interface IAuth {
    login(usernameOrEmail: string, password: string, cb: {(jwt: boolean | Object):void});
    validateToken(token: string, cb: {(valid: boolean) : void});
    refreshToken(refreshToken: string, cb: {(jwt: boolean | Object): void});
}