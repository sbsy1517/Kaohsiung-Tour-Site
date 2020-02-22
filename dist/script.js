let data = []; //從opendata 撈回來的所有資料 
let displayData =  []; //將要顯示在網頁上的資料寫進這個空陣列
let pageNum = 1; //當前頁，設定初始為第一頁
let contentNum = 6; //每一個分頁的顯示數量為6個
let pageLen = 0; //頁碼的數量


// Dom
const distName = document.querySelector('.distName');
const selectDist = document.querySelector('#selectDist');
const distContent = document.querySelector('.distContent');
const pages = document.querySelector('.pages');
const exploreDistList = document.querySelector('.exploreDistList');
const goTopBtn = document.querySelector('.goTop')  


// ajax 抓資料
let xhr = new XMLHttpRequest();
xhr.open('get','https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97',true);
xhr.send(null);
xhr.onload = function(){
  let array = JSON.parse(xhr.responseText);
  
  //把每筆的records儲存到data陣列
  for( let i=0; i<array.result.records.length; i++){
    data.push(array.result.records[i]);
  };
  
  let dist = []; //高雄每個區的陣列
  
  //把data的地區塞到 dist陣列裡面
  for( let i=0; i<data.length; i++){
    dist.push(data[i].Zone);
  };
  
  //排除陣列的重複元素
  //filter(function( element(陣列元素的直), index(陣列元素的位置), array(已經過filter處理的陣列)))
  let result = dist.filter(function(element,index,array){
    
    //indexOf()方法會回傳給定元素於陣列中第一個被找到之索引，若不存在於陣列中則回傳 -1
    return array.indexOf(element)===index;
  });
  
  let str = ``; //載入行政區資料到select裡面
  const firstSelected = `<option disabled="disabled" selected="selected"> 請選擇行政區 </option>`;
  for(let i=0; i<result.length; i++ ){
   str += `<option value="${result[i]}">${result[i]}</option>` 
  }
  selectDist.innerHTML = firstSelected + str;
  
  //為213行的function randomDist，顯示隨機選取行政區
  randomDist(result); 
  
  //載入預設的全部的行政區內容
  showAllDist();
  
};

//監聽
selectDist.addEventListener('change', changeDistTitle, false); 
pages.addEventListener('click',switchPages,false);
exploreDistList.addEventListener('click',exploreDistLink,false);
goTopBtn.addEventListener('click',goToTop,false);


//------------------------

//顯示全部的行政區
function showAllDist(){
  displayData = data;
  displayDist(); //為94行的function displayDist
}

// 切換行政區的標題
function changeDistTitle(e){
  e.preventDefault();
  distName.textContent = e.target.value;
  let distData = []; //distData 為某個區內容的陣列
  
  // 從data裡取相同地區的值，存到distData
  for(let i=0; i<data.length; i++){
    if(e.target.value == data[i].Zone || e.target.textContent == data[i].Zone){
      distData.push(data[i]);
    };
    // console.log(distData);
  };
  displayData = distData; //此時顯示在網頁上的 displayData 陣列 = distData 區陣列
  pageNum = 1; // 頁碼為初始第一頁
  displayDist(); //顯示選擇的景點內容
};


//更新各區景點
function displayDist(){
  let str = ``;
  let start = pageNum * contentNum; //設定start值為 = 頁碼 * 每頁顯示的數量(6個)
  let displayDataLen = displayData.length; //要顯示出來資料的length
  calPagesNum(displayDataLen); //頁數 第146行的function calPagesNum
  
  //如果長度大於start值，會以start值作為迴圈停止條件
  if(displayDataLen>start){
    displayDataLen=start; //假設displayDataLen(8)>start((6)=1(第一頁)*6(個)，就設定displayDataLen = start(6)
  }else{
    displayDataLen = displayData.length //如果displayDataLen長度沒有大於start值,則以displayDataLen長度為主
  };
  
  
  for(let i = start-contentNum; i<displayDataLen;i++){
  //解釋^^^^
  //以start值 - 每頁顯是數量座位為開始條件
  //1.假如displayDataLen(8)，根據上面的迴圈條件，在第一頁時會讓displayDataLen=6
  //帶入for迴圈，(let i = 0(6-6)，i<6; i++) >> i = 0~5
  //2.再來如果是第二頁時，start值是12(2*6)，此時根據迴圈條件displayDataLen=8
  //帶入for迴圈，(let i = 6(12-6)，i<8; i++) >> i = 6~8
    
    str += `<div class="distCard">
          <div class="distHeader" style="background-image: url(${displayData[i].Picture1});">
            <h3>${displayData[i].Name}</h3>
            <p>${displayData[i].Zone}</p>
          </div>
          <div class="distIntro">
            <div class="time">
              <h3 class="fas fa-clock"></h3>
              <p>${displayData[i].Opentime}</p>
            </div>
            <div class="address">
              <h3 class="fas fa-map"></h3>
              <p>${displayData[i].Add}</p>
            </div>
            <div class="tel ">
              <h3 class="fas fa-phone-alt"></h3>
              <p>${displayData[i].Tel}</p>
            </div>
            <div class="ticket">
              <h3 class="fas fa-ticket-alt"></h3>
              <p>${displayData[i].Ticketinfo}</p>
            </div>
          </div>
        </div>`
  }
  distContent.innerHTML = str;
};


//計算頁數
function calPagesNum(num){
  
  //num會被帶入distDataLen
  if(num>contentNum){ //假設distDataLen大於6
    pageLen = Math.ceil(num / contentNum); // Math.ceil為無條件進入，取大於這個數的最小整數
    const prev = `<li class="prev"> <a class="fas fa-chevron-left" href="#"></a></li>`;
    const next = `<li class="next"> <a class="fas fa-chevron-right" href="#"></a></li>`;
    let str = ``;
    for(let i=1 ; i<= pageLen ; i++){ //此時把pageLen帶入迴圈，從1開始
      if(i==pageNum){ //當i == 當前頁時，會增加class="active"
        str += `<li class="pageNum"> <a class="active" href="#">${i}</a></li>`
      } else { 
        str += `<li class="pageNum"> <a href="#">${i}</a></li>`
      }
    }
    pages.innerHTML = prev+str+next;
  } else {
    str = `<li class="pageNum"> <a class="active" href="#">1</a></li>`;
    pages.innerHTML = str;
  }
};


//切換頁面
function switchPages(e){
  e.preventDefault();
  
  if(e.target.nodeName !== "A"){
    return;
  };
  
  //設定按頁碼及前後按紐時的反應
  if(e.target.className == "fas fa-chevron-right"){//假設點選的右鍵按鈕
  
    if(pageNum == pageLen){ //當頁碼 = 總共的頁碼 (ex: 總共6頁，當前頁已經第六頁了)
      pageNum = pageLen; //則再怎麼點頁碼都不會變
    } else {
      pageNum++; //當頁碼<總共的頁碼，則會每點一次右鍵，頁碼+1
    };
    
  } else if(e.target.className == "fas fa-chevron-left"){ //同理，點選左鍵
    if(pageNum ==1){ //頁碼為1，不可能再減1
      pageNum = 1; //那不管怎麼點，頁碼永遠為1
    } else {
      pageNum--; //這樣當頁碼不為1時，則會每點一次左鍵，頁碼-1
    };
    
  } else { //點選數字鍵時
    pageNum = parseInt(e.target.textContent); //則設定pageNum會等於.textContent
  };
  
  displayDist(); //此時更新景點區域，因為新的pageNum值會被帶入
};



//'探索一下'行政區
function exploreDistLink(e){//點擊'探索一下'行政區，出現內容
  e.preventDefault();
  if(e.target.nodeName !== "A"){
    return;
  }
  changeDistTitle(e);
  distName.textContent = e.target.textContent;
};

//隨機跑行政區
function randomDist(result){
  let randomArray = [];
  let max = result.length; //最大值為result.length
  let min = 0;
  const exploreDistLen = 4; 
  
  //for迴圈先跑出隨機數
  for(let i = 0 ; i< exploreDistLen; i++){ 
    let randomNum = getRandom(min,max);//在252行的function getRandom 取的隨機數
    randomArray.push(randomNum);//把得到的隨機數放入randomArray陣列
    
    //但此時的randomArray隨機數有可能重複，所以要把重複的數字刪掉
    for(var j = 0; j<i; j++){ //這裡就設定j值，且j<i
      console.log(randomArray,'第'+i+'項',randomArray[i],'第'+j+'項:',randomArray[j]);
      
      if (randomArray[i] == randomArray[j]){ //1.假設當最新的數值(第i個)與先前的數值重複了
        console.log('重複',j);
    
        randomArray.splice(j,1); //2.就把舊的數值(randomArray[j])給剃除掉，留下新的(randomArray[i])就好，那有重複的陣列，就會只剩下3個行政區
        console.log(randomNum,randomNum - 1); 
        
        randomArray.push(randomNum-1);//3.所以在這裡把最新的值另外減1，而得到新的值，並從新加入randomArray
        console.log(randomArray);
      };
    };
  };
  
  //接下來就是把得到的隨機數帶入result[i]
  let str =  ``;
  for (let i = 0; i < randomArray.length; i++){
    str += `<li> 
              <a>${result[randomArray[i]]}</a>
            </li>`
  };
  exploreDistList.innerHTML = str;
};


//隨機數程式
function getRandom(min,max){
  return Math.floor(Math.random()*(max-min)) + min;//。這個隨機整數值不小於min（如果min不是整數，則不小於min的向上取整數），且小於（不等於）max。
  //Math.floor()函式會回傳無條件捨去後的最大整數
  //Math.random()一個浮點型偽隨機數字，在0（包括0）和1（不包括）之間
  //而如果Math.random()*i(數值)，則隨機值則會從0（包括0）和 i（不包括）之間取得
};


//回到頂端
window.onscroll = function(){//window.onsroll為當前頁面的頁面滾動事件添加事件處理函數
  if(document.documentElement.scrollTop > 800){//偵測scroll的位置，超過800顯示按鈕
    goTopBtn.style.display = 'block';
  } else {
    goTopBtn.style.display = 'none';
  }
};


function goToTop(e){//當點擊按鈕時，頁面回到最上頁
  e.preventDefault();
  document.documentElement.scrollTop = 0;
};