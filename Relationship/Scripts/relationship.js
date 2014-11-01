var zTreeObj;
function addPersonClick() {
    var newClientPerson = new ClientPerson();
    newClientPerson.birthDay("1:0001-01-01");
    newClientPerson.birthTime("00:00");
    newClientPerson.deathDay("1:9999-12-31");
    newClientPerson.deathTime("23:59");
    newClientPerson.gender(1);
    newClientPerson.orderInChildrenOfParents(1);
    viewModel.editPerson(newClientPerson);
    $("#editPersonDialog").dialog({
        autoOpen: false,
        buttons: [
            {
                text: "Ok",
                click: function () {
                    viewModel.errorMessage(null);
                    var jsonData = new ServerPerson(viewModel.editPerson());
                    var data = ko.toJSON(jsonData);
                    $.ajax({
                        type: "POST",
                        url: "/odata/People()",
                        contentType: "application/json; charset=utf-8",
                        data: data,
                        success: function (returnedData) {
                            $("#editPersonDialog").dialog("close");
                            viewModel.viewPerson(new ClientPerson(returnedData));
                            responseDataToTreeNode(returnedData);
                            var fatherNode = null;
                            if (returnedData.FatherId) {
                                var candidateNode = zTreeObj.getNodesByParam("Id", returnedData.FatherId, null)
                                if (candidateNode) {
                                    fatherNode = candidateNode[0];
                                    zTreeObj.expandNode(fatherNode, true, false, false);
                                }
                            }
                            var newNode = zTreeObj.addNodes(fatherNode, returnedData)[0];
                            zTreeObj.selectNode(newNode);
                            zTreeOnClick(null, "treeDemo", newNode);
                        },
                        failure: function (response) {
                            alert(response);
                        }
                    });
                }
            }],
        modal: true,
        width: 600,
    });
    $("#editPersonDialog").dialog("open");
};

function editPersonClick() {
    viewModel.editPerson().birthDay(viewModel.viewPerson().birthDay());
    viewModel.editPerson().id(viewModel.viewPerson().id());
    viewModel.editPerson().birthTime(viewModel.viewPerson().birthTime());
    viewModel.editPerson().deathDay(viewModel.viewPerson().deathDay());
    viewModel.editPerson().deathTime(viewModel.viewPerson().deathTime());
    viewModel.editPerson().fatherId(viewModel.viewPerson().fatherId());
    viewModel.editPerson().firstName(viewModel.viewPerson().firstName());
    viewModel.editPerson().gender(viewModel.viewPerson().gender());
    viewModel.editPerson().lastName(viewModel.viewPerson().lastName());
    viewModel.editPerson().motherId(viewModel.viewPerson().motherId());
    viewModel.editPerson().orderInChildrenOfParents(viewModel.viewPerson().orderInChildrenOfParents());
    viewModel.editPerson().remark(viewModel.viewPerson().remark());
    $("#editPersonDialog").dialog({
        autoOpen: false,
        buttons: [
            {
                text: "Ok",
                click: function () {
                    viewModel.errorMessage(null);
                    var jsonData = new ServerPerson(viewModel.editPerson());
                    var data = ko.toJSON(jsonData);
                    var id = viewModel.editPerson().id();
                    $.ajax({
                        type: "PUT",
                        url: "/odata/People(" + id + ")",
                        contentType: "application/json; charset=utf-8",
                        data: data,
                        success: function (returnedData) {
                            viewModel.viewPerson(new ClientPerson(returnedData));
                            responseDataToTreeNode(returnedData);
                            var nodes = zTreeObj.getSelectedNodes();
                            var selectedTreeNode = nodes[0];
                            selectedTreeNode.BirthDay = returnedData.BirthDay;
                            selectedTreeNode.BirthTime = returnedData.BirthTime;
                            selectedTreeNode.DeathDay = returnedData.DeathDay;
                            selectedTreeNode.DeathTime = returnedData.DeathTime;
                            selectedTreeNode.isParent = returnedData.isParent;
                            selectedTreeNode.name = returnedData.name;
                            zTreeObj.updateNode(selectedTreeNode);
                            $("#editPersonDialog").dialog("close");
                        },
                        failure: function (response) {
                            alert(response);
                        }
                    });
                }
            }],
        modal: true,
        width: 600,
    });
    $("#editPersonDialog").dialog("open");
};

function deletePersonClick() {
    $( "#dialog-confirm" ).dialog({
        resizable: false,
        height:220,
        modal: true,
        buttons: {
            "确定": function() {
                var id = viewModel.viewPerson().id();
                $.ajax({
                    type: "DELETE",
                    url: "/odata/People(" + id + ")",
                    success: function () {
                        $("#dialog-confirm").dialog("close");
                        var deletedNode=zTreeObj.getNodesByParam("Id", id, null)[0];
                        if(deletedNode.Gender==1){
                            var childrenNodes = deletedNode.children;
                            if (childrenNodes != null) {
                                for (var i = 0; i < childrenNodes.length; i++) {
                                    var childNode = childrenNodes[i];
                                    childNode.FatherId = null;
                                    childNode.Father = null;
                                    zTreeObj.updateNode(childNode);
                                    zTreeObj.removeNode(childNode);
                                    zTreeObj.addNodes(null, childNode);
                                }
                            }
                        }
                        var nextSelectedNode = deletedNode.getParentNode();
                        if (!nextSelectedNode) {
                            nextSelectedNode=deletedNode.getPreNode();
                        }
                        zTreeObj.removeNode(deletedNode);
                        if (nextSelectedNode) {
                            zTreeObj.selectNode(nextSelectedNode);
                            zTreeOnClick(null, "treeDemo", nextSelectedNode);
                        }
                    },
                    failure: function (response) {
                        alert(response);
                    }
                });
            },
            "取消": function() {
                $( "#dialog-confirm" ).dialog( "close" );
            }
        }
    });
    
    $("#dialog-confirm").dialog("open");
};

function ClientPerson(serverPerson) {
    var self = this;
    self.birthDay = ko.observable();
    self.birthTime = ko.observable();
    self.childrenByFather = ko.observableArray();
    self.childrenByMother = ko.observableArray();
    self.deathDay = ko.observable();
    self.deathTime = ko.observable();
    self.fatherFirstName = ko.observable();
    self.fatherId = ko.observable();
    self.fatherLastName = ko.observable();
    self.firstName = ko.observable();
    self.gender = ko.observable();
    self.id = ko.observable();
    self.lastName = ko.observable();
    self.motherFirstName = ko.observable();
    self.motherId = ko.observable();
    self.motherLastName = ko.observable();
    self.orderInChildrenOfParents = ko.observable();
    self.remark = ko.observable();

    self.formattedGender = ko.dependentObservable(function () {
        return self.gender() == 1 ? "男" : "女";
    }.bind(self));
    self.formattedBirthDay = ko.dependentObservable(function () {
        return self.birthDay() ? self.birthDay().replace("1:", "").replace("0:", "公元前 ") : "";
    }.bind(self));
    self.formattedDeathDay = ko.dependentObservable(function () {
        return self.deathDay() ? self.deathDay().replace("1:", "").replace("0:", "公元前 ") : "";
    }.bind(self));

    updateClientPerson(serverPerson);

    function updateClientPerson(serverPerson) {
        if (serverPerson == null) {
            return;
        }
        self.birthDay(serverPerson.BirthDay);
        self.birthTime(serverPerson.BirthTime);
        self.deathDay(serverPerson.DeathDay);
        self.deathTime(serverPerson.DeathTime);
        if (serverPerson.Father != null) {
            self.fatherFirstName(serverPerson.Father.FirstName);
            self.fatherLastName(serverPerson.Father.LastName);
        }
        self.fatherId(serverPerson.FatherId);
        self.firstName(serverPerson.FirstName);
        self.gender(serverPerson.Gender),
        self.id(serverPerson.Id);
        self.lastName(serverPerson.LastName);
        if (serverPerson.Mother != null) {
            self.motherFirstName(serverPerson.Mother.FirstName);
            self.motherLastName(serverPerson.Mother.LastName);
        }
        self.motherId(serverPerson.MotherId);
        self.orderInChildrenOfParents(serverPerson.OrderInChildrenOfParents);
        self.remark(serverPerson.Remark);
        
        if (serverPerson.ChildrenByFather) {
            var children = new Array();
            for (i = 0; i < serverPerson.ChildrenByFather.length; i++) {
                children.push(new ClientPerson(serverPerson.ChildrenByFather[i]));
            }
            self.childrenByFather(children);
        }
        if (serverPerson.ChildrenByMother) {
            var children = new Array();
            for (i = 0; i < serverPerson.ChildrenByMother.length; i++) {
                children.push(new ClientPerson(serverPerson.ChildrenByMother[i]));
            }
            self.childrenByMother(children);
        }
    }
}

function ServerPerson(clientPerson) {
    var self = this;
    self.BirthDay = '';
    self.BirthTime = '';
    self.ChildrenByFather = [];
    self.ChildrenByMother = [];
    self.DeathDay = '';
    self.DeathTime = '';
    self.FatherId = null;
    self.Gender = 1;
    self.Id = 0;
    self.FirstName = '';
    self.LastName = '';
    self.MotherId = null;
    self.OrderInChildrenOfParents = 1;
    self.Remark = '';

    updateServerPerson(clientPerson);

    function updateServerPerson(clientPerson) {
        if (clientPerson == null) {
            return;
        }
        self.BirthDay = clientPerson.birthDay();
        self.BirthTime = clientPerson.birthTime();
        self.DeathDay = clientPerson.deathDay();
        self.DeathTime = clientPerson.deathTime();
        var sFatherId = clientPerson.fatherId();
        if (sFatherId != null) {
            self.FatherId = parseInt(sFatherId);
        }
        self.FirstName = clientPerson.firstName();
        self.Gender = clientPerson.gender();
        self.Id = clientPerson.id();
        self.LastName = clientPerson.lastName();
        var sMotherId = viewModel.editPerson().motherId();
        if (sMotherId != null) {
            self.MotherId = parseInt(sMotherId);
        } self.OrderInChildrenOfParents = clientPerson.orderInChildrenOfParents();
        self.Remark = clientPerson.remark();
    }
}

var defaultServerPerson = new ServerPerson();

var viewModel = {
    viewPerson: ko.observable(new ClientPerson(defaultServerPerson)),
    editPerson: ko.observable(new ClientPerson(defaultServerPerson)),
    errorMessage: ko.observable(),
};


ko.applyBindings(viewModel); // Makes Knockout get to work

var setting = {
    async: {
        enable: true,
        url: getAsyncUrl,
        autoParam: ["id", "name=n", "level=lv"],
        type: "get",
        dataFilter: filter
    },
    callback: {
        onClick: zTreeOnClick,
    },
    view: {
        selectedMulti: false,
    }
};

function filter(treeId, parentNode, responseData) {
    if (!responseData) return null;
    for (var i = 0, l = responseData.value.length; i < l; i++) {
        responseDataToTreeNode(responseData.value[i]);
    }
    return responseData.value;
}

function responseDataToTreeNode(responseData) {
    responseData.isParent = responseData.Gender == 1;
    responseData.name = responseData.LastName + responseData.FirstName + "-" + responseData.Id;
}

function zTreeOnClick(event, treeId, treeNode) {
    viewModel.errorMessage(null); // clear error message
    viewModel.editPerson(new ClientPerson(defaultServerPerson));
    $.get("odata/People(" + treeNode.Id + ")?$expand=Mother($select=Id,FirstName,LastName),Father($select=Id,FirstName,LastName),ChildrenByFather($select=Id,FirstName,LastName),ChildrenByMother($select=Id,FirstName,LastName)",
        null,
        updateViewModelOfPerson,
        "json");
};

function updateViewModelOfPerson(result) {
    viewModel.viewPerson(new ClientPerson(result));
}

function getAsyncUrl(treeId, treeNode) {
    // TODO: replace GetRootPersons with People?$filter=... and delete the server side action.
    var url = treeNode == undefined ? "/odata/GetRootPersons()" : "/odata/People(" + treeNode.Id + ")/ChildrenByFather";
    return url;
};

$(document).ready(function () {
    zTreeObj = $.fn.zTree.init($("#treeDemo"), setting);
});