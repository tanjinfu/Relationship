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
    Id: 0,
    FirstName: '',
    LastName: '',
    Remark: '',
    MotherId: 0,
    Gender: 1,
    OrderInChildrenOfParents: 0
};

var viewModel = {
    viewPerson: ko.observable(new ClientPerson(defaultServerPerson)),
    editPerson: ko.observable(new ClientPerson(defaultServerPerson)),
    errorMessage: ko.observable(),

    editPersonClick: function () {
        this.editPerson().birthDay(this.viewPerson().birthDay());
        this.editPerson().id(this.viewPerson().id());
        this.editPerson().birthTime(this.viewPerson().birthTime());
        this.editPerson().deathDay(this.viewPerson().deathDay());
        this.editPerson().deathTime(this.viewPerson().deathTime());
        this.editPerson().fatherId(this.viewPerson().id());
        this.editPerson().firstName(this.viewPerson().firstName());
        this.editPerson().gender(this.viewPerson().gender());
        this.editPerson().lastName(this.viewPerson().lastName());
        this.editPerson().motherId(this.viewPerson().motherId());
        this.editPerson().orderInChildrenOfParents(this.viewPerson().orderInChildrenOfParents());
        this.editPerson().remark = (this.viewPerson().remark());
        $("#editPersonDialog").dialog({
            autoOpen: false,
            buttons: [{ text: "Ok", click: function () { $(this).dialog("close"); } }],
            modal: true,
            width: 600,
        });
        $("#editPersonDialog").dialog("open");
    },
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
        responseData.value[i].name = responseData.value[i].LastName + responseData.value[i].FirstName;
        if (responseData.value[i].Gender == 1) {
            responseData.value[i].isParent = true;
        }
    }
    return responseData.value;
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
    $.fn.zTree.init($("#treeDemo"), setting);
});