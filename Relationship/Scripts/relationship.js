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

    viewModel.editPerson(newClientPerson);
    $("#editPersonDialog").dialog({
        autoOpen: false,
        buttons: [
            {
                text: "Ok",
                click: function () {
                    viewModel.errorMessage(null);
                    viewModel.editPersonErrorMessage('');
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
                    }).fail(showEditPersonErrorMessage);
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
                    viewModel.editPersonErrorMessage('');
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
                            showEditPersonErrorMessage(response);
                        }
                    }).fail(showEditPersonErrorMessage);
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
                        viewModel.errorMessage(response, viewModel.errorMessage);
                    }
                }).fail(viewModel.errorMessage(response, viewModel.errorMessage));
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
        viewModel.errorMessage("请选择男性。");
        return;
    }

    var accessToken = sessionStorage.getItem(tokenKey);
    if (!accessToken) {
        showSignInDialog();
        return;
    }
    var requestHeaders = {};
    requestHeaders.Authorization = 'Bearer ' + accessToken;
    $("#dialog-diagram").dialog({
        resizable: true,
        height: 600,
        width: 800,
        modal: true,
    });
    document.getElementById("dialog-diagram").title = '后代图';
    $("#dialog-diagram").dialog("open");
    var c = document.getElementById("diagram");
    c.width = 0;
    c.height = 0;

    viewModel.drawDiagramErrorMessage('加载数据...');
    var id = viewModel.viewPerson().id();
    $.ajax({
        headers: requestHeaders,
        type: "GET",
        // $orderby within a $expand doesn't work in WebApi OData 5.3.1, so use the second url.
        // url: "/odata/People(" + id + ")?$select=Id,LastName,FirstName,Gender&$expand=ChildrenByFather($select=Id,LastName,FirstName,Gender;$levels=9)",
        url: "/odata/GetPersonAndDescendants(Id=" + id + ",TotalLevels=15)?$select=Id,LastName,FirstName,Gender&$expand=ChildrenByFather($select=Id,LastName,FirstName,Gender;$levels=14)",
        success: function (returnedData) {
            viewModel.drawDiagramErrorMessage('初始化...');
            var diagramData = initDiagramData(returnedData);

            viewModel.drawDiagramErrorMessage('计算坐标...');
            calculatePosition(diagramData);

            viewModel.drawDiagramErrorMessage('绘图...');

            drawDiagram(c, diagramData);

            viewModel.drawDiagramErrorMessage('');//完成
        },
        failure: function (response) {
            showDrawDiagramErrorMessage(response);
        }
    }).fail(showDrawDiagramErrorMessage);
};

function drawAncestorDiagramClick() {

    var accessToken = sessionStorage.getItem(tokenKey);
    if (!accessToken) {
        showSignInDialog();
        return;
    }
    var requestHeaders = {};
    requestHeaders.Authorization = 'Bearer ' + accessToken;
    document.getElementById("dialog-diagram").title = '祖先图';
    $("#dialog-diagram").dialog({
        resizable: true,
        height: 600,
        width: 800,
        modal: true,
    });
    viewModel.drawDiagramErrorMessage('加载数据...');
    var c = document.getElementById("diagram");
    c.width = 0;
    c.height = 0;

    $("#dialog-diagram").dialog("open");
    viewModel.drawDiagramErrorMessage('加载数据...');
    var id = viewModel.viewPerson().id();
    $.ajax({
        headers: requestHeaders,
        type: "GET",
        url: "/odata/GetPersonAndAncestors(Id=" + id + ",TotalLevels=10)?$select=Id,LastName,FirstName,Gender,FatherId,MotherId",
        success: function (returnedData) {
            viewModel.drawDiagramErrorMessage('初始化...');
            var diagramData = initAncestorDiagramData(returnedData);

            viewModel.drawDiagramErrorMessage('计算坐标...');
            calculateAncestorDiagramPosition(diagramData);

            viewModel.drawDiagramErrorMessage('绘图...');
            //var c = $("#diagram");
            var c = document.getElementById("diagram");
            drawAncestorDiagram(c, diagramData);

            viewModel.drawDiagramErrorMessage('');//完成
        },
        failure: function (response) {
            showDrawDiagramErrorMessage(response);
        }
    }).fail(showDrawDiagramErrorMessage);
};

function DiagramNode() {
    var self = this;
    self.children = [];
    self.fullName = '';
    self.gender = 1;//1 represents Male; 0 Female. Used to draw solid or dotted lines.
    self.id = 0;
    self.fatherId = null;
    self.motherId = null;
    self.level = 0;
    self.order = 0; // order in its siblings, used when calculate the coordinates of descendant diagram.
    self.treeWidth = 0;// the tree width, whose root node is the current node.
    self.x = 0;
    self.y = 0;
}

function DiagramData() {
    var self = this;
    self.width = 0;
    self.height = 0;
    self.nodeHeight = 0;
    self.nodes = new Array();
    self.idToNodeMap = {};
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

        var queue = new Array();
        queue.push(rootNode);

        var nodeHeight = diagramData.nodeHeight;
        var nodeWidth = diagramNodeWidthInPixel;
        drawRectangle(ctx, rootNode.x, rootNode.y, nodeWidth, nodeHeight, rootNode.gender == 0);
        drawString(ctx, rootNode.fullName, rootNode.x + ctx.lineWidth, rootNode.y + charHeightInPixel - 1, charHeightInPixel);

        var currentNode, childNode;
        while (queue.length > 0) {
            currentNode = queue.shift();
            console.log(currentNode.fullName);
            drawRectangle(ctx, currentNode.x, currentNode.y, nodeWidth, nodeHeight, currentNode.gender == 0);
            drawString(ctx, currentNode.fullName, currentNode.x + ctx.lineWidth, currentNode.y + charHeightInPixel - 1, charHeightInPixel);

            for (var i = 0; i < currentNode.children.length; i++) {
                childNode = currentNode.children[i];
                drawPolyLine(ctx, currentNode.x + nodeWidth / 2, currentNode.y + nodeHeight, childNode.x + nodeWidth / 2, childNode.y);
                queue.push(childNode);
            }
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

function drawStraightLine(context, beginX, beginY, endX, endY) {
    context.beginPath();
    context.moveTo(beginX, beginY);
    context.lineTo(endX, endY);
    context.stroke();
}

function calculatePosition(diagramData) {
    var nodes = diagramData.nodes;

    var currentNode = null;

    // Calculate y
    for (var i = 0; i < nodes.length; i++) {
        currentNode = nodes[i];
        currentNode.y = diagramTopMarginInPixel
            + currentNode.level * (diagramData.nodeHeight + diagramNodeVerticalDistanceInPixel)
    }

    // Calculate tree width
    var rootNode = nodes[0];
    calculateTreeWidthForDescendantDiagram(diagramData.idToNodeMap, rootNode, diagramNodeWidthInPixel, diagramNodeHorizentalDistanceInPixel);
    diagramData.width = diagramLeftMarginInPixel + rootNode.treeWidth + diagramRightMarginInPixel;

    // Calculate x
    var queue = new Array();
    rootNode.x = diagramLeftMarginInPixel;
    queue.push(rootNode);

    var currentDiagramNode = null;
    var childDiagramNode = null;
    var previousSibling = null;

    console.time("calculateXTimer");
    while (queue.length > 0) {
        currentDiagramNode = queue.shift();
        if (currentDiagramNode.children.length == 0) {
            continue;
        }
        var firstChild = currentDiagramNode.children[0];
        firstChild.x = currentDiagramNode.x;
        queue.push(firstChild);

        previousSibling = firstChild;
        for (var i = 1; i < currentDiagramNode.children.length; i++) {
            childDiagramNode = currentDiagramNode.children[i];
            childDiagramNode.x = previousSibling.x + previousSibling.treeWidth + diagramNodeHorizentalDistanceInPixel;
            previousSibling = childDiagramNode;
            queue.push(childDiagramNode);
        }
    }

    console.timeEnd("calculateXTimer");
}

function calculateTreeWidthForDescendantDiagram(map, rootDiagramNode, diagramNodeWidth, diagramNodeHorizontalDistance) {
    if (rootDiagramNode.children.length == 0) {
        rootDiagramNode.treeWidth = diagramNodeWidth;
    } else {
        rootDiagramNode.treeWidth = 0;
        var childNode;
        for (var i = 0; i < rootDiagramNode.children.length; i++) {
            childNode = rootDiagramNode.children[i];
            calculateTreeWidthForDescendantDiagram(map, childNode, diagramNodeWidth, diagramNodeHorizentalDistanceInPixel);
            rootDiagramNode.treeWidth += childNode.treeWidth;
        }
        rootDiagramNode.treeWidth += diagramNodeHorizontalDistance * (rootDiagramNode.children.length - 1);
    }
}

function calculateLevelForDescendantDiagram(rootDiagramNodeId, map) {
    var maxLevel = 0, currentLevel;
    var diagramNodes = new Array();
    diagramNodes.push(map[rootDiagramNodeId]);
    var currentNode = null;
    var fatherNode = null;
    var motherNode = null;

    while (diagramNodes.length > 0) {
        currentNode = diagramNodes.shift();
        currentLevel = currentNode.level;

        if (currentNode.fatherId) {
            fatherNode = map[currentNode.fatherId];
            fatherNode.level = Math.max(currentLevel + 1, fatherNode.level);
            diagramNodes.push(fatherNode);
        }
        if (currentNode.motherId) {
            motherNode = map[currentNode.motherId];
            motherNode.level = Math.max(currentLevel + 1, motherNode.level);
            diagramNodes.push(motherNode);
        }
        maxLevel = Math.max(currentLevel, maxLevel);
    }
    return maxLevel;
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

    var serverNodes = new Array();
    serverNodes.push(serverData);
    diagramData.idToNodeMap[rootDiagramNode.id] = rootDiagramNode;

    var nodes = diagramData.nodes;

    while (serverNodes.length > 0) {
        var parentServerNode = serverNodes.shift();
        var parentDiagramNode = diagramData.idToNodeMap[parentServerNode.Id];
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
                childDiagramNode.fatherId = parentDiagramNode.id;
                childDiagramNode.level = childLevel;
                childDiagramNode.order = j;
                nodes.push(childDiagramNode);
                serverNodes.push(childServerNode);
                diagramData.idToNodeMap[childDiagramNode.id] = childDiagramNode;
                parentDiagramNode.children.push(childDiagramNode);
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

function initAncestorDiagramData(serverData) {
    var diagramData = new DiagramData();
    var maxFullNameLength = 0;

    var currentServerNode = null;
    var currentDiagramNode = null;
    for (var i = 0; i < serverData.value.length; i++) {
        currentServerNode = serverData.value[i];

        currentDiagramNode = new DiagramNode();
        currentDiagramNode.fatherId = currentServerNode.FatherId;
        currentDiagramNode.fullName = currentServerNode.LastName + currentServerNode.FirstName;
        currentDiagramNode.gender = currentServerNode.Gender;
        currentDiagramNode.id = currentServerNode.Id;
        currentDiagramNode.level = 0; // level starts from 0.
        currentDiagramNode.motherId = currentServerNode.MotherId;
        currentDiagramNode.x = 0;
        currentDiagramNode.y = 0;

        if (currentDiagramNode.fullName.length > maxFullNameLength) {
            maxFullNameLength = currentDiagramNode.fullName.length;
        }

        diagramData.nodes.push(currentDiagramNode);
        diagramData.idToNodeMap[currentDiagramNode.id] = currentDiagramNode;
    }

    var maxLevel = calculateLevelForAncestorDiagram(diagramData.nodes[0].id, diagramData.idToNodeMap);
    var nodeHeight = maxFullNameLength * charHeightInPixel + 1;// plus 1 because the node border has width.
    diagramData.nodeHeight = nodeHeight;
    diagramData.height = diagramTopMarginInPixel +
        (maxLevel) * (nodeHeight + diagramNodeVerticalDistanceInPixel) + nodeHeight +
        diagramBottomMarginInPixel;
    return diagramData;
}

function calculateAncestorDiagramPosition(diagramData) {
    var nodes = diagramData.nodes;

    // Calculate y
    for (var i = 0; i < nodes.length; i++) {
        currentNode = nodes[i];
        currentNode.y = diagramData.height
            - diagramBottomMarginInPixel
            - currentNode.level * (diagramData.nodeHeight + diagramNodeVerticalDistanceInPixel)
            - diagramData.nodeHeight;
    }

    // Calculate tree width
    var rootNode = nodes[0];
    calculateTreeWidthForAncestorDiagram(diagramData.idToNodeMap, rootNode, diagramNodeWidthInPixel, diagramNodeHorizentalDistanceInPixel);


    // Calculate x
    var stack = new Array();
    rootNode.x = diagramLeftMarginInPixel;
    stack.push(rootNode);

    var currentDiagramNode = null;
    var motherDiagramNode = null;
    var fatherDiagramNode = null;
    var expectedMotherX = 0;
    var shouldPushMother = false, shouldPushFather = false;
    console.time("calculateXTimer");
    var visitedNodes = {};
    while (stack.length > 0) {
        currentDiagramNode = stack.pop();
        visitedNodes[currentDiagramNode.id] = true;

        shouldPushFather = false;
        shouldPushMother = false;

        fatherDiagramNode = diagramData.idToNodeMap[currentDiagramNode.fatherId];
        if (fatherDiagramNode == null) {
            expectedMotherX = currentDiagramNode.x + diagramNodeWidthInPixel + diagramNodeHorizentalDistanceInPixel;
        } else {
            if (!visitedNodes[fatherDiagramNode.id] || visitedNodes[fatherDiagramNode.id] && fatherDiagramNode.level > currentDiagramNode.level + 1) {
                fatherDiagramNode.x = currentDiagramNode.x;
                expectedMotherX = currentDiagramNode.x + fatherDiagramNode.treeWidth + diagramNodeHorizentalDistanceInPixel;
                shouldPushFather = true;
            }
        }

        motherDiagramNode = diagramData.idToNodeMap[currentDiagramNode.motherId]
        if (motherDiagramNode != null) {
            if (!visitedNodes[motherDiagramNode.id] || visitedNodes[motherDiagramNode.id] && motherDiagramNode.level > currentDiagramNode.level + 1) {
                motherDiagramNode.x = expectedMotherX;
                shouldPushMother = true;
            }
        }

        // The order of pushing mother and father should not be swapped, because father is calculated first.
        if (shouldPushMother) {
            stack.push(motherDiagramNode);
        }
        if (shouldPushFather) {
            stack.push(fatherDiagramNode);
        }
    }

    console.timeEnd("calculateXTimer");
    diagramData.width = diagramLeftMarginInPixel + rootNode.treeWidth + diagramRightMarginInPixel;
}

function drawAncestorDiagram(c, diagramData) {
    // Make sure we don't execute when canvas isn't supported
    if (c.getContext) {
        c.width = diagramData.width;
        c.height = diagramData.height;
        // use getContext to use the c for drawing
        var ctx = c.getContext('2d');
        ctx.font = charWidthInPixel + "px sans-serif";
        ctx.clearRect(0, 0, c.width, c.height);

        var rootNode = diagramData.nodes[0];

        var nodes = new Array();
        nodes.push(rootNode);

        var currentNode, fatherNode, motherNode;
        var visitedNodes = {};
        while (nodes.length > 0) {
            currentNode = nodes.shift();
            visitedNodes[currentNode.id] = true;
            // draw current node
            drawRectangle(ctx, currentNode.x, currentNode.y, diagramNodeWidthInPixel, diagramData.nodeHeight, rootNode.gender == 0);
            drawString(ctx, currentNode.fullName, currentNode.x + ctx.lineWidth, currentNode.y + charHeightInPixel - 1, charHeightInPixel);

            var expectedMotherX = currentNode.x + diagramNodeHorizentalDistanceInPixel + diagramNodeWidthInPixel;

            // father node
            fatherNode = diagramData.idToNodeMap[currentNode.fatherId];
            if (fatherNode != null) {
                drawStraightLine(ctx, currentNode.x + diagramNodeWidthInPixel / 2, currentNode.y, fatherNode.x + diagramNodeWidthInPixel / 2, fatherNode.y + diagramData.nodeHeight);
                expectedMotherX = fatherNode.x + fatherNode.treeWidth + diagramNodeHorizentalDistanceInPixel;
                if (!visitedNodes[fatherNode.id]) {
                    nodes.push(fatherNode);
                }
            }

            // mother node
            motherNode = diagramData.idToNodeMap[currentNode.motherId];
            if (motherNode != null) {
                if (motherNode.x == expectedMotherX) {
                    drawPolyLine(ctx,
                        currentNode.x + diagramNodeWidthInPixel / 2,
                        currentNode.y, motherNode.x + diagramNodeWidthInPixel / 2,
                        motherNode.y + diagramData.nodeHeight);
                }
                else {
                    drawStraightLine(ctx,
                        currentNode.x + diagramNodeWidthInPixel / 2,
                        currentNode.y, motherNode.x +
                        diagramNodeWidthInPixel / 2,
                        motherNode.y + diagramData.nodeHeight);
                }
                if (!visitedNodes[motherNode.id]) {
                    nodes.push(motherNode);
                }
            }
        }
    } else {
        alert('请使用 Safari, Chrome 或IE8+.');
    }
}

function calculateTreeWidthForAncestorDiagram(map, rootDiagramNode, diagramNodeWidth, diagramNodeHorizontalDistance) {
    var fatherTreeWidth = diagramNodeWidth;

    var fatherDiagramNode, motherDiagramNode;
    fatherDiagramNode = map[rootDiagramNode.fatherId];
    if (fatherDiagramNode != null) {
        calculateTreeWidthForAncestorDiagram(
            map,
            fatherDiagramNode,
            diagramNodeWidth,
            diagramNodeHorizontalDistance);
        fatherTreeWidth = fatherDiagramNode.treeWidth;
    }

    motherDiagramNode = map[rootDiagramNode.motherId];
    if (motherDiagramNode == null) {
        rootDiagramNode.treeWidth = fatherTreeWidth;
    } else {
        calculateTreeWidthForAncestorDiagram(
            map,
            motherDiagramNode,
            diagramNodeWidth,
            diagramNodeHorizontalDistance);
        motherTreeWidth = motherDiagramNode.treeWidth;
        rootDiagramNode.treeWidth = fatherTreeWidth + diagramNodeHorizontalDistance + motherTreeWidth;
    }
}

function calculateLevelForAncestorDiagram(rootDiagramNodeId, map) {
    var maxLevel = 0, currentLevel;
    var queue = new Array();
    queue.push(map[rootDiagramNodeId]);
    var currentNode = null;
    var fatherNode = null;
    var motherNode = null;

    while (queue.length > 0) {
        currentNode = queue.shift();
        currentLevel = currentNode.level;

        fatherNode = map[currentNode.fatherId];
        if (fatherNode != null) {
            fatherNode.level = Math.max(currentLevel + 1, fatherNode.level);
            queue.push(fatherNode);
        }
        motherNode = map[currentNode.motherId];
        if (motherNode != null) {
            motherNode.level = Math.max(currentLevel + 1, motherNode.level);
            queue.push(motherNode);
        }
        maxLevel = Math.max(currentLevel, maxLevel);
    }
    return maxLevel;
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
            var fatherFirstNamePlusId = '-' + serverPerson.FatherId;
            fatherFirstNamePlusId = serverPerson.Father.FirstName + fatherFirstNamePlusId;
            self.fatherFirstName(fatherFirstNamePlusId);
            self.fatherLastName(serverPerson.Father.LastName);
        }
        self.fatherId(serverPerson.FatherId);
        self.firstName(serverPerson.FirstName);
        self.gender(serverPerson.Gender),
        self.id(serverPerson.Id);
        self.lastName(serverPerson.LastName);
        if (serverPerson.Mother != null) {
            var motherFirstNamePlusId = '-' + serverPerson.MotherId;
            motherFirstNamePlusId = serverPerson.Mother.FirstName + motherFirstNamePlusId;
            self.motherFirstName(motherFirstNamePlusId);
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

    self.registerUserName = ko.observable("");
    self.registerEmail = ko.observable("");
    self.registerPassword = ko.observable("");
    self.confirmPassword = ko.observable("");

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
        $("#registerButton").attr("disabled", true);
        $("#registerStatusDiv").html("<img src='Images/loading.gif' />");
        $.ajax({
            type: 'POST',
            url: '/api/Account/Register',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data)
        }).done(function (data) {
            self.loginUserName(self.registerUserName());
            self.loginPassword(self.registerPassword());
            self.result("注册成功，请登录。");
            $("#registerStatusDiv").html("");
        }).fail(function (response) {
            $("#registerButton").attr("disabled", false); 
            $("#registerStatusDiv").html("");
            showError(response);
        });
       
    }

    self.signIn = function () {
        self.result('');

        var loginData = {
            grant_type: 'password',
            username: self.loginUserName(),
            password: self.loginPassword()
        };
        $("#loginIdButton").attr("disabled", true);
        $("#loginStatusDiv").html("<img src='Images/loading.gif' />");
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
            $("#loginStatusDiv").html("");
        }).fail(function (response) {
            $("#loginIdButton").attr("disabled", false); 
            $("#loginStatusDiv").html("");
            // {"error":"invalid_grant","error_description":"The user name or password is incorrect."}
            var description = $.parseJSON(response.responseText)['error_description'];
            self.result(description);
        });
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

function showEditPersonErrorMessage(response) {
    var message = response.status + ': ' + response.statusText + '. ';
    //{
    //    "error":{
    //        "code":"","message":"\u7236\u4eb2\u5fc5\u987b\u662f\u7537\u6027\uff01"
    //    }
    //}
    message += $.parseJSON(response.responseText).error.message;
    viewModel.editPersonErrorMessage(message);
}

function showDrawDiagramErrorMessage(response) {
    var message = response.status + ': ' + response.statusText + '. ';
    //{
    //    "error":{
    //        "code":"","message":"\u7236\u4eb2\u5fc5\u987b\u662f\u7537\u6027\uff01"
    //    }
    //}
    message += $.parseJSON(response.responseText).error.message;
    viewModel.drawDiagramErrorMessage(message);
}

function showErrorMessage(response) {
    var message = response.status + ': ' + response.statusText + '. ';
    //{
    //    "error":{
    //        "code":"","message":"\u7236\u4eb2\u5fc5\u987b\u662f\u7537\u6027\uff01"
    //    }
    //}
    message += $.parseJSON(response.responseText).error.message;
    viewModel.errorMessage(message);
}

var defaultServerPerson = new ServerPerson();

var viewModel = {
    viewPerson: ko.observable(new ClientPerson(defaultServerPerson)),
    editPerson: ko.observable(new ClientPerson(defaultServerPerson)),
    signInfo: ko.observable(new SignInfo()),
    errorMessage: ko.observable(),
    editPersonErrorMessage: ko.observable(),
    drawDiagramErrorMessage: ko.observable(),
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
            url: "/odata/People(" + treeNode.Id + ")/ChildrenByFather?$select=FatherId,FirstName,Gender,Id,LastName&$orderby=BirthDay,BirthTime,OrderInChildrenOfParents",
            success: function (responseData) {
                if (!responseData) return null;
                else {
                    var childNode, fatherNode, tempNodes = null;
                    for (var i = 0; i < responseData.value.length; i++) {
                        tempNodes = zTreeObj.getNodesByParam("Id", responseData.value[i].FatherId, null)
                        if (tempNodes == null) {
                            alert("导航树中无编号为‘" + responseData.value[i].FatherId + "的节点！");
                            continue;
                        }
                        fatherNode = tempNodes[0];
                        childNode = responseDataToTreeNode(responseData.value[i]);
                        zTreeObj.addNodes(fatherNode, childNode);
                    }
                    zTreeObj.expandNode(fatherNode, true, false, false);
                }
            },
            failure: function (response) {
                alert(response);
            }
        }).fail(showErrorMessage);
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
                showErrorMessage(response);
            }
        }).fail(showErrorMessage);
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
        url: "/odata/People?$select=Id,FirstName,Gender,LastName,FatherId&$orderby=LastName,FirstName&$filter=FatherId eq null",
        success: function (responseData) {
            var childNode = null;
            for (var i = 0; i < responseData.value.length; i++) {
                childNode = responseDataToTreeNode(responseData.value[i]);
                zTreeObj.addNodes(null, childNode);
            }
        },
        failure: function (response) {
            alert(response);
        }
    }).fail(showErrorMessage);
}

function showSignInDialog() {

    $("#dialog-signIn").dialog({
        autoOpen: false,
        dialogClass: "no-close",
        modal: true,
        width: 500,
    });
    $("#registerButton").attr("disabled", false);
    $("#loginIdButton").attr("disabled", false);
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
