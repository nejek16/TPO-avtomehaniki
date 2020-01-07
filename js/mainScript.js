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
	//če iz neznanega razloga ni v username in userID podatkov kliči to da jih doda.
	function getUserAndID(){
		username = sessionStorage.getItem('user');
		userID = sessionStorage.getItem('userID');
	}
	//celotna zaloga mehanik KONČANO
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
	//zaloga skladiščnik KONČANO
	function getZalogaSklad(){
		clearTable("zalogca");
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
					cell.innerHTML = hits[i].ID_ITEM;
					cell = row.insertCell(4);
					cell.innerHTML = "<button onclick=\"updateZaloga()\" class=\"btn btn-outline-success\">DODAJ</button>"
					cell = row.insertCell(5);
					cell.innerHTML = "<button onclick=\"deleteZaloga()\" class=\"btn btn-outline-danger izbrisi\">IZBRIŠI</button>"
				}
			}
		});
	}
	
	function updateZaloga(){
		console.log("UPDATE");
	}
	
	function deleteZaloga(){
		if (confirm('Ali res želite izbrisati artikel')) {
			console.log("DELETE ITEM");
		} else {
			console.log("SKIP THIS SHIT");
		}
	}
	//zaloga skladiščnik, kjer je SUPPLY = 0   KONČANO
	function getEmptyItems(){
		clearTable("zalogca");
		var query = "select ID_ITEM, PARTNAME, PARTNUMBER, SUPPLY FROM shramba WHERE SUPPLY = 0";
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
					cell.innerHTML = hits[i].ID_ITEM;
					cell = row.insertCell(4);
					cell.innerHTML = "<button onclick=\"prevzemZaloge(this);\" class=\"btn btn-outline-success\">DODAJ</button>"
					cell = row.insertCell(5);
					cell.innerHTML = "<button class=\"btn btn-outline-danger izbrisi\">IZBRIŠI</button>"
				}
			}
		});
	}
	//poraba zaloge skladiščnik KONČANO
	function getPorabaZaloge(){
		var hits;
		var row;
		var cell;
		var table = document.getElementById("poraba");
		var query = "SELECT FULL_NAME, DATE, KOLICINA, PARTNAME FROM shramba s JOIN porabil p ON (s.ID_ITEM = p.ID_ITEM) JOIN uporabnik u  ON (p.ID_USER = u.ID_USER)"
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				hits = JSON.parse(JSON.stringify(results));
				for(var i = 0; i<hits.length;i++){
					row = table.insertRow(0);
					row.setAttribute("role","row");
					if(i%2==0){
						row.className += "even";
					}else{
						row.className += "odd";
					}
					cell = row.insertCell(0);
					cell.className += "sorting_1";
					cell.innerHTML = hits[i].FULL_NAME;
					cell = row.insertCell(1);
					cell.innerHTML = hits[i].PARTNAME;
					cell = row.insertCell(2);
					cell.innerHTML = hits[i].KOLICINA;
					cell = row.insertCell(3);
					var date;
					var temp = hits[i].DATE.toString().substr(0,10).split("-");
					console.log(temp);
					date = temp[2]+"."+temp[1]+"."+temp[0];
					cell.innerHTML = date;
					
				}				
			}
		});
	}
	
	
	//prevzem zaloge mehanik - TODO popup window, kjer si izbereš količino in insert v umesno tabelo "porabil" in update SUPPLY v shramba
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
	//narocila od določenega uporabnika KONČANO
	function getNarocila(){
		getUserAndID();
		var query = "select i.ID_ORDER, PARTNAME, PARTNUMBER, REQUESTED, ORDERED, ARRIVED, CANCELLED from narocilo i JOIN narocil u ON (u.ID_ORDER = i.ID_ORDER) JOIN uporabnik t ON (t.ID_USER = u.ID_USER) AND t.ID_USER = "+userID;
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
					var flagRequested = hits[i].REQUESTED;
					if(flagArrived == 1){statusOrder = "Prispelo";}
					else if(flagCancelled == 1){statusOrder = "Preklicano";}
					else if(flagOrdered == 1){statusOrder = "Naročeno";}
					else if(flagRequested == 1){statusOrder = "Zahtevano";}
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
	//prekliči naročilo KONČANO
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
		var query = "UPDATE narocilo SET REQUESTED = 0, ORDERED = 0, ARRIVED = 0, CANCELLED = 1 WHERE ID_ORDER = "+orderID;
		connection.query(query, function(err, results){
			if(err){console.log(err);}
			else{
				console.log(results);
				clearTable("narocila");
				getNarocila();
			}
		});		
	}
	// počisti tabelo za zamenjavo podatkov - arg - ID tabele (zalogca,narocila,...)
	function clearTable(table){
		document.getElementById(table).innerHTML='';
	}
	
	//vstavi novo naročilo in poveži naročilo z uporabnikom KONCANO
	function sendNarocilo(){
		var orderID;
		var partNumber = document.getElementById("stDela").value;
		var partName = document.getElementById("imeDela").value;
		console.log(partNumber+" | "+partName);
		var query = "INSERT INTO narocilo (PARTNUMBER,PARTNAME,REQUESTED,ORDERED,ARRIVED,CANCELLED) VALUES('"+partNumber+"','"+partName+"',1,0,0,0)";
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
	//pregled naročil VSA
	function getAllOrders(){
		clearTable("narocila");
		var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME, REQUESTED, ORDERED, ARRIVED, CANCELLED FROM narocilo";
		var row;
		var cell;
		var hits;
		var table = document.getElementById("narocila");
		document.getElementById("buttonPotrdi").style.display = 'none';
		connection.query(query, function(err, results){
			hits = JSON.parse(JSON.stringify(results));
			for(var i = 0; i<hits.length;i++){
				row = table.insertRow(0);
				cell = row.insertCell(0);
				cell.className += "sorting_1";
				cell.innerHTML = hits[i].PARTNUMBER;
				cell = row.insertCell(1);
				cell.innerHTML = hits[i].PARTNUMBER;
				var flagOrdered = hits[i].ORDERED;
				var flagArrived = hits[i].ARRIVED;
				var flagCancelled = hits[i].CANCELLED;
				var flagRequested = hits[i].REQUESTED;
				var statusOrder;
				if(flagArrived == 1){statusOrder = "Prispelo";}
				else if(flagCancelled == 1){statusOrder = "Preklicano";}
				else if(flagOrdered == 1){statusOrder = "Naročeno";}
				else if(flagRequested == 1){statusOrder = "Zahtevano";}
				cell = row.insertCell(2);
				cell.innerHTML = statusOrder;
				
			}
		});
	}
	//pregled naročil NOVA
	function getNewOrders(){
		clearTable("narocila");
		var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME FROM narocilo WHERE REQUESTED = 1";
		var row;
		var cell;
		var hits;
		var table = document.getElementById("narocila");
		document.getElementById("buttonPotrdi").style.display = 'visible';
		connection.query(query, function(err, results){
			hits = JSON.parse(JSON.stringify(results));
			for(var i = 0; i<hits.length;i++){
				row = table.insertRow(0);
				cell = row.insertCell(0);
				cell.className += "sorting_1";
				cell.innerHTML = hits[i].PARTNUMBER;
				cell = row.insertCell(1);
				cell.innerHTML = hits[i].PARTNUMBER;
				cell = row.insertCell(2);
				cell.innerHTML = "Zahtevano";
				cell = row.insertCell(3);
				cell.innerHTML = "<button onclick=\"onClickNarocila();\" class=\"btn btn-outline-danger\">POTRDI</button>"
				cell = row.insertCell(4);
				cell.innerHTML = hits[i].ID_ORDER;
				cell.style.display = 'none';
			}
		});		
	}
	//pregled naročil NAROČENA KONČANO
	function getOrderedOrders(){
		clearTable("narocila");
		var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME, REQUESTED, ORDERED, ARRIVED, CANCELLED FROM narocilo WHERE ORDERED= 1";
		var row;
		var cell;
		var hits;
		var table = document.getElementById("narocila");
		document.getElementById("buttonPotrdi").style.display = 'visible';
		connection.query(query, function(err, results){
			hits = JSON.parse(JSON.stringify(results));
			for(var i = 0; i<hits.length;i++){
				row = table.insertRow(0);
				cell = row.insertCell(0);
				cell.className += "sorting_1";
				cell.innerHTML = hits[i].PARTNUMBER;
				cell = row.insertCell(1);
				cell.innerHTML = hits[i].PARTNUMBER;
				cell = row.insertCell(2);
				cell.innerHTML = "Naročeno";
				cell = row.insertCell(3);
				cell.innerHTML = hits[i].ID_ORDER;
				cell.style.display = 'none';
			}
		});		
	}
	//pregled naročil PREKLICANA KONČANO
	function getCancelledOrders(){
		clearTable("narocila");
		var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME FROM narocilo WHERE CANCELLED = 1";
		var row;
		var cell;
		var hits;
		var table = document.getElementById("narocila");
		document.getElementById("buttonPotrdi").style.display = 'visible';
		connection.query(query, function(err, results){
			hits = JSON.parse(JSON.stringify(results));
			for(var i = 0; i<hits.length;i++){
				row = table.insertRow(0);
				cell = row.insertCell(0);
				cell.className += "sorting_1";
				cell.innerHTML = hits[i].PARTNUMBER;
				cell = row.insertCell(1);
				cell.innerHTML = hits[i].PARTNUMBER;				
				cell = row.insertCell(2);
				cell.innerHTML = "Preklicano";
				cell = row.insertCell(3);
				cell.innerHTML = "<button onclick=\"onClickNarocila();\" class=\"btn btn-outline-danger\">POTRDI</button>"
				cell = row.insertCell(4);
				cell.innerHTML = hits[i].ID_ORDER;
				cell.style.display = 'none';
			}
		});		
	}
	//pregled naročil PRISPELA KONČANO
	function getArrivedOrders(){
		clearTable("narocila");
		var query = "SELECT ID_ORDER, PARTNUMBER, PARTNAME FROM narocilo WHERE ARRIVED = 1";
		var row;
		var cell;
		var hits;
		var table = document.getElementById("narocila");
		document.getElementById("buttonPotrdi").style.display = 'visible';
		connection.query(query, function(err, results){
			hits = JSON.parse(JSON.stringify(results));
			for(var i = 0; i<hits.length;i++){
				row = table.insertRow(0);
				cell = row.insertCell(0);
				cell.className += "sorting_1";
				cell.innerHTML = hits[i].PARTNUMBER;
				cell = row.insertCell(1);
				cell.innerHTML = hits[i].PARTNUMBER;				
				cell = row.insertCell(2);
				cell.innerHTML = "Prispelo";
				cell = row.insertCell(3);
				cell.innerHTML = "<button onclick=\"onClickNarocila();\" class=\"btn btn-outline-danger\">POTRDI</button>"
				cell.style.display = 'none';
				cell = row.insertCell(4);
				cell.innerHTML = hits[i].ID_ORDER;
				cell.style.display = 'none';
			}
		});		
	}
	//preklopi med stanji naročil
	function onClickNarocila(){
		console.log("TODO");
	}
	//bazo sm mal popravu, da se v primeru deleta naročila izbriše tudi v tabeli narocil, in v primeru artikla, da se zbriše poraba... to bom probu nekako spelat, da ostane sam dvomim
	// dodal še 1 boolean za naročila k je manjkal
	//TODO še en gumb v skladiscnikNarocila za Naročena - getOrderedOrders
	//TODO v mehanik zalogi, ko pritisneš za prevzem - popup window, kjer vneseš željeno količino in vpis v porabil
	//TODO nekako spravit search da bo delal in tisto štetje kok itemov je v tabeli oziroma izbrisat vn v najslabšem primeru (cant be broken if it isnt there)
	//TODO pri skladiscniku še eno okno za pregled nad uporabniki, dodajanje uporabnikov, update in delete
	
	
	
	