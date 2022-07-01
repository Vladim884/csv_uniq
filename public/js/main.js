// window.addEventListener('load', function(){

    const iconBtn = document.getElementById('icon')
    const navMenu = document.getElementById('nav-menu')
    iconBtn.onclick = () => {
        navMenu.classList.toggle("vizibly")
    }



    
// для захвата всех элементов надо использовать  document.querySelectorAll
let li = document.querySelectorAll('.menu-links .nav-item')
for (let i = 0; i < li.length; i++) {
    if(window.location.href === li[i].children[0].href){
        console.log(li[i].children[0].href)
        li[i].children[0].classList.add('active');
    }
}

const enter_button = document.getElementById('enter')
// const logout_button = document.getElementById('logout')
const reg_button = document.getElementById('reg')

//form logout from account
const linkLogout = document.getElementById('logout')

//functiom try logging out, confirm: yes or no?
linkLogout.onclick = function (e) {
   if (!confirm('Вы уверены, что хотите выйти?')){
    e.preventDefault();
   }
}
// enter_button.classList.add("hidden")
// reg_button.classList.add("hidden")