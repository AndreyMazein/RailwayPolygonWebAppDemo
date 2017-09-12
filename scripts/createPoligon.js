(function( $ ){

    $.fn.createPoligon = function(option) {

        var setting = {addOfServer:"", mode:"1", detalization:"1"};

        return this.each(function(){

            if (option){$.extend(setting,option);}
            if (setting.addOfServer=="") {
                alert("You did't select server!");
                return;
            }
            /*
             Блок иницилизация глобальных вспомогательных обектов
             */

            //var $my_WCF = "http://10.41.80.61/WcfServiceLibrary31/Service.svc";
            var $my_WCF = setting.addOfServer
            var globWaysAndStations = {ways: "", stations: ""};
            var globWays = [{}];
            var globalPathes = [];
            var globalDepos = [];
            var globIdEndPointsOfWay = [];
            var currentDepo = null;
            var currentIdOfNewPath = null;
            var currentExtraAttrOfNewPath = null;
            var currentPathESREndPoints = {beginESR: null, endESR: null};
            var currentPathNameEndPoints = {beginName:"", endName:""};
            var currentWayESREndPoints = {beginESR: null, endESR: null};
            var currentWayNameEndPoints = {beginName:"", endName:""};
            var currentPathData = {idDepo: null, ESRBegStation: null, ESREndStation: null, idWays: null};
            var idDeletedPath = null;
            var DeletedTR = null;
            var arrOfNewStationsCoordinate = [];
            var arrOfDomElemWaysHover = [];
            var currentAdmin = null;
            var currentRoad = null;
            var currentDerect = null;
            var adminInfo = [
                {
                    "kod_adm": 0,
                    "name_admin":"",
                    "roads":
                        [
                            {
                                "kod_dor":0,
                                "name_dor":"",
                                "derects":
                                    [
                                        {"kod_otd":0 , "name_otd":"" }
                                    ]
                            }
                        ]
                }
            ];
            var functionOfAplication = {"view": true, "editWays": false, "editPaths": false};
            var typeOfDetalization = {"ways": false, "elemWays": true};
            var selectedArrOfDomElem =[];
            var selectedTrOfTable = null;
            var arrWaysIdOfNewPath = [];
            var arrESRStationsOfNewPath = [];
            var arrWaysIdOfNewPathUserSequence = [];
            var arrElemWaysIdOfNewWay =[];
            var arrESRStationsOfNewWay = [];
            var arrWaysIdOfNewWayUserSequence=[];
            var prevTR = null;
            var prevIdDepo = null;
            var prevArrOfDomElem = [];
            var idOfDragedStation=-1;
            var arrOfDraggetElem= [];

            switch(setting.mode) {
                case '1':
                    functionOfAplication = {"view": true, "editWays": false, "editPaths": false};
                    break;
                case '2':
                    functionOfAplication = {"view": false, "editWays": true, "editPaths": false};
                    break;
                case '3':
                    functionOfAplication = {"view": false, "editWays": false, "editPaths": true};
                    break;
                default:
                    functionOfAplication = {"view": true, "editWays": false, "editPaths": false};
                    break;
            }

            switch(setting.detalization) {
                case '1':
                    typeOfDetalization = {"ways": false, "elemWays": true};;
                    break;
                case '2':
                    typeOfDetalization = {"ways": true, "elemWays": false};;
                    break;
                default:
                    typeOfDetalization = {"ways": false, "elemWays": true};;
                    break;
            }

            /*
             Блок генерирования HTML елементов
             */

            $(this).css({"width": "100%", "height":"100%", "position":"relative"});
            //$(this).parentNode.css({"width": "100%", "height":"100%"});

            //тултипы
            $(this).append(
                '<div id="tooltipDivStation">' +
                '<table class="w3-table w3-small">'+
                '<tr>'+
                '<td colspan="2" style="background: rgba(0, 150, 136, 0.75)"><b>Станція</b></td>'+
                '</tr>'+
                '<tr>'+
                '<td>Код:</td>'+
                '<td id="IdStationToolTip"></td>'+
                '</tr>'+
                '<tr>'+
                '<td>Назва:</td>'+
                '<td id="NameStationToolTip"></td>'+
                '</tr>'+
                '<tr>'+
                '<td>Дирекція:</td>'+
                '<td id="DirStationToolTip"></td>'+
                '</tr>'+
                '</table>'+
                '</div>'+

                '<div id="tooltipDivWay">' +
                '<table class="w3-table w3-small">'+
                '<tr>'+
                '<td colspan="2" style="background: rgba(0, 150, 136, 0.75)"><b>Поїзд.діл</b></td>'+
                '</tr>'+
                '<tr>'+
                '<td>Код:</td>'+
                '<td id="IdWayToolTip"></td>'+
                '</tr>'+
                '<tr>'+
                '<td>Назва:</td>'+
                '<td id="NameWayToolTip"></td>'+
                '</tr>'+
                '<tr>'+
                '<td>Дирекція:</td>'+
                '<td id="DirWayToolTip"></td>'+
                '</tr>'+
                '</table>'+
                '</div>'+

                '<div id="tooltipDiv">' +
                '<table id="tooltipTable" class="w3-table w3-small">'+
                '<tr>'+
                '<td colspan="2" style="background: rgba(0, 150, 136, 0.75)"><b>Елем.діл</b></td>'+
                '</tr>'+
                '<tr>'+
                '<td>Код:</td>'+
                '<td id="IdElemWayToolTip"></td>'+
                '</tr>'+
                '<tr>'+
                '<td>Назва:</td>'+
                '<td id="NameElemWayToolTip"></td>'+
                '</tr>'+
                '<tr>'+
                '<td>Дирекція:</td>'+
                '<td id="DirToolTip"></td>'+
                '</tr>'+
                '<tr>'+
                '<td id="ExtraInfoToolTip"colspan="2">Входить до сладу поїзд.діл №</td>'+
                '</tr>'+

                '</table>'+
                '</div>'
            );

            // меню навигации
            $(this).append(
                '<nav class="w3-sidenav w3-white w3-card-2 w3-animate-right" style="width:430px; right:0; display:none" id="mySidenav">'+
                '<ul class="w3-navbar w3-card-2 w3-teal">'+
                '<li><a href="#1" id="t1" class="tablink w3-padding-16 w3-hover-black" >Плечі</a></li>'+
                '<li><a href="#2" id="t2" class="tablink w3-padding-16 w3-hover-black" >Поїзд.діл</a></li>'+
                '<li><a href="#5" id="t5" class="tablink w3-padding-16 w3-hover-black" >Елем.діл</a></li>'+
                '<li><a href="#3" id="t3" class="tablink w3-padding-16 w3-hover-black" >Станції</a></li>'+
                '<li><a href="#4" id="t4" class="tablink w3-padding-16 w3-hover-black" >ДЕПО</a></li>'+
                '</ul>'+
                '<div id="tabPathes" class="w3-container tab" >'+
                '<input class="w3-input w3-border w3-round" id="searchPathes" placeholder="Введіть назву або код...">'+
                '<div id="scroltabPathes" class="scrolTab"></div>'+
                '</div>'+
                '<div id="tabWays" class="w3-container tab" >'+
                '<input class="w3-input w3-border w3-round" id="searchWays" placeholder="Введіть назву або код..." >'+
                '<div id="scroltabWays" class="scrolTab"></div>'+
                '</div>'+
                '<div id="tabElemWays" class="w3-container tab" >'+
                '<input class="w3-input w3-border w3-round" id="searchElemWays" placeholder="Введіть назву або код..." >'+
                '<div id="scroltabElemWays" class="scrolTab"></div>'+
                '</div>'+
                '<div id="tabStations" class="w3-container tab">'+
                '<input class="w3-input w3-border w3-round" id="searchStations" placeholder="Введіть назву або код..." >'+
                '<div id="scroltabStations" class="scrolTab"></div>'+
                '</div>'+
                '<div id="tabDepos" class="w3-container tab" >'+
                '<input class="w3-input w3-border w3-round" id="searchDepos" placeholder="Введіть назву або код..." title="Type in a name">'+
                '<div id="scroltabDepos" class="scrolTab"></div>'+
                '</div>'+
                '</nav>'+

                '<div id="main">'+
                '</div>'
            );

            //панель отображения
            $("#main").append(
                '<div id="div-svg-form" >'+
                '<img src="img/4.gif" id="loadGif">'+
                '</div>'
            );

            //главное меню приложения
            $("#main").append(
                '<div id="menuContext" class="w3-white w3-card-2 w3-animate-top" style=" position: absolute; top: 0px; width: 350px; display: none;" >'+

                '<div style="width: 100%; height: 54px"></div>'+

                '<div class="w3-btn-bar">'+
                '<button id="limitationOfAreaBtn" class="w3-btn w3-left-align w3-hover-teal" style="width:100%">Обмеження полігону</button>'+
                '</div>'+
                '<div id="limitationOfArea" class="w3-container w3-light-grey w3-border-top w3-border-bottom" style="display: none">' +

                '<table class="w3-table">'+
                '<tr>'+
                '<td>Адміністрація :</td>'+
                '<td>' +
                '<button id="chooseAdminBtn"class="w3-btn w3-black">Не обрано</button>'+
                '<div id="chooseAdmin" class="w3-dropdown-content w3-bar-block w3-border"></div>' +
                '</td>'+
                '</tr>'+
                '<tr >'+
                '<td id="chooseRoadTd" style="display: none">Регіональна філія :</td>'+
                '<td>' +
                '<button id="chooseRoadBtn" class="w3-btn w3-black " style="display: none">Не обрано</button>'+
                '<div id="chooseRoad" class="w3-dropdown-content w3-bar-block w3-border"></div>'+
                '</td>'+
                '</tr>'+
                '<tr >'+
                '<td id="chooseDerectTd" style="display: none">Дирекція :</td>'+
                '<td>' +
                '<button id="chooseDerectBtn" class="w3-btn w3-black" style="display: none">Не обрано</button>'+
                '<div id="chooseDerect" class="w3-dropdown-content w3-bar-block w3-border"></div>'+
                '</td>'+
                '</tr>'+
                '</table>'+
                '</div>'+

                '<div class="w3-btn-bar">'+
                '<button id="saveNewCordinates" class="w3-btn w3-left-align w3-hover-teal" style="width:100%; display: none;">Зберегти нові координати</button>'+
                '</div>'+
                '<div class="w3-btn-bar">'+
                '<a id="choiceViewBt" class="w3-btn w3-left-align w3-hover-teal" href="#" style="width:100%">Деталізація відображення</a>'+
                '</div>'+
                '<div id="viewContext" class="w3-container w3-light-grey w3-border-top w3-border-bottom" style="display: none">' +
                '<div style="width: 100%; height: 18px"></div>'+
                '<input id="showElemWaysOnMap" type="radio" name="typeView" value="elemWays" checked>'+
                '<label>  Елем.дільниці</label></p>'+
                '<input id="showWaysOnMap" type="radio" name="typeView" value="Ways">'+
                '<label>  Поїзд.дільниці</label></p>'+
                '</div>'+


                '<div class="w3-btn-bar">'+
                '<a id="choiceFunctionBtn" class="w3-btn w3-left-align w3-hover-teal" href="#" style="width:100%">Функції редактора</a>'+
                '</div>'+
                '<div id="viewFunctionContext" class="w3-container w3-light-grey w3-border-top w3-border-bottom" style="display: none">' +
                '<div style="width: 100%; height: 18px"></div>'+
                '<input id="showPoligon" type="radio" name="functionType" value="showPoligon" checked>'+
                '<label>  Перегляд полігону</label></p>'+
                '<input id="editWays" type="radio" name="functionType" value="editWays">'+
                '<label>  Редогування поіїздодільниць</label></p>'+
                '<input id="editPaths" type="radio" name="functionType" value="editPaths">'+
                '<label>  Редогування плечей</label></p>'+
                '</div>'+

                '<div class="w3-btn-bar">'+
                '<a id="openCloseNavMenu" class="w3-btn w3-left-align w3-hover-teal" href="#" style="width:100%">Відкрити меню навігації</a>'+
                '</div>'+

                '</div>'
            );

            //Header
            $("#main").append(
                '<header class="w3-navbar w3-card-2 w3-teal" >'+
                '<button id="openMenuBtn" class="w3-btn w3-padding-16 w3-hover-black w3-teal">МЕНЮ</button>'+
                '<span class="w3-opennav w3-xlarge" id="openNav" style="position: absolute; right: 16px; top: 50%; transform:translate(0%,-50%);">&#9776;</span>'+
                '</header>'
            );

            //footer
            $("#main").append(
                '<footer class="w3-container w3-card-2 w3-teal">'+
                '<div id="helper1"><h4>Для створення нового плеча необхідно обрати депо</h4></div>'+
                '<div id="divInfoNewPath" class="w3-row w3-padding-8" style="display: none">'+
                '<div class="w3-col w3-left" style="width:240px">'+

                '<div id="divIdDepoTitle" style="float: left; padding-top: 6px; ">ID Депо:</div>'+
                '<div id="divIdDepoNumber" style="float: left"> <button id="currentDepo" class="w3-btn w3-teal">...</button> </div>'+
                '<div id="divNewPathTitle" style="float: left; padding-top: 6px; padding-right: 6px">Поезд.уч:</div>'+

                '</div>'+
                '<div class="w3-col w3-right" style="width:100px"><button id="confirmNewPath" class="w3-btn w3-teal">Зберегти</button></div>'+
                '<div class="w3-rest" ><input id="newPath" style="width: 100%; padding: 4px" type="text" disabled></div>'+
                '</div>'+

                '<div style="clear: both;"></div>'+
                '<div >'+
                '<div id="IdOfNewPath" class="extraPathInfo" style="padding-top: 6px; padding-right: 12px">Код плеча: ...</div>'+
                '<button id="FirsStation" class="w3-btn w3-teal extraPathInfo">Поч.ст: ...</button>'+
                '<button id="LastStation" class="w3-btn w3-teal extraPathInfo">Кін.ст: ...</button>'+
                '</div>'+
                '</footer>'
            );

            // модальное окно предупреждения
            $(this).append(
                '<div id="modalWarning" class="w3-modal w3-animate-opacity" >'+
                '<div class="w3-modal-content w3-card-8">'+
                '<div class="w3-container w3-orange">'+
                '<span id="closeModalWarning" class="w3-closebtn">&times;</span>'+
                '<p><h4 style="font-weight: 500">Попередження</h4></p>'+
                '</div>'+
                '<div class="w3-container">'+
                '<p id="warningMassage">'+
                "Перевірка попередження"+
                '</p>'+
                '</div>'+
                '</div>'+
                '</div>'
            );

            // модальное окно для ошибки
            $(this).append(
                '<div id="modalError" class="w3-modal w3-animate-opacity" >'+
                '<div class="w3-modal-content w3-card-8">'+
                '<div class="w3-container w3-red">'+
                '<span id="closeModalError" class="w3-closebtn">&times;</span>'+
                '<p><h4 style="font-weight: 500">Неможлива операція</h4></p>'+
                '</div>'+
                '<div class="w3-container">'+
                '<p id="errorMassage">'+
                "Перевірка неможливої операції"+
                '</p>'+
                '</div>'+
                '</div>'+
                '</div>'
            );

            // модальное окно для сообщения
            $(this).append(
                '<div id="modalMassage" class="w3-modal w3-animate-opacity" >'+
                '<div class="w3-modal-content w3-card-8">'+
                '<div class="w3-container w3-teal">'+
                '<span id="closeModalMassage" class="w3-closebtn">&times;</span>'+
                '<p><h4 style="font-weight: 500">Повідомлення</h4></p>'+
                '</div>'+
                '<div class="w3-container">'+
                '<p id="NewMassage">'+
                "Нове повідомлення"+
                '</p>'+
                '</div>'+
                '</div>'+
                '</div>'
            );

            // модальное диалоговое окно подтверждения
            $(this).append(
                '<div id="modalConfirmDeletionPath" class="w3-modal w3-animate-opacity" >'+
                '<div class="w3-modal-content w3-card-8">'+
                '<div class="w3-container w3-orange">'+
                '<span id="closeModalConfirmDeletionPath" class="w3-closebtn">&times;</span>'+
                '<p><h4 style="font-weight: 500">Попередження</h4></p>'+
                '</div>'+

                '<div class="w3-container">'+
                '<p id="massageConfirm">'+
                '</p>'+
                '</div>'+

                '<div class="w3-container w3-orange w3-padding-8">'+
                '<button id="confirmDeletion" class="w3-btn w3-orange" style="float: left; font-weight: 500;">ДА</button>'+
                '<button id="cancelDeletion" class="w3-btn w3-orange" style="float: right; font-weight: 500;">НЕТ</button>'+
                '</div>'+
                '</div>'+
                '</div>'
            );

            /*
             Блок инициализации и создания переменных для манипуляцией над модальными окнами и меню
             */

            var modalWarning = document.getElementById('modalWarning');
            var modalError = document.getElementById('modalError');
            var modalMassage = document.getElementById('modalMassage');
            var modalConfirmDeletionPath = document.getElementById('modalConfirmDeletionPath');
            var closeModalWarning = document.getElementById('closeModalWarning');
            var closeModalError = document.getElementById('closeModalError');
            var closeModalMassage = document.getElementById('closeModalMassage');
            var closeModalConfirmDeletionPath1 = document.getElementById('closeModalConfirmDeletionPath');
            var closeModalConfirmDeletionPath2 = document.getElementById('cancelDeletion');
            var confirmDeletion = document.getElementById('confirmDeletion');
            var menuContext = document.getElementById("menuContext");
            var openMenuBt =  document.getElementById("openMenuBtn");
            var choiceViewBt = document.getElementById("choiceViewBt");
            var choiceFunctionBtn = document.getElementById("choiceFunctionBtn")
            var viewContext = document.getElementById("viewContext");
            var viewFunctionContext = document.getElementById("viewFunctionContext");
            var limitationOfArea = document.getElementById("limitationOfArea");
            var limitationOfAreaBtn = document.getElementById("limitationOfAreaBtn");

            /*
             Блок создания и инициализации SVG елементов
            */

            //размер окна
            var width = 10000 , height = 10000 ;
            //создание зума
            var zoom = d3.behavior.zoom()
                .scaleExtent([-2, 10])
                .on("zoom", zoomed);
            // создание формы
            var svg = d3.select("#div-svg-form").append("svg")
                .attr("width", width )
                .attr("height", height )
                .append("g")
                .attr("id", "svgForm")
                .call(zoom);
            var rect = svg.append("rect")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "none")
                .style("pointer-events", "all")
                .attr("id", "rectForm");
            var container = svg.append("g").attr("id", "container");
            // создаем обект для драга
            var drag = d3.behavior.drag()
                .origin(function(d) {
                    return d; })
                .on("dragstart", dragstarted)
                .on("drag", dragged)
                .on("dragend", dragended);

            /*
             Блок привязки событий к елементам виджита
             */

            // привязка событий к елементам меню

            //Событие выбора администрации
            $("#chooseAdmin").click(function (event) {
                var target = event.target;
                if (target.tagName == 'A'){
                    $("#chooseAdminBtn").html(target.innerHTML );
                    openCloseSelectionOfAdmin("chooseAdmin");

                    //removedata
                    $('#chooseRoad').empty();
                    $('#chooseDerect').empty();
                    $('#chooseRoadBtn').html("Всі");
                    $('#chooseDerectBtn').html("Всі").css("display","none");
                    $('#chooseDerectTd').css("display","none");

                    currentRoad = null;
                    currentDerect =null;

                    if(target.innerHTML=="Всі"){
                        currentAdmin=null;

                        $('#chooseRoadTd').css("display","none");
                        $('#chooseRoadBtn').css("display","none");
                        $('#chooseDerectBtn').css("display","none");
                        $('#chooseDerectTd').css("display","none");
                    }
                    else {
                        //ищем в массиве
                        for (var i = 0; i < adminInfo.length; i++) {
                            if (target.innerHTML == adminInfo[i].name_admin) {
                                currentAdmin = adminInfo[i];
                            }
                        }

                        $('#chooseRoad').append('<a href="#" class="w3-bar-item w3-btn">Всі</a>');
                        for (var i = 0; i < currentAdmin.roads.length; i++) {
                            $('#chooseRoad').append('<a href="#" class="w3-bar-item w3-btn">' + currentAdmin.roads[i].name_dor + '</a>');
                        }
                        $('#chooseRoadTd').css("display", "block");
                        $('#chooseRoadBtn').css("display", "block");
                    }
                    var averX=0;
                    var averY=0;
                    var count=0;
                    for(var i=0; i<globWaysAndStations.stations.length; i++){
                        var resultOfFilter = false;
                        for(var f=0; f<globWaysAndStations.stations[i].extraAdminInfo.length; f++){
                            if(currentAdmin==null || globWaysAndStations.stations[i].extraAdminInfo[f].adm == currentAdmin.kod_adm){
                                resultOfFilter = true;
                                break;
                            }
                        }
                        if(resultOfFilter){
                            averX+=globWaysAndStations.stations[i].x;
                            averY+=globWaysAndStations.stations[i].y;
                            count++;
                            var tempDOMDot = document.getElementById(globWaysAndStations.stations[i].id);
                            tempDOMDot.style.display="block";
                            if(tempDOMDot.getAttribute("r")==2){
                                document.getElementById("t"+globWaysAndStations.stations[i].id).style.display="block";
                            }
                        }
                        else {
                            document.getElementById(globWaysAndStations.stations[i].id).style.display="none";
                            document.getElementById("t"+globWaysAndStations.stations[i].id).style.display="none";
                        }
                    }
                    for(var i=0; i<globWaysAndStations.ways.length; i++){
                        if(currentAdmin==null || globWaysAndStations.ways[i].admTid==currentAdmin.kod_adm){
                            document.getElementById(globWaysAndStations.ways[i].idElem).style.display="block";
                        }
                        else {
                            document.getElementById(globWaysAndStations.ways[i].idElem).style.display="none";
                        }
                    }

                    averX=averX/count;
                    averY=averY/count;
                    moveToPoint(averX,averY,0.2,1500);

                    reloadAllNavigationTables();
                }


            });
            $("#chooseAdminBtn").click(function() {
                openCloseSelectionOfAdmin("chooseAdmin");
            });
            //Событие выбора дороги
            $("#chooseRoad").click(function (event) {
                var target = event.target;
                if (target.tagName == 'A'){
                    var scale =1.0;

                    $("#chooseRoadBtn").html(target.innerHTML );
                    openCloseSelectionOfAdmin("chooseRoad");

                    $('#chooseDerect').empty();
                    $('#chooseDerectBtn').html("Всі");
                    currentDerect =null;

                    if(target.innerHTML=="Всі"){
                        currentRoad=null;
                        $('#chooseDerectBtn').css("display","none");
                        $('#chooseDerectTd').css("display","none");
                        scale=0.2;
                    }
                    else {
                        //ищем в массиве
                        for (var i = 0; i < currentAdmin.roads.length; i++) {
                            if (target.innerHTML == currentAdmin.roads[i].name_dor) {
                                currentRoad = currentAdmin.roads[i];
                            }
                        }


                        $('#chooseDerect').append('<a href="#" class="w3-bar-item w3-btn">Всі</a>');
                        //console.log(currentRoad);
                        for (var i = 0; i < currentRoad.derects.length; i++) {
                            $('#chooseDerect').append('<a href="#" class="w3-bar-item w3-btn">' + currentRoad.derects[i].name_otd + '</a>');
                        }
                        $('#chooseDerectTd').css("display", "block");
                        $('#chooseDerectBtn').css("display", "block");
                    }
                    var averX=0;
                    var averY=0;
                    var count=0;
                    for(var i=0; i<globWaysAndStations.stations.length; i++){

                        var resultOfFilter = false;
                        for(var f=0; f<globWaysAndStations.stations[i].extraAdminInfo.length; f++){

                            if(
                                (currentAdmin==null || globWaysAndStations.stations[i].extraAdminInfo[f].adm == currentAdmin.kod_adm)&&
                                (currentRoad==null || globWaysAndStations.stations[i].extraAdminInfo[f].road == currentRoad.kod_dor)
                            ){
                                resultOfFilter = true;
                                break;
                            }
                        }
                        if(resultOfFilter){
                            averX+=globWaysAndStations.stations[i].x;
                            averY+=globWaysAndStations.stations[i].y;
                            count++;
                            var tempDOMDot = document.getElementById(globWaysAndStations.stations[i].id);
                            tempDOMDot.style.display="block";
                            if(tempDOMDot.getAttribute("r")==2){
                                document.getElementById("t"+globWaysAndStations.stations[i].id).style.display="block";
                            }
                        }
                        else {
                            document.getElementById(globWaysAndStations.stations[i].id).style.display="none";
                            document.getElementById("t"+globWaysAndStations.stations[i].id).style.display="none";
                        }

                    }
                    for(var i=0; i<globWaysAndStations.ways.length; i++){
                        if((currentAdmin==null || globWaysAndStations.ways[i].admTid==currentAdmin.kod_adm)&&
                            (currentRoad==null || globWaysAndStations.ways[i].idRoad==currentRoad.kod_dor)){
                            document.getElementById(globWaysAndStations.ways[i].idElem).style.display="block";
                        }
                        else {
                            document.getElementById(globWaysAndStations.ways[i].idElem).style.display="none";
                        }
                    }

                    averX=averX/count;
                    averY=averY/count;
                    moveToPoint(averX,averY,scale,1500);
                }
                reloadAllNavigationTables();
            });
            $("#chooseRoadBtn").click(function() {
                openCloseSelectionOfAdmin("chooseRoad");
            });
            //Событие выбора дирекции
            $("#chooseDerect").click(function (event) {
                var target = event.target;
                if (target.tagName == 'A'){
                    var scale = 2.0;
                    $("#chooseDerectBtn").html(target.innerHTML );
                    openCloseSelectionOfAdmin("chooseDerect");

                    if(target.innerHTML=="Всі"){
                        currentDerect=null;
                        scale =1.0;
                    }
                    else {
                        for (var i = 0; i < currentRoad.derects.length; i++) {
                            if (target.innerHTML == currentRoad.derects[i].name_otd) {
                                currentDerect = currentRoad.derects[i];
                            }
                        }
                    }
                    var averX=0;
                    var averY=0;
                    var count=0;
                    for(var i=0; i<globWaysAndStations.stations.length; i++){
                        //test5

                        var resultOfFilter = false;
                        for(var f=0; f<globWaysAndStations.stations[i].extraAdminInfo.length; f++){
                            if(
                                (currentAdmin==null || globWaysAndStations.stations[i].extraAdminInfo[f].adm == currentAdmin.kod_adm)&&
                                (currentRoad==null || globWaysAndStations.stations[i].extraAdminInfo[f].road == currentRoad.kod_dor)&&
                                (currentDerect==null || globWaysAndStations.stations[i].extraAdminInfo[f].depart == currentDerect.kod_otd)
                            ){
                                resultOfFilter = true;
                                break;
                            }
                        }

                        if(resultOfFilter){
                            averX+=globWaysAndStations.stations[i].x;
                            averY+=globWaysAndStations.stations[i].y;
                            count++;

                            var tempDOMDot = document.getElementById(globWaysAndStations.stations[i].id);
                            tempDOMDot.style.display="block";
                            if(tempDOMDot.getAttribute("r")==2){
                                document.getElementById("t"+globWaysAndStations.stations[i].id).style.display="block";
                            }

                        }
                        else {
                            document.getElementById(globWaysAndStations.stations[i].id).style.display="none";
                            document.getElementById("t"+globWaysAndStations.stations[i].id).style.display="none";
                        }
                    }

                    for(var i=0; i<globWaysAndStations.ways.length; i++){
                        if((currentAdmin==null || globWaysAndStations.ways[i].admTid==currentAdmin.kod_adm)&&
                            (currentRoad==null || globWaysAndStations.ways[i].idRoad==currentRoad.kod_dor)&&
                            (currentDerect==null || globWaysAndStations.ways[i].departTid==currentDerect.kod_otd )){
                            document.getElementById(globWaysAndStations.ways[i].idElem).style.display="block";
                        }
                        else {
                            document.getElementById(globWaysAndStations.ways[i].idElem).style.display="none";
                        }
                    }

                    averX=averX/count;
                    averY=averY/count;
                    moveToPoint(averX,averY,scale,1500);

                    reloadAllNavigationTables();
                }
            });
            $("#chooseDerectBtn").click(function() {
                openCloseSelectionOfAdmin("chooseDerect");
            });
            //событие для сохранение новых координат
            $("#saveNewCordinates").click(function() {
                if(arrOfNewStationsCoordinate.length != 0){
                    console.log(JSON.stringify(arrOfNewStationsCoordinate));
                    updateCoordinates ();
                }

            });
            //Событие включение режиа просмотра
            $("#showPoligon").click(function() {
                viewMode();
            });
            //Событие включение режим редоктирования поездоучастков
            $("#editWays").click(function() {
                editWaysMode()
            });
            //Событие включение режим редоктирования плечей
            $("#editPaths").click(function() {
                editPathMode()
            });
            //Событие включения режима отображения полигона по поездоучастков
            $("#showWaysOnMap").click(function() {
                detailingByWays();
            });
            //Событие включения режима отображения полигона по  елементарным участкам
            $("#showElemWaysOnMap").click(function() {
                detailingByElemWays();

            });
            //События для открытия закрытия внутних вкладок главного меню
            $("#choiceViewBt").click(openCloseEmbeddedMenu);
            $("#choiceFunctionBtn").click(openCloseFunctionMenu);
            $("#limitationOfAreaBtn").click(openCloselimitationAreaMenu);
            $("#openCloseNavMenu").click(openCloseNavMenu);
            // Привязка событий для работы с главным меню
            window.onclick = function(event) {

                var target = event.target;

                //console.log(" menuContext.style.display : " + menuContext.style.display );
                if( menuContext.style.display == "block" &&
                    target != menuContext &&
                    target != openMenuBt &&
                    target !=  choiceViewBt &&
                    target != choiceFunctionBtn&&
                    target != viewFunctionContext&&
                    target.parentNode != viewFunctionContext&&
                    target != viewContext &&
                    target.parentNode != viewContext &&
                    target != limitationOfAreaBtn &&
                    target != limitationOfArea &&
                    target.parentNode != limitationOfArea &&
                    target.parentNode.parentNode != limitationOfArea&&
                    target.parentNode.parentNode.parentNode != limitationOfArea&&
                    target.parentNode.parentNode.parentNode.parentNode != limitationOfArea&&
                    target.parentNode.parentNode.parentNode.parentNode.parentNode != limitationOfArea &&
                    target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode != limitationOfArea){
                    openCloseMenu();
                }

                if (target == modalWarning || target == closeModalWarning) {
                    modalWarning.style.display = "none";
                }
                if (target == closeModalError) {
                    modalError.style.display = "none";
                }
                if (target == modalMassage ||target == closeModalMassage) {
                    modalMassage.style.display = "none";
                }

                if (target == closeModalConfirmDeletionPath1 || target == closeModalConfirmDeletionPath2 ) {
                    modalConfirmDeletionPath.style.display = "none";
                }

                if (target == confirmDeletion) {
                    //alert("Удаляем");
                    modalConfirmDeletionPath.style.display = "none";
                    deletePathFromDB();
                }
            };

            //привязка событий к елементу футора (навигация на футоре)

            $("#FirsStation").click(function() {
                var idSt;
                if(functionOfAplication.editPaths){
                    idSt = currentPathESREndPoints.beginESR;
                }
                if(functionOfAplication.editWays){
                    idSt = currentWayESREndPoints.beginESR;
                }
                searchStationOnMap (idSt);
            });
            $("#LastStation").click(function() {
                var idSt;
                if(functionOfAplication.editPaths){
                    idSt = currentPathESREndPoints.endESR;
                }
                if(functionOfAplication.editWays){
                    idSt = currentWayESREndPoints.endESR;
                }
                searchStationOnMap (idSt);
            });
            $("#currentDepo").click(function() {
                var idDp = currentDepo;
                searchDepoOnMap (idDp);
            });
            //Событие занисения плеча в базу данных
            $("#confirmNewPath").click(function() {

                if(functionOfAplication.editPaths){
                    if(arrWaysIdOfNewPath.length == 0){
                        errorAlert("Ви не обрали жодної поїздодільниці")
                    }else {
                        insertNewPathToDB ();
                    }
                }
                if(functionOfAplication.editWays){
                    if(arrElemWaysIdOfNewWay.length==0){
                        errorAlert("Ви не обрали жодної елементарної дільниці")
                    }
                    else {
                        insertNewWayToDB ();
                    }
                }
            });

            //привязка событий к елементам меню навигации

            //Событие для поиска елементарного участка по названию
            $("#searchElemWays").keyup(searchElemWays);
            //Событие для поиска поиздоучастка по названию
            $("#searchWays").keyup(searchWays);
            //Событие для поиска станции по названию
            $("#searchStations").keyup(searcStations);
            //Событие для поиска плеча по названию
            $("#searchPathes").keyup(searcPathes);
            //Событие для поиска депо по названию
            $("#searchDepos").keyup(searcDepos);
            //Событие для открытия/закрытия меню
            $("#openMenuBtn").click(openCloseMenu);
            //События для переключения между табами
            $("#t1").click(function (event) {
                openTab(event, 'tabPathes')
            });
            $("#t2").click(function (event) {
                openTab(event, 'tabWays')
            });
            $("#t3").click(function (event) {
                openTab(event, 'tabStations')
            });
            $("#t4").click(function (event) {
                openTab(event, 'tabDepos')
            });
            $("#t5").click(function (event) {
                openTab(event, 'tabElemWays')
            });
            //Событие для открытия закрытия меню навигации
            $("#openNav").click(openCloseNavMenu);
            //Событие для поиск елементарных участков на карте
            $("#scroltabElemWays").click(function (event) {

                var target = event.target;
                while (target != this) {

                    if (target.tagName == 'TD' ) {
                        var idElemWay = target.parentNode.childNodes[0].innerHTML;
                        showElemWayOnMap(idElemWay);
                        return;
                    }
                    target = target.parentNode;
                }

            });
            //Событие для поиск станций на карте
            $("#scroltabStations").click(function (event) {

                var target = event.target;
                while (target != this) {

                    if (target.tagName == 'TD' ) {
                        $("#TrElemWaysInfo").remove();
                        var idStation = target.parentNode.childNodes[0].innerHTML;
                        var xStation, yStation;
                        for (var i =0; i<globWaysAndStations.stations.length; i++){
                            if(globWaysAndStations.stations[i].id == idStation){
                                xStation=globWaysAndStations.stations[i].x;
                                yStation=globWaysAndStations.stations[i].y;
                                break;
                            }
                        }
                        console.log("x and y : " + xStation +" "+ yStation)
                        //передвижение
                        moveToPoint(xStation, yStation, 2.8, 1500);
                        //устанавливаем мигание


                        var dot = [];
                        dot.push(document.getElementById(idStation));

                        if(functionOfAplication.editPaths || functionOfAplication.editWays){
                            blinking(dot);
                        }
                        else {
                            cancelPriviosSelection();
                            dot[0].setAttribute('class','selection');
                            target.parentNode.setAttribute('class','w3-red');
                            selectedArrOfDomElem = dot;
                            selectedTrOfTable = target.parentNode;
                        }


                        return;
                    }
                    target = target.parentNode;
                }

            });
            //Событие для поиск поездоучастков на карте
            $("#scroltabWays").click(function (event) {

                var target = event.target;
                while (target != this) {
                    //Закрываем информацию о поездоучастках
                    if(target.getAttribute('id')=="CloseElemWaysInformation"){
                        $("#TrElemWaysInfo").remove();
                        return;
                    }
                    if(target.tagName == 'SPAN'){
                        deleteWayFromDB();
                        return;
                    }
                    if (target.tagName == 'TD' ) {

                        //проверяем выбранали подтаблица
                        if(target.parentNode.parentNode.parentNode.parentNode.tagName == 'TD'){
                            //alert(target.parentNode.childNodes[0].innerHTML);
                            showElemWayOnMap(target.parentNode.childNodes[1].innerHTML);
                            return;
                        }

                        var arrIDWays = [];
                        arrIDWays.push(target.parentNode.childNodes[0].innerHTML);
                        showWaysOnMap(arrIDWays, target.parentNode);

                        $("#TrElemWaysInfo").remove();
                        var innerTableInfo ="";
                        for(var k=0; k<globWaysAndStations.ways.length; k++){
                            if(globWaysAndStations.ways[k].idWay == target.parentNode.childNodes[0].innerHTML)
                                innerTableInfo+=
                                    '<tr>'+
                                    '<td>'+ globWaysAndStations.ways[k].prnum +'</td>'+
                                    '<td>'+ globWaysAndStations.ways[k].idElem +'</td>'+
                                    '<td colspan="3">'+ globWaysAndStations.ways[k].nameWay +'</td>'+
                                    '</tr>'
                        }

                        $(target.parentNode).after(
                            '<tr id="TrElemWaysInfo">'+
                            //'<td ><span id="CloseElemWaysInformation" style="cursor: pointer">&times;</span></td>'+
                            '<td colspan="3">'+
                            '<table class="w3-table w3-striped w3-small">'+
                            '<tr class="w3-teal">'+
                            '<th>#</th>'+
                            '<th>Код елем.діл</th>'+
                            '<th>Назва елем.діл</th>'+
                            '<th><span id="CloseElemWaysInformation" style="cursor: pointer">&times;</span></th>'+
                            '</tr>'+
                            innerTableInfo +
                            '</table>'+
                            '</td>'+
                            '</tr>'
                        );
                        return;
                    }
                    target = target.parentNode;
                }

            });
            //Событие для поиск плечей на карте
            $("#scroltabPathes").click(function (event) {

                var target = event.target;

                if(target.getAttribute('id')== "CloseWaysInformation"){
                    $("#TrWaysInfo").remove();
                    return;
                }

                if(target.tagName == 'SPAN'){
                    idDeletedPath = target.parentNode.parentNode.childNodes[1].innerHTML;
                    DeletedTR = target.parentNode.parentNode;
                    confirmDeletionModal("Вы уверены что хотите удалить плече " + idDeletedPath + " ?");

                    return;
                }

                while (target != this) {
                    if (target.tagName == 'TD' ) {

                        if(target.parentNode.parentNode.parentNode.parentNode.tagName == 'TD'){

                            var arrIDWays1 = [];
                            arrIDWays1.push(target.parentNode.childNodes[1].innerHTML);
                            showWaysOnMap(arrIDWays1);
                            return;
                        }

                        //var TR = target.parentNode; //старая версия

                        if(target.parentNode.getAttribute('id')== "TrWaysInfo") return;

                        var idPath = target.parentNode.childNodes[1].innerHTML;
                        var arrIDWays  = [];
                        for (var i =0; i<globalPathes.length; i++){
                            if(globalPathes[i].idPath==idPath){
                                arrIDWays = globalPathes[i].idOFWays;
                                break;
                            }
                        }

                        //test2
                        $("#TrWaysInfo").remove();
                        var innerTableInfo ="";
                        for(var k=0; k<globalPathes.length; k++){
                            if(globalPathes[k].idPath == idPath)
                                for(var l=0; l<globalPathes[k].idOFWays.length; l++){

                                    var currentNameOfway ="";
                                    for(var m=0; m<globWays.length; m++){
                                        if(globWays[m].tid==globalPathes[k].idOFWays[l]){
                                            currentNameOfway=globWays[m].name;
                                            break;
                                        }
                                    }
                                    innerTableInfo+=
                                        '<tr>'+
                                        '<td>'+ (l+1) +'</td>'+
                                        '<td style="display: none">'+ globalPathes[k].idOFWays[l] +'</td>'+
                                        '<td>'+globalPathes[k].idOFWays[l].toString().substring(3) +'</td>'+
                                        '<td colspan="2">'+  currentNameOfway+'</td>'+
                                        '</tr>'
                                }
                        }

                        $(target.parentNode).after(
                            '<tr id="TrWaysInfo">'+
                            //'<td ><span id="CloseElemWaysInformation" style="cursor: pointer">&times;</span></td>'+
                            '<td colspan="4">'+
                            '<table class="w3-table w3-striped w3-small">'+
                            '<tr class="w3-teal">'+
                            '<th>#</th>'+
                            '<th style="display: none">Повний код поїзд.діл</th>'+
                            '<th>Код поїзд.діл</th>'+
                            '<th>Назва поїзд.діл</th>'+
                            '<th><span id="CloseWaysInformation" style="cursor: pointer">&times;</span></th>'+
                            '</tr>'+
                            innerTableInfo +
                            '</table>'+
                            '</td>'+
                            '</tr>'
                        );

                        var result = getArrayOfDomLinesForSelection(arrIDWays);

                        if(result.arrOfDomElements.length==0){
                            errorAlert("Поездоучастка с TID : " + arrIDWays.join(":") + " не существует ")
                        }

                        else {

                            blinking(result.arrOfDomElements);
                            moveToPoint(result.averageX, result.averageY, 2, 1500);
                            /* старая версия
                             // роверяем выбрано ли депо
                             if(currentDepo!=null){
                             blinking(result.arrOfDomElements);
                             }
                             else {
                             if (TR.className == ' w3-red'){
                             //console.log(TR.className);
                             TR.className = TR.className.replace(" w3-red", "");
                             for(var j = 0; j<result.arrOfDomElements.length; j++){
                             result.arrOfDomElements[j].setAttribute('class', '');
                             }
                             blinking(result.arrOfDomElements);
                             }
                             else {
                             TR.className += " w3-red";
                             for(var j = 0; j<result.arrOfDomElements.length; j++){
                             result.arrOfDomElements[j].setAttribute('class', 'selection2');
                             }

                             }
                             }
                             moveToPoint(result.averageX, result.averageY, 2, 1500);
                             */
                        }
                        return;
                    }
                    target = target.parentNode;
                }

            });
            //Событие для поиск всех плечей на карте с одинаковым дэпо
            $("#scroltabDepos").click(function (event) {

                var target = event.target;
                while (target != this) {
                    if (target.tagName == 'TD' ) {
                        var TR = target.parentNode;
                        var idDepo = target.parentNode.childNodes[0].innerHTML;
                        if(functionOfAplication.editPaths){
                            selectPathesByDepo(TR, idDepo);
                        }
                        else {
                            showDepoOnMap(TR, idDepo);
                        }
                    }
                    return;
                }
                target = target.parentNode;
            });

            //Привязка событий на SVG форме

            $("#svgForm").click(function (event) {
                if (!event.ctrlKey) return;



                var target = event.target;

                while (target != this) {
                    if (target.tagName == 'line') {

                        if(functionOfAplication.editPaths){
                            createNewPathBySelection(target)
                        }
                        if(functionOfAplication.editWays){
                            createNewWay(target);
                        }
                        return;
                    }
                    target = target.parentNode;
                }
            });

            // события для гарячих клавиш

            document.onkeydown = function(e) {
                e = e || window.event;
                if (e.ctrlKey && e.keyCode == 90) {
                    //alert('Ctrl + Z');
                    if(arrWaysIdOfNewPathUserSequence.length!=0 &&arrWaysIdOfNewPath.length!=0){
                        var tempId = arrWaysIdOfNewPathUserSequence.pop();
                        //убираем выделения
                        for(var j = 0; j<globWaysAndStations.ways.length; j++) {
                            if (tempId == globWaysAndStations.ways[j].idWay) {
                                document.getElementById(globWaysAndStations.ways[j].idElem).setAttribute('class', '');
                            }
                        }
                        //удаляем поездоуч. из текущего списка поездоучастка для нового плеча
                        //узнаем с какого конца будем производить удаление
                        if(tempId == arrWaysIdOfNewPath[0]){
                            arrWaysIdOfNewPath.shift();
                            arrESRStationsOfNewPath.shift();
                            currentPathESREndPoints.beginESR = arrESRStationsOfNewPath[0];
                            currentPathNameEndPoints.beginName = getNameOfStationByID(arrESRStationsOfNewPath[0]);
                        } else if(tempId == arrWaysIdOfNewPath[arrWaysIdOfNewPath.length-1]){
                            arrWaysIdOfNewPath.pop();
                            arrESRStationsOfNewPath.pop();
                            currentPathESREndPoints.endESR = arrESRStationsOfNewPath[arrESRStationsOfNewPath.length-1];
                            currentPathNameEndPoints.endName = getNameOfStationByID(arrESRStationsOfNewPath[arrESRStationsOfNewPath.length-1]);
                        }
                        //переписываем поле нового плеча
                        $("#newPath").attr('value', arrWaysIdOfNewPath.join(", "));
                        if(arrWaysIdOfNewPath.length!=0){
                            $("#FirsStation").text("Нач.ст: "+ currentPathNameEndPoints.beginName +" " +currentPathESREndPoints.beginESR).css("display","block");
                            $("#LastStation").text("Кон.ст: "+ currentPathNameEndPoints.endName +" "+ currentPathESREndPoints.endESR).css("display","block");

                        }
                        else {
                            //удаляем все из полей заполнения
                            $("#IdOfNewPath").css("display","none");
                            $("#FirsStation").css("display","none");
                            $("#LastStation").css("display","none");
                        }

                    }

                } else if (e.keyCode == 27){
                    //alert('Esc');
                    cancelSelection();
                }
                return true;
            };

            /*
             Блок вспомогательных функция для манипуляции над главным меню (вызываемые обрабочиком события)
             */

            //функция для открывания и закрывания меню выбора административного участка
            function openCloseSelectionOfAdmin(selectedArea) {
                var x = document.getElementById(selectedArea);
                if(x.className.indexOf("w3-show")==-1){
                    x.className += " w3-show";
                }
                else {
                    x.className = x.className.replace(" w3-show", "");
                }
            }
            //функции для изменения (переключения) режима работы приложения
            function viewMode(){

                if(prevIdDepo){selectPathesByDepo(prevTR, prevIdDepo);}
                cancelSelection();
                cancelPriviosSelection();


                functionOfAplication.view=true;
                functionOfAplication.editPaths=false;
                functionOfAplication.editWays=false;
                $('#showPoligon').prop('checked', true);

                openTabManual(document.getElementById("t2"), "tabWays");

                $('#t4').css("display","block");

                $('#t1').css("display","none");
                $('#t5').css("display","none");

                var x = document.getElementsByClassName("deleteWay");
                for (i = 0; i < x.length; i++) {
                    x[i].style.display = "none";
                }
                $("#divInfoNewPath").css("display","none");
                $("#helper1").html('<h4>Режим перегляду, для навігації використовуйте меню в лівому правому куті</h4>');

            }
            function editWaysMode() {

                if(prevIdDepo){selectPathesByDepo(prevTR, prevIdDepo);}
                cancelPriviosSelection();
                cancelSelection();

                functionOfAplication.view=false;
                functionOfAplication.editPaths=false;
                functionOfAplication.editWays=true;
                $('#editWays').prop('checked', true);

                //отмена предыдуших операций
                openTabManual(document.getElementById("t2"), "tabWays");


                $('#t5').css("display","block");

                $('#t1').css("display","none");
                $('#t4').css("display","none");

                var x = document.getElementsByClassName("deleteWay");
                for (i = 0; i < x.length; i++) {
                    x[i].style.display = "block";
                }

                $("#divIdDepoTitle").css("display","none");
                $("#divIdDepoNumber").css("display","none");
                $("#divNewPathTitle").css("display","block").html("Елем.діл");

                $("#helper1").html('<h4>Режим редогування поїздодільниць, ' +
                    'для формування нової поїздодільниці натисніть CTRL та правою кнопкою миші оберіть елементарні дільниці з яких буде формуватися поїздодільниця</h4>');

                detailingByElemWays();
            }
            function editPathMode(){
                if(prevIdDepo){selectPathesByDepo(prevTR, prevIdDepo);}
                cancelPriviosSelection();
                cancelSelection();

                functionOfAplication.view=false;
                functionOfAplication.editPaths=true;
                functionOfAplication.editWays=false;
                $('#editPaths').prop('checked', true);

                openTabManual(document.getElementById("t2"), "tabWays");

                $('#t1').css("display","block");
                $('#t4').css("display","block");

                $('#t5').css("display","none");

                var x = document.getElementsByClassName("deleteWay");
                for (i = 0; i < x.length; i++) {
                    x[i].style.display = "none";
                }

                $("#divIdDepoTitle").css("display","block");
                $("#divIdDepoNumber").css("display","block");
                $("#divNewPathTitle").css("display","block").html("Поїзд.діл");
                $("#divInfoNewPath").css("display","none");

                $("#helper1").html('<h4>Режим редогування плечей, ' +
                    'для формування нового плеча, оберіть депо до якого воно буде належати, у меню навігації (верхній лівий кут)</h4>');

                detailingByWays();
            }
            //детализация по поездоучасткам
            function detailingByWays() {
                var arrDomDots = document.getElementById('dots').childNodes;
                var arrDomText = document.getElementById('texts').childNodes;
                console.log(arrDomDots.length);
                for(var i =0; i<arrDomDots.length; i++){
                    if (existInArray(globIdEndPointsOfWay, arrDomDots[i].getAttribute('id')) == false) {
                        arrDomDots[i].setAttribute("r", 1);
                        arrDomText[i].style.display = "none";
                    }

                }
                typeOfDetalization.elemWays=false;
                typeOfDetalization.ways=true;
                $('#showWaysOnMap').prop('checked', true);
            }
            //детализация по елементарным участкам
            function detailingByElemWays() {
                var arrDomDots = document.getElementById('dots').childNodes;
                var arrDomText = document.getElementById('texts').childNodes;
                console.log(arrDomDots.length);
                for(var i =0; i<arrDomDots.length; i++){
                    arrDomDots[i].setAttribute("r", 2);
                    if(arrDomDots[i].style.display!="none"){
                        arrDomText[i].style.display = "";
                    }
                }
                typeOfDetalization.elemWays=true;
                typeOfDetalization.ways=false;
                $('#showElemWaysOnMap').prop('checked', true);
            }
            //Функции для открывания / закрывания внутренних вкладок главного меню
            function openCloseEmbeddedMenu() {
                if(viewContext.style.display == "none"){
                    choiceViewBt.className = choiceViewBt.className + " w3-teal";
                    viewContext.style.display = "block";
                }
                else {
                    choiceViewBt.className = choiceViewBt.className.replace(" w3-teal", " ");
                    viewContext.style.display = "none";
                }
            }
            function openCloseFunctionMenu() {
                if(viewFunctionContext.style.display == "none"){
                    choiceFunctionBtn.className = choiceFunctionBtn.className + " w3-teal";
                    viewFunctionContext.style.display = "block";
                }
                else {
                    choiceFunctionBtn.className = choiceFunctionBtn.className.replace(" w3-teal", " ");
                    viewFunctionContext.style.display = "none";
                }
            }
            function openCloselimitationAreaMenu() {
                if(limitationOfArea.style.display == "none"){
                    limitationOfAreaBtn.className = limitationOfAreaBtn.className + " w3-teal";
                    limitationOfArea.style.display = "block";
                }
                else {
                    limitationOfAreaBtn.className = limitationOfAreaBtn.className.replace(" w3-teal", " ");
                    limitationOfArea.style.display = "none";
                }
            }


            /*
             Блок вспомогательных функций для манипуляции над меню навигации
             */

            function searchWays() {
                $("#TrElemWaysInfo").remove();
                var input, filter, table, tr, td, td2, i;
                input = document.getElementById("searchWays");
                filter = input.value.toUpperCase();
                table = document.getElementById("waysTable");
                tr = table.getElementsByTagName("tr");
                for (i = 0; i < tr.length; i++) {
                    td = tr[i].getElementsByTagName("td")[1];
                    td2 = tr[i].getElementsByTagName("td")[2];
                    if (td) {
                        if (td.innerHTML.toUpperCase().indexOf(filter) == 0 || td2.innerHTML.toUpperCase().indexOf(filter) == 0) {
                            tr[i].style.display = "";
                        } else {
                            tr[i].style.display = "none";
                        }
                    }
                }
            }
            function searchElemWays() {
                var input, filter, table, tr, td, td2, i;
                input = document.getElementById("searchElemWays");
                filter = input.value.toUpperCase();
                table = document.getElementById("ElemWaysTable");
                tr = table.getElementsByTagName("tr");
                for (i = 0; i < tr.length; i++) {
                    td = tr[i].getElementsByTagName("td")[0];
                    td2 = tr[i].getElementsByTagName("td")[1];
                    if (td) {
                        if (td.innerHTML.toUpperCase().indexOf(filter) == 0 || td2.innerHTML.toUpperCase().indexOf(filter) == 0) {
                            tr[i].style.display = "";
                        } else {
                            tr[i].style.display = "none";
                        }
                    }
                }
            }
            function searcStations() {
                var input, filter, table, tr, td, td2, i;
                input = document.getElementById("searchStations");
                filter = input.value.toUpperCase();
                table = document.getElementById("stationTable");
                tr = table.getElementsByTagName("tr");
                for (i = 0; i < tr.length; i++) {
                    td = tr[i].getElementsByTagName("td")[0];
                    td2 = tr[i].getElementsByTagName("td")[1];
                    if (td) {
                        if (td.innerHTML.toUpperCase().indexOf(filter) == 0 || td2.innerHTML.toUpperCase().indexOf(filter) == 0) {
                            tr[i].style.display = "";
                        } else {
                            tr[i].style.display = "none";
                        }
                    }
                }
            }
            function searcPathes() {
                //alert("searchPathes");
                $("#TrWaysInfo").remove();
                var input, filter, table, tr, td, td2, td3, i;
                input = document.getElementById("searchPathes");
                filter = input.value.toUpperCase();
                table = document.getElementById("pathesTable");
                tr = table.getElementsByTagName("tr");
                //alert(filter);
                for (i = 0; i < tr.length; i++) {
                    td = tr[i].getElementsByTagName("td")[0];
                    td2 = tr[i].getElementsByTagName("td")[1];
                    td3 = tr[i].getElementsByTagName("td")[2];
                    if (td) {
                        if (td.innerHTML.toUpperCase().indexOf(filter) == 0 || td2.innerHTML.toUpperCase().indexOf(filter) == 0 || td3.innerHTML.toUpperCase().indexOf(filter) == 0) {
                            tr[i].style.display = "";
                        } else {
                            tr[i].style.display = "none";
                        }
                    }
                }
            }
            function searcDepos() {
                var input, filter, table, tr, td, td2, i;
                input = document.getElementById("searchDepos");
                filter = input.value.toUpperCase();
                table = document.getElementById("deposTable");
                tr = table.getElementsByTagName("tr");
                for (i = 0; i < tr.length; i++) {
                    td = tr[i].getElementsByTagName("td")[0];
                    td2 = tr[i].getElementsByTagName("td")[1];
                    if (td) {
                        if (td.innerHTML.toUpperCase().indexOf(filter) == 0 || td2.innerHTML.toUpperCase().indexOf(filter) > -1 ) {
                            tr[i].style.display = "";
                        } else {
                            tr[i].style.display = "none";
                        }
                    }
                }
            }
            function openCloseMenu() {

                if(menuContext.style.display == "none"){
                    openMenuBt.className = openMenuBt.className.replace(" w3-teal", " w3-light-grey");
                    menuContext.style.display = "block";
                }
                else {
                    openMenuBt.className = openMenuBt.className.replace(" w3-light-grey", " w3-teal");
                    menuContext.style.display = "none";
                }
            }
            //функция для открытия и закрытия таба
            function openTab(evt, tabName) {
                var i, x, tablinks;
                x = document.getElementsByClassName("tab");
                for (i = 0; i < x.length; i++) {
                    x[i].style.display = "none";
                }
                tablinks = document.getElementsByClassName("tablink");
                for (i = 0; i < x.length; i++) {
                    tablinks[i].className = tablinks[i].className.replace(" w3-light-grey", "");
                }
                document.getElementById(tabName).style.display = "block";
                evt.currentTarget.className += " w3-light-grey";
            }
            function openTabManual(tabDomElem, tabName) {
                var i, x, tablinks;
                x = document.getElementsByClassName("tab");
                for (i = 0; i < x.length; i++) {
                    x[i].style.display = "none";
                }
                tablinks = document.getElementsByClassName("tablink");
                for (i = 0; i < x.length; i++) {
                    tablinks[i].className = tablinks[i].className.replace(" w3-light-grey", "");
                }
                document.getElementById(tabName).style.display = "block";
                tabDomElem.className += " w3-light-grey";
            }
            //функция для открыти/закрытия меню навигации
            function openCloseNavMenu() {
                if(document.getElementById("mySidenav").style.display == "block"){
                    document.getElementById("main").style.marginRight = "0%";
                    document.getElementById("mySidenav").style.display = "none";
                    document.getElementById("openCloseNavMenu").innerHTML = "Открыть меню навигации";
                }
                else{
                    document.getElementById("main").style.marginRight = "430px";
                    document.getElementById("mySidenav").style.width = "430px";
                    document.getElementById("mySidenav").style.display = "block";
                    document.getElementById("openCloseNavMenu").innerHTML = "Закрыть меню навигации";
                }
            }
            // функция для нахождения елементарного участка на карте
            function showElemWayOnMap(idElemWay) {
                var xStation=0, yStation=0;
                console.log("idElemWay: " + idElemWay);
                for (var i =0; i<globWaysAndStations.ways.length; i++){
                    if(globWaysAndStations.ways[i].idElem == idElemWay){

                        xStation=(globWaysAndStations.ways[i].x1+globWaysAndStations.ways[i].x2)/2;
                        yStation=(globWaysAndStations.ways[i].y1 + globWaysAndStations.ways[i].y1)/2;
                        break;
                    }
                }

                console.log("x and y : " + xStation +" "+ yStation)
                if(xStation==0 &&  yStation==0) {
                    return;
                }
                //передвижение
                moveToPoint(xStation, yStation, 2.8, 1500);
                //устанавливаем мигание

                var line = [];
                line.push(document.getElementById(idElemWay))
                blinking(line);
            }
            //функция для нахождения поездоучастка на карте
            function showWaysOnMap(arrIDWays, tr) {
                var result = getArrayOfDomLinesForSelection(arrIDWays);
                if(result.averageX ==-1 && result.averageY==-1) return;
                moveToPoint(result.averageX, result.averageY, 2, 1500);
                if(functionOfAplication.editPaths || functionOfAplication.editWays){
                    blinking(result.arrOfDomElements);
                }
                else {
                    console.log("enter showWaysOnMapFunction");

                    cancelPriviosSelection();

                    for(var d=0; d<result.arrOfDomElements.length; d++){
                        result.arrOfDomElements[d].setAttribute('class','selection');
                    }
                    tr.setAttribute('class','w3-red');
                    selectedArrOfDomElem=result.arrOfDomElements;
                    selectedTrOfTable = tr;
                }
            }
            //функция для нахождения депо на карте
            function showDepoOnMap(TR, idDepo){
                //Находим ID всех станций которые включают в себя заданное депо
                var arrStations = [];
                for (var k = 0; k< globalDepos.length; k++){
                    if(globalDepos[k].idDepo == idDepo){
                        arrStations = globalDepos[k].idOfStations;
                        break;
                    }
                }

                //находим усредненные координаты всех станций включенных в депо
                var xStation=0,
                    yStation=0,
                    counter = 0;
                var arrDomStation = [];
                for(var l = 0; l<arrStations.length; l++ ){
                    var idStation = arrStations[l];
                    for (var i =0; i<globWaysAndStations.stations.length; i++){
                        if(globWaysAndStations.stations[i].id == idStation){
                            xStation+=globWaysAndStations.stations[i].x;
                            yStation+=globWaysAndStations.stations[i].y;
                            counter++;
                            //break;
                        }
                    }
                    arrDomStation.push(document.getElementById(idStation))
                }
                xStation = xStation/counter;
                yStation = yStation/counter;

                if(counter == 0){
                    errorAlert("Депо " + idDepo + " яке включає в себе станції : " +  arrStations.join(" ; ") + " не існує на карті!")
                }
                else {
                    //перемещаем карту на место нового депо
                    moveToPoint(xStation, yStation, 2.8, 1500);

                    cancelPriviosSelection();

                    for(var d=0; d<arrDomStation.length; d++){
                        arrDomStation[d].setAttribute('class','selection');
                    }
                    TR.setAttribute('class','w3-red');
                    selectedArrOfDomElem = arrDomStation;
                    selectedTrOfTable = TR;
                }
            }
            //функция для выделения всех плечей по заданному депо
            function selectPathesByDepo(TR, idDepo) {
                var arrWays = [];
                var arrPathes = [];
                //Заполняем массив поездоучастков и плечей
                for (var i =0; i< globalPathes.length; i++) {
                    if(globalPathes[i].idDepo == idDepo) {
                        arrPathes.push(globalPathes[i].idPath)
                        for (var j = 0; j<globalPathes[i].idOFWays.length; j++) {
                            arrWays.push(globalPathes[i].idOFWays[j]);
                        }

                    }
                }
                //Находим ID всех станций которые включают в себя заданное депо
                var arrStations = [];
                for (var k = 0; k< globalDepos.length; k++){
                    if(globalDepos[k].idDepo == idDepo){
                        arrStations = globalDepos[k].idOfStations;
                        break;
                    }

                }

                //находим усредненные координаты всех станций включенных в депо
                var xStation=0,
                    yStation=0,
                    counter = 0;
                var arrDomStation = [];
                for(var l = 0; l<arrStations.length; l++ ){
                    var idStation = arrStations[l];
                    for (var i =0; i<globWaysAndStations.stations.length; i++){
                        if(globWaysAndStations.stations[i].id == idStation){
                            xStation+=globWaysAndStations.stations[i].x;
                            yStation+=globWaysAndStations.stations[i].y;
                            counter++;
                            //break;
                        }
                    }
                    arrDomStation.push(document.getElementById(idStation))
                }
                xStation = xStation/counter;
                yStation = yStation/counter;

                //находим на карте все елементарные участки которые включает в себя заданное депо
                var result = getArrayOfDomLinesForSelection(arrWays);

                if(counter == 0){
                    errorAlert("Депо " + idDepo + " яке включає в себе станції : " +  arrStations.join(" ; ") + " не існує на карті!")
                }
                else {

                    var table = document.getElementById("pathesTable");
                    var tr = table.getElementsByTagName("tr");

                    // если депо уже выделенно
                    if (TR.className == ' w3-red'){
                        //убираем крассное веделение на депо
                        TR.className = TR.className.replace(" w3-red", "");
                        //убераем выделение на карте
                        for(var j = 0; j<result.arrOfDomElements.length; j++){
                            result.arrOfDomElements[j].setAttribute('class', '');
                        }
                        //убираем выдиления на плечах во вкладки "плечи"
                        for (i = 0; i < tr.length; i++) {
                            var td = tr[i].getElementsByTagName("td")[0];
                            if (td) {
                                if (td.innerHTML == idDepo) {
                                    //tr[i].setAttribute('bgcolor', '')
                                    tr[i].className = tr[i].className.replace(" w3-red", "");
                                }
                            }
                        }

                        //обнуляем переменные
                        currentDepo = null;
                        prevTR = null;
                        prevIdDepo = null;
                        prevArrOfDomElem.splice(0, prevArrOfDomElem.length);

                    }
                    // если дэпо не выделенно
                    else {
                        if(result.arrOfDomElements.length == 0 ){
                            warningAlert("Депо " + idDepo + " не має паливних плечей ")
                        }

                        //убираем выделения с предыдущей операции если оно существует
                        if(prevTR !=null && prevIdDepo != null){
                            //убираем крассное веделение на депо
                            prevTR.className = prevTR.className.replace(" w3-red", "");
                            //убераем выделение на карте
                            for(var j = 0; j<prevArrOfDomElem.length; j++){
                                prevArrOfDomElem[j].setAttribute('class', '');
                            }
                            //убираем выдиления на плечах во вкладки "плечи"
                            for (i = 0; i < tr.length; i++) {
                                var td = tr[i].getElementsByTagName("td")[0];
                                if (td) {
                                    if (td.innerHTML == prevIdDepo) {
                                        //tr[i].setAttribute('bgcolor', '')
                                        tr[i].className = tr[i].className.replace(" w3-red", "");
                                    }
                                }
                            }
                        }

                        //Устанавливаем цвет дэпо в крассный цвет
                        TR.className += " w3-red";
                        //Выделяем плечи на карте
                        for(var j = 0; j<result.arrOfDomElements.length; j++){
                            result.arrOfDomElements[j].setAttribute('class', 'selection2');

                        }
                        console.log("Size of arrLines = " + result.arrOfDomElements.length);
                        // выделяем плечи во вкладке "плечи"
                        for (i = 0; i < tr.length; i++) {
                            var td = tr[i].getElementsByTagName("td")[0];
                            if (td) {
                                if (td.innerHTML == idDepo) {
                                    //tr[i].setAttribute('bgcolor', 'red')
                                    tr[i].className += " w3-red";
                                }
                            }
                        }
                        // устанавливаем значение текущего депо
                        currentDepo = idDepo;


                        //присвоение переменным с префиксом "prev" текушего значаения
                        prevTR = TR;
                        prevIdDepo = idDepo;
                        prevArrOfDomElem = result.arrOfDomElements;
                    }

                    //перемещаем карту на место нового депо
                    moveToPoint(xStation, yStation, 2.8, 1500);
                    blinking(arrDomStation);
                    //console.log(currentDepo);
                    //заполняем поле текущего депо
                    $("#currentDepo").text( currentDepo );
                    // отмена выдилений
                    cancelSelection();

                    if(currentDepo==null){
                        $("#divInfoNewPath").css("display","none");
                        $("#helper1").css("display","block");
                    }
                    else {
                        $("#divInfoNewPath").css("display","block");
                        $("#helper1").css("display","none");
                    }

                }
            }
            //Функция для поиска станции на карте
            function searchStationOnMap (idStation){
                var xStation, yStation;
                for (var i =0; i<globWaysAndStations.stations.length; i++){
                    if(globWaysAndStations.stations[i].id == idStation){
                        xStation=globWaysAndStations.stations[i].x;
                        yStation=globWaysAndStations.stations[i].y;
                        break;
                    }
                }
                //передвижение
                moveToPoint(xStation, yStation, 2.8, 1500);
                //устанавливаем мигание
                var dot = [];
                dot.push(document.getElementById(idStation))
                blinking(dot);
            }
            //функция для поиска депо на карте
            function searchDepoOnMap (idDepo){
                var arrStations = [];
                for (var k = 0; k< globalDepos.length; k++){
                    if(globalDepos[k].idDepo == idDepo){
                        arrStations = globalDepos[k].idOfStations;
                        break;
                    }

                }

                var xStation=0,
                    yStation=0,
                    counter = 0;
                var arrDomStation = [];
                for(var l = 0; l<arrStations.length; l++ ){
                    var idStation = arrStations[l];
                    for (var i =0; i<globWaysAndStations.stations.length; i++){
                        if(globWaysAndStations.stations[i].id == idStation){
                            xStation+=globWaysAndStations.stations[i].x;
                            yStation+=globWaysAndStations.stations[i].y;
                            counter++;
                            //break;
                        }
                    }
                    arrDomStation.push(document.getElementById(idStation))
                }
                xStation = xStation/counter;
                yStation = yStation/counter;

                moveToPoint(xStation, yStation, 2.8, 1500);
                blinking(arrDomStation);
            }
            //функция для отмена веделения путей
            function cancelSelection(){
                //удаляем все из полей заполнения
                $("#newPath").attr('value', "");
                $("#IdOfNewPath").css("display","none");
                $("#FirsStation").css("display","none");
                $("#LastStation").css("display","none");
                //отмена выделений на карте
                for(var i=0; i<arrWaysIdOfNewPath.length; i++){
                    var tempId = arrWaysIdOfNewPath[i];
                    for(var j = 0; j<globWaysAndStations.ways.length; j++){
                        if(tempId==globWaysAndStations.ways[j].idWay){
                            document.getElementById(globWaysAndStations.ways[j].idElem).setAttribute('class', '');
                        }
                    }
                }

                for(var i=0; i<arrElemWaysIdOfNewWay.length; i++){
                    console.log(arrElemWaysIdOfNewWay[i]);
                    document.getElementById(arrElemWaysIdOfNewWay[i]).setAttribute('class', '');
                }
                arrWaysIdOfNewPath.splice(0, arrWaysIdOfNewPath.length);
                arrElemWaysIdOfNewWay.splice(0, arrElemWaysIdOfNewWay.length);

                if(functionOfAplication.editWays){
                    $("#helper1").css("display","block");
                    $("#IdOfNewPath").css("display","none");
                }

            }
            function cancelPriviosSelection() {
                if(selectedArrOfDomElem.length){
                    for(var s=0; s<selectedArrOfDomElem.length; s++){
                        selectedArrOfDomElem[s].setAttribute('class','');
                    }
                    selectedArrOfDomElem.splice(0,selectedArrOfDomElem.length);
                    selectedTrOfTable.setAttribute('class','');
                }
                $("#TrElemWaysInfo").remove();
                $("#TrWaysInfo").remove();

            }
            // функция для перерисовки таблици елементарных участков
            function reloadElemWaysTable() {
                $("#ElemWaysTable").remove();
                $('#scroltabElemWays').append(
                    '<table id="ElemWaysTable" class="w3-table-all w3-hoverable">'+
                    '<thead>'+
                    '<tr class="w3-teal">'+
                    '<th>Код</th>'+
                    '<th>Назва</th>'+
                    '</tr>'+
                    '</thead>'+
                    '</table>'
                );

                console.log(currentAdmin);
                console.log(currentRoad);
                console.log(currentDerect);

                for (var j=0; j< globWaysAndStations.ways.length; j++){

                    //console.log(globWays[j]);

                    if(currentAdmin ==null || globWaysAndStations.ways[j].admTid == currentAdmin.kod_adm ){
                        if(currentRoad ==null || globWaysAndStations.ways[j].idRoad == currentRoad.kod_dor ){
                            if(currentDerect==null || globWaysAndStations.ways[j].departTid == currentDerect.kod_otd){
                                var tempTid = globWaysAndStations.ways[j].idElem.toString();
                                $('#ElemWaysTable').append(
                                    '<tr>'+
                                    '<td >'+ globWaysAndStations.ways[j].idElem +'</td>'+
                                    '<td>'+ globWaysAndStations.ways[j].nameWay +'</td>'+
                                    '</tr>'
                                );
                                //console.log(" Yes " + globWays[j].tid +globWays[j].name );

                            }
                        }
                    }
                }
            }
            // функция для перерисовки таблици станции
            function reloadStationsTable() {
                $("#stationTable").remove();
                $('#scroltabStations').append(
                    '<table id="stationTable" class="w3-table-all w3-hoverable">'+
                    '<thead>'+
                    '<tr class="w3-teal">'+
                    '<th>Номер</th>'+
                    '<th>Назва</th>'+
                    '</tr>'+
                    '</thead>'+
                    '</table>'
                );

                for (var j=0; j< globWaysAndStations.stations.length; j++){

                    if(currentAdmin ==null || globWaysAndStations.stations[j].admTid == currentAdmin.kod_adm ){
                        if(currentRoad ==null || globWaysAndStations.stations[j].idRoad == currentRoad.kod_dor ){
                            if(currentDerect==null || globWaysAndStations.stations[j].departTid == currentDerect.kod_otd){
                                $('#stationTable').append(
                                    '<tr>'+
                                    '<td>'+ globWaysAndStations.stations[j].id +'</td>'+
                                    '<td>'+ globWaysAndStations.stations[j].title +'</td>'+
                                    '</tr>'

                                );
                                //console.log(tempAdmin +" "+ tempRoad +" " + tempDepart + " Yes " + globWaysAndStations.stations[j].title + globWaysAndStations.stations[j].id );

                            }
                        }
                    }

                }
            }
            // функция для перерисовки таблици поездоучастков
            function reloadWaysTable() {
                $("#waysTable").remove();
                $('#scroltabWays').append(
                    '<table id="waysTable" class="w3-table-all w3-hoverable">'+
                    '<thead>'+
                    '<tr class="w3-teal">'+
                    '<th style="display: none">Повний код</th>'+
                    '<th>Код</th>'+
                    '<th>Назва</th>'+
                    '<th ></th>'+
                    '</tr>'+
                    '</thead>'+
                    '</table>'
                );

                for (var j=0; j< globWays.length; j++){

                    //console.log(globWays[j]);
                    if(currentAdmin ==null || globWays[j].admTid == currentAdmin.kod_adm ){
                        if(currentRoad ==null || globWays[j].idRoad == currentRoad.kod_dor ){
                            if(currentDerect==null || globWays[j].departTid == currentDerect.kod_otd){
                                var showDeleteBtn = "none";
                                if(functionOfAplication.editWays) {showDeleteBtn = "block"}
                                var tempTid = globWays[j].tid.toString();
                                $('#waysTable').append(
                                    '<tr>'+
                                    '<td style="display: none">'+ globWays[j].tid +'</td>'+
                                    '<td>'+ tempTid.substring(tempTid.length-3) +'</td>'+
                                    '<td>'+ globWays[j].name +'</td>'+
                                    '<td><span class="w3-closebtn deleteWay" style="display: '+showDeleteBtn+'">&times;</span></td>'+
                                    '</tr>'
                                );

                            }
                        }
                    }
                }
            }
            // функция для перерисовки таблици депо
            function reloadDeposTable() {
                $("#deposTable").remove();
                $('#scroltabDepos').append(
                    '<table id="deposTable" class="w3-table-all w3-hoverable">'+
                    '<thead>'+
                    '<tr class="w3-teal">'+
                    '<th>Код</th>'+
                    '<th>Назва</th>'+
                    '</tr>'+
                    '</thead>'+
                    '</table>'
                );
                for (var j=0; j< globalDepos.length; j++){

                    if(currentAdmin ==null || globalDepos[j].admTid == currentAdmin.kod_adm ){
                        if(currentRoad ==null || globalDepos[j].idRoad == currentRoad.kod_dor ){
                            if(currentDerect==null || globalDepos[j].departTid == currentDerect.kod_otd){
                                $('#deposTable').append(
                                    '<tr >'+
                                    '<td >'+ globalDepos[j].idDepo +'</td>'+
                                    '<td >'+ globalDepos[j].nameDepo +'</td>'+
                                    '</tr>'
                                );
                                //console.log(" Yes " + globWays[j].tid +globWays[j].name );

                            }
                        }
                    }

                }
            }
            // функция для перерисовки таблици плечей
            function reloadPathesTable() {

                $("#pathesTable").remove();
                $('#scroltabPathes').append(
                    '<table id="pathesTable" class="w3-table-all w3-hoverable">'+
                    '<thead>'+
                    '<tr class="w3-teal">'+
                    '<th >Депо</th>'+
                    '<th >Код</th>'+
                    '<th >Назва</th>'+
                    '<th ></th>'+
                    '</tr>'+
                    '</thead>'+
                    '</table>'
                );
                for (var j=0; j< globalPathes.length; j++){

                    if(currentAdmin ==null || globalPathes[j].admTid == currentAdmin.kod_adm ){
                        if(currentRoad ==null || globalPathes[j].idRoad == currentRoad.kod_dor ){
                            if(currentDerect==null || globalPathes[j].departTid == currentDerect.kod_otd){
                                $('#pathesTable').append(
                                    '<tr>'+
                                    '<td>'+ globalPathes[j].idDepo +'</td>'+
                                    '<td>'+ globalPathes[j].idPath +'</td>'+
                                    '<td>'+ globalPathes[j].nameBeg + "-" +  globalPathes[j].nameEnd +'</td>'+
                                    '<td><span class="w3-closebtn">&times;</span></td>'+
                                    '</tr>'
                                );
                                //console.log(" Yes " + globWays[j].tid +globWays[j].name );

                            }
                        }
                    }
                }

                if(currentDepo!=null){
                    //выделение плеч по депо
                    var tempPrevTD = prevTR, tempCurrentDepo = currentDepo;
                    selectPathesByDepo(prevTR, currentDepo);
                    selectPathesByDepo(tempPrevTD, tempCurrentDepo);
                }
            }
            // функция для перерисовки всех таблиц навигациионного меню
            function reloadAllNavigationTables() {
                reloadStationsTable();
                reloadElemWaysTable();
                reloadWaysTable();
                reloadDeposTable();
                reloadPathesTable();
            }

            /*
             Блок вспомогательных функций для работы с графикой
             */

            //функция для определения новых координат перемешения
            function moveToPoint(xPoint, yPoint, scale, speed) {

                var divSVG = document.getElementById('div-svg-form');

                console.log( divSVG.clientWidth + " " + divSVG.clientHeight );

                var target_zoom =scale,
                    center = [divSVG.clientWidth / 2, divSVG.clientHeight / 2],
                    translate0 = [],
                    l = [],
                    view = {x: center[0]-xPoint, y: center[1]-yPoint, k: 1};

                translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
                view.k = target_zoom;
                l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

                view.x += center[0] - l[0];
                view.y += center[1] - l[1];

                interpolateZoom([view.x, view.y], view.k, speed);
            }
            //функция для плавного перемещения
            function interpolateZoom (translate, scale, speed) {
                if(speed===undefined){speed=350}
                var self = this;
                return d3.transition().duration(speed).tween("zoom", function () {
                    var iTranslate = d3.interpolate(zoom.translate(), translate),
                        iScale = d3.interpolate(zoom.scale(), scale);
                    return function (t) {
                        zoom
                            .scale(iScale(t))
                            .translate(iTranslate(t));
                        zoomed();
                    };
                });
            }
            //функция для зума
            function zoomed() {
                container.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
            }
            //функция для перемешения точек
            function dragstarted(d) {
                d3.event.sourceEvent.stopPropagation();
                d3.select(this).classed("dragging", true);

                // нахождение id лементарных участвков которые нужно двигать
                idOfDragedStation = d3.select(this).attr("id");
                for(var i =0; i<globWaysAndStations.ways.length; i++){
                    if( globWaysAndStations.ways[i].idFSt==idOfDragedStation || globWaysAndStations.ways[i].idLSt==idOfDragedStation ) {
                        arrOfDraggetElem.push(globWaysAndStations.ways[i].idElem);
                    }
                }

            }
            function dragged(d) {
                //перетаскиваем станцию
                d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
                //перетаскиваем название
                var drugedName = document.getElementById("t" + idOfDragedStation);
                drugedName.setAttribute('x', (d3.event.x + 2));
                drugedName.setAttribute('y', (d3.event.y - 2));
                //перетаскиваем пути
                for(var i = 0; i<arrOfDraggetElem.length; i++){
                    var tempElem = document.getElementById(arrOfDraggetElem[i]);
                    if(tempElem.getAttribute("idFSt")==idOfDragedStation){
                        tempElem.setAttribute('x1', d3.event.x);
                        tempElem.setAttribute('y1', d3.event.y);
                    }
                    else {
                        tempElem.setAttribute('x2', d3.event.x);
                        tempElem.setAttribute('y2', d3.event.y);
                    }
                }

            }
            function dragended(d) {
                d3.select(this).classed("dragging", false);
                idOfDragedStation=-1;
                arrOfDraggetElem.splice(0, arrOfDraggetElem.length);

                // получаем новые координаты
                var idOfDragenSt = d3.select(this).attr("id");
                var xDragetSt = d3.select(this).attr("cx");
                var yDragetSt = d3.select(this).attr("cy");
                xDragetSt = Math.round(xDragetSt * 100) / 100;
                yDragetSt = Math.round(yDragetSt * 100) / 100;

                //проверяем есть ли уже в массиве такая точка
                var positionInArr = -1;
                for(var i =0; i< arrOfNewStationsCoordinate.length ; i++){
                    if(arrOfNewStationsCoordinate[i].id == idOfDragenSt){
                        positionInArr = i;
                        break;
                    }
                }
                //если такой точки нет, заносим в массив
                if(positionInArr == -1){
                    arrOfNewStationsCoordinate.push({"id": idOfDragenSt, "x": xDragetSt, "y": yDragetSt});
                } else {
                    arrOfNewStationsCoordinate[positionInArr].x = xDragetSt;
                    arrOfNewStationsCoordinate[positionInArr].y = yDragetSt;
                }

                $('#saveNewCordinates').css("display","block");

                //console.log(" idOfDragenSt : " + idOfDragenSt + " x :" + xDragetSt + " y :" + yDragetSt);
            }
            //функция формирования нового поездоучастка
            function createNewWay(target){
                if (target.getAttribute('class') == 'selection2'){
                    errorAlert("Вы не можете выбрать этот поездоучасток, так как он уже включен в другое плече");
                    return;
                }
                var endESRPointsOfElemWay= {};
                var idOfElemWay = target.getAttribute('id');
                //alert(idOfElemWay);
                var haveRights =false;
                //находим начальные и конечные станции текущего елементарного участка
                for(var i =0; i< globWaysAndStations.ways.length; i++){
                    if(globWaysAndStations.ways[i].idElem==idOfElemWay){
                        endESRPointsOfElemWay = {beginESR: globWaysAndStations.ways[i].idFSt, endESR: globWaysAndStations.ways[i].idLSt};
                        if(currentAdmin ==null || globWaysAndStations.ways[i].admTid == currentAdmin.kod_adm ){
                            if(currentRoad ==null || globWaysAndStations.ways[i].idRoad == currentRoad.kod_dor ){
                                if(currentDerect==null || globWaysAndStations.ways[i].departTid == currentDerect.kod_otd){
                                    haveRights =true;
                                }
                            }
                        }
                        break;
                    }

                }

                if(haveRights ==false) {
                    errorAlert("Елементарні дільниці належать до різних адміністративних областей");
                    return;
                }

                console.log("End points of current elem way");
                console.log(endESRPointsOfElemWay);
                console.log("End points of current way");
                console.log(currentWayESREndPoints.endESR);

                //проверка являеться ли текущий поездоучасток смежным с предыдущими
                if(arrElemWaysIdOfNewWay.length==0
                    ||
                    (arrElemWaysIdOfNewWay.length!=0 &&
                        (
                            endESRPointsOfElemWay.beginESR == currentWayESREndPoints.endESR ||
                            endESRPointsOfElemWay.endESR == currentWayESREndPoints.beginESR ||
                            endESRPointsOfElemWay.endESR == currentWayESREndPoints.endESR ||
                            endESRPointsOfElemWay.beginESR == currentWayESREndPoints.beginESR
                        )
                    )
                ) {

                    //проверяем выделе ли уже данный элементарный участок
                    if (target.getAttribute('class') == 'selection') {
                        document.getElementById(idOfElemWay).setAttribute('class', '')
                        //узнаем с какого конца будем производить удаление
                        if(idOfElemWay == arrElemWaysIdOfNewWay[0]){
                            arrElemWaysIdOfNewWay.shift();
                            arrESRStationsOfNewWay.shift();
                            currentWayESREndPoints.beginESR = arrESRStationsOfNewWay[0];
                            currentWayNameEndPoints.beginName = getNameOfStationByID(arrESRStationsOfNewWay[0]);
                        } else if(idOfElemWay == arrElemWaysIdOfNewWay[arrElemWaysIdOfNewWay.length-1]){
                            arrElemWaysIdOfNewWay.pop();
                            arrESRStationsOfNewWay.pop();
                            currentWayESREndPoints.endESR = arrESRStationsOfNewWay[arrESRStationsOfNewWay.length-1];
                            currentWayNameEndPoints.endName = getNameOfStationByID(arrESRStationsOfNewWay[arrESRStationsOfNewWay.length-1]);
                        }
                        // удаляем из массива для юзера
                        for(var j = 0; j<arrElemWaysIdOfNewWay.length; j++) {
                            if(arrWaysIdOfNewWayUserSequence[j]==idOfElemWay) {
                                arrWaysIdOfNewWayUserSequence.splice(j, 1);
                            }
                        }

                    }
                    else {
                        document.getElementById(idOfElemWay).setAttribute('class', 'selection')
                        //узнаем как разположить новый путь
                        if(arrElemWaysIdOfNewWay.length==0){
                            arrElemWaysIdOfNewWay.push(idOfElemWay);
                            currentWayESREndPoints.beginESR = endESRPointsOfElemWay.beginESR;
                            currentWayESREndPoints.endESR = endESRPointsOfElemWay.endESR;
                            currentWayNameEndPoints.beginName = getNameOfStationByID(currentWayESREndPoints.beginESR);
                            currentWayNameEndPoints.endName = getNameOfStationByID(currentWayESREndPoints.endESR);
                            arrESRStationsOfNewWay.push(currentWayESREndPoints.beginESR);
                            arrESRStationsOfNewWay.push(currentWayESREndPoints.endESR);

                        } else if(currentWayESREndPoints.endESR==endESRPointsOfElemWay.endESR){
                            arrElemWaysIdOfNewWay.push(idOfElemWay);
                            currentWayESREndPoints.endESR = endESRPointsOfElemWay.beginESR;
                            currentWayNameEndPoints.endName = getNameOfStationByID(currentWayESREndPoints.endESR);
                            arrESRStationsOfNewWay.push(currentWayESREndPoints.endESR);

                        } else if(currentWayESREndPoints.endESR==endESRPointsOfElemWay.beginESR){
                            arrElemWaysIdOfNewWay.push(idOfElemWay);
                            currentWayESREndPoints.endESR = endESRPointsOfElemWay.endESR;
                            currentWayNameEndPoints.endName = getNameOfStationByID(currentWayESREndPoints.endESR);
                            arrESRStationsOfNewWay.push(currentWayESREndPoints.endESR);

                        }else if(currentWayESREndPoints.beginESR==endESRPointsOfElemWay.beginESR){
                            arrElemWaysIdOfNewWay.unshift(idOfElemWay);
                            currentWayESREndPoints.beginESR = endESRPointsOfElemWay.endESR;
                            currentWayNameEndPoints.beginName = getNameOfStationByID(currentWayESREndPoints.beginESR);
                            arrESRStationsOfNewWay.unshift(currentWayESREndPoints.beginESR);

                        }else if(currentWayESREndPoints.beginESR==endESRPointsOfElemWay.endESR){
                            arrElemWaysIdOfNewWay.unshift(idOfElemWay);
                            currentWayESREndPoints.beginESR = endESRPointsOfElemWay.beginESR;
                            currentWayNameEndPoints.beginName = getNameOfStationByID(currentWayESREndPoints.beginESR);
                            arrESRStationsOfNewWay.unshift(currentWayESREndPoints.beginESR);
                        }
                        arrWaysIdOfNewWayUserSequence.push(idOfElemWay);

                    }


                    // добавляем в кнопку навигации в футоре начальные и конечные станции
                    if(arrElemWaysIdOfNewWay.length!=0){

                        $("#helper1").css("display","none");
                        $("#divInfoNewPath").css("display","block");
                        $("#newPath").attr('value', arrElemWaysIdOfNewWay.join(", ")).css("display","block");
                        $("#FirsStation").text("Нач.ст: "+ currentWayNameEndPoints.beginName +" " +currentWayESREndPoints.beginESR).css("display","block");
                        $("#LastStation").text("Кон.ст: "+ currentWayNameEndPoints.endName +" "+ currentWayESREndPoints.endESR).css("display","block");
                        console.log(JSON.stringify(arrESRStationsOfNewPath));
                        /*
                         currentPathData.idDepo = currentDepo;
                         currentPathData.ESRBegStation = currentPathESREndPoints.beginESR;
                         currentPathData.ESREndStation = currentPathESREndPoints.endESR;
                         currentPathData.idWays = arrWaysIdOfNewPath;
                         */
                    }
                    else {
                        //удаляем все из полей заполнения
                        $("#helper1").css("display","block");
                        $("#divInfoNewPath").css("display","none");
                        $("#IdOfNewPath").css("display","none");
                        $("#FirsStation").css("display","none");
                        $("#LastStation").css("display","none");
                    }

                }
                else{
                    errorAlert("Вы не можете виділити " + idOfElemWay+ " так я у нього немає суміжних станцій")
                }

            }
            // функия для формирования нового плеча
            function createNewPathBySelection(target) {
                if (currentDepo == null) {
                    errorAlert("Ви не обрали депо");
                    return;
                }

                if (target.getAttribute('class') == 'selection2'){
                    errorAlert("Ви не можете обрати цю поездодільницу, так як вона включена у іньше депо");
                    return;
                }

                var arrOfElem= [];
                var idOfWay = target.getAttribute('idWay');
                var arrOfIncludedStations = [];
                for(var i =0; i<globWaysAndStations.ways.length; i++) {
                    if(globWaysAndStations.ways[i].idWay==idOfWay) {
                        arrOfElem.push(globWaysAndStations.ways[i].idElem);
                        arrOfIncludedStations.push({idFSt: globWaysAndStations.ways[i].idFSt, idLSt: globWaysAndStations.ways[i].idLSt})
                    }
                }
                //находим начальные и конечные станции текущего поездоучастка
                var endESRPointsOfWay = {beginESR: arrOfIncludedStations[0].idFSt, endESR: arrOfIncludedStations[arrOfIncludedStations.length-1].idLSt};
                arrOfIncludedStations.splice(0, arrOfIncludedStations.length);

                //проверка являеться ли текущий поездоучасток смежным с предыдущими
                if(arrWaysIdOfNewPath.length==0
                    ||
                    (arrWaysIdOfNewPath.length!=0 &&
                        (
                            endESRPointsOfWay.beginESR == currentPathESREndPoints.endESR ||
                            endESRPointsOfWay.endESR == currentPathESREndPoints.beginESR ||
                            endESRPointsOfWay.endESR == currentPathESREndPoints.endESR ||
                            endESRPointsOfWay.beginESR == currentPathESREndPoints.beginESR
                        )
                    )
                ){

                    //проверяем выделе ли уже данный элементарный участок
                    if (target.getAttribute('class') == 'selection') {

                        for(var i =0; i<arrOfElem.length; i++) {
                            document.getElementById(arrOfElem[i]).setAttribute('class', '');
                        }
                        //узнаем с какого конца будем производить удаление
                        if(idOfWay == arrWaysIdOfNewPath[0]){
                            arrWaysIdOfNewPath.shift();
                            arrESRStationsOfNewPath.shift();
                            currentPathESREndPoints.beginESR = arrESRStationsOfNewPath[0];
                            currentPathNameEndPoints.beginName = getNameOfStationByID(arrESRStationsOfNewPath[0]);
                        } else if(idOfWay == arrWaysIdOfNewPath[arrWaysIdOfNewPath.length-1]){
                            arrWaysIdOfNewPath.pop();
                            arrESRStationsOfNewPath.pop();
                            currentPathESREndPoints.endESR = arrESRStationsOfNewPath[arrESRStationsOfNewPath.length-1];
                            currentPathNameEndPoints.endName = getNameOfStationByID(arrESRStationsOfNewPath[arrESRStationsOfNewPath.length-1]);
                        }
                        // удаляем из массива для юзера
                        for(var j = 0; j<arrWaysIdOfNewPath.length; j++) {
                            if(arrWaysIdOfNewPathUserSequence[j]==idOfWay) {
                                arrWaysIdOfNewPathUserSequence.splice(j, 1);
                            }
                        }
                    }
                    else {
                        for(var i =0; i<arrOfElem.length; i++) {
                            document.getElementById(arrOfElem[i]).setAttribute('class', 'selection');
                        }
                        //узнаем как разположить новый путь


                        if(arrWaysIdOfNewPath.length==0){
                            arrWaysIdOfNewPath.push(idOfWay);
                            currentPathESREndPoints.beginESR = endESRPointsOfWay.beginESR;
                            currentPathESREndPoints.endESR = endESRPointsOfWay.endESR;
                            currentPathNameEndPoints.beginName = getNameOfStationByID(currentPathESREndPoints.beginESR);
                            currentPathNameEndPoints.endName = getNameOfStationByID(currentPathESREndPoints.endESR);
                            arrESRStationsOfNewPath.push(currentPathESREndPoints.beginESR);
                            arrESRStationsOfNewPath.push(currentPathESREndPoints.endESR);

                        } else if(currentPathESREndPoints.endESR==endESRPointsOfWay.endESR){
                            arrWaysIdOfNewPath.push(idOfWay);
                            currentPathESREndPoints.endESR = endESRPointsOfWay.beginESR;
                            currentPathNameEndPoints.endName = getNameOfStationByID(currentPathESREndPoints.endESR);
                            arrESRStationsOfNewPath.push(currentPathESREndPoints.endESR);

                        } else if(currentPathESREndPoints.endESR==endESRPointsOfWay.beginESR){
                            arrWaysIdOfNewPath.push(idOfWay);
                            currentPathESREndPoints.endESR = endESRPointsOfWay.endESR;
                            currentPathNameEndPoints.endName = getNameOfStationByID(currentPathESREndPoints.endESR);
                            arrESRStationsOfNewPath.push(currentPathESREndPoints.endESR);

                        }else if(currentPathESREndPoints.beginESR==endESRPointsOfWay.beginESR){
                            arrWaysIdOfNewPath.unshift(idOfWay);
                            currentPathESREndPoints.beginESR = endESRPointsOfWay.endESR;
                            currentPathNameEndPoints.beginName = getNameOfStationByID(currentPathESREndPoints.beginESR);
                            arrESRStationsOfNewPath.unshift(currentPathESREndPoints.beginESR);

                        }else if(currentPathESREndPoints.beginESR==endESRPointsOfWay.endESR){
                            arrWaysIdOfNewPath.unshift(idOfWay);
                            currentPathESREndPoints.beginESR = endESRPointsOfWay.beginESR;
                            currentPathNameEndPoints.beginName = getNameOfStationByID(currentPathESREndPoints.beginESR);
                            arrESRStationsOfNewPath.unshift(currentPathESREndPoints.beginESR);
                        }
                        arrWaysIdOfNewPathUserSequence.push(idOfWay);
                    }

                    $("#newPath").attr('value', arrWaysIdOfNewPath.join(", "));

                    // добавляем в кнопку навигации в футоре начальные и конечные станции
                    if(arrWaysIdOfNewPath.length!=0){

                        $("#FirsStation").text("Нач.ст: "+ currentPathNameEndPoints.beginName +" " +currentPathESREndPoints.beginESR).css("display","block");
                        $("#LastStation").text("Кон.ст: "+ currentPathNameEndPoints.endName +" "+ currentPathESREndPoints.endESR).css("display","block");
                        console.log(JSON.stringify(arrESRStationsOfNewPath));

                        currentPathData.idDepo = currentDepo;
                        currentPathData.ESRBegStation = currentPathESREndPoints.beginESR;
                        currentPathData.ESREndStation = currentPathESREndPoints.endESR;
                        currentPathData.idWays = arrWaysIdOfNewPath;
                    }
                    else {
                        //удаляем все из полей заполнения
                        $("#IdOfNewPath").css("display","none");
                        $("#FirsStation").css("display","none");
                        $("#LastStation").css("display","none");
                    }

                }
                else{
                    errorAlert("Вы не можете выделить поездоучасток " + idOfWay+ " так как у него нет смежных станций")
                }

                arrOfElem.splice(0, arrOfElem.length);
            }
            // функция для нахождения массива DOM елементов линий и усредненных координат принимает на вход массив из id путей
            function getArrayOfDomLinesForSelection(arrIDWays) {
                var counter=0;
                var xWay=0;
                var yWay=0;
                var arrDOMElemWays=[];
                for(var j =0 ; j<arrIDWays.length; j++) {
                    var idWay = arrIDWays[j];
                    for (var k = 0; k < globWaysAndStations.ways.length; k++) {
                        if (globWaysAndStations.ways[k].idWay == idWay) {
                            xWay += (globWaysAndStations.ways[k].x1 + globWaysAndStations.ways[k].x1) / 2;
                            yWay += (globWaysAndStations.ways[k].y1 + globWaysAndStations.ways[k].y1) / 2;
                            counter++;
                            var idElemWay = globWaysAndStations.ways[k].idElem;
                            arrDOMElemWays.push(document.getElementById(idElemWay))
                        }
                    }
                }
                if(counter==0){
                    return {arrOfDomElements: arrDOMElemWays, averageX:-1, averageY:-1}
                }
                xWay = xWay / counter;
                yWay = yWay / counter;
                return {arrOfDomElements: arrDOMElemWays, averageX:xWay, averageY:yWay}

            }
            // функция для мигания масива из дом елементов
            function blinking(arr) {
                var i = 1;
                var arrStyle = saveStyleOfDomElement(arr);
                var timerId = setInterval(function() {

                    if(i%2==1){
                        setStyleOfDomElements (arr, arrStyle.opositeStyle);
                    }
                    else {
                        setStyleOfDomElements (arr, arrStyle.style);
                    }

                    if (i == 26) {
                        clearInterval(timerId);
                    }
                    i++;
                }, 100);
            }
            // вспомогательная функция для " blinking"
            function saveStyleOfDomElement(arrDomElements) {
                var arrStyle = [];
                var arrOpositeStyle = [];
                for(var j =0; j<arrDomElements.length; j++){
                    var style = arrDomElements[j].getAttribute('class');
                    var opositeStyle = null;
                    arrStyle.push(style);
                    if(style == 'selection' || style == 'selection2'){
                        opositeStyle = null;
                    }
                    else {
                        opositeStyle = 'selection';
                    }
                    arrOpositeStyle.push(opositeStyle);
                }
                return {style: arrStyle, opositeStyle: arrOpositeStyle};
            }
            // вспомогательная функция для " blinking"
            function setStyleOfDomElements (arrDomElements, arrStyle) {
                for(var j =0; j<arrDomElements.length; j++){
                    arrDomElements[j].setAttribute('class', arrStyle[j]);
                }
            }
            // функция для отрисовки елементарных участков на карте
            function drowElemWays() {
                container.append("g").attr("id", "lines")
                    .selectAll("line")
                    .data(globWaysAndStations.ways)
                    .enter()
                    .append("line")
                    .attr("x1", function (d) {
                        return d.x1;
                    })
                    .attr("y1", function (d) {
                        return d.y1;
                    })
                    .attr("x2", function (d) {
                        return d.x2;
                    })
                    .attr("y2", function (d) {
                        return d.y2;
                    })
                    .attr("stroke-width", 2)
                    .attr("stroke", function (d) {
                        switch (d.idRoad) {
                            case 32:
                                return "#a430a9";
                            case 35:
                                return "#918a6e";
                            case 40:
                                return "#2f33ff";
                            case 43:
                                return "#ffb753";
                            case 45:
                                return "#32a933";
                            case 48:
                                return "#000000";
                            default:
                                return "#C0C0C0";
                        }
                    })
                    .attr("idFSt", function (d) {
                        return d.idFSt;
                    })
                    .attr("idLSt", function (d) {
                        return d.idLSt;
                    })
                    .attr("idWay", function (d) {
                        return d.idWay;
                    })
                    .attr("nameWay", function (d) {
                        return d.nameWay;
                    })
                    .attr("id", function (d) {
                        return d.idElem;
                    })
                    .on('mouseover', function (d) {

                        if((functionOfAplication.editPaths && currentDepo!=null) || typeOfDetalization.ways) {
                            var idOfWay = d.idWay;
                            for(var i =0; i<globWaysAndStations.ways.length; i++) {
                                if(globWaysAndStations.ways[i].idWay==idOfWay) {
                                    arrOfDomElemWaysHover.push(document.getElementById(globWaysAndStations.ways[i].idElem));
                                }
                            }
                            for(var j=0; j<arrOfDomElemWaysHover.length; j++){
                                arrOfDomElemWaysHover[j].setAttribute("stroke-width", 4);
                            }

                            var nameWay="";
                            for(var k=0; k<globWays.length; k++){
                                if(globWays[k].tid==idOfWay) {
                                    nameWay = globWays[k].name;
                                }
                            }
                            $("#IdWayToolTip").text(d.idWay);
                            $("#NameWayToolTip").text(nameWay);
                            $("#DirWayToolTip").text(d.departTid);

                            $("#tooltipDivWay").css({top: (d3.event.y+15)+"px", left: (d3.event.x+15)+"px", display: "block", zIndex: 9999});


                            return;
                        }
                        if(functionOfAplication.editWays || functionOfAplication.view){
                            document.getElementById(d.idElem).setAttribute("stroke-width", 4);

                            $("#IdElemWayToolTip").text(d.idElem);
                            $("#NameElemWayToolTip").text(d.nameWay);
                            $("#DirToolTip").text(d.departTid);
                            $("#ExtraInfoToolTip").text("Належить до поїзд.діл № " + d.idWay);

                            $("#tooltipDiv").css({top: (d3.event.y+15)+"px", left: (d3.event.x+15)+"px", display: "block", zIndex: 9999});
                            return;
                        }


                    })
                    .on('mouseout', function (d) {

                        if((functionOfAplication.editPaths && currentDepo!=null) || typeOfDetalization.ways) {
                            for (var j = 0; j < arrOfDomElemWaysHover.length; j++) {
                                arrOfDomElemWaysHover[j].setAttribute("stroke-width", 2);
                            }
                            arrOfDomElemWaysHover.splice(0, arrOfDomElemWaysHover.length);
                            $("#tooltipDivWay").css({display: "none"});
                            return;
                        }
                        if(functionOfAplication.editWays || functionOfAplication.view){
                            document.getElementById(d.idElem).setAttribute("stroke-width", 2);
                            $("#tooltipDiv").css({display: "none"});
                            return;
                        }
                    });
            }
            //функция для отрисовки станций на карте
            function drawStation() {
                container.append("g").attr("id", "dots")
                    .selectAll("circle")
                    .data(globWaysAndStations.stations)
                    .enter()
                    .append("circle")
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    })
                    .attr("r", 2)
                    .attr("id", function (d) {
                        return d.id;
                    })
                    .attr("title", function (d) {
                        return d.title;
                    })
                    .attr("stroke", function (d) {
                        switch (d.idRoad) {
                            case 32:
                                return "#a430a9";
                            case 35:
                                return "#918a6e";
                            case 40:
                                return "#2f33ff";
                            case 43:
                                return "#ffb753";
                            case 45:
                                return "#32a933";
                            case 48:
                                return "#000000";
                            default:
                                return "#C0C0C0";
                        }
                    })
                    .attr("fill", function (d) {
                        switch (d.idRoad) {
                            case 32:
                                return "#ff8de5";
                            case 35:
                                return "#e1daac";
                            case 40:
                                return "#85a6ff";
                            case 43:
                                return "#ffe5b8";
                            case 45:
                                return "#8cff9d";
                            case 48:
                                return "#959595";
                            default:
                                return "#f6f6f6";
                        }
                    })
                    .call(drag)
                    .on('mouseover', function (d) {

                        if(functionOfAplication.editWays || functionOfAplication.view){

                            $("#IdStationToolTip").text(d.id);
                            $("#NameStationToolTip").text(d.title);
                            $("#DirStationToolTip").text(d.departTid);

                            $("#tooltipDivStation").css({top: (d3.event.y+15)+"px", left: (d3.event.x+15)+"px", display: "block", zIndex: 9999});
                        }


                    })
                    .on('mouseout', function (d) {
                        if(functionOfAplication.editWays || functionOfAplication.view){
                            $("#tooltipDivStation").css({display: "none"});
                        }
                    });
            }
            //функция для отрисовки названий станций на карте
            function drowStationNames() {
                container.append("g").attr("id", "texts")
                    .selectAll("text")
                    .data(globWaysAndStations.stations)
                    .enter()
                    .append("text")
                    .text(function (d) {
                        return d.title;
                    })
                    .attr("x", function (d) {
                        return d.x + 2;
                    })
                    .attr("y", function (d) {
                        return d.y - 2;
                    })
                    .attr("id", function (d) {
                        return "t" + d.id;
                    });
            }

            /*
             Блок функций для работы с сервером (удаление, редактирование данных)
             */

            // функция загрузки первоночальных данных
            function loadData() {

                //звгружаем данные об администрации
                $.ajax({
                    type: "GET",
                    url: $my_WCF+'/admin_info.json',
                    dataType: "json",
                    success: function (result) {

                        for(var i =0; i<result.length; i++){

                            var adminInfoLength = adminInfo.length;
                            //console.log(result[i].kod_adm + " " + adminInfo[adminInfo.length-1].kod_adm);
                            if(result[i].kod_adm==adminInfo[adminInfoLength-1].kod_adm){

                                if(result[i].kod_dor==adminInfo[adminInfoLength-1].roads[adminInfo[adminInfoLength-1].roads.length-1].kod_dor){
                                    adminInfo[adminInfoLength-1].roads[adminInfo[adminInfoLength-1].roads.length-1].derects.push( {"kod_otd":result[i].kod_otd , "name_otd":result[i].name_otd })
                                }
                                else {
                                    adminInfo[adminInfoLength-1].roads.push(
                                        {
                                            "kod_dor":result[i].kod_dor,
                                            "name_dor":result[i].name_dor ,
                                            "derects":
                                                [
                                                    {"kod_otd":result[i].kod_otd , "name_otd":result[i].name_otd }
                                                ]
                                        });
                                }

                            }
                            else {
                                adminInfo.push( {
                                    "kod_adm": result[i].kod_adm,
                                    "name_admin": result[i].name_admin,
                                    "roads": [
                                        {
                                            "kod_dor":result[i].kod_dor,
                                            "name_dor":result[i].name_dor ,
                                            "derects": [{"kod_otd":result[i].kod_otd , "name_otd":result[i].name_otd}]
                                        }]
                                });
                            }
                        }

                        adminInfo.shift();
                        console.log(adminInfo);


                        $('#chooseAdmin').append('<a href="#" class="w3-bar-item w3-btn">Всі</a>');
                        for (var i=0; i<adminInfo.length; i++){
                            $('#chooseAdmin').append('<a href="#" class="w3-bar-item w3-btn">'+ adminInfo[i].name_admin + '</a>');
                        }



                    },
                    error: function (jqXHR, error, errorThrown) {
                        alert("Error");
                    }
                });

                $.ajax({
                    type: "GET",
                    url: $my_WCF+"/ways_and_stations.json",
                    dataType: "json",

                    success: function (waysAndStations) {

                        globWaysAndStations = waysAndStations;

                        //удаляем все из предыдушей загрузки
                        removeData();
                        //получаем данные о всех поиздоучастках
                        getGlobWays();
                        //создаем и заполняем таблицу для поездоучастков
                        reloadWaysTable();
                        //создаем и заполняем таблицу для станций
                        reloadStationsTable();
                        //создаем и заполняем таблицу для елементарных участков
                        reloadElemWaysTable();

                        // рисуем елементарные участки
                        drowElemWays();

                        // рисуем станции
                        drawStation();

                        // пишем название станций
                        drowStationNames();

                        massageAlert("Дані успішно завантажені, для навігації по карті використовуйте меню в правому верхньому куті <br>" +
                            "Для налаштування роботи необхідно використовувати меню в лівому верхньому куті");


                        globIdEndPointsOfWay.push(globWaysAndStations.ways[0].idFSt);
                        for(var j = 0; j<globWaysAndStations.ways.length-1; j++){
                            if(globWaysAndStations.ways[j+1].idWay != globWaysAndStations.ways[j].idWay){
                                if(existInArray(globIdEndPointsOfWay, globWaysAndStations.ways[j].idLSt) == false){
                                    globIdEndPointsOfWay.push(globWaysAndStations.ways[j].idLSt);
                                }
                                if(existInArray(globIdEndPointsOfWay, globWaysAndStations.ways[j+1].idFSt) == false){
                                    globIdEndPointsOfWay.push(globWaysAndStations.ways[j+1].idFSt);
                                }
                            }
                        }
                        if(existInArray(globIdEndPointsOfWay,globWaysAndStations.ways[globWaysAndStations.ways.length-1].idLSt)){
                            globIdEndPointsOfWay.push(globWaysAndStations.ways[globWaysAndStations.ways.length-1].idLSt);
                        }


                        addEditionalDiractionToStation();
                        $('#saveNewCordinates').css("display","none");
                        document.getElementById("showElemWaysOnMap").checked=true;
                        if(typeOfDetalization.ways) {detailingByWays()}
                    },

                    error: function (jqXHR, textStatus) {
                        errorAlert("Can't connect to the server " + textStatus );
                        $('#loadData').attr("disabled", false);
                        $('#confirmNewPath').attr("disabled", false);
                        $('#showWaysOnMap').attr("disabled", false);
                        $("#loadGif").css("display","none");
                    },


                    beforeSend: function () {
                        $('#loadData').attr("disabled", true);
                        $('#confirmNewPath').attr("disabled", true);
                        $('#showWaysOnMap').attr("disabled", true);
                        $("#loadGif").css("display","block");
                    },

                    complete: function () {
                        //enable the button
                        $('#loadData').attr("disabled", false);
                        $('#confirmNewPath').attr("disabled", false);
                        $('#showWaysOnMap').attr("disabled", false);
                        $("#loadGif").css("display","none");

                        //загрузка плечей
                        reloadAllPathes();

                        //Загрузка Depo
                        $.ajax({
                            type: "GET",
                            url: $my_WCF+"/depos.json",
                            dataType: "json",

                            success: function (Depos) {

                                globalDepos = Depos;

                                reloadDeposTable();
                            },

                            error: function (jqXHR, textStatus) {
                                errorAlert("Can't connect to the server " + textStatus );
                            },

                            complete: function () {
                            }

                        });
                    }

                });
            }
            // функция для удаления плеча из базы данных
            function deletePathFromDB() {
                errorAlert("Виделення плеча не можливо у дэмо режим");
                /*
                $.ajax({
                    url: "DeletePathFromDB",
                    type: "POST",
                    dataType: "json",
                    data: idDeletedPath,

                    success: function(restos) {
                        massageAlert("Плече "  + idDeletedPath +  " удалено");

                        //убираем выделения
                        var arrIDWays = [];
                        for (var i =0; i<globalPathes.length; i++){
                            if(globalPathes[i].idPath==idDeletedPath){
                                arrIDWays = globalPathes[i].idOFWays;
                                //удаляем запись из оперативной памети
                                globalPathes.splice(i, 1);
                                break;
                            }
                        }

                        var result = getArrayOfDomLinesForSelection(arrIDWays);
                        for(var j = 0; j<result.arrOfDomElements.length; j++){
                            result.arrOfDomElements[j].setAttribute('class', '');
                        }

                        //удаляю ячейку из таблици
                        DeletedTR.remove();
                        idDeletedPath = null;

                    },
                    error: function (jqXHR, textStatus) {
                        errorAlert("Can't connect to the server " + textStatus );
                    },

                    beforeSend: function () {
                        $('#loadData').attr("disabled", true);
                        $('#confirmNewPath').attr("disabled", true);
                        $('#saveNewCordinates').attr("disabled", true);
                    },

                    complete: function () {
                        $('#loadData').attr("disabled", false);
                        $('#confirmNewPath').attr("disabled", false);
                        $('#saveNewCordinates').attr("disabled", false);
                    }
                });
                */
            }
            //функция для удаления поездоучастка из базы данных
            function deleteWayFromDB() {
                errorAlert("Виделення поїздодільниці не можливо у дэмо режим");
            }
            // функция для добавления новых координат станции
            function updateCoordinates (){
                errorAlert("Зміна кординат не можлива у дэмо режимі");
                /*
                $.ajax({
                    url: "updateCoordinats",
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify(arrOfNewStationsCoordinate),
                    contentType: 'application/json',
                    //mimeType: 'application/json',

                    success: function(respons) {
                        //massageAlert(JSON.stringify(respons));
                        massageAlert("Новые кординаты станций успешно изменены");
                        arrOfNewStationsCoordinate.splice(0, arrOfNewStationsCoordinate.length);
                        $('#saveNewCordinates').css("display","none");
                    },
                    error: function (jqXHR, textStatus) {
                        errorAlert("Can't connect to the server " + textStatus );
                    },

                    beforeSend: function () {
                        $('#loadData').attr("disabled", true);
                        $('#confirmNewPath').attr("disabled", true);
                        $('#saveNewCordinates').attr("disabled", true);
                    },

                    complete: function () {
                        $('#loadData').attr("disabled", false);
                        $('#confirmNewPath').attr("disabled", false);
                        $('#saveNewCordinates').attr("disabled", false);
                    }
                });
                */
            }
            //функция отправляющая запрос на добавления нового плеча в базу данных
            function insertNewPathToDB (){
                errorAlert("Ви не маэте змоги записати нове плече у базу данних у демо режимі");
                cancelSelection();
                /*
                alert(JSON.stringify(currentPathData));

                $.ajax({
                    url:  $my_WCF+"/AddNewPathToDb",
                    type: "POST",
                    dataType: "jsonp",
                    data: {idDepo: currentPathData.idDepo,
                        ESRBegStation: currentPathData.ESRBegStation,
                        ESREndStation: currentPathData.ESREndStation,
                        idWays: JSON.stringify(currentPathData.idWays)},
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',

                    success: function(data) {
                        alert(data);
                        cancelSelection();
                        reloadAllPathes();
                    },
                    error: function (jqXHR, textStatus) {
                        errorAlert("Can't connect to the server " + textStatus );

                    },

                    beforeSend: function () {
                        $('#loadData').attr("disabled", true);
                        $('#confirmNewPath').attr("disabled", true);
                        $('#saveNewCordinates').attr("disabled", true);
                    },

                    complete: function () {
                        $('#loadData').attr("disabled", false);
                        $('#confirmNewPath').attr("disabled", false);
                        $('#saveNewCordinates').attr("disabled", false);
                    }

                });
                */
            }
            function insertNewWayToDB (){
                errorAlert("Ви не маэте змоги записати нову поъздодыльницю у базу данних у демо режимі");
                cancelSelection();
            }

            //функция для загрузки плечей
            function reloadAllPathes() {
                //загрузка плечей
                $.ajax({
                    type: "GET",
                    url: $my_WCF+"/pathes.json",
                    dataType: "json",

                    success: function (pathes) {
                        globalPathes = pathes;
                        reloadPathesTable();
                    },

                    error: function (jqXHR, textStatus) {
                        errorAlert("Can't connect to the server " + textStatus );
                    },

                    complete: function () {
                    }

                });
            }

            /*
             Блок функций общего назначения
             */

            //функции для вывода сообщения в модальных окнах
            function warningAlert(value){
                modalError.style.display = "none";
                modalMassage.style.display = "none";
                modalConfirmDeletionPath.style.display = "none";
                document.getElementById('warningMassage').innerHTML=value;
                modalWarning.style.display='block';
            }
            function errorAlert(value){
                modalWarning.style.display = "none";
                modalMassage.style.display = "none";
                modalConfirmDeletionPath.style.display = "none";
                document.getElementById('errorMassage').innerHTML=value;
                modalError.style.display='block';
            }
            function massageAlert(value){
                modalError.style.display = "none";
                modalWarning.style.display = "none";
                modalConfirmDeletionPath.style.display = "none";
                document.getElementById('NewMassage').innerHTML=value;
                modalMassage.style.display='block';
            }
            function confirmDeletionModal(value){
                modalError.style.display = "none";
                modalWarning.style.display = "none";
                modalMassage.style.display='none';
                document.getElementById('massageConfirm').innerHTML=value;
                modalConfirmDeletionPath.style.display='block';
            }
            //поиск имени станции по ID
            function getNameOfStationByID(idStation) {
                for(var i =0; i<globWaysAndStations.stations.length; i++){
                    if(idStation == globWaysAndStations.stations[i].id ){
                        return globWaysAndStations.stations[i].title;
                    }
                }
            }
            //функция для удаление данных при перезагрузке
            function removeData(){
                $("#lines").remove();
                $("#dots").remove();
                $("#texts").remove();
                $("#waysTable").remove();
                $("#stationTable").remove();

                arrWaysIdOfNewPath.splice(0, arrWaysIdOfNewPath.length);
                $("#currentDepo").attr('value', "");
                $("#newPath").attr('value', "");
                $("#IdOfNewPath").attr('value', "");
                $("#FirsStationName").attr('value', "");
                $("#FirsStationId").attr('value', "");
                $("#LastStationName").attr('value', "");
                $("#LastStationId").attr('value', "");
            }
            //функция для получение списка всех поездоучастков
            function getGlobWays(){

                globWays = [{name : globWaysAndStations.ways[0].nameWay ,
                    tid: globWaysAndStations.ways[0].idWay ,
                    admTid:  globWaysAndStations.ways[0].admTid,
                    idRoad: globWaysAndStations.ways[0].idRoad,
                    departTid:  globWaysAndStations.ways[0].departTid}];
                for(var i =1; i< globWaysAndStations.ways.length; i++){
                    if(globWays[globWays.length-1].tid != globWaysAndStations.ways[i].idWay){
                        /*console.log({name : globWaysAndStations.ways[i].nameWay,
                         tid: globWaysAndStations.ways[i].idWay,
                         admTid:  globWaysAndStations.ways[i].admTid,
                         idRoad: globWaysAndStations.ways[i].idRoad,
                         departTid:  globWaysAndStations.ways[i].departTid});*/
                        globWays.push({name : globWaysAndStations.ways[i].nameWay,
                            tid: globWaysAndStations.ways[i].idWay,
                            admTid:  globWaysAndStations.ways[i].admTid,
                            idRoad: globWaysAndStations.ways[i].idRoad,
                            departTid:  globWaysAndStations.ways[i].departTid})
                    }
                    else {
                        //склеиваем имена
                        var prevName = globWays[globWays.length-1].name;
                        var currentName = globWaysAndStations.ways[i].nameWay;
                        var newName = prevName.substring(0,prevName.indexOf('*')) + currentName.substring(currentName.indexOf('*'));
                        globWays[globWays.length-1].name = newName;
                    }
                }
                //console.log(globWays);
            }
            //функция на проверку сушествования елемента в массиве
            function existInArray(arr, value) {
                for(var i=0; i<arr.length; i++){
                    if(arr[i]==value) return true;
                }
                return false;
            }
            function existInArrOfExtraAdminInfo(arr, elem) {
                for(var i=0; i<arr.length; i++){
                    if(arr[i].adm==elem.adm &&
                        arr[i].road==elem.road &&
                        arr[i].depart==elem.depart){
                        return i;
                    }
                }
                return -1;
            }
            //функция добовления информацию о смежных станциях
            function addEditionalDiractionToStation(){
                for(var i=0; i<globWaysAndStations.stations.length; i++){
                    globWaysAndStations.stations[i].extraAdminInfo =
                        [{
                            adm: globWaysAndStations.stations[i].admTid ,
                            road: globWaysAndStations.stations[i].idRoad ,
                            depart: globWaysAndStations.stations[i].departTid
                        }];

                    for(var j=0; j<globWaysAndStations.ways.length; j++){
                        if( globWaysAndStations.stations[i].id == globWaysAndStations.ways[j].idFSt ||
                            globWaysAndStations.stations[i].id == globWaysAndStations.ways[j].idLSt){

                            var currentAdminInfo = {
                                adm: globWaysAndStations.ways[j].admTid ,
                                road: globWaysAndStations.ways[j].idRoad ,
                                depart: globWaysAndStations.ways[j].departTid
                            };

                            if( existInArrOfExtraAdminInfo(globWaysAndStations.stations[i].extraAdminInfo, currentAdminInfo)==-1){
                                globWaysAndStations.stations[i].extraAdminInfo.push(currentAdminInfo);
                            }

                        }
                    }

                }
                for(var k =0; k<globWaysAndStations.stations.length; k++){
                    if(globWaysAndStations.stations[k].id == "450201" || globWaysAndStations.stations[k].id == "462405" ){
                        console.log(globWaysAndStations.stations[k]);

                    }
                }
            }

            /*
             Блок вызова функций
             */
            switch(setting.mode) {
                case '1':
                    viewMode();
                    break;
                case '2':
                    editWaysMode();
                    break;
                case '3':
                    editPathMode();
                    break;
                default:
                    viewMode();
                    break;
            }
            loadData();

        });

    };
})( jQuery );