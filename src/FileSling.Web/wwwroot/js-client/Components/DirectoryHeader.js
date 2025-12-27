import { addActivityIndicator } from './ActivityIndicator.js';
export class DirectoryHeader extends HTMLElement {
    connectedCallback() {
        const directoryId = this.getAttribute('directory-id');
        if (!directoryId) {
            throw 'Missing directory-id attribute';
        }
        addActivityIndicator(this);
        this.loadDirectoryHeader(directoryId).then(() => this.render());
    }
    async loadDirectoryHeader(directoryId) {
        const response = await fetch(`/api/directory/${directoryId}/header`);
    }
    render() {
        this.innerHTML = `<div class="directory-header">Directory Header Content</div>`;
    }
}
//# sourceMappingURL=DirectoryHeader.js.map