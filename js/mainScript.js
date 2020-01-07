	//variabli, ki jih rabiš v več ku 1 funkciji
	var username;
	var userID;
	var mysql = require('mysql');
	//spremeni glede na svoje nastavitve
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456789',
		database: 'storage'
	});
	//povezava
	connection.connect(function(err){
		if(document.getElementById("loginSite")!=null){
			if(err){ console.log(error.code);document.getElementById("connectionStatus").innerHTML = "Napaka v povezavi.";}
				else{
					document.getElementById("connectionStatus").innerHTML ="Povezava vzpostavljena.";
				}
		}else{
			getUserAndID();			
		}
	});
	//Preveri uporabnika in odpri mehanik/skladiscnik zaloga
	function checkUser(){
		var users;
		username = document.getElementById("user").value;
		var pass = document.getElementById("pass").value;
		var isSklad = null;
		var checked = false;
		//console.log(username+"|"+pass);
		var query = "SELECT USERNAME, PASSWORD, SKLADISCNIK, ID_USER from uporabnik WHERE USERNAME like '"+username+"'";
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				document.getElementById("connectionStatus").innerHTML ="Povezava vzpostavljena.";
				users = JSON.parse(JSON.stringify(results));
				console.log(results);
				if(results.length>0){
					if(users[0].USERNAME === username && users[0].PASSWORD === pass){
						checked = true;
						isSklad = users[0].SKLADISCNIK;
						sessionStorage.setItem('user', username);
						sessionStorage.setItem('userID',users[0].ID_USER);
					}
				}
				if(!checked){
					document.getElementById("connectionStatus").innerHTML = "Napačno uporabniškno ime ali geslo!";
				}else{
					if(isSklad == 1){
						const ipcRenderer = require('electron').ipcRenderer;
						ipcRenderer.send('changeWindow', 'skladiscnikZaloga.html')
					}else{
						const ipcRenderer = require('electron').ipcRenderer;
						ipcRenderer.send('changeWindow', 'mehanikZaloga.html')
					}
				}
			}
		});
	}
	
	function getUserAndID(){
		username = sessionStorage.getItem('user');
		userID = sessionStorage.getItem('userID');
	}
	
	function getZaloga(){
		var query = "select ID_ITEM, PARTNAME, PARTNUMBER, SUPPLY from shramba";
		var hits;
		var row;
		var cell;
		var table = document.getElementById("zalogca");
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				hits = JSON.parse(JSON.stringify(results));
				for(var i = 0; i<hits.length;i++){
					row = table.insertRow(0);
					cell = row.insertCell(0);
					cell.className += "sorting_1";
					cell.innerHTML = hits[i].PARTNAME;
					cell = row.insertCell(1);
					cell.innerHTML = hits[i].PARTNUMBER;
					cell = row.insertCell(2);
					cell.innerHTML = hits[i].SUPPLY;	
					cell = row.insertCell(3);
					cell.innerHTML = "<button onclick=\"prevzemZaloge(this);\" class=\"btn btn-outline-success\">PREVZEM</button>"
					cell = row.insertCell(4);
					cell.innerHTML = hits[i].ID_ITEM;
					cell.style.display = 'none';
				}
			}
		});
	}
		
	function prevzemZaloge(e){
		//preberi vrednosti iz vrste
		var partnumber,partname,supply,id;
		var table = document.getElementById('zalogca');
		var rowId = e.parentNode.parentNode.rowIndex;
		var rowSelected = table.getElementsByTagName('tr')[rowId-1];
		partname = rowSelected.cells[0].innerHTML;
		partnumber = rowSelected.cells[1].innerHTML;
		supply = rowSelected.cells[2].innerHTML;
		id = rowSelected.cells[4].innerHTML;
		console.log(partname+"|"+partnumber+"|"+supply+"|"+id);
	}
	
	function getNarocila(){
		getUserAndID();
		var query = "select i.ID_ORDER, PARTNAME, PARTNUMBER, ORDERED, ARRIVED, CANCELLED from narocilo i JOIN narocil u ON (u.ID_ORDER = i.ID_ORDER) JOIN uporabnik t ON (t.ID_USER = u.ID_USER) AND t.ID_USER = "+userID;
		console.log(query);
		var hits;
		var row;
		var cell;
		var table = document.getElementById("narocila");
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				hits = JSON.parse(JSON.stringify(results));
				for(var i = 0; i<hits.length;i++){
					row = table.insertRow(0);
					row.setAttribute("role", "row");
					if(i%2==0){
						row.className += "even";
					}else{
						row.className += "odd";
					}					
					cell = row.insertCell(0);
					cell.className += "sorting_1";
					cell.innerHTML = hits[i].PARTNUMBER;
					cell = row.insertCell(1);
					cell.innerHTML = hits[i].PARTNAME;
					var flagOrdered = hits[i].ORDERED;
					var flagArrived = hits[i].ARRIVED;
					var flagCancelled = hits[i].CANCELLED;
					if(flagOrdered == 1 && flagArrived == 0 && flagCancelled == 0){status = "Naročeno";}
					else if(flagOrdered == 0 && flagArrived == 1 && flagCancelled == 0){status = "Prispelo";}
					else if(flagCancelled == 1){status = "Preklicano";}
					cell = row.insertCell(2);
					cell.innerHTML = status;
					cell = row.insertCell(3);
					cell.innerHTML = "<button onclick=\"cancelOrder(this);\" class=\"btn btn-outline-danger\">PREKLIČI</button>"
					cell = row.insertCell(4);
					cell.innerHTML = hits[i].ID_ORDER;
					cell.style.display = 'none';
				}
			}
		});		
	}
	
	function cancelOrder(e){
		var partnumber,partname,statusOrder;
		var table = document.getElementById('narocila');
		var rowId = e.parentNode.parentNode.rowIndex;
		var rowSelected = table.getElementsByTagName('tr')[rowId-1];
		partname = rowSelected.cells[1].innerHTML;
		partnumber = rowSelected.cells[0].innerHTML;
		statusOrder = rowSelected.cells[2].innerHTML;
		orderID = rowSelected.cells[4].innerHTML;
		console.log(partname+"|"+partnumber+"|"+statusOrder+"|"+orderID);
		var query = "UPDATE narocilo SET ORDERED = 0, ARRIVED = 0, CANCELLED = 1 WHERE ID_ORDER = "+orderID;
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				console.log(results);
				clearTable("narocila");
				getNarocila();
			}
		});		
	}
	
	function clearTable(table){
		document.getElementById(table).innerHTML='';
	}
	
	function sendNarocilo(){
		var orderID;
		var partNumber = document.getElementById("stDela").value;
		var partName = document.getElementById("imeDela").value;
		console.log(partNumber+" | "+partName);
		var query = "INSERT INTO narocilo (PARTNUMBER,PARTNAME,ORDERED,ARRIVED,CANCELLED) VALUES('"+partNumber+"','"+partName+"',1,0,0)";
		console.log(query);
		var query2 = "SELECT ID_ORDER FROM narocilo ORDER BY ID_ORDER DESC LIMIT 1";		
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				connection.query(query2,function(err,results){
					if(err){console.log(err);}
					else{
						orderID = JSON.parse(JSON.stringify(results));
						orderID = orderID[0].ID_ORDER;
						
						var query3 = "INSERT INTO narocil (ID_ORDER, ID_USER) values ("+orderID+","+userID+")";
						connection.query(query3, function(err, results){
							if(err){console.log(err);}
							else{
								alert("Narocilo oddano");
							}
							
						});
					}
				});
			}
		});
	}
	
	
	
	