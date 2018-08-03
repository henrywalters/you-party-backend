export default interface IAuth {
    guestLogin(guestName: string, partyKey: string, cb: {(jwt : boolean | Object): void});
    login(usernameOrEmail: string, password: string, cb: {(jwt: boolean | Object):void});
    validateHeader(request: any, response: any, actor: string): boolean;
    validateToken(token: string, cb: {(valid: boolean) : void});
    refreshToken(refreshToken: string, cb: {(jwt: boolean | Object): void});
}