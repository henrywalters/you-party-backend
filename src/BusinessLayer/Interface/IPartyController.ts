export default interface IPartyController {
    newParty(partyName: string, userId: string, cb: {(error, party): void});
    //joinParty(partyKey: string, cb: {(error, party): void});
}