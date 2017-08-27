var ENS = require("ethereum-ens");
var Registrar = require("eth-registrar-ens");

function ensDappStart(web3) {
    $("#startbtn").click(startAuction);
    $("#bidbtn").click(setBid);

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
                $("#info").html(domain + ".eth 竞拍中，您可以加入竞拍");
                $("#bid").show();
                break;
            case 4:
                $("#info").html(domain + ".eth 正在公示阶段，如果您有参与竞拍，请公示您的出价");
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
                                $("#info").html("出价成功！transaction number:" + result + ", 等待请求写入全网中");
                                console.log(result);
                            }
                        });
                }
            });


        });

    }
    return onDomain;
};


module.exports = ensDappStart;