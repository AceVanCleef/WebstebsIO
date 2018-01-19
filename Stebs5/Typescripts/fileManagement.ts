module Stebs {

    export class FileSystem {
        public Id: number;
        public Root: Node;
    }

    export class Node {
        public Id: number;
        public Name: string = '';

        constructor(Id: number, Name: string) {
            this.Id = Id;
            this.Name = Name;
        }
    }

    export class File extends Node {
        constructor(Id: number, Name: string) {
            super(Id, Name);
        }
    }

    export class Folder extends Node {
        public Children: Node[];

        constructor(Id: number, Name: string, Children: Node[]) {
            super(Id, Name);
            this.Children = <Node[]>Children;
        }
    };
    export function checkLength() {
        if ($("#nameInput").val().length >= MAXLENGTHFILENAME) {
            if (firstCheckForFileNameLength == 1) {
                alert('you have reached the limit of ' + MAXLENGTHFILENAME + ' characters');
            }
            firstCheckForFileNameLength = 1;
        }
        var hans = 0;
    };

    export const MAXLENGTHFILENAME = 20;
    export var firstCheckForFileNameLength = 0;
    export let nodesToRemove: number[] = [];
    var nextFreePosition = 0;

    export var fileManagement = {
        fileSystem: <FileSystem>null,
        rootNode: new Folder(0, 'Root', []),
        actualFolder: <Folder>null,
        openedFile: <File>null,

        /**
         * Initialize the FileMangement
         */
        init() {
            //Get Filesystem
            serverHub.getFileSystem().then(function (fileSystem: FileSystem) {
                fileManagement.fileSystem = fileSystem;
                fileManagement.rootNode = <Folder>fileSystem.Root;

                fileManagement.actualFolder = fileManagement.rootNode;
                fileManagement.setAndShowActualNode(fileManagement.actualFolder);
            });

            $('#closeFileSystem').click(fileManagement.toggleFileManager);
            $('#open').click(fileManagement.toggleFileManager);

            $('#new').click(fileManagement.newFile);

            $('#deleteCurrent').click(fileManagement.deleteCurrent);
            $('#deleteMany').click(fileManagement.deleteMany);
            $('#confirmDeleteMany').click(fileManagement.confirmDeleteMany);
            $('#cancelDeleteMany').click(fileManagement.cancelDeleteMany);

            $('#save').click(() => fileManagement.saveFile());

            $('#addFile').click(function () {
                var newNode = new File(-1, 'new File');
                fileManagement.addNode(newNode);
            });
            $('#addFolder').click(function () {
                var newNode = new Folder(-1, 'new Folder', []);
                fileManagement.addNode(newNode);
            });
        },

        /**
         * Save the FileContent to the server
         */
        saveFile() {
            if (fileManagement.openedFile != null) {
                var newSource = Stebs.codeEditor.getDoc().getValue().replace(/\r?\n/g, '\r\n').replace(/\t/g, '    ');
                serverHub.saveFileContent(fileManagement.openedFile.Id, newSource);
                //inform user
                Stebs.ui.informUserOfStatus(Stebs.statusMessages.saved);
                ui.setEditorContentChanged(false);
            } else {
                //This prevents the native save dialog from showing when using prompt()
                setTimeout(() => {
                    var fileName = prompt("Enter file name", "New File"); //TODO: Improve this input
                    if (fileName) {
                        Stebs.serverHub.addNode(fileManagement.actualFolder.Id, fileName, false).then(fileSystem => {
                            //TODO: Improve handling: File Replacing / Unique filenames
                            fileManagement.reloadFileManagement(fileSystem);
                            var nodes = fileManagement.actualFolder.Children.filter(node => node.Name == fileName);
                            if (nodes.length < 1) { return; }
                            var node = nodes[nodes.length - 1];
                            fileManagement.setFilenameText(node.Name);
                            fileManagement.openedFile = <File>node;
                            fileManagement.saveFile();
                        });
                    }
                }, 0);
            }
        },

        /**
         * Sets the filename text to a given text.
         */
        setFilenameText(text: string, counter: number = 0) {

            if (counter === 0) {
                $('#filename').html(text);
                document.title = 'Stebs: ' + text;
            }
            //width in pixel:
           /* if ($('#filename').width() > 150) {
                var newText = text.substr(0, text.length - 1);
                $('#filename').html(newText.concat('...'));
                if (($('#filename').width() > 150) && counter < 1000) fileManagement.setFilenameText(newText, ++counter);
            }*/

            
        },

        /**
         * Create new file and Open FileManagement
         */
        newFile() {
            fileManagement.openFileManager();
            var newNode = new File(-1, 'new File');
            fileManagement.addNode(newNode);
        },

        /**
         * Shows file manager view.
         */
        openFileManager() {
            $('#fileSystem').show();
        },

		/**
         * Opens Filemanagement and lets you set a Foldername
         */
        openAddFolder() {
            $('#fileSystem').show();
            var newNode = new Folder(-1, 'new Folder', []);
            fileManagement.addNode(newNode);
        },

        /**
        * Delets current (opened) File
        */
        deleteCurrent() {
            var actualNode = fileManagement.openedFile

            if (actualNode.Id != -1) {
                if (confirm('Are you sure you want to delete the file: ' + actualNode.Name + '?')) {

                    //delets File
                    serverHub.deleteNode(actualNode.Id, fileManagement.nodeIsFolder(actualNode)).then(fileManagement.reloadFileManagement);

                    //opens a new file but doesn't create a new file
                    codeEditor.getDoc().setValue("");
                    codeEditor.getDoc().clearHistory();
                    fileManagement.openedFile = null;
                    $('#filename').text("new File");
                    fileManagement.rootNode = <Folder>fileManagement.fileSystem.Root;
                    fileManagement.actualFolder = fileManagement.rootNode;
                    document.title = 'Stebs';
                }
            } else {
                alert("no file opened");
            }
        },

        /**
        * Opens Filemanager to select multiple files, that
        * will be removed.
        */
        deleteMany() {
            //shows delete buttons
            $("#addFile").hide();
            $("#addFolder").hide();
            $("#confirmDeleteMany").show();
            $("#cancelDeleteMany").show();

            //shows checkboxes to select files
            fileManagement.actualFolder.Children.forEach(function (child) {
                if (!fileManagement.nodeIsFolder(child)) {
                $('#file-' + child.Id + ' i.fa-trash-o')
                    .removeClass('fa-trash-o')
                    .addClass('fa-square-o')
                //    .removeClass('removeIcon')
                  //  .addClass('removeManyIcon')
                    .prop('href', '#')
                    .unbind()
                    .click(function () {
                        fileManagement.addNodeToDeleteManyArray(child.Id);
                        });
                }
            });

            //hides edit icon
            fileManagement.actualFolder.Children.forEach(function (child) {
                $('#file-' + child.Id + ' i.fa-pencil-square-o').hide();
            });

            //shows Filemanager if necessary
            if ($("#fileSystem").is(":hidden")) {
                $('#fileSystem').toggle();
            }

            //resets nodesToRemove and nextFreePosition
            nodesToRemove = [];
            nextFreePosition = 0;
        },

        /**
        * removes all files in nodesToRemove
        */
        confirmDeleteMany() {
            //checks if files are selected
            var filesSelected = false;
            for (let node of Stebs.nodesToRemove) {
                if (node >= 0) {
                    filesSelected = true;
                    break;
                }
            }
            if (filesSelected) {
                if (confirm('Are you sure you want to delete these files?')) {
                    fileManagement.toggleFileManager();

                    //removes all files in nodesToRemove
                    for (let node of Stebs.nodesToRemove) {
                        if (node != -1) {
                            serverHub.deleteNode(node, fileManagement.nodeIsFolder(fileManagement.actualFolder)).then(fileManagement.reloadFileManagement);
                        }
                    }

                    //opens a new file but doesn't create a new file and resets the GUI
                    codeEditor.getDoc().setValue("");
                    codeEditor.getDoc().clearHistory();
                    fileManagement.openedFile = null;
                    $('#filename').text("new File");
                    document.title = 'Stebs';
                    fileManagement.rootNode = <Folder>fileManagement.fileSystem.Root;
                    fileManagement.actualFolder = fileManagement.rootNode;
                    serverHub.getFileSystem().then(fileManagement.reloadFileManagement);
                    nextFreePosition = 0;
                    $("#addFile").show();
                    $("#addFolder").show();
                    $("#confirmDeleteMany").css("display", "none");
                    $("#cancelDeleteMany").css("display", "none");
                }
            } else {
                alert("You have not selected a file.")
            }
        },

        /**
         * leave DeleteMany menu.
         */
        cancelDeleteMany() {
            serverHub.getFileSystem().then(fileManagement.reloadFileManagement);
            $("#addFile").show();
            $("#addFolder").show();
            $("#confirmDeleteMany").hide();
            $("#cancelDeleteMany").hide();

            $('#fileSystem').toggle();
        },

		/**
         * adds Node to nodesToRemove
         */
        addNodeToDeleteManyArray(nummer: number) {
            //adds Node
            Stebs.nodesToRemove[nextFreePosition] = nummer;

            //sets new nextFreePosition
            nextFreePosition++;
            if (Stebs.nodesToRemove[nextFreePosition] > 0) {
                while (Stebs.nodesToRemove[nextFreePosition] != -1) {
                    nextFreePosition++;
                }

            } else {
                Stebs.nodesToRemove[nextFreePosition] = -1;
            }

            //sets Icon on selected
            $('#file-' + nummer + ' i.fa-square-o')
                .removeClass('fa-square-o')
                .addClass('fa-check-square-o')
                .prop('href', '#')
                .unbind()
                .click(function () {
                    fileManagement.removeNodeFromDeleteManyArray(nummer);
                });

        },

        /**
         * removes Node from nodesToRemove
         */
        removeNodeFromDeleteManyArray(nummer: number) {
            //searches for node to remove
            var index: number = 0;
            while (Stebs.nodesToRemove[index] != nummer) {
                index++;
            }

            //removes node
            Stebs.nodesToRemove[index] = -1;

            if (nextFreePosition > index) {
                nextFreePosition = index;
            }

            //sets Icon on unselected
            $('#file-' + nummer + ' i.fa-check-square-o')
                .removeClass('fa-check-square-o')
                .addClass('fa-square-o')
                .prop('href', '#')
                .unbind()
                .click(function () {
                    fileManagement.addNodeToDeleteManyArray(nummer);
                });
        },

        /**
         * Opens the file manager, if it was closed.
         * Closes the file manager otherwise.
         */
        toggleFileManager() {


            
            firstCheckForFileNameLength = 0;

            if ($("#confirmDeleteMany").is(":visible")) {
                $("#addFile").show();
                $("#addFolder").show();
                $("#confirmDeleteMany").hide();
                $("#cancelDeleteMany").hide();
            }
            $('#fileSystem').toggle();
            serverHub.getFileSystem().then(fileManagement.reloadFileManagement);
            firstCheckForFileNameLength = 0;
        },

        /** 
        * BindFunction to reload File Management
        */
        reloadFileManagement(fileSystem: FileSystem) {
            fileManagement.fileSystem = fileSystem;
            var searchFolders = function searchFolders(node: Node) {
                if (fileManagement.nodeIsFolder(node)) {
                    if (node.Id == fileManagement.actualFolder.Id) {
                        fileManagement.actualFolder = <Folder>node;
                    }
                    if (node.Id == fileManagement.rootNode.Id) {
                        fileManagement.rootNode = <Folder>node;
                    }
                    (<Folder>node).Children.forEach(searchFolders);
                }
            };
            searchFolders(fileSystem.Root);

            fileManagement.setAndShowActualNode(fileManagement.actualFolder);
        },

        /**
         * Add a Node to the Filesystem at the actualNode.
         * (will not be saved to the server until new name is defined)
         * @param node The new node.
         */
        addNode(node: Node) {
            var unsavedNewFile = false;
            fileManagement.actualFolder.Children.forEach(function (child) {
                if (child.Id == -1) {
                    unsavedNewFile = true;
                }
            });
            if (!unsavedNewFile) {
                var actualNode = fileManagement.actualFolder;
                actualNode.Children.push(node);
                fileManagement.showFileManagement(actualNode);
                fileManagement.setFilenameEditable(node, false);
            }
        },

        /**
         * If node is a Folder the filesystem will be reloaded with the new folder, else the file will be loaded.
         * @param node The node to load.
         */
        setAndShowActualNode(node: Node) {
            if (fileManagement.nodeIsFolder(node)) {
                fileManagement.actualFolder = <Folder>node;
                fileManagement.showFileManagement(<Folder>node);
                fileManagement.showActualPath();
            } else {
                var fileContent = serverHub.getFileContent(node.Id).then(function (fileContent: string) {
                    fileManagement.setFilenameText(node.Name);
                    $('#fileSystem').toggle();
                    codeEditor.getDoc().setValue(fileContent);
                    codeEditor.getDoc().clearHistory();
                    fileManagement.openedFile = <File>node;
                    ui.setEditorContentChanged(false);
                });
            }
        },

        /**
         * Clear and reinserts the Filemanagement at the given position into $('#files').
         * @param node The node position.
         */
        showFileManagement(node: Node) {
            $('#files').empty();
            if (fileManagement.nodeIsFolder(node)) {
                var children = (<Folder>node).Children;
                for (var i = 0; i < children.length; i++) {
                    var nodeAsHtml = fileManagement.nodeToHtml(children[i]);
                    $('#files').append(nodeAsHtml);
                }
            }
        },

        /**
         * Search recursively the parentfolder of the given folder.
         * @param startFolder the startFolder (normaly start with root).
         * @param folder the folder to search.
         */
        getParentFolder(startFolder: Folder, folder: Folder): Folder {
            if (!fileManagement.nodeIsFolder(startFolder)) {
                console.log('startFolder has no childs');
                return null;
            }
            if (!fileManagement.nodeIsFolder(folder)) {
                console.log('folder to search has no childs');
                return null;
            }
            for (var i = 0; i < startFolder.Children.length; i++) {
                if (fileManagement.nodeIsFolder(startFolder.Children[i])) {
                    if (startFolder.Children[i].Id === folder.Id) {
                        return startFolder;
                    } else {
                        var found = fileManagement.getParentFolder(<Folder>startFolder.Children[i], folder);
                        if (found != null) {
                            return found;
                        }
                    }
                }
            }
            return null;
        },

        /**
         * Insert the actual path into the FileManagement view.
         */
        showActualPath() {
            var links: JQuery[] = [];
            var travelFolderNode: Folder = fileManagement.actualFolder;
            while (travelFolderNode.Id !== fileManagement.rootNode.Id && travelFolderNode != null) {
                if (travelFolderNode != null) {
                    var toTravel = travelFolderNode;
                    var link = $('<a>')
                        .prop('href', '#')
                        .text(travelFolderNode.Name)
                        .click(function () {
                            fileManagement.setAndShowActualNode(toTravel);
                        });
                    links.push(link);
                    travelFolderNode = fileManagement.getParentFolder(fileManagement.rootNode, travelFolderNode);
                }
            }
            if (travelFolderNode != null) {
                $('#folderPath').empty();
                $('#folderPath').append('/');
                var rootLink = $('<a>')
                    .prop('href', '#')
                    .text(travelFolderNode.Name)
                    .click(function () {
                        fileManagement.setAndShowActualNode(travelFolderNode);
                    });
                $('#folderPath').append(rootLink);
                $('#folderPath').append('/');
                for (var i = links.length - 1; i >= 0; i--) {
                    $('#folderPath').append(links[i]);
                    $('#folderPath').append('/');
                }
            }
        },

        /**
         * Convert the node into a JQuery.
         * @param node The node to convert.
         */
        nodeToHtml(node: Node): JQuery {
            var nodeJQuery = $('<div>')
                .addClass('file-node')
                .prop('id', 'file-' + node.Id);
            var imgSpan = $('<span/>')
                .addClass('icon')
                .addClass('fa fa-file-text-o')
                .prop('aria-hidden', 'true')
                .css('margin-left', '5px');
            if (fileManagement.nodeIsFolder(node)) {
                imgSpan.removeClass('fa-file-text-o')
                    .addClass('fa-folder-open-o ');
            }
            nodeJQuery.append(imgSpan);

            var textSpan = $('<span/>')
                .addClass('text')
                .text(node.Name);
            var openLink = $('<a>')
                .addClass('openLink')
                .prop('href', '#')
                .append(textSpan)
                .click(function () {
                    fileManagement.setAndShowActualNode(node);
                });
            nodeJQuery.append(openLink);

            var editJQuery = $('<i>')
                .addClass('icon')
                .addClass('fa fa-pencil-square-o')
               // .addClass('editIcon')
                .prop('href', '#')
                .prop('aria-hidden', 'true')
                .click(function () {
                    fileManagement.setFilenameEditable(node, true);
                });
            nodeJQuery.append(editJQuery);

            var deleteJQuery = $('<i>')
                .addClass('icon')
                .prop('href', '#')
                .prop('aria-hidden', 'true')
                .click(function () {
                    if (node.Id != -1) {
                        if (confirm('Delete this ' + (fileManagement.nodeIsFolder(node) ? 'folder?' : 'file?'))) {
                            console.log('delete file in backend clicked');
                            serverHub.deleteNode(node.Id, fileManagement.nodeIsFolder(node)).then(fileManagement.reloadFileManagement);
                        }
                    }
                });
            if (!fileManagement.nodeIsFolder(node) || (<Folder>node).Children.length == 0) {
                deleteJQuery.addClass('fa fa-trash-o')
            }
            nodeJQuery.append(deleteJQuery);

            return nodeJQuery;
        },

        /**
         * Change node name to editable.
         * @param node The node to change.
         */
        setFilenameEditable(node: Node, withReload: boolean) {
            serverHub.getFileSystem().then(function (filesystem) {
                if (withReload) {
                    fileManagement.reloadFileManagement(filesystem);
                }
                var editableText = $('<input>')
                    .prop('type', 'text')
                    .val($('#file-' + node.Id + ' a.openLink').text())
                    .attr('maxlength', MAXLENGTHFILENAME)
                    .attr('onkeyup', 'Stebs.checkLength()')
                    .attr('id', 'nameInput');
                $('#file-' + node.Id + ' a.openLink').replaceWith(editableText);
                var okLink = $('<a>')

                $('#file-' + node.Id + ' i.fa-pencil-square-o')
                    .removeClass('fa-pencil-square-o')
                    .addClass('fa-check ')
                    .prop('href', '#')
                    .click(function () {
                        var newName = $('#file-' + node.Id + ' input').val();
                        if (node.Id == -1) {
                            console.log('add new File on server clicked');
                            serverHub.addNode(fileManagement.actualFolder.Id, newName, fileManagement.nodeIsFolder(node))
                                .then(fileManagement.reloadFileManagement);
                        } else {
                            console.log('change filename on server clicked');
                            serverHub.changeNodeName(node.Id, newName, fileManagement.nodeIsFolder(node))
                                .then(function (filesystem: FileSystem) {
                                    fileManagement.reloadFileManagement(filesystem);
                                    if (!fileManagement.nodeIsFolder(node) && node.Id == fileManagement.openedFile.Id) {
                                        fileManagement.setFilenameText(newName);
                                    }
                                });
                        }
                        firstCheckForFileNameLength = 0;
                    });

                $('#file-' + node.Id + ' i.fa-trash-o')
                    .removeClass('fa-trash-o')
                    .addClass('fa-times')
                    .prop('href', '#')
                    .unbind()
                    .click(function () {
                        console.log('reload without change clicked');
                        serverHub.getFileSystem().then(fileManagement.reloadFileManagement);
                        firstCheckForFileNameLength = 0;
                    });
                editableText.focus().select();
            });

        },

        /**
         * Check if node is a folder.
         * @param node The node to check.
         */
        nodeIsFolder(node: Node): boolean {
            return typeof (<Folder>node).Children !== 'undefined';
        }
    }
}
