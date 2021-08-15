
            function searchDTable(){
                var input, filter, table, tr, td, i, found;
                input = document.getElementById("searchDInput");
                filter = input.value.toUpperCase();
                table = document.getElementById("deptTable");
                tr = table.getElementsByTagName("tr");
  
                for (i = 1; i < tr.length; i++) {
                  found = false;    
                  td = tr[i].getElementsByTagName("td");
                  for(var j=0; j<td.length-2; j++){  
                    if (td[j].innerText.toUpperCase().indexOf(filter) > -1){
                      found = true;
                    }
                  }
                  if (found){
                    tr[i].style.display = "";
                  }
                  else{
                    tr[i].style.display = "none";
                  }
                }
            }