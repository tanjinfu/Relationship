var zTreeObj;
function editPersonClick() {
    viewModel.editPerson().birthDay(viewModel.viewPerson().birthDay());
    viewModel.editPerson().id(viewModel.viewPerson().id());
    viewModel.editPerson().birthTime(viewModel.viewPerson().birthTime());
    viewModel.editPerson().deathDay(viewModel.viewPerson().deathDay());
    viewModel.editPerson().deathTime(viewModel.viewPerson().deathTime());
    viewModel.editPerson().fatherId(viewModel.viewPerson().id());
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
                    var jsonData = {
                        BirthDay: viewModel.editPerson().birthDay(),
                        BirthTime: viewModel.editPerson().birthTime(),
                        DeathDay: viewModel.editPerson().deathDay(),
                        DeathTime: viewModel.editPerson().deathTime(),
                        FatherId: viewModel.editPerson().fatherId(),
                        FirstName: viewModel.editPerson().firstName(),
                        Gender: viewModel.editPerson().gender(),
                        Id: viewModel.editPerson().id(),
                        LastName: viewModel.editPerson().lastName(),
                        MotherId: viewModel.editPerson().motherId(),
                        OrderInChildrenOfParents: viewModel.editPerson().orderInChildrenOfParents(),
                        Remark: viewModel.editPerson().remark(),
                    };
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
                            $("#editPersonDialog").dialog("close");
                        },
                        failure: function (response) {
                            viewModel.errorMessage(response);
                        }
                    });
                }
            }],
        modal: true,
        width: 600,
    });
    $("#editPersonDialog").dialog("open");
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
        self.birthDay(serverPerson.BirthDay);
        self.birthTime(serverPerson.BirthTime);
        self.deathDay(serverPerson.DeathDay);
        self.deathTime(serverPerson.DeathTime);
        if (serverPerson.Father != null) {
            self.fatherFirstName(serverPerson.Father.FirstName);
            self.fatherLastName(serverPerson.Father.LastName);
        }
        self.fatherId(serverPerson.FatherId);
        self.id(serverPerson.Id);
        if (serverPerson.Mother != null) {
            self.motherFirstName(serverPerson.Mother.FirstName);
            self.motherLastName(serverPerson.Mother.LastName);
        }
        self.motherId(serverPerson.MotherId),
        self.gender(serverPerson.Gender),
        self.orderInChildrenOfParents(serverPerson.OrderInChildrenOfParents),
        self.remark(serverPerson.Remark),
        self.firstName(serverPerson.FirstName);
        self.lastName(serverPerson.LastName);

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

var defaultServerPerson = {
    BirthDay: '',
    BirthTime: '',
    ChildrenByFather: null,
    ChildrenByMother: null,
    DeathDay: '',
    DeathTime: '',
    FatherId: 0,
    Gender: 1,
    Id: 0,
    FirstName: '',
    LastName: '',
    MotherId: 0,
    OrderInChildrenOfParents: 0,
    Remark: '',
};

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
        onClick: zTreeOnClick
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
    responseData.name = responseData.LastName + responseData.FirstName + "-" + responseData.Id;
    responseData.isParent = responseData.Gender == 1;
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