// Code is tested in Google Apps Script

function test_getSmartSort()
{
  var data = 
  [
    ['Earth', 'Europe', 'Britain', 'London'],
    ['Earth', 'Europe', 'Britain', 'Manchester'],
    ['Earth', 'Europe', 'Britain', 'Liverpool'],
    ['Earth', 'Europe', 'France', 'Paris'],
    ['Earth', 'Europe', 'France', 'Lion'],
    ['Earth', 'Europe', 'Italy', 'Rome'],
    ['Earth', 'Europe', 'Italy', 'Milan'],
    ['Earth', 'Europe', 'Greece', 'Athenes'],
    ['Earth', 'Asia', 'China', 'Pekin'],
    ['Earth', 'Africa', 'Algeria', 'Algiers'],
    ['Earth', 'America', 'USA', 'Dallas'],
    ['Earth', 'America', 'USA', 'New York'],
    ['Earth', 'America', 'USA', 'Chicago'],
    ['Tatooine', 'Yulab', 'Putesh', 'ASU'],
    ['Tatooine', 'Yulab', 'Putesh', 'Niatirb'],
    ['Tatooine', 'Yulab', 'Zalip', 'Duantan'],
    ['Tatooine', 'Asia', 'Solo', 'Lion'],
    ['Tatooine', 'Asia', 'Solo', 'To'],
    ['Earth', 'America', 'USA', 'San Francisco'], 
    ['Tatooine', 'Yulab', 'Koko', 'Traiwau'],
    ['Venus', 'Yoo', 'Van', 'Derzar'],
    ['Tatooine', 'Chendoo', 'org', 'Eccel']
  ];


  var result = getSmartSort(data);
  
  Logger.log(result);

}


/*



  Idea: analize square data
    1. count number of columns
    2. assume left most columns has higher priority: data is structuted
    3. try to save original sorting: take first rows first
    4. return sorted by values data, but not alphabet sorting. Do position sorting: first things go first
    
    
  Imput
    data      = 2d Array like sheet data
    delimeter = some unique string that not matches any array value 
    
*/
function getSmartSort(data, delimeter)
{
  // num of columns, rows
  var l = data[0].length;
  var h = data.length
  
  // make scheme of data  
  var delimeter = delimeter || getDelimeter(data, [], 1);  // get delimeter for data
  var scheme = {};
  scheme[delimeter] = []; // use delimeter to exclude ambiguous values
    
  // loop rows and get sorted object
  var row = [];
  var value;
  var node = {};
  var nodeParent = {};
  var values = [];
  for (var i = 0; i < h; i++)
  {
    row = data[i]; 
    node = scheme;    
    for (var level = 0; level < l; level++)
    {
      value = row[level];
      if (!(value in node))
      {
        node[delimeter].push(value);
        node[value] = {}; // next level's node 
        node[value][delimeter] = [];
        if (level == 0) nodeParent = node;
        
      }
      node = node[value]; // next level
      scheme = nodeParent;    
    }    
  }
  

  var loopNext = true;
   
  var node = scheme; // to get lists
  var list = []; 
  var lists = {}; // to save lists
  
  var row = []; // row of resulting array
  var result = []; // resulting array
  
  level = 0;  
  
  while (loopNext)
  {
    // next level please
    level++;        
        
    // get and iterate list
    list = node[delimeter]; // [Earth, Tatooine]
    lists['' + level] = list;
    
    // populate row and result with some rules
    if (level < l) { row.push(list[0]); } // < levels  
    else
    {
      // we are inside a leaf
      pushValueToArrayInLoop(result, row, list); // previous level
      
      for (level = l - 1; level >=1; level--)
      {
        list = lists['' + level];
        row.pop(); // reduce row
        
        // reduce lists
        if (list.length > 1) 
        { 
          list.shift(); // delete the first element of list
          lists['' + level] = list;
          row.push(list[0]); // replaced last next value
          break; // exit loop
        } 
        else if (level === 1) { loopNext = false; } // checked all nodes    
      
      }    
    }
    
    // get next node
    node = getChildNode(scheme, row);
   
  }
  
  // getChildNode(scheme, ['Earth', 'Europe'])
  return result;



}

function test_pushValueToArrayInLoop()
{
  var array = [[0,0,0]];
  var row = [1, 2, 3];
  var add = [41, 42, 43, 44];
  pushValueToArrayInLoop(array, row, add);
  Logger.log(array);

}

/*
  array = [[0,0,0,0]];
  row = [1, 2, 3];
  add = [41, 42, 43, 44];
  
  array* = [[0.0, 0.0, 0.0], [1.0, 2.0, 3.0, 41.0], [1.0, 2.0, 3.0, 42.0], [1.0, 2.0, 3.0, 43.0], [1.0, 2.0, 3.0, 44.0]]

*/
function pushValueToArrayInLoop(array, row, add)
{  
  for (var i = 0, l = add.length; i < l; i++)
  {
    array.push(row.concat(add[i]));
  }      
  return 0;
}

function getChildNode(obj, keys)
{
  var node = obj;
  
  for (var i = 0, l = keys.length; i < l; i++) { node = node[keys[i]]; }
  return node;  
}



function test_getDelimeter()
{
  var delimeters = C_DELIMETERS; // ['→','>','=>', '->', '-->', '>>', '→→', '|', ' |'];
  var data = [['One', 'Two', 'Fri']];
  
  Logger.log(getDelimeter(data, C_DELIMETERS)); // → 
  
  data[0].push(delimeters[0]);
  
  Logger.log(getDelimeter(data, C_DELIMETERS)); // >
  
  // test recursive way
  data[0].push(delimeters.join(''));    
  Logger.log(getDelimeter(data, C_DELIMETERS)); // (1)
  
  
  // test recursive way 2
  data[0].push('(1)');
  data[0].push('(2)'); 
  Logger.log(getDelimeter(data, C_DELIMETERS)); // (3) 


}
/*
  USAGE:
    getDelimeter(data, delims)
    ...........................
    Do not include <indexOfTry>
  
  
  data
  [
    [boom, bam, 200, hoi],
    [goal, key, 150, way],
    [→→=>, (1), 0.0, goo]
  ]
  
  delims: ['>', '=>', '->', '>>', '|', ' |', '-->', '>>>']
  Put prefered delims in first place
  
  
  Output: -> 
  First symbol sequence from list that do not match any symbol sequence from data.
  
*/
function getDelimeter(data, delims, indexOfTry)
{

  var delimeters = JSON.parse(JSON.stringify(delims)); // make copy, not change origins
  var row = [];
  var val = '';
  var delim = '';
  if (indexOfTry >= 0)
  {   
    delimeters.push('(' + indexOfTry + ')'); // try this string 
    indexOfTry++;
  } 
  
  for (var i = 0, l = data.length; i < l; i++)
  {
    row = data[i];
    for (var j = 0, k = row.length; j < k; j++)
    {
      // loop delimeters
      val = row[j];
      for (var del = delimeters.length - 1; del >= 0; del--)
      {
        delim = delimeters[del]; 
        if (val.indexOf(delim) > -1) { delimeters.splice(del, 1); }        
      }     
    }  
  }
  if(delimeters && delimeters.length){   
   // not empty 
   return delimeters[0]; // return first found delimeter
  } else {
     // empty
     if (!indexOfTry) { indexOfTry = 1; }
     return getDelimeter(data, delimeters, indexOfTry); // go recursive
  }



}
