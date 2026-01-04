import registerComponents from "./Components/WebComponents";
import * as Crypto from "./Cryptography";
import * as Utils from "./Utils";
import * as ClientStorage from "./ClientStorage";

import * as Model from "./Model.js";

export function initializeApp() {
    registerComponents();
}  

function registerFolderCreationFormHandler() {
    const folderCreationForm = document.getElementById("create-directory-form");
    if (folderCreationForm) {
        if (!folderCreationForm.getAttribute("data-onsubmit-attached")) {
            folderCreationForm.addEventListener("submit", createFolderFromForm);
            folderCreationForm.setAttribute("data-onsubmit-attached", "true");
            console.debug("Folder creation form onsubmit handler attached.");
        }
        else {
            console.debug("Folder creation form already has an onsubmit handler.");
        }
    }
    else {
        console.debug("No folder creation form found on this page.");
    }
}

async function createFolderFromForm(event: SubmitEvent) {
    event.preventDefault();
    const directoryName = ((event.target as HTMLFormElement)?.querySelector("input[type='text']") as HTMLInputElement)?.value;
    if (directoryName) {
        
    }
}

registerComponents();