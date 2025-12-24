import registerComponents from "./WebComponents.js";
import * as Crypto from "./Crypto.js";
import * as Utils from "./Utils.js";
import * as ClientStorage from "./ClientStorage.js";
export function initializeApp(blazor) {
    registerComponents();
    onEnhancedNavigated();
    blazor.addEventListener('enhancedload', onEnhancedNavigated);
}
function onEnhancedNavigated() {
    registerFolderCreationFormHandler();
}
function registerFolderCreationFormHandler() {
    const folderCreationForm = document.getElementById('create-directory-form');
    if (folderCreationForm) {
        if (!folderCreationForm.getAttribute('data-onsubmit-attached')) {
            folderCreationForm.addEventListener('submit', createFolderFromForm);
            folderCreationForm.setAttribute('data-onsubmit-attached', 'true');
            console.debug('Folder creation form onsubmit handler attached.');
        }
        else {
            console.debug('Folder creation form already has an onsubmit handler.');
        }
    }
    else {
        console.debug('No folder creation form found on this page.');
    }
}
async function createFolderFromForm(event) {
    event.preventDefault();
    const directoryName = event.target?.querySelector('input[type="text"]')?.value;
    if (directoryName) {
        const cryptoKeyAndIV = await Crypto.createCyptoKeyAndIV();
        const protectableData = {
            displayName: directoryName
        };
        const protectedData = await Crypto.encryptJSONBase64(protectableData, cryptoKeyAndIV);
        const response = await fetch('/api/directory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                encryptionHeader: Utils.arrayBufferToBase64(cryptoKeyAndIV.iv),
                protectedData
            })
        });
        if (response.ok) {
            console.debug(`Folder "${directoryName}" created successfully.`);
            const responseObject = await response.json();
            console.debug('Directory Metadata:', responseObject);
            var metadata = {
                directoryId: responseObject.directoryId,
                createdAt: new Date(responseObject.createdAt),
                expiresAt: responseObject.expiresAt ? new Date(responseObject.expiresAt) : null,
                lastFileUploadAt: responseObject.lastFileUploadAt ? new Date(responseObject.lastFileUploadAt) : null,
                maxStorageBytes: responseObject.maxStorageBytes,
                usedStorageBytes: responseObject.usedStorageBytes,
                displayName: directoryName
            };
            await ClientStorage.storeDirectoryKey(responseObject.directoryId, cryptoKeyAndIV.cryptoKey);
            await ClientStorage.storeDirectoryMetadata(responseObject.directoryId, metadata);
        }
    }
}
//# sourceMappingURL=App.js.map