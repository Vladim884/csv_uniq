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
        li[i].classList.add('active');
    }
}