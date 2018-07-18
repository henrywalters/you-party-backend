export default interface ILog {
    log(sender: string, message: string);
    getLogs(cb: {(logs): void});
}