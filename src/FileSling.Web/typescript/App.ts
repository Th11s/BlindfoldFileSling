import registerComponents from "./WebComponents.js";

export function initializeApp(blazor: any) {
    blazor.addEventListener('enhancedload', onEnhancedNavigated);

    registerComponents();
    onEnhancedNavigated();
}  

function onEnhancedNavigated() {
    const folderCreationForm = document.getElementById('create-directory-form') as HTMLElement;
    if (folderCreationForm) {
        if (!folderCreationForm.getAttribute('data-onsubmit-attached')) {
            folderCreationForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const folderName = ((event.target as HTMLElement).querySelector('input[type="text"]') as HTMLInputElement)?.value;
                if (folderName) {
                    const response = await fetch('/api/directory', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ name: folderName })
                    });
                }
            });

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
