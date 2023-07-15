const apiKey = 'AIzaSyD-m9X0pXMh_3yDnlKZxA0QS_F5Hi4QuSE';
const searchForm = document.getElementById('search-btn');
searchForm.addEventListener('click', handleSearch);

// FUNCTION TO HANDLE SEARCH FORM SUBMISSION
function handleSearch(event) {
	event.preventDefault();
	// Get the user's search query from the input field
	const searchInput = document.getElementById('search-input');
	const searchQuery = searchInput.value;
	// Make API request to search for books
	fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&key=${apiKey}`)
	.then(response => response.json())
	.then(data => {
		// Process the API response and update the DOM with search results
		displaySearchResults(data);
	})
	.catch(error => {
		// Handle any errors that occurred during the API request
		console.error('Error:', error);
	});
	// Reset the search input field
	searchInput.value = '';
}

//FUNCTION TO DISPLAY SEARCH RESULTS IN THE DOM
function displaySearchResults(data) {
	const resultsList = document.getElementById('results-list');
	const selectBook = document.getElementById('book-list');
	resultsList.innerHTML = '';
	selectBook.innerHTML = '<option value="option1" id="select" selected>Select a book</option>';

	// Iterate through the API response and generate HTML for each book
	data.items.forEach(book => {
		//-Get the last option value
		const lastOptionValue = selectBook.lastElementChild.value;
		//-extract the number from the last option value
		const lastOptionNumber = Number(lastOptionValue.replace('option', ''));
		//-Calculate the next option number
		const nextOptionNumber = lastOptionNumber + 1;
		const bookItem = document.createElement('li');
		const nextOption = document.createElement('option');
		nextOption.value = 'option' + nextOptionNumber;
		bookItem.textContent = book.volumeInfo.title;
		nextOption.textContent = book.volumeInfo.title;
		bookItem.setAttribute('id', book.id); // Set a data attribute for book ID
		nextOption.setAttribute('id', book.id);
		nextOption.setAttribute('value', nextOption.value);
		selectBook.addEventListener('change', handleBookSelection); // Add event listener for book selection
		resultsList.appendChild(bookItem);
		selectBook.appendChild(nextOption);
	});
}

//FUNCTION TO HANDLE BOOK SELECTION
function handleBookSelection(event) {
    const selectedOption = event.target.selectedOptions[0];
	const selectedBookId = selectedOption.id;
    fetch(`https://www.googleapis.com/books/v1/volumes/${selectedBookId}?key=${apiKey}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Response was not OK');
        }
        return response.json()
    })
    .then(data => {
        // process the Json data
        displayBookInfo(data);
	})
	.catch(error => {
		console.error('Error:', error);
	});
}

//FUNCTION TO DISPLAY BOOK DETAILS
function displayBookInfo(data) {
    const bookInfo = document.getElementById('book-info');
    bookInfo.innerHTML = '';  //Clear previous results

    //Access specific properties from the JSON response
    const items = data.volumeInfo;
      						// CLEAN description element: cleanedDescription for description
	const tempElement = document.createElement('div');
	tempElement.innerHTML = items.description;
    const cleanedDescription = tempElement.textContent || tempElement.innerText; //description
    const title = items.title;
    let image = '';
    if (items && items.imageLinks) {
        if  (items.imageLinks.thumbnail) {
            image = items.imageLinks.thumbnail;
        }
        else if  (items.imageLinks.smallThumbnail) {
            image = items.imageLinks.smallThumbnail;
        }
        else if  (items.imageLinks.medium) {
            image = items.imageLinks.medium;
        }
        else if  (items.imageLinks.small) {
            image = items.imageLinks.small;
        }
    }
    const authors = items.authors;

    //Create elements to display the data
    const titleElement = document.createElement('h2');
    titleElement.textContent = `${title}`;
    const imageElement = document.createElement('img');
    imageElement.src = image;
    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = `Description: ${cleanedDescription}`;
    const authorsElement = document.createElement('h3');
    authorsElement.textContent = `Authors: ${authors.join(', ')}`;
    
	//Append elements to the result div
    bookInfo.appendChild(titleElement);
    bookInfo.appendChild(imageElement);
    bookInfo.appendChild(descriptionElement);
    bookInfo.appendChild(authorsElement);
} 

// ADD EVENT LISTENERS TO THE BORROW AND RETURN BUTTONS
const borrowButton = document.getElementById('borrow-button');
const returnButton = document.getElementById('return-button');
borrowButton.addEventListener('click', handleBorrow);
returnButton.addEventListener('click', handleReturn);

// FUNCTION TO HANDLE BORROWING A BOOK
function handleBorrow(event) {
	// Retrieve the book information and selected option book ID from the DOM
	const selectElement = document.getElementById('book-list');
	const selectedOption = selectElement.options[selectElement.selectedIndex];
	const selectedOptionId = selectedOption.id;
	// Make the API request to borrow the book
	borrowBook(selectedOptionId);
}

// FUNCTION TO BORROWING A BOOK
function borrowBook(bookId) {
	// Make an API request to borrow the book
	fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}?key=${apiKey}`, {
		method: 'GET',
		headers: {
		'Content-Type': 'application/json',
		// Include any necessary authorization headers
		},
		// Include any necessary request body data
	})
		.then(response => response.json())
		.then(data => {
		// Update the user's library account on the client-side
		updateAccount(data);
		})
		.catch(error => {
		console.error('Error:', error);
		});
}

// FUNCTION TO UPDATE THE USER'S LIBRARY ACCOUNT
function updateAccount(data) {
    // Update the DOM to reflect the changes in the user's borrowed books
    const borrowedBooksList = document.getElementById('borrowed-books');
    if (borrowedBooksList) {
		const liElements = borrowedBooksList.querySelectorAll("li");
		var idExists = false;
		liElements.forEach(function(li) {
			const liId = li.getAttribute("id");
			if (liId === data.id) {
				idExists = true;
				return;
			}
		});
		if (!idExists) {
			const bookItem = document.createElement('li');
			bookItem.textContent = data.volumeInfo.title;
			bookItem.setAttribute('id', data.id);
			borrowedBooksList.appendChild(bookItem);
		}
	}
}

//FUNCTION TO HANDLE RETURNING A BOOK
function handleReturn() {
	const selectElement = document.getElementById('book-list');
	const selectedOption = selectElement.options[selectElement.selectedIndex];
	const selectedOptionId = selectedOption.id;
	returnBook(selectedOptionId);
}

// FUNCTION TO RETURN/REMOVE THE SELECTED A BOOK
function returnBook(bookId) {
    const ulElement = document.getElementById('borrowed-books');
	if (ulElement) {
		const liElement = ulElement.querySelectorAll("li");
		liElement.forEach(function(li) {
			const liId = li.getAttribute("id");
			if (liId === bookId) {
				li.remove();
			}
		});
	}
}
