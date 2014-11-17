var zTreeObj;
var charWidthInPixel = 20;
var charHeightInPixel = 20;
var diagramNodeWidthInPixel = 22;
var diagramNodeHorizentalDistanceInPixel = 5; // the distance between the top right point of this node and the top left of the next one.
var diagramNodeVerticalDistanceInPixel = 20; // the distance between the bottom of this node and the top of the next one.
var diagramTopMarginInPixel = 10;
var diagramLeftMarginInPixel = 10;
var diagramBottomMarginInPixel = 10;
var diagramRightMarginInPixel = 10;
var tokenKey = 'accessToken';
var userNameKey = 'userName';


var settings = {
    addExternalLoginUrl: "/api/Account/AddExternalLogin",
    changePasswordUrl: "/api/Account/changePassword",
    loginUrl: "/Token",
    logoutUrl: "/api/Account/Logout",
    registerUrl: "/api/Account/Register",
    registerExternalUrl: "/api/Account/RegisterExternal",
    removeLoginUrl: "/api/Account/RemoveLogin",
    setPasswordUrl: "/api/Account/setPassword",
    siteUrl: "/",
    userInfoUrl: "/api/Account/UserInfo",
}

function addPersonClick() {
    var accessToken = sessionStorage.getItem(tokenKey);
    if (!accessToken) {
        showSignInDialog();
        return;
    }
    var requestHeaders = {};
    requestHeaders.Authorization = 'Bearer ' + accessToken;

    var newClientPerson = new ClientPerson();
    newClientPerson.birthDay("1:0001-01-01");
    newClientPerson.birthTime("00:00");
    newClientPerson.deathDay("1:9999-12-31");
    newClientPerson.deathTime("23:59");
    newClientPerson.gender(1);
    newClientPerson.orderInChildrenOfParents(1);
    newClientPerson.errorMessage('');
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
                        headers: requestHeaders,
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
                            showErrorMessage(response);
                        }
                    }).fail(showErrorMessage);
                }
            }],
        modal: true,
        width: 700,
    });
    $("#editPersonDialog").dialog("open");
};

function editPersonClick() {
    var accessToken = sessionStorage.getItem(tokenKey);
    if (!accessToken) {
        showSignInDialog();
        return;
    }
    var requestHeaders = {};
    requestHeaders.Authorization = 'Bearer ' + accessToken;

    viewModel.editPerson().birthDay(viewModel.viewPerson().birthDay());
    viewModel.editPerson().id(viewModel.viewPerson().id());
    viewModel.editPerson().birthTime(viewModel.viewPerson().birthTime());
    viewModel.editPerson().deathDay(viewModel.viewPerson().deathDay());
    viewModel.editPerson().deathTime(viewModel.viewPerson().deathTime());
    viewModel.editPerson().errorMessage('');
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
                        headers: requestHeaders,
                        url: "/odata/People(" + id + ")",
                        contentType: "application/json; charset=utf-8",
                        data: data,
                        success: function (returnedData) {
                            $("#editPersonDialog").dialog("close");
                            var newNavigationNode = responseDataToTreeNode(returnedData);
                            var originalNavigationNode = zTreeObj.getNodesByParam("Id", newNavigationNode.Id, null)[0];
                            originalNavigationNode.BirthDay = newNavigationNode.BirthDay;
                            originalNavigationNode.BirthTime = newNavigationNode.BirthTime;
                            originalNavigationNode.DeathDay = newNavigationNode.DeathDay;
                            originalNavigationNode.DeathTime = newNavigationNode.DeathTime;
                            originalNavigationNode.Gender = newNavigationNode.Gender;
                            originalNavigationNode.icon = newNavigationNode.icon;
                            originalNavigationNode.isParent = newNavigationNode.isParent;
                            originalNavigationNode.name = newNavigationNode.name;
                            zTreeObj.updateNode(originalNavigationNode);
                            if (originalNavigationNode.FatherId != newNavigationNode.FatherId) {
                                originalNavigationNode.FatherId = newNavigationNode.FatherId;
                                zTreeObj.removeNode(originalNavigationNode);
                                var fatherNodes = zTreeObj.getNodesByParam("Id", newNavigationNode.FatherId, null);
                                if (fatherNodes != null) {
                                    zTreeObj.expandNode(fatherNodes[0], true/*expand*/);
                                    zTreeObj.addNodes(fatherNodes[0], originalNavigationNode);
                                } else {
                                    zTreeObj.addNodes(null, originalNavigationNode);
                                }
                                zTreeObj.selectNode(originalNavigationNode);
                            }
                            zTreeObj.updateNode(originalNavigationNode);
                            zTreeOnClick(null, "treeDemo", originalNavigationNode);
                        },
                        failure: function (response) {
                            alert(response);
                        }
                    }).fail(showErrorMessage);
                }
            }],
        modal: true,
        width: 700,
    });
    $("#editPersonDialog").dialog("open");
};

function deletePersonClick() {
    var accessToken = sessionStorage.getItem(tokenKey);
    if (!accessToken) {
        showSignInDialog();
        return;
    }
    var requestHeaders = {};
    requestHeaders.Authorization = 'Bearer ' + accessToken;

    $("#dialog-confirm").dialog({
        resizable: false,
        height: 220,
        modal: true,
        buttons: {
            "确定": function () {
                var id = viewModel.viewPerson().id();
                $.ajax({
                    headers: requestHeaders,
                    type: "DELETE",
                    url: "/odata/People(" + id + ")",
                    success: function () {
                        $("#dialog-confirm").dialog("close");
                        var deletedNode = zTreeObj.getNodesByParam("Id", id, null)[0];
                        if (deletedNode.Gender == 1) {
                            var childrenNodes = deletedNode.children;
                            if (childrenNodes != null) {
                                for (var i = 0; i < childrenNodes.length; i++) {
                                    var childNode = childrenNodes[i];
                                    childNode.FatherId = null;
                                    childNode.Father = null;
                                    zTreeObj.removeNode(childNode);
                                    zTreeObj.addNodes(null, childNode);
                                }
                            }
                        }
                        var nextSelectedNode = deletedNode.getParentNode();
                        if (!nextSelectedNode) {
                            nextSelectedNode = deletedNode.getPreNode();
                        }
                        zTreeObj.removeNode(deletedNode);
                        if (nextSelectedNode) {
                            zTreeObj.selectNode(nextSelectedNode);
                            zTreeOnClick(null, "treeDemo", nextSelectedNode);
                        }
                    },
                    failure: function (response) {
                        viewModel.errorMessage(response);
                    }
                }).fail(viewModel.errorMessage(response));
            },
            "取消": function () {
                $("#dialog-confirm").dialog("close");
            }
        }
    });

    $("#dialog-confirm").dialog("open");
};

function drawDecendantDiagramClick() {
    var gender = viewModel.viewPerson().gender();
    if (gender != null && gender == 0) {
        alert("请选择男性。");
        return;
    }

    var accessToken = sessionStorage.getItem(tokenKey);
    if (!accessToken) {
        showSignInDialog();
        return;
    }
    var requestHeaders = {};
    requestHeaders.Authorization = 'Bearer ' + accessToken;

    var id = viewModel.viewPerson().id();
    $.ajax({
        headers: requestHeaders,
        type: "GET",
        url: "/odata/People(" + id + ")?$select=Id,LastName,FirstName,Gender&$expand=ChildrenByFather($select=Id,LastName,FirstName,Gender;$levels=9)",
        success: function (returnedData) {
            $("#dialog-diagram").dialog({
                resizable: true,
                height: 600,
                width: 800,
                modal: true,
            });
            var diagramData = initDiagramData(returnedData);
            calculatePosition(diagramData);
            //var c = $("#diagram");
            var c = document.getElementById("diagram");
            drawDiagram(c, diagramData);
            $("#dialog-diagram").dialog("open");
        },
        failure: function (response) {
            alert(response);
        }
    }).fail(function (response) {
        alert(response);
    });
};

function DiagramNode() {
    var self = this;
    self.fullName = '';
    self.gender = 1;//1 represents Male; 0 Female. Used to draw solid or dotted lines.
    self.id = 0;
    self.parentId = 0;
    self.level = 0;
    self.order = 0; // order in its siblings.
    self.x = 0;
    self.y = 0;
}

function DiagramData() {
    var self = this;
    self.width = 0;
    self.height = 0;
    self.nodeHeight = 0;
    self.nodes = new Array();
}

function drawDiagram(c, diagramData) {
    // Make sure we don't execute when canvas isn't supported
    if (c.getContext) {
        c.width = diagramData.width;
        c.height = diagramData.height;
        // use getContext to use the c for drawing
        var ctx = c.getContext('2d');
        ctx.font = charWidthInPixel + "px sans-serif";
        ctx.clearRect(0, 0, c.width, c.height);
        var nodes = diagramData.nodes;
        var rootNode = nodes[0];
        var nodeHeight = diagramData.nodeHeight;
        var nodeWidth = diagramNodeWidthInPixel;
        drawRectangle(ctx, rootNode.x, rootNode.y, nodeWidth, nodeHeight, rootNode.gender == 0);
        drawString(ctx, rootNode.fullName, rootNode.x + ctx.lineWidth, rootNode.y + charHeightInPixel - 1, charHeightInPixel);

        var hashMap = {};
        for (var i = 0; i < nodes.length; i++) {
            hashMap[nodes[i].id] = nodes[i];
        }

        for (var i = 1; i < nodes.length; i++) {
            var currentNode = nodes[i];
            drawRectangle(ctx, currentNode.x, currentNode.y, nodeWidth, nodeHeight, currentNode.gender == 0);
            drawString(ctx, currentNode.fullName, currentNode.x + ctx.lineWidth, currentNode.y + charHeightInPixel - 1, charHeightInPixel);

            var parentNode = hashMap[currentNode.parentId];
            drawPolyLine(ctx, parentNode.x + nodeWidth / 2, parentNode.y + nodeHeight, currentNode.x + nodeWidth / 2, currentNode.y);
        }
    } else {
        alert('请使用 Safari, Chrome 或IE8+.');
    }
}

function drawString(context, str, x, y, charHeight) {
    for (i = 0; i < str.length; i++) {
        context.fillText(str[i], x, y + charHeight * i);
    }
}

function drawRectangle(context, topLeftX, topLeftY, width, height, dottedLine) {
    //TODO: draw dottedLine
    context.strokeRect(topLeftX, topLeftY, width, height);
}

function drawPolyLine(context, beginX, beginY, endX, endY) {
    context.beginPath();
    context.moveTo(beginX, beginY);
    context.lineTo(beginX, (beginY + endY) / 2);
    context.lineTo(endX, (beginY + endY) / 2);
    context.lineTo(endX, endY);
    context.stroke();
}

function calculatePosition(diagramData) {
    var nodes = diagramData.nodes;
    var hashMap = {};

    var rootNode = nodes[0];
    rootNode.x = diagramLeftMarginInPixel;
    rootNode.y = diagramTopMarginInPixel;
    hashMap[rootNode.id] = rootNode;

    var parentNode = null;
    var currentNode = null;

    for (var i = 1; i < nodes.length; i++) {
        currentNode = nodes[i];
        hashMap[currentNode.id] = currentNode;
        parentNode = hashMap[currentNode.parentId];
        currentNode.y = parentNode.y + diagramNodeVerticalDistanceInPixel + diagramData.nodeHeight;
    }

    var previousNode = null;
    var tempNode = null;
    var maxX = rootNode.x;
    var iterationCount = 0;
    var parentIsAltered = true;
    console.time("calculateXTimer");
    while (parentIsAltered) {
        iterationCount++;
        parentIsAltered = false;
        previousNode = rootNode;
        for (var i = 1; i < nodes.length; i++) {
            currentNode = nodes[i];
            previousNode = nodes[i - 1];
            parentNode = hashMap[currentNode.parentId];

            if (currentNode.level == previousNode.level) {
                var expectedX = Math.max(
                    parentNode.x,
                    previousNode.x + (diagramNodeWidthInPixel + diagramNodeHorizentalDistanceInPixel),
                    currentNode.x);
                currentNode.x = expectedX;

                if (currentNode.parentId != previousNode.parentId && expectedX > parentNode.x) {
                    parentIsAltered = true;

                    tempNode = parentNode;
                    while (tempNode.x == parentNode.x) {
                        tempNode.x = expectedX;
                        tempNode = hashMap[tempNode.parentId];
                    }// while
                }
            } else {
                currentNode.x = parentNode.x;
            }
            if (maxX < currentNode.x) {
                maxX = currentNode.x;
            }
        }// for
    }// while(parentIsAltered)
    console.timeEnd("calculateXTimer");
    console.log("Iterates", iterationCount, "times.");
    diagramData.width = maxX + diagramNodeWidthInPixel + diagramRightMarginInPixel;
}

function initDiagramData(serverData) {
    var diagramData = new DiagramData();

    var rootDiagramNode = new DiagramNode();
    rootDiagramNode.fullName = serverData.LastName + serverData.FirstName;
    rootDiagramNode.gender = serverData.Gender;
    rootDiagramNode.id = serverData.Id;

    rootDiagramNode.level = 0; // level starts from 0.
    rootDiagramNode.order = 0; // order starts from 0.
    rootDiagramNode.x = 0;
    rootDiagramNode.y = 0;
    diagramData.nodes.push(rootDiagramNode);

    var maxFullNameLength = rootDiagramNode.fullName.length;

    var hashMap = {};
    hashMap[rootDiagramNode.id] = rootDiagramNode;

    var serverNodes = new Array();
    serverNodes.push(serverData);

    var nodes = diagramData.nodes;

    while (serverNodes.length > 0) {
        var parentServerNode = serverNodes.shift();
        var parentDiagramNode = hashMap[parentServerNode.Id];
        if (parentServerNode.ChildrenByFather) {
            var childLevel = parentDiagramNode.level + 1;
            for (var j = 0; j < parentServerNode.ChildrenByFather.length; j++) {
                var childServerNode = parentServerNode.ChildrenByFather[j];
                // If only display male, uncomment these 3 lines as the $filter doesn't work within $expand.
                //if (childServerNode.Gender == 0) {
                //    continue;
                //}
                var childDiagramNode = new DiagramNode();
                childDiagramNode.fullName = childServerNode.LastName + childServerNode.FirstName;
                childDiagramNode.gender = childServerNode.Gender;
                childDiagramNode.id = childServerNode.Id;
                childDiagramNode.parentId = parentDiagramNode.id;
                childDiagramNode.level = childLevel;
                childDiagramNode.order = j;
                nodes.push(childDiagramNode);
                serverNodes.push(childServerNode);
                hashMap[childDiagramNode.id] = childDiagramNode;
            }
        }
        if (parentDiagramNode.fullName.length > maxFullNameLength) {
            maxFullNameLength = parentDiagramNode.fullName.length;
        }
    }

    var nodeHeight = maxFullNameLength * charHeightInPixel;
    diagramData.nodeHeight = nodeHeight;
    var maxLevel = nodes[nodes.length - 1].level;

    diagramData.height = diagramTopMarginInPixel +
        maxLevel * (nodeHeight + diagramNodeVerticalDistanceInPixel) + nodeHeight +
        diagramBottomMarginInPixel;
    return diagramData;
}

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

    self.errorMessage = ko.observable();

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

function SignInfo() {
    var self = this;
    self.result = ko.observable('');
    self.userName = ko.observable('');

    self.registerUserName = ko.observable("cao.xueqin");
    self.registerEmail = ko.observable("cao.xueqin@gmail.com");
    self.registerPassword = ko.observable("Password01!");
    self.confirmPassword = ko.observable("Password01!");

    self.loginUserName = ko.observable("cao.xueqin");
    self.loginPassword = ko.observable("Password01!");

    function showError(jqXHR) {
        var message = jqXHR.status + ': ' + jqXHR.statusText + '. ';
        //"{"Message":"The request is invalid.","ModelState":{"":["Name cao.xueqin is already taken.","Email 'cao.xueqin@gmail.com' is already taken."]}}"
        var modelState = $.parseJSON(jqXHR.responseText).ModelState[''];
        for (var i = 0; i < modelState.length; i++) {
            message += " " + modelState[i];
        }
        self.result(message);
    }

    self.callApi = function () {
        self.result('');

        var token = sessionStorage.getItem(tokenKey);
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        $.ajax({
            type: 'GET',
            url: '/api/values',
            headers: headers
        }).done(function (data) {
            self.result(data);
        }).fail(showError);
    }

    self.registerAccount = function () {
        self.result('');

        var data = {
            Email: self.registerEmail(),
            Password: self.registerPassword(),
            ConfirmPassword: self.confirmPassword(),
            UserName: self.registerUserName(),
        };

        $.ajax({
            type: 'POST',
            url: '/api/Account/Register',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data)
        }).done(function (data) {
            self.result("注册成功，请登录。");
        }).fail(showError);
    }

    self.signIn = function () {
        self.result('');

        var loginData = {
            grant_type: 'password',
            username: self.loginUserName(),
            password: self.loginPassword()
        };

        $.ajax({
            type: 'POST',
            url: '/Token',
            data: loginData
        }).done(function (data) {
            self.userName(data.userName);
            // Cache the access token in session storage.
            sessionStorage.setItem(tokenKey, data.access_token);
            sessionStorage.setItem(userNameKey, data.userName);
            $("#dialog-signIn").dialog("close");
            var header = {};
            header.Authorization = 'Bearer ' + data.access_token;
            var rootNavigationNodes = zTreeObj.getNodes();// get root nodes
            if (rootNavigationNodes.length == 0) {
                loadRootNavigationNodes(header);
            }
        }).fail(showError);
    }

    self.signOut = function () {
        self.userName('');
        sessionStorage.removeItem(tokenKey)
        zTreeObj = $.fn.zTree.init($("#treeDemo"), zTreeSettings);
        showSignInDialog();
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

function showErrorMessage(response) {
    var message = response.status + ': ' + response.statusText + '. ';
    //{
    //    "error":{
    //        "code":"","message":"\u7236\u4eb2\u5fc5\u987b\u662f\u7537\u6027\uff01"
    //    }
    //}
    message += $.parseJSON(response.responseText).error.message;
    viewModel.editPerson().errorMessage(message);
}

var defaultServerPerson = new ServerPerson();

var viewModel = {
    viewPerson: ko.observable(new ClientPerson(defaultServerPerson)),
    editPerson: ko.observable(new ClientPerson(defaultServerPerson)),
    signInfo: ko.observable(new SignInfo()),
    errorMessage: ko.observable(),
};


ko.applyBindings(viewModel); // Makes Knockout get to work

var zTreeSettings = {
    callback: {
        beforeClick: zTreeBeforeClick,
        beforeExpand: zTreeBeforeExpand,
        onClick: zTreeOnClick,
        onExpand: zTreeOnExpand,
    },
    view: {
        selectedMulti: false,
    }
};

function responseDataToTreeNode(responseData) {
    if (responseData.Gender == 1) {
        responseData.isParent = responseData.Gender == 1;
        responseData.icon = './Images/male.gif';
    } else {
        responseData.icon = './Images/female.gif';
    }
    responseData.name = responseData.LastName + responseData.FirstName + "-" + responseData.Id;
    return responseData;
}

function zTreeBeforeClick(treeId, treeNode, clickFlag) {
    var accessToken = sessionStorage.getItem(tokenKey);
    if (accessToken) {
        return true;
    }
    else {
        showSignInDialog();
        return false;
    }
};

function zTreeBeforeExpand(treeId, treeNode) {
    var accessToken = sessionStorage.getItem(tokenKey);
    if (accessToken) {
        return true;
    }
    else {
        showSignInDialog();
        return false;
    }
};

function zTreeOnExpand(event, treeId, treeNode) {
    if (treeNode.Gender == 0) {
        return;
    }
    if (treeNode.children) {
        // Prevent loading children twice.
        return;
    }
    var accessToken = sessionStorage.getItem(tokenKey);
    var requestHeaders = {};
    if (accessToken) {
        requestHeaders.Authorization = 'Bearer ' + accessToken;
        $.ajax({
            type: "GET",
            headers: requestHeaders,
            url: "/odata/People(" + treeNode.Id + ")?$select=Id&$expand=ChildrenByFather($select=Id,FirstName,Gender,LastName;$orderby=BirthDay,BirthTime)",
            success: function (responseData) {
                if (!responseData) return null;
                var candidateNodes = zTreeObj.getNodesByParam("Id", responseData.Id, null)
                if (candidateNodes == null) {
                    alert("导航树中无此节点！");
                } else {
                    var fatherNode = candidateNodes[0];
                    zTreeObj.expandNode(fatherNode, true, false, false);
                    var childNode = null;
                    for (var i = 0; i < responseData.ChildrenByFather.length; i++) {
                        childNode = responseDataToTreeNode(responseData.ChildrenByFather[i]);
                        zTreeObj.addNodes(fatherNode, childNode);
                    }
                }
            },
            failure: function (response) {
                alert(response);
            }
        }).fail(function (response) {
            alert(response)
        });
    }
    else {
        showSignInDialog();
    }

};

function zTreeOnClick(event, treeId, treeNode) {
    viewModel.errorMessage(null); // clear error message
    var accessToken = sessionStorage.getItem(tokenKey);
    var requestHeaders = {};
    requestHeaders.Authorization = 'Bearer ' + accessToken;
    if (accessToken) {
        viewModel.editPerson(new ClientPerson(defaultServerPerson));
        $.ajax({
            type: "GET",
            headers: requestHeaders,
            url: "odata/People(" + treeNode.Id + ")?$expand=Mother($select=Id,FirstName,LastName),Father($select=Id,FirstName,LastName),ChildrenByFather($select=Id,FirstName,LastName),ChildrenByMother($select=Id,FirstName,LastName)",
            success: function (responseData) {
                updateViewModelOfPerson(responseData);
            },
            failure: function (response) {
                alert(response);
            }
        }).fail(function (response) {
            alert(response)
        });
    }
    else {
        showSignInDialog();
    }
};

function updateViewModelOfPerson(result) {
    viewModel.viewPerson(new ClientPerson(result));
}

function getAsyncUrl(treeId, treeNode) {
    // TODO: replace GetRootPersons with People?$filter=... and delete the server side action.
    var url = treeNode == undefined ? "/odata/GetRootPersons()" : "/odata/People(" + treeNode.Id + ")/ChildrenByFather";
    return url;
};

function zTreeOnAsyncError(event, treeId, treeNode, XMLHttpRequest, textStatus, errorThrown) {
    alert(XMLHttpRequest);
};



function loadRootNavigationNodes(headers) {
    $.ajax({
        type: "GET",
        headers: headers,
        url: "/odata/People?$select=Id,FirstName,Gender,LastName,FatherId&$orderby=BirthDay,BirthTime&$filter=FatherId eq null",
        success: function (responseData) {
            if (!responseData) return null;
            var candidateNodes = zTreeObj.getNodesByParam("Id", responseData.Id, null)
            if (candidateNodes == null) {
                alert("导航树中无此节点！");
            } else {
                var fatherNode = candidateNodes[0];
                zTreeObj.expandNode(fatherNode, true, false, false);
                var childNode = null;
                for (var i = 0; i < responseData.value.length; i++) {
                    childNode = responseDataToTreeNode(responseData.value[i]);
                    zTreeObj.addNodes(fatherNode, childNode);
                }
            }
        },
        failure: function (response) {
            alert(response);
        }
    }).fail(function (response) {
        alert(response)
    });
}

function showSignInDialog() {

    $("#dialog-signIn").dialog({
        autoOpen: false,
        dialogClass: "no-close",
        modal: true,
        width: 500,
    });
    $("#dialog-signIn").dialog("open");
}

$(document).ready(function () {
    zTreeObj = $.fn.zTree.init($("#treeDemo"), zTreeSettings);
});

var token = sessionStorage.getItem(tokenKey);
var headers = {};
if (token) {
    headers.Authorization = 'Bearer ' + token;
    viewModel.signInfo().userName(sessionStorage.getItem(userNameKey));
    loadRootNavigationNodes(headers);
}
else {
    showSignInDialog();
}
