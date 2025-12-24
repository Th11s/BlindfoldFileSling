import registerComponents from "./WebComponents.js";
export function initializeApp(blazor) {
    blazor.addEventListener('enhancedload', onEnhancedNavigated);
    registerComponents();
    onEnhancedNavigated();
}
function onEnhancedNavigated() {
    const folderCreationForm = document.getElementById('create-directory-form');
    if (folderCreationForm) {
        if (!folderCreationForm.getAttribute('data-onsubmit-attached')) {
            folderCreationForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const folderName = event.target.querySelector('input[type="text"]')?.value;
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
//# sourceMappingURL=App.js.map