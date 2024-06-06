let gameseq = [];
let userseq = [];
let btn = ["btn1","btn2","btn3","btn4"];

let started = false;
let level = 0;
let h3 = document.querySelector('h3');

function btnflash(btn){
    btn.classList.add("flash");
    setTimeout(function(){
        btn.classList.remove("flash");
    },200);
}
function userflash(btn){
    btn.classList.add("flash");
    setTimeout(function(){
        btn.classList.remove("flash");
    },200);
}

function levelup(){
    userseq=[];
    level++;
    h3.innerText = `Level ${level}`;
    let randomIndx = Math.floor(Math.random()*3);
    let randomColor = btn[randomIndx];
    let randombtn = document.querySelector(`.${randomColor}`);
    btnflash(randombtn);
   // console.log(randomIndx);
   // console.log(randombtn);
    gameseq.push(randomColor);
}

document.addEventListener("keypress", function () {
    if (started === false) {
        console.log("game has started");
        started = true;
        levelup();
    }
});

function checkAns(idx){
    if(userseq[idx] === gameseq[idx]){
    if(userseq.length == gameseq.length){
        setTimeout(levelup ,1000);
        levelup();
    }
    }
    else{
        h3.innerText = `Game over!!! Your score was ${level} Press any key to start`;
        document.querySelector("body").style.backgroundColor = "red";
        setInterval(function(){
        document.querySelector("body").style.backgroundColor = "grey";
        },150);
        reset();
    }
}

function btnpress(){
    console.log("button was pressed");
    let clickbtn = this;
    btnflash(clickbtn);
    usercolor = clickbtn.getAttribute('id');
    userseq.push(usercolor);
    checkAns(userseq.length-1);
}

let allbtn = document.querySelectorAll('.btn');
for(let btn of allbtn){
    btn.addEventListener("click",btnpress);
}

function reset(){
    started = false;
    gameseq = [];
    userseq = [];
    level = 0;
}