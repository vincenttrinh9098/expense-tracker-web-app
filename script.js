
const increaseBtn = document.getElementById('increase');
const decreaseBtn = document.getElementById('decrease');
const resetBtn = document.getElementById('reset');
const digit = document.getElementById('counter');

let counter = 0;

increaseBtn.onclick = function(){
    counter++;
    digit.textContent=counter;
}
