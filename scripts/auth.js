// add admin cloud function

const adminForm = document.querySelector('.admin-actions');
adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const adminEmail = document.querySelector('#admin-email').value;
    const addAdminRole = functions.httpsCallable('addAdminRole');
    addAdminRole({ email: adminEmail }).then(result => {
        console.log(result);
    })
})

//listen for auth status changes
auth.onAuthStateChanged(user => {

    if (user) {
        user.getIdTokenResult().then(idTokenResults => {
            user.admin = idTokenResults.claims.admin;
            setupUi(user);
        })
        //data db
        //console.log(user)
        db.collection('guides').onSnapshot(snapshot => {
            setupGuides(snapshot.docs, user);
        }, err => {
            console.log(err.message)
        });
    } else {
        setupUi();
        setupGuides([]);
    }
});

const createForm = document.querySelector('#create-form');
createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    var timestamp = Date.now();
    db.collection('guides').add({
        title: createForm['title'].value,
        content: createForm['content'].value,
        date: timestamp,
        imgUrl: 'imageUrl',
        hasDr: 'waiting for results'
    }).then(async () => {
        const ref = await db.collection('guides').where('content', '==', createForm['content'].value).get();
        uploadImage(ref.docs[0].id);

        //close the model and reset the form
        const modal = document.querySelector('#modal-create');
        M.Modal.getInstance(modal).close();
        createForm.reset();
    }).catch(err => {
        console.log(err.message)
    })
})

//sign up
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //get user info
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;

    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        return db.collection('users').doc(cred.user.uid).set({
            bio: signupForm['signup-bio'].value
        });
    }).then(() => {
        const modal = document.querySelector('#modal-signup');
        M.Modal.getInstance(modal).close();
        signupForm.reset();
        signupForm.querySelector('.error').innerHTML = '';
    }).catch(err => {
        signupForm.querySelector('.error').innerHTML = err.message;
    });


});

const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut()
})

const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    auth.signInWithEmailAndPassword(email, password).then(cred => {
        console.log(cred.user)
        const modal = document.querySelector('#modal-login');
        M.Modal.getInstance(modal).close();
        loginForm.reset();
        loginForm.querySelector('.error').innerHTML = err.message;
    }).catch(err => {
        loginForm.querySelector('.error').innerHTML = err.message;
    })
})

// var imageLink = '';

// Ffunction to upload images
const uploadImage = (docId) => {
    var file = document.getElementById("file").files[0]; //acess image
    console.log(file.name)
    // Create the file metadata
    var metadata = {
        contentType: 'image/jpeg'
    };

    // Upload file and metadata to the object 'images/mountains.jpg'
    var uploadTask = defaultStorage.child('images/' + file.name).put(file, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function (snapshot) {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                    break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.log('Upload is running');
                    break;
            }
        }, function (error) {

            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
                case 'storage/unauthorized':
                    // User doesn't have permission to access the object
                    break;

                case 'storage/canceled':
                    // User canceled the upload
                    break;

                case 'storage/unknown':
                    // Unknown error occurred, inspect error.serverResponse
                    break;
            }
        }, function () {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                console.log('File available at', downloadURL);
                
                //insert the url to firestore.
                db.collection("guides").doc(docId).set({
                    imgUrl: downloadURL.toString()
                },
                    { merge: true }
                )

                sendApiRequests(downloadURL, docId)
                console.log("done updating...")



            });
        });
};

function sendApiRequests(url, docId) {
    $.ajax({
        url: "http://localhost:4000/api/", //url requests
        type: "POST", //get - simply request : post - give and take
        contentType: "application/json",
        data: JSON.stringify({ "imgurl": url }) //key value pair
    }).done(function (data) {
        console.log(data);
        db.collection("guides").doc(docId).set({
            hasDr: data.toString()
        },
            { merge: true }
        )
    });
}

