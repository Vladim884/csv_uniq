// window.addEventListener('load', function(){

    const iconBtn = document.getElementById('icon')
    const navMenu = document.getElementById('nav-menu')
    



    // let lincsAr = navMenu.getElementsByTagName('li')
    // console.log(lincsAr)

    function liClickHandler(e) {
        this.classList.add("active");
      }
      //let li = document.querySelector('.li');   получает только первый элемент из массива, так то в данном случае не подходит

// для захвата всех элементов надо использовать  document.querySelectorAll

let li = document.querySelectorAll('.nav-item');

for (let i = 0; i < li.length; i++) { //далее прокручиваем в цикле 
  li[i].addEventListener("click", function() { // при клике 
    if (!this.classList.contains('active')) { // проверяем есть ли у элемента, на котором произошло событие, class "active"
      for (let i = 0; i < li.length; i++) {
        li[i].classList.remove("active"); // а тут удаляем тупо у всех
      }
      this.classList.add("active"); //если нет, добавляем
      console.log("this - ADD");
    } else {
      this.classList.remove("active"); // если есть, удаляем
      console.log("this - remove");
    }
  });
}


    iconBtn.onclick = () => {
        navMenu.classList.toggle("vizibly")
    }

    // const navMenu = document.getElementById('nav-menu')
    // console.log(
        // navMenu.childNodes[1].childNodes[0].classList.add("active")
// })