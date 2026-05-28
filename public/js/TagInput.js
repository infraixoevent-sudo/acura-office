$(document).on('keydown','#input-tag',function (event) {
    // Check if the key pressed is 'Enter' 
    tecla = event.keyCode;
    if (tecla === 13 || tecla === 32) {

        // Prevent the default action of the keypress 
        // event (submitting the form) 
        event.preventDefault();

        // Create a new list item element for the tag 
        const tag = document.createElement('li');

        // Get the trimmed value of the input element 
        const tagContent = $("#input-tag").val().trim();

        // If the trimmed value is not an empty string 
        if (tagContent !== '') {

            // Set the text content of the tag to  
            // the trimmed value 
            tag.innerText = tagContent;

            tag.setAttribute("data-value", tagContent)

            // Add a delete button to the tag 
            tag.innerHTML += '<button class="delete-button">X</button>';

            // Append the tag to the tags list 
            tags.appendChild(tag);

            // Clear the input element's value 
            $("#input-tag").val("");

            let keywordsInput = $('#keywords_hidden');
            let currentKeywords = keywordsInput.val();
            var element = document.getElementById('keywords_hidden');

            currentKeywords += '|' + tagContent;
            keywordsInput.val(currentKeywords);
            keywordsInput.trigger('change');
            
            element.dispatchEvent(new Event('change'));
        }
    }

    // Add an event listener for click on the tags list 

});
$(document).on('click', '#tags', function (event) {
    if (event.target.classList.contains('delete-button')) {

        // Remove the parent element (the tag) 
        let parentJq = $(event.target.parentNode);
        let text = parentJq.attr('data-value');

        let keywordsInput = $('#keywords_hidden');
        let currentKeywords = keywordsInput.val().toString(); //gato

        var element = document.getElementById('keywords_hidden');

        textToDelete = '|' + text; //|gato

        if (!currentKeywords.includes(textToDelete)) {
            textToDelete = text + '|'; //gato|

            if (!currentKeywords.includes(textToDelete)) {
                textToDelete = text; //gato
            }
        }
        
        currentKeywords = currentKeywords.replace(textToDelete, '');

        keywordsInput.val(currentKeywords);
        keywordsInput.trigger('change');
        element.dispatchEvent(new Event('change'));

        event.target.parentNode.remove();
    }
})


