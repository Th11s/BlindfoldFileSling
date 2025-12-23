class DirectoryListing extends HTMLElement {
    connectedCallback() {
        const directoryId = this.getAttribute('directory-id');
        if (!directoryId) {
            throw 'Missing directory-id attribute';
        }
        this.innerHTML = `<div>Loading directory listing ID: ${directoryId}...</div>`;
        this.getFiles(directoryId);
    }
    async getFiles(directoryId) {
        const response = await fetch(`/api/directory/${directoryId}`);
        const files = await response.json();
        this.innerHTML = `<div>Directory Listing for ID: ${directoryId}</div>`;
        const fileList = document.createElement('ul');
        files.forEach((file) => {
            const listItem = document.createElement('li');
            listItem.textContent = file.name;
            fileList.appendChild(listItem);
        });
        this.appendChild(fileList);
    }
}
export default function registerComponents() {
    customElements.define('th11s-directory-listing', DirectoryListing);
}
//# sourceMappingURL=WebComponents.js.map