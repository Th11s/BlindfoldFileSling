import * as Utils from "./Utils";

interface CreateDirectoryCommand {
    iv: ArrayBuffer;
    protectedData: string;
}

export async function createDirectory(command: CreateDirectoryCommand) : Promise<Response> {
    return fetch("/api/directory", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            encryptionHeader: Utils.arrayBufferToBase64(command.iv),
            protectedData: command.protectedData
        })
    });
}