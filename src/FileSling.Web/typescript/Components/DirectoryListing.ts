export class DirectoryListing extends HTMLElement {
    connectedCallback() {
        const directoryId = this.getAttribute('directory-id');
        if (!directoryId) {
            throw 'Missing directory-id attribute';
        }

        this.innerHTML = `<div>Loading directory listing ID: ${directoryId}...</div>`;

        this.getFiles(directoryId);
    }

    async getFiles(directoryId: string) {
        const response = await fetch(`/api/directory/${directoryId}`);
        const files = await response.json();

        this.innerHTML = `<div>Directory Listing for ID: ${directoryId}</div>`;
        const fileList = document.createElement('ul');
        files.forEach((file: any) => {
            const listItem = document.createElement('li');
            listItem.textContent = file.name;
            fileList.appendChild(listItem);
        });
        this.appendChild(fileList);
    }
}
