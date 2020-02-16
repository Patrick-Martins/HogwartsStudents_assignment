window.addEventListener("DOMContentLoaded", init);

function init() {
  getStudents();
}

function getStudents() {
  fetch("students1991.json")
    .then(response => response.json())
    .then(analyseStudents);
}

function analyseStudents(students) {
  students.forEach(showStudents);
}

function showStudents(student) {
  const template = document.querySelector(".studentTemplate").content;
  const templateCopy = template.cloneNode(true);

  const studentTitle = templateCopy.querySelector(".studentName");
  const studentInfo = templateCopy.querySelector(".studentHouse");

  studentTitle.textContent = student.fullname;
  studentInfo.textContent = student.house;

  //add a data-house value for each tr
  const houseCurrentStudent = student.house;
  const studentContainer = templateCopy.querySelector("tr");

  //add eventlistener to each line of the table
  studentContainer.addEventListener("click", function() {
    //Show modal
    const modal = document.querySelector(".modalBG");
    modal.style.display = "block";

    //add background and text color for the modal depending on house
    //set a data-design attribute (in the .modal-container element) to the name of the students house
    const contentModal = document.querySelector(".modal_container");
    contentModal.setAttribute("data-design", student.house.toLowerCase());

    //Show content
    modal.querySelector(".modal_header .name").textContent = student.fullname;
    //Show the image with the name of the house in the path
    modal.querySelector(".modal_header .house_image").src = `houses_imgs/${student.house.toLowerCase()}.png`;
    //////////////////////////////

    modal.querySelector(".studentInfo").textContent = "Information about this student-----------------------------------------";

    //Add EventListener to close modal
    modal.addEventListener("click", function() {
      modal.style.display = "none";
    });
  });

  document.querySelector(".listOfStudents_table tbody").appendChild(templateCopy);
}
