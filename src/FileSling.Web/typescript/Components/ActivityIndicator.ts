export class ActivityIndicator extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<div class="spinner">Loading...</div>`;
    }
}

export const addActivityIndicator = ($e: HTMLElement) => {
    $e.appendChild(document.createElement('th11s-activity-indicator'));
}