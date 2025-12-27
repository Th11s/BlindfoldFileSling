import { addActivityIndicator } from './ActivityIndicator.js';
import * as Model from '../Model.js'

export class DirectoryListing extends HTMLElement {
    private files?: Model.FileMetadata[] 

    connectedCallback() {
        const directoryId = this.getAttribute('directory-id');
        if (!directoryId) {
            throw 'Missing directory-id attribute';
        }

        addActivityIndicator(this);
        this.getFiles(directoryId).then(() => this.render());
    }

    async getFiles(directoryId: string) {
        const response = await fetch(`/api/directory/${directoryId}`);
        this.files = await response.json();
    }

    render() {
        if (!this.files) {
            this.innerHTML = `<div>No files found.</div>`;
            return;
        }

        const fileList = document.createElement('ul');
        this.files.forEach((file: any) => {
            const listItem = document.createElement('li');
            listItem.textContent = file.name;
            fileList.appendChild(listItem);
        });
        this.appendChild(fileList);
    }
}
