import { addActivityIndicator } from './ActivityIndicator.js';
export class DirectoryListing extends HTMLElement {
    connectedCallback() {
        const directoryId = this.getAttribute('directory-id');
        if (!directoryId) {
            throw 'Missing directory-id attribute';
        }
        addActivityIndicator(this);
        this.getFiles(directoryId).then(() => this.render());
    }
    async getFiles(directoryId) {
        const response = await fetch(`/api/directory/${directoryId}`);
        this.files = await response.json();
    }
    render() {
        if (!this.files) {
            this.innerHTML = `<div>No files found.</div>`;
            return;
        }
        const fileList = document.createElement('ul');
        this.files.forEach((file) => {
            const listItem = document.createElement('li');
            listItem.textContent = file.name;
            fileList.appendChild(listItem);
        });
        this.appendChild(fileList);
    }
}
//# sourceMappingURL=DirectoryListing.js.map