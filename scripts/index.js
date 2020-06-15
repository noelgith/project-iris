const guideList = document.querySelector('.guides');

// const OutLinks1 = document.querySelector('.logged-out1');//login
// const OutLinks2 = document.querySelector('.logged-out2');//signup
// const InLinks1 = document.querySelector('.logged-in1');//account
// const InLinks2 = document.querySelector('.logged-in2');//logout
// const InLinks3 = document.querySelector('.logged-in3');//create guide
const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('.account-details');
const adminItems = document.querySelectorAll('.admin');
const setupUi = (user) => {
  if (user) {
    if(user.admin) {
      adminItems.forEach(item => item.style.display = 'block');
    }
    db.collection('users').doc(user.uid).get().then(doc => {
      const html = `
      <div>Logged in as ${user.email}</div>
      <div>${doc.data().bio}</div>
      <div>${user.admin ? 'Admin' : ''}</div>
    `;
    accountDetails.innerHTML = html;
    
    });
    
    
    // Array.prototype.forEach.call(loggedInLinks.children,item => item.style.display = 'block');
    // Array.prototype.forEach.call(loggedOutLinks.children,item => item.style.display = 'none');
    // console.log(loggedInLinks);
    // console.log(loggedOutLinks)
    // OutLinks1.style.display = 'none';
    // OutLinks2.style.display = 'none';
    // InLinks1.style.display = 'block';
    // InLinks2.style.display = 'block';
    // InLinks3.style.display = 'block';
    // loggedInLinks.forEach(item => item.style.display = 'block');
    // loggedOutLinks.forEach(item => item.style.display = 'none');
    loggedInLinks.forEach(item => item.style.display = 'block');
    loggedOutLinks.forEach(item => item.style.display = 'none');

  } else {
    adminItems.forEach(item => item.style.display = 'none');
    accountDetails.innerHTML = '';
    //toggle ui elements

    // OutLinks1.style.display = 'block';
    // OutLinks2.style.display = 'block';
    // InLinks1.style.display = 'none';
    // InLinks2.style.display = 'none';
    // InLinks3.style.display = 'none';
    loggedInLinks.forEach(item => item.style.display = 'none');
    loggedOutLinks.forEach(item => item.style.display = 'block');
  }
}
//setup guides

const setupGuides = (data, user) => {
  
  if (data.length) {
    let html = '';
    data .forEach(doc => {
    const guide = doc.data();
    console.log(guide);
    const li = `
      <li>
        <div class="collapsible-header" grey lighten-4>${guide.title}</div>
        <div class="collapsible-body" white>${guide.content}</div>
        <div class="collapsible-body" white>${new Date(guide.date).toDateString()}</div>
      </li>
    `;
    html += li
  });

  guideList.innerHTML = html
} else if(user) {
    guideList.innerHTML = '<h5 class="center-align">Add a new patient</h5>'
  }
  else {
    guideList.innerHTML = '<h5 class="center-align">Welcome to IRIS.</h5>'
  }

}



// setup materialize components
document.addEventListener('DOMContentLoaded', function() {

    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);
  
    var items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);
  
  });