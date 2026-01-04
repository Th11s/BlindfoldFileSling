import * as Utils from "./Utils";
import * as Model from "./Model";

interface CreateDirectoryCommand {
    iv: ArrayBuffer;
    protectedData: string;
}

export async function createDirectory(command: CreateDirectoryCommand) : Promise<Response> {
    return fetch("api/directory", {
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

interface CreateFileCommand {
    directoryId: string;
    iv: ArrayBuffer;
    protectedData: string;
}

export async function createFile(command: CreateFileCommand): Promise<Response> {
    return fetch(`api/file/${command.directoryId}`, {
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


export async function getDirectoryMetadata(directoryId: string): Promise<Model.DirectoryMetadataResponse | undefined> {
    const response = await fetch(`api/directory/${directoryId}`);
    if (!response.ok) {
        return undefined;
    }

    return await response.json() as Model.DirectoryMetadataResponse;
}

export async function getDirectoryFiles(directoryId: string): Promise<Model.FileMetadataResponse[] | undefined> {
    const response = await fetch(`api/file/${directoryId}`);
    if (!response.ok) {
        return undefined;
    }

    return await response.json() as Model.FileMetadataResponse[];
}