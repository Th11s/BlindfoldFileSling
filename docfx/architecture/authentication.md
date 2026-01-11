# Authentication and Authorization

The system makes use of logins to allow creation of folders.
Upon creation of a folder the creator is stored as owner of the folder.
The owner may delete folders at any time.
Since deletion doesn't need to know the contents of the folder or files, there's no check beyond this.

Owner rights can be delegated by passing the owner challenge. A key holder can solve the challenge and thus be owner as well...