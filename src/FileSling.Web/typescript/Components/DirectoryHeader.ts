import { addActivityIndicator } from './ActivityIndicator.js';
import * as Model from '../Model.js'

export class DirectoryHeader extends HTMLElement {
    private directoryMetadata?: Model.DirectoryMetadata;

    connectedCallback() {
        const directoryId = this.getAttribute('directory-id');
        if (!directoryId) {
            throw 'Missing directory-id attribute';
        }

        addActivityIndicator(this);
        this.loadDirectoryHeader(directoryId).then(() => this.render());
    }

    async loadDirectoryHeader(directoryId: string) {
        const response = await fetch(`/api/directory/${directoryId}/header`);
    }

    render() {
        this.innerHTML = `<div class="directory-header">Directory Header Content</div>`;
    }
}