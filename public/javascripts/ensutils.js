var ENS = require("ethereum-ens");
var Registrar = require("eth-registrar-ens");

function ensDappStart(web3) {
    $("#startbtn").click(startAuction);
    $("#bidbtn").click(setBid);
    $("#bidbtn_v").click(validateBid);
    $("#bidbtn_reveal").click(revealBid);
    var ethRegistrar = null;

    function initEthRegistrar(){
        return new Promise((resolve, reject) => {
            ens = new ENS(web3);
            ethRegistrar = new Registrar(web3, ens, "eth", 7, (err, result) => {
                if(err){
                    return reject(err);
                }
                console.log("ethRegistrar initialed");
                resolve();
            });
        });
    }

    initEthRegistrar();


    function onDomain(domain, data) {
        console.log("start registrar for domain " + domain);

        if(!ethRegistrar){
            $("#info").html("域名服务没有找到！");
            return;
        }

        switch (data.sti) {
            case 0:
                $("#info").html(domain + ".eth 尚未被竞拍，您可以开始竞拍");
                $("#start").show();
                //startAuction(domain);
                break;
            case 1:
                var date = new Date(data.date);
                var dateOffset = (24*60*60*1000) * 2; //5 days
                date.setTime(date.getTime() - dateOffset);
                $("#info").html(domain + ".eth 竞拍中，您可以出价，出价期结束时间：" + date.toLocaleDateString() + "  " + date.toLocaleTimeString());
                $("#bid").show();
                $("#bid_v").show();
                break;
            case 4:
                $("#info").html(domain + ".eth 正在公示阶段，如果您有参与竞拍，请公示您的出价");
                $("#reveal").show();
                loadEntryInfo(domain);
                break;
            default:
                $("#info").html(domain + ".eth 无法竞拍");
                break;
        }
    }

    function startAuction() {
        var domain = $("#domain").val().trim();
        $("#info").html("开启对" + domain + "的竞拍中...");
        web3.eth.getAccounts(function(e, a){
            var text = "";
            if(e){
                text = "获取账户信息失败！" + e.toString();

            } else if(a.length == 0){
                text = "获取账户信息失败！" + "没有账户";
            } else {
                text = "没有以太币账户";
            }
            $("#info").html(text);

            if(e || a.length == 0){
                return;
            }

            var account = a[0];
            ethRegistrar.openAuction(domain, undefined, {from:account, gas: 100000}, function (err, result) {
                if(err){
                    $("#info").html("开启竞拍失败，错误：" + err.toString() + " 请过一会再尝试");
                    console.log(err);
                } else {
                    $("#info").html("开启竞拍成功！transaction number:" + result + ", 等待请求写入全网中，请过一会再查询该域名，等状态变为竞拍中后开始出价");
                    console.log(result);
                }
            });
        });
    }

    function setBid() {
        var domain = $("#domain").val().trim();
        var price = parseFloat($("#bidprice").val());
        var secret = $("#secret").val().trim();

        if(isNaN(price) || secret.length == 0){
            $("#info").html("请确保参数正确");
            return;
        }

        $("#info").html("对" + domain + "出价中...价格" + price + " 加密串: "+ secret);

        web3.eth.getAccounts(function(e, a){
            var text = "";
            if(e){
                text = "获取账户信息失败！" + e.toString();

            } else if(a.length == 0){
                text = "获取账户信息失败！" + "没有账户";
            } else {
                text = "没有以太币账户";
            }
            $("#info").html(text);

            if(e || a.length == 0){
                return;
            }

            var account = a[0];

            var bidObj = ethRegistrar.bidFactory(domain, account, web3.toWei(price, 'ether'), secret, function (err, bidObj) {
                if(err){
                    $("#info").html("出价失败，错误：" + err.toString());
                } else {
                    ethRegistrar.submitBid(bidObj,
                        undefined,
                        {
                            from:account,
                            value: web3.toWei(price, 'ether'),
                            gas: 470000
                        },
                        function (err, result) {
                            if(err){
                                $("#info").html("出价失败，错误：" + err.toString());
                                console.log(err);
                            } else {
                                $("#info").html("出价成功！请一定记住你设置的secret：" + secret + "和出价(之后公示阶段要用到！)： 本次Bid哈希码" + bidObj.shaBid);
                                console.log(result);
                            }
                        });
                }
            });
        });
    }

    function validateBid() {
        var domain = $("#domain").val().trim();
        var price = parseFloat($("#bidprice_v").val());
        var secret = $("#secret_v").val().trim();

        if(isNaN(price) || secret.length == 0){
            $("#info").html("请确保参数正确");
            return;
        }

        $("#info").html("对" + domain + "出价中...价格" + price + " 加密串: "+ secret);

        web3.eth.getAccounts(function(e, a){
            var text = "";
            if(e){
                text = "获取账户信息失败！" + e.toString();

            } else if(a.length == 0){
                text = "获取账户信息失败！" + "没有账户";
            } else {
                text = "没有以太币账户";
            }
            $("#info").html(text);

            if(e || a.length == 0){
                return;
            }

            var account = a[0];

            var bidObj = ethRegistrar.bidFactory(domain, account, web3.toWei(price, 'ether'), secret, function (err, bidObj) {
                if(err){
                    $("#info").html("出价失败，错误：" + err.toString());
                } else {
                    ethRegistrar.isBidRevealed(bidObj, function (e, result) {
                        if(e){
                            $("#info").html("获取bid信息失败" + e.toString());
                        } else if(!result){
                            $("#info").html("bid验证成功，请等待公示阶段");
                        } else {
                            $("#info").html("bid验证失败，出价失败或者已经公示");
                        }
                    })
                }
            });
        });
    }
    
    function revealBid() {
        var domain = $("#domain").val().trim();
        var price = parseFloat($("#bidprice_reveal").val());
        var secret = $("#secret_reveal").val().trim();

        if(isNaN(price) || secret.length == 0){
            $("#info").html("请确保参数正确");
            return;
        }

        $("#info").html("对" + domain + "出价公示..." + price + " 加密串: "+ secret);

        web3.eth.getAccounts(function(e, a){
            var text = "";
            if(e){
                text = "获取账户信息失败！" + e.toString();

            } else if(a.length == 0){
                text = "获取账户信息失败！" + "没有账户";
            } else {
                text = "没有以太币账户";
            }
            $("#info").html(text);

            if(e || a.length == 0){
                return;
            }

            var account = a[0];

            var bidObj = ethRegistrar.bidFactory(domain, account, web3.toWei(price, 'ether'), secret, function (err, bidObj) {
                if(err){
                    $("#info").html("出价失败，错误：" + err.toString());
                } else {
                    ethRegistrar.unsealBid(bidObj,
                        {
                            from:account,
                            gas: 470000
                        },
                        function (e, result) {
                            if(e){
                                $("#info").html("获取bid信息失败" + e.toString());
                            } else {
                                $("#info").html("bid验证成功，请等待公示阶段");
                            }
                        }
                    )
                }
            });
        });
    }

    function loadEntryInfo(domain) {
        $("#reveal_info").html("");
        ethRegistrar.getEntry(domain, function (err, e) {
            if(err){
                $("#reveal_info").html("无法获取当前出价信息: " + err.toString());
            }else {
                var owner = "未知";
                if(e.deed){
                    owner = e.deed.owner;
                    if(owner == OWNER){
                        owner = "就是你啦！"
                    }
                }
                $("#reveal_info").html("最高价: " + web3.fromWei(e.highestBid, "ether") + " 第二高价:" + web3.fromWei(e.value, "ether") + " 当前owner: " + owner);
            }
        })
    }
    return onDomain;
};


module.exports = ensDappStart;